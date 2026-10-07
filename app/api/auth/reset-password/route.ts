import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/passwords";
import { hashToken } from "@/lib/crypto";
import { sendPasswordChangedEmail } from "@/lib/mail";
import { assertSameOrigin, clientIp, jsonError, validationError } from "@/lib/http";
import { isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = clientIp(request);
    if (await isRateLimited("password-reset", ip, 8, 3600)) return jsonError("Túl sok próbálkozás.", 429);
    const data = resetPasswordSchema.parse(await request.json());
    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash: hashToken(data.token) },
      include: { user: true },
    });
    if (!record || record.type !== "RESET_PASSWORD" || record.usedAt || record.expiresAt <= new Date()) {
      await recordRateLimitEvent("password-reset", ip);
      return jsonError("A hivatkozás érvénytelen vagy lejárt.", 400);
    }
    const passwordHash = await hashPassword(data.password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.session.deleteMany({ where: { userId: record.userId } }),
    ]);
    try {
      await sendPasswordChangedEmail(record.user.email, record.user.name);
    } catch (error) {
      console.error("Password changed email failed", error);
    }
    return Response.json({ message: "A jelszó sikeresen megváltozott." });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    console.error(error);
    return jsonError("A jelszó módosítása nem sikerült.", 500);
  }
}
