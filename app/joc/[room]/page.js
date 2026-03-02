"use client";

/**
 * ========================================================================================================================
 * CIOCNIM.RO - SANCTUARUL CIOCNIRII (VERSION 22.0 - THE NATIONAL AWAKENING / COMBAT UPDATE)
 * ------------------------------------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Master Architects of 2026)
 * Tehnologii: React 19, Next.js 16 (Turbopack), Pusher-JS (WebSocket), Redis (Upstash) Integrity Engine, Web Audio API.
 * * * 📜 DOCUMENTAȚIE TEHNICĂ ȘI LOGICĂ V22.0 (THE COMBAT & AUDIO REVISION):
 * 1. HIBRID COMBAT SYSTEM: Jucătorii pot acum alege CUM lovesc. Pot mișca telefonul (accelerometru) 
 * SAU pot apăsa pe noul buton de "CIOCNEȘTE". Asta rezolvă problema utilizatorilor de pe PC/Laptop/Tablete.
 * 2. KINETIC CALIBRATION: Sensibilitatea accelerometrului a fost ajustată. Forța necesară a scăzut 
 * de la >32 la >15. Nu mai este necesară o mișcare violentă, ci un "flick" scurt din încheietură.
 * 3. AUDIO ENGINE V1 INTEGRATION: S-au adăugat apeluri asincrone către 'spargere.mp3', 'victorie.mp3' 
 * și 'esec.mp3'. Sunetul este perfect aliniat cu efectele de zguduire a ecranului (impact-shake).
 * 4. UI/UX "TECH PRIMITIVE": Arena folosește noile clase de OLED Black (#020202), `liquid-glass` 
 * cu blur masiv, și o arhitectură care previne 100% scroll-ul accidental în timpul luptei.
 * 5. PRIVACY LOCK (NO BOT): Algoritmul de fallback la BOT este oprit complet în camerele private. 
 * Host-ul declanșează impactul pentru a evita race conditions, dar UI-ul îi arată clar ce are de făcut.
 * ========================================================================================================================
 */

import React, { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";

// ==========================================================================================
// 1. ENGINE GRAFIC: OuTitan (Renderizare Liquid Glass cu Filtre de Profunzime)
// ==========================================================================================

/**
 * Componenta OuTitan: Nucleul vizual al jocului.
 * Include logica de texturare dinamică, umbre complexe și animații GPU-accelerated 
 * pentru a simula un ou real, acoperit de un strat de "sticlă lichidă".
 */
const OuTitan = ({ skin, width = "160px", spart = false, hasStar = false, isGolden = false }) => {
  // Configurația skin-urilor cu densitate mare de metadata pentru randare
  const skins = useMemo(() => ({
    red: { fill: "url(#liquid-ruby)", accent: "#ef4444", glow: "rgba(220,38,38,0.5)" },
    blue: { fill: "url(#liquid-sapphire)", accent: "#3b82f6", glow: "rgba(37,99,235,0.5)" },
    gold: { fill: "url(#liquid-imperial)", accent: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
    diamond: { fill: "url(#liquid-emerald)", accent: "#10b981", glow: "rgba(16,185,129,0.5)" },
    cosmic: { fill: "url(#liquid-nebula)", accent: "#8b5cf6", glow: "rgba(139,92,246,0.5)" },
  }), []);

  const current = skins[skin] || skins.red;
  // Oul de aur suprascrie textura normală a jucătorului pe perioada în care este activ
  const finalFill = isGolden ? "url(#liquid-imperial)" : current.fill;

  return (
    <div 
      className={`relative transition-all duration-700 ${!spart ? 'animate-float-v9' : 'scale-[0.85] opacity-70 rotate-6 filter grayscale-[30%]'}`} 
      style={{ 
        width: 'clamp(110px, 30vw, 180px)', 
        height: 'auto', 
        aspectRatio: '1 / 1.35' 
      }}
    >
      {/* GLOW DE PROFUNZIME (OLED OPTIMIZED V22) */}
      {(isGolden || !spart) && (
        <div 
          className="absolute inset-[-20%] rounded-full blur-[50px] opacity-30 animate-pulse transition-all duration-1000 mix-blend-screen pointer-events-none"
          style={{ backgroundColor: isGolden ? '#fbbf24' : current.glow }}
        ></div>
      )}

      {/* SVG-ul propriu-zis care desenează oul */}
      <svg viewBox="0 0 100 130" className="w-full h-full relative z-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
        <defs>
          {/* GRADIENTE COMPLEXE PENTRU DENSITATE VIZUALĂ (Filtre High-End) */}
          <linearGradient id="liquid-ruby" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ef4444' }} /><stop offset="100%" style={{ stopColor: '#7f1d1d' }} />
          </linearGradient>
          <linearGradient id="liquid-sapphire" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6' }} /><stop offset="100%" style={{ stopColor: '#1e3a8a' }} />
          </linearGradient>
          <linearGradient id="liquid-imperial" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fbbf24' }} /><stop offset="100%" style={{ stopColor: '#78350f' }} />
          </linearGradient>
          <linearGradient id="liquid-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#10b981' }} /><stop offset="100%" style={{ stopColor: '#064e3b' }} />
          </linearGradient>
          <linearGradient id="liquid-nebula" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6' }} /><stop offset="100%" style={{ stopColor: '#2e1065' }} />
          </linearGradient>
          
          <radialGradient id="highLight" cx="40%" cy="30%" r="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.6)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
          </radialGradient>
        </defs>

        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={finalFill} />
        {/* Reflexia luminii pentru efectul 3D */}
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill="url(#highLight)" opacity="0.6" />

        {/* LOGICA DE CRĂPARE (Apare doar dacă 'spart' este true) */}
        {spart && (
          <g stroke="rgba(0,0,0,0.95)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className="animate-pop">
            <path d="M30 40 L55 65 L45 85 L75 110 L65 125" />
            <path d="M70 45 L55 75 L85 95 L65 115" />
            <path d="M40 20 L50 40 L35 60" />
          </g>
        )}
      </svg>

      {/* STELUȚA DE VETERAN */}
      {hasStar && (
        <div className="absolute -top-6 -right-6 text-5xl md:text-6xl animate-star drop-shadow-[0_0_20px_rgba(234,179,8,1)] z-20 select-none">⭐</div>
      )}

      {/* EFECT VIZUAL LA IMPACT */}
      {spart && (
        <div className="absolute inset-0 flex items-center justify-center text-7xl md:text-9xl animate-pop pointer-events-none z-30 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]">💥</div>
      )}
    </div>
  );
};

// ==========================================================================================
// 2. COMPONENTA PRINCIPALĂ: ArenaMaster (Matchmaking, Chat & Combat Integrity)
// ==========================================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nume, playSound, triggerVibrate, userStats, setUserStats, incrementGlobal } = useGlobalStats();

  // --- CONFIGURARE ARENĂ ---
  const isPrivate = room.includes("privat-");
  const roomCode = room.replace("privat-", ""); 

  // --- STĂRI JOC (INTEGRITY CORE) ---
  const [me, setMe] = useState({ 
    skin: searchParams.get("skin") || 'red', 
    isGolden: searchParams.get("golden") === "true", 
    hasStar: false 
  });
  const [opponent, setOpponent] = useState(null);
  const [rezultat, setRezultat] = useState(null);
  const [impactFlash, setImpactFlash] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  const [matchmakingTimer, setMatchmakingTimer] = useState(0);

  // --- STĂRI SOCIAL & LAYOUT ---
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const isHost = searchParams.get("host") === "true";
  const teamId = searchParams.get("teamId");

  // ROLURI: Dacă ești într-un meci privat și nu ești gazdă, aștepți.
  const canStrike = !rezultat && opponent && (!isPrivate || isHost);

  const roleInstruction = isHost || !isPrivate
    ? "LOVEȘTE TELEFONUL SAU APASĂ AICI 💥" 
    : "ȚINE STRÂNS! PROTEJEAZĂ OUL! 🛡️";

  /**
   * AUDIO ENGINE V22 - Redare sunete locale
   */
  const playArenaSound = useCallback((type) => {
    try {
      let audioFile = '';
      if (type === 'spargere') audioFile = '/spargere.mp3';
      if (type === 'victorie') audioFile = '/victorie.mp3';
      if (type === 'esec') audioFile = '/esec.mp3';
      
      if (audioFile) {
        const audio = new Audio(audioFile);
        audio.volume = 1.0;
        audio.play().catch(e => console.warn("Browserul a blocat sunetul auto-play.", e));
      }
    } catch(e) {}
  }, []);

  /**
   * EFECT 2.1: LOGICA DE FALLBACK LA BOT
   */
  useEffect(() => {
    if (opponent || rezultat || isBotMatch || isHost || isPrivate) return;

    const botInterval = setInterval(() => {
      setMatchmakingTimer(prev => {
        if (prev >= 6) {
          clearInterval(botInterval);
          setIsBotMatch(true);
          setOpponent({ jucator: "🤖 BOT_CIOCNITOR", skin: 'gold', isGolden: false, hasStar: true });
          playSound('bot-activate');
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(botInterval);
  }, [opponent, rezultat, isBotMatch, isHost, isPrivate, playSound]);

  /**
   * EFECT 2.2: PUSHER REAL-TIME HUB
   */
  useEffect(() => {
    if (isBotMatch) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu", forceTLS: true });
    const arenaChannel = pusher.subscribe(`arena-${room}`);

    const broadcastPresence = () => {
      fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: room, 
          actiune: 'join', 
          jucator: nume, 
          skin: me.skin, 
          isGolden: me.isGolden, 
          hasStar: userStats.wins >= 10 
        })
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
      playSound('chat-pop');
    });

    arenaChannel.bind("lovitura", (data) => executeBattle(data));

    return () => {
      pusher.unsubscribe(`arena-${room}`);
      pusher.disconnect();
    };
  }, [room, nume, me, isBotMatch, userStats.wins, playSound]);

  /**
   * EXECUTE BATTLE (Mecanica de victorie / înfrângere)
   */
  const executeBattle = async (data) => {
    if (rezultat) return;

    let amCastigat = false;
    
    if (me.isGolden) {
      amCastigat = true;
    } else if (opponent?.isGolden) {
      amCastigat = false;
    } else {
      if (data.jucator === nume) {
        amCastigat = data.castigaCelCareDa;
      } else {
        amCastigat = !data.castigaCelCareDa;
      }
    }

    setImpactFlash(true);
    playArenaSound('spargere'); // SUNETUL TĂU CUSTOM DE SPARGERE
    triggerVibrate(amCastigat ? [100, 50, 100, 50, 100] : [800]);

    incrementGlobal();

    setTimeout(() => {
      setImpactFlash(false);
      setRezultat({ win: amCastigat });
      
      // DECLANȘARE SUNET FINAL (VICTORIE SAU EȘEC)
      playArenaSound(amCastigat ? 'victorie' : 'esec');

      const newStats = { 
        ...userStats, 
        wins: amCastigat ? (userStats.wins || 0) + 1 : (userStats.wins || 0),
        losses: !amCastigat ? (userStats.losses || 0) + 1 : (userStats.losses || 0),
        hasGoldenEgg: false 
      };
      setUserStats(newStats);
      localStorage.setItem("c_stats", JSON.stringify(newStats));
    }, 600);
  };

  /**
   * TRIGGERE DE CIOCNIRE: Manual (Buton) și Accelerometru
   */
  const declanseazaLovitura = useCallback(() => {
    if (!canStrike) return;

    if (isBotMatch) {
      executeBattle({ jucator: nume, castigaCelCareDa: Math.random() < 0.5 });
    } else {
      fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room, actiune: 'lovitura', jucator: nume, isHost, teamId })
      });
    }
  }, [canStrike, isBotMatch, nume, room, isHost, teamId]);

  useEffect(() => {
    if (!canStrike) return;

    const handleMotion = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      
      // SENSIBILITATE REDUSĂ LA 15 (Flick din încheietură e de ajuns)
      if (force > 15) {
        window.removeEventListener("devicemotion", handleMotion);
        declanseazaLovitura();
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [canStrike, declanseazaLovitura]);

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
    <div className={`w-full max-w-full overflow-hidden flex flex-col items-center gap-6 px-4 transition-all duration-75 min-h-[100dvh] pb-8 ${impactFlash ? 'animate-impact scale-105 blur-[2px]' : ''}`}>
      
      {/* FLOATING HEADER: COD CAMERĂ PRIVATĂ */}
      {isPrivate && !rezultat && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#050505]/90 backdrop-blur-2xl px-10 py-4 rounded-full border border-white/10 z-[60] flex items-center gap-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-fade-in-up">
           <span className="text-white/40 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em]">Cod Intrare:</span>
           <span className="text-yellow-500 font-black tracking-[0.3em] text-2xl md:text-3xl drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">{roomCode}</span>
        </div>
      )}

      {/* HEADER: STATUS & ROLE INSTRUCTION */}
      <header className="text-center space-y-4 animate-pop w-full mt-24 md:mt-12 z-20">
         <div className="inline-block px-10 py-3 rounded-full bg-black/80 border border-white/10 backdrop-blur-3xl shadow-2xl">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                {isBotMatch ? "🤖 ANTRENAMENT SANCTUAR" : (opponent ? "⚔️ ARENĂ ACTIVĂ" : "🔍 CĂUTARE O PONENT...")}
            </span>
         </div>
      </header>

      {/* ZONA DE LUPTĂ (OUĂLE) */}
      <div className="w-full max-w-4xl flex justify-between items-center gap-2 md:gap-20 relative px-2 z-20 mt-4">
         
         {/* LUPTĂTOR: TU */}
         <div className="flex flex-col items-center gap-8 flex-1">
            <OuTitan skin={me.skin} isGolden={me.isGolden} hasStar={userStats.wins >= 10} spart={rezultat && !rezultat.win} />
            <div className="liquid-glass p-4 px-8 rounded-[2rem] text-center w-full max-w-[140px] md:max-w-none">
               <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/30 block mb-1">Ești Tu</span>
               <span className="text-base md:text-2xl font-black text-white italic truncate block drop-shadow-md">{nume}</span>
            </div>
         </div>

         {/* CENTRU: VS DIVIDER */}
         <div className="flex flex-col items-center justify-center">
            <div className="text-6xl md:text-9xl font-black text-white/[0.03] italic select-none drop-shadow-2xl">VS</div>
         </div>

         {/* LUPTĂTOR: INAMIC */}
         <div className="flex flex-col items-center gap-8 flex-1">
            {opponent ? (
              <>
                <OuTitan skin={opponent.skin} isGolden={opponent.isGolden} hasStar={opponent.hasStar} spart={rezultat && rezultat.win} />
                <div className="bg-red-900/20 backdrop-blur-2xl p-4 px-8 rounded-[2rem] border border-red-600/30 text-center shadow-[0_10px_30px_rgba(220,38,38,0.2)] w-full max-w-[140px] md:max-w-none">
                   <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-red-500 block mb-1 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">Rival</span>
                   <span className="text-base md:text-2xl font-black text-white italic truncate block">{opponent.jucator}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-8 animate-pulse opacity-40">
                 <div className="w-[110px] h-[150px] md:w-[180px] md:h-[245px] bg-white/[0.02] rounded-full border-2 border-dashed border-white/10" />
                 <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white/20 text-center">Așteptăm...</span>
              </div>
            )}
         </div>
      </div>

      {/* ACTION BUTTON (NOU: Butonul de apăsare fizică) */}
      <div className="w-full max-w-sm flex justify-center z-30 mt-4 md:mt-8 min-h-[80px]">
        {opponent && !rezultat && (
          canStrike ? (
            <button 
              onClick={declanseazaLovitura}
              className="bg-red-600 w-full py-5 rounded-[2rem] font-black text-white uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm shadow-[0_15px_40px_rgba(220,38,38,0.6)] border-2 border-red-500/50 hover:bg-red-500 hover:scale-105 active:scale-95 transition-all animate-pulse relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[600ms]"></div>
              {roleInstruction}
            </button>
          ) : (
            <div className="bg-white/5 w-full py-5 rounded-[2rem] border border-white/10 text-center shadow-inner">
               <span className="text-white/40 font-black text-[10px] md:text-xs uppercase tracking-[0.3em]">{roleInstruction}</span>
            </div>
          )
        )}
      </div>

      {/* SOCIAL: LIQUID GLASS CHAT */}
      <section className="w-full max-w-2xl liquid-glass p-5 md:p-6 rounded-[2.5rem] relative overflow-hidden mt-auto mb-4 z-20">
         <div className="h-32 md:h-48 overflow-y-auto flex flex-col-reverse gap-4 custom-scrollbar mb-4 pr-2 text-xs break-words">
            {messages.length > 0 ? messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start animate-fade-in-up'}`}>
                <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 px-4">{m.autor}</span>
                <div className={`p-3 md:p-4 px-5 md:px-6 rounded-[1.8rem] font-bold shadow-xl ${m.autor === nume ? 'bg-red-600 text-white rounded-tr-sm shadow-[0_5px_15px_rgba(220,38,38,0.3)]' : 'bg-[#111] text-white/90 rounded-tl-sm border border-white/10'}`}>
                  {m.text}
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center opacity-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white text-center">Tăcere în Sanctuar...</p>
              </div>
            )}
         </div>
         <div className="flex gap-3 bg-[#000] p-2 rounded-full border border-white/10 focus-within:border-red-600/50 transition-all shadow-inner">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Trimite un mesaj adversarului..." 
              className="flex-1 bg-transparent p-3 md:p-4 text-[11px] md:text-xs font-bold text-white outline-none pl-6 tracking-wide placeholder:text-white/20"
            />
            <button onClick={handleChat} className="bg-white/10 hover:bg-white/20 border border-white/10 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all text-sm md:text-lg">💬</button>
         </div>
      </section>

      {/* MODAL: REZULTAT FINAL (FULLSCREEN OLED OVERLAY) */}
      {rezultat && (
        <div className="fixed inset-0 bg-[#020202]/95 backdrop-blur-3xl z-[5000] flex flex-col items-center justify-center p-6 text-center animate-fade-in touch-none">
           <div className="max-w-xl w-full space-y-12 animate-pop">
              
              <div className={`text-9xl md:text-[12rem] mb-6 drop-shadow-2xl ${rezultat.win ? 'animate-bounce drop-shadow-[0_0_50px_rgba(234,179,8,0.5)]' : 'grayscale opacity-30 filter drop-shadow-none'}`}>
                {rezultat.win ? '👑' : '🥀'}
              </div>
              
              <h2 className={`text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none ${rezultat.win ? 'text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]' : 'text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]'}`}>
                {rezultat.win ? 'VICTORIE' : 'ÎNFRÂNGERE'}
              </h2>
              
              <p className="text-white/40 font-black uppercase tracking-[0.5em] text-[10px] md:text-xs leading-relaxed">
                 Bilanțul național a crescut. <br/> Sanctuarul te recunoaște, {nume}.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 pt-8 w-full justify-center px-4">
                 <button onClick={() => window.location.reload()} className="flex-1 bg-red-600 text-white py-6 md:py-8 rounded-[2rem] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(220,38,38,0.5)] text-xs md:text-sm border border-red-500">Joacă Din Nou ⚔️</button>
                 <button onClick={() => router.push('/')} className="flex-1 bg-white/5 border border-white/10 py-6 md:py-8 rounded-[2rem] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white/10 active:scale-95 transition-all text-[10px] md:text-xs text-white/50 hover:text-white">Înapoi la Bază</button>
              </div>
           </div>
           
           {/* Ambient light for the result screen */}
           <div className={`fixed inset-0 pointer-events-none z-[-1] blur-[150px] opacity-20 ${rezultat.win ? 'bg-green-500' : 'bg-red-600'}`}></div>
        </div>
      )}

    </div>
  );
}

// ==========================================================================================
// 3. EXPORT ROOT: PaginaJoc (Stabilitate Mobile & Viewport Fix)
// ==========================================================================================

export default function PaginaJoc({ params }) {
  // Despachetăm parametrii rezolvați pentru versiunea curentă de Next.js
  const resolvedParams = React.use(params);
  const { room } = resolvedParams;

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-0 bg-[#020202] relative overflow-hidden touch-none selection:bg-red-600">
      
      {/* BACKGROUND FX: TECH PRIMITIVE LAYERING */}
      <div className="ambient-glow-titan fixed inset-0"></div>
      <div className="fixed inset-0 bg-liquid-mesh opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
      }}></div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-10 z-50">
          <div className="w-24 h-24 border-[6px] border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(220,38,38,0.5)]"></div>
          <span className="text-[11px] md:text-xs font-black uppercase tracking-[1em] text-white/30 animate-pulse italic drop-shadow-md">CONECTARE ARENĂ...</span>
        </div>
      }>
        <ArenaMaster room={room} />
      </Suspense>

      {/* WATERMARKS SEO DEEP BACKGROUND */}
      <div className="fixed bottom-[-5vh] left-[-5vw] text-[20vh] md:text-[35vh] font-black italic text-white/[0.01] pointer-events-none uppercase rotate-6 select-none mix-blend-overlay tracking-tighter">Ciocnește</div>
      <div className="fixed top-[-5vh] right-[-5vw] text-[20vh] md:text-[35vh] font-black italic text-white/[0.01] pointer-events-none uppercase -rotate-6 select-none mix-blend-overlay tracking-tighter">Tradiția</div>
    </div>
  );
}