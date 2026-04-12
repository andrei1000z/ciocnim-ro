"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LocaleLink from "../../components/LocaleLink";
import PageHeader from "../../components/PageHeader";
import { useGlobalStats } from "../../components/ClientWrapper";
import { safeCopy } from "../../lib/utils";
import { getCurrentSeason } from "../../lib/seasons";
import { useT } from "../../i18n/useT";
import { useLocaleConfig } from "../../components/DictionaryProvider";
import { getSiteUrl } from "../../lib/constants";

const medals = ["🥇", "🥈", "🥉"];

function PlayerRow({ player, index, isMe }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isMe
          ? "bg-amber-900/20 border border-amber-700/30 shadow-lg shadow-amber-900/10"
          : "hover:bg-elevated"
      }`}
    >
      <span className="text-lg w-8 text-center flex-shrink-0 font-black">
        {medals[index] || <span className="text-dim text-sm">{index + 1}</span>}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm truncate ${isMe ? "text-amber-300" : "text-body"}`}>
          {player.nume}
        </p>
        {player.regiune && (
          <p className="text-[10px] text-muted font-medium truncate">{player.regiune}</p>
        )}
      </div>
      <span className="font-black text-red-400 text-sm flex-shrink-0">
        {parseInt(player.scor) || 0}
      </span>
    </motion.div>
  );
}

function RegionRow({ region, index, maxScore }) {
  const score = parseInt(region.scor) || 0;
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="space-y-2 px-4 py-3 rounded-xl hover:bg-elevated transition-all"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <span className="text-lg w-8 text-center flex-shrink-0 font-black">
            {medals[index] || <span className="text-dim text-sm">{index + 1}</span>}
          </span>
          <span className="font-bold text-body text-sm">{region.regiune}</span>
        </div>
        <span className="font-black text-red-400 text-sm">{score}</span>
      </div>
      <div className="w-full bg-red-900/20 rounded-full h-2 overflow-hidden ml-10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: index * 0.04, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full"
        />
      </div>
    </motion.div>
  );
}

export default function ClasamentPage() {
  const { topRegiuni, topJucatori, nume, userStats, isHydrated } = useGlobalStats();
  const [tab, setTab] = useState("jucatori");
  const t = useT();
  const { locale } = useLocaleConfig();
  const season = getCurrentSeason(locale);

  const TABS = [
    { key: "jucatori", label: t('content.clasament.players'), icon: "🏆" },
    { key: "regiuni", label: t('content.clasament.regions'), icon: "🗺️" },
  ];

  const maxRegionScore = useMemo(() => {
    if (!topRegiuni || topRegiuni.length === 0) return 1;
    return Math.max(...topRegiuni.map(r => parseInt(r.scor) || 0), 1);
  }, [topRegiuni]);

  const myRank = useMemo(() => {
    if (!topJucatori || !nume) return null;
    const clean = nume.trim().toUpperCase();
    const idx = topJucatori.findIndex(p => p.nume === clean);
    return idx !== -1 ? idx + 1 : null;
  }, [topJucatori, nume]);

  const shareRanking = () => {
    const text = myRank
      ? t('content.clasament.shareText', { rank: myRank })
      : t('leaderboard.shareGeneric');
    if (navigator.share) {
      navigator.share({ title: t('seo.siteName'), text, url: `${getSiteUrl(locale)}/${locale}/clasament` }).catch(() => {});
    } else {
      safeCopy(`${text}\n${getSiteUrl(locale)}/${locale}/clasament`);
    }
  };

  return (
    <main className="min-h-screen bg-main text-body">
      <PageHeader />

      <div className="w-full max-w-2xl mx-auto pt-8 pb-16 px-6 space-y-6">
        <header className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-heading">
            {t('content.clasament.pageTitle')} <span className="text-red-500">{t('content.clasament.pageHighlight')}</span>
          </h1>
          <p className="text-dim font-bold text-sm">
            {t('content.clasament.pageSubtitle')}
          </p>
        </header>

        {/* Season banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 border text-center ${
            season.isActive
              ? "bg-gradient-to-r from-red-900/30 to-amber-900/20 border-red-700/30"
              : "bg-card border-edge"
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
            {season.isActive ? `🔴 ${t('content.clasament.season')}` : `📅 ${t('content.clasament.season')}`}
          </p>
          <p className="text-lg font-black text-heading">{season.name}</p>
          <p className="text-xs text-dim mt-0.5">{season.label}</p>
        </motion.div>

        {/* My rank banner */}
        {isHydrated && nume && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-900/20 to-red-900/20 border border-amber-700/20 rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t('content.clasament.myStats')}</p>
              <p className="text-2xl font-black text-heading">
                {myRank ? `#${myRank}` : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-dim">{nume}</p>
              <p className="text-lg font-black text-red-400">{userStats.wins || 0} {t('content.clasament.wins')}</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex rounded-2xl overflow-hidden border border-edge bg-card">
          {TABS.map(tb => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                tab === tb.key
                  ? "bg-red-700 text-white"
                  : "text-dim hover:text-red-400 hover:bg-elevated"
              }`}
            >
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-card border border-edge rounded-2xl overflow-hidden shadow-lg shadow-black/20 min-h-[300px]">
          <AnimatePresence mode="wait">
            {tab === "jucatori" ? (
              <motion.div
                key="j"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="divide-y divide-edge"
              >
                {topJucatori && topJucatori.length > 0 ? (
                  topJucatori.map((p, i) => (
                    <PlayerRow
                      key={i}
                      player={p}
                      index={i}
                      isMe={p.nume === nume?.trim().toUpperCase()}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-5xl mb-3">🥚</span>
                    <p className="text-dim text-sm font-bold">{t('content.clasament.noData')}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="r"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-2"
              >
                {topRegiuni && topRegiuni.length > 0 ? (
                  topRegiuni.map((r, i) => (
                    <RegionRow
                      key={r.regiune}
                      region={r}
                      index={i}
                      maxScore={maxRegionScore}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-5xl mb-3">🗺️</span>
                    <p className="text-dim text-sm font-bold">{t('content.clasament.noData')}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Share */}
        <button
          onClick={shareRanking}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-red-900/30 bg-red-900/10 hover:bg-red-900/20 hover:border-red-800/50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <span className="text-xl">📲</span>
          <span className="font-black text-red-400 text-sm">{t('content.clasament.share')}</span>
        </button>

        {/* CTA */}
        <div className="text-center">
          <LocaleLink
            href="/"
            className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg"
          >
            {t('content.despre.ctaOnline')}
          </LocaleLink>
        </div>
      </div>
    </main>
  );
}
