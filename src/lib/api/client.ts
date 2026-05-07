import { API_BASE_URL } from "../constants";
import type { ApiErrorDetail, ApiResponse } from "../types";

export class ApiError extends Error {
  status: number;
  details: ApiErrorDetail[];
  raw: unknown;

  constructor(status: number, message: string, details: ApiErrorDetail[] = [], raw?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.raw = raw;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      // empty body or non-json
    }
    const message =
      (payload && typeof payload === "object" && "error" in payload && typeof (payload as Record<string, unknown>).error === "string"
        ? ((payload as Record<string, unknown>).error as string)
        : null) ?? defaultMessageFor(res.status);
    const details =
      payload && typeof payload === "object" && "details" in payload && Array.isArray((payload as Record<string, unknown>).details)
        ? ((payload as Record<string, unknown>).details as ApiErrorDetail[])
        : [];
    return new ApiError(res.status, message, details, payload);
  }
}

function defaultMessageFor(status: number): string {
  switch (status) {
    case 400: return "Solicitud inválida";
    case 401: return "Necesitas iniciar sesión";
    case 403: return "No tienes permisos para realizar esta acción";
    case 404: return "Recurso no encontrado";
    case 409: return "Conflicto con datos existentes";
    case 413: return "El archivo es demasiado grande";
    case 415: return "Formato de archivo no soportado";
    case 422: return "Datos inválidos";
    case 429: return "Demasiadas peticiones, espera un momento";
    case 500: return "Error interno del servidor";
    default:  return `Error inesperado (${status})`;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

interface RequestOptions {
  query?: Query;
  signal?: AbortSignal;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) throw await ApiError.fromResponse(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

export const api = {
  async get<T>(path: string, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path, opts.query), {
      method: "GET",
      credentials: "include",
      signal: opts.signal,
    });
    return handle<ApiResponse<T>>(res);
  },

  async post<T>(path: string, body?: unknown, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path, opts.query), {
      method: "POST",
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: opts.signal,
    });
    return handle<ApiResponse<T>>(res);
  },

  async put<T>(path: string, body?: unknown, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path, opts.query), {
      method: "PUT",
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: opts.signal,
    });
    return handle<ApiResponse<T>>(res);
  },

  async patch<T>(path: string, body?: unknown, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path, opts.query), {
      method: "PATCH",
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: opts.signal,
    });
    return handle<ApiResponse<T>>(res);
  },

  async delete<T>(path: string, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path, opts.query), {
      method: "DELETE",
      credentials: "include",
      signal: opts.signal,
    });
    return handle<ApiResponse<T>>(res);
  },

  async postForm<T>(path: string, form: FormData, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path, opts.query), {
      method: "POST",
      credentials: "include",
      body: form,
      signal: opts.signal,
    });
    return handle<ApiResponse<T>>(res);
  },

  async putForm<T>(path: string, form: FormData, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path, opts.query), {
      method: "PUT",
      credentials: "include",
      body: form,
      signal: opts.signal,
    });
    return handle<ApiResponse<T>>(res);
  },
};
