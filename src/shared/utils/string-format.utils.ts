export function normalizeName(value: string): string {
  if (!value) return '';

  const trimmed = value.trim();

  // Skip brand-like mixed case (e.g., "iPhone", "GoPro")
  if (/[a-zăâîșț][A-Z]/.test(trimmed)) return trimmed;

  return trimmed
    .toLocaleLowerCase('ro-RO')
    .replace(/\p{L}/gu, (char, index, str) => {
      if (index === 0 || /[\s.,;:!?(){}[\]'"`]/.test(str[index - 1])) {
        return char.toLocaleUpperCase('ro-RO');
      }
      return char;
    });
}
