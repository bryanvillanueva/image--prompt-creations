import { z } from "zod";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_TAGS_PER_PROMPT,
} from "./constants";
import type { TFn } from "./i18n/I18nProvider";

export const makeLoginSchema = (t: TFn) =>
  z.object({
    email: z.string().email(t("validation.emailInvalid")),
    password: z.string().min(8, t("validation.passwordMin")),
  });
export type LoginInput = z.infer<ReturnType<typeof makeLoginSchema>>;

export const makeRegisterSchema = (t: TFn) =>
  z.object({
    name: z.string().min(1, t("validation.required")).max(120),
    username: z
      .string()
      .min(3, t("validation.usernameMin"))
      .max(40, t("validation.usernameMax"))
      .regex(/^[a-zA-Z0-9._-]+$/, t("validation.usernameRegex")),
    email: z.string().email(t("validation.emailInvalid")),
    password: z.string().min(8, t("validation.passwordMin")).max(128),
  });
export type RegisterInput = z.infer<ReturnType<typeof makeRegisterSchema>>;

const makeFileSchema = (t: TFn) =>
  z
    .instanceof(File, { message: t("validation.imageRequired") })
    .refine((f) => ALLOWED_IMAGE_TYPES.includes(f.type), {
      message: t("validation.imageFormat"),
    })
    .refine((f) => f.size <= MAX_IMAGE_SIZE_BYTES, {
      message: t("validation.imageSize"),
    });

export const makePromptFormSchema = (t: TFn) =>
  z.object({
    title: z.string().min(3, t("validation.title3")).max(180),
    prompt_text: z.string().min(5, t("validation.prompt5")).max(8000),
    negative_prompt: z.string().max(2000).optional().or(z.literal("")),
    category_id: z
      .number({ message: t("validation.categoryRequired") })
      .int()
      .positive(t("validation.categoryRequired")),
    model_name: z.string().min(1, t("validation.required")).max(80),
    aspect_ratio: z
      .string()
      .regex(/^\d+:\d+$/, t("validation.aspectFormat"))
      .optional()
      .or(z.literal("")),
    style: z.string().max(80).optional().or(z.literal("")),
    description: z.string().max(2000).optional().or(z.literal("")),
    visibility: z.enum(["public", "private", "unlisted"]),
    tags: z.array(z.string().min(1).max(40)).max(MAX_TAGS_PER_PROMPT),
    alt_text: z.string().max(200).optional().or(z.literal("")),
    image: makeFileSchema(t).optional(),
  });
export type PromptFormValues = z.infer<ReturnType<typeof makePromptFormSchema>>;

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
  term: z.string().min(1).max(200),
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

export const makeRejectSchema = (t: TFn) =>
  z.object({
    rejection_reason: z.string().min(3, t("validation.reason3")).max(500),
  });
export type RejectInput = z.infer<ReturnType<typeof makeRejectSchema>>;
