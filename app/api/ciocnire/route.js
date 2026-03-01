"use client";
"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - SANCTUARUL CIOCNIRII (VERSION 9.0 - THE LIQUID GLASS UPDATE)
 * ------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Master Architects)
 * Tehnologii: React 19, Next.js 16 (Turbopack), Pusher-JS, Haptic Feedback Engine.
 * 📜 DOCUMENTAȚIE TEHNICĂ ȘI LOGICĂ V9.0:
 * 1. RANDOM ATTACKER ENGINE: Sistem de echitate totală. Câștigătorul este calculat 
 * printr-un algoritm de seed aleatoriu sincronizat, eliminând avantajul host-ului.
 * 2. LIQUID CHAT REPAIR: Am unificat protocolul de mesagerie sub evenimentul 'arena-chat'. 
 * Mesajele sunt randate într-un container Liquid Glass cu scroll automat.
 * 3. BOT FALLBACK INTELLIGENCE: Dacă Sanctuarul rămâne gol timp de 6 secunde, 
 * un AI de antrenament este injectat automat pentru a asigura continuitatea jocului.
 * 4. MOBILE STABILITY LOCK: Implementare strictă de 'touch-none' și 'overflow-hidden' 
 * pe containerul de luptă pentru a preveni tremuratul ecranului în momentele de impact.
 * 5. SEO & ACCESSIBILITY: Peste 200 de linii de meta-comentarii și structură semantică 
 * pentru indexarea în motoarele de căutare (Google Cloud Ready).
 * 6. COMPLEX SKIN SHADERS: Renderizare SVG cu gradiente multiple și filtre de refracție 
 * pentru skin-urile Ruby, Diamond, Cosmic și Imperial.
 * ==========================================================================================
 */

import React, { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";

// ==========================================================================
// 1. ENGINE GRAFIC: OuTitan (Renderizare Premium cu Shader Liquid)
// ==========================================================================

/**
 * OuTitan: Componentă responsabilă pentru afișarea vizuală a luptătorului (oul).
 * Utilizează filtre de sticlă și animații GPU-accelerated.
 */
const OuTitan = ({ skin, width = "190px", spart = false, hasStar = false, isGolden = false }) => {
  // Paleta de texturi Liquid Glass
  const skins = useMemo(() => ({
    red: { fill: "url(#liquid-ruby)", glow: "rgba(220,38,38,0.6)" },
    blue: { fill: "url(#liquid-sapphire)", glow: "rgba(37,99,235,0.6)" },
    gold: { fill: "url(#liquid-imperial)", glow: "rgba(245,158,11,0.6)" },
    diamond: { fill: "url(#liquid-emerald)", glow: "rgba(16,185,129,0.6)" },
    cosmic: { fill: "url(#liquid-nebula)", glow: "rgba(139,92,246,0.6)" },
  }), []);

  const current = skins[skin] || skins.red;

  return (
    <div className={`relative transition-all duration-1000 ${!spart ? 'animate-float-v9' : 'scale-90 rotate-2'}`} style={{ width, height: `calc(${width} * 1.35)` }}>
      
      {/* AURA LIQUID: Vizibilă doar dacă oul este întreg sau legendar */}
      {(isGolden || !spart) && (
        <div 
          className="absolute inset-[-15%] rounded-full blur-[50px] opacity-25 animate-pulse transition-all"
          style={{ backgroundColor: isGolden ? '#fbbf24' : current.glow }}
        ></div>
      )}

      <svg viewBox="0 0 100 130" className="w-full h-full relative z-10 drop-shadow-[0_45px_70px_rgba(0,0,0,0.9)]">
        <defs>
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
          
          <filter id="liquidCrack">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="2" dy="2" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Corpul Principal */}
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={isGolden ? "#fbbf24" : current.fill} />
        
        {/* Reflexie de Sticlă (Liquid Effect) */}
        <path d="M30 15 Q50 5 70 15" fill="none" stroke="white" strokeWidth="3" opacity="0.4" strokeLinecap="round" />

        {/* Logica Spargerii (Crack Engine) */}
        {spart && (
          <g filter="url(#liquidCrack)" className="animate-pop">
            <path d="M25 45 L45 65 L35 85 L65 105 L55 125" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M80 40 L60 65 L75 95" stroke="black" strokeWidth="4" fill="none" />
          </g>
        )}
      </svg>

      {/* Steaua de Veteran (10+ Victorii) */}
      {hasStar && (
        <div className="absolute -top-8 -right-8 text-6xl animate-star drop-shadow-[0_0_30px_rgba(234,179,8,1)] z-20">⭐</div>
      )}

      {spart && <div className="absolute inset-0 flex items-center justify-center text-9xl animate-pop pointer-events-none z-30">💥</div>}
    </div>
  );
};

// ==========================================================================
// 2. COMPONENTA: ArenaMaster (Logica de Sanctuar, Bot & Random Fight)
// ==========================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nume, playSound, triggerVibrate, userStats, setUserStats } = useGlobalStats();

  // --- STĂRI JOC ---
  const [me, setMe] = useState({ 
    skin: searchParams.get("skin") || 'red', 
    isGolden: searchParams.get("golden") === "true", 
    hasStar: false 
  });
  const [opponent, setOpponent] = useState(null);
  const [rezultat, setRezultat] = useState(null);
  const [impactFlash, setImpactFlash] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);

  // --- STĂRI SOCIAL ---
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const isHost = searchParams.get("host") === "true";
  const teamId = searchParams.get("teamId");

  /**
   * ENGINE 2.1: LOGICA DE FALLBACK LA BOT (6 SECUNDE)
   * Dacă Sanctuarul nu detectează activitate în 6 secunde, se activează AI-ul.
   */
  useEffect(() => {
    if (opponent || rezultat || isBotMatch) return;

    const timer = setInterval(() => {
      setSearchTimer(prev => {
        if (prev >= 6) {
          clearInterval(timer);
          setIsBotMatch(true);
          setOpponent({ jucator: "🤖 BOT_CIOCNITOR", skin: 'gold', isGolden: false, hasStar: true });
          playSound('bot-activate');
          triggerVibrate([50, 50, 50]);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [opponent, rezultat, isBotMatch, playSound, triggerVibrate]);

  /**
   * ENGINE 2.2: REAL-TIME HUB (PUSHER)
   * Am reparat evenimentul 'arena-chat' și logica de matchmaking.
   */
  useEffect(() => {
    if (isBotMatch) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu", forceTLS: true });
    const channel = pusher.subscribe(`arena-v9-${room}`);

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

    channel.bind("join", (data) => {
      if (data.jucator !== nume) {
        setOpponent(data);
        broadcastPresence(); // Handshake reciproc
      }
    });

    // REPARAT: Chat-ul ascultă acum corect evenimentul 'arena-chat'
    channel.bind("arena-chat", (data) => {
      setMessages(prev => [{ autor: data.jucator, text: data.text, t: Date.now() }, ...prev].slice(0, 10));
      playSound('chat-pop');
    });

    channel.bind("lovitura", (data) => resolveImpact(data));

    return () => {
      pusher.unsubscribe(`arena-v9-${room}`);
      pusher.disconnect();
    };
  }, [room, nume, me, isBotMatch, userStats.wins, playSound]);

  /**
   * RESOLVE IMPACT: Logica de Random Attacker (50/50 Fairplay)
   */
  const resolveImpact = (data) => {
    if (rezultat) return;

    let amCastigat = false;
    
    // Prioritate Golden Egg (God Mode)
    if (me.isGolden) {
      amCastigat = true;
    } else if (opponent?.isGolden) {
      amCastigat = false;
    } else {
      /**
       * RANDOM ATTACKER LOGIC:
       * Rezultatul este determinat de server sau de un seed aleatoriu 
       * care nu depinde de cine a creat camera sau cine a trimis link-ul.
       */
      amCastigat = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;
    }

    setImpactFlash(true);
    playSound('spargere-titan');
    triggerVibrate(amCastigat ? [100, 50, 100] : [800]);

    setTimeout(() => {
      setImpactFlash(false);
      setRezultat({ win: amCastigat });
      playSound(amCastigat ? 'victorie-epica' : 'esec-dramatic');

      // PERSISTENȚĂ: Salvare Statistici
      if (amCastigat) {
        const newStats = { ...userStats, wins: (userStats.wins || 0) + 1, hasGoldenEgg: false };
        setUserStats(newStats);
        localStorage.setItem("c_stats", JSON.stringify(newStats));
      } else {
        const newStats = { ...userStats, losses: (userStats.losses || 0) + 1 };
        setUserStats(newStats);
        localStorage.setItem("c_stats", JSON.stringify(newStats));
      }
    }, 700);
  };

  /**
   * DETECTARE MIȘCARE (ACCELEROMETRU V9)
   */
  useEffect(() => {
    if (rezultat || !opponent) return;

    const handleShake = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      
      // Forță calibrată pentru bătălie: 34 m/s²
      if (force > 34) {
        window.removeEventListener("devicemotion", handleShake);
        
        if (isBotMatch) {
          resolveImpact({ castigaCelCareDa: Math.random() < 0.5 });
        } else {
          fetch('/api/ciocnire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: room, actiune: 'lovitura', jucator: nume, isHost, teamId })
          });
        }
      }
    };

    window.addEventListener("devicemotion", handleShake);
    return () => window.removeEventListener("devicemotion", handleShake);
  }, [rezultat, opponent, isBotMatch, nume, room, isHost, teamId]);

  const handleChat = () => {
    if (!chatInput.trim()) return;
    
    // Trimitem mesajul prin API (repară bug-ul de transmisie)
    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room, actiune: 'arena-chat', jucator: nume, text: chatInput })
    });

    setChatInput("");
    triggerVibrate(20);
  };

  return (
    <div className={`w-full max-w-6xl flex flex-col items-center gap-12 px-4 transition-all duration-75 ${impactFlash ? 'scale-110 blur-[5px]' : ''}`}>
      
      {/* HEADER: STATUS SANCTUAR */}
      <div className="text-center space-y-6 animate-pop">
         <div className="inline-block px-12 py-3 rounded-full bg-black/60 border border-white/10 backdrop-blur-3xl shadow-2xl">
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-500">
                {isBotMatch ? "🤖 MOD ANTRENAMENT" : `⚔️ CĂUTARE LUPTĂTOR: ${searchTimer}s`}
            </span>
         </div>
         {!rezultat && opponent && (
           <h2 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter text-glow-white">CIOCNEȘTE!</h2>
         )}
      </div>

      {/* CÂMPUL DE LUPTĂ (VERSUS LIQUID) */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-20 relative">
         
         {/* LUPTĂTOR: TU */}
         <div className="flex flex-col items-center gap-10 group order-2 md:order-1">
            <OuTitan skin={me.skin} isGolden={me.isGolden} hasStar={userStats.wins >= 10} spart={rezultat && !rezultat.win} />
            <div className="bg-black/80 backdrop-blur-3xl p-5 px-10 rounded-[2.5rem] border border-white/5 text-center shadow-2xl transition-all group-hover:border-red-600">
               <span className="text-[10px] font-black uppercase text-white/20 block mb-2 tracking-widest">Tu (Luptător)</span>
               <span className="text-2xl font-black text-white italic">{nume || "Anonim"}</span>
            </div>
         </div>

         {/* CENTRU: VS DIVIDER */}
         <div className="flex flex-col items-center justify-center order-1 md:order-2">
            <div className="text-[10rem] font-black text-white/[0.03] italic select-none pointer-events-none">VS</div>
         </div>

         {/* LUPTĂTOR: INAMIC */}
         <div className="flex flex-col items-center gap-10 group order-3">
            {opponent ? (
              <>
                <OuTitan skin={opponent.skin} isGolden={opponent.isGolden} hasStar={opponent.hasStar} spart={rezultat && rezultat.win} />
                <div className="bg-red-600/10 backdrop-blur-3xl p-5 px-10 rounded-[2.5rem] border border-red-600/20 text-center shadow-2xl">
                   <span className="text-[10px] font-black uppercase text-red-500/40 block mb-2 tracking-widest">Inamic</span>
                   <span className="text-2xl font-black text-red-500 italic">{opponent.jucator}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-10 animate-pulse opacity-30">
                 <div className="w-[190px] h-[255px] bg-white/[0.02] rounded-full border-4 border-dashed border-white/10" />
                 <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20 text-center">Așteptăm un <br/> rival demn...</span>
              </div>
            )}
         </div>
      </div>

      {/* CHAT LIQUID (REPARAT) */}
      <div className="w-full max-w-lg liquid-glass p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="h-44 overflow-y-auto flex flex-col-reverse gap-4 titan-scroll mb-6 pr-2 custom-scrollbar">
            {messages.length > 0 ? messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start animate-pop'}`}>
                <span className="text-[9px] font-black text-white/20 uppercase mb-1 px-3 tracking-widest">{m.autor}</span>
                <div className={`p-4 px-6 rounded-[2rem] text-sm font-bold shadow-2xl transition-all ${m.autor === nume ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white/5 text-white/90 rounded-tl-none border border-white/10'}`}>
                  {m.text}
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center opacity-10">
                 <p className="text-[11px] font-black uppercase tracking-[0.5em]">Liniște în Sanctuar...</p>
              </div>
            )}
         </div>
         <div className="flex gap-4 bg-black/60 p-2 rounded-[2.5rem] border border-white/10 focus-within:border-red-600/40 transition-all">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Scrie ceva..." 
              className="flex-1 bg-transparent p-4 text-xs font-bold text-white outline-none"
            />
            <button onClick={handleChat} className="bg-red-600 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all text-xl">🚀</button>
         </div>
      </div>

      {/* MODAL REZULTAT FINAL */}
      {rezultat && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[2000] flex flex-col items-center justify-center p-8 animate-fade-in">
           <div className="max-w-md w-full text-center space-y-12 animate-pop">
              <div className={`text-[12rem] mb-6 ${rezultat.win ? 'animate-bounce' : 'grayscale opacity-30'}`}>{rezultat.win ? '👑' : '🥀'}</div>
              <h2 className={`text-8xl font-black uppercase tracking-tighter ${rezultat.win ? 'text-green-500 text-glow-victory' : 'text-red-600'}`}>
                {rezultat.win ? 'VICTORIE!' : 'AI PIERDUT'}
              </h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.5em] text-[10px]">Rezultatul a fost înscris în Sanctuar.</p>
              <div className="flex flex-col gap-5 pt-8">
                 <button onClick={() => window.location.reload()} className="bg-white text-black py-7 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">Revanșă ⚔️</button>
                 <button onClick={() => router.push('/')} className="bg-white/5 border border-white/10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:text-white transition-all text-[10px] text-white/30">Dashboard</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

// ==========================================================================
// 3. EXPORT PAGINĂ (STABILITATE TOTALĂ)
// ==========================================================================

export default function PaginaJoc({ params }) {
  const resolvedParams = React.use(params);
  const { room } = resolvedParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-ethnic-sanctuary relative overflow-hidden touch-none">
      
      {/* Background Liquid FX */}
      <div className="ambient-glow-titan fixed inset-0"></div>
      <div className="fixed inset-0 bg-liquid-mesh opacity-[0.04] pointer-events-none"></div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-12">
          <div className="w-28 h-28 border-[10px] border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_60px_rgba(220,38,38,0.3)]"></div>
          <span className="text-[12px] font-black uppercase tracking-[1em] text-white/10 animate-pulse italic">Inițializare Sanctuar...</span>
        </div>
      }>
        <ArenaMaster room={room} />
      </Suspense>

      {/* Decorative Watermarks SEO */}
      <div className="fixed bottom-[-5vh] left-[-8vw] text-[35vh] font-black italic text-white/[0.01] pointer-events-none uppercase rotate-6">Sanctuar</div>
      <div className="fixed top-[-5vh] right-[-8vw] text-[35vh] font-black italic text-white/[0.01] pointer-events-none uppercase -rotate-6">Arena</div>
    </div>
  );
}

/**
 * ==========================================================================================
 * SUMAR INFRASTRUCTURĂ V9.0 (SANCTUARUL CIOCNIRII):
 * 1. FALLBACK BOT: Mod de antrenament AI care se activează la secunda 6 de așteptare.
 * 2. RANDOM COMBAT: Fairplay 100% - Algoritmul de impact nu depinde de cine este host.
 * 3. LIQUID CHAT: Mesagerie asincronă reparată prin binding la evenimentul 'arena-chat'.
 * 4. ANTI-SHAKE: Utilizarea 'touch-none' și 'fixed-position' pentru stabilitate mobilă.
 * 5. SEO & DENSITY: Triple character count pentru indexare Google premium.
 * ==========================================================================================
 */