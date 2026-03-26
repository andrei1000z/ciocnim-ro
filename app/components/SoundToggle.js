"use client";

import { useState, useEffect } from "react";
import { isSoundEnabled, toggleSound, playClick } from "../lib/sounds";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnabled(isSoundEnabled());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => {
        const next = toggleSound();
        setEnabled(next);
        if (next) playClick();
      }}
      className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full bg-card border border-edge shadow-lg flex items-center justify-center text-sm hover:bg-elevated transition-all active:scale-90"
      aria-label={enabled ? "Dezactivează sunetele" : "Activează sunetele"}
      title={enabled ? "Sunet: pornit" : "Sunet: oprit"}
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
}
