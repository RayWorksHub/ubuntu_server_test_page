import { prisma } from "@/lib/prisma";
import { hashRateLimitKey } from "@/lib/crypto";

export async function isRateLimited(action: string, key: string, limit: number, windowSeconds: number) {
  const keyHash = hashRateLimitKey(`${action}:${key}`);
  const since = new Date(Date.now() - windowSeconds * 1000);
  const count = await prisma.rateLimitEvent.count({
    where: { action, keyHash, success: false, createdAt: { gte: since } },
  });
  return count >= limit;
}

export function recordRateLimitEvent(action: string, key: string, success = false) {
  return prisma.rateLimitEvent.create({
    data: { action, keyHash: hashRateLimitKey(`${action}:${key}`), success },
  });
}

export function clearRateLimit(action: string, key: string) {
  return prisma.rateLimitEvent.deleteMany({
    where: { action, keyHash: hashRateLimitKey(`${action}:${key}`) },
  });
}
