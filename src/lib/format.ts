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

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
