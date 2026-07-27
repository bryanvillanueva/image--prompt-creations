export function formatNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(".0", "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
}

export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatRelativeDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (Math.abs(diffSec) < 60) return "ahora";
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (Math.abs(diffH) < 24) return `hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (Math.abs(diffD) < 30) return `hace ${diffD} d`;
  return formatDate(d);
}

// Social-post timestamps come from the backend as "YYYY-MM-DD HH:MM:SS" in UTC
// (see context/social_publishing_meta.md: publish_at "-05:00 09:00" is stored as "14:00:00").
export function parseServerUtc(input: string): Date {
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(input)) {
    return new Date(`${input.replace(" ", "T")}Z`);
  }
  return new Date(input);
}

export function formatDateTime(input: string | Date): string {
  const d = typeof input === "string" ? parseServerUtc(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "2026-08-01T09:00" (datetime-local) → "2026-08-01T09:00:00-05:00" (ISO with the
// browser's timezone offset, as the publishing API requires).
export function localInputToIso(local: string): string {
  const d = new Date(local);
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
  return `${local}:00${sign}${pad(Math.trunc(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
