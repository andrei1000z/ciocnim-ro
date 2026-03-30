"use client";

import { useState, useSyncExternalStore } from "react";
import { safeLS } from "@/app/lib/utils";

const emptySubscribe = () => () => {};

function readThemeFromDOM() {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export default function ThemeToggle() {
  // isClient: false on server/hydration, true after mount — prevents hydration mismatch
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  // Read theme directly from the DOM class set by the inline <head> script.
  // This is always in sync: no useEffect needed, no flash.
  const domTheme = useSyncExternalStore(emptySubscribe, readThemeFromDOM, () => "dark");
  const [theme, setTheme] = useState(null);

  // After client mount, sync state from DOM once
  const activeTheme = theme ?? (isClient ? domTheme : "dark");

  const toggle = () => {
    const next = activeTheme === "dark" ? "light" : "dark";
    setTheme(next);
    safeLS.set("c_theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  if (!isClient) return null;

  const isLight = activeTheme === "light";

  return (
    <button
      onClick={toggle}
      tabIndex={0}
      className={`fixed bottom-4 left-4 md:top-4 md:left-auto md:right-4 md:bottom-auto z-[900] w-10 h-10 flex items-center justify-center rounded-full text-lg transition-all active:scale-90 backdrop-blur-sm shadow-lg border border-edge-strong focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-transparent ${
        isLight
          ? "bg-surface hover:bg-surface-hover"
          : "bg-elevated hover:bg-elevated-hover"
      }`}
      aria-label={isLight ? "Activează modul întunecat" : "Activează modul luminos"}
      title={isLight ? "Mod întunecat" : "Mod luminos"}
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}
