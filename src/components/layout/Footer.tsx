import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border)]">
      <div className="container-app py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-[var(--color-fg-muted)]">
        <div>© {new Date().getFullYear()} Promptlib. Todos los derechos reservados.</div>
        <nav className="flex items-center gap-5">
          <Link href="/rules" className="hover:text-[var(--color-fg)]">
            Reglas de comunidad
          </Link>
          <Link href="/terms" className="hover:text-[var(--color-fg)]">
            Términos
          </Link>
        </nav>
      </div>
    </footer>
  );
}
