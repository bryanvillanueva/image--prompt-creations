"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Search, Plus, LogOut, User, Library, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useAuth } from "@/lib/auth/AuthContext";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

export function NavBar() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const initialQuery = params.get("q") ?? "";
  const [q, setQ] = React.useState(initialQuery);
  React.useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  const isStaff = role === "admin" || role === "moderator";

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-border">
      <div className="container-app flex h-14 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight shrink-0">
          <Sparkles className="h-5 w-5" />
          <span>Promptlib</span>
        </Link>

        <form onSubmit={onSearchSubmit} className="hidden md:flex flex-1 max-w-md items-center relative">
          <Search className="absolute left-3 h-4 w-4 text-[var(--color-fg-placeholder)]" />
          <Input
            type="search"
            placeholder="Buscar prompts…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </form>

        <nav className="hidden md:flex items-center gap-1 ml-auto">
          <Link
            href="/"
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[var(--color-bg-subtle)]",
              pathname === "/" && "text-[var(--color-fg)]",
            )}
          >
            Explorar
          </Link>
          {isAuthenticated && (
            <Link href="/prompts/new">
              <Button size="sm" variant="primary">
                <Plus className="h-4 w-4" />
                Subir prompt
              </Button>
            </Link>
          )}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 rounded-full transition-shadow hover:shadow-ring-light"
                  aria-label="Menú de usuario"
                >
                  <Avatar src={user?.avatar_url} name={user?.name} size={32} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="font-medium text-[var(--color-fg)]">{user?.name}</div>
                  <div className="text-xs flex items-center gap-2">
                    <span>@{user?.username}</span>
                    {role && (
                      <span
                        className={cn(
                          "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
                          role === "admin" || role === "moderator"
                            ? "bg-[var(--color-fg)] text-white"
                            : "bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)]",
                        )}
                      >
                        {role}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/u/${user?.username}`}>
                    <User className="h-4 w-4" /> Mi perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/me/prompts">
                    <Library className="h-4 w-4" /> Mis prompts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/me/saved">
                    <Library className="h-4 w-4" /> Guardados
                  </Link>
                </DropdownMenuItem>
                {isStaff && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/pending">
                        <Shield className="h-4 w-4" /> Panel admin
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout()}>
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </nav>

        <button
          className="md:hidden ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-[var(--color-bg-subtle)]"
          aria-label="Abrir menú"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white animate-fade-in">
          <div className="container-app py-4 flex flex-col gap-3">
            <form onSubmit={onSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-fg-placeholder)]" />
              <Input
                type="search"
                placeholder="Buscar prompts…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </form>
            <Link href="/" className="px-3 py-2 rounded-md hover:bg-[var(--color-bg-subtle)]" onClick={() => setMobileOpen(false)}>
              Explorar
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/prompts/new" className="px-3 py-2 rounded-md hover:bg-[var(--color-bg-subtle)]" onClick={() => setMobileOpen(false)}>
                  Subir prompt
                </Link>
                <Link href="/me/prompts" className="px-3 py-2 rounded-md hover:bg-[var(--color-bg-subtle)]" onClick={() => setMobileOpen(false)}>
                  Mis prompts
                </Link>
                <Link href="/me/saved" className="px-3 py-2 rounded-md hover:bg-[var(--color-bg-subtle)]" onClick={() => setMobileOpen(false)}>
                  Guardados
                </Link>
                {isStaff && (
                  <Link href="/admin/pending" className="px-3 py-2 rounded-md hover:bg-[var(--color-bg-subtle)]" onClick={() => setMobileOpen(false)}>
                    Panel admin
                  </Link>
                )}
                <button onClick={() => { setMobileOpen(false); logout(); }} className="text-left px-3 py-2 rounded-md hover:bg-[var(--color-bg-subtle)]">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="md" variant="secondary" className="w-full">Iniciar sesión</Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="md" variant="primary" className="w-full">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
