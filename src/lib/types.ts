export type Role = "admin" | "moderator" | "user";
export type UserStatus = "active" | "suspended" | "deleted";
export type TrustLevel = "new" | "trusted" | "verified";

export type Visibility = "public" | "private" | "unlisted";
export type PromptStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "blocked"
  | "hidden";

export type SortOption = "recent" | "popular" | "most_liked";

export type ReportReason =
  | "sexual_content"
  | "violent_content"
  | "hate_or_harassment"
  | "copyright_issue"
  | "spam"
  | "misleading"
  | "other";

export type ReportStatus = "pending" | "resolved" | "dismissed";

export type ModerationCategory =
  | "sexual_content"
  | "minor_safety"
  | "violence"
  | "hate"
  | "self_harm"
  | "illegal"
  | "spam"
  | "other";

export type Severity = "low" | "medium" | "high" | "critical";
export type MatchType = "exact" | "contains" | "regex";
export type ModerationAction = "flag" | "needs_review" | "block";

export interface Author {
  id: number;
  username: string;
  name: string;
  avatar_url: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface PromptImage {
  url: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
}

export interface Prompt {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  slug: string;
  prompt_text: string;
  negative_prompt: string | null;
  model_name: string;
  aspect_ratio: string | null;
  style: string | null;
  description: string | null;
  visibility: Visibility;
  status: PromptStatus;
  moderation_score: number | null;
  moderation_reason: string | null;
  rejection_reason: string | null;
  copied_count: number;
  views_count: number;
  likes_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
  image: PromptImage | null;
  tags: Tag[];
  author: Author | null;
  category?: Category;
  saved_at?: string;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface PublicUser {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  role: Role;
  status: UserStatus;
  email_verified: boolean;
  upload_limit_per_day: number;
  trust_level: TrustLevel;
  created_at: string;
  total_prompts: number;
}

export interface Report {
  id: number;
  reporter_user_id: number;
  prompt_id: number;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  prompt_title?: string;
  prompt_slug?: string;
  reporter_username?: string;
}

export interface ModerationWord {
  id: number;
  term: string;
  normalized_term: string;
  language: string | null;
  category: ModerationCategory;
  severity: Severity;
  match_type: MatchType;
  action: ModerationAction;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PromptListFilters {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  model?: string;
  q?: string;
  sort?: SortOption;
}

export type AssetType = "logo" | "logo_variant" | "example_material" | "other";
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";
export type FeedbackRating = "like" | "dislike";

export type BrandTypography = Record<string, string>;

export interface Brand {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  industry: string | null;
  tone_of_voice: string | null;
  slogan: string | null;
  typography: BrandTypography | null;
  primary_colors: string[] | null;
  secondary_colors: string[] | null;
  style_memory: string | null;
  style_memory_updated_at: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  assets?: BrandAsset[];
}

export interface BrandAsset {
  id: number;
  brand_id: number;
  asset_type: AssetType;
  image_url: string;
  storage_key: string;
  title: string | null;
  notes: string | null;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface BrandGeneration {
  id: number;
  brand_id: number;
  status: GenerationStatus;
  instruction: string;
  aspect_ratio: string;
  composed_prompt: string | null;
  agent_notes: string | null;
  image_url: string | null;
  error_message: string | null;
  feedback_rating: FeedbackRating | null;
  feedback_comment: string | null;
  feedback_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// ---- Carousels ----

export type CarouselStatus =
  | "pending"
  | "planning"
  | "generating"
  | "completed"
  | "partial"
  | "failed";

export type CarouselSlideStatus = "pending" | "processing" | "completed" | "failed";

export interface CarouselSlide {
  position: number;
  role: string;
  headline: string | null;
  status: CarouselSlideStatus;
  image_url: string | null;
  error_message: string | null;
  completed_at: string | null;
}

export interface BrandCarousel {
  id: number;
  brand_id: number;
  status: CarouselStatus;
  topic: string;
  slide_count: number;
  aspect_ratio: string;
  style_preset: string | null;
  narrative_preset: string | null;
  narrative: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  /** The list endpoint returns only the header; slides come with the detail. */
  slides?: CarouselSlide[];
}

export interface CarouselPresetOption {
  id: string;
  label: string;
  description: string;
}

/** Static catalog from the backend; labels/descriptions are shown as-is. */
export interface CarouselPresets {
  styles: CarouselPresetOption[];
  narratives: CarouselPresetOption[];
  aspect_ratios: string[];
  slide_count: { min: number; max: number };
}

export type SocialPlatform = "instagram" | "facebook";
export type SocialConnectionStatus = "pending_page" | "active" | "expired";
export type SocialPostStatus =
  | "pending"
  | "publishing"
  | "published"
  | "partial"
  | "failed"
  | "cancelled";

export interface SocialConnection {
  status: SocialConnectionStatus;
  page_id: string | null;
  page_name: string | null;
  ig_user_id: string | null;
  ig_username: string | null;
  connected_by: number;
  token_expires_at: string | null;
  updated_at: string;
}

export interface SocialPage {
  id: string;
  name: string;
  ig_user_id: string | null;
  ig_username: string | null;
}

export type CaptionSource = "manual" | "agent" | "agent_edited";

export interface CaptionSuggestion {
  /** Body without hashtags. */
  text: string;
  /** Hashtags without the leading `#`. */
  hashtags: string[];
  platform: SocialPlatform | null;
  /** Body + hashtags already composed and clamped to CAPTION_MAX: this is what goes to the textarea. */
  full_text: string;
}

export interface CaptionMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  captions: CaptionSuggestion[] | null;
  created_at: string;
}

export interface CaptionThread {
  thread_id: number;
  generation_id?: number;
  carousel_id?: number;
  messages: CaptionMessage[];
}

export interface SocialPostResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface ScheduledPost {
  id: number;
  brand_id: number;
  /** Posts created before carousels existed may not carry these fields. */
  post_type?: "image" | "carousel";
  carousel_id?: number | null;
  generation_id: number | null;
  /** Cover (slide 1) for carousels, the image itself otherwise. */
  image_url: string;
  /** Ordered slide URLs for carousel posts. */
  media_urls?: string[] | null;
  aspect_ratio?: string | null;
  caption: string | null;
  platforms: SocialPlatform[];
  is_ai_generated: boolean;
  publish_at: string | null;
  status: SocialPostStatus;
  ig_media_id: string | null;
  fb_post_id: string | null;
  results: Partial<Record<SocialPlatform, SocialPostResult>> | null;
  error_message: string | null;
  attempts: number;
  published_at: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta & {
    moderation?: { action: ModerationAction | "none"; score: number | null; reason: string | null };
  };
}

export interface ApiErrorDetail {
  field: string;
  location?: string;
  message: string;
}
