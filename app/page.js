"use client";

import { useState, useEffect, useCallback, Suspense, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Pusher from "pusher-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const REGIUNI_ISTORICE = ["Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", "Crișana", "Banat", "Maramureș", "Bucovina", "Diaspora"];

// ─── Filtru Poreclă ─────────────────────────────────────────────────────────────
const CUVINTE_INTERZISE = [
  'pula','pule','pulica','pulete','pulamea','pularie',
  'pizda','pizdi','pizdica',
  'muie','muist','muista',
  'sugi','sugipula','sugio',
  'fut','fute','futut','fututi','futuma',
  'coaie','coaiele',
  'cur','curu','curul',
  'morti','mortii',
  'cacat','labagiu',
];
function normalizeForFilter(s) {
  return s.toLowerCase()
    .replace(/@/g,'a').replace(/0/g,'o').replace(/1/g,'i')
    .replace(/7/g,'t').replace(/9/g,'g')
    .replace(/[_\-\s\.]/g,'');
}
function esteNumeInterzis(name) {
  const n = normalizeForFilter(name);
  const nv = n.replace(/v/g,'u');        // pvla→pula, mvie→muie, fvt→fut
  const noo = nv.replace(/oo/g,'u');     // mooie→muie (din m00ie)
  return CUVINTE_INTERZISE.some(w => n.includes(w) || nv.includes(w) || noo.includes(w));
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Clasament ─────────────────────────────────────────────────────────────────
const DualLeaderboard = ({ topRegiuni, topPlayers, myName, myScore }) => {
  const [view, setView] = useState("jucatori");

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
      // Folosim scorul din clasament (server-side) ca referință
      const myServerScore = parseInt(topPlayers[idx].scor) || 0;
      // Găsim primul jucător de deasupra cu scor strict mai mare
      let targetIdx = idx - 1;
      while (targetIdx > 0 && (parseInt(topPlayers[targetIdx].scor) || 0) <= myServerScore) {
        targetIdx--;
      }
      const targetScore = parseInt(topPlayers[targetIdx].scor) || 0;
      const wins = Math.max(1, targetScore - myServerScore);
      return { myRank: idx + 1, winsNeeded: wins, targetRank: targetIdx + 1 };
    }

    // Nu ești în clasament — calculează victorii pentru a intra pe ultimul loc din top
    const n = topPlayers.length;
    if (n === 0) return { myRank: null, winsNeeded: 1, targetRank: 1 };
    const lastScore = parseInt(topPlayers[n - 1].scor) || 0;
    const wins = Math.max(1, lastScore - myScoreNum + 1);
    return { myRank: null, winsNeeded: wins, targetRank: n };
  }, [topPlayers, myName, myScore]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="flex">
        {[["jucatori", "🏆 Jucători"], ["regiuni", "🗺️ Regiuni"]].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
              view === v ? "bg-red-700 text-white" : "text-gray-400 hover:text-red-400 hover:bg-white/[0.06]"
            } ${v === "regiuni" ? "border-l border-white/[0.06]" : ""}`}
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
                  {topPlayers.map((p, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${p.nume === myName?.toUpperCase().trim() ? "bg-amber-900/20 border border-amber-700/30" : "hover:bg-white/[0.06]"}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base w-6 text-center">{medals[i] || `${i + 1}.`}</span>
                        <span className="font-bold text-gray-200 text-sm">{p.nume}</span>
                      </div>
                      <span className="font-bold text-red-400 text-sm">{parseInt(p.scor) || 0} 🏆</span>
                    </div>
                  ))}
                  {myName && (myRank !== null || targetRank !== null) && (
                    <div className="mt-3 pt-3 border-t border-red-900/8">
                      <p className="text-center text-[11px] font-semibold text-red-400">
                        {myRank === 1
                          ? "🎉 Ești Campion Național!"
                          : myRank !== null
                            ? `Locul #${myRank} · mai ai nevoie de ${winsNeeded} ${winsNeeded === 1 ? "victorie" : "victorii"} pentru locul ${targetRank}`
                            : `Mai ai nevoie de ${winsNeeded} ${winsNeeded === 1 ? "victorie" : "victorii"} pentru locul ${targetRank} în clasament`}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">Niciun jucător încă. Fii primul!</p>
              )}
            </motion.div>
          ) : (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
              {topRegiuni && topRegiuni.length > 0 ? (
                topRegiuni.map((reg, i) => (
                  <div key={reg.regiune} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-200">{medals[i] || `${i + 1}.`} {reg.regiune}</span>
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
                <p className="text-center text-gray-400 text-sm py-8">Așteptăm prima bătălie...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {myName && myRank !== null && (
          <button
            onClick={() => {
              const text = myRank === 1
                ? `Sunt Campionul Național la ciocnit ouă pe ciocnim.ro! Îndrăznește să mă provoci? 🥚🏆`
                : `Sunt pe locul ${myRank} în clasamentul național de ciocnit ouă! Hai și tu la o ciocneală pe ciocnim.ro 🥚⚔️`;
              if (navigator.share) {
                navigator.share({ title: "Ciocnim.ro", text, url: "https://ciocnim.ro" }).catch(() => {});
              } else {
                navigator.clipboard.writeText(`${text}\nhttps://ciocnim.ro`);
              }
            }}
            className="w-full mt-3 py-2.5 border-t border-red-900/8 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2 rounded-b-xl"
          >
            <span>📲</span> Distribuie clasamentul tău
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Buton Acțiune ──────────────────────────────────────────────────────────────
const ActionButton = ({ onClick, icon, title, subtitle, loading = false }) => (
  <motion.button
    whileHover={{ scale: 1.015, x: 2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={loading}
    className="w-full px-5 py-4 rounded-2xl border border-red-900/20 bg-white/[0.04] backdrop-blur-sm hover:bg-red-800 hover:border-red-800 group transition-all duration-200 flex items-center gap-4 text-left disabled:opacity-50 shadow-sm hover:shadow-lg"
  >
    <div className="w-10 h-10 rounded-xl bg-red-900/20 group-hover:bg-white/20 flex items-center justify-center transition-all text-xl flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-bold text-gray-200 group-hover:text-white transition-colors text-sm leading-tight">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 group-hover:text-red-200 transition-colors mt-0.5">{subtitle}</div>}
    </div>
    {loading
      ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
      : <span className="text-gray-300 group-hover:text-white/60 transition-colors text-sm flex-shrink-0">→</span>
    }
  </motion.button>
);

// ─── Modal Meci Privat ──────────────────────────────────────────────────────────
const PlayModal = ({ isOpen, onClose, router, userSkin }) => {
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomError, setRoomError] = useState("");

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; setRoomError(""); }
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const createRoom = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'creeaza-camera-privata' }) });
      const data = await res.json();
      if (data.success) { onClose(); router.push(`/joc/privat-${data.cod}?host=true&skin=${userSkin}`); }
    } catch { setRoomError("Eroare de rețea. Încearcă din nou."); }
    finally { setIsCreating(false); }
  };

  const joinRoom = async () => {
    if (roomCode.length < 3) { setRoomError("Codul trebuie să aibă minim 3 caractere!"); return; }
    setIsJoining(true); setRoomError("");
    try {
      const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'check-room', cod: roomCode }) });
      const data = await res.json();
      if (!data.success) { setRoomError(data.error || "Camera este ocupată!"); }
      else { onClose(); router.push(`/joc/privat-${roomCode}?host=false&skin=${userSkin}`); }
    } catch { setRoomError("Eroare de rețea. Încearcă din nou."); }
    finally { setIsJoining(false); }
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 99999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
        style={{ background: 'rgba(20,17,17,0.98)', backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid rgba(220,38,38,0.15)', width: '100%', maxWidth: '384px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Meci Privat 🥚</h2>
            <p className="text-xs text-gray-400 mt-0.5">Creează sau alătură-te unei camere</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/[0.05] hover:bg-white/[0.1] rounded-full flex items-center justify-center text-gray-400 transition-colors text-sm">×</button>
        </div>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRoom}
            disabled={isCreating}
            className="w-full bg-red-800 hover:bg-red-900 disabled:opacity-60 text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-red-900/20"
          >
            {isCreating ? "⏳ Se creează..." : "➕ Creează Cameră Nouă"}
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.1]" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">sau</span>
            <div className="flex-1 h-px bg-white/[0.1]" />
          </div>
          <input
            value={roomCode}
            onChange={e => { setRoomCode(e.target.value.toUpperCase().trim()); setRoomError(""); }}
            onKeyDown={e => e.key === "Enter" && joinRoom()}
            placeholder="COD CAMERĂ"
            maxLength={6}
            className={`w-full px-4 py-3 rounded-2xl border-2 font-bold text-center text-base uppercase outline-none transition-all bg-white/[0.05] focus:bg-white/[0.08] text-white ${roomError ? "border-red-400 focus:border-red-600" : "border-white/[0.1] focus:border-red-800"}`}
          />
          {roomError && <p className="text-red-500 text-xs font-semibold text-center -mt-1">{roomError}</p>}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinRoom}
            disabled={isJoining}
            className="w-full bg-white/[0.1] hover:bg-white/[0.15] disabled:opacity-60 text-white py-3 rounded-2xl font-bold text-sm transition-all"
          >
            {isJoining ? "⏳ Se verifică..." : "🎯 Intră în Joc"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

// ─── Hub Grup Privat ────────────────────────────────────────────────────────────
const GroupHub = ({ teams, activeTeamIndex, setActiveTeamIndex, numePreluat, onLeave, onRename, onProvoca, onKick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copyText, setCopyText] = useState("🔗 Invită");
  const currentTeam = teams?.[activeTeamIndex];
  const [newName, setNewName] = useState(currentTeam?.details?.nume || "");
  const isCreator = currentTeam?.details?.creator === numePreluat?.toUpperCase().trim();

  const [prevIndex, setPrevIndex] = useState(activeTeamIndex);
  if (activeTeamIndex !== prevIndex) {
    setPrevIndex(activeTeamIndex);
    if (currentTeam) { setNewName(currentTeam.details.nume); setIsEditing(false); }
  }

  if (!teams || teams.length === 0) return null;

  const handleSave = () => { onRename(currentTeam.details.id, newName); setIsEditing(false); };

  const handleInvite = async () => {
    const url = `${window.location.origin}/?joinTeam=${currentTeam.details.id}`;
    const shareText = `Hai în grupul meu de ciocnit ouă! Intră pe ${url} și arată-ne cine are cel mai tare ou 🥚⚔️`;
    if (navigator.share) {
      try { await navigator.share({ title: "Ciocnim.ro - Hai la ciocneală!", text: shareText, url }); } catch {}
    } else {
      navigator.clipboard.writeText(shareText);
      setCopyText("✅ Copiat!");
      setTimeout(() => setCopyText("🔗 Invită"), 2000);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-red-900/20 bg-white/[0.04] backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-900/10 bg-red-900/20">
        <span className="font-bold text-white text-sm">👥 Grupul Meu</span>
        {teams.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => setActiveTeamIndex(p => (p - 1 + teams.length) % teams.length)} className="w-6 h-6 bg-red-800 text-white rounded-full text-xs hover:bg-red-900 transition-all flex items-center justify-center">◀</button>
            <span className="text-xs text-gray-400 font-semibold">{activeTeamIndex + 1}/{teams.length}</span>
            <button onClick={() => setActiveTeamIndex(p => (p + 1) % teams.length)} className="w-6 h-6 bg-red-800 text-white rounded-full text-xs hover:bg-red-900 transition-all flex items-center justify-center">▶</button>
          </div>
        )}
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          {isEditing && isCreator ? (
            <div className="flex gap-2 flex-1">
              <input value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 px-3 py-2 border border-white/[0.1] rounded-xl text-sm font-bold text-gray-200 outline-none focus:border-red-800 bg-white/[0.05]" />
              <button onClick={handleSave} className="px-3 py-2 bg-red-800 text-white rounded-xl text-sm font-bold hover:bg-red-900 transition-all">OK</button>
              <button onClick={() => setIsEditing(false)} className="px-2.5 py-2 bg-white/[0.08] rounded-xl text-sm hover:bg-white/[0.12] transition-all text-gray-400">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-white text-sm">{currentTeam.details.nume}</span>
              {isCreator && <button onClick={() => setIsEditing(true)} className="text-gray-300 hover:text-red-800 transition-colors text-xs">✏️</button>}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleInvite} className="flex-1 py-2.5 bg-red-800 text-white rounded-xl font-bold text-xs hover:bg-red-900 transition-all active:scale-95">{copyText}</button>
          <button onClick={() => onLeave(currentTeam.details.id)} className="px-4 py-2.5 border border-red-900/30 text-red-400 rounded-xl font-bold text-xs hover:bg-red-900/20 transition-all active:scale-95">Ieși</button>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {currentTeam.top.map((m, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${m.member === numePreluat?.toUpperCase().trim() ? "bg-amber-900/20 border border-amber-700/30" : "bg-white/[0.03]"}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                <span className="font-bold text-gray-200 text-sm">{m.member}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-400 text-xs">{parseInt(m.score) || 0} 🏆</span>
                {m.member !== numePreluat?.toUpperCase().trim() && (
                  <>
                    <button onClick={() => onProvoca(m.member, currentTeam.details.id)} className="w-7 h-7 bg-red-800 text-white rounded-lg text-xs hover:bg-red-900 transition-all active:scale-95 flex items-center justify-center" title="Provoacă">⚔️</button>
                    {isCreator && (
                      <button onClick={() => onKick(m.member, currentTeam.details.id)} className="w-7 h-7 bg-white/[0.08] text-gray-400 rounded-lg text-xs hover:bg-red-900/30 hover:text-red-400 transition-all active:scale-95 flex items-center justify-center" title="Elimină din grup">✕</button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {currentTeam.top.length <= 1 && <p className="text-center text-gray-400 text-xs py-4">Invită prieteni să joace!</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Selector Culoare ───────────────────────────────────────────────────────────
const ColorSelector = ({ selected, onSelect }) => {
  const culori = [
    { id: "red", color: "#dc2626" },
    { id: "blue", color: "#2563eb" },
    { id: "gold", color: "#f59e0b" },
    { id: "diamond", color: "#10b981" },
    { id: "cosmic", color: "#8b5cf6" },
  ];
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Culoare Ou</label>
      <div className="grid grid-cols-5 gap-1.5">
        {culori.map(c => (
          <motion.button
            key={c.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(c.id)}
            className={`aspect-square rounded-xl border-2 transition-all relative flex items-center justify-center ${selected === c.id ? "border-white shadow-md" : "border-transparent opacity-55 hover:opacity-90"}`}
            style={{ backgroundColor: c.color }}
          >
            {selected === c.id && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center text-white text-[9px]">✓</motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ─── Selector Regiune ───────────────────────────────────────────────────────────
const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Regiunea Ta</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(v => !v)}
          className="w-full px-3 py-2.5 bg-white/[0.05] rounded-xl border border-white/[0.1] font-semibold text-left flex justify-between items-center hover:border-red-800 transition-all text-sm"
        >
          <span className={selectedRegion ? "text-gray-200" : "text-gray-400 text-xs"}>{selectedRegion || "Alege..."}</span>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-400 text-xs">▾</motion.span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 w-full mb-1.5 bg-[#141111]/95 backdrop-blur-xl rounded-2xl border border-white/[0.1] p-2 grid grid-cols-2 gap-1 z-50 shadow-2xl shadow-black/30"
            >
              {REGIUNI_ISTORICE.map(r => (
                <button
                  key={r}
                  onClick={() => { onSelectRegion(r); setIsOpen(false); }}
                  className={`px-2 py-2 text-xs font-semibold rounded-xl border transition-all ${selectedRegion === r ? "bg-red-800 text-white border-red-800" : "bg-white/[0.05] text-gray-300 border-white/[0.08] hover:border-red-800 hover:text-red-400"}`}
                >
                  {r}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold text-red-500/40 uppercase tracking-[0.35em] mb-3 px-0.5">{children}</p>
);

// ─── Componenta Principală ──────────────────────────────────────────────────────
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalGlobal, topRegiuni, topJucatori, nume, setNume, userStats, setUserStats, isHydrated, triggerVibrate } = useGlobalStats();

  const [loadedTeams, setLoadedTeams] = useState([]);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [localNume, setLocalNume] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [hasInitializedName, setHasInitializedName] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinModalNume, setJoinModalNume] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [numeError, setNumeError] = useState("");
  const [isJoiningArena, setIsJoiningArena] = useState(false);
  const teamPusherRef = useRef(null);

  useEffect(() => {
    if (nume && !hasInitializedName) { setLocalNume(nume); setHasInitializedName(true); }
  }, [nume, hasInitializedName]);

  useEffect(() => {
    if (searchParams.get("error") === "ocupata") {
      setToastMsg("Camera este ocupată! Încearcă alt cod.");
      router.replace("/");
      const t = setTimeout(() => setToastMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [searchParams, router]);

  const getStoredTeamIds = () => {
    try { return JSON.parse(localStorage.getItem("c_teamIds") || "[]"); } catch { return []; }
  };
  const addStoredTeamId = useCallback((id) => {
    const ids = getStoredTeamIds();
    if (!ids.includes(id)) { const n = [...ids, id]; localStorage.setItem("c_teamIds", JSON.stringify(n)); return n; }
    return ids;
  }, []);
  const removeStoredTeamId = (id) => {
    const n = getStoredTeamIds().filter(t => t !== id);
    localStorage.setItem("c_teamIds", JSON.stringify(n));
  };

  const teamIds = loadedTeams.map(t => t.details.id).join(",");
  useEffect(() => {
    if (!isHydrated || !teamIds) return;

    if (!teamPusherRef.current) {
      const _forceTLS = process.env.NEXT_PUBLIC_PUSHER_TLS === 'true';
      const _wsPort = parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || '6001');
      teamPusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: 'eu',
        wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || undefined,
        wsPort: _wsPort,
        wssPort: _wsPort,
        forceTLS: _forceTLS,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
      });
    }

    const channels = teamIds.split(",").map(tid => {
      const ch = teamPusherRef.current.subscribe(`team-${tid}`);
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
        teamPusherRef.current?.unsubscribe(`team-${tid}`);
      });
      teamPusherRef.current?.disconnect();
      teamPusherRef.current = null;
    };
  }, [isHydrated, teamIds, nume]);

  const handleSaveNume = async () => {
    const final = localNume.trim().toUpperCase();
    if (final.length < 3 || final === (nume || "").trim().toUpperCase()) return;
    if (esteNumeInterzis(final)) { setNumeError("Ai chef de glume? Alege alt nume 😅"); return; }
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
      for (const tid of ids) {
        try {
          const r = await fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "get-team-details", teamId: tid, jucator: nume }) });
          const d = await r.json();
          if (d.success) { results.push({ details: d.details, top: d.top || [] }); valid.push(tid); }
        } catch {}
      }
      localStorage.setItem("c_teamIds", JSON.stringify(valid));
      setLoadedTeams(results);
      if (pId) router.replace("/");
    };
    fetchTeams();
  }, [nume, searchParams, router, isHydrated, addStoredTeamId]);

  const handleJoinModalSubmit = async () => {
    const final = joinModalNume.trim().toUpperCase();
    if (final.length < 3) return;
    setIsSavingName(true);
    const ok = await setNume(final);
    setIsSavingName(false);
    if (ok) { setLocalNume(final); setShowJoinModal(false); }
  };

  const handleArena = async () => {
    if (!nume || nume.length < 3) return alert("Pune-ți o poreclă mai întâi!");
    triggerVibrate(); setIsJoiningArena(true);
    try {
      const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'arena-matchmaking' }) });
      const data = await res.json();
      if (data.success) router.push(`/joc/${data.roomId}?host=${data.isHost}&skin=${userStats.skin || 'red'}`);
    } catch { alert("Eroare de rețea!"); }
    finally { setIsJoiningArena(false); }
  };

  const handleCreateTeam = async () => {
    if (!nume || nume.trim().length < 3) return alert("Pune-ți o poreclă mai întâi!");
    setLoadingTeam(true); triggerVibrate();
    try {
      const r = await fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "creeaza-echipa", creator: nume }) });
      const d = await r.json();
      if (d.success) {
        addStoredTeamId(d.teamId);
        setLoadedTeams(prev => [...prev, { details: { id: d.teamId, nume: `GRUPUL LUI ${nume.toUpperCase().trim()}` }, top: [{ member: nume.toUpperCase().trim(), score: 0 }] }]);
        setActiveTeamIndex(loadedTeams.length);
      }
    } catch { alert("Eroare la creare grup."); }
    finally { setLoadingTeam(false); }
  };

  const handleRenameTeam = async (teamId, nouNume) => {
    if (nouNume.length < 3) return alert("Nume prea scurt.");
    triggerVibrate();
    setLoadedTeams(prev => prev.map(t => t.details.id === teamId ? { ...t, details: { ...t.details, nume: nouNume.toUpperCase().trim() } } : t));
    fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "redenumeste-echipa", teamId, newName: nouNume, jucator: nume }) });
  };

  const handleLeaveTeam = (teamId) => {
    if (confirm("Ești sigur că vrei să părăsești grupul?")) {
      removeStoredTeamId(teamId);
      setLoadedTeams(prev => prev.filter(t => t.details.id !== teamId));
      setActiveTeamIndex(0);
    }
  };

  const handleKickMember = async (member, teamId) => {
    if (!confirm(`Ești sigur că vrei să-l elimini pe ${member} din grup?`)) return;
    triggerVibrate();
    try {
      await fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "kick-member", teamId, member, jucator: nume }) });
      setLoadedTeams(prev => prev.map(t => t.details.id === teamId ? { ...t, top: t.top.filter(m => m.member !== member) } : t));
    } catch { alert("Eroare la eliminare."); }
  };

  const handleProvocare = async (oponent, teamId) => {
    triggerVibrate([50, 50, 50]);
    const roomCode = `privat-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "provocare-duel", jucator: nume, oponentNume: oponent, roomId: roomCode, teamId }) });
    router.push(`/joc/${roomCode}?host=true&skin=${userStats.skin}&provocare=true&teamId=${teamId}`);
  };

  if (!isHydrated) return null;

  const isNameInvalid = localNume.trim().length < 3 || localNume.trim().toUpperCase() === (nume || "").trim().toUpperCase();

  return (
    <div className="w-full max-w-md mx-auto pb-16 px-4 space-y-7">

      {/* HEADER */}
      <motion.div {...fadeUp(0)} className="text-center pt-10 pb-5 border-b border-red-900/8">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5, duration: 0.7 }} className="text-5xl mb-4 drop-shadow-sm">
          🥚
        </motion.div>
        <h1 className="text-3xl font-black text-white tracking-tight">CIOCNIM.RO</h1>
        <p className="text-base font-bold text-red-400/70 mt-2">Ciocnește ouă online cu prietenii sau familia 🥚</p>
        <p className="text-[11px] font-semibold text-red-400/35 uppercase tracking-[0.4em] mt-1">Tradiția Românească · Paști 2026</p>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mt-4 inline-flex items-center gap-2 border border-red-900/20 bg-red-900/20 text-red-400 px-4 py-2 rounded-full text-sm font-bold">
          🥚 <span className="tabular-nums">{totalGlobal?.toLocaleString("ro-RO") || "…"}</span>
          <span className="font-normal text-red-400/50 text-xs">Ciocniri Naționale</span>
        </motion.div>
      </motion.div>

      {/* PROFIL */}
      <motion.div {...fadeUp(0.08)}>
        <SectionLabel>Profilul Tău</SectionLabel>
        <div className="rounded-2xl border border-red-900/20 bg-white/[0.04] backdrop-blur-xl p-5 space-y-4 shadow-sm">
          <div>
            <div className="flex gap-2">
              <input
                value={localNume}
                onChange={e => { setLocalNume(e.target.value); setNumeError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSaveNume()}
                placeholder="Porecla ta..."
                maxLength={21}
                className="flex-1 px-4 py-3 border border-white/[0.1] rounded-xl font-bold text-gray-200 outline-none focus:border-red-800 transition-all text-sm bg-white/[0.05] focus:bg-white/[0.08]"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveNume}
                disabled={isSavingName || isNameInvalid}
                className={`px-5 py-3 font-bold rounded-xl border transition-all text-sm ${isNameInvalid || isSavingName ? "bg-white/[0.05] text-gray-500 border-white/[0.08] cursor-not-allowed" : "bg-red-800 text-white border-red-800 hover:bg-red-900 shadow-sm shadow-red-900/20"}`}
              >
                {isSavingName ? "…" : "OK"}
              </motion.button>
            </div>
            <AnimatePresence>
              {numeError ? (
                <motion.p key="err-rau" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-orange-500 text-xs mt-1.5 font-medium">{numeError}</motion.p>
              ) : localNume.trim().length > 0 && localNume.trim().length < 3 ? (
                <motion.p key="err-scurt" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5 font-medium">Minim 3 caractere</motion.p>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RegionSelector selectedRegion={userStats.regiune} onSelectRegion={r => setUserStats({ ...userStats, regiune: r })} />
            <ColorSelector selected={userStats.skin || "red"} onSelect={s => setUserStats({ ...userStats, skin: s })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-green-900/30 rounded-xl p-3 text-center bg-green-900/10">
              <p className="text-2xl font-black text-green-400">{parseInt(userStats.wins) || 0}</p>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide mt-0.5">Victorii 🏆</p>
            </div>
            <div className="border border-red-900/30 rounded-xl p-3 text-center bg-red-900/10">
              <p className="text-2xl font-black text-red-400">{parseInt(userStats.losses) || 0}</p>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide mt-0.5">Înfrângeri 💔</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* JOACĂ */}
      <motion.div {...fadeUp(0.13)}>
        <SectionLabel>Joacă</SectionLabel>
        <div className="space-y-2">
          <ActionButton icon="⚔️" title="Meci cu un Prieten" subtitle="Cameră privată" onClick={() => { if (!nume || nume.length < 3) return alert("Pune-ți o poreclă mai întâi!"); triggerVibrate(); setIsPlayModalOpen(true); }} />
          <ActionButton icon="👥" title={loadedTeams.length > 0 ? "Grup Nou" : "Creează Grup Privat"} subtitle="Invită prietenii în grupul tău" onClick={handleCreateTeam} loading={loadingTeam} />
          <ActionButton icon="🌍" title="Arenă Națională" subtitle={isJoiningArena ? "Se caută adversar..." : "Joacă cu cineva din România"} onClick={handleArena} loading={isJoiningArena} />
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
      <motion.div {...fadeUp(0.18)}>
        <SectionLabel>Clasament</SectionLabel>
        <DualLeaderboard topRegiuni={topRegiuni} topPlayers={topJucatori} myName={nume} myScore={userStats.wins || 0} />
      </motion.div>

      {/* TRADIȚII */}
      <motion.div {...fadeUp(0.22)}>
        <SectionLabel>Tradiții & Ghiduri</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "/traditii", icon: "📖", text: "Reguli" },
            { href: "/vopsit-natural", icon: "🧅", text: "Vopsit" },
            { href: "/calendar", icon: "📅", text: "Calendar" },
            { href: "/urari", icon: "🕊️", text: "Urări" },
          ].map((item, i) => (
            <motion.div key={item.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 + i * 0.05 }}>
              <Link href={item.href} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-red-900/20 bg-white/[0.04] backdrop-blur-sm hover:bg-red-800 hover:border-red-800 group transition-all duration-200 active:scale-95 shadow-sm hover:shadow-lg">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-bold text-[11px] text-gray-400 group-hover:text-white transition-colors">{item.text}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* SHARE SITE */}
      <motion.div {...fadeUp(0.26)}>
        <button
          onClick={() => {
            const text = `Am descoperit cel mai tare joc de Paște! Hai la o ciocneală de ouă pe ciocnim.ro 🥚⚔️`;
            if (navigator.share) {
              navigator.share({ title: "Ciocnim.ro", text, url: "https://ciocnim.ro" }).catch(() => {});
            } else {
              navigator.clipboard.writeText(`${text}\nhttps://ciocnim.ro`);
              setToastMsg("Link copiat! Trimite-l prietenilor.");
              setTimeout(() => setToastMsg(""), 3000);
            }
          }}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-red-900/30 bg-red-900/10 hover:bg-red-900/20 hover:border-red-800/50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <span className="text-xl">📲</span>
          <span className="font-black text-red-400 text-sm">Trimite jocul prietenilor</span>
        </button>
      </motion.div>

      {/* FOOTER */}
      <motion.div {...fadeUp(0.28)} className="text-center pt-1 pb-2 border-t border-red-900/6 space-y-2">
        <p className="text-[10px] text-gray-300 font-bold tracking-[0.35em] uppercase">Ciocnim.ro · Păstrăm Tradiția</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => { navigator.clipboard.writeText("ciocnim@mail.com"); setToastMsg("Email copiat: ciocnim@mail.com"); setTimeout(() => setToastMsg(""), 3000); }} className="text-[11px] text-gray-400 hover:text-red-800 transition-colors">Contact</button>
          <span className="text-gray-200 text-xs">·</span>
          <button onClick={() => window.open("https://buymeacoffee.com/ciocnim", "_blank")} className="text-[11px] text-gray-400 hover:text-amber-700 transition-colors">Donație</button>
        </div>
      </motion.div>

      <PlayModal isOpen={isPlayModalOpen} onClose={() => setIsPlayModalOpen(false)} router={router} userSkin={userStats.skin || "red"} />

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-red-800 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl whitespace-nowrap"
          >
            🚫 {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJoinModal && typeof document !== "undefined" && createPortal(
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", zIndex: 99999 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              style={{ background: "rgba(20,17,17,0.98)", borderRadius: "24px", border: "1px solid rgba(220,38,38,0.15)", width: "100%", maxWidth: "360px", padding: "28px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
            >
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">🥚</div>
                <h2 className="text-lg font-black text-white">Ai fost invitat într-un grup!</h2>
                <p className="text-xs text-gray-400 mt-1">Pune-ți o poreclă ca să te alături</p>
              </div>
              <input
                value={joinModalNume}
                onChange={e => setJoinModalNume(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleJoinModalSubmit()}
                placeholder="Porecla ta..."
                maxLength={21}
                autoFocus
                className="w-full px-4 py-3 border-2 border-white/[0.1] rounded-2xl font-bold text-gray-200 outline-none focus:border-red-800 transition-all text-sm bg-white/[0.05] focus:bg-white/[0.08] mb-3"
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
    <main className="min-h-screen bg-[#0c0a0a]">
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-5xl animate-bounce">🥚</div>
            <p className="text-xs font-bold text-red-800 animate-pulse uppercase tracking-widest">Se încarcă...</p>
          </div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </main>
  );
}
