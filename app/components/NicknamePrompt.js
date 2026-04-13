"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { safeLS } from "@/app/lib/utils";
import { trackEvent } from "./Analytics";
import { useGlobalStats } from "./ClientWrapper";

const DISMISS_KEY = "c_nickname_prompt_dismissed";
const BATTLES_KEY = "c_battles_played";

// Detect auto-generated nicknames (JUCATORXXXX, ИГРАЧXXXX, ΠΑΙΚΤΗΣXXXX, PLAYERXXXX)
function isAutoNickname(name) {
  if (!name) return false;
  return /^(JUCATOR|ИГРАЧ|ΠΑΙΚΤΗΣ|PLAYER)[A-Z0-9]{3,6}$/i.test(name.trim());
}

export default function NicknamePrompt() {
  const { nume, setNume, isHydrated } = useGlobalStats();
  const [visible, setVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Increment battle counter când se întâmplă un battle event
  useEffect(() => {
    if (!isHydrated) return;
    const onBattle = () => {
      const count = parseInt(safeLS.get(BATTLES_KEY) || "0") + 1;
      safeLS.set(BATTLES_KEY, String(count));
      // După prima ciocnire cu nickname auto → arată prompt
      if (count === 1 && isAutoNickname(nume) && !safeLS.get(DISMISS_KEY)) {
        setTimeout(() => {
          setVisible(true);
          try { trackEvent("nickname-prompt-shown"); } catch {}
        }, 1500);
      }
    };
    window.addEventListener("ciocnim:battle", onBattle);
    return () => window.removeEventListener("ciocnim:battle", onBattle);
  }, [nume, isHydrated]);

  const save = async () => {
    const clean = newName.trim().toUpperCase();
    if (clean.length < 2 || clean.length > 20) {
      setError("2-20 caractere");
      return;
    }
    setSaving(true);
    setError("");
    const ok = await setNume(clean);
    setSaving(false);
    if (ok) {
      try { trackEvent("nickname-prompt-accepted", { nickname: clean }); } catch {}
      try { trackEvent("nickname-set", { nickname: clean }); } catch {}
      setVisible(false);
    } else {
      setError("Nume deja luat, alege altul");
    }
  };

  const dismiss = () => {
    safeLS.set(DISMISS_KEY, "1");
    setVisible(false);
    try { trackEvent("nickname-prompt-dismissed"); } catch {}
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1300] flex items-center justify-center p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-card border border-red-700/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🎭</div>
              <h2 className="text-xl font-black text-heading mb-1">Alege-ți porecla!</h2>
              <p className="text-xs text-dim leading-snug">
                Acum joci ca <strong className="text-red-400">{nume}</strong> — dar poți avea o poreclă memorabilă în clasament.
              </p>
            </div>

            <input
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="Porecla ta..."
              maxLength={20}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              name="nickname-custom"
              className="w-full px-4 py-3 bg-elevated border-2 border-edge-strong rounded-2xl text-body font-bold outline-none focus:border-red-600 transition-all text-center"
            />
            {error && <p className="text-xs text-red-400 text-center mt-2 font-bold">{error}</p>}

            <div className="flex gap-2 mt-4">
              <button
                onClick={dismiss}
                className="flex-1 py-3 bg-elevated hover:bg-elevated-hover text-dim hover:text-body rounded-2xl font-bold text-sm transition-all"
              >
                Mai târziu
              </button>
              <button
                onClick={save}
                disabled={saving || !newName.trim()}
                className="flex-[2] py-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-red-900/40"
              >
                {saving ? "..." : "💾 Salvează porecla"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
