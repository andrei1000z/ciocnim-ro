"use client";

import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { safeCopy } from "../lib/utils";
import { getSiteUrl } from "../lib/constants";
import { useT } from "@/app/i18n/useT";
import { useLocaleConfig } from "./DictionaryProvider";

const DualLeaderboard = ({ topRegiuni, topPlayers, myName, myScore }) => {
  const [view, setView] = useState("jucatori");
  const t = useT();
  const { locale } = useLocaleConfig();

  const maxRegionScore = useMemo(() => {
    if (!topRegiuni || topRegiuni.length === 0) return 1;
    return Math.max(...topRegiuni.map(r => parseInt(r.scor) || 0), 1);
  }, [topRegiuni]);

  const { myRank, winsNeeded, targetRank } = useMemo(() => {
    if (!topPlayers || !myName || myName.trim() === "") return { myRank: null, winsNeeded: 0, targetRank: null };
    const clean = myName.trim().toUpperCase();
    const idx = topPlayers.findIndex(p => p.nume === clean);
    const myScoreNum = parseInt(myScore) || 0;

    if (idx !== -1) {
      if (idx === 0) return { myRank: 1, winsNeeded: 0, targetRank: 1 };
      const myServerScore = parseInt(topPlayers[idx].scor) || 0;
      let targetIdx = idx - 1;
      while (targetIdx > 0 && (parseInt(topPlayers[targetIdx].scor) || 0) <= myServerScore) {
        targetIdx--;
      }
      const targetScore = parseInt(topPlayers[targetIdx].scor) || 0;
      // If score is equal, player needs 1 win to overtake; if already higher, show 1 minimum
      const wins = Math.max(1, targetScore - myServerScore + 1);
      return { myRank: idx + 1, winsNeeded: wins, targetRank: targetIdx + 1 };
    }

    const n = topPlayers.length;
    if (n === 0) return { myRank: null, winsNeeded: 1, targetRank: 1 };
    const lastScore = parseInt(topPlayers[n - 1].scor) || 0;
    const wins = Math.max(1, lastScore - myScoreNum + 1);
    return { myRank: null, winsNeeded: wins, targetRank: n };
  }, [topPlayers, myName, myScore]);

  const medals = ["🥇", "🥈", "🥉"];

  const victLabel = winsNeeded === 1 ? t('leaderboard.victory') : t('leaderboard.victories');

  return (
    <div className="rounded-2xl overflow-hidden border border-edge bg-card shadow-lg shadow-black/20">
      <div className="flex">
        {[["jucatori", t('leaderboard.players')], ["regiuni", t('leaderboard.regions')]].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
              view === v ? "bg-red-700 text-white" : "text-dim hover:text-red-400 hover:bg-elevated"
            } ${v === "regiuni" ? "border-l border-edge" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="p-5">
        <AnimatePresence mode="wait">
          {view === "jucatori" ? (
            <motion.div key="j" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-1.5">
              {topPlayers && topPlayers.length > 0 ? (
                <>
                  {topPlayers.slice(0, 10).map((p, i) => (
                    <div key={i} className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-all ${p.nume === myName?.toUpperCase().trim() ? "bg-amber-900/20 border border-amber-700/30" : "hover:bg-elevated"}`}>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-base w-6 text-center flex-shrink-0">{medals[i] || `${i + 1}.`}</span>
                        <span className="font-bold text-body text-sm truncate">{p.nume}</span>
                      </div>
                      <span className="font-bold text-red-400 text-sm flex-shrink-0 whitespace-nowrap">{parseInt(p.scor) || 0} 🏆</span>
                    </div>
                  ))}
                  {myName && (myRank !== null || targetRank !== null) && (
                    <div className="mt-3 pt-3 border-t border-red-900/8">
                      <p className="text-center text-xs font-semibold text-red-400">
                        {myRank === 1
                          ? t('leaderboard.champion')
                          : myRank !== null
                            ? t('leaderboard.rank', { rank: myRank, needed: winsNeeded, victLabel, target: targetRank })
                            : t('leaderboard.needWins', { needed: winsNeeded, victLabel, target: targetRank })}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-dim text-sm py-8">{t('leaderboard.noPlayers')}</p>
              )}
            </motion.div>
          ) : (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
              {topRegiuni && topRegiuni.length > 0 ? (
                topRegiuni.map((reg, i) => (
                  <div key={reg.regiune} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-body">{medals[i] || `${i + 1}.`} {reg.regiune}</span>
                      <span className="font-bold text-red-400">{parseInt(reg.scor) || 0} 🏆</span>
                    </div>
                    <div className="w-full bg-red-900/30 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(parseInt(reg.scor || 0) / maxRegionScore) * 100}%` }}
                        transition={{ duration: 0.9, delay: i * 0.06, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-dim text-sm py-8">{t('leaderboard.noRegions')}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {myName && (
          <button
            onClick={() => {
              const text = myRank === 1
                ? t('leaderboard.shareChampion')
                : myRank !== null
                  ? t('leaderboard.shareRank', { rank: myRank })
                  : t('leaderboard.shareGeneric');
              if (navigator.share) {
                navigator.share({ title: t('seo.siteName'), text, url: `${getSiteUrl(locale)}/${locale}` }).catch(() => {});
              } else {
                safeCopy(`${text}\n${getSiteUrl(locale)}/${locale}`);
              }
            }}
            className="w-full mt-3 py-2.5 border-t border-red-900/8 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-elevated transition-all flex items-center justify-center gap-2 rounded-b-xl"
          >
            {t('leaderboard.shareBtn')}
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(DualLeaderboard);
