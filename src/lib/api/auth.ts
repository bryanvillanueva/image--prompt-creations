import { api } from "./client";
import type { PublicUser } from "../types";

export const authApi = {
  me: () => api.get<{ user: PublicUser }>("/auth/me"),
  login: (input: { email: string; password: string }) =>
    api.post<{ user: PublicUser }>("/auth/login", input),
  register: (input: { name: string; username: string; email: string; password: string }) =>
    api.post<{ user: PublicUser }>("/auth/register", input),
  logout: () => api.post<{ ok: boolean }>("/auth/logout"),
};
