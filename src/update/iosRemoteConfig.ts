import {
  activate,
  fetchAndActivate,
  getRemoteConfig,
  getValue,
  onConfigUpdate,
} from '@react-native-firebase/remote-config';
import {
  IOS_UPDATE_POLICY_PARAM,
  REMOTE_CONFIG_FETCH_TIMEOUT_MS,
  REMOTE_CONFIG_MIN_FETCH_INTERVAL_MS,
} from './constants';
import { SAFE_DEFAULT_POLICY, type ConfigValueSource } from './iosUpdatePolicy';
import { logIosUpdate } from './iosUpdateLog';

export function configureIosRemoteConfig() {
  const remoteConfig = getRemoteConfig();
  remoteConfig.settings = {
    minimumFetchIntervalMillis: REMOTE_CONFIG_MIN_FETCH_INTERVAL_MS,
    fetchTimeoutMillis: REMOTE_CONFIG_FETCH_TIMEOUT_MS,
  };
  remoteConfig.defaultConfig = {
    [IOS_UPDATE_POLICY_PARAM]: JSON.stringify(SAFE_DEFAULT_POLICY),
  };
}

export async function fetchAndActivateIosUpdatePolicy(): Promise<{ ok: boolean }> {
  try {
    await fetchAndActivate(getRemoteConfig());
    return { ok: true };
  } catch (error) {
    logIosUpdate('fetch_failed_kept_last_valid', error);
    return { ok: false };
  }
}

export function readActivatedPolicyRaw(): {
  raw: string | null;
  source: ConfigValueSource | null;
} {
  try {
    const value = getValue(getRemoteConfig(), IOS_UPDATE_POLICY_PARAM);
    return {
      raw: value.asString(),
      source: value.getSource(),
    };
  } catch (error) {
    logIosUpdate('activated_read_failed', error);
    return { raw: null, source: null };
  }
}

export function subscribeToIosConfigUpdates(onReady: () => void): () => void {
  return onConfigUpdate(getRemoteConfig(), {
    next: () => {
      void activate(getRemoteConfig())
        .catch((error) => {
          logIosUpdate('realtime_activate_failed', error);
        })
        .finally(() => {
          onReady();
        });
    },
    error: (error) => {
      logIosUpdate('realtime_listener_error', error);
    },
    complete: () => {},
  });
}
