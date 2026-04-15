"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const START_EGGS = 3;

function pickRandom() {
  return Math.random() < 0.5 ? "player" : "bot";
}

export default function IntersezonBotGame() {
  const router = useRouter();
  const [playerEggs, setPlayerEggs] = useState(START_EGGS);
  const [botEggs, setBotEggs] = useState(START_EGGS);
  const [lastRound, setLastRound] = useState(null);
  const [busy, setBusy] = useState(false);
  const [gameOver, setGameOver] = useState(null);

  useEffect(() => {
    if (playerEggs === 0 || botEggs === 0) {
      setGameOver(playerEggs > 0 ? "win" : "lose");
    }
  }, [playerEggs, botEggs]);

  const ciocnește = useCallback(() => {
    if (busy || gameOver) return;
    setBusy(true);
    const winner = pickRandom();
    setLastRound(winner);
    setTimeout(() => {
      if (winner === "player") {
        setBotEggs((e) => Math.max(0, e - 1));
      } else {
        setPlayerEggs((e) => Math.max(0, e - 1));
      }
      setBusy(false);
    }, 450);
  }, [busy, gameOver]);

  const reset = useCallback(() => {
    setPlayerEggs(START_EGGS);
    setBotEggs(START_EGGS);
    setLastRound(null);
    setGameOver(null);
    setBusy(false);
  }, []);

  const renderEggs = (count, color) => (
    <div className="flex gap-2 justify-center min-h-[60px] items-center">
      <AnimatePresence>
        {Array.from({ length: count }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.25 }}
            className="text-4xl drop-shadow-lg"
            style={{ filter: `hue-rotate(${color === "red" ? 0 : 180}deg)` }}
          >
            🥚
          </motion.span>
        ))}
      </AnimatePresence>
      {count === 0 && <span className="text-2xl opacity-30">💥</span>}
    </div>
  );

  return (
    <main className="min-h-screen bg-main text-body flex flex-col">
      <div className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-dim hover:text-body font-bold transition-colors"
          >
            ← Înapoi
          </button>
          <p className="text-xs text-dim font-bold uppercase tracking-wider">
            🤖 Antrenament
          </p>
          <div className="w-12" />
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs text-dim font-black uppercase tracking-wider">Bot</p>
            {renderEggs(botEggs, "blue")}
          </div>

          <div className="text-center">
            <AnimatePresence mode="wait">
              {lastRound && !gameOver && (
                <motion.p
                  key={lastRound + playerEggs + botEggs}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-sm font-black ${lastRound === "player" ? "text-green-400" : "text-red-400"}`}
                >
                  {lastRound === "player" ? "✅ Ai câștigat runda!" : "❌ Botul a câștigat runda"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center space-y-3">
            <p className="text-xs text-dim font-black uppercase tracking-wider">Tu</p>
            {renderEggs(playerEggs, "red")}
          </div>
        </div>

        {!gameOver ? (
          <button
            onClick={ciocnește}
            disabled={busy}
            className="w-full py-5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-black text-xl rounded-2xl border-2 border-red-500/60 shadow-xl shadow-red-900/40 transition-all active:scale-95 mb-4"
          >
            🥚 CIOCNEȘTE
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mb-4"
          >
            <div
              className={`text-center rounded-2xl p-5 border-2 ${
                gameOver === "win"
                  ? "bg-gradient-to-br from-green-900/40 to-amber-900/30 border-amber-500/60"
                  : "bg-gradient-to-br from-red-900/40 to-zinc-900/30 border-red-700/60"
              }`}
            >
              <p className="text-4xl mb-2">{gameOver === "win" ? "🏆" : "💥"}</p>
              <p className="text-2xl font-black text-heading">
                {gameOver === "win" ? "Victorie!" : "Ai pierdut"}
              </p>
              <p className="text-xs text-dim mt-1">Doar antrenament — nu contează nicăieri</p>
            </div>
            <button
              onClick={reset}
              className="w-full py-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-black text-lg rounded-2xl border-2 border-red-500/60 transition-all active:scale-95"
            >
              🔄 Încă o dată
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 bg-elevated hover:bg-elevated-hover text-dim hover:text-body font-bold rounded-2xl border border-edge transition-all active:scale-95"
            >
              Înapoi acasă
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
