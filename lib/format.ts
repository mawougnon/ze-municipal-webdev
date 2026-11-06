// Pages are rendered on Vercel servers set to UTC. Dates are shown in Benin time,
// otherwise login times are an hour off and late evening dates move to the next day.
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  return new Date(date).toLocaleDateString("fr-FR", { timeZone: "Africa/Porto-Novo", ...options });
}

// "25 000" as written in French, whatever the server language
export function formatPrice(price: number | null) {
  return (price ?? 0).toLocaleString("fr-FR");
}

export const LONG_DATE = { day: "numeric", month: "long", year: "numeric" } as const;
