import { ZodError } from "zod";
import { AuthenticationError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listSchema } from "@/lib/validation";
import { assertSameOrigin, jsonError, validationError } from "@/lib/http";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const { id } = await context.params;
    const data = listSchema.parse(await request.json());
    const owned = await prisma.todoList.findFirst({ where: { id, userId: user.id } });
    if (!owned) return jsonError("A lista nem található.", 404);
    const list = await prisma.todoList.update({ where: { id }, data: { name: data.name } });
    return Response.json({ list });
  } catch (error) {
    if (error instanceof AuthenticationError) return jsonError(error.message, 401);
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    return jsonError("A lista módosítása nem sikerült.", 500);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const { id } = await context.params;
    const result = await prisma.todoList.deleteMany({ where: { id, userId: user.id } });
    if (!result.count) return jsonError("A lista nem található.", 404);
    return Response.json({ message: "A lista törölve." });
  } catch (error) {
    if (error instanceof AuthenticationError) return jsonError(error.message, 401);
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    return jsonError("A lista törlése nem sikerült.", 500);
  }
}
