"use client";
import { useState, Suspense, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import Pusher from "pusher-js";

// Componentă nouă: Particule ambientale pe fundal
const BackgroundParticles = () => {
  const particule = Array.from({ length: 15 });
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
      {particule.map((_, i) => (
        <div 
          key={i} 
          className="absolute rounded-full bg-yellow-500 animate-float"
          style={{
            width: Math.random() * 6 + 2 + 'px',
            height: Math.random() * 6 + 2 + 'px',
            left: Math.random() * 100 + 'vw',
            top: Math.random() * 100 + 'vh',
            animationDuration: (Math.random() * 3 + 2) + 's',
            animationDelay: (Math.random() * 2) + 's',
            boxShadow: '0 0 10px rgba(234, 179, 8, 0.8)'
          }}
        />
      ))}
    </div>
  );
};

function HomeContent() {
  const [nume, setNume] = useState("");
  const [cautaMeci, setCautaMeci] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const cameraInvitatie = searchParams.get("room");
  const invitator = searchParams.get("invitator");
  const connectionRef = useRef(null);

  const handleJoacaCuPrieten = async () => {
    if (!nume.trim()) return alert("Te rugăm să introduci o poreclă pentru a juca!");

    if (cameraInvitatie) {
      router.push(`/joc/${cameraInvitatie}?nume=${encodeURIComponent(nume)}&host=false`);
    } else {
      const roomId = uuidv4();
      const linkInvitatie = `${window.location.origin}/?room=${roomId}&invitator=${encodeURIComponent(nume)}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Ciocnim.ro 🥚",
            text: `Te provoc la un duel de Paște! Intră să-ți alegi oul:`,
            url: linkInvitatie,
          });
          router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
        } catch (error) { console.log("Share anulat"); }
      } else {
        navigator.clipboard.writeText(linkInvitatie);
        alert("Link-ul a fost copiat! Trimite-l prietenilor pe WhatsApp.");
        router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    }
  };

  const handleJoacaRandom = () => {
    if (!nume.trim()) return alert("Bagă un nume ca să știe lumea cu cine joacă!");
    setCautaMeci(true);

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe('lobby');
    let gasit = false;
    connectionRef.current = pusher;

    channel.bind('camera-disponibila', (data) => {
      if (!gasit && data.jucator !== nume) {
        gasit = true;
        pusher.unsubscribe('lobby');
        router.push(`/joc/${data.roomId}?nume=${encodeURIComponent(nume)}&host=false`);
      }
    });

    const newRoomId = uuidv4();
    setTimeout(() => {
      if (!gasit) {
        fetch('/api/ciocnire', {
          method: 'POST',
          body: JSON.stringify({ actiune: 'cauta-random', roomId: newRoomId, jucator: nume })
        });
      }
    }, 1500);

    setTimeout(() => {
      if (!gasit) {
        pusher.unsubscribe('lobby');
        router.push(`/joc/${newRoomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    }, 5000); 
  };

  useEffect(() => {
    return () => { if (connectionRef.current) connectionRef.current.disconnect(); }
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm mx-auto mt-4 animate-pop">
      {/* Box-ul principal reparat cu Glassmorphism si Tailwind curat */}
      <div className="glass-panel p-8 rounded-[2rem] w-full flex flex-col gap-6 relative overflow-hidden">
        
        {/* Un accent roșu sus */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500"></div>

        {cameraInvitatie ? (
          <div className="text-center">
            <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">Provocare de la:</p>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 drop-shadow-lg">
              {invitator}
            </h2>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">
              Intră în Arenă
            </h2>
            <p className="text-xs text-red-300 mt-1 uppercase tracking-wider font-semibold">Tradiția merge mai departe</p>
          </div>
        )}

        <div className="flex flex-col gap-3 relative">
          <input
            type="text"
            placeholder="Numele tău de jucător..."
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            maxLength={18}
            className="w-full bg-black/60 border-2 border-red-900/50 text-white placeholder-white/30 rounded-2xl p-4 text-center text-lg font-bold focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all shadow-inner"
          />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <button
            onClick={handleJoacaCuPrieten}
            disabled={cautaMeci}
            className={`w-full font-black py-4 rounded-2xl text-lg transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-2 uppercase tracking-wide border ${
              cameraInvitatie 
                ? "bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border-green-400 text-white shadow-green-900/50" 
                : "bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-red-500 text-white shadow-red-900/50"
            }`}
          >
            {cameraInvitatie ? "ACCEPTĂ LUPTA ⚔️" : "INVITĂ UN PRIETEN 🔗"}
          </button>

          {!cameraInvitatie && (
            <button
              onClick={handleJoacaRandom}
              disabled={cautaMeci}
              className="w-full bg-black/50 hover:bg-black/70 border border-white/10 text-white/90 font-bold py-4 rounded-2xl text-sm transition-all transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {cautaMeci ? "Căutăm (5s)... ⏳" : "Joacă Aleatoriu 🎲"}
            </button>
          )}
        </div>
      </div>

      {!cameraInvitatie && (
         <div className="w-full bg-red-950/30 backdrop-blur-md p-6 rounded-[2rem] text-sm text-white/80 border border-red-500/10 flex flex-col items-center text-center shadow-lg">
           <span className="text-3xl mb-2 animate-float">📱</span>
           <p className="font-medium leading-relaxed">
             Alege oul, strânge bine telefonul și mișcă-l brusc! Sistemul detectează mișcarea automat. Șansele de câștig sunt fix 50/50.
           </p>
         </div>
      )}
    </div>
  );
}

export default function Home() {
  const [ouaSparte, setOuaSparte] = useState(0);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe('global');
    channel.bind('ou-spart', () => setOuaSparte(prev => prev + 1));
    return () => pusher.unsubscribe('global');
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col p-4">
      <BackgroundParticles />
      
      <div className="absolute top-4 left-0 w-full flex justify-center z-20">
        <div className="bg-black/80 backdrop-blur-md border border-red-600/30 px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
          <span className="text-white/60 font-bold text-xs tracking-widest uppercase">Ouă sparte live:</span>
          <span className="font-black text-yellow-500 text-xl text-shadow-glow">{ouaSparte}</span>
        </div>
      </div>

      <header className="pt-20 pb-10 text-center relative z-10 flex flex-col items-center animate-pop">
        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-white drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
          Ciocnim<span className="text-red-600">.ro</span>
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-4 opacity-70"></div>
      </header>

      <main className="flex-1 flex items-start justify-center w-full">
        <Suspense fallback={<div className="text-xl text-yellow-500 animate-pulse font-bold z-10 mt-10">Încălzim vopseaua...</div>}>
          <HomeContent />
        </Suspense>
      </main>
      
      <footer className="w-full text-center pb-4 pt-8 text-[10px] text-white/30 uppercase tracking-widest z-10 relative">
        Creat pentru Paște • Joacă responsabil
      </footer>
    </div>
  );
}