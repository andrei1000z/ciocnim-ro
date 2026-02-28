"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

export default function Home() {
  const [nume, setNume] = useState("");
  const router = useRouter();

  const handleInvita = async () => {
    if (!nume) {
      alert("Pune-ți o poreclă mai întâi!");
      return;
    }

    // 1. Generăm un cod unic pentru camera de joc
    const roomId = uuidv4();
    // 2. Creăm link-ul cu tot cu numele celui care invită
    const linkJoc = `${window.location.origin}/joc/${roomId}?nume=${nume}`;

    // 3. Magia: Deschidem meniul de Share de pe telefon (WhatsApp, Insta, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ciocnim un ou?",
          text: `${nume} te-a provocat la un concurs de ciocnit ouă online! Intră aici să îți alegi oul:`,
          url: linkJoc,
        });
        // După ce a dat share, îl băgăm și pe el în joc
        router.push(`/joc/${roomId}?nume=${nume}&host=true`);
      } catch (error) {
        console.log("Share anulat", error);
      }
    } else {
      // Fallback: Dacă e pe PC și nu are meniu de share, doar copiem linkul
      navigator.clipboard.writeText(linkJoc);
      alert("Linkul a fost copiat în clipboard! Trimite-l prietenului tău.");
      router.push(`/joc/${roomId}?nume=${nume}&host=true`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-600 text-white p-4">
      <h1 className="text-5xl font-extrabold mb-8 text-center drop-shadow-md">
        Ciocnim.ro 🥚
      </h1>

      <div className="bg-white text-black p-8 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xl font-bold text-gray-800">Porecla ta:</label>
          <input
            type="text"
            placeholder="Ex: Gigel Viteazu"
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            className="border-2 border-gray-300 rounded-xl p-4 text-lg focus:outline-none focus:border-red-500 transition-colors bg-gray-50"
          />
        </div>

        <button
          onClick={handleInvita}
          className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-4 rounded-xl text-xl transition-all shadow-md transform hover:scale-105"
        >
          Invită un prieten 🚀
        </button>
      </div>
    </div>
  );
}