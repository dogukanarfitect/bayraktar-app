const TURKISH_LOCALE = 'tr-TR';

export function trUpper(value: string) {
  return value.toLocaleUpperCase(TURKISH_LOCALE);
}

export function trLower(value: string) {
  return value.toLocaleLowerCase(TURKISH_LOCALE);
}
