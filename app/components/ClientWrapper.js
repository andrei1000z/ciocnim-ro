"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - CENTRAL CLIENT SYSTEM (TITAN REPAIR V6.1)
 * ------------------------------------------------------------------------------------------
 * Acest document este responsabil pentru starea globală a aplicației.
 * REPARARE: Exportăm explicit 'useGlobalStats' pentru a elimina eroarea de build.
 * ==========================================================================================
 */

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useRouter, usePathname } from "next/navigation";

// Creăm contextul pentru statistici și starea globală
const GlobalStatsContext = createContext();

/**
 * HOOK EXPORTAT: useGlobalStats
 * Acesta este piesa pe care o caută 'page.js' și nu o găsea.
 */
export const useGlobalStats = () => {
  const context = useContext(GlobalStatsContext);
  if (!context) {
    throw new Error("useGlobalStats trebuie utilizat în interiorul ClientWrapper!");
  }
  return context;
};

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // --- STĂRI GLOBALE ---
  const [totalGlobal, setTotalGlobal] = useState(9); // Pragul minim de 9 ouă
  const [notificare, setNotificare] = useState(null);
  const [nume, setNume] = useState("");
  const pusherRef = useRef(null);

  // --- LOGICĂ AUDIO ȘI FEEDBACK ---
  const playSound = useCallback((soundFile) => {
    try {
      const audio = new Audio(`/sunete/${soundFile}.mp3`);
      audio.volume = 0.4;
      audio.play().catch(() => {}); // Ignorăm eroarea dacă browserul blochează autoplay
    } catch (e) { console.error("Eroare Audio Engine"); }
  }, []);

  const triggerVibrate = useCallback((pattern = [50]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  // --- SINCRONIZARE REAL-TIME (PUSHER) ---
  useEffect(() => {
    const savedName = localStorage.getItem("c_nume");
    if (savedName) setNume(savedName);

    // Inițializare Singleton Pusher
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
        forceTLS: true
      });
    }

    const pusher = pusherRef.current;

    // 1. Canal Global pentru Counter-ul Național
    const globalChannel = pusher.subscribe('global');
    globalChannel.bind('ou-spart', (data) => {
      setTotalGlobal(Math.max(9, parseInt(data.total)));
    });

    // 2. Canal Privat pentru Notificări de Duel
    if (savedName) {
      const userChannel = pusher.subscribe(`user-notif-${savedName}`);
      userChannel.bind('duel-request', (data) => {
        // Dacă suntem deja într-un meci, nu mai afișăm notificări de invitație
        if (pathname.includes('/joc/')) return;

        playSound('notificare');
        triggerVibrate([100, 50, 100]);
        setNotificare(data);

        // Notificarea dispare automat după 12 secunde
        const timer = setTimeout(() => setNotificare(null), 12000);
        return () => clearTimeout(timer);
      });
    }

    // Luăm bilanțul inițial de la server
    fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'get-counter' }) 
    })
    .then(r => r.json())
    .then(d => { if (d.success) setTotalGlobal(Math.max(9, d.total)); });

    return () => {
      pusher.unsubscribe('global');
      if (savedName) pusher.unsubscribe(`user-notif-${savedName}`);
    };
  }, [nume, pathname, playSound, triggerVibrate]);

  const acceptaDuel = () => {
    if (notificare) {
      router.push(`/joc/${notificare.roomId}?nume=${encodeURIComponent(nume)}&host=false&teamId=${notificare.teamId || ''}`);
      setNotificare(null);
    }
  };

  return (
    <GlobalStatsContext.Provider value={{ totalGlobal, nume, setNume, playSound, triggerVibrate }}>
      {children}

      {/* INTERFAȚĂ NOTIFICARE DUEL (TITAN DESIGN) */}
      {notificare && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[999] animate-pop">
          <div className="glass-panel p-6 rounded-[2.5rem] border-2 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.4)] bg-black/90 backdrop-blur-3xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-4xl shadow-xl animate-bounce">⚔️</div>
              <div className="flex-1">
                <h4 className="font-black text-xl uppercase tracking-tighter text-white">Provocare Nouă!</h4>
                <p className="text-xs text-white/50 uppercase font-bold tracking-widest mt-1">
                  De la: <span className="text-red-500">{notificare.deLa}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={acceptaDuel} className="flex-1 bg-red-600 hover:bg-red-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 text-white">
                ACCEPTĂ ✅
              </button>
              <button onClick={() => setNotificare(null)} className="px-6 bg-white/5 py-5 rounded-2xl font-black text-[10px] uppercase text-white/30 border border-white/5">
                REFUZĂ
              </button>
            </div>
          </div>
        </div>
      )}
    </GlobalStatsContext.Provider>
  );
}