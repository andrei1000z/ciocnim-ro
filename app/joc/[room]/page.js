"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import Pusher from "pusher-js";
import { useSearchParams } from "next/navigation";

const playSound = (soundName) => {
  try {
    const audio = new Audio(`/sunete/${soundName}.mp3`);
    audio.play().catch(e => console.log("Sunet blocat", e));
  } catch(e) {}
};

const OuDesenat = ({ culoare, width = "120px", spart = false }) => (
  <div style={{ position: 'relative', width, height: `calc(${width} * 1.3)`, margin: '0 auto' }}>
    <svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%', filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.5))" }} className="transition-all duration-300">
      <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={culoare} />
      <path d="M5 60 L15 50 L25 60 L35 50 L45 60 L55 50 L65 60 L75 50 L85 60 L95 50" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" />
      <path d="M2 75 L15 88 L25 75 L35 88 L45 75 L55 88 L65 75 L75 88 L85 75 L98 88" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" />
      <circle cx="50" cy="69" r="4" fill="rgba(255,255,255,0.5)" />
      <path d="M25 30 Q40 10 65 20 Q50 30 35 50 Z" fill="rgba(255,255,255,0.3)" /> 
      {spart && (
         <path d="M0 60 L30 75 L15 85 L50 95 L40 110 L75 95 L65 120 L100 85" stroke="#111" strokeWidth="5" fill="none" opacity="0.9"/>
      )}
    </svg>
    {spart && <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-2xl opacity-80">💥</div>}
  </div>
);

const CULORI = [
  { nume: "Roșu Sânge", hex: "#dc2626" },
  { nume: "Albastru Marin", hex: "#2563eb" },
  { nume: "Verde Pădure", hex: "#16a34a" },
  { nume: "Galben Aur", hex: "#ca8a04" },
  { nume: "Mov Regal", hex: "#9333ea" },
  { nume: "Negru Abis", hex: "#171717" }
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
  const [adversarIesit, setAdversarIesit] = useState(false);

  const trimiteLaServer = (actiune, dateExtra = {}) => {
    fetch('/api/ciocnire', {
      method: 'POST',
      body: JSON.stringify({ roomId: room, actiune, jucator: nume, isHost, ...dateExtra })
    });
  };

  useEffect(() => {
    const laIesire = () => {
      navigator.sendBeacon('/api/ciocnire', JSON.stringify({ roomId: room, actiune: 'paraseste' }));
    };
    window.addEventListener('beforeunload', laIesire);
    return () => {
      window.removeEventListener('beforeunload', laIesire);
      laIesire();
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
        setRezultat({ amCastigat, mesaj: amCastigat ? "VICTORIE! 👑" : "SPART! 🍳" });
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

  // ȘMECHERIA PENTRU SENZOR: Cerem permisiunea fix când omul apasă pe ou!
  const handleAlegeOu = async (hexCuloare) => {
    setOuMeu(hexCuloare);
    ouMeuRef.current = hexCuloare;
    trimiteLaServer('pregatit', { culoare: hexCuloare, isReply: false });

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const state = await DeviceMotionEvent.requestPermission();
        if (state === 'granted') setPermisiuneSenzor(true);
      } catch (e) { console.error("Senzor respins:", e); }
    } else {
      setPermisiuneSenzor(true);
    }
  };

  const handleCereRevansa = () => {
    setDorintaRevansa(true);
    trimiteLaServer('revansa');
  };

  // Logica pentru butonul de Share Viral (Insta/WhatsApp)
  const handleShareViral = async () => {
    const emoji = rezultat?.amCastigat ? "😎👑" : "😭🍳";
    const textViral = rezultat?.amCastigat 
      ? `L-am bătut pe ${numeAdversar} la Ciocnim.ro! ${emoji} Intră și tu și arată-ne ce poți!`
      : `Mi-am spart oul pe Ciocnim.ro! ${emoji} Cine mă răzbună? Intră și joacă!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ciocnim.ro 🥚',
          text: textViral,
          url: window.location.origin, // Dă share la pagina principală
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(`${textViral} -> ${window.location.origin}`);
      alert("Mesajul a fost copiat! Dă-i Paste pe WhatsApp, Instagram sau Facebook!");
    }
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
      <div className="flex flex-col items-center gap-6 bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-black text-white text-center">Alege-ți armura,<br/><span className="text-yellow-400">{nume}</span>!</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full mt-4">
          {CULORI.map((c) => (
            <div key={c.nume} onClick={() => handleAlegeOu(c.hex)} className="cursor-pointer group flex flex-col items-center gap-3">
              <div className="transform group-hover:scale-110 transition-transform">
                <OuDesenat culoare={c.hex} width="80px" />
              </div>
              <span className="font-bold text-[10px] tracking-wider uppercase text-white/70">{c.nume}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (ouMeu && !ouAdversar) {
    return (
      <div className="flex flex-col items-center gap-10">
        <div className="text-xl font-bold animate-pulse text-white/70">
          Așteptăm adversarul...
        </div>
        <div className="opacity-90 transform scale-110 drop-shadow-2xl">
          <OuDesenat culoare={ouMeu} width="160px" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-8 w-full max-w-lg transition-transform duration-75 ${animatieImpact ? 'scale-105 blur-[1px]' : ''}`}>
      {!rezultat ? (
        <div className="text-3xl font-black bg-red-600 text-white px-10 py-3 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] border-2 border-red-400">
          LUPTA! ⚔️
        </div>
      ) : (
        <div className={`text-4xl font-black px-10 py-6 rounded-[2rem] shadow-2xl border-2 transform transition-all duration-500 scale-110 flex flex-col items-center ${rezultat.amCastigat ? 'bg-green-600/90 border-green-400 text-white' : 'bg-neutral-900/90 border-red-900 text-red-500'}`}>
          {rezultat.mesaj}
        </div>
      )}

      <div className={`flex justify-between w-full items-end mt-4 px-2 transition-all duration-100`}>
        <div className="flex flex-col items-center gap-4 z-10">
          <div className={`${animatieImpact && isHost ? 'translate-x-6 rotate-12' : ''} transition-transform`}>
            <OuDesenat culoare={ouMeu} width="130px" spart={rezultat && !rezultat.amCastigat} />
          </div>
          <span className="font-bold tracking-wide bg-white text-black px-5 py-1 rounded-full text-sm">TU</span>
        </div>
        
        <div className="text-4xl font-black pb-16 opacity-50 text-white italic z-0">VS</div>

        <div className="flex flex-col items-center gap-4 z-10">
          <div className={`${animatieImpact && !isHost ? '-translate-x-6 -rotate-12' : ''} transition-transform`}>
             <OuDesenat culoare={ouAdversar} width="130px" spart={rezultat && rezultat.amCastigat} />
          </div>
          <span className="font-bold tracking-wide bg-neutral-800 border border-white/20 text-white px-5 py-1 rounded-full text-sm">{numeAdversar}</span>
        </div>
      </div>

      {!rezultat ? (
        <div className="mt-8 w-full px-4">
          {isHost ? (
            <div className="w-full text-2xl font-black animate-pulse bg-red-600 border border-red-400 p-6 rounded-2xl text-center text-white uppercase shadow-[0_0_20px_rgba(220,38,38,0.5)] flex flex-col gap-3">
              <span>DĂ CU OUL! 📱💨</span>
              <div className="text-sm font-semibold text-yellow-300 normal-case tracking-normal bg-black/20 rounded-xl py-2 px-4 italic">
                Nu uita să zici: "Hristos a înviat!"
              </div>
            </div>
          ) : (
            <div className="w-full text-lg font-bold bg-neutral-800/80 p-6 rounded-2xl text-center border border-white/10 flex flex-col gap-3">
              <span>Ține telefonul strâns! 🥶</span>
              <span className="text-red-400 font-black text-xl block">{numeAdversar} lovește!</span>
              <div className="text-sm font-semibold text-yellow-300 normal-case tracking-normal bg-white/5 rounded-xl py-2 px-4 mt-2 italic">
                Răspunde-i: "Adevărat a înviat!"
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-6 w-full px-4">
          {/* BUTON NOU DE SHARE VIRAL */}
          <button 
            onClick={handleShareViral}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-4 rounded-xl text-lg transition-all shadow-lg flex items-center justify-center gap-2 mb-2"
          >
            📱 Distribuie Rezultatul!
          </button>

          <button 
            onClick={!adversarIesit ? handleCereRevansa : undefined}
            disabled={dorintaRevansa || adversarIesit}
            className={`w-full font-black py-4 rounded-xl text-lg transition-all border border-transparent ${
              adversarIesit
                ? "bg-red-950 text-red-400 border-red-900 cursor-not-allowed" 
                : dorintaRevansa 
                  ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 cursor-not-allowed" 
                  : adversarVreaRevansa
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-400" 
                    : "bg-white text-black hover:bg-gray-200" 
            }`}
          >
            {adversarIesit 
              ? "Adversarul a fugit! 🏃💨" 
              : dorintaRevansa 
                ? "Așteptăm (1/2)" 
                : adversarVreaRevansa 
                  ? "Acceptă Revanșa (1/2)" 
                  : "Cere Revanșă (0/2)"}
          </button>
          
          <button onClick={() => window.location.href = "/"} className="w-full bg-transparent hover:bg-white/5 text-white/60 font-bold py-3 rounded-xl text-sm transition-all border border-white/10 uppercase tracking-widest">
            Meniu Principal
          </button>
        </div>
      )}
    </div>
  );
}

export default function Joc({ params }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(220,38,38,0.2),rgba(0,0,0,1))] text-white p-4 text-center overflow-hidden">
      <Suspense fallback={<div className="text-xl animate-pulse font-bold">Se fierb ouăle...</div>}>
        <LogicaJoc room={params.room} />
      </Suspense>
    </div>
  );
}