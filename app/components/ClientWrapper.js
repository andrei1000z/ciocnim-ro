"use client";

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useRouter, usePathname } from "next/navigation";

const GlobalStatsContext = createContext();

export const useGlobalStats = () => useContext(GlobalStatsContext);

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [userStats, setUserStats] = useState({ nume: "", wins: 0, losses: 0, skin: "red", teamId: null, regiune: "" });
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [topRegiuni, setTopRegiuni] = useState([]);
  const [nume, setNume] = useState("");
  const [notificare, setNotificare] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const pusherRef = useRef(null);

  const triggerVibrate = (pattern = [50]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  };

  const playSound = (soundFile) => {
    const audio = new Audio(`/${soundFile}.mp3`);
    audio.play().catch(() => {});
  };

  const incrementGlobal = useCallback(async () => {
    try {
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'increment-global', regiune: userStats.regiune })
      });
      const data = await res.json();
      if (data.success) {
        setTotalGlobal(data.total);
        if (data.topRegiuni) setTopRegiuni(data.topRegiuni);
      }
    } catch (e) {}
  }, [userStats.regiune]);

useEffect(() => {
    // 1. Încărcare date din localStorage
    const savedName = localStorage.getItem("c_nume");
    const savedStats = localStorage.getItem("c_stats");
    
    if (savedName) setNume(savedName);
    if (savedStats) {
      try {
        setUserStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Eroare la citirea statisticilor locale");
      }
    }
    setIsHydrated(true);

    // 2. Sincronizare inițială cu serverul (Bilanț + Regiuni)
    const getInitialData = async () => {
      try {
        const res = await fetch('/api/ciocnire', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, // Adăugat pentru siguranță
          body: JSON.stringify({ actiune: 'get-counter' }) 
        });
        const data = await res.json();
        if (data.success) {
          setTotalGlobal(parseInt(data.total) || 0);
          setTopRegiuni(data.topRegiuni || []);
        }
      } catch (err) {
        console.warn("Serverul nu a putut returna datele inițiale.");
      }
    };

    getInitialData();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Inițializare Pusher Singleton
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { 
        cluster: "eu", 
        forceTLS: true 
      });
    }
    
    const pusher = pusherRef.current;
    const globalChannel = pusher.subscribe('global');
    
    // Ascultăm evenimentul "update-complet" trimis de server
    globalChannel.bind('update-complet', (data) => {
      if (data.total !== undefined) {
        setTotalGlobal(parseInt(data.total));
      }
      if (data.topRegiuni) {
        setTopRegiuni(data.topRegiuni);
      }
    });

    if (nume) {
      const userChannel = pusher.subscribe(`user-notif-${nume}`);
      userChannel.bind('duel-request', (data) => {
        if (pathname.includes('/joc/')) return;
        playSound('victorie');
        setNotificare(data);
        setTimeout(() => setNotificare(null), 15000);
      });
    }
    return () => {
      globalChannel.unbind_all();
      pusher.unsubscribe('global');
    };
  }, [nume, isHydrated, pathname]);

  const contextValue = {
    totalGlobal, topRegiuni, nume, setNume: (val) => { setNume(val); localStorage.setItem("c_nume", val); },
    userStats, setUserStats: (val) => { setUserStats(val); localStorage.setItem("c_stats", JSON.stringify(val)); },
    playSound, triggerVibrate, incrementGlobal, isHydrated
  };

  return (
    <GlobalStatsContext.Provider value={contextValue}>
      {children}
      {notificare && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[9999] bg-[#111] p-6 rounded-3xl border border-red-600 shadow-2xl backdrop-blur-xl">
          <p className="font-bold text-center mb-4">⚔️ {notificare.deLa} te provoacă!</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-red-600 p-3 rounded-xl font-bold" onClick={() => router.push(`/joc/${notificare.roomId}?host=false&skin=${userStats.skin}`)}>ACCEPTĂ</button>
            <button className="flex-1 bg-white/10 p-3 rounded-xl" onClick={() => setNotificare(null)}>REFUZĂ</button>
          </div>
        </div>
      )}
      {!isHydrated && <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">🥚</div>}
    </GlobalStatsContext.Provider>
  );
}