"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LocaleLink from "../../components/LocaleLink";
import { useGlobalStats } from "../../components/ClientWrapper";
import PageHeader from "../../components/PageHeader";
import { getAchievements } from "../../lib/achievements";
import { useT } from "../../i18n/useT";
import { useDictionary, useLocaleConfig } from "../../components/DictionaryProvider";
import { esteNumeInterzis } from "../../lib/profanityFilter";

const RARITY_COLORS = {
  common: 'border-gray-600/30 bg-gray-900/20',
  uncommon: 'border-green-600/30 bg-green-900/20',
  rare: 'border-blue-600/30 bg-blue-900/20',
  epic: 'border-purple-600/30 bg-purple-900/20',
  legendary: 'border-amber-500/30 bg-amber-900/20',
};

const RARITY_TEXT = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

export default function ProfilPage() {
  const { nume, setNume, userStats, isHydrated } = useGlobalStats();
  const [achievements, setAchievements] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const t = useT();
  const dict = useDictionary();
  const { locale } = useLocaleConfig();
  const ALL_ACHIEVEMENTS = getAchievements(dict);

  const RARITY_LABELS = {
    common: t('content.profil.rarityCommon'),
    uncommon: t('content.profil.rarityUncommon'),
    rare: t('content.profil.rarityRare'),
    epic: t('content.profil.rarityEpic'),
    legendary: t('content.profil.rarityLegendary'),
  };

  useEffect(() => {
    if (!isHydrated || !nume) return;
    const fetchData = async () => {
      try {
        const [achRes, histRes] = await Promise.all([
          fetch('/api/ciocnire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actiune: 'get-achievements', jucator: nume, locale })
          }).then(r => r.json()),
          fetch('/api/ciocnire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actiune: 'get-history', jucator: nume, locale })
          }).then(r => r.json()),
        ]);
        if (achRes.success) setAchievements(achRes.achievements || []);
        if (histRes.success) setHistory(histRes.history || []);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [isHydrated, nume, locale]);

  const handleSaveName = async () => {
    const clean = newName.trim().toUpperCase();
    if (clean.length < 3 || clean.length > 21) {
      setNameError(t('notifications.nameMinChars'));
      return;
    }
    if (esteNumeInterzis(clean)) {
      setNameError(t('notifications.badNameJoke'));
      return;
    }
    if (clean === nume) { setEditingName(false); return; }
    setSavingName(true);
    setNameError("");
    const ok = await setNume(clean);
    setSavingName(false);
    if (ok) {
      setEditingName(false);
      setNewName("");
    } else {
      setNameError(t('notifications.nameTaken'));
    }
  };

  const formatTimeAgo = (ts) => {
    const diffMs = Date.now() - ts;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return t('content.profil.justNow');
    if (mins < 60) return t('content.profil.minutesAgo', { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('content.profil.hoursAgo', { n: hours });
    const days = Math.floor(hours / 24);
    return t('content.profil.daysAgo', { n: days });
  };

  if (!isHydrated) return null;

  const earnedKeys = new Set(achievements.map(a => a.key));
  const wins = parseInt(userStats.wins) || 0;
  const losses = parseInt(userStats.losses) || 0;
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="bg-main text-body">
      <PageHeader />

      <div className="w-full max-w-2xl mx-auto pt-6 pb-12 px-6 space-y-6">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/10 mb-2 shadow-lg">
            <span className="text-4xl">🥚</span>
          </div>
          {editingName ? (
            <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
              <div className="flex gap-2 w-full">
                <input
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNameError(""); }}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  placeholder={t('content.profil.newNamePlaceholder')}
                  maxLength={21}
                  autoFocus
                  className="flex-1 min-w-0 px-3 py-2.5 border border-edge-strong rounded-xl font-bold text-body text-base outline-none focus:border-red-800 bg-elevated"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="px-4 py-2.5 bg-red-800 text-white rounded-xl font-bold text-sm hover:bg-red-900 transition-all disabled:opacity-50"
                >
                  {savingName ? "…" : t('content.profil.saveName')}
                </button>
                <button
                  onClick={() => { setEditingName(false); setNewName(""); setNameError(""); }}
                  className="px-3 py-2.5 bg-elevated-hover text-dim rounded-xl font-bold text-sm hover:bg-overlay transition-all"
                >
                  ✕
                </button>
              </div>
              {nameError && <p className="text-xs text-red-400 font-medium">{nameError}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-black text-heading">
                {nume || t('content.profil.noName')}
              </h1>
              {nume && (
                <button
                  onClick={() => { setNewName(nume); setEditingName(true); }}
                  className="text-sm text-muted hover:text-red-400 transition-colors"
                  aria-label={t('content.profil.editName')}
                  title={t('content.profil.editName')}
                >
                  ✏️
                </button>
              )}
            </div>
          )}
          {userStats.regiune && userStats.regiune !== "Alege regiunea..." && locale !== 'en' && (
            <p className="text-sm font-bold text-red-400">{userStats.regiune}</p>
          )}
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-green-900/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-green-400">{wins}</p>
            <p className="text-xs font-bold text-green-500 uppercase tracking-wide mt-1">{t('content.profil.victories')}</p>
          </div>
          <div className="bg-card border border-red-900/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-red-400">{losses}</p>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wide mt-1">{t('content.profil.defeats')}</p>
          </div>
          <div className="bg-card border border-amber-900/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-amber-400">{winRate}%</p>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mt-1">{t('content.profil.winRate')}</p>
          </div>
        </div>

        {/* Win Rate Bar */}
        {total > 0 && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-green-400">{wins} W</span>
              <span className="text-muted">{total} total</span>
              <span className="text-red-400">{losses} L</span>
            </div>
            <div className="w-full h-3 bg-red-900/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Match History */}
        {nume && (
          <section>
            <h2 className="text-xl font-black text-heading mb-4 flex items-center gap-2">
              <span>📜</span> {t('content.profil.history')}
            </h2>
            {loading ? (
              <div className="text-center py-6">
                <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : history.length === 0 ? (
              <div className="bg-card border border-edge rounded-2xl p-6 text-center">
                <p className="text-dim text-sm">{t('content.profil.noHistory')}</p>
              </div>
            ) : (
              <div className="bg-card border border-edge rounded-2xl overflow-hidden divide-y divide-edge">
                {history.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full ${m.win ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="min-w-0">
                        <p className="font-bold text-body text-sm truncate">
                          {t('content.profil.vs')} <span className="text-heading">{m.opponent}</span>
                        </p>
                        <p className="text-xs text-muted">{formatTimeAgo(m.t)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-wide flex-shrink-0 ${m.win ? 'text-green-400' : 'text-red-400'}`}>
                      {m.win ? t('content.profil.winLabel') : t('content.profil.lossLabel')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Achievements */}
        <section>
          <h2 className="text-xl font-black text-heading mb-4 flex items-center gap-2">
            <span>🏅</span> {t('content.profil.achievements')} ({t('content.profil.achievementsCount', { earned: earnedKeys.size, total: Object.keys(ALL_ACHIEVEMENTS).length })})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(ALL_ACHIEVEMENTS).map(([key, ach]) => {
                const earned = earnedKeys.has(key);
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 transition-all ${
                      earned
                        ? RARITY_COLORS[ach.rarity]
                        : 'border-edge bg-card opacity-40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-2xl ${earned ? '' : 'grayscale'}`}>{ach.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${earned ? 'text-heading' : 'text-muted'}`}>{ach.name}</p>
                        <p className="text-xs text-muted mt-0.5">{ach.desc}</p>
                        <span className={`text-xs font-black uppercase tracking-wider ${RARITY_TEXT[ach.rarity]}`}>
                          {RARITY_LABELS[ach.rarity]}
                        </span>
                      </div>
                      {earned && (
                        <span className="text-green-400 text-sm flex-shrink-0">✓</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {!nume && (
          <div className="text-center bg-red-900/10 border border-red-900/20 rounded-2xl p-6">
            <p className="text-dim text-sm mb-3">{t('content.profil.setNameFirst')}</p>
            <LocaleLink href="/" className="inline-block bg-red-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all">
              {t('content.despre.ctaOnline')}
            </LocaleLink>
          </div>
        )}
      </div>
    </div>
  );
}
