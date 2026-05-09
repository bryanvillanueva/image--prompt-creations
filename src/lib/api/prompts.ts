import { api } from "./client";
import type { Prompt, PromptListFilters } from "../types";

export const promptsApi = {
  list: (filters: PromptListFilters = {}) =>
    api.get<Prompt[]>("/prompts", {
      query: {
        page: filters.page,
        limit: filters.limit,
        category: filters.category,
        tag: filters.tag,
        model: filters.model,
        q: filters.q,
        sort: filters.sort,
      },
    }),

  bySlug: (slug: string) => api.get<Prompt>(`/prompts/${encodeURIComponent(slug)}`),

  create: (form: FormData) => api.postForm<Prompt>("/prompts", form),

  update: (id: number, form: FormData) =>
    api.putForm<Prompt>(`/prompts/${id}`, form),

  remove: (id: number) =>
    api.delete<{ ok: boolean; deleted_id: number }>(`/prompts/${id}`),

  copy: (slug: string) =>
    api.post<{ ok: boolean; copied_count: number }>(`/prompts/${encodeURIComponent(slug)}/copy`),

  like: (id: number) =>
    api.post<{ ok: boolean; likes_count: number }>(`/prompts/${id}/like`),
  unlike: (id: number) =>
    api.delete<{ ok: boolean; likes_count: number }>(`/prompts/${id}/like`),

  save: (id: number) =>
    api.post<{ ok: boolean; saves_count: number }>(`/prompts/${id}/save`),
  unsave: (id: number) =>
    api.delete<{ ok: boolean; saves_count: number }>(`/prompts/${id}/save`),

  report: (id: number, body: { reason: string; description?: string }) =>
    api.post<{ ok: boolean }>(`/prompts/${id}/report`, body),
};

export const meApi = {
  prompts: (filters: { page?: number; limit?: number; status?: string } = {}) =>
    api.get<Prompt[]>("/me/prompts", { query: filters }),
  saved: (filters: { page?: number; limit?: number } = {}) =>
    api.get<Prompt[]>("/me/saved-prompts", { query: filters }),
};
