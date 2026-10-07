import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createOpaqueToken, hashToken } from "@/lib/crypto";

const SESSION_DAYS = 30;

export class AuthenticationError extends Error {}

function cookieName() {
  return process.env.NODE_ENV === "production" ? "__Host-ganz_session" : "ganz_session";
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt, ipAddress, userAgent },
  });
  const store = await cookies();
  store.set(cookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyCurrentSession() {
  const store = await cookies();
  const token = store.get(cookieName())?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.set(cookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(cookieName())?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, name: true, email: true, emailVerifiedAt: true } } },
  });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError("Bejelentkezés szükséges.");
  return user;
}
