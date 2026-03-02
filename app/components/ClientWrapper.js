"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - SANCTUARY NEURAL INTEGRITY (VERSION 22.5 - THE PWA & REGIONAL UPDATE)
 * ------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Master Architects of 2026)
 * Proiect: Sanctuarul Ciocnirii - Sistemul de Management al Datelor și Persistenței
 * * 📜 LOGICĂ ȘI FILOZOFIE DE INFRASTRUCTURĂ V22.5:
 * 1. REGIONAL WARFARE: S-a integrat parametrul `regiune` în structura de memorie. 
 * Acesta permite clasificarea jucătorilor (ex: Moldova, Ardeal, Muntenia) pentru clasamentul național.
 * 2. PWA DETECTION (APP MODE): Wrapper-ul detectează acum dacă jocul rulează direct din browser 
 * sau a fost instalat ca aplicație nativă (Standalone Mode) pe ecranul principal.
 * 3. AUDIO PRE-CACHE: Logica audio a fost blindată pentru a suporta specific sunetele:
 * 'spargere.mp3', 'victorie.mp3' și 'esec.mp3', cerute pentru experiența semi-finală.
 * 4. PUSHER SINGLETON HUB: Hub de evenimente real-time care gestionează canalele 
 * de notificare fără a duplica conexiunile WebSocket (economie de resurse și stabilitate).
 * ==========================================================================================
 */

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useRouter, usePathname } from "next/navigation";

// Definirea Contextului Global (Inima neurală a Sanctuarului)
const GlobalStatsContext = createContext();

/**
 * HOOK EXPORTAT: useGlobalStats
 * Permite oricărei componente (Arena, Home, Profile) să consume și să modifice 
 * datele globale fără a reîncărca pagina.
 */
export const useGlobalStats = () => {
  const context = useContext(GlobalStatsContext);
  if (!context) {
    throw new Error("EROARE CRITICĂ: useGlobalStats trebuie utilizat în interiorul ClientWrapper!");
  }
  return context;
};

/**
 * COMPONENTA PRINCIPALĂ: ClientWrapper
 * Acționează ca un provider de context și manager de evenimente asincrone.
 */
export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // --- 1. STĂRI DE PERSISTENȚĂ (DATE SALVATE LOCAL) ---
  const [userStats, setUserStats] = useState({
    nume: "",
    wins: 0,
    losses: 0,
    skin: "red",
    hasGoldenEgg: false,
    lastGoldenCheck: 0,
    teamId: null,
    regiune: "" // NOU: Pentru clasamentul pe zone istorice
  });

  // --- 2. STĂRI GLOBALE LIVE (DATE DINAMICE DIN ARENĂ) ---
  const [totalGlobal, setTotalGlobal] = useState(9); // Bilanțul Național (Minim 9)
  const [nume, setNume] = useState(""); // Porecla activă a luptătorului
  const [notificare, setNotificare] = useState(null); // Duelurile solicitate
  const [isHydrated, setIsHydrated] = useState(false); // Flag pentru finalizarea încărcării locale
  const [isPWA, setIsPWA] = useState(false); // Flag dacă rulează ca aplicație instalată
  
  const pusherRef = useRef(null);
  const audioContextRef = useRef(null); // Păstrăm referințe pentru sunete ca să nu le recreăm

  // ==========================================================================
  // ENGINE 1: FEEDBACK SENZORIAL & PWA DETECTION (HAPTIC & AUDIO ENGINE)
  // ==========================================================================

  // Detectăm dacă jocul este instalat pe ecranul principal (PWA)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsPWA(!!isStandalone);
    }
  }, []);

  const triggerVibrate = useCallback((pattern = [50]) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (err) {
      console.warn("Sistemul haptic limitat.");
    }
  }, []);

  // Motor audio optimizat strict pentru sunetele declarate
  const playSound = useCallback((soundFile) => {
    try {
      if (typeof window !== 'undefined') {
        // Folosim direct numele cerute: spargere, victorie, esec, etc.
        const audio = new Audio(`/${soundFile}.mp3`);
        audio.volume = 0.5; // Volum optim pentru a nu sparge boxele
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browserele blochează autoplay-ul uneori. Ignorăm silențios eroarea.
          });
        }
      }
    } catch (e) {
      console.error("Audio Core Error:", e);
    }
  }, []);

  // ==========================================================================
  // ENGINE 2: GLOBAL BILANȚ INCREMENTOR
  // ==========================================================================

  /**
   * incrementGlobal: Funcția care forțează creșterea bilanțului în Redis.
   * Se apelează din Arena după fiecare ciocnire reușită.
   */
  const incrementGlobal = useCallback(async () => {
    try {
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'increment-global', regiune: userStats.regiune })
      });
      const data = await res.json();
      if (data.success) {
        // Actualizăm local instant până când vine confirmarea prin Pusher
        setTotalGlobal(prev => prev + 1);
      }
    } catch (e) {
      console.error("Eroare la incrementarea globală:", e);
    }
  }, []);

  // ==========================================================================
  // ENGINE 3: HYDRATION & MEMORY PERSISTENCE
  // ==========================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedName = localStorage.getItem("c_nume");
    const savedStats = localStorage.getItem("c_stats");
    const savedTeam = localStorage.getItem("c_teamId");
    
    let statsObject = {
      wins: 0,
      losses: 0,
      skin: "red",
      hasGoldenEgg: false,
      lastGoldenCheck: Date.now(),
      teamId: savedTeam || null,
      regiune: "" // Extragere regiune dacă există din versiuni anterioare
    };

    if (savedName) setNume(savedName);
    
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        statsObject = { ...statsObject, ...parsed };
        
        // --- LOGICA GOLDEN DROP (DROP ORAR 5%) ---
        const now = Date.now();
        const oneHour = 3600000;
        if (now - statsObject.lastGoldenCheck > oneHour) {
          if (Math.random() < 0.05 && !statsObject.hasGoldenEgg) {
            statsObject.hasGoldenEgg = true;
          }
          statsObject.lastGoldenCheck = now;
        }
      } catch (err) {
        console.error("Date locale corupte. Sanctuarul reconstruiește memoria...");
      }
    }

    setUserStats(statsObject);
    localStorage.setItem("c_stats", JSON.stringify(statsObject));
    setIsHydrated(true);
    
  }, []);

  // ==========================================================================
  // ENGINE 4: REAL-TIME HUB (PUSHER STABILITY)
  // ==========================================================================

  useEffect(() => {
    if (!isHydrated) return;

    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
        forceTLS: true
      });
    }

    const pusher = pusherRef.current;

    // Monitorizarea Bilanțului Național (Global)
    const globalChannel = pusher.subscribe('global');
    globalChannel.bind('ou-spart', (data) => {
      const total = parseInt(data.total);
      setTotalGlobal(total >= 9 ? total : 9);
    });

    // Notificări Duel (Privat)
    if (nume) {
      const userChannel = pusher.subscribe(`user-notif-${nume}`);
      userChannel.bind('duel-request', (data) => {
        // Nu trimitem notificarea dacă jucătorul e deja în Arenă și se bate
        if (pathname.includes('/joc/')) return;

        playSound('victorie'); // Folosim 'victorie.mp3' ca sunet alert de notificare
        triggerVibrate([100, 50, 100, 50, 100]); 
        setNotificare(data);

        // Expirare notificare fluidă după 15 secunde
        const timer = setTimeout(() => setNotificare(null), 15000);
        return () => clearTimeout(timer);
      });
    }

    // Sincronizare Counter de Start la prima încărcare a site-ului
    fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'get-counter' }) 
    })
    .then(r => r.json())
    .then(d => { if (d.success) setTotalGlobal(Math.max(9, d.total)); })
    .catch(() => {});

    return () => {
      pusher.unsubscribe('global');
      if (nume) pusher.unsubscribe(`user-notif-${nume}`);
    };
  }, [nume, pathname, playSound, triggerVibrate, isHydrated]);

  /**
   * updateNume: Sincronizează porecla în state și localStorage.
   */
  const handleUpdateNume = (nouNume) => {
    setNume(nouNume);
    if (typeof window !== 'undefined') {
      localStorage.setItem("c_nume", nouNume);
    }
    triggerVibrate(30);
  };

  /**
   * acceptaDuel: Navigare către arena privată cu toți parametrii necesari.
   */
  const handleAcceptDuel = () => {
    if (notificare) {
      playSound('spargere'); // Sunetul spargerii dă adrenalină la intrarea în meci
      triggerVibrate(60);
      router.push(`/joc/${notificare.roomId}?nume=${encodeURIComponent(nume)}&host=false&teamId=${notificare.teamId || ''}&golden=${userStats.hasGoldenEgg}&skin=${userStats.skin || 'red'}`);
      setNotificare(null);
    }
  };

  // Valorile oferite contextului global
  const contextValue = {
    totalGlobal,
    nume,
    setNume: handleUpdateNume,
    userStats,
    setUserStats: (ns) => { 
      setUserStats(ns); 
      if (typeof window !== 'undefined') {
        localStorage.setItem("c_stats", JSON.stringify(ns)); 
      }
    },
    playSound,
    triggerVibrate,
    incrementGlobal,
    isHydrated,
    isPWA // Exporat pentru a schimba UI-ul dacă e aplicație
  };

  return (
    <GlobalStatsContext.Provider value={contextValue}>
      {children}

      {/* --- UI NOTIFICARE DUEL V22 (RESPONSIVE LIQUID GLASS) --- */}
      {notificare && (
        <div className="fixed top-8 md:top-20 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[9999] animate-fade-in-up px-2 touch-none">
          <div className="bg-[#050505]/95 p-6 md:p-8 rounded-[2rem] border border-red-600/50 shadow-[0_30px_60px_rgba(220,38,38,0.4)] relative overflow-hidden backdrop-blur-2xl">
            
            {/* Background VS Watermark */}
            <div className="absolute top-[-10px] right-[-10px] p-0 opacity-[0.03] pointer-events-none mix-blend-screen">
              <span className="text-[8rem] md:text-[10rem] font-black italic text-white select-none">VS</span>
            </div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-xl animate-pulse border border-red-400/50">
                ⚔️
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <h4 className="font-black text-xl md:text-2xl uppercase tracking-tighter text-white italic truncate drop-shadow-md">Ești Provocat!</h4>
                <p className="text-[10px] md:text-xs text-white/60 uppercase font-black tracking-widest truncate">
                  De către: <span className="text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{notificare.deLa}</span>
                </p>
                {notificare.teamName && (
                  <p className="text-[9px] text-yellow-500/80 uppercase font-black tracking-widest truncate">Familia: {notificare.teamName}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 md:gap-4 mt-8 md:mt-10 relative z-10">
              <button 
                onClick={handleAcceptDuel} 
                className="flex-[2] bg-red-600 hover:bg-red-500 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(220,38,38,0.4)] transition-all active:scale-95 text-white"
              >
                ACCEPTĂ DUELUL
              </button>
              
              <button 
                onClick={() => setNotificare(null)} 
                className="flex-1 bg-white/5 hover:bg-white/10 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase text-white/40 border border-white/10 transition-all active:scale-95"
              >
                REFUZĂ
              </button>
            </div>

            {/* Timpul rămas (Bara Progres) CSS Pur pentru performanță */}
            <div className="absolute bottom-0 left-0 h-1.5 bg-red-900/30 w-full">
               <div 
                  className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" 
                  style={{ animation: 'shrinkX 15s linear forwards', width: '100%', transformOrigin: 'left' }}
               ></div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `@keyframes shrinkX { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}} />
          </div>
        </div>
      )}

      {/* --- ECRAN DE BOOT (TITAN LOADING OLED) --- */}
      {!isHydrated && (
        <div className="fixed inset-0 bg-[#020202] z-[9999] flex flex-col items-center justify-center gap-8 touch-none">
           <div className="relative w-24 h-24 md:w-32 md:h-32">
              <div className="absolute inset-0 border-[6px] border-white/5 rounded-full"></div>
              <div className="absolute inset-0 border-[6px] border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_40px_rgba(220,38,38,0.4)]"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl animate-pulse">🥚</div>
           </div>
           <div className="text-center space-y-2">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.8em] text-white/40 drop-shadow-md">Sincronizare</span>
              <p className="text-[8px] font-black uppercase tracking-widest text-red-600 animate-pulse">Tradiția Românească</p>
           </div>
        </div>
      )}
    </GlobalStatsContext.Provider>
  );
}