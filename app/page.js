"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { esteNumeInterzis, valideazaNume } from "./lib/profanityFilter";
import DualLeaderboard from "./components/DualLeaderboard";
import GroupHub from "./components/GroupHub";
import { ColorSelector, RegionSelector } from "./components/ProfileSection";
import PlayModal from "./components/PlayModal";
import EasterCountdown from "./components/EasterCountdown";
import { safeLS, safeCopy } from "./lib/utils";
import { getNextEaster } from "./lib/easterUtils";
import { requestNotificationPermission, isNotificationSupported, getNotificationStatus } from "./lib/notifications";

const fadeUp = (delay = 0, reduced = false) => reduced ? {} : ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Buton Acțiune ──────────────────────────────────────────────────────────────
const ActionButton = ({ onClick, icon, title, subtitle, loading = false }) => (
  <motion.button
    whileHover={{ scale: 1.015, x: 2 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    disabled={loading}
    className="w-full px-5 py-4 rounded-2xl border border-edge bg-card hover:bg-card-hover hover:border-red-500/20 group transition-all duration-200 flex items-center gap-4 text-left disabled:opacity-50 shadow-sm hover:shadow-xl"
  >
    <div className="w-11 h-11 rounded-xl bg-red-900/20 group-hover:bg-red-900/30 flex items-center justify-center transition-all text-xl flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-bold text-body group-hover:text-heading transition-colors text-sm leading-tight">{title}</div>
      {subtitle && <div className="text-xs text-muted group-hover:text-dim transition-colors mt-0.5">{subtitle}</div>}
    </div>
    {loading
      ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
      : <span className="text-faint group-hover:text-dim transition-colors text-sm flex-shrink-0">→</span>
    }
  </motion.button>
);

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-[0.35em] mb-3 px-0.5">{children}</p>
);

// ─── Componenta Principală ──────────────────────────────────────────────────────
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalGlobal, topRegiuni, topJucatori, nume, setNume, userStats, setUserStats, isHydrated, triggerVibrate, onlineCount, pusherRef: globalPusherRef } = useGlobalStats();
  const prefersReducedMotion = useReducedMotion();

  const [loadedTeams, setLoadedTeams] = useState([]);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [localNume, setLocalNume] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [hasInitializedName, setHasInitializedName] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinModalNume, setJoinModalNume] = useState("");
  const [toastMsg, setToastMsgRaw] = useState("");
  const toastTimer = useRef(null);
  const setToastMsg = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsgRaw(msg);
    if (msg) toastTimer.current = setTimeout(() => setToastMsgRaw(""), 3500);
  }, []);
  const [numeError, setNumeError] = useState("");
  const [isJoiningArena, setIsJoiningArena] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (nume && !hasInitializedName) { setLocalNume(nume); setHasInitializedName(true); }
  }, [nume, hasInitializedName]);

  useEffect(() => {
    if (!nume || nume.length < 3) { setAchievements([]); return; }
    (async () => {
      try {
        const r = await fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "get-achievements", jucator: nume }) });
        const d = await r.json();
        if (d.success) setAchievements(d.achievements || []);
      } catch {}
    })();
  }, [nume]);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); window.deferredPrompt = e; };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (searchParams.get("error") === "ocupata") {
      setToastMsg("Camera este ocupată! Încearcă alt cod.");
      router.replace("/");
    }
  }, [searchParams, router, setToastMsg]);

  const getStoredTeamIds = useCallback(() => {
    try { return JSON.parse(safeLS.get("c_teamIds") || "[]"); } catch { return []; }
  }, []);
  const addStoredTeamId = useCallback((id) => {
    const ids = getStoredTeamIds();
    if (!ids.includes(id)) { const n = [...ids, id]; safeLS.set("c_teamIds", JSON.stringify(n)); return n; }
    return ids;
  }, [getStoredTeamIds]);
  const removeStoredTeamId = (id) => {
    const n = getStoredTeamIds().filter(t => t !== id);
    safeLS.set("c_teamIds", JSON.stringify(n));
  };

  const teamIds = loadedTeams.map(t => t.details.id).join(",");
  useEffect(() => {
    if (!isHydrated || !teamIds || !globalPusherRef?.current) return;
    const pusher = globalPusherRef.current;

    const channels = teamIds.split(",").map(tid => {
      const ch = pusher.subscribe(`team-${tid}`);
      ch.bind("team-update", async () => {
        try {
          const r = await fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "get-team-details", teamId: tid, jucator: nume }) });
          const d = await r.json();
          if (d.success) {
            setLoadedTeams(prev => prev.map(t => t.details.id === tid ? { ...t, top: d.top || [] } : t));
          }
        } catch {}
      });
      return { tid, ch };
    });

    return () => {
      channels.forEach(({ tid, ch }) => {
        ch.unbind_all();
        pusher.unsubscribe(`team-${tid}`);
      });
    };
  }, [isHydrated, teamIds, nume, globalPusherRef]);

  const handleSaveNume = async () => {
    const final = localNume.trim().toUpperCase();
    if (final === (nume || "").trim().toUpperCase()) return;
    const validation = valideazaNume(final);
    if (!validation.valid) { setNumeError(validation.error); return; }
    setNumeError("");
    triggerVibrate(); setIsSavingName(true);
    const ok = await setNume(final);
    if (!ok) setLocalNume(nume || "");
    setIsSavingName(false);
  };

  useEffect(() => {
    if (!isHydrated) return;
    const pId = searchParams.get("joinTeam");
    if (!nume || nume.length < 3) {
      if (pId) setShowJoinModal(true);
      setLoadedTeams([]);
      return;
    }
    setShowJoinModal(false);
    const fetchTeams = async () => {
      let ids = getStoredTeamIds();
      if (pId && !ids.includes(pId)) { ids.push(pId); addStoredTeamId(pId); }
      if (!ids.length) { setLoadedTeams([]); return; }
      const results = [], valid = [];
      const fetches = await Promise.allSettled(
        ids.map(tid => fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "get-team-details", teamId: tid, jucator: nume }) }).then(r => r.json()).then(d => ({ tid, d })))
      );
      for (const f of fetches) {
        if (f.status === 'fulfilled' && f.value.d.success) {
          results.push({ details: f.value.d.details, top: f.value.d.top || [] });
          valid.push(f.value.tid);
        }
      }
      safeLS.set("c_teamIds", JSON.stringify(valid));
      setLoadedTeams(results);
      if (pId) router.replace("/");
    };
    fetchTeams();
  }, [nume, searchParams, router, isHydrated, addStoredTeamId, getStoredTeamIds]);

  const handleJoinModalSubmit = async () => {
    const final = joinModalNume.trim().toUpperCase();
    if (final.length < 3) return;
    if (esteNumeInterzis(final)) { setToastMsg("Ai chef de glume? Alege alt nume"); return; }
    setIsSavingName(true);
    const ok = await setNume(final);
    setIsSavingName(false);
    if (ok) { setLocalNume(final); setShowJoinModal(false); }
  };

  const handleArena = async () => {
    if (!nume || nume.length < 3) { setToastMsg("Pune-ți o poreclă mai întâi!"); return; }
    triggerVibrate(); setIsJoiningArena(true);
    try {
      const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'arena-matchmaking' }) });
      const data = await res.json();
      if (data.success) {
        try { sessionStorage.setItem('room-host-token', data.isHost ? 'arena-host' : ''); } catch {}
        router.push(`/joc/${data.roomId}`);
      }
    } catch { setToastMsg("Eroare de rețea!"); }
    finally { setIsJoiningArena(false); }
  };

  const handleCreateTeam = async () => {
    if (!nume || nume.trim().length < 3) { setToastMsg("Pune-ți o poreclă mai întâi!"); return; }
    setLoadingTeam(true); triggerVibrate();
    try {
      const r = await fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "creeaza-echipa", creator: nume }) });
      const d = await r.json();
      if (d.success) {
        addStoredTeamId(d.teamId);
        setLoadedTeams(prev => [...prev, { details: { id: d.teamId, nume: `GRUPUL LUI ${nume.toUpperCase().trim()}` }, top: [{ member: nume.toUpperCase().trim(), score: 0 }] }]);
        setActiveTeamIndex(loadedTeams.length);
      }
    } catch { setToastMsg("Eroare la creare grup."); }
    finally { setLoadingTeam(false); }
  };

  const handleRenameTeam = async (teamId, nouNume) => {
    if (nouNume.length < 3) { setToastMsg("Nume prea scurt."); return; }
    triggerVibrate();
    setLoadedTeams(prev => prev.map(t => t.details.id === teamId ? { ...t, details: { ...t.details, nume: nouNume.toUpperCase().trim() } } : t));
    fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "redenumeste-echipa", teamId, newName: nouNume, jucator: nume }) });
  };

  const showConfirm = (message, onYes) => setConfirmDialog({ message, onYes });

  const handleLeaveTeam = (teamId) => {
    showConfirm("Ești sigur că vrei să părăsești grupul?", () => {
      removeStoredTeamId(teamId);
      setLoadedTeams(prev => prev.filter(t => t.details.id !== teamId));
      setActiveTeamIndex(0);
    });
  };

  const handleKickMember = async (member, teamId) => {
    showConfirm(`Ești sigur că vrei să-l elimini pe ${member} din grup?`, async () => {
      triggerVibrate();
      try {
        await fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "kick-member", teamId, member, jucator: nume }) });
        setLoadedTeams(prev => prev.map(t => t.details.id === teamId ? { ...t, top: t.top.filter(m => m.member !== member) } : t));
      } catch { setToastMsg("Eroare la eliminare."); }
    });
  };

  const handleProvocare = async (oponent, teamId) => {
    triggerVibrate([50, 50, 50]);
    const roomCode = `privat-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    try {
      const res = await fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "provocare-duel", jucator: nume, oponentNume: oponent, roomId: roomCode, teamId }) });
      if (!res.ok) { setToastMsg("Eroare la trimiterea provocării."); return; }
      try { sessionStorage.setItem('room-host-token', 'provocare-host'); } catch {}
      router.push(`/joc/${roomCode}?provocare=true&teamId=${teamId}`);
    } catch { setToastMsg("Eroare de rețea. Încearcă din nou."); }
  };

  if (!isHydrated) return (
    <div className="w-full max-w-md mx-auto pb-16 px-4 pt-8 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-black text-heading tracking-tight">CIOCNIM<span className="text-red-500">.</span>RO</h1>
        <p className="text-sm font-bold text-red-400/60 mt-2">Ciocnește ouă online de Paște</p>
      </div>
      {/* Skeleton placeholders */}
      <div className="space-y-4 animate-pulse">
        <div className="h-20 rounded-2xl bg-card border border-red-900/10" />
        <div className="h-14 rounded-2xl bg-card border border-red-900/10" />
        <div className="space-y-2">
          <div className="h-16 rounded-2xl bg-card border border-red-900/10" />
          <div className="h-16 rounded-2xl bg-card border border-red-900/10" />
          <div className="h-16 rounded-2xl bg-card border border-red-900/10" />
        </div>
        <div className="h-32 rounded-2xl bg-card border border-red-900/10" />
      </div>
    </div>
  );

  const isNameInvalid = localNume.trim().length < 2 || localNume.trim().toUpperCase() === (nume || "").trim().toUpperCase();

  return (
    <div className="w-full max-w-md mx-auto pb-16 px-4 space-y-7">

      {/* HERO TRADIȚIONAL */}
      <motion.div {...fadeUp(0, prefersReducedMotion)} className="text-center pt-8 pb-6 relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04] hidden md:block" aria-hidden="true">
          <div className="absolute top-2 left-[10%] text-5xl rotate-12">🥚</div>
          <div className="absolute top-8 right-[15%] text-3xl -rotate-12">🥚</div>
          <div className="absolute bottom-4 left-[20%] text-4xl rotate-6">🥚</div>
          <div className="absolute bottom-2 right-[25%] text-2xl -rotate-6">🥚</div>
        </div>

        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5, duration: 0.7 }} className="relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/10 mb-4 shadow-lg shadow-red-900/10">
            <span className="text-4xl drop-shadow-lg" role="img" aria-label="Ou de Paște">🥚</span>
          </div>
        </motion.div>

        <h1 className="text-4xl font-black text-heading tracking-tight relative z-10 drop-shadow-sm">CIOCNIM<span className="text-red-500">.</span>RO</h1>
        <p className="text-sm font-bold text-red-400/60 mt-2 relative z-10">Ciocnește ouă online de Paște</p>

        <div className="flex items-center justify-center gap-3 mt-1.5">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-red-500/30" />
          <p className="text-[10px] font-black text-red-500/25 uppercase tracking-[0.5em]">Paști {getNextEaster().getFullYear()}</p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-red-500/30" />
        </div>

        {/* COUNTER CIOCNIRI + LIVE */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mt-5 flex flex-col items-center gap-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-card border border-red-500/15 text-heading px-4 sm:px-6 py-3 rounded-2xl font-black shadow-xl shadow-black/20 max-w-full">
            <span className="text-lg flex-shrink-0" role="img" aria-label="Ou de Paște">🥚</span>
            <span className="tabular-nums text-heading text-xl sm:text-2xl">{totalGlobal?.toLocaleString("ro-RO") || "…"}</span>
            <span className="font-semibold text-muted text-[10px] sm:text-xs">Ciocniri Naționale</span>
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] text-green-400/60 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="tabular-nums">{onlineCount || 1}</span>
            <span className="text-green-400/40">{onlineCount === 1 ? 'persoană' : 'persoane'} online acum</span>
          </div>
        </motion.div>
      </motion.div>

      {/* COUNTDOWN PAȘTE */}
      <motion.div {...fadeUp(0.05, prefersReducedMotion)}>
        <EasterCountdown />
      </motion.div>

      {/* PROFIL */}
      <motion.div {...fadeUp(0.08, prefersReducedMotion)}>
        <SectionLabel>{nume ? "Profilul Tău" : "Începe Aici"}</SectionLabel>
        <div className="rounded-2xl border border-red-900/20 bg-card p-4 sm:p-5 space-y-4 shadow-sm w-full max-w-full overflow-hidden">
          <div>
            <div className="flex gap-2 w-full max-w-full">
              <input
                value={localNume}
                onChange={e => { setLocalNume(e.target.value); setNumeError(""); }}
                onInput={e => { setLocalNume(e.target.value); setNumeError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSaveNume()}
                placeholder="Porecla ta..."
                maxLength={21}
                className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-edge-strong rounded-xl font-bold text-body outline-none focus:border-red-800 transition-all text-sm bg-elevated focus:bg-elevated-hover"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveNume}
                disabled={isSavingName || isNameInvalid}
                className={`px-4 sm:px-5 py-3 font-bold rounded-xl border transition-all text-sm flex-shrink-0 ${isNameInvalid || isSavingName ? "bg-elevated text-muted border-edge cursor-not-allowed" : "bg-red-800 text-white border-red-800 hover:bg-red-900 shadow-sm shadow-red-900/20"}`}
              >
                {isSavingName ? "…" : "OK"}
              </motion.button>
            </div>
            <AnimatePresence>
              {numeError ? (
                <motion.p key="err-rau" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-orange-500 text-xs mt-1.5 font-medium">{numeError}</motion.p>
              ) : localNume.trim().length > 0 && localNume.trim().length < 2 ? (
                <motion.p key="err-scurt" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5 font-medium">Minim 2 caractere</motion.p>
              ) : !nume && localNume.trim().length === 0 ? (
                <motion.p key="hint" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-dim text-xs mt-1.5 font-medium">Scrie o poreclă și apasă OK ca să poți juca</motion.p>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RegionSelector selectedRegion={userStats.regiune} onSelectRegion={r => setUserStats(prev => ({ ...prev, regiune: r }))} />
            <ColorSelector selected={userStats.skin || "red"} onSelect={s => setUserStats(prev => ({ ...prev, skin: s }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-green-900/30 rounded-xl p-3 text-center bg-green-900/10">
              <p className="text-2xl font-black text-green-400">{parseInt(userStats.wins) || 0}</p>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide mt-0.5">Victorii 🏆</p>
            </div>
            <div className="border border-red-900/30 rounded-xl p-3 text-center bg-red-900/10">
              <p className="text-2xl font-black text-red-400">{parseInt(userStats.losses) || 0}</p>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide mt-0.5">Înfrângeri</p>
            </div>
          </div>
          {(parseInt(userStats.wins) || 0) < 10 && (
            <p className="text-center text-[10px] font-semibold text-amber-500/50 mt-1">
              La 10 victorii primești o stea pe oul tău!
              {(parseInt(userStats.wins) || 0) > 0 && ` (mai ai ${10 - (parseInt(userStats.wins) || 0)})`}
            </p>
          )}
          {(parseInt(userStats.wins) || 0) >= 10 && (
            <p className="text-center text-[10px] font-bold text-amber-400 mt-1">Ai steaua de campion pe ou!</p>
          )}
        </div>
      </motion.div>

      {/* JOACĂ */}
      <motion.div {...fadeUp(0.11, prefersReducedMotion)}>
        <SectionLabel>Joacă</SectionLabel>
        <div className="space-y-2">
          <ActionButton icon="🥚" title="Ciocnește cu un Prieten" subtitle="Trimite-i codul și gata!" onClick={() => { if (!nume || nume.length < 3) { setToastMsg("Pune-ți o poreclă mai întâi!"); return; } triggerVibrate(); setIsPlayModalOpen(true); }} />
          <ActionButton icon="🌍" title="Ciocnește cu Concetățenii" subtitle={isJoiningArena ? "Se caută adversar..." : "Joacă cu cineva din România"} onClick={handleArena} loading={isJoiningArena} />
          <ActionButton icon="👥" title={loadedTeams.length > 0 ? "Grup Nou" : "Creează Grup de Ciocnit"} subtitle="Invită familia și prietenii" onClick={handleCreateTeam} loading={loadingTeam} />
        </div>
      </motion.div>

      {/* GRUPURI */}
      <AnimatePresence>
        {loadedTeams.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <SectionLabel>Grupurile Mele</SectionLabel>
            <GroupHub teams={loadedTeams} activeTeamIndex={activeTeamIndex} setActiveTeamIndex={setActiveTeamIndex} numePreluat={nume} onRename={handleRenameTeam} onProvoca={handleProvocare} onLeave={handleLeaveTeam} onKick={handleKickMember} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLASAMENT */}
      <motion.div {...fadeUp(0.15, prefersReducedMotion)}>
        <SectionLabel>Clasament</SectionLabel>
        <DualLeaderboard topRegiuni={topRegiuni} topPlayers={topJucatori} myName={nume} myScore={userStats.wins || 0} />
        <Link href="/clasament" className="block text-center text-[10px] font-bold text-red-500/50 hover:text-red-400 mt-2 transition-colors">
          Vezi clasamentul complet →
        </Link>
      </motion.div>

      {/* ACHIEVEMENTS */}
      <motion.div {...fadeUp(0.18, prefersReducedMotion)}>
        <SectionLabel>Achievement-uri</SectionLabel>
        <div className="rounded-2xl border border-amber-900/20 bg-card p-4 shadow-sm">
          {achievements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {achievements.map(a => (
                <div key={a.key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900/15 border border-amber-700/20" title={a.desc}>
                  <span className="text-base">{a.icon}</span>
                  <span className="text-[11px] font-bold text-amber-300">{a.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted text-center">Niciun achievement încă. Joacă pentru a debloca!</p>
          )}
          <Link href="/profil" className="block text-center text-[10px] font-bold text-amber-500/50 hover:text-amber-400 mt-3 transition-colors">
            Vezi toate achievement-urile →
          </Link>
        </div>
      </motion.div>

      {/* TRADIȚII (includes /retete link - issue #12) */}
      <motion.div {...fadeUp(0.22, prefersReducedMotion)}>
        <SectionLabel>Tradiții & Ghiduri</SectionLabel>
        <div className="flex gap-2 justify-center flex-wrap">
          {[
            { href: "/traditii", icon: "📖", text: "Reguli" },
            { href: "/vopsit-natural", icon: "🧅", text: "Vopsit" },
            { href: "/retete", icon: "🍳", text: "Rețete" },
            { href: "/calendar", icon: "📅", text: "Calendar" },
            { href: "/urari", icon: "🕊️", text: "Urări" },
            { href: "/ghid", icon: "🎮", text: "Ghid" },
            { href: "/despre", icon: "💡", text: "Despre" },
          ].map((item, i) => (
            <motion.div key={item.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 + i * 0.05 }}>
              <Link href={item.href} className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-2xl border border-red-900/20 bg-card hover:bg-red-800 hover:border-red-800 group transition-all duration-200 active:scale-95 shadow-sm hover:shadow-lg min-w-[56px] flex-1">
                <span className="text-lg sm:text-2xl">{item.icon}</span>
                <span className="font-bold text-[9px] sm:text-[11px] text-dim group-hover:text-white transition-colors text-center">{item.text}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* SHARE SITE */}
      <motion.div {...fadeUp(0.26, prefersReducedMotion)}>
        <button
          onClick={() => {
            const text = `Am descoperit cel mai tare joc de Paște! Hai la o ciocneală de ouă pe ciocnim.ro 🥚⚔️`;
            if (navigator.share) {
              navigator.share({ title: "Ciocnim.ro", text, url: "https://ciocnim.ro" }).catch(() => {});
            } else {
              safeCopy(`${text}\nhttps://ciocnim.ro`);
              setToastMsg("Link copiat! Trimite-l prietenilor.");
            }
          }}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-red-900/30 bg-red-900/10 hover:bg-red-900/20 hover:border-red-800/50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <span className="text-xl">📲</span>
          <span className="font-black text-red-400 text-sm">Trimite jocul prietenilor</span>
        </button>
      </motion.div>

      {/* INSTALEAZĂ — hide if already running as PWA */}
      {isHydrated && typeof window !== 'undefined' && !window.matchMedia('(display-mode: standalone)').matches && (
        <motion.div {...fadeUp(0.27, prefersReducedMotion)}>
          <button
            onClick={() => {
              if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                window.deferredPrompt.userChoice.then(() => { window.deferredPrompt = null; });
              } else {
                setToastMsg("Meniu browser → Adaugă pe ecranul principal");
              }
            }}
            className="w-full py-3.5 rounded-2xl border border-edge bg-card hover:bg-card-hover transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
          >
            <span className="text-lg">📥</span>
            <span className="font-bold text-dim text-sm">Instalează aplicația</span>
          </button>
        </motion.div>
      )}

      {/* NOTIFICĂRI */}
      {isNotificationSupported() && getNotificationStatus() === "default" && nume && (
        <motion.div {...fadeUp(0.28, prefersReducedMotion)}>
          <button
            onClick={async () => {
              const granted = await requestNotificationPermission();
              setToastMsg(granted ? "Notificări activate!" : "Notificările au fost blocate.");
            }}
            className="w-full py-3.5 rounded-2xl border border-edge bg-card hover:bg-card-hover transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
          >
            <span className="text-lg">🔔</span>
            <span className="font-bold text-dim text-sm">Activează notificările</span>
          </button>
        </motion.div>
      )}

      {/* Footer is in layout.js */}

      <PlayModal isOpen={isPlayModalOpen} onClose={() => setIsPlayModalOpen(false)} router={router} userSkin={userStats.skin || "red"} />

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] bg-red-800 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl whitespace-nowrap"
          >
            {toastMsg.includes("copiat") || toastMsg.includes("Copiat") || toastMsg.includes("succes") ? "✅" : "🚫"} {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-2xl border border-red-900/20 p-6 max-w-xs w-full shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-sm font-bold text-body mb-5">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3 rounded-xl bg-elevated text-dim font-bold text-sm hover:bg-overlay transition-all">Nu</button>
                <button onClick={() => { setConfirmDialog(null); confirmDialog.onYes(); }} className="flex-1 py-3 rounded-xl bg-red-700 text-white font-bold text-sm hover:bg-red-800 transition-all">Da</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJoinModal && typeof document !== "undefined" && createPortal(
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", zIndex: 1000 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="bg-surface rounded-3xl border border-red-900/15 w-full max-w-[360px] p-7 shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">🥚</div>
                <h2 className="text-lg font-black text-heading">Ai fost invitat într-un grup!</h2>
                <p className="text-xs text-dim mt-1">Pune-ți o poreclă ca să te alături</p>
              </div>
              <input
                value={joinModalNume}
                onChange={e => setJoinModalNume(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleJoinModalSubmit()}
                placeholder="Porecla ta..."
                maxLength={21}
                autoFocus
                className="w-full px-4 py-3 border-2 border-edge-strong rounded-2xl font-bold text-body outline-none focus:border-red-800 transition-all text-sm bg-elevated focus:bg-elevated-hover mb-3"
              />
              {joinModalNume.trim().length > 0 && joinModalNume.trim().length < 3 && (
                <p className="text-red-500 text-xs mb-3 font-medium">Minim 3 caractere</p>
              )}
              <button
                onClick={handleJoinModalSubmit}
                disabled={isSavingName || joinModalNume.trim().length < 3}
                className="w-full py-3.5 bg-red-800 hover:bg-red-900 text-white font-black rounded-2xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSavingName ? "…" : "Intră în grup →"}
              </button>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-main relative pattern-tradition">

      <Suspense fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-5xl animate-bounce" role="img" aria-label="Ou de Paște">🥚</div>
            <p className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-widest">Se încarcă...</p>
          </div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </main>
  );
}
