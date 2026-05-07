interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-fg)] mt-1">{message}</p>;
}
