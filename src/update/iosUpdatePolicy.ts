export type IosUpdatePolicy = {
  enabled: boolean;
  latestVersion: string;
  minimumSupportedVersion: string;
  forceUpdateEnabled: boolean;
  optionalUpdateEnabled: boolean;
  storeUrl: string;
  title: string;
  message: string;
};

export type PolicyParseResult =
  | { ok: true; policy: IosUpdatePolicy }
  | { ok: false; reason: string };

export type UpdateKind = 'none' | 'force' | 'optional';

export type UpdateDecision = {
  kind: UpdateKind;
  policy: IosUpdatePolicy | null;
  reason?: string;
};

export type ConfigValueSource = 'remote' | 'default' | 'static';

export type ResolvedPolicy = {
  policy: IosUpdatePolicy | null;
  persistPolicy: IosUpdatePolicy | null;
  reason: string;
};

export const SAFE_DEFAULT_POLICY: IosUpdatePolicy = {
  enabled: false,
  latestVersion: '0.0.0',
  minimumSupportedVersion: '0.0.0',
  forceUpdateEnabled: false,
  optionalUpdateEnabled: false,
  storeUrl: '',
  title: '',
  message: '',
};

// Store releases use major.minor.patch, without prerelease or build suffixes.
export function parseAppVersion(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const version = value.trim();
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    return null;
  }
  if (!version.split('.').every((part) => Number.isSafeInteger(Number(part)))) {
    return null;
  }
  return version;
}

export function compareAppVersions(left: string, right: string): -1 | 0 | 1 | null {
  const a = parseAppVersion(left)?.split('.').map(Number);
  const b = parseAppVersion(right)?.split('.').map(Number);
  if (!a || !b) return null;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] < b[index]) return -1;
    if (a[index] > b[index]) return 1;
  }
  return 0;
}

export function isValidStoreUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'itms-apps:' || parsed.protocol === 'itms-beta:';
  } catch {
    return false;
  }
}

export function parseIosUpdatePolicy(raw: string): PolicyParseResult {
  if (raw.trim() === '') {
    return { ok: false, reason: 'invalid_json' };
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }

  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, reason: 'invalid_json' };
  }

  const record = data as Record<string, unknown>;
  // A published kill switch must also work without the rest of the policy.
  if (record.enabled === false) {
    return { ok: true, policy: { ...SAFE_DEFAULT_POLICY } };
  }

  const booleanFields = ['enabled', 'forceUpdateEnabled', 'optionalUpdateEnabled'] as const;
  const optionalStringFields = ['title', 'message'] as const;

  for (const field of booleanFields) {
    if (typeof record[field] !== 'boolean') {
      return { ok: false, reason: 'invalid_json' };
    }
  }

  if (typeof record.storeUrl !== 'string') {
    return { ok: false, reason: 'invalid_json' };
  }

  for (const field of optionalStringFields) {
    if (record[field] !== undefined && typeof record[field] !== 'string') {
      return { ok: false, reason: 'invalid_json' };
    }
  }

  const latestVersion = parseAppVersion(record.latestVersion);
  const minimumSupportedVersion = parseAppVersion(record.minimumSupportedVersion);
  if (latestVersion == null || minimumSupportedVersion == null) {
    return { ok: false, reason: 'invalid_version' };
  }

  if (compareAppVersions(minimumSupportedVersion, latestVersion) === 1) {
    return { ok: false, reason: 'min_gt_latest' };
  }

  return {
    ok: true,
    policy: {
      enabled: record.enabled as boolean,
      latestVersion,
      minimumSupportedVersion,
      forceUpdateEnabled: record.forceUpdateEnabled as boolean,
      optionalUpdateEnabled: record.optionalUpdateEnabled as boolean,
      storeUrl: record.storeUrl as string,
      title: (record.title as string | undefined) ?? '',
      message: (record.message as string | undefined) ?? '',
    },
  };
}

export function resolvePolicyFromSources(params: {
  activatedRaw: string | null;
  activatedSource?: ConfigValueSource | null;
  lastValid: IosUpdatePolicy | null;
  fetchFailed: boolean;
}): ResolvedPolicy {
  if (params.fetchFailed) {
    return {
      policy: params.lastValid,
      persistPolicy: null,
      reason: params.lastValid ? 'fetch_failed_kept_last_valid' : 'fetch_failed_no_last_valid',
    };
  }

  const parsed = parseIosUpdatePolicy(params.activatedRaw ?? '');

  if (parsed.ok) {
    const persistPolicy = params.activatedSource === 'remote' ? parsed.policy : null;
    return {
      policy: parsed.policy,
      persistPolicy,
      reason: persistPolicy ? 'activated_valid' : 'activated_default_not_persisted',
    };
  }

  if (params.lastValid) {
    return {
      policy: params.lastValid,
      persistPolicy: null,
      reason: 'invalid_json_kept_last_valid',
    };
  }

  return {
    policy: null,
    persistPolicy: null,
    reason: parsed.reason,
  };
}

export function evaluateIosUpdate(
  policy: IosUpdatePolicy,
  currentVersion: string,
  storeUrlOk: boolean,
): UpdateDecision {
  if (!policy.enabled) {
    return { kind: 'none', policy, reason: 'disabled' };
  }

  if (parseAppVersion(currentVersion) == null) {
    return { kind: 'none', policy, reason: 'unreadable_native_version' };
  }

  const minimumComparison = compareAppVersions(currentVersion, policy.minimumSupportedVersion);
  const latestComparison = compareAppVersions(currentVersion, policy.latestVersion);
  if (minimumComparison == null || latestComparison == null) {
    return { kind: 'none', policy, reason: 'invalid_version' };
  }

  if (policy.forceUpdateEnabled && minimumComparison === -1) {
    if (!storeUrlOk) {
      return {
        kind: 'none',
        policy,
        reason: policy.storeUrl.trim() ? 'invalid_store_url' : 'empty_store_url',
      };
    }

    return { kind: 'force', policy };
  }

  if (policy.optionalUpdateEnabled && latestComparison === -1) {
    if (!storeUrlOk) {
      return {
        kind: 'none',
        policy,
        reason: policy.storeUrl.trim() ? 'invalid_store_url' : 'empty_store_url',
      };
    }

    return { kind: 'optional', policy };
  }

  return { kind: 'none', policy, reason: 'up_to_date' };
}
