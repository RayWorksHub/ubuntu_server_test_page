import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/passwords";
import { createSession } from "@/lib/auth";
import { sendLoginEmail } from "@/lib/mail";
import { assertSameOrigin, clientIp, jsonError, userAgent, validationError } from "@/lib/http";
import { clearRateLimit, isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const data = loginSchema.parse(await request.json());
    const ip = clientIp(request);
    const key = `${ip}:${data.email}`;
    if ((await isRateLimited("login", key, 5, 15 * 60)) || (await isRateLimited("login-ip", ip, 25, 15 * 60))) {
      return jsonError("Túl sok sikertelen próbálkozás. Próbálja újra 15 perc múlva.", 429);
    }

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    const valid = user ? await verifyPassword(user.passwordHash, data.password) : false;
    if (!user || !valid) {
      await Promise.all([
        recordRateLimitEvent("login", key),
        recordRateLimitEvent("login-ip", ip),
      ]);
      return jsonError("Hibás e-mail-cím vagy jelszó.", 401);
    }
    if (!user.emailVerifiedAt) return jsonError("Belépés előtt erősítse meg az e-mail-címét.", 403);

    await Promise.all([clearRateLimit("login", key), clearRateLimit("login-ip", ip)]);
    const agent = userAgent(request);
    await createSession(user.id, ip, agent);
    const date = new Intl.DateTimeFormat("hu-HU", {
      dateStyle: "long",
      timeStyle: "medium",
      timeZone: "Europe/Budapest",
    }).format(new Date());
    try {
      await sendLoginEmail(user.email, user.name, date, agent);
    } catch (error) {
      console.error("Login notification failed", error);
    }
    return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    console.error(error);
    return jsonError("A bejelentkezés nem sikerült.", 500);
  }
}
