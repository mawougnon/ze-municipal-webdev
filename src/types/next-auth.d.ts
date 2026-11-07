import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: Role;
  }
  interface Session {
    user: { role?: Role } & DefaultSession["user"];
  }
}

// JWT is declared in @auth/core/jwt; next-auth/jwt only re-exports it
declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
  }
}
