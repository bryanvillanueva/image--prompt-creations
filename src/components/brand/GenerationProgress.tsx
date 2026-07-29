"use client";
import * as React from "react";
import { generationBoxStyle } from "@/components/brand/GenerationImage";
import { useT } from "@/lib/i18n/I18nProvider";

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const DEFAULT_ACCENT = "#0a72ef";

/** Phases shown while waiting, picked by progress so the copy keeps moving. */
const PHASES = ["analyzing", "composing", "styling", "refining"] as const;

function phaseFor(p: number) {
  if (p < 0.22) return PHASES[0];
  if (p < 0.5) return PHASES[1];
  if (p < 0.78) return PHASES[2];
  return PHASES[3];
}

/**
 * Time-based progress: fast at the start, asymptotic afterwards. It never
 * reaches 100% on its own — only the real `completed` status closes the bar.
 */
function useElapsedProgress(startIso: string | null | undefined) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    // Parsed inside the effect so SSR and the first client render both start at 0.
    const started = startIso ? Date.parse(startIso) : NaN;
    const start = Number.isFinite(started) ? started : Date.now();

    const tick = () => {
      const elapsed = Math.max(0, Date.now() - start);
      setProgress(Math.min((1 - Math.exp(-elapsed / 24_000)) * 0.94, 0.94));
    };

    tick();
    const id = setInterval(tick, 300);
    return () => clearInterval(id);
  }, [startIso]);

  return progress;
}

function accentFrom(colors?: string[] | null) {
  const found = colors?.find((c) => HEX.test(c.trim()));
  return found ? found.trim() : DEFAULT_ACCENT;
}

/**
 * Rough layout of a social post (logo, subject, copy, CTA). Rendered twice:
 * a grey version underneath and a brand-tinted one that is revealed from the
 * bottom up, so the placeholder reads as an image being painted.
 */
function PostMock({ accent, vivid }: { accent: string; vivid: boolean }) {
  const surface = vivid
    ? `linear-gradient(135deg, color-mix(in srgb, ${accent} 20%, #fff), color-mix(in srgb, ${accent} 5%, #fff))`
    : "var(--color-bg-subtle)";
  const block = vivid ? `color-mix(in srgb, ${accent} 30%, #fff)` : "#efefef";
  const strong = vivid ? `color-mix(in srgb, ${accent} 55%, #fff)` : "#e2e2e2";

  return (
    <div
      className="absolute inset-0 flex flex-col gap-[3%] p-[6%]"
      style={{ background: surface }}
      aria-hidden
    >
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 shrink-0 rounded-lg sm:h-7 sm:w-7" style={{ background: strong }} />
        <div className="h-2 w-[38%] rounded-full" style={{ background: block }} />
      </div>

      <div className="relative flex-1 overflow-hidden rounded-2xl" style={{ background: block }}>
        <div
          className="absolute left-1/2 top-[42%] h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full animate-breath"
          style={{ background: strong }}
        />
        <div
          className="absolute bottom-[14%] left-[10%] h-3 w-[52%] rounded-full"
          style={{ background: strong }}
        />
        <div
          className="absolute bottom-[6%] left-[10%] h-2 w-[34%] rounded-full opacity-70"
          style={{ background: strong }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="h-2 flex-1 rounded-full" style={{ background: block }} />
        <div className="h-5 w-[22%] rounded-full sm:h-6" style={{ background: strong }} />
      </div>
    </div>
  );
}

interface GenerationProgressProps {
  aspectRatio: string;
  /** `started_at` when the worker picked the job up, `created_at` otherwise. */
  startedAt?: string | null;
  /** Brand primary colors: the placeholder is tinted with the first valid hex. */
  accentColors?: string[] | null;
  /** Past the UI timeout: keep the bar moving but explain the delay. */
  slow?: boolean;
}

/**
 * Placeholder shown while a generation is pending/processing. Mimics the final
 * post and fills in from the bottom up so the wait feels shorter than it is.
 */
export function GenerationProgress({
  aspectRatio,
  startedAt,
  accentColors,
  slow = false,
}: GenerationProgressProps) {
  const { t } = useT();
  const progress = useElapsedProgress(startedAt);
  const accent = accentFrom(accentColors);
  const pct = Math.round(progress * 100);

  const label = slow
    ? t("brands.generationSlow")
    : progress >= 0.85
      ? t("brands.generationAlmost")
      : t(`brands.generationPhases.${phaseFor(progress)}`);

  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
      style={generationBoxStyle(aspectRatio)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <PostMock accent={accent} vivid={false} />

      {/* Tinted copy of the mock, revealed bottom-up as progress advances. */}
      <div
        className="absolute inset-0 transition-[clip-path] duration-700 ease-out"
        style={{ clipPath: `inset(${100 - pct}% 0 0 0)` }}
      >
        <PostMock accent={accent} vivid />
      </div>

      {/* Glow riding the reveal edge. */}
      <div
        className="pointer-events-none absolute inset-x-0 h-8 -translate-y-1/2 blur-md transition-[top] duration-700 ease-out"
        style={{
          top: `${100 - pct}%`,
          background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${accent} 45%, transparent), transparent)`,
        }}
        aria-hidden
      />

      {/* Shimmer sweep over the whole placeholder. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="animate-shimmer h-full w-full bg-gradient-to-r from-transparent via-white/65 to-transparent" />
      </div>

      {/* Status strip pinned to the bottom of the box. */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="rounded-lg bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm">
          <p className="text-xs text-[var(--color-fg-muted)]">{label}</p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${Math.max(pct, 4)}%`, background: accent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
