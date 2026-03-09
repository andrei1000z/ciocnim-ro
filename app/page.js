"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import FriendList from "./components/FriendList";

const REGIUNI_ISTORICE = ["Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", "Crișana", "Banat", "Maramureș", "Bucovina"];

// Clasament Jucători și Regiuni
const DualLeaderboard = ({ topRegiuni, topPlayers, myName, myScore }) => {
  const [view, setView] = useState("jucatori");

  const maxRegionScore = useMemo(() => {
    if (!topRegiuni || topRegiuni.length === 0) return 1;
    return Math.max(...topRegiuni.map(r => parseInt(r.scor) || 0), 1);
  }, [topRegiuni]);

  const { myRank, ouaUrmatorulLoc, ouaNecesareTop10 } = useMemo(() => {
    if (!topPlayers || !myName || myName.trim() === "") return { myRank: null };
    const cleanMyName = myName.trim().toUpperCase();
    const myIndexInTop = topPlayers.findIndex(p => p.nume === cleanMyName);
    const myScoreNum = parseInt(myScore) || 0;
    if (myIndexInTop !== -1) {
      if (myIndexInTop === 0) return { myRank: 1, ouaUrmatorulLoc: 0, ouaNecesareTop10: 0 };
      const scorPrecedent = parseInt(topPlayers[myIndexInTop - 1].scor) || 0;
      const necesar = Math.max(1, scorPrecedent - myScoreNum + 1);
      return { myRank: myIndexInTop + 1, ouaUrmatorulLoc: necesar, ouaNecesareTop10: 0 };
    }
    const scorLocul10 = topPlayers.length >= 10
      ? (parseInt(topPlayers[9].scor) || 1)
      : (topPlayers.length > 0 ? (parseInt(topPlayers[topPlayers.length - 1].scor) || 1) : 1);
    let diferenta = scorLocul10 - myScoreNum;
    if (diferenta <= 0) diferenta = 1;
    return { myRank: 10 + diferenta, ouaUrmatorulLoc: diferenta, ouaNecesareTop10: diferenta };
  }, [topPlayers, myName, myScore]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-red-900/15 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="flex border-b border-red-900/10">
        <button
          onClick={() => setView("jucatori")}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all ${
            view === "jucatori" ? "bg-red-800 text-amber-100" : "text-red-900/50 hover:text-red-900 hover:bg-red-50"
          }`}
        >
          🏆 Jucători
        </button>
        <button
          onClick={() => setView("regiuni")}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-l border-red-900/10 ${
            view === "regiuni" ? "bg-red-800 text-amber-100" : "text-red-900/50 hover:text-red-900 hover:bg-red-50"
          }`}
        >
          🗺️ Regiuni
        </button>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {view === "jucatori" ? (
            <motion.div key="jucatori" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
              {topPlayers && topPlayers.length > 0 ? (
                <>
                  {topPlayers.map((p, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        p.nume === myName?.toUpperCase().trim()
                          ? "bg-amber-50 border border-amber-300"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base w-6 text-center">{medals[i] || `${i + 1}.`}</span>
                        <span className="font-bold text-gray-800 text-sm">{p.nume}</span>
                      </div>
                      <span className="font-bold text-red-800 text-sm">{parseInt(p.scor) || 0} 🥚</span>
                    </div>
                  ))}
                  {myName && myRank !== null && (
                    <div className="mt-3 pt-3 border-t border-red-900/10">
                      <p className="text-center text-xs font-semibold text-red-800">
                        {myRank === 1
                          ? "🎉 Ești Campion Național!"
                          : myRank <= 10
                          ? `Locul #${myRank} — mai ai nevoie de ${ouaUrmatorulLoc} victorie/e pentru a avansa`
                          : `Ai nevoie de ${ouaNecesareTop10} victorie/e pentru TOP 10`}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">Niciun jucător încă. Fii primul!</p>
              )}
            </motion.div>
          ) : (
            <motion.div key="regiuni" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {topRegiuni && topRegiuni.length > 0 ? (
                topRegiuni.map((reg, i) => (
                  <div key={reg.regiune} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-800">{medals[i] || `${i + 1}.`} {reg.regiune}</span>
                      <span className="font-bold text-red-800">{parseInt(reg.scor) || 0} 🥚</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(parseInt(reg.scor || 0) / maxRegionScore) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="h-full bg-red-800 rounded-full"
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
      </div>
    </motion.div>
  );
};

// Buton de acțiune principal
const ActionButton = ({ onClick, icon, title, subtitle, loading = false }) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    disabled={loading}
    className="w-full px-5 py-4 rounded-xl border border-red-900/20 bg-white hover:bg-red-800 hover:border-red-800 group transition-all duration-200 flex items-center gap-4 text-left disabled:opacity-50 shadow-sm hover:shadow-md"
  >
    <span className="text-2xl">{icon}</span>
    <div className="flex-1">
      <div className="font-bold text-gray-800 group-hover:text-white transition-colors text-sm">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 group-hover:text-red-200 transition-colors mt-0.5">{subtitle}</div>}
    </div>
    {loading
      ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      : <span className="text-gray-300 group-hover:text-red-200 transition-colors text-sm">→</span>
    }
  </motion.button>
);

// Modal joc privat
const PlayModal = ({ isOpen, onClose, router, userSkin, setShowFriendList }) => {
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    onClose();
    router.push(`/joc/privat-${code}?host=true&skin=${userSkin}`);
  };

  const joinRoom = () => {
    if (roomCode.length >= 3) {
      onClose();
      router.push(`/joc/privat-${roomCode}?host=false&skin=${userSkin}`);
    } else {
      alert("Codul trebuie să aibă minim 3 caractere!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-[99999]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-white rounded-2xl border border-red-900/15 w-full max-w-sm shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Meci Privat 🥚</h2>
          <button onClick={onClose} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm transition-colors">×</button>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={createRoom}
            className="w-full bg-red-800 hover:bg-red-900 text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            ➕ Creează Cameră Nouă
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">sau</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase().trim())}
            placeholder="COD CAMERĂ"
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-center text-base uppercase outline-none focus:border-red-800 transition-all"
          />
          <button
            onClick={joinRoom}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            🎯 Intră în Joc
          </button>

          <button
            onClick={() => { onClose(); setShowFriendList(true); }}
            className="w-full border border-gray-200 hover:border-red-800 text-gray-500 hover:text-red-800 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
          >
            👥 Listă Prieteni
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Hub Grup Privat
const GroupHub = ({ teams, activeTeamIndex, setActiveTeamIndex, numePreluat, onLeave, onRename, onProvoca }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copyLinkText, setCopyLinkText] = useState("🔗 Invită");
  const currentTeam = teams?.[activeTeamIndex];
  const [newName, setNewName] = useState(currentTeam?.details?.nume || "");

  useEffect(() => {
    if (currentTeam) {
      setNewName(currentTeam.details.nume);
      setIsEditing(false);
    }
  }, [activeTeamIndex, currentTeam]);

  if (!teams || teams.length === 0) return null;

  const handleSave = () => { onRename(currentTeam.details.id, newName); setIsEditing(false); };
  const nextTeam = () => setActiveTeamIndex((prev) => (prev + 1) % teams.length);
  const prevTeam = () => setActiveTeamIndex((prev) => (prev - 1 + teams.length) % teams.length);

  const handleInvite = async () => {
    const inviteUrl = `${window.location.origin}/?joinTeam=${currentTeam.details.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Jucă Ciocnim cu mine!', text: `Te provoc la ${currentTeam.details.nume}`, url: inviteUrl }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(inviteUrl);
      setCopyLinkText("✅ Copiat!");
      setTimeout(() => setCopyLinkText("🔗 Invită"), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-red-900/15 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-900/10 bg-red-800/5">
        <div className="flex items-center gap-2">
          <span>👥</span>
          <span className="font-bold text-gray-900 text-sm">Grup Privat</span>
        </div>
        {teams.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button onClick={prevTeam} className="w-6 h-6 bg-red-800 text-white rounded-full text-xs font-bold hover:bg-red-900 transition-all">◀</button>
            <span className="text-xs font-semibold text-gray-400">{activeTeamIndex + 1}/{teams.length}</span>
            <button onClick={nextTeam} className="w-6 h-6 bg-red-800 text-white rounded-full text-xs font-bold hover:bg-red-900 transition-all">▶</button>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          {isEditing ? (
            <div className="flex gap-2 flex-1">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold text-gray-800 outline-none focus:border-red-800 text-sm"
              />
              <button onClick={handleSave} className="px-3 py-2 bg-red-800 text-white rounded-lg font-bold text-sm hover:bg-red-900 transition-all">OK</button>
              <button onClick={() => setIsEditing(false)} className="px-2 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-all">✕</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 flex-1 text-left group">
              <span className="font-bold text-gray-900">{currentTeam.details.nume}</span>
              <span className="text-gray-300 group-hover:text-red-800 transition-colors text-xs">✏️</span>
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={handleInvite} className="flex-1 py-2.5 bg-red-800 text-white rounded-xl font-bold text-xs hover:bg-red-900 transition-all active:scale-95">{copyLinkText}</button>
          <button onClick={() => onLeave(currentTeam.details.id)} className="px-4 py-2.5 border border-red-200 text-red-700 rounded-xl font-bold text-xs hover:bg-red-50 transition-all active:scale-95">Ieși</button>
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {currentTeam.top.map((m, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${
                m.member === numePreluat?.toUpperCase().trim() ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                <span className="font-bold text-gray-800 text-sm">{m.member}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-800 text-xs">{parseInt(m.score) || 0} 🥚</span>
                {m.member !== numePreluat?.toUpperCase().trim() && (
                  <button
                    onClick={() => onProvoca(m.member, currentTeam.details.id)}
                    className="w-7 h-7 bg-red-800 text-white rounded-lg flex items-center justify-center text-xs hover:bg-red-900 transition-all active:scale-95"
                    title="Provocă la duel"
                  >⚔️</button>
                )}
              </div>
            </div>
          ))}
          {currentTeam.top.length <= 1 && (
            <p className="text-center text-gray-400 text-xs py-5">Invită prieteni pentru a juca împreună!</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Selector Culoare
const ColorSelector = ({ selected, onSelect }) => {
  const culori = [
    { id: 'red', color: '#dc2626', name: 'Roșu', emoji: '❤️' },
    { id: 'blue', color: '#2563eb', name: 'Albastru', emoji: '💙' },
    { id: 'gold', color: '#f59e0b', name: 'Auriu', emoji: '🥇' },
    { id: 'diamond', color: '#10b981', name: 'Verde', emoji: '💚' },
    { id: 'cosmic', color: '#8b5cf6', name: 'Violet', emoji: '💜' }
  ];

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Culoare Ou</label>
      <div className="grid grid-cols-5 gap-1.5">
        {culori.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`aspect-square rounded-xl border-2 transition-all relative flex items-center justify-center text-lg ${
              selected === c.id ? 'border-gray-800 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-90'
            }`}
            style={{ backgroundColor: c.color }}
            title={c.name}
          >
            {c.emoji}
            {selected === c.id && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center text-white text-[9px]">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Selector Regiune
const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Regiunea Ta</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2.5 bg-white rounded-xl border-2 border-gray-200 font-semibold text-left flex justify-between items-center hover:border-red-800 transition-all text-sm"
        >
          <span className={selectedRegion ? 'text-gray-800' : 'text-gray-400'}>
            {selectedRegion || "Alege..."}
          </span>
          <span className={`text-gray-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              className="absolute top-full left-0 w-full mt-1.5 bg-white rounded-xl border border-gray-200 p-2 grid grid-cols-2 gap-1 z-50 shadow-xl"
            >
              {REGIUNI_ISTORICE.map((regiune) => (
                <button
                  key={regiune}
                  onClick={() => { onSelectRegion(regiune); setIsOpen(false); }}
                  className={`px-2 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    selectedRegion === regiune
                      ? 'bg-red-800 text-white border-red-800'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-red-800 hover:text-red-800'
                  }`}
                >
                  {regiune}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Componenta Principală
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { totalGlobal, topRegiuni, topJucatori, nume, setNume, userStats, setUserStats, isHydrated, triggerVibrate } = useGlobalStats();

  const [loadedTeams, setLoadedTeams] = useState([]);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [showFriendList, setShowFriendList] = useState(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [localNume, setLocalNume] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [hasInitializedName, setHasInitializedName] = useState(false);

  useEffect(() => {
    if (nume && !hasInitializedName) {
      setLocalNume(nume);
      setHasInitializedName(true);
    }
  }, [nume, hasInitializedName]);

  const getStoredTeamIds = () => {
    const stored = localStorage.getItem("c_teamIds");
    if (stored) { try { return JSON.parse(stored); } catch (e) { return []; } }
    return [];
  };

  const addStoredTeamId = (id) => {
    const ids = getStoredTeamIds();
    if (!ids.includes(id)) {
      const newIds = [...ids, id];
      localStorage.setItem("c_teamIds", JSON.stringify(newIds));
      return newIds;
    }
    return ids;
  };

  const removeStoredTeamId = (id) => {
    const ids = getStoredTeamIds();
    const newIds = ids.filter(teamId => teamId !== id);
    localStorage.setItem("c_teamIds", JSON.stringify(newIds));
    return newIds;
  };

  const handleSaveNume = async () => {
    const finalName = localNume.trim().toUpperCase();
    if (finalName.length < 3) return;
    if (finalName === (nume || "").trim().toUpperCase()) return;
    triggerVibrate();
    setIsSavingName(true);
    const success = await setNume(finalName);
    if (!success) setLocalNume(nume || "");
    setIsSavingName(false);
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!nume || nume.length < 3) { setLoadedTeams([]); return; }

    const fetchAllTeams = async () => {
      let idsToFetch = getStoredTeamIds();
      const paramId = searchParams.get("joinTeam");
      if (paramId && !idsToFetch.includes(paramId)) { idsToFetch.push(paramId); addStoredTeamId(paramId); }
      if (idsToFetch.length === 0) { setLoadedTeams([]); return; }

      const results = [];
      const validIds = [];
      for (const tid of idsToFetch) {
        try {
          const res = await fetch('/api/ciocnire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actiune: 'get-team-details', teamId: tid, jucator: nume })
          });
          const data = await res.json();
          if (data.success) { results.push({ details: data.details, top: data.top || [] }); validIds.push(tid); }
        } catch (e) {}
      }
      localStorage.setItem("c_teamIds", JSON.stringify(validIds));
      setLoadedTeams(results);
      if (paramId) router.replace('/');
    };

    fetchAllTeams();
  }, [nume, searchParams, router, isHydrated]);

  const handleCreateTeam = async () => {
    if (!nume || nume.trim().length < 3) return alert("Scrie-ți porecla mai întâi!");
    setLoadingTeam(true);
    triggerVibrate();
    try {
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'creeaza-echipa', creator: nume })
      });
      const data = await res.json();
      if (data.success) {
        addStoredTeamId(data.teamId);
        const newTeamData = {
          details: { id: data.teamId, nume: `GRUPUL LUI ${nume.toUpperCase().trim()}` },
          top: [{ member: nume.toUpperCase().trim(), score: 0 }]
        };
        setLoadedTeams(prev => [...prev, newTeamData]);
        setActiveTeamIndex(loadedTeams.length);
      }
    } catch (e) { alert("Eroare la crearea grupului. Mai încearcă o dată."); }
    finally { setLoadingTeam(false); }
  };

  const handleRenameTeam = async (teamId, nouNume) => {
    if (nouNume.length < 3) return alert("Nume prea scurt pentru un grup.");
    triggerVibrate();
    setLoadedTeams(prev => prev.map(t =>
      t.details.id === teamId ? { ...t, details: { ...t.details, nume: nouNume.toUpperCase().trim() } } : t
    ));
    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actiune: 'redenumeste-echipa', teamId, newName: nouNume })
    });
  };

  const handleLeaveTeam = (teamId) => {
    if (confirm("Ești sigur că vrei să părăsești acest grup?")) {
      removeStoredTeamId(teamId);
      setLoadedTeams(prev => prev.filter(t => t.details.id !== teamId));
      setActiveTeamIndex(0);
    }
  };

  const handleProvocare = async (oponent, teamId) => {
    triggerVibrate([50, 50, 50]);
    const roomCode = `privat-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actiune: 'provocare-duel', jucator: nume, oponentNume: oponent, roomId: roomCode, teamId })
    });
    router.push(`/joc/${roomCode}?host=true&skin=${userStats.skin}&provocare=true&teamId=${teamId}`);
  };

  if (!isHydrated) return null;

  const isNameInvalid = localNume.trim().length < 3 || localNume.trim().toUpperCase() === (nume || "").trim().toUpperCase();

  return (
    <div className="w-full max-w-md mx-auto pt-12 pb-16 px-4 space-y-5 relative z-10">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-4 pb-2"
      >
        <div className="text-5xl mb-3">🥚</div>
        <h1 className="text-4xl font-black text-red-900 tracking-tight">CIOCNIM.RO</h1>
        <p className="text-xs font-bold text-red-700/50 uppercase tracking-[0.35em] mt-1">Tradiția Românească · 2026</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-red-800 text-amber-100 px-5 py-2 rounded-full text-sm font-bold shadow-md">
          🥚 {totalGlobal?.toLocaleString('ro-RO') || '...'} ciocniri
        </div>
      </motion.div>

      {/* PROFIL JUCĂTOR */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white border border-red-900/15 rounded-2xl shadow-sm p-5"
      >
        <p className="text-xs font-bold text-red-900/40 uppercase tracking-widest mb-4">Profilul Tău</p>

        <div className="space-y-4">
          <div>
            <div className="flex gap-2">
              <input
                value={localNume}
                onChange={e => setLocalNume(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveNume()}
                placeholder="Porecla ta..."
                maxLength={30}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-red-800 transition-all text-sm"
              />
              <button
                onClick={handleSaveNume}
                disabled={isSavingName || isNameInvalid}
                className={`px-5 py-3 font-bold rounded-xl border-2 transition-all text-sm active:scale-95 ${
                  isNameInvalid || isSavingName
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-red-800 text-white border-red-800 hover:bg-red-900'
                }`}
              >
                {isSavingName ? '...' : 'OK'}
              </button>
            </div>
            {localNume.trim().length > 0 && localNume.trim().length < 3 && (
              <p className="text-red-500 text-xs mt-1 font-medium">Minim 3 caractere</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <RegionSelector selectedRegion={userStats.regiune} onSelectRegion={(reg) => setUserStats({ ...userStats, regiune: reg })} />
            <ColorSelector selected={userStats.skin || 'red'} onSelect={(s) => setUserStats({ ...userStats, skin: s })} />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-green-800">{parseInt(userStats.wins) || 0}</p>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mt-0.5">Victorii 🏆</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-red-800">{parseInt(userStats.losses) || 0}</p>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wide mt-0.5">Înfrângeri 💔</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BUTOANE ACȚIUNI */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="space-y-2"
      >
        <ActionButton
          icon="⚔️"
          title="Meci cu un Prieten"
          subtitle="Cameră privată"
          onClick={() => { if (!nume || nume.length < 3) return alert("Porecla prea scurtă!"); triggerVibrate(); setIsPlayModalOpen(true); }}
        />
        <ActionButton
          icon="👥"
          title={loadedTeams.length > 0 ? "Grup Nou" : "Creează Grup Privat"}
          subtitle="Invită prieteni să joace"
          onClick={handleCreateTeam}
          loading={loadingTeam}
        />
        <ActionButton
          icon="🌍"
          title="Arenă Națională"
          subtitle="Joacă cu cineva din țară"
          onClick={() => { if (!nume || nume.length < 3) return alert("Porecla prea scurtă!"); triggerVibrate(); router.push(`/joc/global-arena?skin=${userStats.skin || 'red'}`); }}
        />
      </motion.div>

      {/* GRUPURI */}
      {loadedTeams.length > 0 && (
        <GroupHub
          teams={loadedTeams}
          activeTeamIndex={activeTeamIndex}
          setActiveTeamIndex={setActiveTeamIndex}
          numePreluat={nume}
          onRename={handleRenameTeam}
          onProvoca={handleProvocare}
          onLeave={handleLeaveTeam}
        />
      )}

      {/* CLASAMENT */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <p className="text-xs font-bold text-red-900/40 uppercase tracking-widest mb-2.5 px-1">Clasament</p>
        <DualLeaderboard
          topRegiuni={topRegiuni}
          topPlayers={topJucatori}
          myName={nume}
          myScore={userStats.wins || 0}
        />
      </motion.div>

      {/* TRADIȚII & GHIDURI */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <p className="text-xs font-bold text-red-900/40 uppercase tracking-widest mb-2.5 px-1">Tradiții & Ghiduri</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "/traditii", icon: "📖", text: "Reguli" },
            { href: "/vopsit-natural", icon: "🧅", text: "Vopsit" },
            { href: "/calendar", icon: "📅", text: "Calendar" },
            { href: "/urari", icon: "🕊️", text: "Urări" }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white border border-red-900/15 rounded-xl p-3 text-center hover:bg-red-800 hover:border-red-800 group transition-all active:scale-95 shadow-sm"
            >
              <span className="text-2xl block mb-1">{item.icon}</span>
              <span className="font-bold text-xs text-gray-600 group-hover:text-white transition-colors">{item.text}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* FOOTER */}
      <div className="text-center pt-2 pb-1">
        <p className="text-xs text-gray-300 font-semibold tracking-widest uppercase mb-2">Ciocnim.ro · Păstrăm Tradiția</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => { navigator.clipboard.writeText("ciocnim@mail.com"); alert("Email copiat: ciocnim@mail.com"); }}
            className="text-xs text-gray-400 hover:text-red-800 transition-colors underline underline-offset-2"
          >
            📧 Contact
          </button>
          <span className="text-gray-200 text-xs">·</span>
          <button
            onClick={() => window.open('https://buymeacoffee.com/ciocnim', '_blank')}
            className="text-xs text-gray-400 hover:text-amber-700 transition-colors underline underline-offset-2"
          >
            ☕ Donație
          </button>
        </div>
      </div>

      <FriendList isOpen={showFriendList} onClose={() => setShowFriendList(false)} currentUser={nume} />
      <PlayModal isOpen={isPlayModalOpen} onClose={() => setIsPlayModalOpen(false)} router={router} userSkin={userStats.skin || 'red'} setShowFriendList={setShowFriendList} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fdf9f4] text-gray-900">
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
