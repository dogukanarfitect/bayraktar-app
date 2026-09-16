import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import { BACKGROUND_REFRESH_MS } from './constants';
import {
  evaluateIosUpdate,
  isValidStoreUrl,
  resolvePolicyFromSources,
  type IosUpdatePolicy,
  type ResolvedPolicy,
  type UpdateDecision,
} from './iosUpdatePolicy';
import { logIosUpdate } from './iosUpdateLog';
import {
  configureIosRemoteConfig,
  fetchAndActivateIosUpdatePolicy,
  readActivatedPolicyRaw,
  subscribeToIosConfigUpdates,
} from './iosRemoteConfig';
import { loadLastValidPolicy, saveLastValidPolicy } from './lastValidPolicyStore';
import { readNativeIosVersion } from './readNativeIosVersion';

export type IosUpdateGate = {
  decision: UpdateDecision;
  initializing: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  openStore: () => Promise<void>;
  dismissOptional: () => void;
};

const INACTIVE_DECISION: UpdateDecision = { kind: 'none', policy: null };

export function useIosUpdateGate(): IosUpdateGate {
  const [decision, setDecision] = useState<UpdateDecision>(INACTIVE_DECISION);
  const [initializing, setInitializing] = useState(Platform.OS === 'ios');
  const [refreshing, setRefreshing] = useState(Platform.OS === 'ios');
  const initializedRef = useRef(false);
  const lastValidRef = useRef<IosUpdatePolicy | null>(null);
  const dismissedVersionRef = useRef<string | null>(null);
  const backgroundedAtRef = useRef<number | null>(null);
  const currentVersionRef = useRef<string | null>(null);
  const decisionRef = useRef(decision);
  decisionRef.current = decision;

  const applyResolved = useCallback((resolved: ResolvedPolicy) => {
    if (resolved.persistPolicy) {
      lastValidRef.current = resolved.persistPolicy;
      void saveLastValidPolicy(resolved.persistPolicy);
    }

    if (resolved.reason !== 'activated_valid') {
      logIosUpdate(resolved.reason);
    }

    const currentVersion = currentVersionRef.current;
    if (currentVersion == null) {
      logIosUpdate('unreadable_native_version');
      setDecision({ kind: 'none', policy: null, reason: 'unreadable_native_version' });
      return;
    }

    if (!resolved.policy) {
      setDecision({ kind: 'none', policy: null, reason: resolved.reason });
      return;
    }

    const next = evaluateIosUpdate(resolved.policy, currentVersion, isValidStoreUrl(resolved.policy.storeUrl));
    if (next.kind === 'none' && next.reason && next.reason !== 'disabled' && next.reason !== 'up_to_date') {
      logIosUpdate(next.reason);
    }

    if (next.kind === 'optional' && dismissedVersionRef.current === resolved.policy.latestVersion) {
      setDecision({ kind: 'none', policy: resolved.policy, reason: 'optional_dismissed_this_session' });
      return;
    }

    setDecision(next);
  }, []);

  const runCheck = useCallback(async (mode: 'fetch' | 'activated') => {
    setRefreshing(true);

    try {
      let fetchFailed = false;
      if (mode === 'fetch') {
        const result = await fetchAndActivateIosUpdatePolicy();
        fetchFailed = !result.ok;
      }

      const activated = fetchFailed ? { raw: null, source: null } : readActivatedPolicyRaw();
      applyResolved(resolvePolicyFromSources({
        activatedRaw: activated.raw,
        activatedSource: activated.source,
        lastValid: lastValidRef.current,
        fetchFailed,
      }));
    } catch (error) {
      logIosUpdate(lastValidRef.current ? 'fetch_failed_kept_last_valid' : 'fetch_failed_no_last_valid', error);
      applyResolved({
        policy: lastValidRef.current,
        persistPolicy: null,
        reason: lastValidRef.current ? 'fetch_failed_kept_last_valid' : 'fetch_failed_no_last_valid',
      });
    } finally {
      setRefreshing(false);
    }
  }, [applyResolved]);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    let cancelled = false;
    let unsubscribe = () => {};

    void (async () => {
      try {
        const native = readNativeIosVersion();
        currentVersionRef.current = native.version;
        const cachedPolicy = await loadLastValidPolicy();
        if (cancelled) {
          return;
        }
        lastValidRef.current = cachedPolicy;

        // Enforce a known policy before waiting for the network, including offline starts.
        applyResolved({ policy: cachedPolicy, persistPolicy: null, reason: 'startup_cached_policy' });
        configureIosRemoteConfig();
        await runCheck('fetch');
        if (cancelled) {
          return;
        }

        unsubscribe = subscribeToIosConfigUpdates(() => {
          void runCheck('activated');
        });
      } catch (error) {
        logIosUpdate('initialization_failed', error);
        // Keep a known force decision, but don't leave first-time users on the splash forever.
      } finally {
        if (!cancelled) {
          initializedRef.current = true;
          setInitializing(false);
          setRefreshing(false);
        }
      }
    })();

    const appState = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        if (backgroundedAtRef.current == null) {
          backgroundedAtRef.current = Date.now();
        }
        return;
      }

      const leftAt = backgroundedAtRef.current;
      backgroundedAtRef.current = null;
      if (initializedRef.current && leftAt != null && Date.now() - leftAt >= BACKGROUND_REFRESH_MS) {
        void runCheck('fetch');
      }
    });

    return () => {
      cancelled = true;
      initializedRef.current = false;
      unsubscribe();
      appState.remove();
    };
  }, [applyResolved, runCheck]);

  const refresh = useCallback(async () => {
    if (Platform.OS !== 'ios' || !initializedRef.current) {
      return;
    }

    await runCheck('fetch');
  }, [runCheck]);

  const openStore = useCallback(async () => {
    const url = decisionRef.current.policy?.storeUrl ?? '';
    if (!isValidStoreUrl(url)) {
      logIosUpdate(url.trim() ? 'invalid_store_url' : 'empty_store_url');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        logIosUpdate('invalid_store_url', url);
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      logIosUpdate('invalid_store_url', error);
    }
  }, []);

  const dismissOptional = useCallback(() => {
    const latestVersion = decisionRef.current.policy?.latestVersion;
    if (latestVersion != null) {
      dismissedVersionRef.current = latestVersion;
    }

    setDecision((current) => ({
      ...current,
      kind: 'none',
      reason: 'optional_dismissed_this_session',
    }));
  }, []);

  if (Platform.OS !== 'ios') {
    return {
      decision: INACTIVE_DECISION,
      initializing: false,
      refreshing: false,
      refresh: async () => {},
      openStore: async () => {},
      dismissOptional: () => {},
    };
  }

  return {
    decision,
    initializing,
    refreshing,
    refresh,
    openStore,
    dismissOptional,
  };
}
