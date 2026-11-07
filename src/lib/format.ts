// The servers run in UTC
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  return new Date(date).toLocaleDateString("fr-FR", { timeZone: "Africa/Porto-Novo", ...options });
}

export function formatPrice(price: number | null) {
  return (price ?? 0).toLocaleString("fr-FR");
}

export const LONG_DATE = { day: "numeric", month: "long", year: "numeric" } as const;

// French: 0 and 1 are singular
export function plural(count: number, word: string) {
  return `${count} ${word}${count > 1 ? "s" : ""}`;
}
