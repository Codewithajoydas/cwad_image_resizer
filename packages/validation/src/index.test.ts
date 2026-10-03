import { describe, expect, it } from "vitest";
import { healthResponseSchema, paginationSchema } from "./index.js";

describe("validation", () => {
  it("validates health responses", () => {
    expect(
      healthResponseSchema.parse({
        status: "ok",
        service: "web",
        timestamp: new Date().toISOString(),
      }).status,
    ).toBe("ok");
  });

  it("provides pagination defaults", () => {
    expect(paginationSchema.parse({})).toEqual({
      page: 1,
      limit: 20,
    });
  });
});