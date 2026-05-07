"use client";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { moderationWordSchema, type ModerationWordInput } from "@/lib/validators";
import {
  MATCH_TYPES,
  MODERATION_ACTIONS,
  MODERATION_CATEGORIES,
  SEVERITIES,
} from "@/lib/constants";
import type { ModerationWord } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ModerationWord;
  onSubmit: (input: ModerationWordInput) => void;
  loading?: boolean;
}

export function ModerationWordForm({ open, onOpenChange, initial, onSubmit, loading }: Props) {
  const { t } = useT();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ModerationWordInput>({
    resolver: zodResolver(moderationWordSchema) as Resolver<ModerationWordInput>,
    defaultValues: {
      term: initial?.term ?? "",
      language: initial?.language ?? "",
      category: initial?.category ?? "spam",
      severity: initial?.severity ?? "medium",
      match_type: initial?.match_type ?? "contains",
      action: initial?.action ?? "needs_review",
      is_active: initial?.is_active ?? true,
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? t("admin.wordEdit") : t("admin.wordCreate")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="term">{t("admin.wordTerm")}</Label>
            <Input id="term" invalid={!!errors.term} {...register("term")} />
            <FieldError message={errors.term?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="language">{t("admin.wordLanguage")}</Label>
              <Input id="language" placeholder={t("admin.wordLanguagePlaceholder")} {...register("language")} />
            </div>
            <div>
              <Label htmlFor="match_type">{t("admin.wordMatchType")}</Label>
              <Select id="match_type" {...register("match_type")}>
                {MATCH_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{t(`matchType.${m.value}`)}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">{t("admin.wordCategory")}</Label>
              <Select id="category" {...register("category")}>
                {MODERATION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{t(`moderationCategory.${c.value}`)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">{t("admin.wordSeverity")}</Label>
              <Select id="severity" {...register("severity")}>
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>{t(`severity.${s.value}`)}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="action">{t("admin.wordAction")}</Label>
            <Select id="action" {...register("action")}>
              {MODERATION_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{t(`moderationAction.${a.value}`)}</option>
              ))}
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("is_active")} className="h-4 w-4" />
            {t("admin.wordActive")}
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" loading={loading}>{initial ? t("admin.wordSubmitEdit") : t("admin.wordSubmitCreate")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
