"use client";

/**
 * ========================================================================================================================
 * CIOCNIM.RO - SANCTUARUL CIOCNIRII (VERSION 22.5 - THE EPIC COMBAT & SOCIAL UPDATE)
 * ------------------------------------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Master Architects of 2026)
 * Tehnologii: React 19, Next.js 16, Pusher-JS, Framer Motion, Canvas Confetti, Web Share API.
 * * 📜 DOCUMENTAȚIE TEHNICĂ ȘI LOGICĂ V22.5:
 * 1. VISUAL FEEDBACK & CONFETTI: S-a integrat 'canvas-confetti' pentru momentele de victorie și 'framer-motion' 
 * pentru impactul fizic al ouălor.
 * 2. ONBOARDING TUTORIAL: Adăugat 'ShakeTutorial' - o animație vizuală care învață jucătorii cum să miște telefonul.
 * 3. SOCIAL VIRALITY (WEB SHARE API): Buton de distribuire a victoriei direct pe WhatsApp/Instagram/Facebook.
 * 4. AUDIO PRECISION: S-au implementat exact sunetele cerute ('spargere', 'victorie', 'esec') sincronizate perfect.
 * ========================================================================================================================
 */

import React, { useEffect, useState, Suspense, useMemo, useCallback } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti"; // NOU: Efectul de victorie

// ==========================================================================================
// 1. ENGINE GRAFIC: OuTitan (Renderizare Liquid Glass cu Framer Motion)
// ==========================================================================================

const OuTitan = ({ skin, spart = false, hasStar = false, isGolden = false, isAttacker = false }) => {
  const skins = useMemo(() => ({
    red: { fill: "url(#liquid-ruby)", accent: "#ef4444", glow: "rgba(220,38,38,0.4)" },
    blue: { fill: "url(#liquid-sapphire)", accent: "#3b82f6", glow: "rgba(37,99,235,0.4)" },
    gold: { fill: "url(#liquid-imperial)", accent: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
    diamond: { fill: "url(#liquid-emerald)", accent: "#10b981", glow: "rgba(16,185,129,0.4)" },
    cosmic: { fill: "url(#liquid-nebula)", accent: "#8b5cf6", glow: "rgba(139,92,246,0.4)" },
  }), []);

  const current = skins[skin] || skins.red;
  const finalFill = isGolden ? "url(#liquid-imperial)" : current.fill;

  return (
    <motion.div 
      initial={false}
      animate={spart ? { scale: 0.9, rotate: [0, -10, 10, -5, 5, 0], filter: "grayscale(30%)", opacity: 0.8 } : { y: [0, -10, 0] }}
      transition={spart ? { duration: 0.4 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
      className="relative" 
      style={{ 
        width: 'clamp(120px, 35vw, 190px)', 
        height: 'auto', 
        aspectRatio: '1 / 1.35' 
      }}
    >
      {/* GLOW DE PROFUNZIME */}
      {(isGolden || !spart) && (
        <div 
          className="absolute inset-[-15%] rounded-full blur-[45px] opacity-20 animate-pulse transition-all duration-1000 pointer-events-none"
          style={{ backgroundColor: isGolden ? '#fbbf24' : current.glow }}
        ></div>
      )}

      <svg viewBox="0 0 100 130" className="w-full h-full relative z-10 drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)]">
        <defs>
          <linearGradient id="liquid-ruby" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" /></linearGradient>
          <linearGradient id="liquid-sapphire" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" /></linearGradient>
          <linearGradient id="liquid-imperial" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#78350f" /></linearGradient>
          <linearGradient id="liquid-emerald" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#064e3b" /></linearGradient>
          <linearGradient id="liquid-nebula" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#2e1065" /></linearGradient>
          <radialGradient id="highLight" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={finalFill} />
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill="url(#highLight)" opacity="0.4" />

        {/* LOGICA DE CRĂPARE DETALIATĂ */}
        {spart && (
          <motion.g 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            stroke="rgba(0,0,0,0.9)" strokeWidth="4" strokeLinecap="round" fill="none"
          >
            <path d="M30 40 L55 65 L45 85 L75 110 L65 125" />
            <path d="M70 45 L55 75 L85 95 L65 115" />
          </motion.g>
        )}
      </svg>

      {hasStar && (
        <div className="absolute -top-4 -right-4 text-4xl md:text-5xl animate-star drop-shadow-[0_0_15px_rgba(234,179,8,1)] z-20 select-none">⭐</div>
      )}

      {spart && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center text-7xl md:text-9xl pointer-events-none z-30 drop-shadow-2xl"
        >
          💥
        </motion.div>
      )}
    </motion.div>
  );
};

// --- NOU: TUTORIAL VIZUAL (ONBOARDING) ---
const ShakeTutorial = () => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none bg-black/80 p-6 rounded-[2rem] backdrop-blur-md border border-red-500/30"
  >
    <motion.div
      animate={{ rotate: [-15, 15, -15] }}
      transition={{ repeat: Infinity, duration: 0.6 }}
      className="text-6xl drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
    >
      📱
    </motion.div>
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white text-center">Fă un flick din mână<br/>pentru a lovi!</span>
  </motion.div>
);

// ==========================================================================================
// 2. COMPONENTA PRINCIPALĂ: ArenaMaster (Matchmaking, Chat & Combat Integrity)
// ==========================================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nume, playSound, triggerVibrate, userStats, setUserStats, incrementGlobal } = useGlobalStats();

  const [me, setMe] = useState({ skin: searchParams.get("skin") || 'red', isGolden: searchParams.get("golden") === "true", hasStar: false });
  const [opponent, setOpponent] = useState(null);
  const [rezultat, setRezultat] = useState(null);
  const [impactFlash, setImpactFlash] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const isHost = searchParams.get("host") === "true";
  const teamId = searchParams.get("teamId");
  const isPrivate = room.includes("privat-");

  const canStrike = !rezultat && opponent && isHost; // Doar Atacantul dă lovitura

  useEffect(() => {
    if (opponent || rezultat || isBotMatch || isHost || isPrivate) return;
    const botInterval = setInterval(() => {
      setIsBotMatch(true);
      setOpponent({ jucator: "🤖 BOT_CIOCNITOR", skin: 'gold', isGolden: false, hasStar: true });
      playSound('bot-activate'); // Opțional
      clearInterval(botInterval);
    }, 6000);
    return () => clearInterval(botInterval);
  }, [opponent, rezultat, isBotMatch, isHost, isPrivate, playSound]);

  useEffect(() => {
    if (isBotMatch) return;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu", forceTLS: true });
    const arenaChannel = pusher.subscribe(`arena-v22-${room}`);

    const broadcastPresence = () => {
      fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room, actiune: 'join', jucator: nume, skin: me.skin, isGolden: me.isGolden, hasStar: userStats.wins >= 10 })
      });
    };

    broadcastPresence();

    arenaChannel.bind("join", (data) => {
      if (data.jucator !== nume) {
        setOpponent(data);
        broadcastPresence(); 
      }
    });

    arenaChannel.bind("arena-chat", (data) => {
      setMessages(prev => [{ autor: data.jucator, text: data.text, t: Date.now() }, ...prev].slice(0, 12));
      playSound('chat-pop'); // Opțional
    });

    arenaChannel.bind("lovitura", (data) => executeBattle(data));

    return () => {
      pusher.unsubscribe(`arena-v22-${room}`);
      pusher.disconnect();
    };
  }, [room, nume, me, isBotMatch, userStats.wins, playSound]);

  const executeBattle = async (data) => {
    if (rezultat) return;

    let amCastigat = false;
    if (me.isGolden) amCastigat = true;
    else if (opponent?.isGolden) amCastigat = false;
    else amCastigat = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;

    setImpactFlash(true);
    playSound('spargere'); // SUNET NOU: Efect de coajă spartă
    triggerVibrate(amCastigat ? [100, 50, 100] : [800]);

    incrementGlobal();

    setTimeout(() => {
      setImpactFlash(false);
      setRezultat({ win: amCastigat });
      
      // CONFETTI + SUNETE FINALE
      if (amCastigat) {
        playSound('victorie');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ef4444', '#fbbf24', '#ffffff'] });
      } else {
        playSound('esec');
      }

      const newStats = { 
        ...userStats, 
        wins: amCastigat ? (userStats.wins || 0) + 1 : (userStats.wins || 0),
        losses: !amCastigat ? (userStats.losses || 0) + 1 : (userStats.losses || 0),
        hasGoldenEgg: false 
      };
      setUserStats(newStats);
      localStorage.setItem("c_stats", JSON.stringify(newStats));
    }, 700);
  };

  useEffect(() => {
    if (!canStrike) return;

    const handleMotion = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      
      if (force > 32) {
        window.removeEventListener("devicemotion", handleMotion);
        if (isBotMatch) {
          executeBattle({ castigaCelCareDa: Math.random() < 0.5 });
        } else {
          fetch('/api/ciocnire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: room, actiune: 'lovitura', jucator: nume, isHost, teamId })
          });
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [canStrike, isBotMatch, nume, room, isHost, teamId]);

  const handleChat = () => {
    if (!chatInput.trim()) return;
    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room, actiune: 'arena-chat', jucator: nume, text: chatInput })
    });
    setChatInput("");
    triggerVibrate(20);
  };

  // --- NOU: SOCIAL SHARING (WEB SHARE API) ---
  const shareVictory = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Victorie de Paște!',
          text: `Tocmai l-am învins pe ${opponent?.jucator || 'cineva'} la ciocnit ouă! Intră și tu în Sanctuarul Digital. Hristos a Înviat! 🥚⚔️`,
          url: 'https://ciocnim.ro',
        });
      } catch (err) { console.log("Share anulat sau eroare."); }
    } else {
      alert("Browserul tău nu suportă share direct. Copiază linkul: https://ciocnim.ro");
    }
  };

  return (
    <div className={`w-full max-w-full overflow-hidden flex flex-col items-center gap-6 px-4 transition-all duration-75 ${impactFlash ? 'scale-105 blur-[3px]' : ''}`}>
      
      {/* ONBOARDING: Apare mâna care se mișcă dacă ești atacant și aștepți să lovești */}
      <AnimatePresence>
        {canStrike && <ShakeTutorial />}
      </AnimatePresence>

      <header className="text-center space-y-3 animate-pop w-full relative z-10">
         <div className="inline-block px-8 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-2xl shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                {isBotMatch ? "🤖 ANTRENAMENT" : (opponent ? "⚔️ ARENĂ ACTIVĂ" : "🔍 CĂUTARE...")}
            </span>
         </div>
         {opponent && !rezultat && (
            <div className={`p-2 px-6 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse ${isHost ? 'bg-red-600' : 'bg-white/10 border border-white/20'}`}>
               <p className={`${isHost ? 'text-white' : 'text-white/50'} font-black text-[11px] md:text-xs uppercase tracking-widest`}>
                 {isHost ? "LOVEȘTE TELEFONUL ÎN AER! 🚀" : "ȚINE STRÂNS! PROTEJEAZĂ OUL! 🛡️"}
               </p>
            </div>
         )}
      </header>

      <div className="w-full flex justify-between items-center gap-2 md:gap-20 relative min-h-[250px] md:min-h-auto px-1 z-10">
         <div className="flex flex-col items-center gap-6 flex-1">
            <OuTitan skin={me.skin} isGolden={me.isGolden} hasStar={userStats.wins >= 10} spart={rezultat && !rezultat.win} />
            <div className="bg-black/80 backdrop-blur-2xl p-3 px-6 rounded-[1.5rem] border border-white/5 text-center shadow-2xl w-full max-w-[120px] md:max-w-none">
               <span className="text-[9px] font-black uppercase text-white/20 block mb-1">Ești Tu</span>
               <span className="text-sm md:text-xl font-black text-white italic truncate block">{nume}</span>
            </div>
         </div>

         <div className="flex flex-col items-center justify-center">
            <div className="text-5xl md:text-8xl font-black text-white/5 italic select-none">VS</div>
         </div>

         <div className="flex flex-col items-center gap-6 flex-1">
            {opponent ? (
              <>
                <OuTitan skin={opponent.skin} isGolden={opponent.isGolden} hasStar={opponent.hasStar} spart={rezultat && rezultat.win} />
                <div className="bg-red-600/10 backdrop-blur-2xl p-3 px-6 rounded-[1.5rem] border border-red-600/20 text-center shadow-2xl w-full max-w-[120px] md:max-w-none">
                   <span className="text-[9px] font-black uppercase text-red-500 block mb-1">Rival</span>
                   <span className="text-sm md:text-xl font-black text-red-500 italic truncate block">{opponent.jucator}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-6 animate-pulse opacity-30">
                 <div className="w-[100px] h-[140px] md:w-[190px] md:h-[255px] bg-white/[0.03] rounded-full border-2 border-dashed border-white/10" />
                 <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-center">Așteptăm...</span>
              </div>
            )}
         </div>
      </div>

      <section className="w-full max-w-md liquid-glass p-5 rounded-[2.5rem] shadow-2xl relative overflow-hidden mt-4 z-10">
         <div className="h-32 md:h-40 overflow-y-auto flex flex-col-reverse gap-3 custom-scrollbar mb-4 pr-1 text-[11px] break-words">
            {messages.length > 0 ? messages.map((m, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start'}`}>
                <span className="text-[8px] font-black text-white/20 uppercase mb-1 px-3">{m.autor}</span>
                <div className={`p-3 px-5 rounded-[1.5rem] font-bold shadow-lg ${m.autor === nume ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/10'}`}>
                  {m.text}
                </div>
              </motion.div>
            )) : (
              <div className="h-full flex items-center justify-center opacity-10">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em]">Tăcere în Sanctuar...</p>
              </div>
            )}
         </div>
         <div className="flex gap-2 bg-black/60 p-1.5 rounded-full border border-white/10 focus-within:border-red-600/40 transition-all shadow-inner">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Trimite un mesaj..." 
              className="flex-1 bg-transparent p-3 text-xs font-bold text-white outline-none pl-4"
            />
            <button onClick={handleChat} className="bg-red-600 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all text-sm md:text-lg">🚀</button>
         </div>
      </section>

      {/* --- NOU: MODAL DE REZULTAT (CU BUTON DE SHARE) --- */}
      <AnimatePresence>
        {rezultat && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[5000] flex flex-col items-center justify-center p-6 text-center touch-none"
          >
             <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full space-y-10">
                <div className={`text-8xl md:text-[10rem] mb-4 ${rezultat.win ? 'animate-bounce drop-shadow-[0_0_40px_rgba(234,179,8,0.5)]' : 'grayscale opacity-40'}`}>{rezultat.win ? '👑' : '🥀'}</div>
                <h2 className={`text-6xl md:text-8xl font-black uppercase tracking-tighter ${rezultat.win ? 'text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]' : 'text-red-600'}`}>
                  {rezultat.win ? 'VICTORIE!' : 'AI PIERDUT'}
                </h2>
                <p className="text-white/30 font-bold uppercase tracking-[0.4em] text-[9px] md:text-[10px]">
                   Bilanțul național a crescut. <br/> Sanctuarul te recunoaște.
                </p>
                
                <div className="flex flex-col gap-4 pt-6 w-full">
                   {rezultat.win && (
                     <button onClick={shareVictory} className="bg-blue-600 text-white py-4 rounded-[1.8rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.4)] text-xs flex items-center justify-center gap-2">
                       📲 Distribuie Victoria
                     </button>
                   )}
                   <button onClick={() => window.location.reload()} className="bg-red-600 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl text-xs">Revanșă ⚔️</button>
                   <button onClick={() => router.push('/')} className="bg-white/5 border border-white/10 py-4 rounded-[1.8rem] font-black uppercase tracking-widest hover:text-white transition-all text-[9px] text-white/30">Dashboard</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ==========================================================================================
// 3. EXPORT ROOT: PaginaJoc
// ==========================================================================================

export default function PaginaJoc({ params }) {
  const resolvedParams = React.use(params);
  const { room } = resolvedParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#020000] relative overflow-hidden touch-none selection:bg-red-600">
      <div className="ambient-glow-titan fixed inset-0 pointer-events-none"></div>
      <div className="fixed inset-0 bg-liquid-mesh opacity-[0.04] pointer-events-none"></div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-10">
          <div className="w-20 h-20 border-[6px] border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[1em] text-white/10 animate-pulse italic">Intrare în Sanctuar...</span>
        </div>
      }>
        <ArenaMaster room={room} />
      </Suspense>

      <div className="fixed bottom-[-3vh] left-[-5vw] text-[18vh] md:text-[30vh] font-black italic text-white/[0.01] pointer-events-none uppercase rotate-3 select-none">Ciocnim</div>
      <div className="fixed top-[-3vh] right-[-5vw] text-[18vh] md:text-[30vh] font-black italic text-white/[0.01] pointer-events-none uppercase -rotate-3 select-none">Arena</div>
    </div>
  );
}