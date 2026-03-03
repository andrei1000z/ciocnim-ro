"use client";

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const GlobalStatsContext = createContext();
export const useGlobalStats = () => useContext(GlobalStatsContext);

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Setăm o regiune default pentru a evita null-urile în clasament!
  const [userStats, setUserStats] = useState({ nume: "", wins: 0, losses: 0, skin: "red", teamId: null, regiune: "Muntenia" });
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [topRegiuni, setTopRegiuni] = useState([]);
  const [nume, setNume] = useState("");
  const [notificare, setNotificare] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const pusherRef = useRef(null);

  const triggerVibrate = useCallback((pattern = [50]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const playSound = useCallback((soundFile) => {
    try { const audio = new Audio(`/${soundFile}.mp3`); audio.volume = 0.4; audio.play().catch(() => {}); } catch (e) {}
  }, []);

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
    } catch (e) { console.error("Eroare la incrementare bilanț."); }
  }, [userStats.regiune]);

  useEffect(() => {
    const savedName = localStorage.getItem("c_nume");
    const savedStats = localStorage.getItem("c_stats");
    
    if (savedName) setNume(savedName);
    if (savedStats) {
      try { setUserStats(JSON.parse(savedStats)); } catch (e) {}
    }
    setIsHydrated(true);

    const getInitialData = async () => {
      try {
        const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'get-counter' }) });
        const data = await res.json();
        if (data.success) { setTotalGlobal(parseInt(data.total) || 0); setTopRegiuni(data.topRegiuni || []); }
      } catch (err) {}
    };
    getInitialData();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!pusherRef.current) pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu", forceTLS: true });
    
    const globalChannel = pusherRef.current.subscribe('global');
    globalChannel.bind('update-complet', (data) => {
      if (data.total !== undefined) setTotalGlobal(parseInt(data.total));
      if (data.topRegiuni) setTopRegiuni(data.topRegiuni);
    });

    return () => { globalChannel.unbind_all(); pusherRef.current.unsubscribe('global'); };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || !nume || nume.length < 3) return;
    if (!pusherRef.current) return;

    const channelName = `user-notif-${nume}`;
    const userChannel = pusherRef.current.subscribe(channelName);
    
    userChannel.bind('duel-request', (data) => {
      if (pathname.includes('/joc/')) return; 
      playSound('victorie'); triggerVibrate([100, 50, 100]); setNotificare(data);
      setTimeout(() => setNotificare(null), 15000);
    });

    return () => { userChannel.unbind_all(); pusherRef.current.unsubscribe(channelName); };
  }, [nume, isHydrated, pathname, playSound, triggerVibrate]);

  const contextValue = {
    totalGlobal, topRegiuni, nume, 
    setNume: (val) => { const cleanName = val.toUpperCase().trim(); setNume(cleanName); localStorage.setItem("c_nume", cleanName); },
    userStats, 
    setUserStats: (val) => { setUserStats(val); localStorage.setItem("c_stats", JSON.stringify(val)); },
    playSound, triggerVibrate, incrementGlobal, isHydrated
  };

  return (
    <GlobalStatsContext.Provider value={contextValue}>
      {children}
      <AnimatePresence>
        {notificare && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%', scale: 0.9 }} animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }} exit={{ opacity: 0, y: -50, x: '-50%', scale: 0.9 }} transition={{ type: "spring", bounce: 0.5 }} className="fixed top-6 md:top-10 left-1/2 w-[90%] max-w-sm z-[10000] bg-[#010101]/80 backdrop-blur-3xl p-6 md:p-8 rounded-[2.5rem] border border-red-500/30 shadow-[0_30px_60px_rgba(220,38,38,0.4)]">
            <div className="text-center space-y-5">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 animate-pulse bg-red-500/10 px-4 py-1.5 rounded-full inline-block">Provocare Nouă!</span>
              <p className="font-black text-xl md:text-2xl text-white italic drop-shadow-md">⚔️ {notificare.deLa} te-a provocat!</p>
              <div className="flex gap-3 pt-3">
                <button className="flex-1 bg-red-600 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_10px_20px_rgba(220,38,38,0.3)] active:scale-95 text-white" onClick={() => { setNotificare(null); router.push(`/joc/${notificare.roomId}?host=false&skin=${userStats.skin}`); }}>ACCEPTĂ</button>
                <button className="flex-1 bg-white/5 p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white/50 border border-white/10 hover:bg-white/10 hover:text-white transition-all active:scale-95" onClick={() => setNotificare(null)}>REFUZĂ</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isHydrated && <div className="fixed inset-0 bg-[#010101] z-[10001] flex items-center justify-center"><div className="text-white/20 text-[10px] font-black uppercase tracking-[1em] animate-pulse">CIOCNIM.RO...</div></div>}
    </GlobalStatsContext.Provider>
  );
}