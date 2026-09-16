import type { ConfigValueSource } from './iosUpdatePolicy';

export function configureIosRemoteConfig() {}

export async function fetchAndActivateIosUpdatePolicy(): Promise<{ ok: boolean }> {
  return { ok: false };
}

export function readActivatedPolicyRaw(): {
  raw: string | null;
  source: ConfigValueSource | null;
} {
  return { raw: null, source: null };
}

export function subscribeToIosConfigUpdates(_onReady: () => void): () => void {
  return () => {};
}
