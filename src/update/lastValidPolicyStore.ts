import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_VALID_POLICY_STORAGE_KEY } from './constants';
import { parseIosUpdatePolicy, type IosUpdatePolicy } from './iosUpdatePolicy';
import { logIosUpdate } from './iosUpdateLog';

export async function loadLastValidPolicy(): Promise<IosUpdatePolicy | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_VALID_POLICY_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = parseIosUpdatePolicy(raw);
    if (!parsed.ok) {
      logIosUpdate('stored_last_valid_corrupt', parsed.reason);
      return null;
    }

    return parsed.policy;
  } catch (error) {
    logIosUpdate('stored_last_valid_read_failed', error);
    return null;
  }
}

export async function saveLastValidPolicy(policy: IosUpdatePolicy): Promise<void> {
  const parsed = parseIosUpdatePolicy(JSON.stringify(policy));
  if (!parsed.ok) {
    logIosUpdate('skip_persist_invalid_policy', parsed.reason);
    return;
  }

  try {
    await AsyncStorage.setItem(LAST_VALID_POLICY_STORAGE_KEY, JSON.stringify(parsed.policy));
  } catch (error) {
    logIosUpdate('stored_last_valid_write_failed', error);
  }
}
