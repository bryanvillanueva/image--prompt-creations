"use client";
import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useT } from "@/lib/i18n/I18nProvider";

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  next?: string;
  onBack?: () => void;
  dismissible?: boolean;
}

export function LoginPromptDialog({
  open,
  onOpenChange,
  next,
  onBack,
  dismissible = true,
}: LoginPromptDialogProps) {
  const { t } = useT();
  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";

  const handleBack = () => {
    if (onBack) onBack();
    else onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton={!dismissible}
        onPointerDownOutside={dismissible ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={dismissible ? undefined : (e) => e.preventDefault()}
        onInteractOutside={dismissible ? undefined : (e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("authPrompt.title")}</DialogTitle>
          <DialogDescription>{t("authPrompt.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="ghost" onClick={handleBack} className="sm:mr-auto">
            {t("authPrompt.back")}
          </Button>
          <Link href={`/login${suffix}`} className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full">
              {t("authPrompt.signIn")}
            </Button>
          </Link>
          <Link href={`/register${suffix}`} className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">
              {t("authPrompt.signUp")}
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
