"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import Pusher from "pusher-js";
import { useSearchParams } from "next/navigation";

// Funcție ajutătoare pentru sunete
const playSound = (soundName) => {
  try {
    const audio = new Audio(`/sunete/${soundName}.mp3`);
    audio.volume = 1.0;
    audio.play().catch(e => console.log("Sunet blocat de browser", e));
  } catch(e) { console.log("Eroare sunet", e); }
};

const OuDesenat = ({ culoare, width = "120px", spart = false }) => (
  <div style={{ position: 'relative', width, height: `calc(${width} * 1.3)`, margin: '0 auto' }}>
    <svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%', filter: "drop-shadow(0px 15px 20px rgba(0,0,0,0.6))" }} className="transition-all duration-300">
      <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={culoare} />
      <path d="M5 60 L15 50 L25 60 L35 50 L45 60 L55 50 L65 60 L75 50 L85 60 L95 50" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" />
      <path d="M2 75 L15 88 L25 75 L35 88 L45 75 L55 88 L65 75 L75 88 L85 75 L98 88" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" />
      <circle cx="50" cy="69" r="4" fill="rgba(255,255,255,0.5)" />
      <path d="M25 30 Q40 10 65 20 Q50 30 35 50 Z" fill="rgba(255,255,255,0.3)" /> 
      {spart && (
         <path d="M0 60 L30 75 L15 85 L50 95 L40 110 L75 95 L65 120 L100 85" stroke="#000" strokeWidth="6" fill="none" opacity="0.9"/>
      )}
    </svg>
    {spart && <div className="absolute inset-0 flex items-center justify-center text-[5rem] drop-shadow-2xl animate-ping opacity-70 pointer-events-none">💥</div>}
  </div>
);

const CULORI = [
  { nume: "Roșu Sânge", hex: "#b91c1c" },
  { nume: "Albastru Marin", hex: "#1d4ed8" },
  { nume: "Verde Pădure", hex: "#15803d" },
  { nume: "Galben Aur", hex: "#ca8a04" },
  { nume: "Mov Regal", hex: "#7e22ce" },
  { nume: "Roz Neon", hex: "#be185d" }
];

function LogicaJoc({ room }) {
  const searchParams = useSearchParams();
  const nume = searchParams.get("nume");
  const isHost = searchParams.get("host") === "true";

  const ouMeuRef = useRef(null); 
  const [ouMeu, setOuMeu] = useState(null);
  const [ouAdversar, setOuAdversar] = useState(null);
  const [numeAdversar, setNumeAdversar] = useState("Adversarul");
  
  const [rezultat, setRezultat] = useState(null);
  const [permisiuneSenzor, setPermisiuneSenzor] = useState(false);
  const [animatieImpact, setAnimatieImpact] = useState(false);

  const [dorintaRevansa, setDorintaRevansa] = useState(false);
  const [adversarVreaRevansa, setAdversarVreaRevansa] = useState(false);

  const trimiteLaServer = (actiune, dateExtra = {}) => {
    fetch('/api/ciocnire', {
      method: 'POST',
      body: JSON.stringify({ roomId: room, actiune, jucator: nume, isHost, ...dateExtra })
    });
  };

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
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
      
      // Animație și sunet de impact!
      setAnimatieImpact(true);
      playSound('spargere');
      
      setTimeout(() => {
        setAnimatieImpact(false);
        setRezultat({ amCastigat, mesaj: amCastigat ? "VICTORIE! 👑" : "SPART! 🍳" });
        
        // Sunet de win/lose după ce trece impactul
        playSound(amCastigat ? 'victorie' : 'esec');
        if (navigator.vibrate) navigator.vibrate(amCastigat ? [100, 50, 100, 50, 100] : 800); 
      }, 600); // Așteptăm 0.6 secunde ca să se vadă lovitura
    });

    channel.bind("revansa", (data) => {
      if (data.isHost !== isHost) setAdversarVreaRevansa(true);
    });

    return () => pusher.unsubscribe(`camera-${room}`);
  }, [room, isHost, nume]);

  useEffect(() => {
    if (dorintaRevansa && adversarVreaRevansa) {
      setRezultat(null); setOuMeu(null); ouMeuRef.current = null; setOuAdversar(null);
      setPermisiuneSenzor(false); setDorintaRevansa(false); setAdversarVreaRevansa(false);
    }
  }, [dorintaRevansa, adversarVreaRevansa]);

  const handleAlegeOu = (hexCuloare) => {
    setOuMeu(hexCuloare);
    ouMeuRef.current = hexCuloare;
    trimiteLaServer('pregatit', { culoare: hexCuloare, isReply: false });
  };

  const handleCereRevansa = () => {
    setDorintaRevansa(true);
    trimiteLaServer('revansa');
  };

  const cerePermisiuneMiscare = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const state = await DeviceMotionEvent.requestPermission();
        if (state === 'granted') setPermisiuneSenzor(true);
      } catch (e) { console.error(e); }
    } else { setPermisiuneSenzor(true); }
  };

  useEffect(() => {
    if (!permisiuneSenzor || !isHost || rezultat || !ouMeu || !ouAdversar) return;

    const handleMotion = (event) => {
      const acc = event.acceleration;
      if (!acc) return;
      const forta = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      
      if (forta > 25) { 
        window.removeEventListener("devicemotion", handleMotion);
        trimiteLaServer('lovitura'); 
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [permisiuneSenzor, isHost, rezultat, ouMeu, ouAdversar]);

  if (!ouMeu) {
    return (
      <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] w-full max-w-md border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <h2 className="text-3xl font-black text-white drop-shadow-lg text-center leading-tight">Alege-ți armura,<br/><span className="text-yellow-400">{nume}</span>!</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full mt-4">
          {CULORI.map((c) => (
            <div key={c.nume} onClick={() => handleAlegeOu(c.hex)} className="cursor-pointer group flex flex-col items-center gap-3">
              <div className="transform group-hover:scale-125 group-hover:-translate-y-2 transition-all duration-300 drop-shadow-xl">
                <OuDesenat culoare={c.hex} width="85px" />
              </div>
              <span className="font-bold text-xs tracking-wider uppercase bg-black/50 px-3 py-1 rounded-full text-white/90">{c.nume}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (ouMeu && !ouAdversar) {
    return (
      <div className="flex flex-col items-center gap-10">
        <div className="text-2xl font-black animate-pulse bg-black/40 backdrop-blur-md border border-white/20 px-10 py-5 rounded-3xl shadow-2xl text-yellow-400 text-center">
          Se conectează...<br/><span className="text-sm font-medium text-white/70">Așteptăm adversarul să aleagă.</span>
        </div>
        <div className="opacity-90 transform scale-110 drop-shadow-2xl">
          <OuDesenat culoare={ouMeu} width="160px" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-8 w-full max-w-lg transition-transform duration-75 ${animatieImpact ? 'scale-110 rotate-1 brightness-150 blur-[1px]' : ''}`}>
      {!rezultat ? (
        <div className="text-4xl font-black bg-gradient-to-r from-red-600 to-red-800 text-white px-12 py-4 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.8)] border-4 border-red-400 animate-bounce">
          LUPTA! ⚔️
        </div>
      ) : (
        <div className={`text-5xl font-black px-12 py-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 transform transition-all duration-500 scale-110 ${rezultat.amCastigat ? 'bg-gradient-to-br from-green-500 to-green-700 border-green-300 text-white' : 'bg-gradient-to-br from-gray-800 to-black border-red-900 text-red-500'}`}>
          {rezultat.mesaj}
        </div>
      )}

      <div className={`flex justify-between w-full items-end mt-4 px-2 ${animatieImpact ? '-space-x-10' : ''} transition-all duration-100`}>
        <div className="flex flex-col items-center gap-4 z-10">
          <div className={`${animatieImpact && isHost ? 'translate-x-10 rotate-12' : ''} transition-transform duration-100`}>
            <OuDesenat culoare={ouMeu} width="140px" spart={rezultat && !rezultat.amCastigat} />
          </div>
          <span className="font-black tracking-wide bg-white text-black px-6 py-2 rounded-full text-sm shadow-xl border-b-4 border-gray-300">TU</span>
        </div>
        
        <div className="text-6xl font-black pb-16 opacity-80 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] italic z-0">VS</div>

        <div className="flex flex-col items-center gap-4 z-10">
          <div className={`${animatieImpact && !isHost ? '-translate-x-10 -rotate-12' : ''} transition-transform duration-100`}>
             <OuDesenat culoare={ouAdversar} width="140px" spart={rezultat && rezultat.amCastigat} />
          </div>
          <span className="font-black tracking-wide bg-black/60 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm shadow-xl border-b-4 border-black">{numeAdversar}</span>
        </div>
      </div>

      {!rezultat ? (
        <div className="mt-8 w-full px-4">
          {isHost ? (
            !permisiuneSenzor ? (
              <button onClick={cerePermisiuneMiscare} className="w-full bg-yellow-400 text-red-900 font-black py-6 rounded-3xl text-2xl shadow-[0_10px_0_0_rgba(202,138,4,1)] hover:translate-y-2 hover:shadow-[0_2px_0_0_rgba(202,138,4,1)] transition-all active:bg-yellow-500 uppercase">
                1. Activează Senzorul
              </button>
            ) : (
              <div className="w-full text-3xl font-black animate-pulse bg-red-600/80 backdrop-blur-md p-6 rounded-3xl text-center border-4 border-red-400 shadow-[0_0_40px_rgba(220,38,38,0.6)] text-white uppercase tracking-wider">
                2. DĂ CU OUL! 📱💨
              </div>
            )
          ) : (
            <div className="w-full text-xl font-bold bg-black/50 backdrop-blur-md p-8 rounded-3xl text-center border-2 border-white/10 shadow-2xl">
              Ține telefonul strâns! 🥶<br/>
              <span className="text-red-400 font-black text-3xl drop-shadow-md mt-2 block">{numeAdversar} lovește!</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-8 w-full px-4">
          <button 
            onClick={handleCereRevansa}
            disabled={dorintaRevansa}
            className={`w-full font-black py-6 rounded-3xl text-2xl shadow-2xl transition-all border-b-4 uppercase tracking-wider ${
              dorintaRevansa 
                ? "bg-yellow-500 text-black border-yellow-700 opacity-90 scale-95 cursor-not-allowed" 
                : adversarVreaRevansa
                  ? "bg-green-500 hover:bg-green-400 text-white border-green-700 hover:scale-105 animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.6)]"
                  : "bg-blue-600 hover:bg-blue-500 text-white border-blue-800 hover:scale-105"
            }`}
          >
            {dorintaRevansa ? "Așteptăm (1/2)" : adversarVreaRevansa ? "Acceptă Revanșa (1/2)" : "Cere Revanșă (0/2)"}
          </button>
          <button onClick={() => window.location.href = "/"} className="w-full bg-white/5 hover:bg-white/20 text-white/80 font-bold py-4 rounded-3xl text-lg transition-all border border-white/10 uppercase">
            Meniu Principal
          </button>
        </div>
      )}
    </div>
  );
}

export default function Joc({ params }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black text-white p-4 text-center overflow-hidden">
      <Suspense fallback={<div className="text-2xl animate-pulse font-bold">Se fierb ouăle...</div>}>
        <LogicaJoc room={params.room} />
      </Suspense>
    </div>
  );
}