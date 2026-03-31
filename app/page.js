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
import PlayModal from "./components/PlayModal";
import EasterCountdown from "./components/EasterCountdown";
import { safeLS, safeCopy } from "./lib/utils";

const fadeUp = (delay = 0, reduced = false) => reduced ? {} : ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const SectionLabel = ({ children }) => (
  <p className="text-xs font-bold text-red-500/60 uppercase tracking-[0.35em] mb-3 px-0.5">{children}</p>
);

// ─── Componenta Principală ──────────────────────────────────────────────────────
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalGlobal, topRegiuni, topJucatori, nume, setNume, userStats, isHydrated, triggerVibrate, onlineCount, pusherRef: globalPusherRef } = useGlobalStats();
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

  useEffect(() => {
    if (nume && !hasInitializedName) { setLocalNume(nume); setHasInitializedName(true); }
  }, [nume, hasInitializedName]);

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
    // Zero fricțiune: dacă nu are poreclă, generează una temporară
    let playerName = nume;
    if (!playerName || playerName.length < 3) {
      const tempName = "JUCATOR" + Math.random().toString(36).substring(2, 6).toUpperCase();
      const ok = await setNume(tempName);
      if (!ok) { setToastMsg("Eroare. Încearcă din nou."); return; }
      playerName = tempName;
    }
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
      <div className="space-y-4 animate-pulse">
        <div className="h-20 rounded-2xl bg-card border border-red-900/10" />
        <div className="h-16 rounded-3xl bg-red-900/20 border border-red-900/10" />
        <div className="h-14 rounded-2xl bg-card border border-red-900/10" />
        <div className="h-32 rounded-2xl bg-card border border-red-900/10" />
      </div>
    </div>
  );

  const isNameInvalid = localNume.trim().length < 2 || localNume.trim().toUpperCase() === (nume || "").trim().toUpperCase();

  return (
    <div className="w-full max-w-md mx-auto pb-16 px-4 space-y-6">

      {/* ═══ HERO COMPACT ═══ */}
      <motion.div {...fadeUp(0, prefersReducedMotion)} className="text-center pt-5 pb-2">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5, duration: 0.7 }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/10 mb-3 shadow-lg shadow-red-900/10">
            <span className="text-3xl drop-shadow-lg" role="img" aria-label="Ou de Paște">🥚</span>
          </div>
        </motion.div>
        <h1 className="text-4xl font-black text-heading tracking-tight drop-shadow-sm">CIOCNIM<span className="text-red-500">.</span>RO</h1>
        <p className="text-sm font-bold text-red-400/60 mt-1">Ciocnește ouă online de Paște</p>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mt-3 flex items-center justify-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 bg-card border border-red-500/15 text-heading px-4 py-2 rounded-2xl font-black shadow-lg shadow-black/20">
            <span className="text-base" role="img" aria-label="Ou">🥚</span>
            <span className="tabular-nums text-heading text-lg">{totalGlobal?.toLocaleString("ro-RO") || "…"}</span>
            <span className="font-semibold text-muted text-xs">ciocniri</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-green-400/70 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="tabular-nums">{onlineCount || 1} online</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ═══ CTA PRINCIPAL — UN SINGUR BUTON ═══ */}
      <motion.div {...fadeUp(0.05, prefersReducedMotion)} className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            if (!nume || nume.length < 3) { handleArena(); return; }
            triggerVibrate(); setIsPlayModalOpen(true);
          }}
          className="w-full py-5 md:py-6 rounded-3xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-black text-2xl border border-red-600 shadow-2xl shadow-red-900/40 transition-all disabled:opacity-60 flex items-center justify-center gap-3 active:scale-[0.97]"
        >
          <span className="text-3xl">🥚</span>
          CIOCNEȘTE CU UN PRIETEN!
        </motion.button>
        <div className="flex items-center justify-center gap-4 text-xs font-bold">
          <button
            onClick={handleArena}
            disabled={isJoiningArena}
            className="text-red-400/70 hover:text-red-400 transition-colors"
          >
            Joacă cu un român →
          </button>
          <span className="text-faint">|</span>
          <button
            onClick={handleCreateTeam}
            disabled={loadingTeam}
            className="text-muted hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {loadingTeam ? "..." : "Creează grup"}
          </button>
        </div>
      </motion.div>

      {/* ═══ PROFIL COMPACT ═══ */}
      <motion.div {...fadeUp(0.08, prefersReducedMotion)}>
        {nume ? (
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-card border border-edge">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🥚</span>
              <span className="font-bold text-body text-sm">{nume}</span>
              {(parseInt(userStats.wins) || 0) > 0 && (
                <span className="text-xs text-green-400 font-bold">{parseInt(userStats.wins) || 0} 🏆</span>
              )}
            </div>
            <Link href="/profil" className="text-xs font-bold text-red-400/60 hover:text-red-400 transition-colors">
              Profil →
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-red-900/15 bg-card p-4 space-y-2">
            <p className="text-xs font-bold text-dim text-center">Opțional — pune-ți o poreclă</p>
            <div className="flex gap-2">
              <input
                value={localNume}
                onChange={e => { setLocalNume(e.target.value); setNumeError(""); }}
                onInput={e => { setLocalNume(e.target.value); setNumeError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSaveNume()}
                placeholder="ex: Maria, Nicu, Gigi..."
                maxLength={21}
                className="flex-1 min-w-0 px-3 py-2.5 border border-edge-strong rounded-xl font-bold text-body outline-none focus:border-red-800 transition-all text-sm bg-elevated"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveNume}
                disabled={isSavingName || isNameInvalid}
                className={`px-4 py-2.5 font-bold rounded-xl border transition-all text-sm flex-shrink-0 ${isNameInvalid || isSavingName ? "bg-elevated text-muted border-edge cursor-not-allowed" : "bg-red-800 text-white border-red-800 hover:bg-red-900"}`}
              >
                {isSavingName ? "…" : "OK"}
              </motion.button>
            </div>
            {numeError && <p className="text-orange-500 text-xs font-medium">{numeError}</p>}
          </div>
        )}
      </motion.div>

      {/* ═══ CLASAMENT ═══ */}
      <motion.div {...fadeUp(0.12, prefersReducedMotion)}>
        <SectionLabel>Clasament</SectionLabel>
        <DualLeaderboard topRegiuni={topRegiuni} topPlayers={topJucatori} myName={nume} myScore={userStats.wins || 0} />
        <Link href="/clasament" className="block text-center text-xs font-bold text-red-500/50 hover:text-red-400 mt-2 transition-colors">
          Vezi clasamentul complet →
        </Link>
      </motion.div>

      {/* ═══ SHARE — cu urgență + WhatsApp ═══ */}
      <motion.div {...fadeUp(0.16, prefersReducedMotion)} className="flex gap-2">
        <button
          onClick={() => {
            const text = "Hai la ciocnit ouă de Paște! 🥚⚔️ Intră pe ciocnim.ro";
            if (navigator.share) {
              navigator.share({ title: "Ciocnim.ro", text, url: "https://ciocnim.ro" }).catch(() => {});
            } else {
              safeCopy(`${text}\nhttps://ciocnim.ro`);
              setToastMsg("Link copiat! Trimite-l prietenilor.");
            }
          }}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
        >
          <span className="text-lg">📲</span>
          <span className="font-bold text-sm">Trimite prietenilor</span>
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent("Hai la ciocnit ouă de Paște! 🥚⚔️\nhttps://ciocnim.ro")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-3 rounded-2xl bg-green-700 hover:bg-green-600 text-white transition-all active:scale-[0.98] flex items-center justify-center shadow-lg"
          aria-label="Trimite pe WhatsApp"
        >
          <img src="/whatsapp.webp" alt="WhatsApp" className="w-8 h-8" />
        </a>
      </motion.div>

      {/* ═══ COUNTDOWN PAȘTE ═══ */}
      <motion.div {...fadeUp(0.19, prefersReducedMotion)}>
        <EasterCountdown />
      </motion.div>

      {/* ═══ GRUPURI (condițional) ═══ */}
      <AnimatePresence>
        {loadedTeams.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <SectionLabel>Grupurile Mele</SectionLabel>
            <GroupHub teams={loadedTeams} activeTeamIndex={activeTeamIndex} setActiveTeamIndex={setActiveTeamIndex} numePreluat={nume} onRename={handleRenameTeam} onProvoca={handleProvocare} onLeave={handleLeaveTeam} onKick={handleKickMember} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ NAVIGARE — Butoane frumoase ═══ */}
      <motion.div {...fadeUp(0.22, prefersReducedMotion)}>
        <SectionLabel>Descoperă</SectionLabel>
        <div className="flex gap-2 justify-center flex-wrap">
          {[
            { href: "/traditii", icon: "📖", text: "Tradiții" },
            { href: "/retete", icon: "🍳", text: "Rețete" },
            { href: "/urari", icon: "🕊️", text: "Urări" },
            { href: "/vopsit-natural", icon: "🧅", text: "Vopsit" },
            { href: "/calendar", icon: "📅", text: "Calendar" },
            { href: "/ghid", icon: "🎮", text: "Ghid" },
            { href: "/clasament", icon: "🏆", text: "Clasament" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 p-3 rounded-2xl border border-edge bg-card hover:bg-red-800 hover:border-red-800 group transition-all duration-200 active:scale-95 shadow-sm hover:shadow-lg min-w-[64px]">
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-xs text-dim group-hover:text-white transition-colors text-center">{item.text}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 mt-4 text-xs font-medium flex-wrap">
          <Link href="/terms" className="text-muted hover:text-red-400 transition-colors">Termeni și Condiții</Link>
          <span className="text-faint">·</span>
          <Link href="/privacy" className="text-muted hover:text-red-400 transition-colors">Confidențialitate</Link>
          <span className="text-faint">·</span>
          <Link href="/despre" className="text-muted hover:text-red-400 transition-colors">Despre</Link>
          <span className="text-faint">·</span>
          <a href="https://buymeacoffee.com/ciocnim" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors font-bold">☕ Donează</a>
        </div>
      </motion.div>

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

      {/* SEO content — crawlable context for search engines */}
      <section className="w-full max-w-md mx-auto px-4 pb-10 pt-2 text-center">
        <div className="border-t border-red-900/10 pt-6 space-y-3">
          <p className="text-xs text-faint leading-relaxed">
            <strong className="text-muted">Ciocnim.ro</strong> este jocul tradițional românesc de ciocnit ouă de Paște, acum online.
            Joacă gratuit cu prietenii și familia, indiferent de distanță. Hristos a Înviat! 🥚
          </p>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs" aria-label="Pagini utile">
            <a href="/traditii" className="text-red-500/50 hover:text-red-400 transition-colors">Tradiții Pascale</a>
            <a href="/urari" className="text-red-500/50 hover:text-red-400 transition-colors">Urări de Paște</a>
            <a href="/retete" className="text-red-500/50 hover:text-red-400 transition-colors">Rețete de Paște</a>
            <a href="/vopsit-natural" className="text-red-500/50 hover:text-red-400 transition-colors">Vopsit Natural</a>
            <a href="/calendar" className="text-red-500/50 hover:text-red-400 transition-colors">Calendar Paște</a>
            <a href="/ghid" className="text-red-500/50 hover:text-red-400 transition-colors">Ghid de Joc</a>
          </nav>
        </div>
      </section>
    </main>
  );
}
