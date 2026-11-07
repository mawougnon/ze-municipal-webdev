import { z } from "zod";

// Before any schema exists: zod would otherwise try eval, which the content policy refuses
z.config({ jitless: true });

export { z };

const INVALID_FOCUS = "Point focal invalide.";

export const focusValue = z
  .number(INVALID_FOCUS)
  .int(INVALID_FOCUS)
  .min(0, INVALID_FOCUS)
  .max(100, INVALID_FOCUS);
