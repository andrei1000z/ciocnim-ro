"use client";
import { useState, Suspense, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import Pusher from "pusher-js";

function HomeContent() {
  const [nume, setNume] = useState("");
  const [cautaMeci, setCautaMeci] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const cameraInvitatie = searchParams.get("room");
  const invitator = searchParams.get("invitator");
  const connectionRef = useRef(null);

  const handleJoacaCuPrieten = async () => {
    if (!nume) return alert("Porecla e obligatorie pentru a intra în arenă!");

    if (cameraInvitatie) {
      router.push(`/joc/${cameraInvitatie}?nume=${encodeURIComponent(nume)}&host=false`);
    } else {
      const roomId = uuidv4();
      const linkInvitatie = `${window.location.origin}/?room=${roomId}&invitator=${encodeURIComponent(nume)}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Ciocnim.ro 🥚",
            text: `Te provoc la ciocnit! Intră să-ți alegi arma:`,
            url: linkInvitatie,
          });
          router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
        } catch (error) { console.log("Share anulat"); }
      } else {
        navigator.clipboard.writeText(linkInvitatie);
        alert("Link copiat! Trimite-l prietenului tău.");
        router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    }
  };

  const handleJoacaRandom = () => {
    if (!nume) return alert("Bagă un nume ca să știe lumea cu cine joacă!");
    setCautaMeci(true);

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe('lobby');
    let gasit = false;
    connectionRef.current = pusher;

    channel.bind('camera-disponibila', (data) => {
      // Dacă a găsit o cameră creată de altcineva (care nu e a noastră)
      if (!gasit && data.jucator !== nume) {
        gasit = true;
        pusher.unsubscribe('lobby');
        router.push(`/joc/${data.roomId}?nume=${encodeURIComponent(nume)}&host=false`);
      }
    });

    // Anunțăm în lobby că existăm, dar dăm timp serverului (5 secunde)
    const newRoomId = uuidv4();
    setTimeout(() => {
      fetch('/api/ciocnire', {
        method: 'POST',
        body: JSON.stringify({ actiune: 'cauta-random', roomId: newRoomId, jucator: nume })
      });
    }, 1500); // Trimitem cererea după 1.5s ca să aibă timp să se lege conexiunea

    setTimeout(() => {
      if (!gasit) {
        pusher.unsubscribe('lobby');
        router.push(`/joc/${newRoomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    }, 5000); // Așteptăm 5 secunde. Dacă nu vine nimeni, creăm noi camera și așteptăm.
  };

  // Curățăm conexiunea dacă iese de pe pagină în timp ce caută
  useEffect(() => {
    return () => { if (connectionRef.current) connectionRef.current.disconnect(); }
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border-t-4 border-t-red-600 border border-white/10 text-white p-8 rounded-3xl shadow-2xl w-full flex flex-col gap-6">
        
        {cameraInvitatie ? (
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-white/90">Ai fost provocat de:</h2>
            <h3 className="text-3xl font-black text-yellow-500 mt-1">{invitator}</h3>
          </div>
        ) : (
          <div className="text-center mb-2">
            <h2 className="text-2xl font-black text-white tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
              Intră în Arenă
            </h2>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Numele tău..."
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            maxLength={18}
            className="bg-black/50 border-b-2 border-white/20 text-white placeholder-white/30 p-3 text-center text-xl focus:outline-none focus:border-red-500 transition-all font-bold tracking-wide"
          />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <button
            onClick={handleJoacaCuPrieten}
            disabled={cautaMeci}
            className={`font-black py-4 rounded-xl text-lg transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide ${
              cameraInvitatie 
                ? "bg-green-600 hover:bg-green-500 text-white" 
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {cameraInvitatie ? "ACCEPTĂ LUPTA ⚔️" : "INVITĂ UN PRIETEN 🔗"}
          </button>

          {!cameraInvitatie && (
            <button
              onClick={handleJoacaRandom}
              disabled={cautaMeci}
              className="bg-neutral-800 hover:bg-neutral-700 border border-white/5 text-white/90 font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {cautaMeci ? "Se caută adversar (5s)... ⏳" : "Joacă Aleatoriu 🎲"}
            </button>
          )}
        </div>
      </div>

      {!cameraInvitatie && (
         <div className="w-full bg-black/40 backdrop-blur-sm p-6 rounded-3xl text-sm text-white/70 border border-white/5 flex flex-col items-center">
           <h3 className="font-bold text-xs mb-3 text-red-400 tracking-[0.2em] uppercase">Tradiția, digitalizată</h3>
           <p className="text-center leading-relaxed">
             Alege-ți oul. Strânge bine telefonul în mână și mișcă-l brusc pentru a ciocni. Șansele de a câștiga sunt fix 50/50. 
           </p>
         </div>
      )}
    </div>
  );
}

export default function Home() {
  const [ouaSparte, setOuaSparte] = useState(0); // Counter REAL care începe de la 0 pentru sesiunea live!

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe('global');
    channel.bind('ou-spart', () => {
      setOuaSparte(prev => prev + 1);
    });
    return () => pusher.unsubscribe('global');
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d0d] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] text-white p-4 flex flex-col font-sans relative">
      
      <div className="absolute top-4 left-0 w-full flex justify-center z-20">
        <div className="bg-red-950/40 backdrop-blur-md border border-red-900/50 px-5 py-2 rounded-full flex items-center gap-3 shadow-xl">
          <span className="text-white/80 font-medium text-xs tracking-wider uppercase">Ouă sparte live:</span>
          <span className="font-black text-yellow-500 text-lg">{ouaSparte}</span>
        </div>
      </div>

      <header className="py-10 mt-10 text-center relative z-10 flex flex-col items-center">
        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-lg text-white">
          Ciocnim<span className="text-red-600">.ro</span>
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-4 opacity-50"></div>
      </header>

      <main className="flex-1 flex items-start mt-2 justify-center">
        <Suspense fallback={<div className="text-lg text-red-500 animate-pulse font-bold z-10">Pregătim vopseaua...</div>}>
          <HomeContent />
        </Suspense>
      </main>
    </div>
  );
}