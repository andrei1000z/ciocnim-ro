"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";

// ==========================================================================
// 1. COMPONENTE VIZUALE ȘI FEEDBACK (CONFETTI, SUNET, SKIN-URI)
// ==========================================================================

/**
 * Confetti - Se declanșează doar la victorie pentru un efect "WOW"
 */
const Confetti = () => {
  const culori = ['#dc2626', '#eab308', '#2563eb', '#16a34a', '#ffffff', '#a855f7'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 100 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute top-[-10%] confetti-piece shadow-xl"
          style={{
            left: `${Math.random() * 100}vw`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 20 + 10}px`,
            backgroundColor: culori[Math.floor(Math.random() * culori.length)],
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
 * Sistem de sunete pentru impact, victorie și eșec
 */
const playSound = (soundName) => {
  try {
    const audio = new Audio(`/sunete/${soundName}.mp3`);
    audio.volume = 0.6;
    audio.play().catch(e => console.log("Audio block: interacționează cu pagina mai întâi"));
  } catch(e) { console.error("Eroare sunet:", e); }
};

/**
 * Componenta OuDesenat - Randare SVG cu pattern-uri tradiționale
 */
const OuDesenat = ({ culoare, width = "120px", spart = false, pattern = "zigzag" }) => (
  <div style={{ position: 'relative', width, height: `calc(${width} * 1.3)`, margin: '0 auto' }}>
    <svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%', filter: "drop-shadow(0px 12px 18px rgba(0,0,0,0.6))" }} className="transition-all duration-300">
      {/* Corpul Oului */}
      <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={culoare} />
      
      {/* Pattern-uri Tradiționale */}
      {pattern === "zigzag" && (
        <g stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M10 55 L25 45 L40 55 L55 45 L70 55 L85 45" />
          <path d="M10 75 L25 85 L40 75 L55 85 L70 75 L85 85" />
        </g>
      )}
      {pattern === "puncte" && (
        <g fill="rgba(255,255,255,0.3)">
          <circle cx="30" cy="40" r="4" /><circle cx="70" cy="40" r="4" />
          <circle cx="50" cy="65" r="5" /><circle cx="30" cy="90" r="4" /><circle cx="70" cy="90" r="4" />
        </g>
      )}
      {pattern === "valuri" && (
        <path d="M0 60 Q 25 40, 50 60 T 100 60 M0 80 Q 25 100, 50 80 T 100 80" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
      )}

      {/* Luciu 3D */}
      <path d="M30 25 Q45 15 60 25 Q50 35 35 45 Z" fill="rgba(255,255,255,0.12)" />
      
      {/* Grafică de Spargere */}
      {spart && (
         <path d="M10 60 L35 75 L20 85 L55 100 L45 120 L80 100 L70 125 L95 90" stroke="#000" strokeWidth="6" fill="none" strokeLinejoin="round" />
      )}
    </svg>
    {spart && <div className="absolute inset-0 flex items-center justify-center text-6xl animate-pop z-10">💥</div>}
  </div>
);

const SKIN_URI = [
  { id: 1, nume: "Tradițional", hex: "#dc2626", pattern: "zigzag" },
  { id: 2, nume: "Cer senin", hex: "#2563eb", pattern: "valuri" },
  { id: 3, nume: "Iarbă", hex: "#16a34a", pattern: "puncte" },
  { id: 4, nume: "Rege", hex: "#ca8a04", pattern: "zigzag" },
  { id: 5, nume: "Noapte", hex: "#1e1b4b", pattern: "puncte" },
  { id: 6, nume: "Ametist", hex: "#9333ea", pattern: "valuri" },
  { id: 7, nume: "Roz Bombon", hex: "#db2777", pattern: "zigzag" },
  { id: 8, nume: "Portocală", hex: "#ea580c", pattern: "puncte" },
  { id: 9, nume: "Zăpadă", hex: "#f8fafc", pattern: "valuri" }
];

// ==========================================================================
// 2. LOGICA PRINCIPALĂ A ARENEI (TEAM & BOT INTEGRATED)
// ==========================================================================

function ArenaJoc({ room }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nume = searchParams.get("nume") || "Luptător";
  const teamId = searchParams.get("teamId"); // Identificator pentru echipe
  const isHost = searchParams.get("host") === "true";
  const isBotMode = searchParams.get("bot") === "true" || room === "bot";

  // Referințe și Stări
  const ouMeuRef = useRef(null);
  const [ouMeu, setOuMeu] = useState(null);
  const [ouAdversar, setOuAdversar] = useState(null);
  const [numeAdversar, setNumeAdversar] = useState(isBotMode ? "🤖 Bot Ciocnitor" : "Se conectează...");
  const [rezultat, setRezultat] = useState(null);
  const [impactAnimate, setImpactAnimate] = useState(false);
  const [permisiuneMiscare, setPermisiuneMiscare] = useState(false);
  const [revanșăVot, setRevanșăVot] = useState({ eu: false, el: false });
  const [emojiAdversar, setEmojiAdversar] = useState(null);

  // --- 2.1 LOGICĂ SINCRONIZARE (PUSHER) ---
  useEffect(() => {
    if (isBotMode) {
      // Dacă e bot, simulăm alegerea lui imediat
      setOuAdversar({ hex: "#4b5563", pattern: "zigzag" });
      return;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe(`camera-${room}`);

    // Strigăm în cameră că am intrat
    trimiteSemnal('cere-stare');

    channel.bind("cere-stare", (data) => {
      if (data.isHost !== isHost && ouMeuRef.current) {
        trimiteSemnal('pregatit', { o: ouMeuRef.current, reply: true });
      }
    });

    channel.bind("pregatit", (data) => {
      if (data.isHost !== isHost) {
        setOuAdversar(data.o);
        setNumeAdversar(data.jucator);
        if (ouMeuRef.current && !data.reply) {
          trimiteSemnal('pregatit', { o: ouMeuRef.current, reply: true });
        }
      }
    });

    channel.bind("lovitura", (data) => proceseazăLovitură(data));

    channel.bind("emoji", (data) => {
      if (data.isHost !== isHost) {
        setEmojiAdversar(data.emoji);
        setTimeout(() => setEmojiAdversar(null), 3000);
      }
    });

    channel.bind("revanșă", (data) => {
      if (data.isHost !== isHost) setRevanșăVot(prev => ({ ...prev, el: true }));
    });

    return () => pusher.unsubscribe(`camera-${room}`);
  }, [room, isHost, isBotMode]);

  // --- 2.2 LOGICĂ ACȚIUNI ---
  const trimiteSemnal = (actiune, date = {}) => {
    fetch('/api/ciocnire', {
      method: 'POST',
      body: JSON.stringify({ roomId: room, actiune, jucator: nume, isHost, teamId, ...date })
    });
  };

  const alegeOu = async (skin) => {
    setOuMeu(skin);
    ouMeuRef.current = skin;
    if (!isBotMode) trimiteSemnal('pregatit', { o: skin });
    
    // Cerere senzori (esențial pentru mobile)
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      const resp = await DeviceMotionEvent.requestPermission();
      if (resp === 'granted') setPermisiuneMiscare(true);
    } else { setPermisiuneMiscare(true); }
  };

  const proceseazăLovitură = (data) => {
    // Calculăm cine a câștigat pe baza deciziei serverului (50/50)
    const amCastigat = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;
    
    setImpactAnimate(true);
    playSound('spargere');

    setTimeout(() => {
      setImpactAnimate(false);
      setRezultat({ win: amCastigat, msg: amCastigat ? "VICTORIE SUPREMĂ! 👑" : "OUL TĂU S-A SPART! 😭" });
      playSound(amCastigat ? 'victorie' : 'esec');
      if (navigator.vibrate) navigator.vibrate(amCastigat ? [100, 50, 100] : 800);
    }, 500);
  };

  // --- 2.3 LOGICĂ BOT ---
  useEffect(() => {
    if (isBotMode && ouMeu && !rezultat) {
      // Bot-ul lovește după un timp random
      const timpAsteptare = Math.random() * 4000 + 2000;
      const t = setTimeout(() => {
        proceseazăLovitură({ castigaCelCareDa: Math.random() > 0.5 });
      }, timpAsteptare);
      return () => clearTimeout(t);
    }
  }, [ouMeu, rezultat, isBotMode]);

  // --- 2.4 DETECTARE MIȘCARE ---
  useEffect(() => {
    if (!permisiuneMiscare || rezultat || !ouMeu || !ouAdversar) return;

    const handleMotion = (e) => {
      const a = e.acceleration;
      if (!a) return;
      const forta = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
      if (forta > 25) {
        window.removeEventListener("devicemotion", handleMotion);
        trimiteSemnal('lovitura');
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [permisiuneMiscare, rezultat, ouMeu, ouAdversar]);

  // --- 2.5 REVANȘĂ ---
  useEffect(() => {
    if (revanșăVot.eu && revanșăVot.el) {
      setRezultat(null); setOuMeu(null); ouMeuRef.current = null;
      setRevanșăVot({ eu: false, el: false });
    }
  }, [revanșăVot]);

  // ==========================================================================
  // 3. RENDER UI
  // ==========================================================================

  // Pas 1: Alegere Skin
  if (!ouMeu) {
    return (
      <div className="flex flex-col items-center gap-8 glass-panel p-8 rounded-[2.5rem] animate-pop max-w-md w-full">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Alege Armura</h2>
          <p className="text-yellow-500 font-bold text-sm uppercase">Pregătește-te, {nume}!</p>
        </div>
        <div className="grid grid-cols-3 gap-6 w-full">
          {SKIN_URI.map(s => (
            <button key={s.id} onClick={() => alegeOu(s)} className="group flex flex-col items-center gap-2">
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                <OuDesenat culoare={s.hex} pattern={s.pattern} width="75px" />
              </div>
              <span className="text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-widest">{s.nume}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Pas 2: Arena de luptă
  return (
    <div className={`w-full max-w-xl transition-all duration-75 ${impactAnimate ? 'scale-110 blur-[1px]' : ''}`}>
      {rezultat?.win && <Confetti />}

      {/* Team Badge */}
      {teamId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-400 z-50">
          Meci de Echipă Activat ⚔️
        </div>
      )}

      {/* Status Joc */}
      <div className="mb-10 text-center">
        {!rezultat ? (
          <div className="text-4xl font-black text-white italic animate-pulse-glow bg-red-600 py-3 rounded-2xl shadow-2xl border-2 border-red-400 uppercase tracking-tighter">
            CIOCNEȘTE!
          </div>
        ) : (
          <div className={`text-4xl font-black px-6 py-10 rounded-3xl shadow-2xl animate-pop border-4 ${rezultat.win ? 'bg-green-600 border-green-300' : 'bg-neutral-900 border-red-900 text-red-600'}`}>
            {rezultat.msg}
          </div>
        )}
      </div>

      {/* Duelul Ouălor */}
      <div className="flex justify-between items-end relative px-4">
        {emojiAdversar && (
          <div className="absolute top-[-50px] right-0 text-6xl animate-bounce z-50">{emojiAdversar}</div>
        )}

        {/* TU */}
        <div className="flex flex-col items-center gap-4 w-1/3">
          <div className={`${impactAnimate && isHost ? 'translate-x-10 rotate-12' : ''} transition-transform`}>
            <OuDesenat culoare={ouMeu.hex} pattern={ouMeu.pattern} width="140px" spart={rezultat && !rezultat.win} />
          </div>
          <span className="bg-white text-black font-black px-6 py-2 rounded-full text-xs shadow-xl tracking-widest">TU</span>
        </div>

        <div className="text-3xl font-black text-white/20 italic pb-20">VS</div>

        {/* EL */}
        <div className="flex flex-col items-center gap-4 w-1/3">
          <div className={`${impactAnimate && !isHost ? '-translate-x-10 -rotate-12' : ''} transition-transform`}>
            {ouAdversar ? (
              <OuDesenat culoare={ouAdversar.hex} pattern={ouAdversar.pattern} width="140px" spart={rezultat && rezultat.win} />
            ) : (
              <div className="w-[140px] h-[180px] bg-white/5 rounded-full border-2 border-dashed border-white/20 animate-pulse" />
            )}
          </div>
          <span className="bg-neutral-800 text-white/60 font-black px-4 py-2 rounded-full text-[10px] uppercase truncate w-full text-center">
            {numeAdversar}
          </span>
        </div>
      </div>

      {/* Instrucțiuni dinamice */}
      {!rezultat && (
        <div className="mt-12 w-full glass-panel p-6 rounded-3xl text-center">
          {isHost ? (
            <div className="space-y-2">
              <p className="text-2xl font-black animate-bounce text-red-500">📱 LOVESTE ACUM!</p>
              <p className="text-xs font-bold text-gray-400">Scutură telefonul brusc pentru a ciocni.</p>
              <p className="text-yellow-500 font-black italic">"Hristos a înviat!"</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xl font-black text-blue-400 uppercase tracking-widest">Tine strans! 🥶</p>
              <p className="text-xs font-bold text-gray-400">Așteaptă lovitura lui {numeAdversar}.</p>
              <p className="text-yellow-500 font-black italic">"Adevărat a înviat!"</p>
            </div>
          )}
        </div>
      )}

      {/* Panou Final */}
      {rezultat && (
        <div className="mt-8 flex flex-col gap-4 animate-pop">
          <button onClick={() => { setRevanșăVot(prev => ({ ...prev, eu: true })); trimiteSemnal('revanșă'); }} 
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all ${revanșăVot.eu ? 'bg-yellow-600 animate-pulse' : 'bg-white text-black hover:bg-gray-200'}`}>
            {revanșăVot.eu ? "Așteptăm adversarul..." : "Cere Revanșă ⚔️"}
          </button>
          <button onClick={() => router.push('/')} className="w-full py-4 text-white/40 font-bold uppercase text-xs tracking-[0.3em] hover:text-white transition-colors">
            Înapoi la Meniu principal
          </button>
        </div>
      )}

      {/* Reacții Rapide */}
      {!rezultat && ouAdversar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-black/60 p-3 rounded-full backdrop-blur-xl border border-white/10">
          {['🤣', '😡', '🥚', '🙏'].map(e => (
            <button key={e} onClick={() => trimiteSemnal('emoji', { emoji: e })} className="text-2xl hover:scale-125 transition-transform">{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PaginaJoc({ params }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-tradi-dark">
      <Suspense fallback={<div className="text-2xl font-black animate-pulse">Intrăm în arenă...</div>}>
        <ArenaJoc room={params.room} />
      </Suspense>
    </div>
  );
}