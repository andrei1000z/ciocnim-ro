"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { safeLS } from "@/app/lib/utils";

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const stored = safeLS.get("c_theme");
    if (stored) return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    safeLS.set("c_theme", next);
  };

  if (!isClient) return null;

  const isLight = theme === "light";

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-4 left-4 md:top-4 md:left-auto md:right-4 md:bottom-auto z-[900] w-10 h-10 flex items-center justify-center rounded-full text-lg transition-all active:scale-90 backdrop-blur-sm shadow-lg border ${
        isLight
          ? "bg-gray-100/80 hover:bg-gray-200/90 border-gray-300/50 shadow-gray-400/20"
          : "bg-white/[0.08] hover:bg-white/[0.15] border-white/[0.1]"
      }`}
      aria-label={isLight ? "Activează modul întunecat" : "Activează modul luminos"}
      title={isLight ? "Mod întunecat" : "Mod luminos"}
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}
