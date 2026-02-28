"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";

const playSound = (soundName) => {
  try {
    const audio = new Audio(`/sunete/${soundName}.mp3`);
    audio.play().catch(e => console.log("Sunet blocat", e));
  } catch(e) {}
};

// Ou tradițional (grafică îmbunătățită)
const OuDesenat = ({ culoare, width = "120px", spart = false }) => (
  <div style={{ position: 'relative', width, height: `calc(${width} * 1.3)`, margin: '0 auto' }}>
    <svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%', filter: "drop-shadow(0px 8px 12px rgba(0,0,0,0.5))" }} className="transition-all duration-300">
      <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={culoare} />
      {/* Motive tradiționale discrete */}
      <path d="M5 60 L15 50 L25 60 L35 50 L45 60 L55 50 L65 60 L75 50 L85 60 L95 50" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      <path d="M2 75 L15 88 L25 75 L35 88 L45 75 L55 88 L65 75 L75 88 L85 75 L98 88" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      <path d="M25 30 Q40 10 65 20 Q50 30 35 50 Z" fill="rgba(255,255,255,0.2)" /> 
      {spart && (
         <path d="M0 60 L30 75 L15 85 L50 95 L40 110 L75 95 L65 120 L100 85" stroke="#111" strokeWidth="4" fill="none" opacity="0.9"/>
      )}
    </svg>
    {spart && <div className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-xl opacity-90">💥</div>}
  </div>
);

const CULORI = [
  { nume: "Tradițional", hex: "#dc2626" },
  { nume: "Safir", hex: "#2563eb" },
  { nume: "Smarald", hex: "#16a34a" },
  { nume: "Chihlimbar", hex: "#ca8a04" },
  { nume: "Ametist", hex: "#9333ea" },
  { nume: "Carbon", hex: "#171717" }
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

  const [dorintaRevansa, setDorintaRevansa] = useState(false);
  const [adversarVreaRevansa, setAdversarVreaRevansa] = useState(false);
  const [adversarIesit, setAdversarIesit] = useState(false);

  const trimiteLaServer = (actiune, dateExtra = {}) => {
    fetch('/api/ciocnire', {
      method: 'POST',
      body: JSON.stringify({ roomId: room, actiune, jucator: nume, isHost, ...dateExtra })
    });
  };

  // Functie speciala cand apasa Meniu Principal
  const handlePlecareForțată = () => {
    trimiteLaServer('paraseste'); // Trimitem explicit inainte sa schimbam pagina
    router.push('/');
  };

  // Functie pentru cand inchide browserul de tot
  useEffect(() => {
    const laIesire = () => navigator.sendBeacon('/api/ciocnire', JSON.stringify({ roomId: room, actiune: 'paraseste' }));
    window.addEventListener('beforeunload', laIesire);
    return () => {
      window.removeEventListener('beforeunload', laIesire);
      laIesire(); // Triggers on component unmount
    };
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
        setRezultat({ amCastigat, mesaj: amCastigat ? "VICTORIE!" : "OUL TĂU S-A SPART!" });
        playSound(amCastigat ? 'victorie' : 'esec');
        if (navigator.vibrate) navigator.vibrate(amCastigat ? [100, 50, 100] : 800); 
      }, 500);
    });

    channel.bind("revansa", (data) => {
      if (data.isHost !== isHost) setAdversarVreaRevansa(true);
    });

    channel.bind("adversar-iesit", () => {
      setAdversarIesit(true);
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

  const handleShareViral = async () => {
    const textViral = rezultat?.amCastigat 
      ? `L-am bătut pe ${numeAdversar} la ciocnit! 😎 Intră pe Ciocnim.ro și arată-ne ce poți!`
      : `Mi-am spart oul! 😭 Cine mă răzbună? Intră pe Ciocnim.ro și joacă!`;

    if (navigator.share) {
      try { await navigator.share({ title: 'Ciocnim.ro', text: textViral, url: window.location.origin }); } catch (e) {}
    } else {
      navigator.clipboard.writeText(`${textViral} -> ${window.location.origin}`);
      alert("Mesajul a fost copiat! Dă-i Paste oriunde vrei!");
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

  // ECRAN 1: Alegere ou
  if (!ouMeu) {
    return (
      <div className="flex flex-col items-center gap-8 bg-[#1a1a1a]/90 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md border-t-4 border-t-red-600 shadow-2xl">
        <h2 className="text-xl font-bold text-white/90 text-center uppercase tracking-widest">Alege-ți armura</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full">
          {CULORI.map((c) => (
            <div key={c.nume} onClick={() => handleAlegeOu(c.hex)} className="cursor-pointer group flex flex-col items-center gap-3">
              <div className="transform group-hover:scale-110 transition-transform">
                <OuDesenat culoare={c.hex} width="75px" />
              </div>
              <span className="font-semibold text-[10px] tracking-wider uppercase text-white/50">{c.nume}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ECRAN 2: Lobby asteptare
  if (ouMeu && !ouAdversar) {
    return (
      <div className="flex flex-col items-center gap-8 mt-10">
        <div className="text-sm font-bold tracking-[0.2em] uppercase animate-pulse text-red-500">
          Așteptăm adversarul...
        </div>
        <div className="opacity-90 transform scale-100">
          <OuDesenat culoare={ouMeu} width="140px" />
        </div>
      </div>
    );
  }

  // ECRAN 3: Bătălia / Rezultatul
  return (
    <div className={`flex flex-col items-center gap-8 w-full max-w-lg transition-transform duration-75 ${animatieImpact ? 'scale-105 blur-[1px]' : ''}`}>
      {!rezultat ? (
        <div className="text-2xl font-black bg-red-600 text-white px-8 py-2 rounded-full tracking-widest uppercase shadow-lg">
          Luptă!
        </div>
      ) : (
        <div className={`text-3xl font-black px-8 py-6 rounded-3xl shadow-xl w-full flex justify-center uppercase tracking-wide ${rezultat.amCastigat ? 'bg-green-600 text-white' : 'bg-neutral-900 text-red-500 border border-red-900/50'}`}>
          {rezultat.mesaj}
        </div>
      )}

      <div className="flex justify-between w-full items-end mt-4 px-4 relative">
        <div className="flex flex-col items-center gap-4 z-10 w-1/3">
          <div className={`${animatieImpact && isHost ? 'translate-x-8 rotate-12' : ''} transition-transform`}>
            <OuDesenat culoare={ouMeu} width="110px" spart={rezultat && !rezultat.amCastigat} />
          </div>
          <span className="font-bold tracking-widest uppercase bg-white/10 text-white px-4 py-1 rounded-full text-xs">Tu</span>
        </div>
        
        <div className="text-2xl font-black pb-12 opacity-30 text-white italic z-0 w-1/3 text-center">VS</div>

        <div className="flex flex-col items-center gap-4 z-10 w-1/3">
          <div className={`${animatieImpact && !isHost ? '-translate-x-8 -rotate-12' : ''} transition-transform`}>
             <OuDesenat culoare={ouAdversar} width="110px" spart={rezultat && rezultat.amCastigat} />
          </div>
          <span className="font-bold tracking-widest uppercase bg-red-900/50 text-white px-4 py-1 rounded-full text-xs truncate max-w-[100px]">{numeAdversar}</span>
        </div>
      </div>

      {!rezultat ? (
        <div className="mt-8 w-full px-4">
          {isHost ? (
            <div className="w-full text-xl font-black animate-pulse bg-red-600 p-6 rounded-2xl text-center text-white uppercase shadow-lg flex flex-col gap-2">
              <span>DĂ CU OUL! 📱💨</span>
              <div className="text-xs font-semibold text-yellow-300 normal-case tracking-normal opacity-90">
                Spune: "Hristos a înviat!"
              </div>
            </div>
          ) : (
            <div className="w-full text-md font-bold bg-neutral-900 p-6 rounded-2xl text-center border border-white/5 flex flex-col gap-2">
              <span className="text-white/60 uppercase tracking-widest text-xs">Așteaptă lovitura</span>
              <span className="text-red-400 font-black text-xl">{numeAdversar} lovește!</span>
              <div className="text-xs font-semibold text-yellow-500 normal-case tracking-normal opacity-90 mt-1">
                Răspunde: "Adevărat a înviat!"
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full px-4 mt-4">
          <button 
            onClick={handleShareViral}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            Distribuie Rezultatul
          </button>

          <button 
            onClick={!adversarIesit ? handleCereRevansa : undefined}
            disabled={dorintaRevansa || adversarIesit}
            className={`w-full font-bold py-4 rounded-xl text-sm transition-all uppercase tracking-wider ${
              adversarIesit
                ? "bg-neutral-900 text-red-500 cursor-not-allowed" 
                : dorintaRevansa 
                  ? "bg-yellow-500/20 text-yellow-500 cursor-not-allowed" 
                  : adversarVreaRevansa
                    ? "bg-green-600 text-white hover:bg-green-500" 
                    : "bg-neutral-800 text-white hover:bg-neutral-700" 
            }`}
          >
            {adversarIesit ? "Adversarul a ieșit" : dorintaRevansa ? "Așteptăm (1/2)" : adversarVreaRevansa ? "Acceptă Revanșa (1/2)" : "Cere Revanșă (0/2)"}
          </button>
          
          <button onClick={handlePlecareForțată} className="w-full bg-transparent hover:bg-white/5 text-white/50 font-bold py-3 rounded-xl text-xs transition-all uppercase tracking-widest mt-2">
            Meniu Principal
          </button>
        </div>
      )}
    </div>
  );
}

export default function Joc({ params }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0d] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] text-white p-4 text-center">
      <Suspense fallback={<div className="text-sm text-red-500 uppercase tracking-widest animate-pulse font-bold">Se pregătește...</div>}>
        <LogicaJoc room={params.room} />
      </Suspense>
    </div>
  );
}