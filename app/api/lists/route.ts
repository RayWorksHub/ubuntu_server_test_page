import { ZodError } from "zod";
import { AuthenticationError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listSchema } from "@/lib/validation";
import { assertSameOrigin, jsonError, validationError } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireUser();
    const lists = await prisma.todoList.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { tasks: { orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }] } },
    });
    return Response.json({ lists });
  } catch (error) {
    if (error instanceof AuthenticationError) return jsonError(error.message, 401);
    return jsonError("A listák betöltése nem sikerült.", 500);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const data = listSchema.parse(await request.json());
    const list = await prisma.todoList.create({ data: { name: data.name, userId: user.id }, include: { tasks: true } });
    return Response.json({ list }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return jsonError(error.message, 401);
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "CSRF") return jsonError("Érvénytelen kérés.", 403);
    return jsonError("A lista létrehozása nem sikerült.", 500);
  }
}
