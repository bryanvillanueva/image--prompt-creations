import { api } from "./client";
import type { BrandCarousel, CarouselPresets } from "../types";

export interface CarouselPayload {
  topic: string;
  slide_count: number;
  aspect_ratio?: string;
  style_preset?: string;
  narrative_preset?: string;
  use_logo?: boolean;
  reference_asset_ids?: number[];
}

export const carouselsApi = {
  /** Static catalog (styles, narratives, ratios, slide bounds) — cache it. */
  getPresets: () => api.get<CarouselPresets>("/brands/carousel-presets"),

  create: (brandId: number, body: CarouselPayload) =>
    api.post<{ id: number; status: string; slide_count: number }>(
      `/brands/${brandId}/carousels`,
      body,
    ),

  byId: (brandId: number, carouselId: number) =>
    api.get<BrandCarousel>(`/brands/${brandId}/carousels/${carouselId}`),

  list: (brandId: number, filters: { page?: number; limit?: number } = {}) =>
    api.get<BrandCarousel[]>(`/brands/${brandId}/carousels`, { query: filters }),

  /** Regenerates only the failed slides. Carousel must be in a final state. */
  retry: (brandId: number, carouselId: number) =>
    api.post<{ id: number; status: string }>(`/brands/${brandId}/carousels/${carouselId}/retry`),

  retrySlide: (brandId: number, carouselId: number, position: number) =>
    api.post<{ id: number; status: string }>(
      `/brands/${brandId}/carousels/${carouselId}/slides/${position}/retry`,
    ),
};
