import type { ReportReason, SortOption, Severity, MatchType, ModerationAction, ModerationCategory } from "./types";

export const MODELS = [
  "Midjourney",
  "ChatGPT Image",
  "DALL·E",
  "Flux",
  "Stable Diffusion",
  "Leonardo AI",
  "Ideogram",
  "Otro",
] as const;

export const ASPECT_RATIOS = ["1:1", "4:5", "9:16", "16:9", "3:2", "2:3", "21:9"] as const;

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Recientes" },
  { value: "popular", label: "Populares" },
  { value: "most_liked", label: "Más likes" },
];

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "sexual_content", label: "Contenido sexual" },
  { value: "violent_content", label: "Contenido violento" },
  { value: "hate_or_harassment", label: "Odio o acoso" },
  { value: "copyright_issue", label: "Problema de derechos de autor" },
  { value: "spam", label: "Spam" },
  { value: "misleading", label: "Engañoso" },
  { value: "other", label: "Otro" },
];

export const VISIBILITY_OPTIONS = [
  { value: "public", label: "Público" },
  { value: "private", label: "Privado" },
  { value: "unlisted", label: "No listado" },
] as const;

export const MODERATION_CATEGORIES: { value: ModerationCategory; label: string }[] = [
  { value: "sexual_content", label: "Contenido sexual" },
  { value: "minor_safety", label: "Seguridad de menores" },
  { value: "violence", label: "Violencia" },
  { value: "hate", label: "Odio" },
  { value: "self_harm", label: "Autolesión" },
  { value: "illegal", label: "Ilegal" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Otro" },
];

export const SEVERITIES: { value: Severity; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
];

export const MATCH_TYPES: { value: MatchType; label: string }[] = [
  { value: "exact", label: "Exacto" },
  { value: "contains", label: "Contiene" },
  { value: "regex", label: "Regex" },
];

export const MODERATION_ACTIONS: { value: ModerationAction; label: string }[] = [
  { value: "flag", label: "Marcar" },
  { value: "needs_review", label: "Revisión manual" },
  { value: "block", label: "Bloquear" },
];

export const PROMPT_STATUSES = [
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "rejected", label: "Rechazados" },
  { value: "blocked", label: "Bloqueados" },
  { value: "hidden", label: "Ocultos" },
  { value: "draft", label: "Borradores" },
] as const;

export const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_TAGS_PER_PROMPT = 20;

// ---- Brand Kit ----

export const BRAND_ASPECT_RATIOS = ["1:1", "4:5", "9:16", "16:9", "3:2"] as const;
export type BrandAspectRatio = (typeof BRAND_ASPECT_RATIOS)[number];

export interface FormatPreset {
  id: string;
  ratio: BrandAspectRatio;
  width: number;
  height: number;
}

// Visual size presets for the studio. Labels/platforms/prompt text live in
// i18n under brands.formats.<id>.*; the prompt text is appended to the
// instruction sent to the agent.
export const FORMAT_PRESETS: FormatPreset[] = [
  { id: "square_post", ratio: "1:1", width: 1080, height: 1080 },
  { id: "portrait_post", ratio: "4:5", width: 1080, height: 1350 },
  { id: "story", ratio: "9:16", width: 1080, height: 1920 },
  { id: "landscape", ratio: "16:9", width: 1920, height: 1080 },
  { id: "photo", ratio: "3:2", width: 1620, height: 1080 },
];

export const ASSET_TYPES = ["logo", "logo_variant", "example_material", "other"] as const;

export const MAX_BRANDS_PER_USER = 5;
export const MAX_ASSETS_PER_BRAND = 20;
export const MAX_REFERENCE_ASSETS = 3;
export const MAX_COLORS_PER_LIST = 8;
export const MAX_TYPOGRAPHY_ENTRIES = 6;
export const INSTRUCTION_MIN = 5;
export const INSTRUCTION_MAX = 2000;
export const GENERATION_POLL_MS = 4500;
export const GENERATION_UI_TIMEOUT_MS = 120_000;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
