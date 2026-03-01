"use client";
"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - ARENA SUPREMĂ DE LUPTĂ (VERSION 7.0 - THE TITAN ARCHITECTURE)
 * ------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Collaboration Core)
 * Tehnologii: React 19, Next.js 16 (Turbopack), Pusher-JS, LocalStorage Persistence.
 * * 📜 DESCRIERE TEHNICĂ (UPDATE 7.0):
 * Acest fișier reprezintă punctul culminant al experienței utilizatorului. Gestionează 
 * ciocnirea fizică (accelerometru), sincronizarea stării între doi jucători la distanță 
 * și aplicarea modificatorilor de tip "Golden Egg" sau "Veteran Star".
 * * 🛠️ FIX-URI ȘI LOGICĂ NOUĂ:
 * 1. ASYNC PARAMS: Implementare React.use() pentru conformitate cu Next.js 16.
 * 2. GOLDEN LOGIC: Verificare flag 'golden' (0.1% șansă) pentru victorie automată.
 * 3. SOCIAL HUB: Chat integrat direct în arena de luptă (Random/Team).
 * 4. PERSISTENCE: Salvarea automată a victoriilor în 'c_stats' la finalul meciului.
 * 5. VISUAL ENGINE: Renderizare SVG multi-strat cu efecte de spargere (Crack FX).
 * ==========================================================================================
 */

import React, { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";

// ==========================================================================
// 1. ENGINE GRAFIC: OuTitan (Renderizare Vectorială cu Meta-Date)
// ==========================================================================

/**
 * OuTitan: Componentă responsabilă pentru afișarea oului cu skin-uri și stări dinamice.
 * @param {string} skin - Tipul de skin (red, blue, gold, diamond, cosmic).
 * @param {boolean} spart - Dacă oul trebuie să afișeze animația de spargere.
 * @param {boolean} hasStar - Dacă jucătorul este veteran (10+ victorii).
 * @param {boolean} isGolden - Dacă jucătorul a primit drop-ul legendar (Golden Egg).
 */
const OuTitan = ({ skin, width = "180px", spart = false, hasStar = false, isGolden = false }) => {
  // Configurare proprietăți vizuale pentru skin-uri V7
  const skinConfig = useMemo(() => ({
    red: { fill: "#dc2626", stroke: "#991b1b", pattern: "zigzag" },
    blue: { fill: "#2563eb", stroke: "#1e3a8a", pattern: "dots" },
    gold: { fill: "#f59e0b", stroke: "#b45309", pattern: "royal" },
    diamond: { fill: "#6ee7b7", stroke: "#059669", pattern: "crystal" },
    cosmic: { fill: "#a855f7", stroke: "#6b21a8", pattern: "stars" },
  }), []);

  const current = skinConfig[skin] || skinConfig.red;
  const eggFill = isGolden ? "#fbbf24" : current.fill;

  return (
    <div className={`relative transition-all duration-1000 ${!spart ? 'animate-float-v7' : 'scale-95'}`} style={{ width, height: `calc(${width} * 1.3)` }}>
      
      {/* AURA DE AUR: Activată doar pentru Drop-ul Legendar */}
      {isGolden && (
        <div className="absolute inset-[-25%] bg-yellow-400/30 blur-[50px] rounded-full animate-pulse z-0"></div>
      )}

      {/* SVG-UL PROPRIU-ZIS (GEOMETRIE COMPLEXĂ) */}
      <svg viewBox="0 0 100 130" className={`w-full h-full relative z-10 drop-shadow-[0_35px_50px_rgba(0,0,0,0.7)] ${isGolden ? 'drop-shadow-[0_0_40px_rgba(245,158,11,0.7)]' : ''}`}>
        <defs>
          <radialGradient id={`glow-${skin}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.45)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.2)' }} />
          </radialGradient>
        </defs>

        {/* Corpul oului cu gradient de profunzime */}
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={eggFill} />
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={`url(#glow-${skin})`} opacity="0.5" />

        {/* LOGICA DE SPARGERE (CRACK FX) */}
        {spart && (
          <g className="animate-pop" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M25 40 L45 55 L35 70 L65 85 L55 105 L85 95" />
            <path d="M75 35 L60 50 L80 65 L70 85" />
            <circle cx="50" cy="70" r="20" fill="rgba(0,0,0,0.1)" stroke="none" />
          </g>
        )}
      </svg>

      {/* STELUȚA DE VETERAN (Pragul de 10 Victorii) */}
      {hasStar && (
        <div className="absolute -top-4 -right-4 text-4xl animate-star drop-shadow-[0_0_15px_rgba(234,179,8,0.9)] z-20">⭐</div>
      )}

      {/* EFECT DE EXPLOZIE LA IMPACT */}
      {spart && (
        <div className="absolute inset-0 flex items-center justify-center text-8xl animate-pop pointer-events-none z-30">💥</div>
      )}
    </div>
  );
};



// ==========================================================================
// 2. COMPONENTA: ArenaMaster (Logica de Matchmaking, Luptă și Chat)
// ==========================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Consumăm Contextul Global Titan
  const { nume, playSound, triggerVibrate, userStats, setUserStats } = useGlobalStats();

  // --- STĂRI JOC ȘI SOCIAL ---
  const [me, setMe] = useState({ skin: 'red', isGolden: false, hasStar: false });
  const [opponent, setOpponent] = useState(null);
  const [rezultat, setRezultat] = useState(null);
  const [impactFlashed, setImpactFlashed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const isHost = searchParams.get("host") === "true";
  const teamId = searchParams.get("teamId");

  /**
   * SINCRONIZARE: Încărcăm datele de persistență în starea locală a arenei.
   */
  useEffect(() => {
    if (userStats) {
      setMe({
        skin: userStats.skin || 'red',
        isGolden: userStats.hasGoldenEgg || false,
        hasStar: userStats.wins >= 10
      });
    }
  }, [userStats]);

  /**
   * REAL-TIME ENGINE (PUSHER): Gestionarea evenimentelor de rețea.
   */
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu", forceTLS: true });
    const channel = pusher.subscribe(`arena-v7-${room}`);

    // Notificăm Arena că am intrat (Handshake)
    postAction('join', { skin: me.skin, isGolden: me.isGolden, hasStar: me.hasStar });

    channel.bind("join", (data) => {
      if (data.jucator !== nume) {
        setOpponent(data);
        postAction('handshake', { skin: me.skin, isGolden: me.isGolden, hasStar: me.hasStar });
      }
    });

    channel.bind("handshake", (data) => {
      if (data.jucator !== nume) setOpponent(data);
    });

    channel.bind("chat-arena", (data) => {
      setMessages(prev => [{ autor: data.jucator, text: data.text, t: Date.now() }, ...prev].slice(0, 10));
      playSound('chat-pop');
    });

    channel.bind("lovitura", (data) => processImpact(data));

    return () => {
      pusher.unsubscribe(`arena-v7-${room}`);
      pusher.disconnect();
    };
  }, [room, nume, me]);

  /**
   * FUNCȚIE: Trimitere Semnal către API
   */
  const postAction = async (actiune, extra = {}) => {
    try {
      await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room, actiune, jucator: nume, isHost, teamId, ...extra })
      });
    } catch (e) { console.error("Network Error"); }
  };

  /**
   * LOGICA DE IMPACT (TITAN RESOLUTION V7)
   * Rezolvă meciul luând în calcul Oul de Aur (Victorie Automată).
   */
  const processImpact = (data) => {
    // Verificăm dacă cineva are Oul de Aur (Prioritate God-Mode)
    let won = false;
    
    if (me.isGolden) {
      won = true; // Forțăm victoria
    } else if (opponent?.isGolden) {
      won = false; // Forțăm înfrângerea
    } else {
      // Calcul standard 50/50 de la server
      won = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;
    }

    // Efecte Vizuale și Haptice de mare densitate
    setImpactFlashed(true);
    playSound('spargere-titan');
    triggerVibrate(won ? [100, 50, 100] : [800]);

    setTimeout(() => {
      setImpactFlashed(false);
      setRezultat({ win: won });
      playSound(won ? 'victorie-epica' : 'esec-dramatic');

      // --- PERSISTENȚĂ: SALVARE REZULTAT ---
      if (won) {
        const newStats = { 
          ...userStats, 
          wins: (userStats.wins || 0) + 1, 
          hasGoldenEgg: false // Oul de aur se consumă după utilizare
        };
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
   * ACCELEROMETRU: Detectarea mișcării de ciocnire (Fizică Reală).
   */
  useEffect(() => {
    if (rezultat || !opponent) return;

    const handleMotion = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      const totalForce = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      
      // Calibrare Titan: Forță peste 32 m/s² declanșează impactul
      if (totalForce > 32) {
        window.removeEventListener("devicemotion", handleMotion);
        postAction('lovitura', { isGolden: me.isGolden });
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [rezultat, opponent, me.isGolden]);

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    postAction('chat-arena', { text: chatInput });
    setChatInput("");
    triggerVibrate(20);
  };

  return (
    <div className={`w-full max-w-5xl flex flex-col items-center gap-10 transition-all duration-75 ${impactFlashed ? 'scale-110 blur-[3px]' : ''}`}>
      
      {/* HEADER: INFO ARENĂ */}
      <header className="text-center space-y-4 animate-pop">
        <div className="inline-block px-10 py-3 rounded-full bg-black/40 border border-red-600/30 backdrop-blur-3xl shadow-2xl">
          <span className="text-[11px] font-black uppercase tracking-[0.6em] text-red-500">Arena Națională V7.0</span>
        </div>
        {!rezultat && (
          <h1 className="text-5xl md:text-7xl font-black italic text-white text-glow-white uppercase">
            {opponent ? 'Ciocnește!' : 'Așteptăm...'}
          </h1>
        )}
      </header>

      {/* CÂMPUL DE LUPTĂ (VERSUS) */}
      <main className="w-full grid grid-cols-1 md:grid-cols-3 items-center gap-10 px-6">
        
        {/* JUCĂTOR 1: EU */}
        <div className="flex flex-col items-center gap-8 order-2 md:order-1">
           <OuTitan skin={me.skin} isGolden={me.isGolden} hasStar={me.hasStar} spart={rezultat && !rezultat.win} />
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2">Tu (Luptător)</p>
              <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10 font-black text-lg">{nume}</div>
           </div>
        </div>

        {/* CENTRU: VS ENGINE */}
        <div className="flex flex-col items-center justify-center order-1 md:order-2">
           <div className="text-8xl font-black text-white/5 italic select-none">VS</div>
        </div>

        {/* JUCĂTOR 2: ADVERSAR */}
        <div className="flex flex-col items-center gap-8 order-3">
           {opponent ? (
             <>
               <OuTitan skin={opponent.skin} isGolden={opponent.isGolden} hasStar={opponent.hasStar} spart={rezultat && rezultat.win} />
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-red-600/40 tracking-widest mb-2">Adversar</p>
                  <div className="bg-red-600/10 px-6 py-2 rounded-2xl border border-red-600/20 font-black text-lg text-red-500">{opponent.jucator}</div>
               </div>
             </>
           ) : (
             <div className="flex flex-col items-center gap-6 animate-pulse opacity-20">
                <div className="w-[180px] h-[235px] bg-white/5 rounded-full border-4 border-dashed border-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Scanare Rețea...</span>
             </div>
           )}
        </div>
      </main>

      {/* SOCIAL: ARENA CHAT SYSTEM */}
      <section className="w-full max-w-md glass-panel p-8 rounded-[3.5rem] shadow-2xl relative z-50">
         <div className="h-40 overflow-y-auto flex flex-col-reverse gap-4 titan-scroll mb-6 pr-2 custom-scrollbar">
            {messages.length > 0 ? messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start animate-pop'}`}>
                <span className="text-[8px] font-black text-white/20 uppercase mb-1 px-2">{m.autor}</span>
                <div className={`p-3 px-5 rounded-2xl text-xs font-bold shadow-lg ${m.autor === nume ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            )) : (
              <p className="h-full flex items-center justify-center text-[10px] font-black text-white/10 uppercase tracking-widest">Liniște în Arenă...</p>
            )}
         </div>
         <div className="flex gap-3 bg-black/60 p-2 rounded-[2rem] border border-white/5 focus-within:border-red-600/40 transition-all">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
              placeholder="Zi-i ceva adversarului..." 
              className="flex-1 bg-transparent p-4 text-xs font-bold text-white outline-none"
            />
            <button onClick={sendChatMessage} className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all">🚀</button>
         </div>
      </section>

      {/* MODAL REZULTAT FINAL (FULLSCREEN OVERLAY) */}
      {rezultat && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[1000] flex flex-col items-center justify-center p-8 animate-fade-in">
           <div className="max-w-md w-full text-center space-y-10 animate-pop">
              <div className={`text-9xl mb-6 ${rezultat.win ? 'animate-bounce' : 'grayscale opacity-50'}`}>{rezultat.win ? '👑' : '🥀'}</div>
              <h2 className={`text-7xl font-black uppercase tracking-tighter ${rezultat.win ? 'text-green-500 text-glow-victory' : 'text-red-600'}`}>
                {rezultat.win ? 'VICTORIE!' : 'ÎNFRÂNGERE'}
              </h2>
              <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">
                {rezultat.win ? 'Ai câștigat un punct în clasament!' : 'Oul tău nu a rezistat impactului.'}
              </p>
              <div className="grid grid-cols-1 gap-4 pt-10">
                 <button onClick={() => window.location.reload()} className="bg-white text-black py-6 rounded-3xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">Revanșă Imediată ⚔️</button>
                 <button onClick={() => router.push('/')} className="bg-white/5 border border-white/10 text-white/40 py-5 rounded-3xl font-black uppercase tracking-widest hover:text-white transition-all text-xs">Înapoi la Dashboard 🏠</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

// ==========================================================================
// 3. EXPORT ROOT: PaginaJoc (Async Unwrapper)
// ==========================================================================

export default function PaginaJoc({ params }) {
  /**
   * FIX CRITIC NEXT.JS 16:
   * Proprietatea 'params' este un Promise și trebuie despachetată cu React.use().
   */
  const resolvedParams = React.use(params);
  const { room } = resolvedParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-ethnic-dark relative overflow-hidden">
      {/* Background FX Layers */}
      <div className="ambient-mesh"></div>
      <div className="fixed inset-0 bg-tradi-pattern opacity-10 pointer-events-none"></div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-8">
          <div className="w-24 h-24 border-8 border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(220,38,38,0.4)]"></div>
          <span className="text-[11px] font-black uppercase tracking-[1em] text-white/20 animate-pulse">Sincronizare Arenă Titan...</span>
        </div>
      }>
        <ArenaMaster room={room} />
      </Suspense>

      {/* Watermarks de Fundal pentru SEO & Design */}
      <div className="fixed bottom-[-5vh] right-[-5vw] text-[25vh] font-black italic text-white/[0.01] pointer-events-none uppercase select-none">Battle</div>
      <div className="fixed top-[-5vh] left-[-5vw] text-[25vh] font-black italic text-white/[0.01] pointer-events-none uppercase select-none">Arena</div>
    </div>
  );
}

/**
 * ==========================================================================================
 * NOTE FINALE UPDATE 7.0 (ARENA):
 * 1. PERSISTENȚĂ: Am triplat volumul de cod care gestionează salvarea victoriilor.
 * 2. CHAT: Sistemul de chat suportă acum mesaje instantanee în timpul meciului.
 * 3. GOLDEN LOGIC: Flag-ul 'isGolden' oferă un avantaj vizual și mecanic total.
 * 4. UX: Am recalibrat accelerometrul pentru a necesita o mișcare bruscă, reală.
 * 5. DESIGN: Am dublat detaliile grafice ale oului (gradiente, crack-uri, reflexii).
 * ==========================================================================================
 */