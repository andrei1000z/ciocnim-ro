"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";

// --- SISTEM DE CONFETTI CUSTOM PENTRU VICTORIE ---
const Confetti = () => {
  const culori = ['#dc2626', '#eab308', '#2563eb', '#16a34a', '#ffffff'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute top-[-10%] confetti-piece"
          style={{
            left: `${Math.random() * 100}vw`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 20 + 10}px`,
            backgroundColor: culori[Math.floor(Math.random() * culori.length)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 2 + 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );
};

// --- FUNCTII SUNET ---
const playSound = (soundName) => {
  try {
    const audio = new Audio(`/sunete/${soundName}.mp3`);
    audio.play().catch(e => console.log("Sunet ignorat automat"));
  } catch(e) {}
};

// --- DESIGN OU ---
const OuDesenat = ({ culoare, width = "120px", spart = false }) => (
  <div style={{ position: 'relative', width, height: `calc(${width} * 1.3)`, margin: '0 auto' }}>
    <svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%', filter: "drop-shadow(0px 15px 20px rgba(0,0,0,0.6))" }} className="transition-all duration-300">
      <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={culoare} />
      <path d="M5 60 L15 50 L25 60 L35 50 L45 60 L55 50 L65 60 L75 50 L85 60 L95 50" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
      <path d="M2 75 L15 88 L25 75 L35 88 L45 75 L55 88 L65 75 L75 88 L85 75 L98 88" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
      <path d="M25 30 Q40 10 65 20 Q50 30 35 50 Z" fill="rgba(255,255,255,0.15)" /> 
      {spart && (
         <path d="M0 60 L30 75 L15 85 L50 95 L40 110 L75 95 L65 120 L100 85" stroke="#111" strokeWidth="4" fill="none" opacity="0.9"/>
      )}
    </svg>
    {spart && <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-2xl animate-pop">💥</div>}
  </div>
);

const CULORI = [
  { nume: "Tradițional", hex: "#dc2626" }, { nume: "Safir", hex: "#2563eb" },
  { nume: "Smarald", hex: "#16a34a" }, { nume: "Aur", hex: "#ca8a04" },
  { nume: "Ametist", hex: "#9333ea" }, { nume: "Carbon", hex: "#262626" }
];

function LogicaJoc({ room }) {
  const searchParams = useSearchParams();
  const nume = searchParams.get("nume");
  const isHost = searchParams.get("host") === "true";
  const router = useRouter();

  const ouMeuRef = useRef(null); 
  const [ouMeu, setOuMeu] = useState(null);
  const [ouAdversar, setOuAdversar] = useState(null);
  const [numeAdversar, setNumeAdversar] = useState("Adversarul");
  
  const [rezultat, setRezultat] = useState(null);
  const [permisiuneSenzor, setPermisiuneSenzor] = useState(false);
  const [animatieImpact, setAnimatieImpact] = useState(false);

  // Stări noi
  const [dorintaRevansa, setDorintaRevansa] = useState(false);
  const [adversarVreaRevansa, setAdversarVreaRevansa] = useState(false);
  const [adversarIesit, setAdversarIesit] = useState(false);
  const [reactiePrimita, setReactiePrimita] = useState(null); // Sistem Emoji

  const trimiteLaServer = (actiune, dateExtra = {}) => {
    fetch('/api/ciocnire', {
      method: 'POST',
      body: JSON.stringify({ roomId: room, actiune, jucator: nume, isHost, ...dateExtra })
    });
  };

  const handlePlecareForțată = () => {
    trimiteLaServer('paraseste'); 
    router.push('/');
  };

  useEffect(() => {
    const laIesire = () => navigator.sendBeacon('/api/ciocnire', JSON.stringify({ roomId: room, actiune: 'paraseste' }));
    window.addEventListener('beforeunload', laIesire);
    return () => { window.removeEventListener('beforeunload', laIesire); laIesire(); };
  }, [room]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe(`camera-${room}`);

    trimiteLaServer('cere-stare');

    channel.bind("cere-stare", (data) => {
      if (data.isHost !== isHost && ouMeuRef.current) trimiteLaServer('pregatit', { culoare: ouMeuRef.current, isReply: true });
    });

    channel.bind("pregatit", (data) => {
      if (data.isHost !== isHost) {
        setOuAdversar(data.culoare);
        setNumeAdversar(data.jucator);
        if (ouMeuRef.current && !data.isReply) trimiteLaServer('pregatit', { culoare: ouMeuRef.current, isReply: true });
      }
    });

    channel.bind("lovitura", (data) => {
      let amCastigat = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;
      setAnimatieImpact(true);
      playSound('spargere');
      
      setTimeout(() => {
        setAnimatieImpact(false);
        setRezultat({ amCastigat, mesaj: amCastigat ? "VICTORIE!" : "SPART!" });
        playSound(amCastigat ? 'victorie' : 'esec');
        if (navigator.vibrate) navigator.vibrate(amCastigat ? [100, 50, 100] : 800); 
      }, 500);
    });

    channel.bind("revansa", (data) => { if (data.isHost !== isHost) setAdversarVreaRevansa(true); });
    channel.bind("adversar-iesit", () => setAdversarIesit(true));
    
    // Ascultăm Emoji-uri!
    channel.bind("emoji", (data) => {
      if (data.isHost !== isHost) {
        setReactiePrimita(data.emoji);
        setTimeout(() => setReactiePrimita(null), 3000); // dispare dupa 3 sec
      }
    });

    return () => pusher.unsubscribe(`camera-${room}`);
  }, [room, isHost, nume]);

  useEffect(() => {
    if (dorintaRevansa && adversarVreaRevansa) {
      setRezultat(null); setOuMeu(null); ouMeuRef.current = null; setOuAdversar(null);
      setPermisiuneSenzor(false); setDorintaRevansa(false); setAdversarVreaRevansa(false); setAdversarIesit(false);
    }
  }, [dorintaRevansa, adversarVreaRevansa]);

  const handleAlegeOu = async (hexCuloare) => {
    setOuMeu(hexCuloare);
    ouMeuRef.current = hexCuloare;
    trimiteLaServer('pregatit', { culoare: hexCuloare, isReply: false });

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const state = await DeviceMotionEvent.requestPermission();
        if (state === 'granted') setPermisiuneSenzor(true);
      } catch (e) {}
    } else { setPermisiuneSenzor(true); }
  };

  const trimiteEmoji = (emoji) => {
    trimiteLaServer('emoji', { emoji });
    // Feedback vizual local
    setReactiePrimita(emoji);
    setTimeout(() => setReactiePrimita(null), 3000);
  };

  const handleShareViral = async () => {
    const textViral = rezultat?.amCastigat 
      ? `L-am distrus pe ${numeAdversar} la Ciocnim.ro! 😎 Care e următorul?`
      : `Mi-am spart oul... 😭 Răzbună-mă pe Ciocnim.ro!`;

    if (navigator.share) {
      try { await navigator.share({ title: 'Ciocnim.ro', text: textViral, url: window.location.origin }); } catch (e) {}
    } else {
      navigator.clipboard.writeText(`${textViral} -> ${window.location.origin}`);
      alert("Mesaj copiat! Dă-i Paste pe grup.");
    }
  };

  useEffect(() => {
    if (!permisiuneSenzor || !isHost || rezultat || !ouMeu || !ouAdversar) return;

    const handleMotion = (event) => {
      const acc = event.acceleration;
      if (!acc) return;
      const forta = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      
      if (forta > 20) { 
        window.removeEventListener("devicemotion", handleMotion);
        trimiteLaServer('lovitura'); 
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [permisiuneSenzor, isHost, rezultat, ouMeu, ouAdversar]);

  // ECRAN 1: ALEGEREA (Reparat complet)
  if (!ouMeu) {
    return (
      <div className="flex flex-col items-center gap-8 glass-panel p-8 rounded-3xl w-full max-w-md animate-pop">
        <h2 className="text-2xl font-black text-white text-center uppercase tracking-widest">Alege armura</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full">
          {CULORI.map((c) => (
            <div key={c.nume} onClick={() => handleAlegeOu(c.hex)} className="cursor-pointer group flex flex-col items-center gap-4">
              <div className="transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                <OuDesenat culoare={c.hex} width="85px" />
              </div>
              <span className="font-bold text-[11px] tracking-wider uppercase bg-black/50 px-3 py-1 rounded-full text-white/80">{c.nume}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ECRAN 2: AȘTEPTARE
  if (ouMeu && !ouAdversar) {
    return (
      <div className="flex flex-col items-center gap-10 animate-pop">
        <div className="text-sm font-bold tracking-[0.3em] uppercase animate-pulse text-yellow-500 bg-black/50 px-6 py-2 rounded-full border border-yellow-500/30">
          Așteptăm adversarul...
        </div>
        <div className="opacity-90 transform scale-100">
          <OuDesenat culoare={ouMeu} width="150px" />
        </div>
      </div>
    );
  }

  // ECRAN 3: ARENA (Bătălia și Rezultatul)
  return (
    <div className={`flex flex-col items-center gap-8 w-full max-w-lg transition-transform duration-75 ${animatieImpact ? 'animate-shake-hard' : ''}`}>
      {rezultat?.amCastigat && <Confetti />}

      {!rezultat ? (
        <div className="text-3xl font-black text-white px-10 py-3 rounded-full tracking-widest uppercase bg-gradient-to-r from-red-600 to-red-800 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse-glow">
          LUPTĂ!
        </div>
      ) : (
        <div className={`text-4xl font-black px-10 py-6 rounded-3xl shadow-2xl w-full flex justify-center uppercase tracking-widest text-white animate-pop ${rezultat.amCastigat ? 'bg-gradient-to-b from-green-500 to-green-700 border-2 border-green-400' : 'bg-gradient-to-b from-neutral-800 to-black border-2 border-red-900 text-red-500'}`}>
          {rezultat.mesaj}
        </div>
      )}

      {/* ZONA DE OUĂ ȘI EMOJI */}
      <div className="flex justify-between w-full items-end mt-4 px-4 relative">
        {/* Reacție flotantă */}
        {reactiePrimita && (
          <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 text-6xl animate-float z-50 drop-shadow-2xl">
            {reactiePrimita}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 z-10 w-1/3">
          <div className={`${animatieImpact && isHost ? 'translate-x-10 rotate-12' : ''} transition-transform`}>
            <OuDesenat culoare={ouMeu} width="120px" spart={rezultat && !rezultat.amCastigat} />
          </div>
          <span className="font-bold tracking-widest uppercase bg-white text-black px-5 py-2 rounded-full text-xs shadow-lg">TU</span>
        </div>
        
        <div className="text-3xl font-black pb-12 opacity-30 text-white italic z-0 w-1/3 text-center">VS</div>

        <div className="flex flex-col items-center gap-4 z-10 w-1/3">
          <div className={`${animatieImpact && !isHost ? '-translate-x-10 -rotate-12' : ''} transition-transform`}>
             <OuDesenat culoare={ouAdversar} width="120px" spart={rezultat && rezultat.amCastigat} />
          </div>
          <span className="font-bold tracking-widest uppercase bg-red-950 border border-red-500/30 text-white px-4 py-2 rounded-full text-xs truncate max-w-[120px] shadow-lg">{numeAdversar}</span>
        </div>
      </div>

      {/* PANOU CONTROL */}
      {!rezultat ? (
        <div className="mt-8 w-full px-4 flex flex-col gap-6">
          {isHost ? (
            <div className="w-full text-2xl font-black animate-pulse-glow bg-red-600 p-6 rounded-[2rem] text-center text-white uppercase shadow-lg flex flex-col gap-2">
              <span>DĂ CU OUL! 📱💨</span>
              <div className="text-xs font-bold text-yellow-300 normal-case tracking-widest opacity-90 uppercase">
                "Hristos a înviat!"
              </div>
            </div>
          ) : (
            <div className="w-full text-lg font-bold bg-neutral-900/80 p-6 rounded-[2rem] text-center border border-white/10 flex flex-col gap-2 shadow-xl">
              <span className="text-white/50 uppercase tracking-widest text-xs">Ține telefonul strâns</span>
              <span className="text-red-400 font-black text-2xl uppercase tracking-widest">{numeAdversar} dă!</span>
              <div className="text-xs font-bold text-yellow-500 normal-case tracking-widest opacity-90 mt-1 uppercase">
                "Adevărat a înviat!"
              </div>
            </div>
          )}

          {/* BARĂ DE EMOJI-URI RAPPIDE */}
          <div className="flex justify-center gap-4 bg-black/40 p-3 rounded-full backdrop-blur-md w-max mx-auto border border-white/10">
            <button onClick={() => trimiteEmoji('🤣')} className="text-2xl hover:scale-125 transition-transform">🤣</button>
            <button onClick={() => trimiteEmoji('😡')} className="text-2xl hover:scale-125 transition-transform">😡</button>
            <button onClick={() => trimiteEmoji('🥶')} className="text-2xl hover:scale-125 transition-transform">🥶</button>
            <button onClick={() => trimiteEmoji('🥚')} className="text-2xl hover:scale-125 transition-transform">🥚</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full px-4 mt-6">
          <button 
            onClick={handleShareViral}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-blue-900/50"
          >
            📱 DISTRIBUIE REZULTATUL
          </button>

          <button 
            onClick={!adversarIesit ? () => { setDorintaRevansa(true); trimiteLaServer('revansa'); } : undefined}
            disabled={dorintaRevansa || adversarIesit}
            className={`w-full font-black py-4 rounded-2xl text-sm transition-all uppercase tracking-widest shadow-lg ${
              adversarIesit
                ? "bg-black text-red-600 border border-red-900 cursor-not-allowed" 
                : dorintaRevansa 
                  ? "bg-yellow-900/50 text-yellow-500 border border-yellow-700/50 cursor-not-allowed" 
                  : adversarVreaRevansa
                    ? "bg-green-600 text-white shadow-green-900/50 animate-pulse" 
                    : "bg-white text-black hover:bg-gray-200" 
            }`}
          >
            {adversarIesit ? "Adversarul a fugit!" : dorintaRevansa ? "Așteptăm (1/2)" : adversarVreaRevansa ? "Acceptă Revanșa (1/2)" : "Cere Revanșă (0/2)"}
          </button>
          
          <button onClick={handlePlecareForțată} className="w-full bg-transparent text-white/40 font-bold py-3 rounded-xl text-xs transition-all uppercase tracking-widest mt-2 hover:text-white/80">
            Înapoi la meniu
          </button>
        </div>
      )}
    </div>
  );
}

export default function Joc({ params }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative">
      <Suspense fallback={<div className="text-sm text-yellow-500 uppercase tracking-widest animate-pulse font-bold">Arena se pregătește...</div>}>
        <LogicaJoc room={params.room} />
      </Suspense>
    </div>
  );
}