import { createHash, randomBytes } from "node:crypto";

export function createOpaqueToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashRateLimitKey(value: string) {
  const secret = process.env.APP_SECRET ?? "development-only-rate-limit-secret";
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}
