"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - ARENA SUPREMĂ TITAN (VERSION 7.0 - THE GOLDEN UPDATE)
 * ------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (Collaboration Engine)
 * Tehnologii: React 19, Next.js 16 (Turbopack), Pusher Real-time, LocalPersistence.
 * * 📜 CHANGELOG ARENA 7.0:
 * 1. GOLDEN EGG LOGIC: Dacă jucătorul deține Oul de Aur, victoria este garantată 100%.
 * 2. ARENA CHAT: Sistem de mesagerie integrat pentru duelurile aleatorii și de echipă.
 * 3. VETERAN STARS: Renderizarea automată a stelei de onoare pentru utilizatorii cu 10+ WINS.
 * 4. AUTO-SAVE: Sincronizarea victoriilor în localStorage la finalul fiecărui meci.
 * 5. SKIN ENGINE V2: Suport extins pentru texturi: Diamond, Cosmic, Gold și Tradițional.
 * 6. ASYNC PARAMS FIX: Despachetarea corectă a rutei folosind React.use().
 * ==========================================================================================
 */

import React, { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";

// ==========================================================================
// 1. ENGINE GRAFIC: OuTitan (SVG Dinamic cu suport pentru Stele și Skin-uri)
// ==========================================================================

const OuTitan = ({ skin, width = "180px", spart = false, hasStar = false, isGolden = false }) => {
  // Configurare paletă de culori în funcție de skin-ul ales
  const skinMap = {
    red: { fill: "#dc2626", pattern: "rgba(255,255,255,0.1)" },
    blue: { fill: "#2563eb", pattern: "rgba(255,255,255,0.1)" },
    gold: { fill: "#f59e0b", pattern: "rgba(0,0,0,0.1)" },
    diamond: { fill: "#6ee7b7", pattern: "rgba(255,255,255,0.3)" },
    cosmic: { fill: "#a855f7", pattern: "rgba(255,255,255,0.2)" },
  };

  const currentSkin = skinMap[skin] || skinMap.red;
  // Oul de aur forțează skin-ul auriu cu glow suplimentar
  const finalFill = isGolden ? "#fbbf24" : currentSkin.fill;

  return (
    <div className={`relative transition-all duration-700 ${!spart ? 'animate-float-v7' : ''}`} style={{ width, height: `calc(${width} * 1.3)` }}>
      {/* Glow Aura pentru Oul de Aur */}
      {isGolden && <div className="absolute inset-[-20%] bg-yellow-400/20 blur-[40px] rounded-full animate-pulse"></div>}
      
      <svg viewBox="0 0 100 130" className={`w-full h-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] ${isGolden ? 'drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]' : ''}`}>
        <defs>
          <linearGradient id={`grad-${skin}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.4)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.2)', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="innerGlow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="out" result="glow" />
          </filter>
        </defs>

        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={finalFill} />
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={`url(#grad-${skin})`} opacity="0.4" />

        {/* Pattern Tradițional Geometrizat */}
        <g stroke={currentSkin.pattern} strokeWidth="3" fill="none">
          <path d="M20 40 L50 20 L80 40 M20 60 L50 40 L80 60 M20 80 L50 60 L80 80" />
          <circle cx="50" cy="70" r="15" opacity="0.2" />
        </g>

        {/* LOGICA DE CRĂPARE (Dinamica) */}
        {spart && (
          <g className="animate-pop" stroke="#000" strokeWidth="4" strokeLinecap="round">
            <path d="M30 30 L50 50 L40 70 L60 85 L50 110" />
            <path d="M70 40 L55 60 L75 80 L65 100" />
          </g>
        )}
      </svg>

      {/* STELUȚA DE VETERAN (10+ VICTORII) */}
      {hasStar && (
        <div className="absolute top-0 right-0 text-3xl animate-star drop-shadow-lg">⭐</div>
      )}
      
      {spart && <div className="absolute inset-0 flex items-center justify-center text-7xl animate-pop">💥</div>}
    </div>
  );
};

// ==========================================================================
// 2. COMPONENTA: ArenaMaster (Logica de Luptă și Social)
// ==========================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nume, playSound, triggerVibrate } = useGlobalStats();

  // --- STĂRI DE PERSISTENȚĂ ---
  const [stats, setStats] = useState({ wins: 0, skin: 'red', hasGoldenEgg: false });
  
  // --- STĂRI JOC ---
  const [me, setMe] = useState({ ready: false, skin: 'red', isGolden: false });
  const [opponent, setOpponent] = useState(null);
  const [rezultat, setRezultat] = useState(null);
  const [flash, setFlash] = useState(false);
  
  // --- STĂRI CHAT ---
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const isHost = searchParams.get("host") === "true";

  /**
   * EFECT: Încărcare statistici din LocalStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem("c_stats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setStats(parsed);
      setMe(prev => ({ ...prev, skin: parsed.skin, isGolden: parsed.hasGoldenEgg }));
    }
  }, []);

  /**
   * LOGICA PUSHER: Sincronizare Duel și Chat
   */
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu" });
    const channel = pusher.subscribe(`arena-${room}`);

    // Semnalăm prezența noastră
    postSignal('join', { skin: me.skin, isGolden: me.isGolden, hasStar: stats.wins >= 10 });

    channel.bind("join", (data) => {
      if (data.jucator !== nume) {
        setOpponent(data);
        postSignal('handshake', { skin: me.skin, isGolden: me.isGolden, hasStar: stats.wins >= 10 });
      }
    });

    channel.bind("handshake", (data) => {
      if (data.jucator !== nume) setOpponent(data);
    });

    channel.bind("chat-arena", (data) => {
      setMessages(prev => [{ autor: data.jucator, text: data.text }, ...prev].slice(0, 5));
    });

    channel.bind("lovitura", (data) => resolveImpact(data));

    return () => pusher.unsubscribe(`arena-${room}`);
  }, [room, nume, me.skin, me.isGolden, stats.wins]);

  const postSignal = (actiune, date = {}) => {
    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room, actiune, jucator: nume, isHost, ...date })
    });
  };

  /**
   * REZOLVARE IMPACT: Logica de victorie (Golden Egg prioritized)
   */
  const resolveImpact = (data) => {
    // 1. Verificăm dacă unul dintre jucători are Oul de Aur (Auto-Win)
    let amCastigat = false;
    
    if (me.isGolden) {
      amCastigat = true; // God Mode activat
    } else if (opponent?.isGolden) {
      amCastigat = false; // Adversarul are God Mode
    } else {
      // Logica normală de server
      amCastigat = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;
    }

    setFlash(true);
    playSound('spargere');
    triggerVibrate(amCastigat ? [100, 50, 100] : [800]);

    setTimeout(() => {
      setFlash(false);
      setRezultat({ win: amCastigat });
      playSound(amCastigat ? 'victorie' : 'esec');

      // SALVARE ÎN PERSISTENȚĂ (Tine minte tot)
      if (amCastigat) {
        const newWins = stats.wins + 1;
        const newStats = { ...stats, wins: newWins, hasGoldenEgg: false }; // Consumăm oul de aur dacă a fost folosit
        localStorage.setItem("c_stats", JSON.stringify(newStats));
        setStats(newStats);
      }
    }, 600);
  };

  /**
   * DETECTARE MIȘCARE (Accelerometru)
   */
  useEffect(() => {
    if (rezultat || !opponent) return;

    const handleMotion = (e) => {
      const force = Math.abs(e.acceleration.x) + Math.abs(e.acceleration.y);
      if (force > 30) {
        window.removeEventListener("devicemotion", handleMotion);
        postSignal('lovitura');
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [rezultat, opponent]);

  return (
    <div className={`w-full max-w-4xl flex flex-col items-center gap-12 transition-all ${flash ? 'scale-110 blur-[4px]' : ''}`}>
      
      {/* HEADER ARENĂ */}
      <div className="text-center space-y-2">
        <div className="glass-panel px-8 py-3 rounded-full border border-red-600/30">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Arena de Luptă Titan</span>
        </div>
        {!rezultat && opponent && (
          <h2 className="text-5xl font-black italic text-white animate-pulse">CIOCNEȘTE ACUM!</h2>
        )}
      </div>

      {/* ZONA DE LUPTĂ (VS) */}
      <div className="w-full flex justify-between items-center px-10 relative">
        {/* JUCĂTOR: EU */}
        <div className="flex flex-col items-center gap-6">
          <OuTitan skin={me.skin} isGolden={me.isGolden} hasStar={stats.wins >= 10} spart={rezultat && !rezultat.win} />
          <div className="flex flex-col items-center">
            <span className="text-xs font-black uppercase text-white/40 mb-1">Tu (Luptător)</span>
            <span className="bg-white/5 px-4 py-1 rounded-lg font-bold text-sm border border-white/10">{nume}</span>
          </div>
        </div>

        <div className="text-6xl font-black text-white/5 italic select-none">VS</div>

        {/* JUCĂTOR: ADVERSAR */}
        <div className="flex flex-col items-center gap-6">
          {opponent ? (
            <>
              <OuTitan skin={opponent.skin} isGolden={opponent.isGolden} hasStar={opponent.hasStar} spart={rezultat && rezultat.win} />
              <div className="flex flex-col items-center">
                <span className="text-xs font-black uppercase text-white/40 mb-1">Adversar</span>
                <span className="bg-red-600/20 px-4 py-1 rounded-lg font-bold text-sm border border-red-600/30 text-red-500">{opponent.jucator}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div className="w-[180px] h-[230px] bg-white/5 rounded-full border-4 border-dashed border-white/10" />
              <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Se caută adversar...</span>
            </div>
          )}
        </div>
      </div>

      {/* SISTEM CHAT ARENĂ */}
      <div className="w-full max-w-md glass-panel p-6 rounded-[2.5rem] shadow-2xl">
        <div className="h-32 overflow-y-auto flex flex-col-reverse gap-3 titan-scroll mb-4 px-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.autor === nume ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 px-5 rounded-2xl text-xs font-bold ${m.autor === nume ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
          <input 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (postSignal('chat-arena', { text: chatInput }), setChatInput(""))}
            placeholder="Zi ceva luptătorului..." 
            className="flex-1 bg-transparent border-none p-3 text-xs font-bold text-white outline-none"
          />
          <button onClick={() => { postSignal('chat-arena', { text: chatInput }); setChatInput(""); }} className="bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center">🚀</button>
        </div>
      </div>

      {/* REZULTAT FINAL */}
      {rezultat && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[500] flex flex-col items-center justify-center animate-fade-in p-6">
          <div className="text-center space-y-8 animate-pop">
            <h3 className={`text-7xl font-black uppercase tracking-tighter ${rezultat.win ? 'text-green-500' : 'text-red-600'}`}>
              {rezultat.win ? 'VICTORIE!' : 'AI PIERDUT!'}
            </h3>
            <p className="text-white/40 font-bold uppercase tracking-[0.4em]">Toate statisticile au fost salvate.</p>
            <div className="flex gap-4">
               <button onClick={() => window.location.reload()} className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">Revanșă ⚔️</button>
               <button onClick={() => router.push('/')} className="bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">Acasă 🏠</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * CONTAINER EXPORT: PaginaJoc
 */
export default function PaginaJoc({ params }) {
  const resolvedParams = React.use(params);
  const { room } = resolvedParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-ethnic-dark relative overflow-hidden">
      <div className="ambient-mesh"></div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-black uppercase tracking-[0.8em] text-white/20">Securizare Arenă...</span>
        </div>
      }>
        <ArenaMaster room={room} />
      </Suspense>

      {/* Watermark Fundal */}
      <div className="fixed bottom-[-10vh] right-[-5vw] text-[30vh] font-black italic text-white/[0.02] pointer-events-none uppercase">Arena</div>
    </div>
  );
}

/**
 * ==========================================================================================
 * NOTE FINALE UPDATE 7.0:
 * 1. Logica de Golden Egg este prioritară în 'resolveImpact'.
 * 2. Am triplat caracterele prin implementarea sistemului de chat și a noilor skin-uri.
 * 3. Persistența este garantată prin actualizarea 'localStorage' la fiecare victorie.
 * 4. Steluța de 10 victorii este randată condiționat în componenta OuTitan.
 * ==========================================================================================
 */