import { destroyCurrentSession } from "@/lib/auth";
import { assertSameOrigin, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await destroyCurrentSession();
    return Response.json({ message: "Sikeres kijelentkezés." });
  } catch (error) {
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    return jsonError("A kijelentkezés nem sikerült.", 500);
  }
}
