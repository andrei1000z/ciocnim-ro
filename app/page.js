"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pusher from "pusher-js";

// GENERATOR LINK-URI SCURTE (8 caractere)
const generateShortId = () => Math.random().toString(36).substring(2, 10);

function HomeContent() {
  const [nume, setNume] = useState("");
  const [cautaMeci, setCautaMeci] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const cameraInvitatie = searchParams.get("room");
  const invitator = searchParams.get("invitator");

  // ==========================================
  // LOGICA: INVITĂ UN PRIETEN
  // ==========================================
  const handleJoacaCuPrieten = async () => {
    if (!nume.trim()) return alert("Te rugăm să introduci o poreclă pentru a juca!");

    if (cameraInvitatie) {
      router.push(`/joc/${cameraInvitatie}?nume=${encodeURIComponent(nume)}&host=false`);
    } else {
      const roomId = generateShortId();
      const linkInvitatie = `${window.location.origin}/?room=${roomId}&invitator=${encodeURIComponent(nume)}`;
      
      const textViral = `Hai să vedem care e mai tare în coajă! 🥚 ${nume} te-a provocat. Intră să îți alegi oul:`;

      if (navigator.share) {
        try {
          await navigator.share({ title: "Ciocnim.ro 🥚", text: textViral, url: linkInvitatie });
          router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
        } catch (error) { console.log("Share anulat"); }
      } else {
        navigator.clipboard.writeText(`${textViral} ${linkInvitatie}`);
        alert("Link-ul a fost copiat! Trimite-l prietenilor pe WhatsApp/Insta.");
        router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    }
  };

  // ==========================================
  // LOGICA: JOACĂ ALEATORIU (Folosind Redis)
  // ==========================================
  const handleJoacaRandom = async () => {
    if (!nume.trim()) return alert("Bagă un nume ca să știe lumea cu cine joacă!");
    setCautaMeci(true);

    const roomIdAsteptare = generateShortId();

    try {
      // Întrebăm serverul dacă e cineva în coadă
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'cauta-random', roomId: roomIdAsteptare, jucator: nume })
      });
      const data = await res.json();

      if (data.matchFound) {
        // Am găsit o cameră care aștepta! Intrăm ca invitat.
        router.push(`/joc/${data.roomId}?nume=${encodeURIComponent(nume)}&host=false`);
      } else {
        // Nu era nimeni. Serverul ne-a pus în coadă. Intrăm ca host și așteptăm.
        router.push(`/joc/${data.roomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    } catch (e) {
      alert("Eroare la conectare. Încearcă din nou.");
      setCautaMeci(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm mx-auto mt-4 animate-pop">
      <div className="glass-panel p-8 rounded-[2rem] w-full flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500"></div>

        {cameraInvitatie ? (
          <div className="text-center">
            <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">Ești provocat de:</p>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-400 drop-shadow-lg">
              {invitator}
            </h2>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">Intră în Arenă</h2>
            <p className="text-xs text-red-300 mt-1 uppercase tracking-wider font-semibold">Tradiția merge mai departe</p>
          </div>
        )}

        <div className="flex flex-col gap-3 relative">
          <input
            type="text"
            placeholder="Porecla ta..."
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            maxLength={18}
            className="w-full bg-black/60 border-2 border-red-900/50 text-white placeholder-white/30 rounded-2xl p-4 text-center text-xl font-bold focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all shadow-inner"
          />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <button
            onClick={handleJoacaCuPrieten}
            disabled={cautaMeci}
            className={`w-full font-black py-5 rounded-2xl text-lg transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-2 uppercase tracking-wide border ${
              cameraInvitatie 
                ? "bg-gradient-to-b from-green-500 to-green-700 border-green-400 text-white" 
                : "bg-gradient-to-b from-red-600 to-red-800 border-red-500 text-white"
            }`}
          >
            {cameraInvitatie ? "ACCEPTĂ LUPTA ⚔️" : "INVITĂ UN PRIETEN 🔗"}
          </button>

          {!cameraInvitatie && (
            <button
              onClick={handleJoacaRandom}
              disabled={cautaMeci}
              className="w-full bg-black/50 hover:bg-black/70 border border-white/10 text-white/90 font-bold py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {cautaMeci ? "Conectare la server... ⏳" : "Joacă Aleatoriu 🎲"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [ouaSparte, setOuaSparte] = useState(0);

  // PRELUĂM COUNTER-UL REAL LA ÎNCĂRCARE
  useEffect(() => {
    fetch('/api/ciocnire', { method: 'POST', body: JSON.stringify({ actiune: 'get-counter' }) })
      .then(res => res.json())
      .then(data => { if (data.success) setOuaSparte(parseInt(data.total)); });

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe('global');
    channel.bind('ou-spart', (data) => setOuaSparte(data.total));
    
    return () => pusher.unsubscribe('global');
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col p-4 overflow-hidden">
      <div className="absolute top-4 left-0 w-full flex justify-center z-20">
        <div className="bg-black/80 backdrop-blur-md border border-red-600/30 px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
          <span className="text-white/60 font-bold text-xs tracking-widest uppercase">Ouă sparte național:</span>
          <span className="font-black text-yellow-500 text-xl text-shadow-glow">{ouaSparte.toLocaleString('ro-RO')}</span>
        </div>
      </div>

      <header className="pt-24 pb-10 text-center relative z-10 flex flex-col items-center animate-pop">
        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-white drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
          Ciocnim<span className="text-red-600">.ro</span>
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-4 opacity-70"></div>
      </header>

      <main className="flex-1 flex items-start justify-center w-full">
        <Suspense fallback={<div className="text-xl text-yellow-500 animate-pulse font-bold mt-10">Încălzim vopseaua...</div>}>
          <HomeContent />
        </Suspense>
      </main>
      
      <footer className="w-full text-center pb-4 text-[10px] text-white/30 uppercase tracking-widest z-10">
        Tradiția de Paște digitalizată
      </footer>
    </div>
  );
}