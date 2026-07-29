"use client";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Facebook, Instagram, RefreshCw, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { captionsApi } from "@/lib/api/captions";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { CAPTION_CHAT_MAX, CAPTION_CHAT_MIN, CAPTION_COOLDOWN_MS } from "@/lib/constants";
import type { CaptionMessage, CaptionSuggestion, CaptionThread, SocialPlatform } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

interface CaptionAssistantProps {
  brandId: number;
  generationId: number;
  /** Selected platforms — sent as context so the copy fits the target network. */
  platforms: SocialPlatform[];
  /** Current textarea content, to label the action as "use" or "replace". */
  currentCaption: string;
  /** `full_text` of the suggestion already applied, if any. */
  appliedText: string | null;
  onUse: (suggestion: CaptionSuggestion, messageId: number) => void;
}

function BubbleSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <div className="h-3 w-2/3 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
        <div className="animate-shimmer h-full w-full bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-[var(--color-border)] p-2.5">
          <div className="space-y-1.5">
            <div className="h-2.5 w-full rounded-full bg-[var(--color-bg-subtle)]" />
            <div className="h-2.5 w-4/5 rounded-full bg-[var(--color-bg-subtle)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CaptionAssistant({
  brandId,
  generationId,
  platforms,
  currentCaption,
  appliedText,
  onUse,
}: CaptionAssistantProps) {
  const { t } = useT();
  const queryClient = useQueryClient();
  const queryKey = qk.brands.captionThread(brandId, generationId);

  // Read at call time so a platform toggle doesn't refetch the thread.
  const platformsRef = React.useRef(platforms);
  platformsRef.current = platforms;

  const [draft, setDraft] = React.useState("");
  const [pendingText, setPendingText] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = React.useState(0);
  const [cooldownLeft, setCooldownLeft] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // The open call is a POST but idempotent, so it behaves like a read here.
  const threadQuery = useQuery({
    queryKey,
    queryFn: () =>
      captionsApi.openThread(brandId, generationId, platformsRef.current).then((r) => r.data),
    staleTime: Infinity,
    retry: false,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => {
      const threadId = threadQuery.data?.thread_id;
      if (threadId == null) throw new Error("no thread");
      return captionsApi.sendMessage(brandId, threadId, content, platformsRef.current);
    },
    onMutate: (content) => {
      setError(null);
      setPendingText(content);
      setDraft("");
    },
    onSuccess: (messages) => {
      queryClient.setQueryData<CaptionThread>(queryKey, (prev) =>
        prev ? { ...prev, messages: [...prev.messages, ...messages] } : prev,
      );
      setPendingText(null);
    },
    onError: (err, content) => {
      setPendingText(null);
      setDraft(content); // don't make the user retype
      if (err instanceof ApiError) {
        if (err.status === 429) setCooldownUntil(Date.now() + CAPTION_COOLDOWN_MS);
        setError(err.message);
      } else {
        setError(t("common.connectionError"));
      }
    },
  });

  React.useEffect(() => {
    if (!cooldownUntil) return;
    const tick = () => {
      const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
      setCooldownLeft(Math.max(0, left));
      if (left <= 0) setCooldownUntil(0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const messages = threadQuery.data?.messages ?? [];

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, pendingText]);

  const trimmed = draft.trim();
  const cooling = cooldownLeft > 0;
  const canSend =
    !!threadQuery.data &&
    !sendMutation.isPending &&
    !cooling &&
    trimmed.length >= CAPTION_CHAT_MIN &&
    trimmed.length <= CAPTION_CHAT_MAX;

  const submit = () => {
    if (canSend) sendMutation.mutate(trimmed);
  };

  return (
    <div className="flex min-h-0 flex-col gap-2 rounded-xl bg-[var(--color-bg-subtle)] p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--color-fg-muted)]" />
        <p className="text-sm font-medium">{t("social.captionAssistant")}</p>
      </div>
      <p className="text-xs text-[var(--color-fg-muted)]">{t("social.captionAssistantHint")}</p>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 lg:max-h-[46vh]"
        aria-live="polite"
      >
        {threadQuery.isLoading && <BubbleSkeleton />}

        {threadQuery.error && (
          <div className="space-y-2">
            <p className="text-xs text-[var(--color-danger-fg)]">
              {threadQuery.error instanceof ApiError
                ? threadQuery.error.message
                : t("social.captionError")}
            </p>
            <Button size="sm" variant="secondary" onClick={() => threadQuery.refetch()}>
              <RefreshCw className="h-3.5 w-3.5" />
              {t("social.captionRetry")}
            </Button>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentCaption={currentCaption}
            appliedText={appliedText}
            onUse={onUse}
          />
        ))}

        {pendingText && (
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-lg bg-white px-2.5 py-1.5 text-sm opacity-60 shadow-ring-light">
              {pendingText}
            </p>
          </div>
        )}

        {sendMutation.isPending && (
          <p className="text-xs text-[var(--color-fg-muted)]">{t("social.captionThinking")}</p>
        )}
      </div>

      {error && <p className="text-xs text-[var(--color-danger-fg)]">{error}</p>}

      <div className="flex items-center gap-2">
        <Input
          value={draft}
          maxLength={CAPTION_CHAT_MAX}
          disabled={!threadQuery.data || cooling}
          placeholder={
            cooling
              ? t("social.captionCooldown", { seconds: cooldownLeft })
              : t("social.captionChatPlaceholder")
          }
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 shrink-0"
          aria-label={t("social.captionSend")}
          disabled={!canSend}
          loading={sendMutation.isPending}
          onClick={submit}
        >
          {!sendMutation.isPending && <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  currentCaption,
  appliedText,
  onUse,
}: {
  message: CaptionMessage;
  currentCaption: string;
  appliedText: string | null;
  onUse: (suggestion: CaptionSuggestion, messageId: number) => void;
}) {
  const { t } = useT();

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-lg bg-white px-2.5 py-1.5 text-sm shadow-ring-light">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {message.content && (
        <p className="text-sm text-[var(--color-fg-muted)]">{message.content}</p>
      )}
      {message.captions?.map((suggestion, idx) => {
        const isApplied = appliedText !== null && appliedText === suggestion.full_text;
        // Warn that using this one discards text the user typed themselves.
        const replaces = !isApplied && currentCaption.trim().length > 0;
        return (
          <div
            key={`${message.id}_${idx}`}
            className={cn(
              "rounded-lg border bg-white p-2.5",
              isApplied ? "border-[var(--color-fg)]" : "border-[var(--color-border)]",
            )}
          >
            <p className="whitespace-pre-wrap text-sm">{suggestion.full_text}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
                {suggestion.platform === "instagram" && <Instagram className="h-3.5 w-3.5" />}
                {suggestion.platform === "facebook" && <Facebook className="h-3.5 w-3.5" />}
                {suggestion.full_text.length}
              </span>
              <Button
                size="sm"
                variant={isApplied ? "ghost" : "secondary"}
                disabled={isApplied}
                onClick={() => onUse(suggestion, message.id)}
              >
                {isApplied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {t("social.captionUsed")}
                  </>
                ) : replaces ? (
                  t("social.captionReplace")
                ) : (
                  t("social.captionUse")
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
