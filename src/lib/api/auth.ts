import { api } from "./client";
import type { PublicUser } from "../types";

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  email?: string;
  bio?: string | null;
}

export const authApi = {
  me: () => api.get<{ user: PublicUser }>("/auth/me"),
  login: (input: { email: string; password: string }) =>
    api.post<{ user: PublicUser }>("/auth/login", input),
  register: (input: { name: string; username: string; email: string; password: string }) =>
    api.post<{ user: PublicUser }>("/auth/register", input),
  logout: () => api.post<{ ok: boolean }>("/auth/logout"),
  updateMe: (input: UpdateProfileInput) =>
    api.patch<{ user: PublicUser }>("/me", input),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.postForm<{ user: PublicUser }>("/me/avatar", form);
  },
  deleteAvatar: () => api.delete<{ user: PublicUser }>("/me/avatar"),
  changePassword: (input: { current_password: string; new_password: string }) =>
    api.patch<{ ok: boolean }>("/me/password", input),
};
