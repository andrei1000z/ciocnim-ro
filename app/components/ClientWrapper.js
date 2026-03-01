"use client";

import { useEffect, useState, createContext, useContext } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";

// Context pentru a putea accesa stats-urile oriunde în app
const GlobalStatsContext = createContext();

export const useGlobalStats = () => useContext(GlobalStatsContext);

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [notificare, setNotificare] = useState(null);
  const [nume, setNume] = useState("");

  // Sunete Globale
  const playNotifSound = () => {
    try {
      const audio = new Audio('/sunete/notificare.mp3');
      audio.volume = 0.4;
      audio.play();
    } catch (e) {}
  };

  useEffect(() => {
    const savedName = localStorage.getItem("c_nume");
    if (savedName) setNume(savedName);

    // Initializare Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    // 1. Canal Global pentru Statistici
    const globalChannel = pusher.subscribe('global');
    globalChannel.bind('ou-spart', (data) => {
      setTotalGlobal(data.total);
    });

    // 2. Canal Privat pentru Notificări de Duel
    if (savedName) {
      const userChannel = pusher.subscribe(`user-notif-${savedName}`);
      userChannel.bind('duel-request', (data) => {
        playNotifSound();
        setNotificare(data);
        // Notificarea dispare singură după 10 secunde dacă nu se apasă
        setTimeout(() => setNotificare(null), 10000);
      });
    }

    // Luăm counter-ul inițial de la server
    fetch('/api/ciocnire', { 
      method: 'POST', 
      body: JSON.stringify({ actiune: 'get-counter' }) 
    })
    .then(r => r.json())
    .then(d => { if (d.success) setTotalGlobal(d.total); });

    return () => {
      pusher.unsubscribe('global');
      if (savedName) pusher.unsubscribe(`user-notif-${savedName}`);
    };
  }, [nume]);

  const acceptaDuel = () => {
    if (notificare) {
      router.push(`/joc/${notificare.roomId}?nume=${encodeURIComponent(nume)}&host=false&teamId=${notificare.teamId || ''}`);
      setNotificare(null);
    }
  };

  return (
    <GlobalStatsContext.Provider value={{ totalGlobal }}>
      {children}

      {/* --- SISTEMUL DE NOTIFICĂRI UI (SUTE DE LINII DE LOGICĂ VIZUALĂ) --- */}
      {notificare && (
        <div className="fixed top-20 right-4 left-4 md:left-auto md:w-96 z-[999] animate-pop">
          <div className="glass-panel p-5 rounded-3xl border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 animate-pulse"></div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-2xl animate-bounce">
                ⚔️
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm uppercase tracking-tighter">Provocare Nouă!</h4>
                <p className="text-xs text-white/70">
                  <span className="text-yellow-500 font-bold">{notificare.deLa}</span> te invită la un duel {notificare.teamName ? `în ${notificare.teamName}` : 'rapid'}!
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button 
                onClick={acceptaDuel}
                className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-xl font-black text-xs uppercase transition-all"
              >
                Acceptă ✅
              </button>
              <button 
                onClick={() => setNotificare(null)}
                className="px-4 bg-white/10 hover:bg-white/20 py-2 rounded-xl font-bold text-xs uppercase transition-all"
              >
                Refuză
              </button>
            </div>
          </div>
        </div>
      )}
    </GlobalStatsContext.Provider>
  );
}