// Benin numbers have 10 digits and start with 01. People often type them with
// +229 or 00229 in front and with spaces or dots: accept those and keep the 10 digits.
export function normalizeBeninPhone(raw: string) {
  return raw.replace(/[\s.()-]/g, "").replace(/^(\+|00)229/, "");
}

export const BENIN_PHONE = /^01[0-9]{8}$/;

// WhatsApp links need the international number, without "+" or leading zeros
export const whatsappLink = (phone: string) => `https://wa.me/229${phone}`;
