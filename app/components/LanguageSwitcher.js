"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeConfig } from "@/app/i18n/config";
import { useLocaleConfig } from "./DictionaryProvider";

export default function LanguageSwitcher() {
  const { locale } = useLocaleConfig();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLocale = (newLocale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setOpen(false);
  };

  const current = localeConfig[locale];

  return (
    <div className="fixed bottom-4 left-16 z-50" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-card border border-edge rounded-xl px-3 py-2 text-xs font-bold text-body cursor-pointer flex items-center gap-1.5 hover:bg-elevated transition-colors"
        aria-label="Selectează limba"
      >
        <span>{current.flag}</span>
        <span>{current.name}</span>
        <span className="text-[10px] text-muted">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-surface border border-edge rounded-xl shadow-2xl shadow-black/40 overflow-hidden min-w-[140px]">
          {locales.map(l => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`w-full px-4 py-2.5 text-left text-sm font-bold flex items-center gap-2 transition-colors ${l === locale ? 'bg-red-800 text-white' : 'text-body hover:bg-red-800 hover:text-white'}`}
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
