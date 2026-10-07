import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/crypto";
import { sendVerifiedEmail } from "@/lib/mail";
import { getEnv } from "@/lib/env";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const base = getEnv().APP_URL;
  if (!token) return NextResponse.redirect(`${base}/auth/verify?status=invalid`);

  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!record || record.type !== "VERIFY_EMAIL" || record.usedAt || record.expiresAt <= new Date()) {
    return NextResponse.redirect(`${base}/auth/verify?status=invalid`);
  }

  await prisma.$transaction([
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
  ]);
  try {
    await sendVerifiedEmail(record.user.email, record.user.name);
  } catch (error) {
    console.error("Verified notification failed", error);
  }
  return NextResponse.redirect(`${base}/auth/verify?status=success`);
}
