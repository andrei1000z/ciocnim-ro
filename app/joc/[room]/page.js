"use client";

/**
 * ========================================================================================================================
 * CIOCNIM.RO - ARENA DE LUPTĂ (VERSION 25.0 - DYNAMIC COMBAT ROLES)
 * ========================================================================================================================
 */

import React, { useEffect, useState, Suspense, useMemo, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

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
  const [rezultat, setRezultat] = useState(null);
  const [impactFlash, setImpactFlash] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  
  // NOU: Am scos 'isHost' din logica de luptă, acum totul e bazat pe un seed comun
  const [atacantName, setAtacantName] = useState(null); 
  
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);

  const isPrivate = room.includes("privat-");

  // NOU: Calculăm cine e atacant pe baza "zarului" (Dacă eu sunt setat ca atacant, pot lovi)
  const canStrike = !rezultat && opponent && atacantName === nume;

  const playArenaSound = (name) => {
    try { const audio = new Audio(`/${name}.mp3`); audio.volume = 0.5; audio.play().catch(() => {}); } catch (err) {}
  };

  // NOU: Algoritm deterministic de stabilire a atacantului bazat pe nume
  // Sortăm numele alfabetic. Dacă un numar random dat de cel care intra e > 0.5, primul loveste. Altfel al doilea.
  // Folosim `randomSeed` trimis în broadcastJoin ca sa fim de acord amandoi
  const determineRoles = useCallback((myName, opName, seed) => {
      const sorted = [myName, opName].sort();
      if (seed > 0.5) return sorted[0];
      return sorted[1];
  }, []);

  const [localSeed, setLocalSeed] = useState(Math.random());

  const broadcastJoin = useCallback(() => {
    if (!nume) return;
    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room, actiune: 'join', jucator: nume, skin: me.skin, isGolden: me.isGolden, hasStar: me.hasStar, seed: localSeed })
    });
  }, [room, nume, me, localSeed]);

  // LOGICĂ BOT
  useEffect(() => {
    if (opponent || rezultat || isBotMatch || isPrivate) return;
    const botTimeout = setTimeout(() => {
      setIsBotMatch(true);
      const botName = "🤖 BOT RANDOM";
      setOpponent({ jucator: botName, skin: 'gold', isGolden: false, hasStar: true });
      
      // Decidem random dacă botul dă sau eu
      const botLoveseste = Math.random() > 0.5;
      setAtacantName(botLoveseste ? botName : nume);

    }, 5000);
    return () => clearTimeout(botTimeout);
  }, [opponent, rezultat, isBotMatch, isPrivate, nume]);

  // Dacă botul e atacantul, dă el după 1-3 secunde
  useEffect(() => {
      if (isBotMatch && atacantName === "🤖 BOT RANDOM" && !rezultat) {
          const timeout = setTimeout(() => {
              // Botul atacă. Eu primesc lovitura.
              executeBattle({ castigaCelCareDa: Math.random() < 0.5, atacant: "🤖 BOT RANDOM" });
              incrementGlobal(); 
          }, 1000 + Math.random() * 2000);
          return () => clearTimeout(timeout);
      }
  }, [isBotMatch, atacantName, rezultat, incrementGlobal]);

  // PUSHER SYNC CU HANDSHAKE REPARAT
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
        
        // Când primim join-ul, stabilim rolurile pe baza seed-ului (ori al nostru, ori al lui, nu contează atâta timp cât e fix pe cameră)
        // Ambele tabere vor rula funcția asta și vor ajunge la același atacant.
        const atacantCalculat = determineRoles(nume, data.jucator, data.seed || localSeed);
        setAtacantName(atacantCalculat);

        broadcastJoin(); 
      }
    });

    arenaChannel.bind("arena-chat", (data) => {
      setMessages(prev => [{ autor: data.jucator, text: data.text }, ...prev].slice(0, 10));
    });

    arenaChannel.bind("lovitura", (data) => executeBattle(data));

    return () => { pusher.unsubscribe(`arena-v22-${room}`); pusher.disconnect(); };
  }, [room, nume, isBotMatch, broadcastJoin, determineRoles, localSeed]);

  useEffect(() => {
    if (isPrivate && !opponent && !rezultat && !isBotMatch) {
      const retry = setTimeout(broadcastJoin, 3000);
      return () => clearTimeout(retry);
    }
  }, [opponent, isPrivate, broadcastJoin, rezultat, isBotMatch]);

  const executeBattle = async (data) => {
    if (rezultat) return;
    let amCastigat = false;
    
    // Stabilim cine a dat lovitura ca să știm cum interpretăm boolean-ul "castigaCelCareDa"
    const celCareALovit = data.atacant || (atacantName === nume ? nume : opponent?.jucator);

    if (me.isGolden) amCastigat = true;
    else if (opponent?.isGolden) amCastigat = false;
    else {
        if (celCareALovit === nume) {
            // Eu am dat
            amCastigat = data.castigaCelCareDa;
        } else {
            // El a dat
            amCastigat = !data.castigaCelCareDa;
        }
    }

    setImpactFlash(true);
    playArenaSound('spargere');
    triggerVibrate(amCastigat ? [100, 50, 100] : [800]);

    setTimeout(() => {
      setImpactFlash(false);
      setRezultat({ win: amCastigat });
      playArenaSound(amCastigat ? 'victorie' : 'esec');
      if (amCastigat) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      
      setUserStats(prev => {
        const noiStatistici = { 
          ...prev, 
          wins: amCastigat ? (prev.wins || 0) + 1 : (prev.wins || 0), 
          losses: !amCastigat ? (prev.losses || 0) + 1 : (prev.losses || 0) 
        };
        // NOU: Forțăm salvarea în localStorage direct aici pentru a nu se pierde nimic la refresh!
        localStorage.setItem("c_stats", JSON.stringify(noiStatistici));
        return noiStatistici;
      });
    }, 400);
  };

  const handleStrike = () => {
    if (!canStrike) return;
    
    const castigaCelCareDaRandom = Math.random() < 0.5;

    if (isBotMatch) {
      executeBattle({ castigaCelCareDa: castigaCelCareDaRandom, atacant: nume });
      incrementGlobal(castigaCelCareDaRandom); // Trimitem boolean-ul la bot match
    } else {
      fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: room, 
          actiune: 'lovitura', 
          jucator: nume, 
          regiune: userStats.regiune, 
          castigaCelCareDa: castigaCelCareDaRandom,
          atacant: nume, 
          esteCastigator: castigaCelCareDaRandom // Trimitem explicit daca eu castig, pentru a puncta regiunea
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
    fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: room, actiune: 'arena-chat', jucator: nume, text: chatInput }) });
    setChatInput("");
  };

  const handleRematch = () => {
    if (isBotMatch) window.location.reload();
    else { 
      setRezultat(null); 
      // Resetăm rolurile generând un nou seed, ca la runda a doua să poată lovi celălalt
      setLocalSeed(Math.random());
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
    <div className={`w-full max-w-4xl flex flex-col items-center gap-8 pt-12 ${impactFlash ? 'animate-impact scale-105 blur-[2px]' : ''}`}>
      {isPrivate && (
        <button onClick={copyRoomCode} className="group relative bg-black/50 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 mb-4 shadow-2xl hover:bg-white/5 transition-all active:scale-95">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-white/80 transition-colors">Cod Cameră: </span>
            <span className="text-yellow-500 font-black text-2xl tracking-widest drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]">{room.replace('privat-', '')}</span>
            <span className="bg-white/10 p-2 rounded-xl text-xs ml-2 group-hover:bg-white/20 transition-all">{copied ? '✅' : '📋'}</span>
          </div>
          {copied && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-green-500 tracking-widest">COPIAT!</span>}
        </button>
      )}

      <div className="flex justify-between items-center w-full px-4 md:px-20">
        <div className="flex flex-col items-center gap-6 flex-1">
          <OuTitan skin={me.skin} spart={rezultat && !rezultat.win} hasStar={me.hasStar} isGolden={me.isGolden} />
          <div className="liquid-glass p-3 px-6 rounded-2xl text-center border-l-2 border-l-green-500 relative">
            {atacantName === nume && !rezultat && opponent && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg border border-red-400">ATACĂ</span>}
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block">Tu</span>
            <span className="text-lg font-black text-white italic">{nume}</span>
          </div>
        </div>
        <div className="text-4xl font-black text-white/5 italic">VS</div>
        <div className="flex flex-col items-center gap-6 flex-1 text-center">
          {opponent ? (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
              <OuTitan skin={opponent.skin} spart={rezultat && rezultat.win} hasStar={opponent.hasStar} isGolden={opponent.isGolden} />
              <div className="bg-red-900/20 p-3 px-6 rounded-2xl border border-red-500/20 border-r-2 border-r-red-500 backdrop-blur-md relative">
                {atacantName === opponent.jucator && !rezultat && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg border border-red-400">ATACĂ</span>}
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500/50 block">Rival</span>
                <span className="text-lg font-black text-white italic">{opponent.jucator}</span>
              </div>
            </motion.div>
          ) : (
            <div className="w-[120px] h-[160px] bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10 animate-pulse flex items-center justify-center text-[10px] font-bold text-white/20 text-center px-4">
              AȘTEPTĂM ADVERSAR...
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-sm px-4 mt-6">
        {opponent && !rezultat && (
          <button onClick={handleStrike} disabled={!canStrike} className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-lg ${canStrike ? 'bg-red-600 text-white shadow-[0_15px_40px_rgba(220,38,38,0.5)] border-2 border-red-400/30 hover:scale-105 active:scale-95 animate-pulse' : 'bg-white/5 text-white/30 cursor-not-allowed border-2 border-white/5'}`}>
            {canStrike ? "💥 CIOCNEȘTE ACUM!" : "🛡️ APĂRĂ OUL!"}
          </button>
        )}
      </div>

      <div className="w-full max-w-md liquid-glass p-4 rounded-[2rem] mt-4">
        <div className="h-32 overflow-y-auto flex flex-col-reverse gap-2 mb-4 custom-scrollbar pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start'}`}>
              <span className="text-[8px] font-black uppercase text-white/30 px-2 mb-1">{m.autor}</span>
              <div className={`px-4 py-2 rounded-2xl text-xs font-bold ${m.autor === nume ? 'bg-red-600' : 'bg-white/10'}`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 bg-black/50 p-1 rounded-full border border-white/10 focus-within:border-red-500/50 transition-colors">
          <input value={chatInput} onChange={e => setChatInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="SCRIE UN MESAJ..." className="flex-1 bg-transparent pl-4 text-xs font-black outline-none text-white" />
          <button onClick={handleChat} className="bg-white/10 w-10 h-10 rounded-full hover:bg-red-600 transition-colors">💬</button>
        </div>
      </div>

      <AnimatePresence>
        {rezultat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-6 text-center backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.5 }} className="max-w-sm w-full space-y-8 bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)]">
              <div className="text-9xl mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">{rezultat.win ? '👑' : '🥀'}</div>
              <h2 className={`text-5xl md:text-6xl font-black italic tracking-tighter drop-shadow-lg ${rezultat.win ? 'text-green-500' : 'text-red-600'}`}>
                {rezultat.win ? 'VICTORIE!' : 'AI PIERDUT'}
              </h2>
              <div className="flex flex-col gap-4 mt-8">
                <button onClick={handleRematch} className="bg-white/10 hover:bg-white/20 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all active:scale-95 border border-white/5">Revanșă ⚔️</button>
                <button onClick={() => router.push('/')} className="bg-red-600 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_15px_30px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-all active:scale-95">Înapoi</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PaginaJoc({ params }) {
  const resolvedParams = React.use(params);
  return (
    <main className="min-h-screen w-full bg-[#010101] text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="ambient-glow-red" />
      <div className="ambient-glow-gold" />
      <Suspense fallback={<div className="font-black animate-pulse text-red-500 tracking-widest text-sm">CONECTARE ARENĂ...</div>}>
        <ArenaMaster room={resolvedParams.room} />
      </Suspense>
    </main>
  );
}