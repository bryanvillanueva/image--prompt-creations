import type { PromptListFilters, PromptStatus } from "../types";

export const qk = {
  auth: {
    me: ["auth", "me"] as const,
  },
  prompts: {
    all: ["prompts"] as const,
    list: (filters: PromptListFilters) => ["prompts", "list", filters] as const,
    bySlug: (slug: string) => ["prompts", "slug", slug] as const,
  },
  taxonomies: {
    categories: ["categories"] as const,
    tags: ["tags"] as const,
  },
  users: {
    public: (username: string) => ["users", "public", username] as const,
  },
  me: {
    prompts: (filters: { status?: string; page?: number; limit?: number }) =>
      ["me", "prompts", filters] as const,
    saved: ["me", "saved"] as const,
  },
  brands: {
    all: ["brands"] as const,
    list: ["brands", "list"] as const,
    detail: (id: number) => ["brands", "detail", id] as const,
    generations: (id: number, page: number) => ["brands", id, "generations", page] as const,
    generation: (id: number, genId: number) => ["brands", id, "generation", genId] as const,
    social: (id: number) => ["brands", id, "social"] as const,
    socialPages: (id: number) => ["brands", id, "social", "pages"] as const,
    posts: (id: number, page: number) => ["brands", id, "posts", page] as const,
    post: (id: number, postId: number) => ["brands", id, "post", postId] as const,
  },
  admin: {
    pending: (filters: { status?: PromptStatus; page?: number; limit?: number }) =>
      ["admin", "pending", filters] as const,
    reports: (filters: { status?: string }) => ["admin", "reports", filters] as const,
    users: (filters: { q?: string; status?: string }) => ["admin", "users", filters] as const,
    modWords: ["admin", "modWords"] as const,
  },
};
