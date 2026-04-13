"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { safeLS } from "@/app/lib/utils";
import { trackEvent } from "./Analytics";

const DISMISS_KEY = "c_pwa_dismissed";
const VISIT_COUNT_KEY = "c_visit_count";
const MIN_VISITS = 2; // arată prompt-ul după a 2-a vizită

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
      // Arată banner după 8 secunde pe pagină (să nu deranjeze imediat)
      setTimeout(() => setVisible(true), 8000);
      try { trackEvent("pwa-prompt-shown"); } catch {}
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS Safari: nu există beforeinstallprompt, arată instrucțiuni manuale
    if (isIOS() && isSafari()) {
      setTimeout(() => {
        setVisible(true);
        setShowIosHint(true);
        try { trackEvent("pwa-prompt-shown"); } catch {}
      }, 8000);
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
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      try { trackEvent("pwa-install"); } catch {}
    } else {
      try { trackEvent("pwa-prompt-rejected"); } catch {}
      safeLS.set(DISMISS_KEY, String(Date.now()));
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const dismiss = () => {
    safeLS.set(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    try { trackEvent("pwa-prompt-rejected"); } catch {}
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 z-[1200] max-w-sm mx-auto"
        >
          <div className="bg-gradient-to-br from-red-900/95 via-red-800/95 to-amber-900/95 backdrop-blur-xl border border-red-500/40 rounded-2xl p-4 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl shadow-lg">
                🥚
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-white mb-0.5">Instalează Ciocnim.ro</h3>
                {showIosHint ? (
                  <p className="text-xs text-white/80 leading-snug">
                    Apasă <span className="inline-block">⎙</span> jos și alege <strong>„Add to Home Screen"</strong>
                  </p>
                ) : (
                  <p className="text-xs text-white/80 leading-snug">
                    Joacă mai rapid, fără browser. Se instalează ca aplicație.
                  </p>
                )}
              </div>
              <button
                onClick={dismiss}
                className="flex-shrink-0 text-white/60 hover:text-white text-lg leading-none"
                aria-label="Închide"
              >
                ✕
              </button>
            </div>
            {!showIosHint && (
              <button
                onClick={install}
                className="w-full mt-3 bg-white text-red-800 font-black text-sm py-2.5 rounded-xl hover:bg-red-50 transition-all active:scale-95"
              >
                📲 Instalează
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
