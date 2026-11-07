// Benin numbers have 10 digits and start with 01
export function normalizeBeninPhone(raw: string) {
  return raw.replace(/[\s.()-]/g, "").replace(/^(\+|00)229/, "");
}

export const BENIN_PHONE = /^01[0-9]{8}$/;

export const whatsappLink = (phone: string) => `https://wa.me/229${phone}`;
