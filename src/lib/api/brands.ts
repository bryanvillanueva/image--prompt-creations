import { api } from "./client";
import type { Brand, BrandAsset, BrandGeneration, FeedbackRating } from "../types";

export interface BrandPayload {
  name?: string;
  description?: string | null;
  industry?: string | null;
  tone_of_voice?: string | null;
  slogan?: string | null;
  typography?: Record<string, string> | null;
  primary_colors?: string[] | null;
  secondary_colors?: string[] | null;
}

export interface GenerationPayload {
  instruction: string;
  aspect_ratio?: string;
  use_logo?: boolean;
  reference_asset_ids?: number[];
}

export const brandsApi = {
  list: () => api.get<Brand[]>("/brands"),

  byId: (id: number) => api.get<Brand>(`/brands/${id}`),

  create: (body: BrandPayload) => api.post<Brand>("/brands", body),

  update: (id: number, body: BrandPayload) => api.patch<Brand>(`/brands/${id}`, body),

  remove: (id: number) =>
    api.delete<{ ok: boolean; deleted_id: number }>(`/brands/${id}`),

  uploadAsset: (brandId: number, form: FormData) =>
    api.postForm<BrandAsset>(`/brands/${brandId}/assets`, form),

  deleteAsset: (brandId: number, assetId: number) =>
    api.delete<{ ok: boolean; deleted_id: number }>(`/brands/${brandId}/assets/${assetId}`),

  createGeneration: (brandId: number, body: GenerationPayload) =>
    api.post<{ id: number; status: string }>(`/brands/${brandId}/generations`, body),

  getGeneration: (brandId: number, genId: number) =>
    api.get<BrandGeneration>(`/brands/${brandId}/generations/${genId}`),

  listGenerations: (brandId: number, filters: { page?: number; limit?: number } = {}) =>
    api.get<BrandGeneration[]>(`/brands/${brandId}/generations`, { query: filters }),

  sendFeedback: (brandId: number, genId: number, body: { rating: FeedbackRating; comment?: string }) =>
    api.post<BrandGeneration>(`/brands/${brandId}/generations/${genId}/feedback`, body),

  retryGeneration: (brandId: number, genId: number) =>
    api.post<{ id: number; status: string }>(`/brands/${brandId}/generations/${genId}/retry`),
};
