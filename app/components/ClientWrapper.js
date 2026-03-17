"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - NUCLEUL LOGIC (V30.5 - SYNC MASTER & SCOR CENTRALIZAT SERVER-SIDE)
 * ====================================================================================================
 */

import { useEffect, useState, useSyncExternalStore, createContext, useContext, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
const GlobalStatsContext = createContext();
export const useGlobalStats = () => useContext(GlobalStatsContext);

const DEFAULT_STATS = { nume: "", wins: 0, losses: 0, skin: "red", teamId: null, regiune: "Muntenia" };
const emptySubscribe = () => () => {};

// Safe localStorage wrapper — fallback for private browsing, blocked storage, etc.
const safeLS = {
  get: (key) => { try { return typeof window !== 'undefined' ? localStorage.getItem(key) : null; } catch { return null; } },
  set: (key, val) => { try { if (typeof window !== 'undefined') localStorage.setItem(key, val); } catch {} },
  del: (key) => { try { if (typeof window !== 'undefined') localStorage.removeItem(key); } catch {} },
};

export default function ClientWrapper({ children }) {
  const router = useRouter();

  const [userStats, setUserStats] = useState(() => {
    const savedStats = safeLS.get("c_stats");
    const savedName = safeLS.get("c_nume");
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        const safeStats = { ...DEFAULT_STATS, ...parsed };
        if (savedName && safeStats.nume !== savedName) {
          const healed = { ...safeStats, nume: savedName };
          safeLS.set("c_stats", JSON.stringify(healed));
          return healed;
        }
        return safeStats;
      } catch {}
    }
    if (savedName) return { ...DEFAULT_STATS, nume: savedName };
    return DEFAULT_STATS;
  });
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [topRegiuni, setTopRegiuni] = useState([]);
  const [topJucatori, setTopJucatori] = useState([]);
  const [nume, setNumeLocal] = useState(() => {
    return safeLS.get("c_nume") || "";
  });
  const [notificare, setNotificare] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const pusherRef = useRef(null);
  const visitorIdRef = useRef(null);

  // Inițializare Pusher o singură dată — disconnect la unmount
  useEffect(() => {
    const forceTLS = process.env.NEXT_PUBLIC_PUSHER_TLS === 'true';
    const wsPort = parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || '6001');
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: 'eu',
      wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || undefined,
      wsPort: wsPort,
      wssPort: wsPort,
      forceTLS: forceTLS,
      disableStats: true,
      enabledTransports: ['ws', 'wss', 'xhr_streaming', 'xhr_polling'],
    });
    return () => {
      pusherRef.current?.disconnect();
      pusherRef.current = null;
    };
  }, []);

  const triggerVibrate = useCallback((pattern = [50]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const playSound = useCallback((soundFile) => {
    try { const audio = new Audio(`/${soundFile}.mp3`); audio.volume = 0.4; audio.play().catch(() => {}); } catch (e) {}
  }, []);

  const updateUserStats = useCallback((newStats) => {
    setUserStats(prevStats => {
      const updated = typeof newStats === 'function' ? newStats(prevStats) : newStats;
      safeLS.set("c_stats", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateStats = useCallback(async (type) => {
    if (!nume) return;
    try {
      await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'update-stats', jucator: nume, text: type })
      });
    } catch (e) {}
  }, [nume]);

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
      const storedTeamIds = JSON.parse(safeLS.get("c_teamIds") || "[]");
      const scorCurent = JSON.parse(safeLS.get("c_stats") || "{}").wins || 0;

      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actiune: 'schimba-porecla',
          oldName: nume, 
          newName: cleanName,
          teamIds: storedTeamIds, 
          scor: scorCurent // Aici păstrăm scorul curent local doar pentru migrarea pe noul nume
        })
      });
      const data = await res.json();
      
      if (!data.success) {
        alert(data.error || "Acel nume este deja luat! Alege altul.");
        return false;
      }

      setNumeLocal(cleanName);
      safeLS.set("c_nume", cleanName);
      setUserStats(prev => {
         const nextStats = { ...prev, nume: cleanName };
         safeLS.set("c_stats", JSON.stringify(nextStats));
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
  // INCREMENTARE SCOR (CLEAN & BULLETPROOF)
  // ==========================================================================
  const incrementGlobal = useCallback(async (amCastigat = false, teamIdToUpdate = null) => {
    try {
      if (!nume || nume.trim() === "") return;

      // Serverul va număra automat lovitura totală, dar va da +1 la victorie DOAR dacă îi dăm jucătorul
      const payload = { 
        actiune: 'increment-global', 
        jucator: amCastigat ? nume : null, // Dacă nu a câștigat, nu trimitem numele ca să nu i se pună victorie
        regiune: (amCastigat && userStats.regiune && userStats.regiune !== "Alege regiunea...") ? userStats.regiune.trim() : null,
        teamId: amCastigat ? teamIdToUpdate : null // Trimitem ID-ul grupului curent ca să îi crească scorul acolo
      };

      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setTotalGlobal(data.total);
        if (data.topRegiuni) setTopRegiuni(data.topRegiuni);
        if (data.topJucatori) setTopJucatori(data.topJucatori);

        // UI Update: Creștem instant victoria în interfață ca să nu existe delay
        if (amCastigat) {
            updateUserStats(prev => ({...prev, wins: (prev.wins || 0) + 1}));
        }
      }
    } catch (e) { console.error("Eroare la incrementare bilanț."); }
  }, [userStats.regiune, nume, updateUserStats]);

  // HEARTBEAT: ping la fiecare 10s pentru a număra utilizatorii activi
  useEffect(() => {
    if (!isHydrated) return;
    if (!visitorIdRef.current) {
      visitorIdRef.current = safeLS.get('c_visitorId') || `v-${Math.random().toString(36).substring(2, 10)}`;
      safeLS.set('c_visitorId', visitorIdRef.current);
    }
    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actiune: 'arena-heartbeat', visitorId: visitorIdRef.current })
        });
        const data = await res.json();
        if (data.success && typeof data.online === 'number') setOnlineCount(data.online);
      } catch {}
    };
    const sendDisconnect = () => {
      try {
        const payload = JSON.stringify({ actiune: 'arena-disconnect', visitorId: visitorIdRef.current });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/ciocnire', new Blob([payload], { type: 'application/json' }));
        } else {
          fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
        }
      } catch {}
    };
    // Trimite heartbeat instant la montare
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 10000);

    // Când user-ul revine pe tab → heartbeat instant (actualizare imediată)
    const onVisibility = () => { if (document.visibilityState === 'visible') sendHeartbeat(); };
    document.addEventListener('visibilitychange', onVisibility);

    // Când user-ul închide tab-ul → scoate-l din lista instant
    window.addEventListener('beforeunload', sendDisconnect);
    // Și pe pagehide (mobil - Safari)
    window.addEventListener('pagehide', sendDisconnect);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', sendDisconnect);
      window.removeEventListener('pagehide', sendDisconnect);
      sendDisconnect();
    };
  }, [isHydrated]);

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'get-counter' }) });
        const data = await res.json();
        if (data.success) {
          setTotalGlobal(parseInt(data.total) || 0);
          setTopRegiuni(data.topRegiuni || []);
          setTopJucatori(data.topJucatori || []);
          if (typeof data.online === 'number') setOnlineCount(data.online);
        }
      } catch (err) {}
    };
    getInitialData();
  }, []);

  useEffect(() => {
    if (!isHydrated || !pusherRef.current) return;

    const channel = pusherRef.current.subscribe('global');
    channel.bind('update-complet', (data) => {
      if (data.total !== undefined) setTotalGlobal(parseInt(data.total));
      if (data.topRegiuni) setTopRegiuni(data.topRegiuni);
      if (data.topJucatori) setTopJucatori(data.topJucatori);
    });
    channel.bind('online-count', (data) => {
      if (typeof data.online === 'number') setOnlineCount(data.online);
    });

    return () => {
      channel.unbind_all();
      pusherRef.current?.unsubscribe('global');
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || !nume || !pusherRef.current) return;

    const channelName = `user-notif-${nume}`;
    const channel = pusherRef.current.subscribe(channelName);
    let notifTimer = null;
    channel.bind('duel-request', (data) => {
      setNotificare({ deLa: data.deLa, roomId: data.roomId, teamId: data.teamId || null });
      triggerVibrate([100, 50, 100, 50, 200]);
      playSound('hit');
      if (notifTimer) clearTimeout(notifTimer);
      notifTimer = setTimeout(() => setNotificare(null), 20000);
    });

    return () => {
      if (notifTimer) clearTimeout(notifTimer);
      channel.unbind_all();
      pusherRef.current?.unsubscribe(channelName);
    };
  }, [isHydrated, nume, playSound, triggerVibrate]);

  const contextValue = {
    totalGlobal,
    topRegiuni,
    topJucatori,
    nume,
    setNume,
    userStats,
    setUserStats: updateUserStats,
    playSound, triggerVibrate, incrementGlobal, isHydrated,
    updateStats,
    onlineCount
  };

  return (
    <GlobalStatsContext.Provider value={contextValue}>
      {children}
      
      {/* Container izolat pentru notificări */}
      <div className="fixed inset-0 z-[2147483647] pointer-events-none flex justify-center items-start pt-6 md:pt-10">
          <AnimatePresence>
            {notificare && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="relative w-[90%] max-w-sm bg-[#141111] p-8 md:p-10 rounded-3xl border border-red-900/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto"
              >
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center gap-2 bg-red-900/30 px-4 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-red-400 rounded-full mb-4">
                    ⚔️ Provocare
                  </div>

                  <p className="font-black text-2xl md:text-3xl text-white leading-tight">
                    <span className="text-red-500">{notificare.deLa}</span> <br/> te cheamă la duel!
                  </p>

                  <div className="flex flex-col gap-3 pt-6 relative z-50">
                    <button
                      className="w-full bg-red-700 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-900/30 active:scale-95 text-white cursor-pointer pointer-events-auto"
                      onClick={() => { setNotificare(null); router.push(`/joc/${notificare.roomId}?host=false&skin=${userStats.skin}&teamId=${notificare.teamId || ''}`); }}
                    >
                      Acceptă
                    </button>
                    <button
                      className="w-full bg-white/[0.05] py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-500 hover:bg-white/[0.08] hover:text-gray-300 transition-all active:scale-95 cursor-pointer pointer-events-auto"
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
        <div className="fixed inset-0 bg-[#0c0a0a] z-[100001] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-5">
            <span className="text-8xl animate-bounce">🥚</span>
            <p className="text-sm font-black text-red-500 uppercase tracking-[0.4em] animate-pulse">Se încarcă...</p>
          </div>
        </div>
      )}
    </GlobalStatsContext.Provider>
  );
}