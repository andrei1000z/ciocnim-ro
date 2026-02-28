"use client";
import { useState, Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";

// Componenta care conține logica (trebuie separată pentru că folosim useSearchParams)
function HomeContent() {
  const [nume, setNume] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificăm dacă utilizatorul a primit un link de la un prieten
  const cameraInvitatie = searchParams.get("room");
  const invitator = searchParams.get("invitator");

  const handleActiune = async () => {
    if (!nume) {
      alert("Trebuie să îți pui un nume ca să poți juca!");
      return;
    }

    if (cameraInvitatie) {
      // SCENARIUL 2: A primit link-ul și a apăsat "Acceptă"
      // Îl trimitem în camera deja creată, dar cu numele LUI
      router.push(`/joc/${cameraInvitatie}?nume=${encodeURIComponent(nume)}&host=false`);
    } else {
      // SCENARIUL 1: Creează el jocul nou
      const roomId = uuidv4();
      
      // MAGIC: Link-ul trimis duce înapoi pe Home, nu direct în joc!
      const linkInvitatie = `${window.location.origin}/?room=${roomId}&invitator=${encodeURIComponent(nume)}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Ciocnim.ro 🥚",
            text: `${nume} te-a provocat la un concurs de ciocnit ouă! Intră să-ți alegi oul:`,
            url: linkInvitatie,
          });
          // Îl băgăm pe cel care a creat linkul în așteptare
          router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
        } catch (error) {
          console.log("Share anulat", error);
        }
      } else {
        // Fallback dacă dă share de pe PC
        navigator.clipboard.writeText(linkInvitatie);
        alert("Linkul a fost copiat! Trimite-l prietenului tău pe WhatsApp.");
        router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Căsuța principală */}
      <div className="bg-white/95 backdrop-blur-sm text-black p-8 rounded-3xl shadow-2xl w-full flex flex-col gap-6 transform transition-all hover:scale-[1.02]">
        
        {/* Schimbăm textul în funcție de cum a intrat pe site */}
        {cameraInvitatie ? (
          <div className="text-center mb-2">
            <span className="text-5xl animate-bounce inline-block mb-3 drop-shadow-md">😲</span>
            <h2 className="text-2xl font-black text-red-600 leading-tight">
              {invitator} te-a provocat!
            </h2>
            <p className="text-gray-600 text-sm mt-2 font-medium">Alege-ți un nume și arată-i cine are oul mai tare!</p>
          </div>
        ) : (
          <div className="text-center mb-2">
            <span className="text-5xl inline-block mb-3 animate-pulse drop-shadow-md">🥚</span>
            <h2 className="text-2xl font-black text-gray-800">Creează o provocare</h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">Sparge oul prietenilor tăi de la distanță!</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-lg font-bold text-gray-700 ml-1">
            {cameraInvitatie ? "Numele tău:" : "Porecla ta:"}
          </label>
          <input
            type="text"
            placeholder={cameraInvitatie ? "Ex: Ionuț Spărgătorul" : "Ex: Gigel Viteazu"}
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            maxLength={18}
            onKeyDown={(e) => e.key === 'Enter' && handleActiune()}
            className="border-2 border-gray-200 rounded-2xl p-4 text-lg focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all bg-gray-50 font-semibold"
          />
        </div>

        <button
          onClick={handleActiune}
          className={`font-bold py-4 rounded-2xl text-xl transition-all shadow-lg transform hover:-translate-y-1 hover:shadow-xl text-white ${
            cameraInvitatie 
              ? "bg-green-500 hover:bg-green-600 active:bg-green-700" 
              : "bg-red-500 hover:bg-red-600 active:bg-red-700"
          }`}
        >
          {cameraInvitatie ? "Acceptă Provocarea 💥" : "Invită un prieten 🚀"}
        </button>
      </div>

      {/* Instrucțiuni (apar doar pe prima pagină, nu și când primești link) */}
      {!cameraInvitatie && (
         <div className="bg-white/10 p-6 rounded-3xl text-sm text-red-50 text-center w-full shadow-inner border border-white/20">
           <h3 className="font-bold text-lg mb-3 text-white">Cum funcționează?</h3>
           <ul className="text-left space-y-3 font-medium">
             <li className="flex gap-2"><span>1️⃣</span> Scrii un nume amuzant.</li>
             <li className="flex gap-2"><span>2️⃣</span> Trimiți link-ul generat prietenilor.</li>
             <li className="flex gap-2"><span>3️⃣</span> Miști telefonul brusc ca să lovești!</li>
             <li className="flex gap-2"><span>4️⃣</span> Șansele sunt 50/50. Cel mai norocos câștigă!</li>
           </ul>
         </div>
      )}
    </div>
  );
}

// Aici exportăm pagina principală
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white p-4 flex flex-col font-sans">
      <header className="py-8 text-center mt-2 sm:mt-8">
        <h1 className="text-6xl font-extrabold drop-shadow-xl tracking-tight mb-2">
          Ciocnim.ro
        </h1>
        <p className="text-red-100 font-semibold text-lg tracking-wide opacity-90">Tradiția de Paște, acum online!</p>
      </header>

      <main className="flex-1 flex items-center justify-center">
        {/* Folosim Suspense pentru că citim link-ul cu useSearchParams */}
        <Suspense fallback={<div className="text-2xl animate-pulse font-bold">Se pregătesc ouăle...</div>}>
          <HomeContent />
        </Suspense>
      </main>

      <footer className="py-6 text-center text-red-200 text-xs opacity-70 font-medium">
        Făcut cu ❤️ pentru Paște. Joacă responsabil (nu da cu telefonul de masă).
      </footer>
    </div>
  );
}