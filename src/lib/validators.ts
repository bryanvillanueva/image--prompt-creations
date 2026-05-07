import { z } from "zod";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_TAGS_PER_PROMPT,
} from "./constants";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Requerido").max(120),
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Solo letras, números, punto, guion bajo o guion"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;

const fileSchema = z
  .instanceof(File, { message: "Selecciona una imagen" })
  .refine((f) => ALLOWED_IMAGE_TYPES.includes(f.type), {
    message: "Formato no soportado. Usa JPG, PNG o WEBP.",
  })
  .refine((f) => f.size <= MAX_IMAGE_SIZE_BYTES, {
    message: "La imagen supera los 3 MB.",
  });

export const promptFormSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(180),
  prompt_text: z.string().min(5, "Mínimo 5 caracteres").max(8000),
  negative_prompt: z.string().max(2000).optional().or(z.literal("")),
  category_id: z
    .number({ message: "Selecciona una categoría" })
    .int()
    .positive("Selecciona una categoría"),
  model_name: z.string().min(1, "Requerido").max(80),
  aspect_ratio: z
    .string()
    .regex(/^\d+:\d+$/, "Formato esperado: ej. 1:1, 9:16")
    .optional()
    .or(z.literal("")),
  style: z.string().max(80).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  visibility: z.enum(["public", "private", "unlisted"]),
  tags: z.array(z.string().min(1).max(40)).max(MAX_TAGS_PER_PROMPT),
  alt_text: z.string().max(200).optional().or(z.literal("")),
  image: fileSchema.optional(),
});
export type PromptFormValues = z.infer<typeof promptFormSchema>;

export const reportSchema = z.object({
  reason: z.enum([
    "sexual_content",
    "violent_content",
    "hate_or_harassment",
    "copyright_issue",
    "spam",
    "misleading",
    "other",
  ]),
  description: z.string().max(500).optional().or(z.literal("")),
});
export type ReportInput = z.infer<typeof reportSchema>;

export const moderationWordSchema = z.object({
  term: z.string().min(1, "Requerido").max(200),
  language: z.string().max(8).optional().or(z.literal("")),
  category: z.enum([
    "sexual_content",
    "minor_safety",
    "violence",
    "hate",
    "self_harm",
    "illegal",
    "spam",
    "other",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  match_type: z.enum(["exact", "contains", "regex"]),
  action: z.enum(["flag", "needs_review", "block"]),
  is_active: z.boolean(),
});
export type ModerationWordInput = z.infer<typeof moderationWordSchema>;

export const rejectSchema = z.object({
  rejection_reason: z.string().min(3, "Mínimo 3 caracteres").max(500),
});
export type RejectInput = z.infer<typeof rejectSchema>;
