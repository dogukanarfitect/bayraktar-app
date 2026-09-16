import * as Application from 'expo-application';
import { parseAppVersion } from './iosUpdatePolicy';
import { logIosUpdate } from './iosUpdateLog';

export function readNativeIosVersion() {
  const versionRaw = Application.nativeApplicationVersion;
  const version = parseAppVersion(versionRaw);

  if (version == null) {
    logIosUpdate('unreadable_native_version', { versionRaw });
  } else {
    logIosUpdate('native_version', { version });
  }

  return { version };
}
