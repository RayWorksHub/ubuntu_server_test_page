import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { createOpaqueToken, hashToken } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/mail";
import { assertSameOrigin, clientIp, jsonError, validationError } from "@/lib/http";
import { isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const data = forgotPasswordSchema.parse(await request.json());
    const key = `${clientIp(request)}:${data.email}`;
    if (await isRateLimited("password-reset-request", key, 3, 3600)) {
      return jsonError("Túl sok kérés. Próbálja újra később.", 429);
    }
    await recordRateLimitEvent("password-reset-request", key);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (user?.emailVerifiedAt) {
      const rawToken = createOpaqueToken();
      await prisma.$transaction([
        prisma.verificationToken.deleteMany({
          where: { userId: user.id, type: "RESET_PASSWORD", usedAt: null },
        }),
        prisma.verificationToken.create({
          data: {
            type: "RESET_PASSWORD",
            tokenHash: hashToken(rawToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        }),
      ]);
      try {
        await sendPasswordResetEmail(user.email, user.name, rawToken);
      } catch (error) {
        console.error("Password reset email failed", error);
      }
    }
    return Response.json({ message: "Ha a fiók létezik, elküldtük a visszaállítási hivatkozást." });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    console.error(error);
    return jsonError("A kérés feldolgozása nem sikerült.", 500);
  }
}
