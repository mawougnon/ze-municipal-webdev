import type { FormEvent } from "react";
import { expect, it } from "vitest";
import { wantsPublish } from "@/components/PublishButtons";

const submitted = (value?: string) =>
  ({ nativeEvent: { submitter: value === undefined ? null : { value } } }) as unknown as FormEvent;

it("publishes only when the publish button sent the form", () => {
  expect(wantsPublish(submitted("publish"))).toBe(true);
  expect(wantsPublish(submitted("draft"))).toBe(false);
});

it("does not publish when no button is known", () => {
  expect(wantsPublish(submitted())).toBe(false);
});
