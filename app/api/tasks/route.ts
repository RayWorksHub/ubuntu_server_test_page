import { ZodError } from "zod";
import { AuthenticationError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskCreateSchema } from "@/lib/validation";
import { assertSameOrigin, jsonError, validationError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const data = taskCreateSchema.parse(await request.json());
    const list = await prisma.todoList.findFirst({ where: { id: data.listId, userId: user.id } });
    if (!list) return jsonError("A lista nem található.", 404);
    const task = await prisma.todoItem.create({
      data: {
        listId: list.id,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
      },
    });
    return Response.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return jsonError(error.message, 401);
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    return jsonError("A feladat létrehozása nem sikerült.", 500);
  }
}
