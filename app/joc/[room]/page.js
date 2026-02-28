"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useSearchParams } from "next/navigation";

export default function Joc({ params }) {
  const { room } = params; // ID-ul camerei din link
  const searchParams = useSearchParams();
  const nume = searchParams.get("nume"); // Numele jucătorului
  const isHost = searchParams.get("host") === "true"; // E cel care dă sau cel care primește?

  const [rezultat, setRezultat] = useState(null); // Cine a câștigat
  const [permisiuneSenzor, setPermisiuneSenzor] = useState(false);

  useEffect(() => {
    // Ne conectăm la Pusher (partea de client/telefon)
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    // Intrăm în camera specifică acestui link
    const channel = pusher.subscribe(`camera-${room}`);

    // Ascultăm când serverul zice că s-a terminat ciocnirea
    channel.bind("rezultat", (data) => {
      if (data.castigaCelCareDa) {
        setRezultat(isHost ? "AI CÂȘTIGAT! Ai spart oul celuilalt 🎉" : "AI PIERDUT! Ți-a spart oul 😭");
      } else {
        setRezultat(isHost ? "AI PIERDUT! Ți s-a spart oul 😭" : "AI CÂȘTIGAT! I-ai spart oul 🎉");
      }
      // Vibrează telefonul dacă se sparge oul!
      if (navigator.vibrate) navigator.vibrate(200); 
    });

    return () => {
      pusher.unsubscribe(`camera-${room}`);
    };
  }, [room, isHost]);

  // Funcție pentru activat senzorii (pe iPhone cere o confirmare specială)
  const cerePermisiuneMiscare = async () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState === 'granted') setPermisiuneSenzor(true);
      } catch (error) {
        console.error(error);
      }
    } else {
      // Pe Android merge direct de obicei
      setPermisiuneSenzor(true);
    }
  };

  useEffect(() => {
    if (!permisiuneSenzor || !isHost || rezultat) return;

    // Logica de citire a mișcării telefonului
    const handleMotion = (event) => {
      const acc = event.acceleration;
      if (!acc) return;

      // Dacă mișcă telefonul brusc pe o axă (x, y sau z depășește forța 15)
      const forta = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      if (forta > 25) { 
        // OPREȘTE SENZORUL ca să nu trimită de 10 ori
        window.removeEventListener("devicemotion", handleMotion);
        
        // Trimite semnal la server că a dat cu oul
        fetch('/api/ciocnire', {
          method: 'POST',
          body: JSON.stringify({ roomId: room, jucatorCareDa: nume })
        });
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [permisiuneSenzor, isHost, rezultat, room, nume]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-600 text-white p-4 text-center">
      <h1 className="text-4xl font-bold mb-8">Ciocnim.ro</h1>

      {!rezultat ? (
        <div className="flex flex-col items-center gap-6">
          <div className="text-2xl font-semibold bg-white text-red-600 px-6 py-2 rounded-full shadow-lg">
            Tu ești: {nume}
          </div>

          <div className="text-9xl my-4 drop-shadow-2xl animate-pulse">
            🥚
          </div>

          {isHost ? (
            !permisiuneSenzor ? (
              <button 
                onClick={cerePermisiuneMiscare}
                className="bg-yellow-400 text-black font-bold py-4 px-8 rounded-2xl text-xl shadow-md"
              >
                1. Apasă ca să activezi senzorul
              </button>
            ) : (
              <div className="text-2xl font-bold animate-bounce bg-black/20 p-4 rounded-xl">
                2. Mișcă telefonul brusc (dă cu oul!) 📱💨
              </div>
            )
          ) : (
            <div className="text-2xl font-bold bg-black/20 p-4 rounded-xl">
              Ține strâns! Așteaptă ca celălalt să lovească oul tău... 🥶
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 bg-white p-8 rounded-3xl text-black">
          <div className="text-8xl">
            {rezultat.includes("CÂȘTIGAT") ? "😎🥚" : "😭🍳"}
          </div>
          <h2 className={`text-3xl font-bold ${rezultat.includes("CÂȘTIGAT") ? "text-green-600" : "text-red-600"}`}>
            {rezultat}
          </h2>
          <button 
            onClick={() => window.location.href = "/"}
            className="mt-4 bg-gray-200 hover:bg-gray-300 font-bold py-3 px-6 rounded-xl text-lg"
          >
            Joacă din nou
          </button>
        </div>
      )}
    </div>
  );
}