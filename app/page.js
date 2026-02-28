"use client";
import { useState, Suspense, useEffect } from "react";
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

  // Logica pentru "Invită un Prieten"
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
            text: `${nume} te-a provocat la ciocnit ouă! Intră să-ți alegi arma:`,
            url: linkInvitatie,
          });
          router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
        } catch (error) { console.log("Share anulat", error); }
      } else {
        navigator.clipboard.writeText(linkInvitatie);
        alert("Link copiat! Trimite-l prietenului tău.");
        router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    }
  };

  // Logica pentru "Joacă Aleatoriu"
  const handleJoacaRandom = () => {
    if (!nume) return alert("Baga un nume ca să știe lumea cu cine joacă!");
    setCautaMeci(true);

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe('lobby');
    let gasit = false;

    // Ascultăm dacă altcineva caută meci
    channel.bind('camera-disponibila', (data) => {
      if (!gasit) {
        gasit = true;
        pusher.unsubscribe('lobby');
        router.push(`/joc/${data.roomId}?nume=${encodeURIComponent(nume)}&host=false`);
      }
    });

    // Dacă în 2 secunde nu găsim pe nimeni, facem noi o cameră și așteptăm
    setTimeout(() => {
      if (!gasit) {
        const newRoomId = uuidv4();
        fetch('/api/ciocnire', {
          method: 'POST',
          body: JSON.stringify({ actiune: 'cauta-random', roomId: newRoomId, jucator: nume })
        });
        pusher.unsubscribe('lobby');
        router.push(`/joc/${newRoomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    }, 2000);
  };

  return (
    <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm mx-auto">
      <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 text-white p-8 rounded-[2rem] shadow-2xl w-full flex flex-col gap-6">
        
        {cameraInvitatie ? (
          <div className="text-center mb-2 animate-fade-in">
            <h2 className="text-2xl font-black text-white leading-tight">
              <span className="text-yellow-400">{invitator}</span> te-a provocat!
            </h2>
          </div>
        ) : (
          <div className="text-center mb-2">
            <h2 className="text-2xl font-black text-white tracking-wide">Intră în Arenă</h2>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Numele tău de luptător..."
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            maxLength={18}
            className="bg-black/40 border border-white/20 text-white placeholder-white/40 rounded-xl p-4 text-center text-lg focus:outline-none focus:border-yellow-400 transition-all font-bold"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleJoacaCuPrieten}
            disabled={cautaMeci}
            className={`font-black py-4 rounded-xl text-lg transition-all text-neutral-900 shadow-lg ${
              cameraInvitatie 
                ? "bg-green-400 hover:bg-green-300" 
                : "bg-yellow-400 hover:bg-yellow-300 hover:scale-[1.02]"
            }`}
          >
            {cameraInvitatie ? "ACCEPTĂ LUPTA ⚔️" : "INVITĂ UN PRIETEN 🔗"}
          </button>

          {!cameraInvitatie && (
            <button
              onClick={handleJoacaRandom}
              disabled={cautaMeci}
              className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-4 rounded-xl text-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {cautaMeci ? "Căutăm adversar... ⏳" : "JOACĂ ALEATORIU 🎲"}
            </button>
          )}
        </div>
      </div>

      {/* Secțiunea de "Instrucțiuni" transformată */}
      {!cameraInvitatie && (
         <div className="w-full bg-neutral-900/40 backdrop-blur-md p-6 rounded-[2rem] text-sm text-white/80 border border-white/5">
           <h3 className="font-bold text-lg mb-4 text-white text-center tracking-wide uppercase">Tradiția de Paște</h3>
           <ul className="space-y-3 font-medium px-2">
             <li className="flex gap-3 items-center"><span className="text-xl">🥚</span> Alege-ți oul preferat.</li>
             <li className="flex gap-3 items-center"><span className="text-xl">📱</span> Strânge telefonul și mișcă-l brusc.</li>
             <li className="flex gap-3 items-center"><span className="text-xl">🎲</span> Șansele sunt 50/50. Norocul decide!</li>
           </ul>
         </div>
      )}
    </div>
  );
}

export default function Home() {
  const [ouaSparte, setOuaSparte] = useState(14253); // Fake base number

  // Efect pentru a asculta de pe server când oricine sparge un ou
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe('global');
    channel.bind('ou-spart', () => {
      setOuaSparte(prev => prev + 1);
    });
    return () => pusher.unsubscribe('global');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.3),rgba(0,0,0,1))] text-white p-4 flex flex-col font-sans relative">
      
      {/* Global Counter Navbar */}
      <div className="absolute top-4 left-0 w-full flex justify-center z-20">
        <div className="bg-black/50 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <span className="text-yellow-500 font-bold">💥 Ouă sparte global:</span>
          <span className="font-black font-mono text-lg">{ouaSparte.toLocaleString()}</span>
        </div>
      </div>

      <header className="py-12 mt-8 text-center relative z-10">
        <h1 className="text-6xl sm:text-7xl font-black drop-shadow-2xl tracking-tighter mb-2">
          Ciocnim<span className="text-yellow-500">.ro</span>
        </h1>
      </header>

      <main className="flex-1 flex items-start mt-4 justify-center">
        <Suspense fallback={<div className="text-2xl animate-pulse font-bold z-10">Se înroșesc ouăle...</div>}>
          <HomeContent />
        </Suspense>
      </main>
    </div>
  );
}