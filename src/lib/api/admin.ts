import { api } from "./client";
import type {
  ModerationAction,
  ModerationCategory,
  ModerationWord,
  Prompt,
  PromptStatus,
  PublicUser,
  Report,
  Severity,
  MatchType,
} from "../types";

export const adminApi = {
  promptsPending: (filters: { status?: PromptStatus; page?: number; limit?: number } = {}) =>
    api.get<Prompt[]>("/admin/prompts/pending", { query: filters }),

  approve: (id: number) => api.patch<Prompt>(`/admin/prompts/${id}/approve`),
  reject: (id: number, rejection_reason: string) =>
    api.patch<Prompt>(`/admin/prompts/${id}/reject`, { rejection_reason }),
  block: (id: number) => api.patch<Prompt>(`/admin/prompts/${id}/block`),
  hide: (id: number) => api.patch<Prompt>(`/admin/prompts/${id}/hide`),

  reports: (filters: { status?: string } = {}) =>
    api.get<Report[]>("/admin/reports", { query: filters }),
  resolveReport: (id: number, status: "resolved" | "dismissed") =>
    api.patch<Report>(`/admin/reports/${id}/resolve`, { status }),

  users: (filters: { q?: string; status?: string } = {}) =>
    api.get<PublicUser[]>("/admin/users", { query: filters }),
  suspendUser: (id: number) => api.patch<PublicUser>(`/admin/users/${id}/suspend`),

  modWords: () => api.get<ModerationWord[]>("/admin/moderation-words"),
  createModWord: (body: {
    term: string;
    language?: string;
    category: ModerationCategory;
    severity: Severity;
    match_type: MatchType;
    action: ModerationAction;
    is_active?: boolean;
  }) => api.post<ModerationWord>("/admin/moderation-words", body),
  updateModWord: (
    id: number,
    body: {
      term: string;
      language?: string;
      category: ModerationCategory;
      severity: Severity;
      match_type: MatchType;
      action: ModerationAction;
      is_active?: boolean;
    },
  ) => api.put<ModerationWord>(`/admin/moderation-words/${id}`, body),
  deleteModWord: (id: number) => api.delete<{ ok: boolean }>(`/admin/moderation-words/${id}`),
};
