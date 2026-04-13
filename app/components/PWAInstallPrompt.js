"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { safeLS } from "@/app/lib/utils";
import { trackEvent } from "./Analytics";

const DISMISS_KEY = "c_pwa_dismissed";
const VISIT_COUNT_KEY = "c_visit_count";
const MIN_VISITS = 3; // arată prompt-ul după a 3-a vizită (era 2)

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator?.standalone === true;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
}

export default function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    // Nu arătăm dacă e deja instalat
    if (isStandalone()) return;

    // Nu arătăm dacă userul a dismissed recent (7 zile)
    const dismissed = safeLS.get(DISMISS_KEY);
    if (dismissed) {
      const ts = parseInt(dismissed) || 0;
      if (Date.now() - ts < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Incrementează visit count
    const count = parseInt(safeLS.get(VISIT_COUNT_KEY) || "0") + 1;
    safeLS.set(VISIT_COUNT_KEY, String(count));

    // Minimum vizite
    if (count < MIN_VISITS) return;

    // Chrome/Edge/Android: beforeinstallprompt event
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Arată banner după 5 secunde pe pagină
      setTimeout(() => {
        setVisible(true);
        try { trackEvent("pwa-banner-shown"); } catch {}
      }, 5000);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS Safari: nu există beforeinstallprompt, arată instrucțiuni manuale
    if (isIOS() && isSafari()) {
      setTimeout(() => {
        setVisible(true);
        setShowIosHint(true);
        try { trackEvent("pwa-banner-shown"); } catch {}
      }, 5000);
    }

    // Dacă user instalează, ascunde banner
    const onInstalled = () => {
      setVisible(false);
      try { trackEvent("pwa-install"); } catch {}
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    try { trackEvent("pwa-banner-install-clicked"); } catch {}
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      try { trackEvent("pwa-install"); } catch {}
    } else {
      try { trackEvent("pwa-banner-dismissed"); } catch {}
      safeLS.set(DISMISS_KEY, String(Date.now()));
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const dismiss = () => {
    safeLS.set(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    try { trackEvent("pwa-banner-dismissed"); } catch {}
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[1200] max-w-md mx-auto"
        >
          <div className="relative bg-gradient-to-br from-red-800 via-red-700 to-amber-700 border-2 border-red-400/60 rounded-3xl p-5 shadow-2xl shadow-red-900/60 overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={dismiss}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-white/70 hover:text-white text-lg leading-none bg-black/20 hover:bg-black/40 rounded-full transition-all z-10"
              aria-label="Închide"
            >
              ✕
            </button>

            <div className="relative flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-xl">
                🥚
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="text-base font-black text-white leading-tight">Instalează ca aplicație</h3>
                <p className="text-xs text-white/90 leading-tight mt-0.5">Joacă direct de pe telefon — fără browser</p>
              </div>
            </div>

            <ul className="relative text-xs text-white/95 space-y-1 mb-4 pl-1">
              <li className="flex items-center gap-2">⚡ <span>Se deschide instant, fără reclame</span></li>
              <li className="flex items-center gap-2">📱 <span>Icon pe ecran, ca o aplicație reală</span></li>
              <li className="flex items-center gap-2">🎮 <span>Joacă offline conținutul tradițional</span></li>
            </ul>

            {showIosHint ? (
              <div className="relative bg-white/15 border border-white/30 rounded-xl p-3 text-xs text-white">
                <strong>Pe iPhone:</strong> Apasă butonul <span className="inline-block font-bold">⎙ Share</span> jos și alege <strong>„Add to Home Screen"</strong>
              </div>
            ) : (
              <button
                onClick={install}
                className="relative w-full bg-white text-red-800 font-black text-base py-3 rounded-2xl hover:bg-amber-50 transition-all active:scale-95 shadow-lg"
              >
                📲 Instalează acum
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
