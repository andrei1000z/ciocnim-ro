"use client";

/**
 * ========================================================================================================================
 * CIOCNIM.RO - ARENA DE LUPTĂ (VERSION 29.0 - TRUE TRADITION & BULLETPROOF IMPACT)
 * ========================================================================================================================
 */

import React, { useEffect, useState, Suspense, useMemo, useCallback } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// --- BAZA DE DATE CITATE ---
const CITATE_IERTARE = [
  "Iartă, și vei fi iertat. Oul tău s-a jertfit pentru bucuria aproapelui.",
  "Iertarea este podul către liniștea sufletului.",
  "Fii bun, căci toți cei pe care îi întâlnești duc o luptă grea.",
  "Că de veţi ierta oamenilor greşealele lor, ierta-va şi vouă Tatăl vostru cel Ceresc."
];

const CITATE_SMERENIE = [
  "Dumnezeu celor mândri le stă împotrivă, iar celor smeriți le dă har.",
  "Cine se va smeri pe sine, va fi înălțat.",
  "Cel mai mare dintre voi să fie slujitorul tuturor.",
  "Biruința e trecătoare, tradiția și omenia sunt veșnice."
];

// ==========================================================================================
// 1. ENGINE GRAFIC: OuTitan (Renderizare Liquid Glass)
// ==========================================================================================

const OuTitan = ({ skin, spart = false, hasStar = false, isGolden = false }) => {
  const skins = useMemo(() => ({
    red: { fill: "url(#liquid-ruby)", glow: "rgba(220,38,38,0.5)" },
    blue: { fill: "url(#liquid-sapphire)", glow: "rgba(37,99,235,0.5)" },
    gold: { fill: "url(#liquid-imperial)", glow: "rgba(245,158,11,0.5)" },
    diamond: { fill: "url(#liquid-emerald)", glow: "rgba(16,185,129,0.5)" },
    cosmic: { fill: "url(#liquid-nebula)", glow: "rgba(139,92,246,0.5)" },
  }), []);

  const current = skins[skin] || skins.red;
  const finalFill = isGolden ? "url(#liquid-imperial)" : current.fill;

  return (
    <div className={`relative transition-all duration-700 ${!spart ? 'animate-float-v9' : 'scale-[0.85] opacity-70 rotate-6 filter grayscale-[30%]'}`} style={{ width: 'clamp(110px, 30vw, 180px)', height: 'auto', aspectRatio: '1 / 1.35' }}>
      {(isGolden || !spart) && (
        <div className="absolute inset-[-20%] rounded-full blur-[50px] opacity-30 animate-pulse transition-all duration-1000 mix-blend-screen pointer-events-none" style={{ backgroundColor: isGolden ? '#fbbf24' : current.glow }}></div>
      )}
      <svg viewBox="0 0 100 130" className="w-full h-full relative z-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
        <defs>
          <linearGradient id="liquid-ruby" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" /></linearGradient>
          <linearGradient id="liquid-sapphire" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" /></linearGradient>
          <linearGradient id="liquid-imperial" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#78350f" /></linearGradient>
          <linearGradient id="liquid-emerald" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#064e3b" /></linearGradient>
          <linearGradient id="liquid-nebula" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#2e1065" /></linearGradient>
          <radialGradient id="highLight" cx="40%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={finalFill} />
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill="url(#highLight)" opacity="0.6" />
        {spart && (
          <g stroke="rgba(0,0,0,0.95)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className="animate-pop">
            <path d="M30 40 L55 65 L45 85 L75 110 L65 125" />
            <path d="M70 45 L55 75 L85 95 L65 115" />
          </g>
        )}
      </svg>
      {hasStar && <div className="absolute -top-6 -right-6 text-5xl md:text-6xl animate-star drop-shadow-[0_0_20px_rgba(234,179,8,1)] z-20 select-none">⭐</div>}
      {spart && <div className="absolute inset-0 flex items-center justify-center text-7xl md:text-9xl animate-pop pointer-events-none z-30 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]">💥</div>}
    </div>
  );
};

// ==========================================================================================
// 2. ARENA MASTER: Logica de Luptă
// ==========================================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nume, triggerVibrate, userStats, setUserStats, incrementGlobal } = useGlobalStats();

  const [me] = useState({ skin: searchParams.get("skin") || 'red', isGolden: searchParams.get("golden") === "true", hasStar: userStats.wins >= 10 });
  const [opponent, setOpponent] = useState(null);
  
  // Stări pentru rezultate și animații
  const [isStriking, setIsStriking] = useState(false); 
  const [rezultatAmanat, setRezultatAmanat] = useState(null); 
  const [rezultat, setRezultat] = useState(null); 

  const [citatFinal, setCitatFinal] = useState("");
  const [impactFlash, setImpactFlash] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  
  const [atacantName, setAtacantName] = useState(null); 
  
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);

  const isPrivate = room.includes("privat-");
  const isProvocare = searchParams.get("provocare") === "true";
  const teamIdPreluat = searchParams.get("teamId"); 
  const isHost = searchParams.get("host") === "true"; 

  const canStrike = !rezultat && !isStriking && opponent && atacantName === nume;

  const playArenaSound = (name) => {
    try { const audio = new Audio(`/${name}.mp3`); audio.volume = 0.5; audio.play().catch(() => {}); } catch (err) {}
  };

  const broadcastJoin = useCallback(() => {
    if (!nume) return;
    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        roomId: room, 
        actiune: 'join', 
        jucator: nume, 
        skin: me.skin, 
        isGolden: me.isGolden, 
        hasStar: me.hasStar, 
        isHost: isHost,
        regiune: userStats.regiune
      })
    });
  }, [room, nume, me, isHost, userStats.regiune]);

  // LOGICĂ BOT (7 secunde pentru provocări, 5 pentru global)
  useEffect(() => {
    if (opponent || rezultat || isStriking || isBotMatch) return;
    if (isPrivate && !isProvocare) return;

    const waitTime = isProvocare ? 7000 : 5000;

    const botTimeout = setTimeout(() => {
      setIsBotMatch(true);
      const botName = "🤖 BOT TRADIȚIONAL";
      setOpponent({ jucator: botName, skin: 'gold', isGolden: false, hasStar: true, regiune: "Muntele Athos" });
      
      const botLoveseste = Math.random() > 0.5;
      setAtacantName(botLoveseste ? botName : nume);

    }, waitTime);

    return () => clearTimeout(botTimeout);
  }, [opponent, rezultat, isStriking, isBotMatch, isPrivate, isProvocare, nume]);

  // Dacă botul e atacantul, dă el
  useEffect(() => {
      if (isBotMatch && atacantName === "🤖 BOT TRADIȚIONAL" && !rezultat && !isStriking) {
          const timeout = setTimeout(() => {
              executeBattle({ castigaCelCareDa: Math.random() < 0.5, atacant: "🤖 BOT TRADIȚIONAL" });
              incrementGlobal(); 
          }, 1500 + Math.random() * 1500);
          return () => clearTimeout(timeout);
      }
  }, [isBotMatch, atacantName, rezultat, isStriking, incrementGlobal]);

  // PUSHER SYNC 
  useEffect(() => {
    if (isBotMatch) return;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu", forceTLS: true });
    const arenaChannel = pusher.subscribe(`arena-v22-${room}`);

    arenaChannel.bind("pusher:subscription_succeeded", () => {
      broadcastJoin();
    });

    arenaChannel.bind("join", (data) => {
      if (data.jucator !== nume) { 
        setOpponent(data); 
        
        if (isHost && data.isHost) {
           setAtacantName([nume, data.jucator].sort()[0]);
        } else {
           setAtacantName(isHost ? nume : data.jucator);
        }

        broadcastJoin(); 
      }
    });

    arenaChannel.bind("arena-chat", (data) => {
      setMessages(prev => [{ autor: data.jucator, text: data.text }, ...prev].slice(0, 20));
    });

    arenaChannel.bind("lovitura", (data) => executeBattle(data));

    return () => { pusher.unsubscribe(`arena-v22-${room}`); pusher.disconnect(); };
  }, [room, nume, isBotMatch, broadcastJoin, isHost]);

  useEffect(() => {
    if (isPrivate && !opponent && !rezultat && !isStriking && !isBotMatch) {
      const retry = setTimeout(broadcastJoin, 3000);
      return () => clearTimeout(retry);
    }
  }, [opponent, isPrivate, broadcastJoin, rezultat, isStriking, isBotMatch]);

  const executeBattle = async (data) => {
    if (rezultat || isStriking) return;
    
    setIsStriking(true);

    let amCastigat = false;
    const celCareALovit = data.atacant || (atacantName === nume ? nume : opponent?.jucator);

    if (me.isGolden) amCastigat = true;
    else if (opponent?.isGolden) amCastigat = false;
    else {
        if (celCareALovit === nume) {
            amCastigat = data.castigaCelCareDa;
        } else {
            amCastigat = !data.castigaCelCareDa;
        }
    }

    setRezultatAmanat({ win: amCastigat });

    const citatAles = amCastigat 
      ? CITATE_SMERENIE[Math.floor(Math.random() * CITATE_SMERENIE.length)]
      : CITATE_IERTARE[Math.floor(Math.random() * CITATE_IERTARE.length)];
    
    setCitatFinal(citatAles);

    setTimeout(() => {
      setImpactFlash(true);
      playArenaSound('spargere');
      triggerVibrate(amCastigat ? [100, 50, 100] : [800]);
      
      setRezultat({ win: amCastigat });

      setTimeout(() => {
        setImpactFlash(false);
        playArenaSound(amCastigat ? 'victorie' : 'esec');
        if (amCastigat) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        
        // AICI STĂ MAGICUL PENTRU REZOLVAREA BUCĂLII DE VICTORII:
        setUserStats(prev => {
          const noiStatistici = { 
            ...prev, 
            wins: amCastigat ? (prev.wins || 0) + 1 : (prev.wins || 0), 
            losses: !amCastigat ? (prev.losses || 0) + 1 : (prev.losses || 0) 
          };
          localStorage.setItem("c_stats", JSON.stringify(noiStatistici));
          return noiStatistici;
        });
      }, 400);
    }, 500);
  };

  const handleStrike = () => {
    if (!canStrike) return;
    
    const castigaCelCareDaRandom = Math.random() < 0.5;

    if (isBotMatch) {
      executeBattle({ castigaCelCareDa: castigaCelCareDaRandom, atacant: nume });
      incrementGlobal(castigaCelCareDaRandom); 
    } else {
      fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: room, 
          actiune: 'lovitura', 
          jucator: nume, 
          regiune: userStats.regiune, 
          teamId: teamIdPreluat, 
          castigaCelCareDa: castigaCelCareDaRandom,
          atacant: nume, 
          esteCastigator: castigaCelCareDaRandom
        })
      });
    }
  };

  useEffect(() => {
    if (!canStrike) return;
    const handleMotion = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      if (Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z) > 20) {
        window.removeEventListener("devicemotion", handleMotion);
        handleStrike();
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [canStrike]);

  const handleChat = () => {
    if (!chatInput.trim()) return;
    fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ roomId: room, actiune: 'arena-chat', jucator: nume, text: chatInput }) 
    });
    setChatInput("");
  };

  const handleRematch = () => {
    if (isBotMatch) {
      // Dacă a fost cu botul, dăm reload curat
      window.location.reload();
    } else { 
      // Resetăm tot complet pentru un om real ca să nu se încalece
      setRezultat(null); 
      setRezultatAmanat(null);
      setIsStriking(false);
      
      // Schimbăm cine dă
      setAtacantName(prev => prev === nume ? opponent.jucator : nume);
      triggerVibrate(); 
      broadcastJoin(); 
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.replace('privat-', ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className={`w-full max-w-4xl flex flex-col items-center gap-8 pt-12 ${impactFlash ? 'animate-impact scale-105 blur-[2px]' : ''}`}>
        
        {isPrivate && !isProvocare && (
          <button onClick={copyRoomCode} className="group relative bg-[#080808]/80 backdrop-blur-xl px-8 py-4 rounded-full border border-red-500/20 mb-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:bg-[#111] hover:border-red-500/50 transition-all active:scale-95 z-10">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-white/80 transition-colors">Cod Cameră: </span>
              <span className="text-yellow-500 font-black text-2xl tracking-widest drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">{room.replace('privat-', '')}</span>
              <span className="bg-white/5 p-2 rounded-xl text-xs ml-2 group-hover:bg-white/10 transition-all border border-white/5">{copied ? '✅' : '📋'}</span>
            </div>
            {copied && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-green-500 tracking-widest">COPIAT!</span>}
          </button>
        )}

        <div className="flex justify-between items-center w-full px-4 md:px-20 mt-4">
          <div className="flex flex-col items-center gap-6 flex-1">
            <OuTitan skin={me.skin} spart={rezultat && !rezultat.win} hasStar={me.hasStar} isGolden={me.isGolden} />
            <div className="bg-[#080808]/90 backdrop-blur-md p-4 px-6 rounded-2xl text-center border border-white/5 border-l-4 border-l-green-500 relative min-w-[140px] shadow-lg">
              {atacantName === nume && !rezultat && opponent && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full shadow-[0_5px_15px_rgba(220,38,38,0.5)] border border-red-400/50">ATACĂ</span>}
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1 truncate">{userStats.regiune || "Muntenia"}</span>
              <span className="text-xl font-black text-white italic drop-shadow-sm">{nume}</span>
            </div>
          </div>

          <div className="text-5xl font-black text-white/10 italic drop-shadow-sm px-4">VS</div>
          
          <div className="flex flex-col items-center gap-6 flex-1 text-center">
            {opponent ? (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
                <OuTitan skin={opponent.skin} spart={rezultat && rezultat.win} hasStar={opponent.hasStar} isGolden={opponent.isGolden} />
                <div className="bg-[#080808]/90 p-4 px-6 rounded-2xl border border-white/5 border-r-4 border-r-red-600 backdrop-blur-md relative min-w-[140px] shadow-lg">
                  {atacantName === opponent.jucator && !rezultat && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full shadow-[0_5px_15px_rgba(220,38,38,0.5)] border border-red-400/50">ATACĂ</span>}
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-500/60 block mb-1 truncate">{opponent.regiune || "Necunoscut"}</span>
                  <span className="text-xl font-black text-white italic drop-shadow-sm">{opponent.jucator}</span>
                </div>
              </motion.div>
            ) : (
              <div className="w-[140px] h-[180px] bg-[#080808]/50 rounded-[3rem] border-2 border-dashed border-white/10 animate-pulse flex items-center justify-center text-[10px] font-bold tracking-widest uppercase text-white/30 text-center px-4 mt-[30px] backdrop-blur-sm">
                Așteptăm Adversar...
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-sm px-4 mt-8 z-10">
          {opponent && !rezultat && (
            <button 
              onClick={handleStrike} 
              disabled={!canStrike || isStriking} 
              className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm md:text-base transition-all shadow-lg ${
                canStrike && !isStriking 
                  ? 'bg-red-600 text-white shadow-[0_20px_40px_rgba(220,38,38,0.4)] border-2 border-red-400/30 hover:scale-[1.02] active:scale-95 animate-pulse' 
                  : 'bg-[#080808] text-white/30 cursor-not-allowed border-2 border-white/5 backdrop-blur-md'
              }`}
            >
              {isStriking ? "⏳ ÎN IMPACT..." : (canStrike ? "💥 CIOCNEȘTE ACUM!" : "🛡️ APĂRĂ OUL!")}
            </button>
          )}
        </div>

        {/* CHAT REDESIGN (Premium OLED) */}
        <div className="w-full max-w-md bg-[#080808] border border-white/10 p-5 md:p-6 rounded-[2.5rem] mt-4 z-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] pointer-events-none"></div>
          
          <div className="h-36 overflow-y-auto flex flex-col-reverse gap-3 mb-4 custom-scrollbar pr-2 relative z-10">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start'}`}>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 px-2 mb-1">{m.autor}</span>
                <div className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold shadow-sm border border-white/5 ${m.autor === nume ? 'bg-red-600 text-white rounded-tr-sm' : 'bg-white/5 text-white/90 rounded-tl-sm backdrop-blur-md'}`}>
                   {m.text}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
                <div className="text-center w-full h-full flex flex-col justify-center items-center opacity-30 mt-8">
                    <span className="text-2xl mb-2">💬</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Liniște pe câmpul de bătălie</span>
                </div>
            )}
          </div>
          
          <div className="flex gap-2 bg-black/60 p-1.5 rounded-full border border-white/5 focus-within:border-red-500/50 focus-within:bg-[#111] transition-all relative z-10">
            <input 
               value={chatInput} 
               onChange={e => setChatInput(e.target.value.toUpperCase())} 
               onKeyDown={e => e.key === 'Enter' && handleChat()} 
               placeholder="SCRIE UN MESAJ..." 
               className="flex-1 bg-transparent pl-5 text-xs font-black outline-none text-white tracking-widest placeholder:text-white/20" 
            />
            <button onClick={handleChat} className="bg-white/10 w-12 h-12 rounded-full hover:bg-red-600 transition-colors border border-white/5 text-sm active:scale-95">🕊️</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {rezultat && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} // E important să aibă exit pentru a dispărea fin la Revanșă
            className="fixed inset-0 bg-black/95 z-[2147483647] flex items-center justify-center p-6 text-center backdrop-blur-3xl"
          >
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={{
                hidden: { scale: 0.8, y: 50, opacity: 0 },
                visible: { scale: 1, y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4, staggerChildren: 0.15 } }
              }} 
              className={`max-w-md w-full bg-[#080808] p-8 md:p-10 rounded-[3rem] border shadow-[0_50px_100px_rgba(0,0,0,0.9)] relative overflow-hidden pointer-events-auto ${rezultat.win ? 'border-green-500/30' : 'border-red-500/30'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-t to-transparent pointer-events-none ${rezultat.win ? 'from-green-600/10' : 'from-red-600/10'}`}></div>
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 blur-[60px] pointer-events-none z-0 ${rezultat.win ? 'bg-green-500/20' : 'bg-red-500/20'}`}></div>
              
              <motion.div variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }} className="text-8xl md:text-9xl drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] relative z-10 mb-4">
                {rezultat.win ? '👑' : '🥀'}
              </motion.div>
              
              <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className={`text-4xl md:text-5xl font-black italic tracking-tighter drop-shadow-lg uppercase relative z-10 ${rezultat.win ? 'text-green-500' : 'text-red-600'}`}>
                {rezultat.win ? 'Victorie!' : 'Oul s-a spart'}
              </motion.h2>
              
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative mt-8 mb-8 z-10 pointer-events-none">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#080808] px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 z-10 border border-white/5 rounded-full">
                   {rezultat.win ? 'Învățătură' : 'Alinare'}
                 </div>
                 <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-inner relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none"></div>
                   <span className="absolute top-2 left-4 text-5xl text-white/10 font-serif leading-none">"</span>
                   <p className="text-sm md:text-base font-bold text-white/80 italic leading-relaxed relative z-10 mt-2">
                     {citatFinal}
                   </p>
                   <span className="absolute bottom-[-15px] right-4 text-5xl text-white/10 font-serif leading-none">"</span>
                 </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col gap-4 relative z-50">
                <button 
                  onClick={handleRematch} 
                  className="w-full bg-[#111] hover:bg-[#222] py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm transition-all active:scale-95 border border-white/10 shadow-sm cursor-pointer relative z-50 pointer-events-auto"
                >
                  {rezultat.win ? 'Încă o luptă ⚔️' : 'Revanșă ⚔️'}
                </button>
                <button 
                  onClick={() => router.push('/')} 
                  className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm transition-all active:scale-95 shadow-lg border-2 border-transparent cursor-pointer relative z-50 pointer-events-auto ${rezultat.win ? 'bg-green-600 hover:bg-green-500 shadow-[0_15px_30px_rgba(22,163,74,0.3)] border-green-400/30' : 'bg-red-600 hover:bg-red-500 shadow-[0_15px_30px_rgba(220,38,38,0.4)] border-red-400/30'}`}
                >
                  Înapoi la Vatră
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function PaginaJoc({ params }) {
  const resolvedParams = React.use(params);
  return (
    <main className="min-h-screen w-full bg-[#010101] text-white flex flex-col items-center justify-center relative overflow-hidden pattern-tradition">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] bg-yellow-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      <Suspense fallback={<div className="font-black animate-pulse text-red-500 tracking-widest text-sm uppercase">AȘEZĂM MASA...</div>}>
        <ArenaMaster room={resolvedParams.room} />
      </Suspense>
    </main>
  );
}