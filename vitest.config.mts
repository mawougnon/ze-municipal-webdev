import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      // "@/..." only: a bare "@" would also catch packages such as @prisma/client
      { find: /^@\//, replacement: `${root}/src/` },
      // Outside Next.js this marker package throws on import; the tests run server code directly
      { find: "server-only", replacement: `${root}/node_modules/server-only/empty.js` },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    env: { NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co" },
  },
});
