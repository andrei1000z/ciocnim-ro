"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

const safeLS = {
  get: (key) => { try { return typeof window !== "undefined" ? localStorage.getItem(key) : null; } catch { return null; } },
  set: (key, val) => { try { if (typeof window !== "undefined") localStorage.setItem(key, val); } catch {} },
};

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return safeLS.get("c_theme") || "light";
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
      className={`fixed top-4 right-4 z-[9999] w-10 h-10 flex items-center justify-center rounded-full text-lg transition-all active:scale-90 backdrop-blur-sm shadow-lg border ${
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
