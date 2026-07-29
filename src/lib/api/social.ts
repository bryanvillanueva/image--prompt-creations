import { api } from "./client";
import type {
  CaptionSource,
  ScheduledPost,
  SocialConnection,
  SocialPage,
  SocialPlatform,
} from "../types";

export interface CreatePostPayload {
  generation_id?: number;
  image_url?: string;
  caption?: string;
  platforms: SocialPlatform[];
  publish_at?: string;
  is_ai_generated?: boolean;
  /** Traceability for the caption assistant; feeds the per-brand copy memory. */
  caption_source?: CaptionSource;
  caption_message_id?: number;
}

export const socialApi = {
  getConnection: (brandId: number) =>
    api.get<SocialConnection | null>(`/brands/${brandId}/social`),

  getConnectUrl: (brandId: number) =>
    api.post<{ auth_url: string }>(`/brands/${brandId}/social/connect-url`),

  listPages: (brandId: number) =>
    api.get<SocialPage[]>(`/brands/${brandId}/social/pages`),

  selectPage: (brandId: number, pageId: string) =>
    api.post<SocialConnection>(`/brands/${brandId}/social/select-page`, { page_id: pageId }),

  disconnect: (brandId: number) =>
    api.delete<{ disconnected: boolean }>(`/brands/${brandId}/social`),

  createPost: (brandId: number, body: CreatePostPayload) =>
    api.post<ScheduledPost>(`/brands/${brandId}/posts`, body),

  listPosts: (brandId: number, filters: { page?: number; limit?: number } = {}) =>
    api.get<ScheduledPost[]>(`/brands/${brandId}/posts`, { query: filters }),

  getPost: (brandId: number, postId: number) =>
    api.get<ScheduledPost>(`/brands/${brandId}/posts/${postId}`),

  cancelPost: (brandId: number, postId: number) =>
    api.delete<{ id: number; status: string }>(`/brands/${brandId}/posts/${postId}`),

  retryPost: (brandId: number, postId: number) =>
    api.post<{ id: number; status: string }>(`/brands/${brandId}/posts/${postId}/retry`),
};
