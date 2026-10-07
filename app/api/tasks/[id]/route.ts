import { ZodError } from "zod";
import { AuthenticationError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskUpdateSchema } from "@/lib/validation";
import { assertSameOrigin, jsonError, validationError } from "@/lib/http";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const { id } = await context.params;
    const data = taskUpdateSchema.parse(await request.json());
    const owned = await prisma.todoItem.findFirst({ where: { id, list: { userId: user.id } } });
    if (!owned) return jsonError("A feladat nem található.", 404);
    const task = await prisma.todoItem.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    });
    return Response.json({ task });
  } catch (error) {
    if (error instanceof AuthenticationError) return jsonError(error.message, 401);
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    return jsonError("A feladat módosítása nem sikerült.", 500);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const { id } = await context.params;
    const owned = await prisma.todoItem.findFirst({ where: { id, list: { userId: user.id } } });
    if (!owned) return jsonError("A feladat nem található.", 404);
    await prisma.todoItem.delete({ where: { id } });
    return Response.json({ message: "A feladat törölve." });
  } catch (error) {
    if (error instanceof AuthenticationError) return jsonError(error.message, 401);
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    return jsonError("A feladat törlése nem sikerült.", 500);
  }
}
