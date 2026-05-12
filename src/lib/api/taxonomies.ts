import { api } from "./client";
import type { Category, Tag, Prompt } from "../types";

export const taxonomiesApi = {
  categories: () => api.get<Category[]>("/categories"),
  tags: () => api.get<Tag[]>("/tags"),
};

export const usersApi = {
  publicProfile: (username: string) =>
    api.get<{ user: { id: number; username: string; name: string; avatar_url: string | null; bio: string | null; created_at: string }; total_prompts: number; prompts: Prompt[] }>(
      `/users/${encodeURIComponent(username)}`,
    ),
};
