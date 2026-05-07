"use client";
import * as React from "react";
import { Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { reportSchema, type ReportInput } from "@/lib/validators";
import { REPORT_REASONS } from "@/lib/constants";
import { promptsApi } from "@/lib/api/prompts";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { useT } from "@/lib/i18n/I18nProvider";

export function ReportDialog({ promptId, slug }: { promptId: number; slug: string }) {
  const [open, setOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useT();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: "spam", description: "" },
  });

  const mutation = useMutation({
    mutationFn: (input: ReportInput) =>
      promptsApi.report(promptId, { reason: input.reason, description: input.description || undefined }),
    onSuccess: () => {
      toast.success(t("reportDialog.success"));
      setOpen(false);
      reset();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/prompts/${slug}`)}`);
      } else if (err instanceof ApiError) {
        toast.error(err.message);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={(e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              router.push(`/login?next=${encodeURIComponent(`/prompts/${slug}`)}`);
            }
          }}
        >
          <Flag className="h-4 w-4" /> {t("reportDialog.trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reportDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("reportDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <Label htmlFor="reason">{t("reportDialog.reasonLabel")}</Label>
            <Select id="reason" invalid={!!errors.reason} {...register("reason")}>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{t(`reportReason.${r.value}`)}</option>
              ))}
            </Select>
            <FieldError message={errors.reason?.message} />
          </div>
          <div>
            <Label htmlFor="description">{t("reportDialog.descriptionLabel")}</Label>
            <Textarea id="description" rows={4} invalid={!!errors.description} {...register("description")} />
            <FieldError message={errors.description?.message} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
            <Button type="submit" loading={mutation.isPending}>{t("reportDialog.submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
