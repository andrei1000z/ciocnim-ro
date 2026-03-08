"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - NUCLEUL LOGIC (V30.3 - TRADIȚIONAL DESIGN & SYNC REPAIR)
 * ====================================================================================================
 * FIX 1: Curățare nume vechi în grupuri (trimitem teamIds din localStorage).
 * FIX 2: Sincronizare forțată a scorului în clasamentul global (trimitem scorCurent).
 * ====================================================================================================
 */

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const GlobalStatsContext = createContext();
export const useGlobalStats = () => useContext(GlobalStatsContext);

const DEFAULT_STATS = { nume: "", wins: 0, losses: 0, skin: "red", teamId: null, regiune: "Muntenia" };

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [userStats, setUserStats] = useState(DEFAULT_STATS);
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [topRegiuni, setTopRegiuni] = useState([]);
  const [topJucatori, setTopJucatori] = useState([]);
  const [nume, setNumeLocal] = useState("");
  const [notificare, setNotificare] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const pusherRef = useRef(null);

  const triggerVibrate = useCallback((pattern = [50]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const playSound = useCallback((soundFile) => {
    try { const audio = new Audio(`/${soundFile}.mp3`); audio.volume = 0.4; audio.play().catch(() => {}); } catch (e) {}
  }, []);

  const updateUserStats = useCallback((newStats) => {
    setUserStats(prevStats => {
      const updated = typeof newStats === 'function' ? newStats(prevStats) : newStats;
      localStorage.setItem("c_stats", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ==========================================================================
  // SCHIMBARE NUME (FIX PENTRU DUPLICATE ÎN GRUP)
  // ==========================================================================
  const setNume = async (nouNume) => {
    const cleanName = nouNume.toUpperCase().trim();
    if (cleanName === nume) return true; 
    if (cleanName.length < 3) {
      alert("Numele trebuie să aibă minim 3 litere.");
      return false;
    }

    try {
      // Luăm grupurile în care ești pentru a face clean-up în backend
      const storedTeamIds = JSON.parse(localStorage.getItem("c_teamIds") || "[]");
      const scorCurent = JSON.parse(localStorage.getItem("c_stats") || "{}").wins || 0;

      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actiune: 'schimba-porecla',
          oldName: nume, 
          newName: cleanName,
          teamIds: storedTeamIds, // Acum trimitem corect array-ul de grupuri
          scor: scorCurent // Salvăm scorul să nu-l pierdem la redenumire
        })
      });
      const data = await res.json();
      
      if (!data.success) {
        alert(data.error || "Acel nume este deja luat! Alege altul.");
        return false;
      }

      setNumeLocal(cleanName);
      localStorage.setItem("c_nume", cleanName);
      setUserStats(prev => {
         const nextStats = { ...prev, nume: cleanName };
         localStorage.setItem("c_stats", JSON.stringify(nextStats));
         return nextStats;
      });
      return true;

    } catch (e) {
      console.error("Eroare la validare nume", e);
      alert("Eroare la rețea. Încearcă din nou.");
      return false;
    }
  };

  // ==========================================================================
  // INCREMENTARE SCOR (FIX PENTRU CLASAMENT JUCĂTORI)
  // ==========================================================================
  const incrementGlobal = useCallback(async (amCastigat = false) => {
    try {
      // Forțăm backend-ul să afle scorul EXACT ca să nu mai rămână blocat pe 1
      const newWins = amCastigat ? (userStats.wins || 0) + 1 : (userStats.wins || 0);

      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            actiune: 'increment-global', 
            jucator: amCastigat ? nume : null,
            scorCurent: amCastigat ? newWins : null, // Sync master cu backend-ul
            regiune: (amCastigat && userStats.regiune && userStats.regiune !== "Alege regiunea...") ? userStats.regiune.trim() : null 
        })
      });
      const data = await res.json();
      if (data.success) {
        setTotalGlobal(data.total);
        if (data.topRegiuni) setTopRegiuni(data.topRegiuni);
        if (data.topJucatori) setTopJucatori(data.topJucatori);

        if (amCastigat) {
            updateUserStats(prev => ({...prev, wins: (prev.wins || 0) + 1}));
        }
      }
    } catch (e) { console.error("Eroare la incrementare bilanț."); }
  }, [userStats.regiune, userStats.wins, nume, updateUserStats]);

  useEffect(() => {
    const savedName = localStorage.getItem("c_nume");
    const savedStats = localStorage.getItem("c_stats");
    
    if (savedName) setNumeLocal(savedName);
    
    if (savedStats) {
      try { 
        const parsed = JSON.parse(savedStats);
        const safeStats = { ...DEFAULT_STATS, ...parsed };
        setUserStats(safeStats); 
        
        if (savedName && safeStats.nume !== savedName) {
            const healedStats = { ...safeStats, nume: savedName };
            setUserStats(healedStats);
            localStorage.setItem("c_stats", JSON.stringify(healedStats));
        }
      } catch (e) {}
    } else if (savedName) {
        setUserStats(prev => ({ ...prev, nume: savedName }));
    }
    
    setIsHydrated(true);

    const getInitialData = async () => {
      try {
        const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'get-counter' }) });
        const data = await res.json();
        if (data.success) { 
          setTotalGlobal(parseInt(data.total) || 0); 
          setTopRegiuni(data.topRegiuni || []); 
          setTopJucatori(data.topJucatori || []); 
        }
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
      if (data.topJucatori) setTopJucatori(data.topJucatori); 
    });

    return () => { globalChannel.unbind_all(); pusherRef.current.unsubscribe('global'); };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || !nume || nume.length < 3) return;
    if (!pusherRef.current) return;

    const channelName = `user-notif-${nume.trim().toUpperCase()}`;
    const userChannel = pusherRef.current.subscribe(channelName);
    
    userChannel.bind('duel-request', (data) => {
      if (pathname.includes('/joc/')) return; 
      playSound('victorie'); triggerVibrate([100, 50, 100]); setNotificare(data);
      setTimeout(() => setNotificare(null), 15000);
    });

    return () => { userChannel.unbind_all(); pusherRef.current.unsubscribe(channelName); };
  }, [nume, isHydrated, pathname, playSound, triggerVibrate]);

  const contextValue = {
    totalGlobal, 
    topRegiuni, 
    topJucatori, 
    nume, 
    setNume, 
    userStats, 
    setUserStats: updateUserStats,
    playSound, triggerVibrate, incrementGlobal, isHydrated
  };

  return (
    <GlobalStatsContext.Provider value={contextValue}>
      {children}
      
      {/* =========================================================================
          NOTIFICARE PROVOCARE - CONTAINER IZOLAT CU Z-INDEX EXTREM
          ========================================================================= */}
      <div className="fixed inset-0 z-[2147483647] pointer-events-none flex justify-center items-start pt-6 md:pt-10">
          <AnimatePresence>
            {notificare && (
              <motion.div 
                initial={{ opacity: 0, y: -50, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -50, scale: 0.9 }} 
                transition={{ type: "spring", bounce: 0.5 }} 
                className="relative w-[90%] max-w-sm bg-[#0a0505] p-8 md:p-10 rounded-[3rem] border-2 border-red-900/50 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-auto"
              >
                <div className="absolute inset-0 bg-[url('/pattern-wood.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 blur-[60px] pointer-events-none z-0 bg-red-700/20"></div>

                <div className="relative z-10 text-center mt-2">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#140a0a] px-5 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-amber-500 z-10 border border-red-900/50 rounded-full animate-pulse whitespace-nowrap shadow-lg">
                    Provocare ⚔️
                  </div>
                  
                  <p className="font-black text-2xl md:text-3xl text-white italic drop-shadow-md leading-tight mt-4">
                    <span className="text-red-500">{notificare.deLa}</span> <br/> te cheamă la duel!
                  </p>
                  
                  <div className="flex flex-col gap-3 pt-8 relative z-50">
                    <button 
                      className="w-full bg-red-700 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_15px_30px_rgba(220,38,38,0.4)] active:scale-95 text-white border-2 border-red-500/50 cursor-pointer pointer-events-auto" 
                      onClick={() => { setNotificare(null); router.push(`/joc/${notificare.roomId}?host=false&skin=${userStats.skin}&teamId=${notificare.teamId || ''}`); }}
                    >
                      Acceptă
                    </button>
                    <button 
                      className="w-full bg-[#140a0a] py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest text-white/50 border-2 border-red-900/30 hover:border-red-900/50 hover:bg-red-900/20 hover:text-white transition-all active:scale-95 cursor-pointer pointer-events-auto" 
                      onClick={() => setNotificare(null)}
                    >
                      Refuză
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      {!isHydrated && (
        <div className="fixed inset-0 bg-[#050202] z-[100001] flex flex-col items-center justify-center pattern-tradition overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-700/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] bg-yellow-700/5 rounded-full blur-[150px]" />
          <div className="relative z-10 flex flex-col items-center gap-6 animate-pulse">
            <span className="text-7xl drop-shadow-[0_0_40px_rgba(220,38,38,0.8)] animate-float-v9 filter sepia-[0.3]">🥚</span>
            <div className="text-amber-500/50 text-[10px] md:text-xs font-black uppercase tracking-[1em] drop-shadow-sm">Așezăm Masa...</div>
          </div>
        </div>
      )}
    </GlobalStatsContext.Provider>
  );
}