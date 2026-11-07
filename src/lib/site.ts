// The public address of the site. Vercel keeps this variable up to date, so nothing has to
// change in the code when the domain changes at the handover.
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
