"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { localeConfig } from "@/app/i18n/config";
import { useLocaleConfig } from "./DictionaryProvider";
import { useT } from "@/app/i18n/useT";

export default function LanguageSwitcher() {
  const { locale } = useLocaleConfig();
  const t = useT();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [isIntl, setIsIntl] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsIntl(window.location.host.includes("trosc.fun"));
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ciocnim.ro = doar RO (niciun selector). trosc.fun = doar BG și EL.
  const visibleLocales = useMemo(() => {
    return isIntl ? ["bg", "el"] : [];
  }, [isIntl]);

  const switchLocale = (newLocale) => {
    const pathWithoutLocale = pathname.replace(/^\/(ro|bg|el)/, "");
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
    setOpen(false);
  };

  // Render NIMIC pe server și primul render client → zero hydration mismatch
  if (!mounted) return null;

  // Pe ciocnim.ro NU arătăm selectorul deloc — site-ul e monolingv RO
  if (!isIntl) return null;

  const current = localeConfig[locale];

  return (
    <div className="fixed bottom-4 left-16 z-50" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-card border border-edge rounded-xl px-3 py-2 text-xs font-bold text-body cursor-pointer flex items-center gap-1.5 hover:bg-elevated transition-colors"
        aria-label={t("languageSwitcher.selectLanguage")}
      >
        <span>{current.flag}</span>
        <span>{current.name}</span>
        <span className="text-[10px] text-muted">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-surface border border-edge rounded-xl shadow-2xl shadow-black/40 overflow-hidden min-w-[140px]">
          {visibleLocales.map(l => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`w-full px-4 py-2.5 text-left text-sm font-bold flex items-center gap-2 transition-colors ${l === locale ? "bg-red-800 text-white" : "text-body hover:bg-red-800 hover:text-white"}`}
            >
              <span>{localeConfig[l].flag}</span>
              <span>{localeConfig[l].name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
