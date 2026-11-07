import { z } from "zod";

// Before any schema exists: zod would otherwise try eval, which the content policy refuses
z.config({ jitless: true });

export { z };
