"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - PAGINA PRINCIPALĂ (V25.6 - ANTI-GHOST & STATS FIX)
 * ====================================================================================================
 */

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";
import { motion } from "framer-motion";
import Link from "next/link";

const REGIUNI_ISTORICE = ["Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", "Crișana", "Banat", "Maramureș", "Bucovina"];

// ==========================================================================================
// 1. COMPONENTA: Clasament Regiuni
// ==========================================================================================
const RegionLeaderboard = ({ data }) => {
  const maxScore = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(r => r.scor), 1);
  }, [data]);

  return (
    <div className="w-full bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl mt-4">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Clasament Regiuni</h3>
        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">LIVE</span>
      </div>

      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((reg, i) => (
            <div key={reg.regiune} className="group">
              <div className="flex justify-between items-end mb-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white/20 w-4">#{i + 1}</span>
                  <span className="text-sm font-bold text-white/90">{reg.regiune}</span>
                </div>
                <span className="text-xs font-black text-red-500 italic">{reg.scor.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(reg.scor / maxScore) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-red-800 to-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center opacity-20">
             <p className="text-xs font-bold uppercase tracking-widest">Așteptăm prima victorie...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================================================================
// 2. COMPONENTE UI MINIMALE & MODALE
// ==========================================================================================

const ActionButton = ({ onClick, icon, title, subtitle, variant = "glass", loading = false }) => {
  const isRed = variant === "red";
  return (
    <button 
      onClick={onClick} 
      disabled={loading} 
      className={`relative w-full flex items-center gap-4 p-4 md:p-5 rounded-[2.2rem] transition-all duration-300 active:scale-95 text-left border-2
        ${isRed ? "bg-red-600 border-red-500 hover:bg-red-500 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]" : "bg-white/5 border-white/10 hover:bg-white/10 text-white"}
        ${loading ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
    >
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isRed ? 'bg-white/20' : 'bg-white/10'}`}>
        {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : icon}
      </div>
      <div className="flex flex-col truncate">
        <span className="font-black text-lg md:text-xl uppercase leading-tight">{title}</span>
        {subtitle && <span className="text-[10px] uppercase tracking-widest opacity-50 mt-1 leading-tight">{subtitle}</span>}
      </div>
    </button>
  );
};

const PlayModal = ({ isOpen, onClose, router, userSkin }) => {
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
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
      alert("Codul trebuie să aibă minim 3 caractere.");
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#080808] p-6 md:p-8 rounded-[3rem] w-full max-w-sm border border-white/10 flex flex-col gap-6 relative shadow-[0_30px_60px_rgba(0,0,0,0.8)] mx-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white text-xl z-10">✕</button>
        <h3 className="text-2xl md:text-3xl font-black text-white text-center italic mt-2">Meci Privat</h3>
        <div className="flex flex-col gap-4">
          <button onClick={createRoom} className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_10px_20px_rgba(220,38,38,0.4)]">
            Creează Cameră
          </button>
          <div className="relative flex items-center py-2">
            <div className="h-px bg-white/10 w-full"></div>
            <span className="absolute left-1/2 -translate-x-1/2 bg-[#080808] px-4 text-[10px] font-black text-white/30">SAU</span>
          </div>
          <div className="flex gap-2 w-full">
            <input 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().trim())}
              placeholder="COD CAMERĂ"
              className="flex-1 min-w-0 bg-white/5 p-4 rounded-xl border border-white/10 font-black text-center text-white outline-none focus:border-red-600 uppercase tracking-widest text-sm md:text-base"
              maxLength={6}
            />
            <button onClick={joinRoom} className="shrink-0 bg-white/10 px-4 md:px-6 rounded-xl font-black text-white hover:bg-white/20 transition-all border border-white/10 text-sm md:text-base">INTRĂ</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Modal special pentru cine intra pe link fără să aibă cont/nume pus
const JoinNameModal = ({ isOpen, onJoin }) => {
  const [tempName, setTempName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-[100dvh] z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#080808] p-6 md:p-8 rounded-[3rem] w-full max-w-sm border border-red-500/30 flex flex-col gap-6 relative shadow-[0_30px_60px_rgba(220,38,38,0.2)] mx-auto text-center">
        <div className="text-6xl mb-2 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">🥚</div>
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight">Ai fost invitat!</h3>
          <p className="text-white/60 text-[10px] md:text-xs uppercase font-bold tracking-widest leading-relaxed">
            Alege-ți o poreclă ca să știe lumea cu cine dă oul cap în cap.
          </p>
        </div>
        <div className="flex flex-col gap-4 mt-2">
          <input 
            value={tempName}
            onChange={(e) => setTempName(e.target.value.toUpperCase())}
            placeholder="PORECLA TA..."
            className="w-full bg-white/5 p-4 rounded-xl border border-white/10 font-black text-center text-white outline-none focus:border-red-600 uppercase tracking-widest text-lg transition-colors shadow-inner"
            maxLength={12}
          />
          <button 
            onClick={() => {
              if (tempName.trim().length >= 3) onJoin(tempName);
              else alert("Băi, pune un nume de minim 3 litere!");
            }} 
            className="w-full bg-red-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_10px_20px_rgba(220,38,38,0.4)] active:scale-95"
          >
            Intră în Grup
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================================================================
// 3. GROUP HUB (Multi-Group Support)
// ==========================================================================================
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
                  title: 'Hai în grupul meu pe Ciocnim.ro!',
                  text: `Te provoc la o luptă în ${currentTeam.details.nume}. Intră aici:`,
                  url: inviteUrl,
              });
          } catch (err) { console.log('Share error:', err); }
      } else {
          navigator.clipboard.writeText(inviteUrl);
          setCopyLinkText("✅ COPIAT");
          setTimeout(() => setCopyLinkText("🔗 INVITĂ"), 2000);
      }
  };

  return (
    <div className="bg-white/5 p-6 rounded-[2.5rem] w-full border border-white/10 backdrop-blur-xl flex flex-col min-h-[300px] shadow-lg relative overflow-hidden">
       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

       <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-5">
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Grupul Tău</span>
                {teams.length > 1 && (
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                        {activeTeamIndex + 1} / {teams.length}
                    </span>
                )}
            </div>
            
            <div className="flex gap-2">
                <button onClick={handleInvite} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/30 transition-all active:scale-95 shadow-sm">
                    {copyLinkText}
                </button>
                <button onClick={() => onLeave(currentTeam.details.id)} className="bg-white/5 text-white/40 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase border border-white/10 active:scale-95">
                    Ieși
                </button>
            </div>
          </div>
          
          <div className="w-full">
            {isEditing ? (
              <div className="flex gap-2 mt-1 w-full">
                <input 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="bg-black/50 text-white font-black text-xl w-full p-2 rounded-lg border border-red-500 outline-none uppercase"
                />
                <button onClick={handleSave} className="bg-red-600 px-4 rounded-lg font-bold text-xs uppercase tracking-widest active:scale-95">OK</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full group/title cursor-pointer" onClick={() => setIsEditing(true)}>
                <h4 className="text-xl md:text-2xl font-black uppercase text-white truncate drop-shadow-md">{currentTeam.details.nume}</h4>
                <span className="text-white/20 group-hover/title:text-white/60 transition-colors text-sm">✏️</span>
              </div>
            )}
          </div>
       </div>

       {teams.length > 1 && (
           <div className="flex justify-between items-center mb-4 px-2 bg-black/20 rounded-full py-1">
               <button onClick={prevTeam} className="text-white/40 hover:text-white p-2 w-10 h-8 flex justify-center items-center rounded-full hover:bg-white/10">◀</button>
               <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Alege Grupul</span>
               <button onClick={nextTeam} className="text-white/40 hover:text-white p-2 w-10 h-8 flex justify-center items-center rounded-full hover:bg-white/10">▶</button>
           </div>
       )}

       <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[250px]">
          {currentTeam.top.map((m, i) => (
            <div key={i} className="bg-black/40 p-3 md:p-4 rounded-2xl flex justify-between items-center border border-white/5 hover:border-white/10 transition-colors group">
               <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <span className={`text-xs font-black ${i === 0 ? 'text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'text-white/20'}`}>#{i+1}</span>
                  <span className={`text-sm font-bold truncate ${m.member === numePreluat ? 'text-white italic' : 'text-white/80'}`}>{m.member}</span>
               </div>
               
               <div className="flex items-center gap-3 pl-2">
                  <span className="text-sm font-black text-green-500 drop-shadow-sm">{m.score} victorii</span>
                  
                  {m.member !== numePreluat && (
                    <button 
                      onClick={() => onProvoca(m.member, currentTeam.details.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-500 hover:scale-105 active:scale-95 shadow-[0_5px_15px_rgba(220,38,38,0.4)] flex items-center gap-1"
                    >
                      <span>⚔️</span> <span className="hidden sm:inline">Provoacă</span>
                    </button>
                  )}
               </div>
            </div>
          ))}
          
          {currentTeam.top.length <= 1 && (
            <div className="text-center py-8 flex flex-col items-center gap-3 opacity-60">
                <span className="text-4xl">👻</span>
                <p className="text-xs text-white uppercase font-black tracking-widest">E cam liniște aici...</p>
                <button onClick={handleInvite} className="mt-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors">
                    Adu prieteni în grup
                </button>
            </div>
          )}
       </div>
    </div>
  );
};

// ... Selectoare ...
const ColorSelector = ({ selected, onSelect }) => {
  const culori = [{ id: 'red', color: '#dc2626' }, { id: 'blue', color: '#2563eb' }, { id: 'gold', color: '#f59e0b' }, { id: 'diamond', color: '#10b981' }, { id: 'cosmic', color: '#8b5cf6' }];
  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-2">Culoare Ou</label>
      <div className="flex gap-2 w-full">
        {culori.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)} className={`flex-1 aspect-square rounded-xl transition-all duration-300 ${selected === c.id ? 'scale-110 border-4 border-white' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: c.color }} />
        ))}
      </div>
    </div>
  );
};

const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-2">Regiune</label>
      <div className="relative w-full">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-white/5 p-4 rounded-2xl text-sm font-black text-white flex justify-between items-center border border-white/10 hover:bg-white/10 transition-all">
          <span>{selectedRegion || "Alege regiunea..."}</span><span>▼</span>
        </button>
        {isOpen && (
          <div className="absolute top-[110%] left-0 w-full bg-[#111] rounded-[2rem] overflow-hidden z-[100] p-3 grid grid-cols-2 gap-2 shadow-2xl border border-white/10">
            {REGIUNI_ISTORICE.map((regiune) => (
              <button key={regiune} onClick={() => { onSelectRegion(regiune); setIsOpen(false); }} className={`p-3 text-[10px] font-black uppercase rounded-xl ${selectedRegion === regiune ? 'bg-red-600 text-white' : 'text-white/60 hover:bg-white/10'}`}>
                {regiune}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================================================================
// 4. LOGICA HOME PRINCIPALĂ
// ==========================================================================================

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalGlobal, topRegiuni, nume, setNume, userStats, setUserStats, isHydrated, triggerVibrate } = useGlobalStats();
  
  const [loadedTeams, setLoadedTeams] = useState([]); 
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  
  // Control pentru Pop-up-ul de interceptare a invitațiilor
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Stare locală pentru input-ul de nume (PREVINE FANTOMELE)
  const [localNume, setLocalNume] = useState("");

  // Sincronizare inițială pentru input-ul de nume
  useEffect(() => {
      if (nume && !localNume) setLocalNume(nume);
  }, [nume, localNume]);

  const getStoredTeamIds = () => {
      const stored = localStorage.getItem("c_teamIds");
      if (stored) {
          try {
              return JSON.parse(stored);
          } catch (e) {
              return [];
          }
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

  // Verificare specială DOAR pentru utilizatorii care n-au nume și intră din link
  useEffect(() => {
    const paramId = searchParams.get("joinTeam");
    if (isHydrated && paramId && (!nume || nume.length < 3)) {
      setShowJoinModal(true);
    }
  }, [isHydrated, searchParams, nume]);

  // Handler-ul pentru când userul dă submit din noul Pop-Up
  const handleModalJoin = (alesNume) => {
    setNume(alesNume);
    setShowJoinModal(false);
  };

  // Funcția sigură pentru salvarea numelui (șterge fantomele prin API)
  const handleSaveNume = async () => {
      const finalName = localNume.trim().toUpperCase();
      if (finalName.length < 3) return alert("Băi, pune un nume de minim 3 litere!");
      if (finalName === nume) return;

      triggerVibrate();
      
      // Dacă aveai deja nume și ești în grupuri, spunem API-ului să facă switch ca să eviți fantomele
      if (nume && loadedTeams.length > 0) {
          try {
              await fetch('/api/ciocnire', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      actiune: 'schimba-porecla',
                      oldName: nume,
                      newName: finalName,
                      teamIds: loadedTeams.map(t => t.details.id)
                  })
              });
          } catch(e) {}
      }

      setNume(finalName);
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
          } catch (e) { 
              console.error("Eroare incarcare echipa:", tid);
          }
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
            details: { id: data.teamId, nume: `GRUPUL LUI ${nume.toUpperCase()}` }, 
            top: [{ member: nume, score: 0 }] 
        };
        
        setLoadedTeams(prev => [...prev, newTeamData]);
        setActiveTeamIndex(loadedTeams.length);
      }
    } catch (e) { alert("Eroare la crearea grupului."); } 
    finally { setLoadingTeam(false); }
  };

  const handleRenameTeam = async (teamId, nouNume) => {
    if (nouNume.length < 3) return alert("Nume prea scurt.");
    triggerVibrate();
    
    setLoadedTeams(prev => prev.map(t => {
        if (t.details.id === teamId) {
            return { ...t, details: { ...t.details, nume: nouNume.toUpperCase() } };
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

    // Am adăugat &provocare=true în link ca Arena să știe să aștepte 7s în caz de AFK
    router.push(`/joc/${roomCode}?host=true&skin=${userStats.skin}&provocare=true`);
  };

  if (!isHydrated) return null;

  return (
    <div className="w-full flex flex-col items-center gap-6 max-w-4xl mx-auto pt-24 pb-12 px-5 z-10 relative">
      
      {/* NAV BAR SUPERIOR */}
      <nav className="fixed top-6 left-0 w-full flex justify-center z-[1000] px-4 pointer-events-none">
        <div className="bg-[#080808]/90 backdrop-blur-3xl px-6 py-3 md:px-8 md:py-4 rounded-full flex items-center justify-between gap-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-auto min-w-[300px]">
          <div className="flex flex-col">
            <span className="font-black text-xl md:text-2xl tracking-tighter text-white leading-none italic">Ciocnim<span className="text-red-600">.ro</span></span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col items-end">
             <span className="text-white/40 font-black text-[8px] uppercase tracking-widest mb-1">Bilanț Național</span>
             <span className="font-black text-yellow-500 text-lg md:text-2xl leading-none tabular-nums drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]">
                {totalGlobal?.toLocaleString('ro-RO') || '...'}
             </span>
          </div>
        </div>
      </nav>

      {/* TITLU SEO CENTRAT */}
      <div className="text-center mt-6 mb-2">
        <h1 className="text-2xl md:text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-tighter italic drop-shadow-sm">
          Ciocnește Ouă Online
        </h1>
        <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mt-2">Tradiția de Paște 2026</p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PROFIL JUCĂTOR */}
        <div className="bg-white/5 p-6 md:p-8 rounded-[3rem] flex flex-col gap-4 border border-white/5 backdrop-blur-2xl shadow-xl">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[10px] font-black uppercase text-red-600 tracking-widest pl-2">Alegeți Numele</label>
            <div className="flex gap-2 w-full mt-1">
              <input 
                value={localNume} 
                onChange={e => setLocalNume(e.target.value.toUpperCase())}
                placeholder="PORECLA..."
                className="w-full bg-black/50 p-4 rounded-2xl text-xl font-black focus:border-red-600 border-2 border-transparent outline-none text-white text-center transition-all shadow-inner"
              />
              {localNume !== nume && localNume.length >= 3 && (
                <button onClick={handleSaveNume} className="bg-red-600 px-6 rounded-2xl font-black uppercase tracking-widest text-white shadow-[0_10px_20px_rgba(220,38,38,0.4)] active:scale-95 transition-all">
                  SALVEAZĂ
                </button>
              )}
            </div>
          </div>
          
          <RegionSelector selectedRegion={userStats.regiune} onSelectRegion={(reg) => setUserStats({...userStats, regiune: reg})} />
          <ColorSelector selected={userStats.skin || 'red'} onSelect={(s) => setUserStats({...userStats, skin: s})} />

          <div className="flex justify-between gap-4 mt-4">
             <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                <span className="text-[9px] text-white/30 font-black uppercase block mb-1">Victorii</span>
                <span className="text-2xl font-black text-green-500 italic">{userStats.wins || 0}</span>
             </div>
             <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                <span className="text-[9px] text-white/30 font-black uppercase block mb-1">Înfrângeri</span>
                <span className="text-2xl font-black text-red-600 italic">{userStats.losses || 0}</span>
             </div>
          </div>
        </div>

        {/* SECȚIUNE ACȚIUNI / HUB GRUP + BUTOANE EXTRA */}
        <div className="flex flex-col justify-start gap-5">
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
          
          <div className="space-y-4">
             <ActionButton variant="red" icon="⚔️" title="Meci cu un Prieten" subtitle="Creează o cameră privată cu cod secret" onClick={() => { if (nume.length < 3) return alert("Nume prea scurt!"); triggerVibrate(); setIsPlayModalOpen(true); }} />
             
             <ActionButton variant="glass" icon="🏰" title={loadedTeams.length > 0 ? "Alt Grup" : "Creează Grup"} subtitle={loadedTeams.length > 0 ? "Adaugă un grup nou" : "Clasament privat pentru familia ta"} onClick={handleCreateTeam} loading={loadingTeam} />
             
             <ActionButton variant="glass" icon="🌍" title="Arena Globală" subtitle="Joacă aleatoriu cu cineva din țară" onClick={() => { if (nume.length < 3) return alert("Nume prea scurt!"); triggerVibrate(); router.push(`/joc/global-arena?skin=${userStats.skin || 'red'}`); }} />
          </div>
        </div>
      </div>

      <RegionLeaderboard data={topRegiuni} />

      {/* BUTON TRADIȚII SEO MUTAT JOS */}
      <div className="w-full flex justify-center mt-6">
        <Link href="/traditii" className="bg-white/5 border border-white/10 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-lg">
            📖 Află Regulile și Tradițiile
        </Link>
      </div>

      <PlayModal isOpen={isPlayModalOpen} onClose={() => setIsPlayModalOpen(false)} router={router} userSkin={userStats.skin || 'red'} />
      <JoinNameModal isOpen={showJoinModal} onJoin={handleModalJoin} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#010101] text-white overflow-hidden selection:bg-red-600">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-600/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] bg-yellow-600/5 rounded-full blur-[150px]" />
      </div>
      <Suspense fallback={<div className="h-screen flex items-center justify-center text-white/20 text-[10px] font-black uppercase tracking-widest">Sincronizare...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}