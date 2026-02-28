"use client";
import { useState, Suspense, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";

function HomeContent() {
  const [nume, setNume] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const cameraInvitatie = searchParams.get("room");
  const invitator = searchParams.get("invitator");

  const handleActiune = async () => {
    if (!nume) {
      alert("Bagă un nume să știm cine e campionul!");
      return;
    }

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
        } catch (error) {
          console.log("Share anulat", error);
        }
      } else {
        navigator.clipboard.writeText(linkInvitatie);
        alert("Linkul a fost copiat! Dă-i paste pe WhatsApp.");
        router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Design Glassmorphism (Sticlă) */}
      <div className="bg-white/20 backdrop-blur-xl border border-white/30 text-white p-8 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-full flex flex-col gap-6 transform transition-all duration-500 hover:shadow-[0_8px_32px_0_rgba(220,38,38,0.4)]">
        
        {cameraInvitatie ? (
          <div className="text-center mb-2 animate-fade-in-down">
            <span className="text-6xl inline-block mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">⚔️</span>
            <h2 className="text-3xl font-black text-white leading-tight drop-shadow-md">
              <span className="text-yellow-400">{invitator}</span> te-a provocat!
            </h2>
            <p className="text-white/80 text-sm mt-2 font-medium">Acceptă lupta și arată-i cine-i șeful!</p>
          </div>
        ) : (
          <div className="text-center mb-2 animate-fade-in-down">
            <span className="text-6xl inline-block mb-3 animate-[spin_3s_linear_infinite] hover:animate-ping drop-shadow-xl cursor-pointer">🥚</span>
            <h2 className="text-3xl font-black text-white drop-shadow-md">Creează o provocare</h2>
            <p className="text-white/80 text-sm mt-1 font-medium">Tradiția merge mai departe, online!</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-lg font-bold text-white/90 ml-1 drop-shadow-sm">
            {cameraInvitatie ? "Numele tău de luptător:" : "Porecla ta:"}
          </label>
          <input
            type="text"
            placeholder={cameraInvitatie ? "Ex: Ionuț Spărgătorul" : "Ex: Gigel Viteazu"}
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            maxLength={18}
            onKeyDown={(e) => e.key === 'Enter' && handleActiune()}
            className="border-2 border-white/20 bg-black/20 text-white placeholder-white/50 rounded-2xl p-4 text-xl focus:outline-none focus:border-yellow-400 focus:bg-black/40 transition-all font-bold shadow-inner"
          />
        </div>

        <button
          onClick={handleActiune}
          className={`font-black py-4 rounded-2xl text-xl transition-all duration-300 shadow-2xl transform hover:-translate-y-2 hover:scale-105 text-white border-b-4 active:border-b-0 active:translate-y-0 ${
            cameraInvitatie 
              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 border-green-800" 
              : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 border-orange-700 text-red-950"
          }`}
        >
          {cameraInvitatie ? "ACCEPTĂ LUPTA 💥" : "GENEREAZĂ LINK 🚀"}
        </button>
      </div>
    </div>
  );
}

// Background animat cu ouă plutitoare
const FundalAnimat = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-10 left-10 text-4xl opacity-20 animate-[bounce_4s_infinite]">🥚</div>
    <div className="absolute top-40 right-20 text-5xl opacity-10 animate-[pulse_3s_infinite]">🥚</div>
    <div className="absolute bottom-20 left-1/4 text-6xl opacity-10 animate-[bounce_5s_infinite]">🥚</div>
    <div className="absolute top-1/3 left-2/3 text-3xl opacity-20 animate-[ping_6s_infinite]">🥚</div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 via-red-900 to-black text-white p-4 flex flex-col font-sans relative">
      <FundalAnimat />
      
      <header className="py-8 text-center mt-2 sm:mt-8 relative z-10">
        <h1 className="text-7xl font-black drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-white">
          Ciocnim<span className="text-yellow-500">.ro</span>
        </h1>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="text-2xl animate-pulse font-bold z-10">Se înroșesc ouăle...</div>}>
          <HomeContent />
        </Suspense>
      </main>
    </div>
  );
}