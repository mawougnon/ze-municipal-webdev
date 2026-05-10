import { handlers } from "@/auth";

// Required by Auth.js — exposes session management endpoints
export const { GET, POST } = handlers;