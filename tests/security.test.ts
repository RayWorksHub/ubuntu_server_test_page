import { describe, expect, it } from "vitest";
import { createOpaqueToken, hashToken } from "../lib/crypto";
import { registerSchema, taskCreateSchema } from "../lib/validation";

describe("security primitives", () => {
  it("creates non-reversible fixed-size token hashes", () => {
    const token = createOpaqueToken();
    expect(token.length).toBeGreaterThan(32);
    expect(hashToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(token)).not.toContain(token);
  });

  it("rejects mismatched registration passwords", () => {
    const result = registerSchema.safeParse({ name: "Teszt Elek", email: "test@example.com", password: "biztonsagos1", passwordConfirmation: "masikjelszo2" });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported task priorities", () => {
    const result = taskCreateSchema.safeParse({ listId: "list", title: "Feladat", priority: "URGENT" });
    expect(result.success).toBe(false);
  });
});
