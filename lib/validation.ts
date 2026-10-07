import { z } from "zod";

const password = z
  .string()
  .min(10, "A jelszó legalább 10 karakter legyen.")
  .max(128, "A jelszó túl hosszú.")
  .regex(/[a-záéíóöőúüű]/i, "A jelszó tartalmazzon betűt.")
  .regex(/[0-9]/, "A jelszó tartalmazzon számot.");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    password,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "A két jelszó nem egyezik.",
    path: ["passwordConfirmation"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(200),
    password,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "A két jelszó nem egyezik.",
    path: ["passwordConfirmation"],
  });

export const listSchema = z.object({ name: z.string().trim().min(1).max(120) });

export const taskCreateSchema = z.object({
  listId: z.string().min(1),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(2000).optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(240).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  completed: z.boolean().optional(),
});
