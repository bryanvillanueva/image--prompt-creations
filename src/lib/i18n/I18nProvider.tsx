"use client";
import * as React from "react";
import { LOCALES, tFor, type Locale } from "./messages";

const STORAGE_KEY = "promptlib.locale";
const DEFAULT_LOCALE: Locale = "es";

export type TFn = (key: string, params?: Record<string, string | number>) => string;

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TFn;
}

const I18nContext = React.createContext<Ctx | null>(null);

let currentLocale: Locale = DEFAULT_LOCALE;

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "es" || v === "en") return v;
  }
  return currentLocale;
}

export function tNow(key: string, params?: Record<string, string | number>): string {
  return tFor(getLocale(), key, params);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") {
      setLocaleState(stored);
      currentLocale = stored;
    } else if (typeof navigator !== "undefined") {
      const nav = navigator.language?.toLowerCase() ?? "";
      if (nav.startsWith("en")) {
        setLocaleState("en");
        currentLocale = "en";
      }
    }
  }, []);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = React.useCallback((l: Locale) => {
    if (!LOCALES.includes(l)) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
    currentLocale = l;
    setLocaleState(l);
  }, []);

  const t = React.useCallback<TFn>(
    (key, params) => tFor(locale, key, params),
    [locale],
  );

  const value = React.useMemo<Ctx>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): Ctx {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx;
}
