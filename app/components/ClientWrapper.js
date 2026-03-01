"use client";
"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - TITAN CENTRAL NERVOUS SYSTEM (VERSION 7.0 - THE GOLDEN CORE)
 * ------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (Collaboration Engine)
 * Proiect: Arena Națională de Ciocnit Ouă Online 2026
 * * 📜 ARCHITECTURE OVERVIEW:
 * 1. GLOBAL STATE PROVIDER: Distribuie statisticile persistente către toate paginile.
 * 2. APP PERSISTENCE: Monitorizează și salvează 'userStats' în timp real (LocalStorage).
 * 3. HOURLY GOLDEN DROP: Algoritm de calcul pentru drop-ul de ou legendar (5% șansă/oră).
 * 4. PUSHER REAL-TIME HUB: Gestionează notificările de duel și bilanțul național.
 * 5. FEEDBACK ENGINE: Sistem haptic (vibrator) și audio optimizat pentru experiență App.
 * ==========================================================================================
 */

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useRouter, usePathname } from "next/navigation";

// Definirea Contextului Global (Inima datelor aplicației)
const GlobalStatsContext = createContext();

/**
 * HOOK EXPORTAT: useGlobalStats
 * Interfața prin care paginile (page.js, arena) comunică cu acest nucleu central.
 */
export const useGlobalStats = () => {
  const context = useContext(GlobalStatsContext);
  if (!context) {
    throw new Error("EROARE CRITICĂ: useGlobalStats a fost apelat în afara ClientWrapper!");
  }
  return context;
};

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // --- 1. STĂRI DE PERSISTENȚĂ (DATE SALVATE PE TELEFON) ---
  const [userStats, setUserStats] = useState({
    nume: "",
    wins: 0,
    losses: 0,
    skin: "red",
    hasGoldenEgg: false,
    lastGoldenCheck: 0
  });

  // --- 2. STĂRI GLOBALE LIVE ---
  const [totalGlobal, setTotalGlobal] = useState(9); // Bilanțul național (minim 9)
  const [nume, setNume] = useState(""); // Shortcut pentru acces rapid la poreclă
  const [notificare, setNotificare] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const pusherRef = useRef(null);

  // ==========================================================================
  // ENGINE 1: FEEDBACK (VIBRAȚII ȘI SUNETE)
  // ==========================================================================

  /**
   * triggerVibrate: Declanșează vibrația telefonului.
   * Pattern implicit: [50ms] pentru feedback tactil de tip "click".
   */
  const triggerVibrate = useCallback((pattern = [50]) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (err) {
      console.warn("Haptic system disabled on this device.");
    }
  }, []);

  /**
   * playSound: Redă fișiere audio din directorul /public/sunete.
   */
  const playSound = useCallback((soundFile) => {
    try {
      const audio = new Audio(`/sunete/${soundFile}.mp3`);
      audio.volume = 0.5;
      audio.play().catch((e) => {
        // Fallback pentru browserele care blochează sunetul fără gestul userului
        console.log("Audio waiting for interaction...");
      });
    } catch (e) {
      console.error("Audio Engine Error:", e);
    }
  }, []);

  // ==========================================================================
  // ENGINE 2: APP HYDRATION & GOLDEN DROP LOGIC
  // ==========================================================================

  useEffect(() => {
    // ÎNCĂRCARE DATE DIN LOCALSTORAGE (Tine minte tot)
    const savedName = localStorage.getItem("c_nume");
    const savedStats = localStorage.getItem("c_stats");
    
    let currentStats = {
      wins: 0,
      losses: 0,
      skin: "red",
      hasGoldenEgg: false,
      lastGoldenCheck: Date.now()
    };

    if (savedName) setNume(savedName);
    
    if (savedStats) {
      currentStats = JSON.parse(savedStats);
      
      // --- LOGICA DROP ORAR (OU DE AUR) ---
      const now = Date.now();
      const oneHour = 3600000; // milisecunde

      if (now - currentStats.lastGoldenCheck > oneHour) {
        // Șansă de 5% la fiecare oră să primești oul de aur gratuit
        const winDrop = Math.random() < 0.05;
        if (winDrop && !currentStats.hasGoldenEgg) {
          currentStats.hasGoldenEgg = true;
          // Notificarea se va declanșa pe pagina Home prin verificarea stării
        }
        currentStats.lastGoldenCheck = now;
      }
      
      setUserStats(currentStats);
      localStorage.setItem("c_stats", JSON.stringify(currentStats));
    } else {
      // Inițializare pentru utilizator nou
      localStorage.setItem("c_stats", JSON.stringify(currentStats));
      setUserStats(currentStats);
    }

    setIsHydrated(true);
  }, []);

  // ==========================================================================
  // ENGINE 3: REAL-TIME HUB (PUSHER)
  // ==========================================================================

  useEffect(() => {
    if (!isHydrated) return;

    // Inițializare instanță Pusher (Singleton)
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
        forceTLS: true
      });
    }

    const pusher = pusherRef.current;

    // 1. Canal Global (Bilanț Național)
    const globalChannel = pusher.subscribe('global');
    globalChannel.bind('ou-spart', (data) => {
      // Actualizăm numărul total, asigurându-ne că nu scade sub 9
      setTotalGlobal(Math.max(9, parseInt(data.total)));
    });

    // 2. Canal Personal (Provocări Duel)
    if (nume) {
      const userChannel = pusher.subscribe(`user-notif-${nume}`);
      userChannel.bind('duel-request', (data) => {
        // Dacă suntem deja într-un meci, blocăm notificările externe
        if (pathname.includes('/joc/')) return;

        playSound('notificare');
        triggerVibrate([150, 50, 150]);
        setNotificare(data);

        // Auto-close notificare după 15 secunde
        const timer = setTimeout(() => setNotificare(null), 15000);
        return () => clearTimeout(timer);
      });
    }

    // Luăm bilanțul inițial de la API Redis
    fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'get-counter' }) 
    })
    .then(r => r.json())
    .then(d => { 
      if (d.success) setTotalGlobal(Math.max(9, d.total)); 
    });

    return () => {
      pusher.unsubscribe('global');
      if (nume) pusher.unsubscribe(`user-notif-${nume}`);
    };
  }, [nume, pathname, playSound, triggerVibrate, isHydrated]);

  /**
   * Logica de salvare a numelui și sincronizare instantanee
   */
  const updateNume = (nouNume) => {
    setNume(nouNume);
    localStorage.setItem("c_nume", nouNume);
  };

  const acceptaDuel = () => {
    if (notificare) {
      router.push(`/joc/${notificare.roomId}?nume=${encodeURIComponent(nume)}&host=false&teamId=${notificare.teamId || ''}&golden=${userStats.hasGoldenEgg}`);
      setNotificare(null);
    }
  };

  // Oferim contextul către restul aplicației
  const contextValue = {
    totalGlobal,
    nume,
    setNume: updateNume,
    userStats,
    setUserStats,
    playSound,
    triggerVibrate,
    isHydrated
  };

  return (
    <GlobalStatsContext.Provider value={contextValue}>
      {children}

      {/* --- UI NOTIFICARE PROVOCARE (MODERN TITAN) --- */}
      {notificare && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-[2000] animate-pop px-4">
          <div className="glass-panel p-8 rounded-[3rem] border-2 border-red-600 shadow-[0_30px_90px_rgba(220,38,38,0.5)] bg-black/95 backdrop-blur-3xl relative overflow-hidden">
            
            {/* Element Decorativ de fundal */}
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
              <span className="text-9xl">⚔️</span>
            </div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-5xl shadow-2xl animate-bounce">
                🛡️
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-black text-2xl uppercase tracking-tighter text-white italic">Duel Solicitat!</h4>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em]">
                  Luptător: <span className="text-red-500">{notificare.deLa}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-10 relative z-10">
              <button 
                onClick={acceptaDuel} 
                className="flex-[2] bg-red-600 hover:bg-red-500 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all active:scale-95 text-white"
              >
                ACCEPTĂ PROVOCAREA ✅
              </button>
              <button 
                onClick={() => setNotificare(null)} 
                className="flex-1 bg-white/5 py-6 rounded-2xl font-black text-[10px] uppercase text-white/20 border border-white/10 hover:bg-white/10 transition-colors"
              >
                IGNORĂ
              </button>
            </div>

            {/* Bara de progres a expirării notificării */}
            <div className="absolute bottom-0 left-0 h-1 bg-red-600/30 w-full">
               <div className="h-full bg-red-600 animate-shrink" style={{ animationDuration: '15s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* --- OVERLAY DE ÎNCĂRCARE (Dacă persistenta nu e gata) --- */}
      {!isHydrated && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center gap-6">
           <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20">Sincronizare Titan...</span>
        </div>
      )}
    </GlobalStatsContext.Provider>
  );
}

/**
 * ==========================================================================================
 * SUMAR ACTUALIZARE 7.0 (CLIENT CORE):
 * 1. Persistență: Folosește 'isHydrated' pentru a preveni erorile de randare pe server.
 * 2. Golden Logic: Rulează automat drop-ul orar și îl salvează în localStorage.
 * 3. Feedback: 'triggerVibrate' și 'playSound' sunt acum centralizate și sigure.
 * 4. UX: Notificare de provocare îmbunătățită cu bară de expirare și design ultra-glass.
 * 5. Securitate: Bilanțul național este protejat de pragul de 9 ouă.
 * ==========================================================================================
 */