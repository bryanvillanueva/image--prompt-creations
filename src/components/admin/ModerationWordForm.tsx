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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ModerationWord;
  onSubmit: (input: ModerationWordInput) => void;
  loading?: boolean;
}

export function ModerationWordForm({ open, onOpenChange, initial, onSubmit, loading }: Props) {
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
          <DialogTitle>{initial ? "Editar regla" : "Nueva regla"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="term">Término *</Label>
            <Input id="term" invalid={!!errors.term} {...register("term")} />
            <FieldError message={errors.term?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="language">Idioma</Label>
              <Input id="language" placeholder="es, en…" {...register("language")} />
            </div>
            <div>
              <Label htmlFor="match_type">Tipo de match</Label>
              <Select id="match_type" {...register("match_type")}>
                {MATCH_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select id="category" {...register("category")}>
                {MODERATION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severidad</Label>
              <Select id="severity" {...register("severity")}>
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="action">Acción</Label>
            <Select id="action" {...register("action")}>
              {MODERATION_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("is_active")} className="h-4 w-4" />
            Activa
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" loading={loading}>{initial ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
