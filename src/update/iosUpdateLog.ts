export function logIosUpdate(reason: string, extra?: unknown) {
  if (__DEV__) {
    if (extra === undefined) {
      console.warn(`[ios-update] ${reason}`);
      return;
    }

    console.warn(`[ios-update] ${reason}`, extra);
  }
}
