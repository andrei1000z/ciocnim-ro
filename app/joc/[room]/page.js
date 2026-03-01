"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - ARENA DE LUPTĂ SUPREMĂ (VERSION 6.8 - NEXT.js 16 ASYNC FIX)
 * ------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei
 * Tehnologii: React 19, Next.js 16 (Turbopack), Pusher-JS, Framer Motion Logic.
 * * FIX CRITIC: 
 * Conform noilor standarde Next.js, 'params' este acum un Promise.
 * Folosim React.use(params) pentru a accesa proprietatea 'room' fără erori de tipul
 * "sync-dynamic-apis".
 * ==========================================================================================
 */

import React, { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";

// ==========================================================================
// 1. COMPONENTE DE FEEDBACK VIZUAL (PARTICULE ȘI DESIGN)
// ==========================================================================

/**
 * ConfettiPremium - Sistem de particule optimizat pentru victoria finală.
 */
const ConfettiPremium = () => {
  const pieces = useMemo(() => Array.from({ length: 120 }), []);
  const colors = ['#dc2626', '#eab308', '#2563eb', '#16a34a', '#ffffff', '#a855f7'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((_, i) => (
        <div 
          key={i} 
          className="absolute top-[-5%] confetti-piece shadow-2xl"
          style={{
            left: `${Math.random() * 100}vw`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 20 + 10}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${Math.random() * 2 + 1.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '3px'
          }}
        />
      ))}
    </div>
  );
};

/**
 * OuDesenat - Randare vectorială cu suport pentru animație de spargere (CRACK FX).
 */
const OuDesenat = ({ culoare, width = "120px", spart = false, pattern = "zigzag", animat = false }) => (
  <div 
    className={`relative transition-all duration-500 ${animat ? 'animate-float' : ''}`} 
    style={{ width, height: `calc(${width} * 1.35)` }}
  >
    <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.8)]">
      <defs>
        <radialGradient id="eggGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.2)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.1)' }} />
        </radialGradient>
      </defs>
      
      {/* Corpul Oului */}
      <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={culoare} />
      <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill="url(#eggGrad)" />

      {/* Pattern-uri Tradiționale */}
      {pattern === "zigzag" && (
        <g stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M15 55 L30 45 L45 55 L60 45 L75 55 L90 45" />
          <path d="M10 75 L25 85 L40 75 L55 85 L70 75 L85 85" />
        </g>
      )}

      {/* Logica de Spargere (Crack) */}
      {spart && (
        <g className="animate-pop">
          <path d="M20 60 L40 75 L25 85 L55 100 L45 120 L80 100 L70 125 L95 90" stroke="#000" strokeWidth="6" fill="none" strokeLinejoin="round" />
          <path d="M20 60 L40 75 L25 85 L55 100 L45 120 L80 100 L70 125 L95 90" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
        </g>
      )}
    </svg>
    {spart && <div className="absolute inset-0 flex items-center justify-center text-7xl animate-pop">💥</div>}
  </div>
);

// ==========================================================================
// 2. COMPONENTA PRINCIPALĂ (ARENA LOGIC)
// ==========================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Consumăm contextul global reunit (FIX: triggerVibrate)
  const { nume, playSound, triggerVibrate } = useGlobalStats();
  
  const isHost = searchParams.get("host") === "true";
  const teamId = searchParams.get("teamId");
  const isBotMode = searchParams.get("bot") === "true" || room === "bot";

  // --- STĂRI JOC ---
  const [ouMeu, setOuMeu] = useState(null);
  const [ouAdversar, setOuAdversar] = useState(null);
  const [numeAdversar, setNumeAdversar] = useState(isBotMode ? "🤖 BOT_CIOCNITOR" : "Se conectează...");
  const [rezultat, setRezultat] = useState(null);
  const [impactFlashed, setImpactFlashed] = useState(false);
  const [vreaRevansa, setVreaRevansa] = useState({ eu: false, el: false });

  const myEggRef = useRef(null);

  // --- 2.1 SINCRONIZARE PUSHER ---
  useEffect(() => {
    if (isBotMode) {
      setOuAdversar({ hex: "#1e293b", pattern: "zigzag" });
      return;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu" });
    const channel = pusher.subscribe(`camera-${room}`);

    postSignal('cere-stare');

    channel.bind("cere-stare", (data) => {
      if (data.isHost !== isHost && myEggRef.current) {
        postSignal('pregatit', { o: myEggRef.current, reply: true });
      }
    });

    channel.bind("pregatit", (data) => {
      if (data.isHost !== isHost) {
        setOuAdversar(data.o);
        setNumeAdversar(data.jucator);
        if (myEggRef.current && !data.reply) {
          postSignal('pregatit', { o: myEggRef.current, reply: true });
        }
      }
    });

    channel.bind("lovitura", (data) => handleImpact(data));

    channel.bind("revansa", (data) => {
      if (data.isHost !== isHost) setVreaRevansa(v => ({ ...v, el: true }));
    });

    return () => pusher.unsubscribe(`camera-${room}`);
  }, [room, isHost, isBotMode]);

  // --- 2.2 LOGICĂ IMPACT ---
  const postSignal = (actiune, date = {}) => {
    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room, actiune, jucator: nume, isHost, teamId, ...date })
    });
  };

  const handleImpact = (data) => {
    const amCastigat = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;
    
    setImpactFlashed(true);
    playSound('spargere');
    triggerVibrate(amCastigat ? [100, 50, 100] : [800]);

    setTimeout(() => {
      setImpactFlashed(false);
      setRezultat({ win: amCastigat, msg: amCastigat ? "VICTORIE SUPREMĂ! 👑" : "OUL TĂU S-A SPART! 😭" });
      playSound(amCastigat ? 'victorie' : 'esec');
    }, 500);
  };

  // --- 2.3 ACCELEROMETRU (DETECTARE MIȘCARE) ---
  useEffect(() => {
    if (rezultat || !ouMeu || !ouAdversar) return;

    const onMotion = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      const force = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      
      if (force > 28) {
        window.removeEventListener("devicemotion", onMotion);
        postSignal('lovitura');
      }
    };

    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [rezultat, ouMeu, ouAdversar]);

  // Restart meci
  useEffect(() => {
    if (vreaRevansa.eu && vreaRevansa.el) {
      setRezultat(null); setOuMeu(null); setOuAdversar(null);
      setVreaRevansa({ eu: false, el: false });
    }
  }, [vreaRevansa]);

  // UI SELECȚIE SKIN (Dacă nu e ales)
  if (!ouMeu) {
    return (
      <div className="glass-panel p-10 rounded-[3rem] animate-pop max-w-lg w-full text-center border-t-8 border-red-600">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Alege-ți Armura</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { id: 1, hex: "#dc2626", nume: "Roșu Aprins" },
            { id: 2, hex: "#2563eb", nume: "Albastru" },
            { id: 3, hex: "#eab308", nume: "Aur Dacic" }
          ].map(s => (
            <button key={s.id} onClick={() => { setOuMeu(s); myEggRef.current = s; if(!isBotMode) postSignal('pregatit', {o: s}); }} className="group flex flex-col items-center gap-2">
              <div className="group-hover:scale-110 transition-transform"><OuDesenat culoare={s.hex} width="80px" animat={true} /></div>
              <span className="text-[10px] font-black text-white/30 uppercase">{s.nume}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ARENA ACTIVĂ
  return (
    <div className={`w-full max-w-2xl transition-all duration-75 ${impactFlashed ? 'scale-110 blur-[2px]' : ''}`}>
      {rezultat?.win && <ConfettiPremium />}

      <div className="mb-16 text-center">
        {!rezultat ? (
          <div className="glass-panel py-6 rounded-3xl border-2 border-red-600 animate-pulse-glow">
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">CIOCNEȘTE!</h1>
            <p className="text-[10px] text-red-400 font-bold uppercase mt-2 tracking-widest">Mișcă telefonul brusc</p>
          </div>
        ) : (
          <div className={`p-10 rounded-[2.5rem] shadow-2xl border-4 animate-pop ${rezultat.win ? 'bg-green-600 border-green-300' : 'bg-neutral-900 border-red-950 text-red-600'}`}>
            <h2 className="text-5xl font-black uppercase tracking-tighter">{rezultat.msg}</h2>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center relative h-[300px] px-8">
        {/* TU */}
        <div className="flex flex-col items-center gap-6 w-1/3">
          <div className={`${impactFlashed && isHost ? 'translate-x-12 rotate-12' : ''} transition-transform`}>
            <OuDesenat culoare={ouMeu.hex} width="160px" spart={rezultat && !rezultat.win} />
          </div>
          <span className="glass-panel px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">TU</span>
        </div>

        <div className="text-4xl font-black text-white/10 italic">VS</div>

        {/* EL */}
        <div className="flex flex-col items-center gap-6 w-1/3">
          <div className={`${impactFlashed && !isHost ? '-translate-x-12 -rotate-12' : ''} transition-transform`}>
            {ouAdversar ? (
              <OuDesenat culoare={ouAdversar.hex} width="160px" spart={rezultat && rezultat.win} />
            ) : (
              <div className="w-[160px] h-[210px] bg-white/5 rounded-full border-4 border-dashed border-white/10 animate-pulse" />
            )}
          </div>
          <span className="glass-panel px-6 py-2 rounded-full text-[10px] font-black uppercase truncate w-full text-center border-red-600/30">
            {numeAdversar}
          </span>
        </div>
      </div>

      {rezultat && (
        <div className="mt-12 flex flex-col gap-4 animate-pop">
          <button 
            onClick={() => { setVreaRevansa(v => ({ ...v, eu: true })); postSignal('revansa'); }}
            className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-widest transition-all ${vreaRevansa.eu ? 'bg-yellow-600 animate-pulse' : 'bg-white text-black'}`}
          >
            {vreaRevansa.eu ? "Așteptăm adversarul..." : "Cere Revanșă ⚔️"}
          </button>
          <button onClick={() => router.push('/')} className="w-full py-4 text-white/20 font-black uppercase text-[10px] tracking-widest">Părăsește Arena</button>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// 3. EXPORT PAGINĂ (ASYNC WRAPPER)
// ==========================================================================

/**
 * PaginaJoc: Componenta de intrare în rută.
 * FIX: 'params' este acum Promise, deci folosim React.use() pentru a-l despacheta.
 */
export default function PaginaJoc({ params }) {
  // DESPACHETARE ASYNC PARAMS (Cerință Next.js 16)
  const resolvedParams = React.use(params);
  const { room } = resolvedParams;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ethnic-dark overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-tradi-pattern opacity-10 pointer-events-none"></div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Securizare Arenă...</span>
        </div>
      }>
        <ArenaMaster room={room} />
      </Suspense>
    </div>
  );
}