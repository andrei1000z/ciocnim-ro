"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import Pusher from "pusher-js";
import { useSearchParams } from "next/navigation";

// Am creat un ou direct din cod (SVG) ca să îi putem schimba culoarea instant!
const OuDesenat = ({ culoare, width = "120px", spart = false }) => (
  <div style={{ position: 'relative', width, height: `calc(${width} * 1.3)`, margin: '0 auto' }}>
    <svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%', filter: "drop-shadow(0px 10px 10px rgba(0,0,0,0.4))" }}>
      <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={culoare} />
      <path d="M25 30 Q40 10 65 20 Q50 30 35 50 Z" fill="rgba(255,255,255,0.3)" /> {/* Reflexia de lumină pe ou */}
      {spart && (
         <path d="M0 60 L30 70 L20 80 L50 90 L40 100 L70 90 L60 110 L100 80" stroke="#222" strokeWidth="4" fill="none" opacity="0.8"/>
      )}
    </svg>
    {spart && <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-xl animate-bounce">💥</div>}
  </div>
);

const CULORI = [
  { nume: "Roșu", hex: "#ef4444" },
  { nume: "Albastru", hex: "#3b82f6" },
  { nume: "Verde", hex: "#22c55e" },
  { nume: "Galben", hex: "#eab308" },
  { nume: "Mov", hex: "#a855f7" },
  { nume: "Portocaliu", hex: "#f97316" }
];

function LogicaJoc({ room }) {
  const searchParams = useSearchParams();
  const nume = searchParams.get("nume");
  const isHost = searchParams.get("host") === "true";

  const ouMeuRef = useRef(null); // Folosim ref ca să nu pierdem starea în interiorul lui Pusher
  const [ouMeu, setOuMeu] = useState(null);
  const [ouAdversar, setOuAdversar] = useState(null);
  const [numeAdversar, setNumeAdversar] = useState("Adversarul");
  
  const [rezultat, setRezultat] = useState(null);
  const [permisiuneSenzor, setPermisiuneSenzor] = useState(false);

  // Funcție de trimis mesaje la celălalt telefon prin server
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

    // Când intrăm, strigăm în cameră: "E cineva aici? Ce ou ați ales?"
    trimiteLaServer('cere-stare');

    // Dacă adversarul cere starea și noi am ales deja oul, i-l arătăm
    channel.bind("cere-stare", (data) => {
      if (data.isHost !== isHost && ouMeuRef.current) {
        trimiteLaServer('pregatit', { culoare: ouMeuRef.current, isReply: true });
      }
    });

    // Când adversarul își alege oul
    channel.bind("pregatit", (data) => {
      if (data.isHost !== isHost) {
        setOuAdversar(data.culoare);
        setNumeAdversar(data.jucator);
        // Dacă noi am ales deja, îi trimitem oul înapoi ca să îl vadă și el
        if (ouMeuRef.current && !data.isReply) {
          trimiteLaServer('pregatit', { culoare: ouMeuRef.current, isReply: true });
        }
      }
    });

    // Când a avut loc ciocnirea
    channel.bind("lovitura", (data) => {
      let amCastigat;
      if (isHost) {
        amCastigat = data.castigaCelCareDa; // Dacă sunt gazda, depind de zar
      } else {
        amCastigat = !data.castigaCelCareDa; // Dacă primesc, câștig dacă el pierde
      }

      setRezultat({
        amCastigat: amCastigat,
        mesaj: amCastigat ? "AI CÂȘTIGAT! 🎉" : "AI PIERDUT! 😭"
      });
      if (navigator.vibrate) navigator.vibrate(amCastigat ? [100, 100, 100] : 500); 
    });

    return () => pusher.unsubscribe(`camera-${room}`);
  }, [room, isHost, nume]);

  const handleAlegeOu = (hexCuloare) => {
    setOuMeu(hexCuloare);
    ouMeuRef.current = hexCuloare;
    trimiteLaServer('pregatit', { culoare: hexCuloare, isReply: false });
  };

  const cerePermisiuneMiscare = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState === 'granted') setPermisiuneSenzor(true);
      } catch (error) {
        console.error(error);
      }
    } else {
      setPermisiuneSenzor(true);
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
        trimiteLaServer('lovitura'); // Dăm cu oul!
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [permisiuneSenzor, isHost, rezultat, ouMeu, ouAdversar]);

  // ECRANUL 1: Alegerea oului
  if (!ouMeu) {
    return (
      <div className="flex flex-col items-center gap-6 bg-white/10 p-6 rounded-3xl w-full max-w-md">
        <h2 className="text-2xl font-bold">Alege-ți oul, {nume}!</h2>
        <div className="grid grid-cols-3 gap-6">
          {CULORI.map((c) => (
            <div key={c.nume} onClick={() => handleAlegeOu(c.hex)} className="cursor-pointer transform hover:scale-110 transition-transform flex flex-col items-center gap-2">
              <OuDesenat culoare={c.hex} width="70px" />
              <span className="font-semibold text-sm">{c.nume}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ECRANUL 2: Așteptăm adversarul să aleagă
  if (ouMeu && !ouAdversar) {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="text-xl font-bold animate-pulse bg-black/20 px-6 py-3 rounded-2xl">
          Așteptăm ca adversarul să își aleagă oul... ⏱️
        </div>
        <div className="opacity-50">
          <OuDesenat culoare={ouMeu} width="150px" />
          <p className="mt-4 font-bold text-lg">Oul tău</p>
        </div>
      </div>
    );
  }

  // ECRANUL 3: Meciul sau Rezultatul
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      {!rezultat ? (
        <div className="text-3xl font-black bg-yellow-400 text-black px-8 py-2 rounded-full shadow-lg transform -rotate-2">
          LUPTA OUĂLOR! ⚔️
        </div>
      ) : (
        <div className={`text-4xl font-black px-8 py-4 rounded-3xl shadow-2xl ${rezultat.amCastigat ? 'bg-green-500' : 'bg-red-800'}`}>
          {rezultat.mesaj}
        </div>
      )}

      {/* Afișăm cele două ouă față în față */}
      <div className="flex justify-between w-full items-end mt-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <OuDesenat culoare={ouMeu} width="120px" spart={rezultat && !rezultat.amCastigat} />
          <span className="font-bold bg-white text-black px-4 py-1 rounded-full text-sm">Tu ({nume})</span>
        </div>
        
        <div className="text-5xl font-black pb-12 opacity-80 text-yellow-300">VS</div>

        <div className="flex flex-col items-center gap-2">
          <OuDesenat culoare={ouAdversar} width="120px" spart={rezultat && rezultat.amCastigat} />
          <span className="font-bold bg-white text-black px-4 py-1 rounded-full text-sm">{numeAdversar}</span>
        </div>
      </div>

      {/* Mesajele de acțiune */}
      {!rezultat ? (
        <div className="mt-8 w-full">
          {isHost ? (
            !permisiuneSenzor ? (
              <button onClick={cerePermisiuneMiscare} className="w-full bg-white text-red-600 font-black py-4 rounded-2xl text-xl shadow-xl hover:scale-105 transition-transform">
                1. Apasă ca să activezi senzorul
              </button>
            ) : (
              <div className="w-full text-2xl font-black animate-bounce bg-black/30 p-4 rounded-2xl text-center border-2 border-white/50">
                2. Mișcă telefonul brusc! 📱💨
              </div>
            )
          ) : (
            <div className="w-full text-xl font-bold bg-black/30 p-6 rounded-2xl text-center">
              Ține telefonul strâns! 🥶<br/>
              <span className="text-yellow-300">{numeAdversar}</span> se pregătește să dea!
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => window.location.href = "/"} className="mt-8 bg-white text-red-600 font-black py-4 px-8 rounded-2xl text-xl shadow-xl hover:scale-105 transition-transform">
          Joacă din nou 🔄
        </button>
      )}
    </div>
  );
}

export default function Joc({ params }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-900 text-white p-4 text-center">
      <h1 className="text-4xl font-extrabold mb-8 drop-shadow-md">Ciocnim.ro</h1>
      <Suspense fallback={<div className="text-2xl animate-pulse font-bold">Se fierb ouăle...</div>}>
        <LogicaJoc room={params.room} />
      </Suspense>
    </div>
  );
}