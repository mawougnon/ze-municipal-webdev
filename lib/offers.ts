// A deadline is stored as midnight UTC of the chosen day. Benin is UTC+1 all year,
// so that day ends 23 hours later: an offer stays open for the whole deadline day.
const DAY_END_MS = 23 * 60 * 60 * 1000;

export function isOpen(deadline: Date | null) {
  return !deadline || deadline.getTime() + DAY_END_MS > Date.now();
}

// Prisma filter for offers that are published and still open
export function openOffersWhere() {
  return {
    published: true,
    OR: [{ deadline: null }, { deadline: { gt: new Date(Date.now() - DAY_END_MS) } }],
  };
}
