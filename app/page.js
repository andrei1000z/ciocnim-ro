"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
      if (myIndexInTop === 0) {
        return { myRank: 1, ouaUrmatorulLoc: 0, ouaNecesareTop10: 0 };
      } else {
        const scorPrecedent = parseInt(topPlayers[myIndexInTop - 1].scor) || 0;
        const necesar = Math.max(1, scorPrecedent - myScoreNum + 1);
        return { myRank: myIndexInTop + 1, ouaUrmatorulLoc: necesar, ouaNecesareTop10: 0 };
      }
    }
    
    const scorLocul10 = topPlayers.length >= 10 ? (parseInt(topPlayers[9].scor) || 1) : (topPlayers.length > 0 ? (parseInt(topPlayers[topPlayers.length - 1].scor) || 1) : 1);
    let diferenta = scorLocul10 - myScoreNum;
    if (diferenta <= 0) diferenta = 1;
    
    return { myRank: 10 + diferenta, ouaUrmatorulLoc: diferenta, ouaNecesareTop10: diferenta };
  }, [topPlayers, myName, myScore]);

  const safeMyScore = parseInt(myScore) || 0;

  return (
    <div className="w-full bg-yellow-50 p-6 md:p-8 rounded-lg border-4 border-red-700 shadow-lg">
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setView("jucatori")}
          className={`flex-1 py-3 font-bold text-center rounded border-2 transition ${view === "jucatori" ? 'bg-red-700 text-white border-red-900' : 'bg-white text-red-700 border-red-300'}`}
        >
          🏆 JUCĂTORI
        </button>
        <button 
          onClick={() => setView("regiuni")}
          className={`flex-1 py-3 font-bold text-center rounded border-2 transition ${view === "regiuni" ? 'bg-red-700 text-white border-red-900' : 'bg-white text-red-700 border-red-300'}`}
        >
          🗺️ REGIUNI
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === "jucatori" ? (
          <motion.div key="jucatori" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {topPlayers && topPlayers.length > 0 ? (
              <>
                {topPlayers.map((p, i) => (
                  <div key={i} className={`flex justify-between items-center p-4 rounded border-2 ${p.nume === myName?.toUpperCase().trim() ? 'bg-amber-100 border-amber-700' : 'bg-white border-red-300'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold w-8 ${i === 0 ? 'text-amber-600' : (i === 1 ? 'text-gray-500' : (i === 2 ? 'text-amber-700' : 'text-gray-400'))}`}>
                        #{i + 1}
                      </span>
                      <span className="font-bold text-red-900">{p.nume}</span>
                    </div>
                    <span className="text-lg font-bold text-green-700">{parseInt(p.scor) || 0} 🥚</span>
                  </div>
                ))}
                
                {myName && myRank !== null && (
                  <div className="mt-6 pt-4 border-t-4 border-red-700">
                    <div className="bg-red-100 p-4 rounded border-2 border-red-700">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-red-900">#{myRank}</span>
                          <span className="font-bold text-red-900">{myName} (TU)</span>
                        </div>
                        <span className="text-lg font-bold text-green-700">{safeMyScore} 🥚</span>
                      </div>
                      <p className="text-center font-bold text-red-900 text-sm">
                        {myRank === 1 ? "🎉 CHAMPION! 🎉" : myRank <= 10 ? `Ai nevoie de ${ouaUrmatorulLoc} victoria/e pentru a avansa` : `Ai nevoie de ${ouaNecesareTop10} victoria/e pentru TOP 10`}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-red-700 font-bold">
                <p className="text-2xl mb-2">🥚</p>
                <p>Nciun jucător în clasament</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="regiuni" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {topRegiuni && topRegiuni.length > 0 ? (
              topRegiuni.map((reg, i) => (
                <div key={reg.regiune}>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-red-900">#{i + 1} {reg.regiune}</span>
                    <span className="font-bold text-green-700">{parseInt(reg.scor) || 0} 🥚</span>
                  </div>
                  <div className="w-full bg-red-200 rounded h-6 border-2 border-red-700 overflow-hidden">
                    <div 
                      className="h-full bg-red-700 transition-all duration-500"
                      style={{ width: `${(parseInt(reg.scor || 0) / maxRegionScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-red-700 font-bold">
                <p>Așteptăm prima bătălie...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Butoane de acțiune
const ActionButton = ({ onClick, icon, title, subtitle, loading = false }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={loading}
      className="w-full p-4 md:p-5 rounded-lg border-3 border-red-700 bg-yellow-50 hover:bg-red-100 transition flex items-center gap-4 text-left active:scale-95 disabled:opacity-50"
    >
      <span className="text-3xl md:text-4xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <div className="font-bold text-red-900 text-base md:text-lg">{title}</div>
        {subtitle && <div className="text-xs md:text-sm text-red-700">{subtitle}</div>}
      </div>
      {loading && <div className="animate-spin text-red-700">⟳</div>}
    </button>
  );
};

// Modal pentru joc privat
const PlayModal = ({ isOpen, onClose, router, userSkin }) => {
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[99999]">
      <div className="bg-yellow-50 p-8 rounded-lg border-4 border-red-700 w-full max-w-sm shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-red-700 text-2xl hover:text-red-900">✕</button>
        
        <h2 className="text-2xl font-bold text-center text-red-900 mb-8">Meci cu Prieten 🥚</h2>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={createRoom} 
            className="w-full bg-red-700 text-white p-4 rounded-lg font-bold border-3 border-red-900 hover:bg-red-800 active:scale-95 transition"
          >
            ➕ Creează Cameră
          </button>
          
          <div className="relative flex items-center">
            <div className="flex-1 border-t-2 border-red-700"></div>
            <span className="px-3 text-red-700 font-bold">SAU</span>
            <div className="flex-1 border-t-2 border-red-700"></div>
          </div>
          
          <div className="flex gap-2">
            <input 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().trim())}
              placeholder="COD"
              maxLength={6}
              className="flex-1 p-3 rounded-lg border-2 border-red-700 font-bold text-center uppercase outline-none focus:bg-red-50"
            />
            <button 
              onClick={joinRoom} 
              className="px-6 bg-red-700 text-white font-bold rounded-lg border-2 border-red-900 hover:bg-red-800 active:scale-95 transition"
            >
              INTRĂ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hub Grup Privat
const GroupHub = ({ teams, activeTeamIndex, setActiveTeamIndex, numePreluat, onLeave, onRename, onProvoca }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copyLinkText, setCopyLinkText] = useState("🔗 INVITĂ");
  
  if (!teams || teams.length === 0) return null;
  
  const currentTeam = teams[activeTeamIndex];
  const [newName, setNewName] = useState(currentTeam.details.nume);

  useEffect(() => {
    setNewName(currentTeam.details.nume);
    setIsEditing(false);
  }, [activeTeamIndex, currentTeam]);

  const handleSave = () => {
    onRename(currentTeam.details.id, newName);
    setIsEditing(false);
  };

  const nextTeam = () => setActiveTeamIndex((prev) => (prev + 1) % teams.length);
  const prevTeam = () => setActiveTeamIndex((prev) => (prev - 1 + teams.length) % teams.length);

  const handleInvite = async () => {
    const inviteUrl = `${window.location.origin}/?joinTeam=${currentTeam.details.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Jucă Ciocnim cu mine!',
          text: `Te provoc la ${currentTeam.details.nume}`,
          url: inviteUrl,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(inviteUrl);
      setCopyLinkText("✅ COPIAT");
      setTimeout(() => setCopyLinkText("🔗 INVITĂ"), 2000);
    }
  };

  return (
    <div className="bg-yellow-50 p-6 md:p-8 rounded-lg border-4 border-red-700 w-full shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-red-900">👥 Grup Privat</h3>
          {teams.length > 1 && <span className="text-sm font-bold text-red-700 bg-red-100 px-3 py-1 rounded">{activeTeamIndex + 1}/{teams.length}</span>}
        </div>
        
        <div className="mb-4">
          {isEditing ? (
            <div className="flex gap-2">
              <input 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="flex-1 p-3 border-2 border-red-700 rounded font-bold text-red-900 outline-none focus:bg-red-50"
              />
              <button onClick={handleSave} className="px-4 bg-red-700 text-white font-bold rounded border-2 border-red-900 hover:bg-red-800 active:scale-95">OK</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsEditing(true)}>
              <h4 className="text-xl font-bold text-red-900">{currentTeam.details.nume}</h4>
              <span className="text-red-700 group-hover:text-red-900">✏️</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleInvite} className="flex-1 bg-red-700 text-white px-4 py-2 font-bold rounded border-2 border-red-900 hover:bg-red-800 transition active:scale-95">
            {copyLinkText}
          </button>
          <button onClick={() => onLeave(currentTeam.details.id)} className="px-4 bg-red-100 text-red-700 font-bold rounded border-2 border-red-700 hover:bg-red-200 transition active:scale-95">
            Ieși
          </button>
        </div>
      </div>

      {teams.length > 1 && (
        <div className="flex gap-2 mb-4 justify-between items-center bg-red-100 p-2 rounded border-2 border-red-300">
          <button onClick={prevTeam} className="px-3 py-2 bg-red-700 text-white font-bold rounded hover:bg-red-800">◀</button>
          <span className="text-sm font-bold text-red-900">Schimbă Grupul</span>
          <button onClick={nextTeam} className="px-3 py-2 bg-red-700 text-white font-bold rounded hover:bg-red-800">▶</button>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {currentTeam.top.map((m, i) => (
          <div key={i} className={`p-3 rounded border-2 flex justify-between items-center ${m.member === numePreluat?.toUpperCase().trim() ? 'bg-amber-100 border-amber-700' : 'bg-white border-red-300'}`}>
            <div className="flex items-center gap-3">
              <span className={`font-bold text-lg ${i === 0 ? 'text-amber-600' : 'text-gray-600'}`}>#{i + 1}</span>
              <span className="font-bold text-red-900">{m.member}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-700">{parseInt(m.score) || 0} 🥚</span>
              
              {m.member !== numePreluat?.toUpperCase().trim() && (
                <button 
                  onClick={() => onProvoca(m.member, currentTeam.details.id)}
                  className="bg-red-700 text-white px-3 py-1 rounded font-bold text-sm transition hover:bg-red-800 active:scale-95 border-2 border-red-900"
                >
                  ⚔️
                </button>
              )}
            </div>
          </div>
        ))}
        
        {currentTeam.top.length <= 1 && (
          <div className="text-center py-8 text-red-700">
            <p className="font-bold">Invită prieteni pentru a juca 👥</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Selectoare Culoare și Regiune
const ColorSelector = ({ selected, onSelect }) => {
  const culori = [
    { id: 'red', color: '#dc2626', name: 'Roșu' },
    { id: 'blue', color: '#2563eb', name: 'Albastru' },
    { id: 'gold', color: '#f59e0b', name: 'Auriu' },
    { id: 'diamond', color: '#10b981', name: 'Verde' },
    { id: 'cosmic', color: '#8b5cf6', name: 'Violet' }
  ];
  
  return (
    <div className="w-full">
      <label className="block font-bold text-red-900 text-sm mb-2">Culoare Ou</label>
      <div className="flex gap-2 justify-between">
        {culori.map(c => (
          <button 
            key={c.id} 
            onClick={() => onSelect(c.id)} 
            className={`w-12 h-12 rounded-lg border-4 transition ${selected === c.id ? 'scale-110 border-red-900' : 'border-gray-300 opacity-50'}`}
            style={{ backgroundColor: c.color }}
            title={c.name}
          />
        ))}
      </div>
    </div>
  );
};

const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="w-full">
      <label className="block font-bold text-red-900 text-sm mb-2">Regiunea Ta</label>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-full p-3 bg-white rounded-lg border-2 border-red-700 font-bold text-left flex justify-between items-center hover:bg-red-50"
        >
          <span>{selectedRegion || "Alege regiunea..."}</span>
          <span className={`transition ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full mt-2 bg-yellow-50 rounded-lg border-2 border-red-700 p-3 grid grid-cols-2 gap-2 z-50 shadow-lg"
            >
              {REGIUNI_ISTORICE.map((regiune) => (
                <button 
                  key={regiune}
                  onClick={() => { 
                    onSelectRegion(regiune); 
                    setIsOpen(false); 
                  }}
                  className={`p-3 font-bold rounded border-2 transition ${selectedRegion === regiune ? 'bg-red-700 text-white border-red-900' : 'bg-white text-red-900 border-red-300 hover:bg-red-100'}`}
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
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return []; }
    }
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
    if (!nume || nume.length < 3) {
      setLoadedTeams([]);
      return;
    }

    const fetchAllTeams = async () => {
      let idsToFetch = getStoredTeamIds();
      const paramId = searchParams.get("joinTeam");
      
      if (paramId && !idsToFetch.includes(paramId)) {
        idsToFetch.push(paramId);
        addStoredTeamId(paramId); 
      }

      if (idsToFetch.length === 0) {
        setLoadedTeams([]);
        return;
      }

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
          if (data.success) {
            results.push({ details: data.details, top: data.top || [] });
            validIds.push(tid);
          }
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
    
    setLoadedTeams(prev => prev.map(t => {
      if (t.details.id === teamId) {
        return { ...t, details: { ...t.details, nume: nouNume.toUpperCase().trim() } };
      }
      return t;
    }));

    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actiune: 'redenumeste-echipa', teamId: teamId, newName: nouNume })
    });
  };

  const handleLeaveTeam = (teamId) => {
    if(confirm("Ești sigur că vrei să părăsești acest grup?")) { 
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
      body: JSON.stringify({ 
        actiune: 'provocare-duel', 
        jucator: nume, 
        oponentNume: oponent, 
        roomId: roomCode,
        teamId: teamId 
      })
    });

    router.push(`/joc/${roomCode}?host=true&skin=${userStats.skin}&provocare=true&teamId=${teamId}`);
  };

  if (!isHydrated) return null;

  const isNameInvalid = localNume.trim().length < 3 || localNume.trim().toUpperCase() === (nume || "").trim().toUpperCase();

  return (
    <div className="w-full max-w-4xl mx-auto pt-20 pb-16 px-4 space-y-8">
      
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-red-700 mb-2">Ciocnim.ro 🥚</h1>
        <p className="text-red-600 font-bold text-sm">Ciocniri Naționale: {totalGlobal?.toLocaleString('ro-RO') || '...'}</p>
      </div>

      {/* PROFIL JUCĂTOR */}
      <div className="bg-yellow-50 p-6 md:p-8 rounded-lg border-4 border-red-700 shadow-lg">
        <h2 className="text-2xl font-bold text-red-900 mb-6">👤 Profilul Tău</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-red-900 text-sm mb-2">Porecla Ta</label>
            <div className="flex gap-2">
              <input 
                value={localNume} 
                onChange={e => setLocalNume(e.target.value)}
                placeholder="Scrie porecla..."
                maxLength={30}
                className="flex-1 p-3 border-2 border-red-700 rounded-lg font-bold text-red-900 outline-none focus:bg-red-50"
              />
              <button 
                onClick={handleSaveNume} 
                disabled={isSavingName || isNameInvalid}
                className={`px-6 py-3 font-bold rounded-lg border-2 transition active:scale-95 ${isNameInvalid || isSavingName ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' : 'bg-red-700 text-white border-red-900 hover:bg-red-800'}`}
              >
                {isSavingName ? "..." : "Salvează"}
              </button>
            </div>
            {localNume.trim().length > 0 && localNume.trim().length < 3 && (
              <p className="text-red-600 font-bold text-xs mt-1">Minim 3 caractere!</p>
            )}
          </div>
          
          <RegionSelector selectedRegion={userStats.regiune} onSelectRegion={(reg) => setUserStats({...userStats, regiune: reg})} />
          <ColorSelector selected={userStats.skin || 'red'} onSelect={(s) => setUserStats({...userStats, skin: s})} />

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border-3 border-green-600 text-center">
              <p className="text-xs font-bold text-green-700 mb-1">VICTORII</p>
              <p className="text-3xl font-bold text-green-700">{parseInt(userStats.wins) || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-3 border-red-600 text-center">
              <p className="text-xs font-bold text-red-700 mb-1">ÎNFRÂNGERI</p>
              <p className="text-3xl font-bold text-red-700">{parseInt(userStats.losses) || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* BUTOANE ACȚIUNI */}
      <div className="space-y-3">
        <ActionButton 
          icon="⚔️" 
          title="Meci Cu Um Prieten" 
          subtitle="Joacă privat pe o cameră"
          onClick={() => { if (!nume || nume.length < 3) return alert("Porecla prea scurtă!"); triggerVibrate(); setIsPlayModalOpen(true); }} 
        />
        <ActionButton 
          icon="🏰" 
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
      </div>

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
      <DualLeaderboard 
        topRegiuni={topRegiuni} 
        topPlayers={topJucatori} 
        myName={nume} 
        myScore={userStats.wins || 0} 
      />

      {/* LINKURI TRADIȚII */}
      <div className="bg-yellow-50 p-6 md:p-8 rounded-lg border-4 border-red-700 shadow-lg">
        <h3 className="text-xl font-bold text-red-900 mb-6 text-center">📚 Tradiții și Ghiduri</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/traditii" className="bg-white p-4 rounded-lg border-3 border-red-500 hover:bg-red-50 transition text-center active:scale-95">
            <span className="text-3xl block mb-2">📖</span>
            <span className="font-bold text-xs text-red-900">Reguli</span>
          </Link>
          <Link href="/vopsit-natural" className="bg-white p-4 rounded-lg border-3 border-red-500 hover:bg-red-50 transition text-center active:scale-95">
            <span className="text-3xl block mb-2">🧅</span>
            <span className="font-bold text-xs text-red-900">Vopsit</span>
          </Link>
          <Link href="/calendar" className="bg-white p-4 rounded-lg border-3 border-red-500 hover:bg-red-50 transition text-center active:scale-95">
            <span className="text-3xl block mb-2">📅</span>
            <span className="font-bold text-xs text-red-900">Calendar</span>
          </Link>
          <Link href="/urari" className="bg-white p-4 rounded-lg border-3 border-red-500 hover:bg-red-50 transition text-center active:scale-95">
            <span className="text-3xl block mb-2">🕊️</span>
            <span className="font-bold text-xs text-red-900">Urări</span>
          </Link>
        </div>
      </div>

      <PlayModal isOpen={isPlayModalOpen} onClose={() => setIsPlayModalOpen(false)} router={router} userSkin={userStats.skin || 'red'} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-yellow-100 text-red-900">
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><p className="text-xl font-bold animate-pulse">Loading...</p></div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}