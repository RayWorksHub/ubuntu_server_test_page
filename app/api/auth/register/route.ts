import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/passwords";
import { createOpaqueToken, hashToken } from "@/lib/crypto";
import { sendVerificationEmail } from "@/lib/mail";
import { assertSameOrigin, clientIp, jsonError, validationError } from "@/lib/http";
import { isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const data = registerSchema.parse(await request.json());
    const ip = clientIp(request);
    const rateKey = `${ip}:${data.email}`;
    if (await isRateLimited("register", rateKey, 5, 3600)) {
      return jsonError("Túl sok regisztrációs próbálkozás. Próbálja újra később.", 429);
    }
    await recordRateLimitEvent("register", rateKey);

    const passwordHash = await hashPassword(data.password);
    const rawToken = createOpaqueToken();
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { name: data.name, email: data.email, passwordHash },
      });
      await tx.verificationToken.create({
        data: {
          type: "VERIFY_EMAIL",
          tokenHash: hashToken(rawToken),
          userId: created.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      return created;
    });

    try {
      await sendVerificationEmail(user.email, user.name, rawToken);
    } catch (error) {
      console.error("Verification email failed", error);
      await prisma.user.delete({ where: { id: user.id } });
      return jsonError("A megerősítő e-mailt nem sikerült elküldeni. Próbálja újra később.", 503);
    }

    return Response.json({ message: "A megerősítő e-mailt elküldtük." }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Ezzel az e-mail-címmel már létezik fiók.", 409);
    }
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    console.error(error);
    return jsonError("A regisztráció nem sikerült.", 500);
  }
}
