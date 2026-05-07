import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      title="Página no encontrada"
      description="La ruta que intentas visitar no existe o fue movida."
      action={
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      }
    />
  );
}
