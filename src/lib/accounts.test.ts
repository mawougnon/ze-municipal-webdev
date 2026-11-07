import { expect, it } from "vitest";
import { accountSchema, roleSchema } from "./accounts";

const valid = { name: "Astou Dossou", email: "astou@example.com", role: "ADMIN" };

it("normalises the address the way the login does", () => {
  const parsed = accountSchema.parse({ ...valid, email: "  Astou@Example.COM " });
  expect(parsed.email).toBe("astou@example.com");
});

it.each([
  ["an invalid address", { ...valid, email: "astou" }],
  ["a missing name", { ...valid, name: " " }],
  ["the removed role", { ...valid, role: "USER" }],
  ["no role", { name: valid.name, email: valid.email }],
])("refuses %s", (_label, input) => {
  expect(accountSchema.safeParse(input).success).toBe(false);
});

it("only knows the two roles", () => {
  expect(roleSchema.options).toEqual(["ADMIN", "SUPERADMIN"]);
});
