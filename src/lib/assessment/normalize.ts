export function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeNumericText(value: string) {
  return normalizeText(value)
    .replace(/,/g, '')
    .replace(/\$/g, '')
    .replace(/degrees?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
