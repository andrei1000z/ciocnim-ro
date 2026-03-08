"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - PAGINA PRINCIPALĂ (V30.5 - FIX SCOR "NULL", MOBILE GRID & Z-INDEX)
 * ====================================================================================================
 */

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const REGIUNI_ISTORICE = ["Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", "Crișana", "Banat", "Maramureș", "Bucovina"];

// ==========================================================================================
// 1. COMPONENTE UI: Clasament Dual
// ==========================================================================================
const DualLeaderboard = ({ topRegiuni, topPlayers, myName, myScore }) => {
  const [view, setView] = useState("jucatori");

  const toggleView = () => {
    setView(prev => prev === "jucatori" ? "regiuni" : "jucatori");
  };

  const maxRegionScore = useMemo(() => {
    if (!topRegiuni || topRegiuni.length === 0) return 1;
    return Math.max(...topRegiuni.map(r => r.scor), 1);
  }, [topRegiuni]);

  // Logica REPARATĂ pentru Rangul utilizatorului + Prevenire afisare " - victorii"
  const { myRank, rankDeasupra, ouaNecesareTop10, ouaUrmatorulLoc } = useMemo(() => {
      if (!topPlayers || !myName || myName.trim() === "") return { myRank: null };
      
      const cleanMyName = myName.trim().toUpperCase();
      const myIndexInTop = topPlayers.findIndex(p => p.nume === cleanMyName);
      // Asigurare scor numeric strict
      const myScoreNum = parseInt(myScore) || 0; 
      
      // Ești în TOP 10
      if (myIndexInTop !== -1) {
          if (myIndexInTop === 0) {
              return { myRank: 1, rankDeasupra: null, ouaNecesareTop10: 0, ouaUrmatorulLoc: 0 };
          } else {
              const scorPrecedent = parseInt(topPlayers[myIndexInTop - 1].scor) || 0;
              const necesar = Math.max(1, scorPrecedent - myScoreNum + 1);
              return { myRank: myIndexInTop + 1, rankDeasupra: myIndexInTop, ouaNecesareTop10: 0, ouaUrmatorulLoc: necesar };
          }
      }
      
      // Ești SUB TOP 10
      const scorLocul10 = topPlayers.length === 10 ? (parseInt(topPlayers[9].scor) || 1) : (topPlayers.length > 0 ? (parseInt(topPlayers[topPlayers.length - 1].scor) || 1) : 1);
      
      let diferenta = scorLocul10 - myScoreNum;
      if (diferenta <= 0) diferenta = 1; 
      
      const nameHash = cleanMyName.length % 3;
      const rankCalculat = 10 + (diferenta * 2) + nameHash + (myScoreNum % 2); 
      
      return { 
        myRank: rankCalculat, 
        rankDeasupra: Math.max(11, rankCalculat - (Math.floor(Math.random() * 2) + 1)), 
        ouaNecesareTop10: diferenta, 
        ouaUrmatorulLoc: 1 
      };
  }, [topPlayers, myName, myScore]);

  // Validăm datele afișate
  const safeMyScore = parseInt(myScore) || 0;

  return (
    <div className="w-full bg-[#0a0505] p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border-2 border-red-900/40 backdrop-blur-3xl mt-4 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-10">
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-700/10 rounded-full blur-[60px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6 md:mb-8 px-2 bg-[#140a0a] p-2 rounded-2xl border border-red-900/30 shadow-inner relative z-10">
        <button onClick={toggleView} className="text-red-500/40 hover:text-red-500 p-2 w-10 h-8 flex justify-center items-center rounded-xl hover:bg-red-900/20 transition-colors">◀</button>
        <div className="flex flex-col items-center">
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-amber-500/90 drop-shadow-sm text-center">
                {view === "jucatori" ? "Top Jucători" : "Top Regiuni"}
            </h3>
            <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 animate-pulse">Live</span>
        </div>
        <button onClick={toggleView} className="text-red-500/40 hover:text-red-500 p-2 w-10 h-8 flex justify-center items-center rounded-xl hover:bg-red-900/20 transition-colors">▶</button>
      </div>

      <AnimatePresence mode="wait">
        {view === "jucatori" ? (
          <motion.div key="jucatori" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3 relative z-10">
            {topPlayers && topPlayers.length > 0 ? (
              <div className="flex flex-col gap-2">
                
                {/* LISTA TOP 10 */}
                {topPlayers.map((p, i) => (
                  <div key={i} className={`flex justify-between items-center p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] border transition-colors ${p.nume === myName?.toUpperCase().trim() ? 'bg-red-900/40 border-red-500/60 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-[#1a0f0f] border-red-900/20 hover:border-red-500/30'}`}>
                    <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                      <span className={`text-xs font-black w-5 flex-shrink-0 ${i === 0 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] text-sm' : (i === 1 ? 'text-gray-300' : (i === 2 ? 'text-amber-700' : 'text-white/30'))}`}>#{i + 1}</span>
                      <span className={`text-xs md:text-sm font-bold truncate ${p.nume === myName?.toUpperCase().trim() ? 'text-white italic' : 'text-white/80'}`}>{p.nume}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                       <span className="text-sm font-black text-green-500 drop-shadow-sm">{parseInt(p.scor) || 0}</span>
                       <span className="text-[10px] text-green-500/50">🥚</span>
                    </div>
                  </div>
                ))}

                {/* ZONA PERSONALIZATĂ [EU] */}
                {myName && myRank !== null && (
                  <div className="mt-4 md:mt-6 border-t border-dashed border-red-900/50 pt-4 md:pt-6 relative">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#0a0505] px-4 py-1 text-[8px] font-black uppercase tracking-[0.3em] text-amber-500/50 -translate-y-1/2 rounded-full border border-red-900/30">
                       Tu
                     </div>
                     
                     <div className="flex justify-between items-center p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] bg-red-900/30 border border-red-500/50 relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-[url('/pattern-wood.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="flex items-center gap-2 md:gap-3 z-10 overflow-hidden">
                          <span className={`text-xs font-black flex-shrink-0 ${myRank <= 10 ? 'text-amber-500' : 'text-white/50'}`}>#{myRank}</span>
                          <span className="text-xs md:text-sm font-bold text-white italic truncate">{myName} (Tu)</span>
                        </div>
                        <span className="text-sm font-black text-green-500 drop-shadow-sm z-10 flex-shrink-0">{safeMyScore} 🥚</span>
                     </div>
                     
                     {/* MESAJELE DINAMICE DE PROGRESIE CLARE */}
                     <p className="text-center mt-3 md:mt-4 text-[9px] md:text-xs uppercase font-black tracking-widest text-white/60 drop-shadow-sm leading-relaxed px-2">
                       {myRank === 1 ? (
                         <span className="text-amber-500 animate-pulse">Ești Regele Arenei! 👑</span>
                       ) : myRank <= 10 ? (
                         ouaUrmatorulLoc === 1 ? (
                           <span className="text-amber-500 animate-pulse">Încă 1 victorie te urcă pe locul {rankDeasupra}! 🔥</span>
                         ) : (
                           <>Mai ai nevoie de <span className="text-red-500">{ouaUrmatorulLoc} victorii</span> până pe locul {rankDeasupra}!</>
                         )
                       ) : (
                         ouaNecesareTop10 === 1 ? (
                           <span className="text-amber-500 animate-pulse">Încă 1 victorie și intri în Top 10! 🔥</span>
                         ) : (
                           <>
                             Încă <span className="text-green-500">1 victorie</span> te urcă pe locul {rankDeasupra}!<br/>
                             <span className="text-amber-500/70 mt-1 block">Mai ai nevoie de {ouaNecesareTop10} victorii pentru Top 10.</span>
                           </>
                         )
                       )}
                     </p>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="py-10 text-center opacity-40">
                 <span className="text-4xl block mb-3 grayscale">🥚</span>
                 <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">Niciun jucător în clasament încă...</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="regiuni" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 relative z-10">
            {topRegiuni && topRegiuni.length > 0 ? (
              topRegiuni.map((reg, i) => (
                <div key={reg.regiune} className="group">
                  <div className="flex justify-between items-end mb-1.5 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white/20 w-4">#{i + 1}</span>
                      <span className="text-xs md:text-sm font-bold text-white/90 truncate">{reg.regiune}</span>
                    </div>
                    <span className="text-xs font-black text-red-500 italic flex-shrink-0">{(parseInt(reg.scor) || 0).toLocaleString()} 🥚</span>
                  </div>
                  <div className="h-2 w-full bg-[#1a0f0f] rounded-full overflow-hidden border border-red-900/30">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${(parseInt(reg.scor || 0) / maxRegionScore) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-red-900 to-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center opacity-40">
                 <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Așteptăm prima bătălie între regiuni...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
      className={`relative w-full flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-[2rem] md:rounded-[2.2rem] transition-all duration-300 active:scale-95 text-left border-2 overflow-hidden
        ${isRed ? "bg-red-700 border-red-500 hover:bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]" : "bg-[#0a0505] border-red-900/30 hover:bg-[#140a0a] hover:border-red-500/50 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]"}
        ${loading ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
    >
      <div className="absolute inset-0 bg-[url('/pattern-wood.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.2rem] md:rounded-2xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0 relative z-10 ${isRed ? 'bg-white/20 shadow-inner' : 'bg-red-900/20 border border-red-900/50'}`}>
        {loading ? <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : icon}
      </div>
      <div className="flex flex-col truncate relative z-10 w-full pr-2">
        <span className="font-black text-[15px] md:text-xl uppercase leading-tight tracking-tight truncate">{title}</span>
        {subtitle && <span className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-60 mt-0.5 md:mt-1 leading-tight text-amber-500/70 truncate">{subtitle}</span>}
      </div>
    </button>
  );
};

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
    <div className="fixed inset-0 h-[100dvh] z-[99999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0505] p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] w-full max-w-sm border-2 border-red-900/50 flex flex-col gap-6 relative shadow-[0_50px_100px_rgba(0,0,0,0.9)] mx-auto overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-800/20 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/pattern-wood.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        
        <button onClick={onClose} className="absolute top-5 right-5 md:top-6 md:right-6 text-white/40 hover:text-white text-lg md:text-xl z-10 w-8 h-8 bg-[#1a0f0f] rounded-full flex items-center justify-center border border-red-900/30">✕</button>
        <h3 className="text-xl md:text-3xl font-black text-white text-center italic mt-2 relative z-10 drop-shadow-md">Meci cu un prieten</h3>
        
        <div className="flex flex-col gap-4 relative z-10 mt-2">
          <button onClick={createRoom} className="w-full bg-red-700 text-white p-4 md:p-5 rounded-[1.5rem] md:rounded-2xl font-black text-sm md:text-base uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.4)] border-2 border-red-500/50 active:scale-95">
            Creează Cameră
          </button>
          
          <div className="relative flex items-center py-2 md:py-3">
            <div className="h-px bg-red-900/50 w-full"></div>
            <span className="absolute left-1/2 -translate-x-1/2 bg-[#0a0505] px-3 md:px-4 text-[9px] md:text-[10px] font-black text-amber-500/50 border border-red-900/50 rounded-full">SAU</span>
          </div>
          
          <div className="flex gap-2 w-full">
            <input 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().trim())}
              placeholder="COD CAMERĂ"
              className="flex-1 min-w-0 bg-[#140a0a] p-3 md:p-4 rounded-[1.2rem] md:rounded-xl border border-red-900/50 font-black text-center text-white outline-none focus:border-red-500 uppercase tracking-widest text-xs md:text-base transition-colors shadow-inner placeholder:text-red-900/50"
              maxLength={6}
            />
            <button onClick={joinRoom} className="shrink-0 bg-red-900/30 px-4 md:px-6 rounded-[1.2rem] md:rounded-xl font-black text-white hover:bg-red-800 transition-all border border-red-700/50 text-xs md:text-base active:scale-95 shadow-md">INTRĂ</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================================================================
// 3. GROUP HUB (Grupuri)
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
          } catch (err) {}
      } else {
          navigator.clipboard.writeText(inviteUrl);
          setCopyLinkText("✅ COPIAT");
          setTimeout(() => setCopyLinkText("🔗 INVITĂ"), 2000);
      }
  };

  return (
    <div className="bg-[#0a0505] p-5 md:p-6 rounded-[2.5rem] md:rounded-[3rem] w-full border-2 border-red-900/30 backdrop-blur-3xl flex flex-col min-h-[280px] shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden z-10">
       <div className="absolute top-0 right-0 w-40 h-40 bg-red-700/10 rounded-full blur-[60px] -z-10 pointer-events-none"></div>

       <div className="flex flex-col gap-3 md:gap-4 mb-5 border-b border-red-900/30 pb-4 relative z-10">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-wrap items-center gap-2 max-w-[50%]">
                <span className="text-[8px] md:text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] bg-amber-500/10 px-2 py-1 md:px-3 md:py-1 rounded-full border border-amber-500/20 drop-shadow-sm truncate">Grup Privat</span>
                {teams.length > 1 && (
                    <span className="text-[8px] md:text-[10px] font-black bg-red-900/20 px-2 py-1 md:px-3 rounded-full text-white/60 border border-red-900/50 flex-shrink-0">
                        {activeTeamIndex + 1}/{teams.length}
                    </span>
                )}
            </div>
            
            <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
                <button onClick={handleInvite} className="bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-[0.8rem] md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border-2 border-red-500/50 hover:bg-red-600 transition-all active:scale-95 shadow-[0_5px_15px_rgba(220,38,38,0.4)]">
                    {copyLinkText}
                </button>
                <button onClick={() => onLeave(currentTeam.details.id)} className="bg-[#140a0a] text-white/40 px-2.5 py-1.5 md:px-3 md:py-2 rounded-[0.8rem] md:rounded-xl hover:bg-red-900 hover:text-white transition-all text-[8px] md:text-[10px] font-black uppercase border border-red-900/50 active:scale-95">
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
                  className="bg-[#140a0a] text-white font-black text-sm md:text-xl w-full p-2.5 md:p-3 rounded-xl border-2 border-red-600 outline-none uppercase shadow-inner focus:bg-[#1a0f0f] transition-colors"
                />
                <button onClick={handleSave} className="bg-red-700 px-4 md:px-5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 shadow-md border border-red-500/50">OK</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3 w-full group/title cursor-pointer mt-1 md:mt-2" onClick={() => setIsEditing(true)}>
                <h4 className="text-[17px] md:text-3xl font-black uppercase text-white truncate drop-shadow-md italic leading-tight">{currentTeam.details.nume}</h4>
                <span className="text-white/20 group-hover/title:text-red-500 transition-colors text-[10px] md:text-sm flex-shrink-0">✏️</span>
              </div>
            )}
          </div>
       </div>

       {teams.length > 1 && (
           <div className="flex justify-between items-center mb-4 px-2 bg-[#140a0a] rounded-full py-1 border border-red-900/40 relative z-10 shadow-inner">
               <button onClick={prevTeam} className="text-red-500/40 hover:text-red-500 p-1 md:p-2 w-8 md:w-10 h-6 md:h-8 flex justify-center items-center rounded-full hover:bg-red-900/20">◀</button>
               <span className="text-[9px] md:text-[10px] uppercase font-black text-amber-500/70 tracking-[0.3em] truncate px-2">Schimbă Grupul</span>
               <button onClick={nextTeam} className="text-red-500/40 hover:text-red-500 p-1 md:p-2 w-8 md:w-10 h-6 md:h-8 flex justify-center items-center rounded-full hover:bg-red-900/20">▶</button>
           </div>
       )}

       <div className="space-y-2 md:space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 max-h-[250px] relative z-10">
          {currentTeam.top.map((m, i) => (
            <div key={i} className={`p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] flex justify-between items-center border transition-all group ${m.member === numePreluat?.toUpperCase().trim() ? 'bg-red-900/30 border-red-500/40 shadow-sm' : 'bg-[#140a0a] border-red-900/20 hover:border-red-500/30'}`}>
               <div className="flex items-center gap-2 md:gap-3 overflow-hidden flex-1">
                  <span className={`text-[10px] md:text-xs font-black flex-shrink-0 ${i === 0 ? 'text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'text-white/20'}`}>#{i+1}</span>
                  <span className={`text-[11px] md:text-sm font-bold truncate ${m.member === numePreluat?.toUpperCase().trim() ? 'text-white italic' : 'text-white/80'}`}>{m.member}</span>
               </div>
               
               <div className="flex items-center gap-2 md:gap-4 pl-1 flex-shrink-0">
                  <span className="text-xs md:text-sm font-black text-green-500 drop-shadow-sm flex items-center gap-0.5 md:gap-1">
                      {parseInt(m.score) || 0} <span className="text-[8px] md:text-[10px] grayscale">🥚</span>
                  </span>
                  
                  {m.member !== numePreluat?.toUpperCase().trim() && (
                    <button 
                      onClick={() => onProvoca(m.member, currentTeam.details.id)}
                      className="bg-red-700 text-white px-2 py-1.5 md:px-4 md:py-3 rounded-[0.8rem] md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-600 hover:scale-105 active:scale-95 shadow-[0_5px_15px_rgba(220,38,38,0.4)] border border-red-500/50 flex items-center gap-1.5"
                    >
                      <span className="text-[10px] md:text-sm">⚔️</span> <span className="hidden sm:inline">Provoacă</span>
                    </button>
                  )}
               </div>
            </div>
          ))}
          
          {currentTeam.top.length <= 1 && (
            <div className="text-center py-6 md:py-10 flex flex-col items-center gap-3 md:gap-4 opacity-60">
                <span className="text-3xl md:text-5xl grayscale opacity-50">👻</span>
                <p className="text-[8px] md:text-[10px] text-white uppercase font-black tracking-[0.4em]">Nu există concurență încă...</p>
                <button onClick={handleInvite} className="mt-1 md:mt-2 bg-red-900/20 hover:bg-red-900/40 px-4 py-2 md:px-6 md:py-3 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors border border-red-900/50">
                    Invită prieteni
                </button>
            </div>
          )}
       </div>
    </div>
  );
};

// ==========================================================================================
// Selectoare Setări
// ==========================================================================================
const ColorSelector = ({ selected, onSelect }) => {
  const culori = [{ id: 'red', color: '#dc2626' }, { id: 'blue', color: '#2563eb' }, { id: 'gold', color: '#f59e0b' }, { id: 'diamond', color: '#10b981' }, { id: 'cosmic', color: '#8b5cf6' }];
  return (
    <div className="flex flex-col gap-2 md:gap-3 w-full mt-2 relative z-10">
      <label className="text-[10px] font-black uppercase text-amber-500/70 tracking-[0.3em] pl-3 text-center sm:text-left drop-shadow-sm">Culoarea Oului</label>
      <div className="flex justify-center sm:justify-start gap-2 md:gap-3 w-full">
        {culori.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)} className={`w-10 h-10 md:w-14 md:h-14 rounded-[1rem] md:rounded-2xl transition-all duration-300 ${selected === c.id ? 'scale-110 border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'opacity-40 hover:opacity-100 border border-transparent'}`} style={{ backgroundColor: c.color }} />
        ))}
      </div>
    </div>
  );
};

const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2 md:gap-3 w-full mt-2 relative z-[100]">
      <label className="text-[10px] font-black uppercase text-amber-500/70 tracking-[0.3em] pl-3 drop-shadow-sm text-center sm:text-left">Regiunea Ta</label>
      <div className="relative w-full">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-[#140a0a] p-4 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] text-sm md:text-base font-black text-white flex justify-between items-center border border-red-900/40 hover:bg-red-900/20 transition-all shadow-inner">
          <span className="uppercase tracking-widest truncate pr-2">{selectedRegion || "Alege regiunea..."}</span>
          <span className={`transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[110%] left-0 w-full bg-[#140a0a] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden z-[101] p-2 md:p-3 grid grid-cols-2 gap-2 shadow-[0_30px_60px_rgba(0,0,0,0.95)] border-2 border-red-900/80">
              {REGIUNI_ISTORICE.map((regiune) => (
                <button key={regiune} onClick={() => { onSelectRegion(regiune); setIsOpen(false); }} className={`p-3 md:p-4 text-[9px] md:text-xs font-black uppercase tracking-widest rounded-[1rem] md:rounded-[1.2rem] transition-colors truncate ${selectedRegion === regiune ? 'bg-red-700 text-white shadow-md border border-red-500/50' : 'text-white/80 hover:bg-red-900/30 hover:text-white border border-transparent'}`}>
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

// ==========================================================================================
// 4. LOGICA HOME PRINCIPALĂ
// ==========================================================================================

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
    <div className="w-full flex flex-col items-center gap-6 md:gap-8 max-w-5xl mx-auto pt-20 md:pt-24 pb-16 px-4 md:px-6 z-10 relative">
      
      {/* NAV BAR SUPERIOR */}
      <nav className="fixed top-3 md:top-6 left-0 w-full flex justify-center z-[1000] px-4 pointer-events-none">
        <div className="bg-[#0a0505]/95 backdrop-blur-3xl px-4 py-2.5 md:px-8 md:py-4 rounded-full flex items-center justify-between gap-4 md:gap-10 border border-red-900/40 shadow-[0_20px_40px_rgba(0,0,0,0.9)] pointer-events-auto w-full max-w-[400px] md:max-w-max">
          <div className="flex flex-col flex-shrink-0">
            <span className="font-black text-lg md:text-2xl tracking-tighter text-white leading-none italic drop-shadow-md">Ciocnim<span className="text-red-600">.ro</span></span>
          </div>
          <div className="w-px h-6 md:h-8 bg-red-900/50 hidden xs:block"></div>
          <div className="flex flex-col items-end flex-shrink-0">
             <span className="text-amber-500/60 font-black text-[7px] md:text-[10px] uppercase tracking-[0.3em] mb-0.5 md:mb-1">CIOCNIRI NAȚIONALE</span>
             <span className="font-black text-yellow-500 text-sm md:text-2xl leading-none tabular-nums drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                {totalGlobal?.toLocaleString('ro-RO') || '...'} <span className="text-[9px] md:text-sm text-yellow-500/50 uppercase tracking-widest">ciocniri</span>
             </span>
          </div>
        </div>
      </nav>

      {/* TITLU SEO CENTRAT */}
      <div className="text-center mt-6 md:mt-6 mb-0 md:mb-2">
        <h1 className="text-3xl md:text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500 tracking-tighter italic drop-shadow-lg filter drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] px-2 leading-tight">
          Ciocnește Ouă <br className="md:hidden" /> Online
        </h1>
        <p className="text-amber-500/40 text-[9px] md:text-xs font-bold uppercase tracking-[0.5em] mt-2 md:mt-3">Păstrăm Tradiția și digital în 2026</p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
        
        {/* PROFIL JUCĂTOR */}
        <div className="bg-[#0a0505] p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] flex flex-col gap-4 md:gap-6 border-2 border-red-900/40 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-visible z-20">
          <div className="absolute inset-0 bg-[url('/pattern-wood.png')] opacity-5 mix-blend-overlay pointer-events-none rounded-[inherit]"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-800/20 to-transparent pointer-events-none rounded-t-[inherit]"></div>

          <div className="flex flex-col gap-2 w-full relative z-10">
            <label className="text-[10px] md:text-xs font-black uppercase text-amber-500 tracking-[0.4em] pl-3 drop-shadow-sm text-center sm:text-left">Numele tău</label>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full mt-1">
              <input 
                value={localNume} 
                onChange={e => setLocalNume(e.target.value)}
                placeholder="Scrie numele aici..."
                className="w-full bg-[#140a0a] p-4 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] text-lg md:text-xl font-black focus:border-red-500 border border-red-900/40 outline-none text-white text-center sm:text-left transition-colors shadow-inner uppercase placeholder:text-red-900/40"
              />
              <button 
                onClick={handleSaveNume} 
                disabled={isSavingName || isNameInvalid}
                className={`w-full sm:w-auto px-6 py-4 md:px-8 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] font-black uppercase tracking-widest transition-all border-2 
                  ${isNameInvalid || isSavingName 
                    ? 'bg-red-900/10 border-red-900/20 text-white/20 cursor-not-allowed' 
                    : 'bg-red-700 border-red-500/50 hover:bg-red-600 text-white active:scale-95 shadow-[0_15px_30px_rgba(220,38,38,0.4)]'}`}
              >
                {isSavingName ? "..." : "Salvează"}
              </button>
            </div>
            
            {localNume.trim().length > 0 && localNume.trim().length < 3 && (
              <span className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest pl-3 animate-pulse mt-0.5 text-center sm:text-left">Minim 3 caractere!</span>
            )}
          </div>
          
          <RegionSelector selectedRegion={userStats.regiune} onSelectRegion={(reg) => setUserStats({...userStats, regiune: reg})} />
          <ColorSelector selected={userStats.skin || 'red'} onSelect={(s) => setUserStats({...userStats, skin: s})} />

          <div className="flex justify-between gap-3 md:gap-4 mt-1 md:mt-2 relative z-10">
             <div className="flex-1 bg-[#140a0a] p-3 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] text-center border border-red-900/30 shadow-inner">
                <span className="text-[9px] md:text-[10px] text-amber-500/50 font-black uppercase tracking-widest block mb-1 md:mb-2 truncate px-1">Victorii</span>
                <span className="text-2xl md:text-4xl font-black text-green-500 italic drop-shadow-md">{parseInt(userStats.wins) || 0}</span>
             </div>
             <div className="flex-1 bg-[#140a0a] p-3 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] text-center border border-red-900/30 shadow-inner">
                <span className="text-[9px] md:text-[10px] text-amber-500/50 font-black uppercase tracking-widest block mb-1 md:mb-2 truncate px-1">Înfrângeri</span>
                <span className="text-2xl md:text-4xl font-black text-red-600 italic drop-shadow-md">{parseInt(userStats.losses) || 0}</span>
             </div>
          </div>
        </div>

        {/* SECȚIUNE ACȚIUNI / HUB GRUP + BUTOANE EXTRA */}
        <div className="flex flex-col justify-start gap-4 md:gap-6 z-10 w-full h-full">
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
          
          <div className="space-y-3 md:space-y-4 w-full mt-auto">
             <ActionButton variant="red" icon="⚔️" title="Meci Cu Un Prieten" subtitle="Creează o cameră privată" onClick={() => { if (!nume || nume.length < 3) return alert("Poreclă prea scurtă!"); triggerVibrate(); setIsPlayModalOpen(true); }} />
             <ActionButton variant="glass" icon="🏰" title={loadedTeams.length > 0 ? "Grup Nou" : "Creează Grup Privat"} subtitle="Pentru prieteni sau familie" onClick={handleCreateTeam} loading={loadingTeam} />
             <ActionButton variant="glass" icon="🌍" title="Arenă Națională" subtitle="Joacă cu cineva din țară" onClick={() => { if (!nume || nume.length < 3) return alert("Poreclă prea scurtă!"); triggerVibrate(); router.push(`/joc/global-arena?skin=${userStats.skin || 'red'}`); }} />
          </div>
        </div>
      </div>

      {/* CLASAMENT DUAL */}
      <DualLeaderboard 
        topRegiuni={topRegiuni} 
        topPlayers={topJucatori} 
        myName={nume} 
        myScore={userStats.wins || 0} 
      />

      {/* BUTOANE SEO HUB */}
      <div className="w-full bg-[#0a0505] border-2 border-red-900/30 p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] mt-2 md:mt-4 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden z-10">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/pattern-wood.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        
        <h3 className="text-center text-[10px] md:text-xs font-black uppercase text-amber-500/50 tracking-[0.4em] mb-4 md:mb-6 relative z-10">Tradiții și Ghiduri Utile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
          <Link href="/traditii" className="bg-[#140a0a] border border-red-900/20 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] text-center hover:bg-red-900/20 hover:border-red-500/30 transition-all shadow-sm active:scale-95 group">
            <span className="text-2xl md:text-4xl block mb-2 md:mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-transform drop-shadow-sm filter sepia-[0.3]">📖</span>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/80">Reguli & Tradiții</span>
          </Link>
          <Link href="/vopsit-natural" className="bg-[#140a0a] border border-red-900/20 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] text-center hover:bg-red-900/20 hover:border-red-500/30 transition-all shadow-sm active:scale-95 group">
            <span className="text-2xl md:text-4xl block mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform drop-shadow-sm filter sepia-[0.3]">🧅</span>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/80">Vopsit Natural</span>
          </Link>
          <Link href="/calendar" className="bg-[#140a0a] border border-red-900/20 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] text-center hover:bg-red-900/20 hover:border-red-500/30 transition-all shadow-sm active:scale-95 group">
            <span className="text-2xl md:text-4xl block mb-2 md:mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-transform drop-shadow-sm filter sepia-[0.3]">📅</span>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/80">Calendar Paște</span>
          </Link>
          <Link href="/urari" className="bg-[#140a0a] border border-red-900/20 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] text-center hover:bg-red-900/20 hover:border-red-500/30 transition-all shadow-sm active:scale-95 group">
            <span className="text-2xl md:text-4xl block mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform drop-shadow-sm filter sepia-[0.3]">🕊️</span>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/80">Mesaje & Urări</span>
          </Link>
        </div>
      </div>

      <PlayModal isOpen={isPlayModalOpen} onClose={() => setIsPlayModalOpen(false)} router={router} userSkin={userStats.skin || 'red'} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#050202] text-white overflow-hidden selection:bg-red-600 pattern-tradition">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-700/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] bg-yellow-700/5 rounded-full blur-[150px]" />
      </div>
      <Suspense fallback={<div className="h-screen flex items-center justify-center text-red-500/50 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Așezăm Masa...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}