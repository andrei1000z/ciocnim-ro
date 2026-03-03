"use client";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// SUNETE DIRECTE PENTRU VITEZĂ (Apelează mp3-urile din folderul public)
const playSfx = (name) => {
  try {
    const audio = new Audio(`/${name}.mp3`);
    audio.play().catch(e => console.log("Sunet blocat de browser:", e));
  } catch (err) {}
};

// ==========================================================================================
// 1. ENGINE GRAFIC: Oul
// ==========================================================================================

const OuTitan = ({ skin, spart = false, hasStar = false, isGolden = false }) => {
  const skins = useMemo(() => ({
    red: { fill: "url(#liquid-ruby)", glow: "rgba(220,38,38,0.4)" },
    blue: { fill: "url(#liquid-sapphire)", glow: "rgba(37,99,235,0.4)" },
    gold: { fill: "url(#liquid-imperial)", glow: "rgba(245,158,11,0.4)" },
    diamond: { fill: "url(#liquid-emerald)", glow: "rgba(16,185,129,0.4)" },
    cosmic: { fill: "url(#liquid-nebula)", glow: "rgba(139,92,246,0.4)" },
  }), []);

  const current = skins[skin] || skins.red;
  const finalFill = isGolden ? "url(#liquid-imperial)" : current.fill;

  return (
    <motion.div 
      initial={false}
      animate={spart ? { scale: 0.9, rotate: [0, -10, 10, -5, 5, 0], filter: "grayscale(30%)", opacity: 0.8 } : { y: [0, -10, 0] }}
      transition={spart ? { duration: 0.3 } : { repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className="relative" 
      style={{ width: 'clamp(120px, 35vw, 190px)', height: 'auto', aspectRatio: '1 / 1.35' }}
    >
      {(isGolden || !spart) && (
        <div 
          className="absolute inset-[-15%] rounded-full blur-[45px] opacity-20 animate-pulse transition-all duration-500 pointer-events-none"
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

        {spart && (
          <motion.g 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
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
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center text-7xl md:text-9xl pointer-events-none z-30 drop-shadow-2xl"
        >
          💥
        </motion.div>
      )}
    </motion.div>
  );
};

// ==========================================================================================
// 2. COMPONENTA PRINCIPALĂ: ArenaMaster
// ==========================================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nume, triggerVibrate, userStats, setUserStats } = useGlobalStats();

  const [me, setMe] = useState({ skin: searchParams.get("skin") || 'red', isGolden: false, hasStar: false });
  const [opponent, setOpponent] = useState(null);
  const [rezultat, setRezultat] = useState(null);
  const [impactFlash, setImpactFlash] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  
  const [isHost, setIsHost] = useState(searchParams.get("host") === "true");
  
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const teamId = searchParams.get("teamId");
  const isPrivate = room.includes("privat") || room.length <= 10; 

  const canStrike = !rezultat && opponent && isHost; 

  // BOT AȘTEAPTĂ 3s APOI APARE (DOAR PE GLOBAL)
  useEffect(() => {
    if (opponent || rezultat || isBotMatch || isPrivate) return;
    const botInterval = setInterval(() => {
      setIsBotMatch(true);
      setOpponent({ jucator: "🤖 BOT RANDOM", skin: 'gold', isGolden: false, hasStar: true });
      
      // BOT-UL ARE 50/50 ȘANSE SĂ FIE ATACANTUL SAU TU (Corect, nu bate mereu!)
      const botIsAttacker = Math.random() > 0.5;
      setIsHost(!botIsAttacker);

      clearInterval(botInterval);
    }, 3000); // 3 secunde și intră botul
    return () => clearInterval(botInterval);
  }, [opponent, rezultat, isBotMatch, isPrivate]);

  // DACĂ BOTUL E ATACANT (Tu ești !isHost), LOVEȘTE EL DUPĂ 1.5s
  useEffect(() => {
    if (isBotMatch && !isHost && !rezultat) {
      const botAttackTimer = setTimeout(() => {
        // Când botul lovește, decizia finală (cine se sparge) e 50/50 pur.
        executeBattle({ castigaCelCareDa: Math.random() > 0.5 });
      }, 1500); 
      return () => clearTimeout(botAttackTimer);
    }
  }, [isBotMatch, isHost, rezultat]);

  // CONEXIUNEA PUSHER PENTRU MULTIPLAYER REAL
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
    });

    arenaChannel.bind("lovitura", (data) => executeBattle(data));

    return () => {
      pusher.unsubscribe(`arena-v22-${room}`);
      pusher.disconnect();
    };
  }, [room, nume, me, isBotMatch, userStats.wins]);

// ... restul codului rămâne la fel până la executeBattle ...

  const executeBattle = async (data) => {
    if (rezultat) return;

    let amCastigat = false;
    if (me.isGolden) amCastigat = true;
    else if (opponent?.isGolden) amCastigat = false;
    else amCastigat = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;

    setImpactFlash(true);
    playSfx('spargere'); 
    triggerVibrate(amCastigat ? [100, 50, 100] : [800]);

    // MODIFICARE AICI: Trimitem regiunea și lăsăm doar Host-ul să facă incrementarea 
    // ca să nu numărăm același meci de două ori (+1, nu +2)
    if (isHost) {
fetch('/api/ciocnire', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      actiune: 'increment-global',
      regiune: userStats.regiune // TRIMITEM REGIUNEA TA AICI
    })
  }).catch(e => console.log("Eroare bilant:", e));
}

    setTimeout(() => {
      setImpactFlash(false);
      setRezultat({ win: amCastigat });
      
      if (amCastigat) {
        playSfx('victorie');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ef4444', '#fbbf24', '#ffffff'] });
      } else {
        playSfx('esec');
      }

      const newStats = { 
        ...userStats, 
        wins: amCastigat ? (userStats.wins || 0) + 1 : (userStats.wins || 0),
        losses: !amCastigat ? (userStats.losses || 0) + 1 : (userStats.losses || 0)
      };
      setUserStats(newStats);
      localStorage.setItem("c_stats", JSON.stringify(newStats));
    }, 300); 
  };

// ... restul codului rămâne la fel ...

  // FUNCȚIE DE LOVIRE (Bate și din buton și din Shake)
  const handleStrikeAction = () => {
    if (!canStrike) return;
    
    if (isBotMatch) {
      // 50/50 șanse pur când ești tu atacantul împotriva botului
      executeBattle({ castigaCelCareDa: Math.random() > 0.5 });
    } else {
      fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room, actiune: 'lovitura', jucator: nume, isHost, teamId })
      });
    }
  };

  // DETECȚIA MIȘCĂRII (SHAKE)
  useEffect(() => {
    if (!canStrike) return;
    const handleMotion = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      if (force > 30) {
        window.removeEventListener("devicemotion", handleMotion);
        handleStrikeAction();
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

  return (
    <div className={`w-full max-w-2xl mx-auto overflow-hidden flex flex-col items-center gap-6 px-4 transition-all duration-75 ${impactFlash ? 'scale-105 blur-[3px]' : ''}`}>
      
      <header className="text-center space-y-3 w-full relative z-10 pt-8">
         {isPrivate && (
           <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20 inline-block mb-2">
             <span className="text-xs font-bold uppercase tracking-widest text-white">Cod Cameră: <span className="text-red-500 font-black">{room.replace('privat-', '')}</span></span>
           </div>
         )}
         <div className="inline-block px-8 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                {isBotMatch ? "🤖 ANTRENAMENT" : (opponent ? "⚔️ MECI ACTIV" : "🔍 AȘTEPTĂM ADVERSAR...")}
            </span>
         </div>
         {opponent && !rezultat && (
            <div className={`p-3 px-6 rounded-2xl ${isHost ? 'bg-red-600 shadow-lg' : 'bg-white/10 border border-white/20'}`}>
               <p className={`${isHost ? 'text-white' : 'text-white/50'} font-bold text-xs uppercase tracking-widest`}>
                 {isHost ? "ESTI ATACANT: Scutură telefonul sau apasă butonul! 🚀" : "ESTI APĂRĂTOR: Ține strâns, vine lovitura! 🛡️"}
               </p>
            </div>
         )}
      </header>

      <div className="w-full flex justify-between items-center gap-4 relative px-2 z-10 mt-4">
         <div className="flex flex-col items-center gap-4 flex-1">
            <OuTitan skin={me.skin} isGolden={me.isGolden} hasStar={userStats.wins >= 10} spart={rezultat && !rezultat.win} />
            <div className="bg-white/5 backdrop-blur-md p-3 px-6 rounded-2xl border border-white/10 text-center w-full max-w-[140px]">
               <span className="text-[9px] font-bold uppercase text-white/40 block mb-1">Tu</span>
               <span className="text-sm font-bold text-white truncate block">{nume}</span>
            </div>
         </div>

         <div className="text-4xl font-black text-white/10 italic select-none">VS</div>

         <div className="flex flex-col items-center gap-4 flex-1">
            {opponent ? (
              <>
                <OuTitan skin={opponent.skin} isGolden={opponent.isGolden} hasStar={opponent.hasStar} spart={rezultat && rezultat.win} />
                <div className="bg-red-600/10 backdrop-blur-md p-3 px-6 rounded-2xl border border-red-600/20 text-center w-full max-w-[140px]">
                   <span className="text-[9px] font-bold uppercase text-red-500 block mb-1">Adversar</span>
                   <span className="text-sm font-bold text-red-500 truncate block">{opponent.jucator}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 animate-pulse opacity-30">
                 <div className="w-[100px] h-[135px] md:w-[150px] md:h-[200px] bg-white/5 rounded-full border-2 border-dashed border-white/20" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 text-center">Așteptăm...</span>
              </div>
            )}
         </div>
      </div>

      <AnimatePresence>
        {canStrike && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            onClick={handleStrikeAction}
            className="w-full max-w-[250px] bg-red-600 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_15px_30px_rgba(220,38,38,0.4)] active:scale-95 transition-all z-20 mt-2"
          >
            🔥 LOVEȘTE AICI!
          </motion.button>
        )}
      </AnimatePresence>

      <section className="w-full bg-white/5 p-4 rounded-[2rem] border border-white/10 mt-4 z-10">
         <div className="h-24 overflow-y-auto flex flex-col-reverse gap-2 mb-3 pr-1 text-[11px] break-words">
            {messages.length > 0 ? messages.map((m, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start'}`}>
                <span className="text-[8px] font-bold text-white/30 uppercase mb-0.5 px-3">{m.autor}</span>
                <div className={`px-4 py-2 rounded-2xl font-bold ${m.autor === nume ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white/10 text-white/80 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </motion.div>
            )) : (
              <div className="h-full flex items-center justify-center opacity-30">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white">Trimite un mesaj...</p>
              </div>
            )}
         </div>
         <div className="flex gap-2">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Scrie aici..." 
              className="flex-1 bg-black/50 p-3 rounded-xl text-xs font-bold text-white outline-none focus:border focus:border-red-500 border border-transparent transition-all"
            />
            <button onClick={handleChat} className="bg-red-600 px-5 rounded-xl font-bold text-white hover:bg-red-500 transition-all">OK</button>
         </div>
      </section>

      <AnimatePresence>
        {rezultat && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[5000] flex flex-col items-center justify-center p-6 text-center"
          >
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#111] p-8 rounded-[2.5rem] border border-white/10 w-full max-w-sm space-y-6">
                <div className={`text-7xl mb-2 ${rezultat.win ? 'animate-bounce' : 'opacity-50 grayscale'}`}>{rezultat.win ? '👑' : '🥀'}</div>
                <h2 className={`text-4xl font-black uppercase ${rezultat.win ? 'text-green-400' : 'text-red-500'}`}>
                  {rezultat.win ? 'VICTORIE!' : 'AI PIERDUT'}
                </h2>
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Bilanțul a fost actualizat.</p>
                
                <div className="flex flex-col gap-3 pt-4">
                   <button onClick={() => window.location.reload()} className="bg-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-red-500 text-xs">Revanșă</button>
                   <button onClick={() => router.push('/')} className="bg-white/10 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white/20 text-xs transition-all">Acasă</button>
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
  const { room } = resolvedParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden touch-none selection:bg-red-600 text-white">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-[4px] border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Se pregătește arena...</span>
        </div>
      }>
        <ArenaMaster room={room} />
      </Suspense>
    </div>
  );
}