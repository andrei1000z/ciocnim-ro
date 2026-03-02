"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - SISTEMUL CENTRAL DE STARE ȘI SINCRONIZARE (VERSION 22.0 - THE NATIONAL AWAKENING)
 * ====================================================================================================
 * Proiect: Platformă de ciocnit ouă virtuale, optimizată SEO și UX.
 * Tehnologii: React 19 (Context API), Next.js 16 (App Router), Pusher-JS (WebSockets).
 * * * * 📜 DESCRIEREA ARHITECTURII ACESTUI FIȘIER:
 * Acest fișier reprezintă "memoria" și "sistemul nervos" al întregii aplicații. El rulează
 * o singură dată (la încărcarea site-ului) și învelește toate celelalte pagini (declarat în layout.js).
 * Orice componentă din site poate accesa datele de aici folosind `useGlobalStats()`.
 * * * * 🛠️ FUNCȚIONALITĂȚI ȘI OPTIMIZĂRI CRITICE APLICATE PENTRU V22:
 * 1. PERSISTENȚA DATELOR (LocalStorage Sync): Salvăm instant numele, culoarea oului, scorul și echipa. 
 * Hydration-ul este protejat cu try/catch pentru a preveni crash-uri de la JSON-uri vechi/corupte.
 * 2. BILANȚUL NAȚIONAL LIVE (Global Incrementor): Funcția `incrementGlobal` face push în Redis,
 * iar Pusher distribuie numărul actualizat către toți utilizatorii din România, în timp real.
 * 3. SISTEMUL DE NOTIFICĂRI: Interceptăm provocările la duel (WebSockets) și afișăm un pop-up 
 * "Tech Primitive" peste orice pagină. Bara de timp scade fluid timp de 15 secunde.
 * 4. FEEDBACK SENZORIAL (Audio & Haptic): Centralizarea `playSound` și `triggerVibrate`.
 * Am adăugat protecții specifice pentru politicile stricte de autoplay de pe iOS Safari.
 * ====================================================================================================
 */

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useRouter, usePathname } from "next/navigation";

// Inițializarea Contextului Global React
const GlobalStatsContext = createContext();

/**
 * HOOK EXPORTAT: useGlobalStats
 * Permite oricărei pagini (Acasă, Arena) să citească și să modifice datele utilizatorului.
 * @returns {Object} Un obiect care conține state-ul global și funcțiile de update.
 */
export const useGlobalStats = () => {
  const context = useContext(GlobalStatsContext);
  if (!context) {
    throw new Error("EROARE CRITICĂ: useGlobalStats trebuie folosit DOAR în interiorul componentelor învelite de ClientWrapper!");
  }
  return context;
};

/**
 * COMPONENTA PRINCIPALĂ: ClientWrapper
 * Acționează ca un provider de context și manager principal de evenimente asincrone.
 */
export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // ==========================================
  // 1. STĂRI DE PERSISTENȚĂ (Datele Jucătorului)
  // ==========================================
  const [userStats, setUserStats] = useState({
    nume: "",
    wins: 0,
    losses: 0,
    skin: "red",
    hasGoldenEgg: false, // Mecanism de noroc (Loot Drop / Easter Egg)
    lastGoldenCheck: 0,
    teamId: null
  });

  // ==========================================
  // 2. STĂRI GLOBALE LIVE (Comune pentru toți jucătorii)
  // ==========================================
  const [totalGlobal, setTotalGlobal] = useState(0); 
  const [nume, setNume] = useState(""); 
  const [notificare, setNotificare] = useState(null); 
  const [isHydrated, setIsHydrated] = useState(false); 
  
  // Referință către conexiunea Pusher pentru a nu crea multiple instanțe.
  const pusherRef = useRef(null);

  // ==========================================================================
  // ENGINE 1: FEEDBACK SENZORIAL (Haptic & Audio)
  // ==========================================================================

  /**
   * Declanșează vibrația telefonului (Haptic Feedback) pe Android/PWA.
   * iOS blochează vibrația prin JS în browser, dar UI-ul preia greutatea vizual.
   */
  const triggerVibrate = useCallback((pattern = [50]) => {
    try {
      if (typeof window !== 'undefined' && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (err) {
      console.warn("Sistemul de vibrații limitat de dispozitiv.");
    }
  }, []);

  /**
   * Redă asincron un fișier audio. Protejat împotriva erorilor de Autoplay.
   */
  const playSound = useCallback((soundFile) => {
    try {
      if (typeof window !== 'undefined') {
        const audio = new Audio(`/${soundFile}.mp3`); // Tragem fișierele din rădăcina folderului public/
        audio.volume = 1.0; 
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Log silențios pentru browserele care necesită interacțiune înainte de sunet
          });
        }
      }
    } catch (e) {}
  }, []);

  // ==========================================================================
  // ENGINE 2: BILANȚUL NAȚIONAL (Global Incrementor)
  // ==========================================================================
  
  /**
   * Forțează creșterea Bilanțului Național în Redis.
   * Apelat din Arenă la fiecare victorie/impact.
   */
  const incrementGlobal = useCallback(async () => {
    try {
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'increment-global' })
      });
      const data = await res.json();
      if (data.success) {
        // Feedback vizual instant, serverul confirmă pe fundal
        setTotalGlobal(prev => prev + 1);
      }
    } catch (e) {
      console.error("Eroare Critică Incrementare:", e);
    }
  }, []);

  // ==========================================================================
  // ENGINE 3: ÎNCĂRCAREA DATELOR SALVATE (Hydration)
  // ==========================================================================

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem("c_nume");
      const savedStats = localStorage.getItem("c_stats");
      const savedTeam = localStorage.getItem("c_teamId");
      
      let statsObject = {
        wins: 0,
        losses: 0,
        skin: "red",
        hasGoldenEgg: false,
        lastGoldenCheck: Date.now(),
        teamId: savedTeam || null
      };

      if (savedName) setNume(savedName);
      
      if (savedStats) {
        try {
          const parsed = JSON.parse(savedStats);
          statsObject = { ...statsObject, ...parsed };
          
          // --- LOGICA DE DROP PENTRU OUL DE AUR (GAMIFICATION) ---
          // Jucătorul are 5% șanse pe oră să primească skin-ul special de aur.
          const now = Date.now();
          const oOraInMilisecunde = 3600000;
          
          if (now - statsObject.lastGoldenCheck > oOraInMilisecunde) {
            if (Math.random() < 0.05 && !statsObject.hasGoldenEgg) {
              statsObject.hasGoldenEgg = true;
            }
            statsObject.lastGoldenCheck = now;
          }
        } catch (err) {
          console.warn("Date locale corupte. Rescriem structura sigură de memorie.");
        }
      }

      setUserStats(statsObject);
      localStorage.setItem("c_stats", JSON.stringify(statsObject));
      
      setIsHydrated(true);
    }
  }, []);

  // ==========================================================================
  // ENGINE 4: CONEXIUNEA WEBSOCKETS (Pusher Hub)
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

    // 1. CANALUL GLOBAL: Actualizăm Bilanțul Național în timp real.
    const canalGlobal = pusher.subscribe('global');
    canalGlobal.bind('ou-spart', (data) => {
      const totalDinBazaDeDate = parseInt(data.total);
      if (!isNaN(totalDinBazaDeDate)) {
        setTotalGlobal(totalDinBazaDeDate);
      }
    });

    // 2. CANALUL PERSONAL: Interceptăm cererile de duel.
    if (nume) {
      const canalPersonal = pusher.subscribe(`user-notif-${nume}`);
      canalPersonal.bind('duel-request', (data) => {
        // Ignorăm notificarea dacă suntem deja în Arenă
        if (pathname.includes('/joc/')) return;

        playSound('victorie'); // Folosim un sunet alertant
        triggerVibrate([100, 50, 100, 50, 100]); 
        setNotificare(data);

        // Auto-închidere după 15 secunde
        const timer = setTimeout(() => setNotificare(null), 15000);
        return () => clearTimeout(timer);
      });
    }

    // 3. GET COUNTER INIȚIAL: Fetch atomic din Redis la vizitarea site-ului
    fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'get-counter' }) 
    })
    .then(r => r.json())
    .then(d => { 
      if (d.success) setTotalGlobal(Math.max(0, d.total)); 
    })
    .catch(() => {});

    return () => {
      pusher.unsubscribe('global');
      if (nume) pusher.unsubscribe(`user-notif-${nume}`);
    };
  }, [nume, pathname, playSound, triggerVibrate, isHydrated]);

  /**
   * Funcție care actualizează numele în memorie (State + LocalStorage) 
   * și declanșează o vibrație pentru confirmare tactilă.
   */
  const handleUpdateNume = (nouNume) => {
    setNume(nouNume);
    if (typeof window !== 'undefined') {
      localStorage.setItem("c_nume", nouNume);
    }
    triggerVibrate(30);
  };

  /**
   * Direcționează utilizatorul spre arena privată unde este așteptat.
   */
  const handleAcceptDuel = () => {
    if (notificare) {
      playSound('spargere'); 
      triggerVibrate(60);
      const url = `/joc/${notificare.roomId}?nume=${encodeURIComponent(nume)}&host=false&teamId=${notificare.teamId || ''}&golden=${userStats.hasGoldenEgg}&skin=${userStats.skin || 'red'}`;
      router.push(url);
      setNotificare(null); 
    }
  };

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
    isHydrated
  };

  return (
    <GlobalStatsContext.Provider value={contextValue}>
      {children}

      {/* ========================================================================== */}
      {/* UI NOTIFICARE DUEL (V22 OLED REDESIGN)                                     */}
      {/* ========================================================================== */}
      {notificare && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-[9999] animate-fade-in-up px-2 touch-none">
          
          <div className="bg-[#050505]/95 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-red-600/50 shadow-[0_30px_60px_rgba(220,38,38,0.25)] relative overflow-hidden backdrop-blur-2xl">
            
            {/* Watermark Fundal */}
            <div className="absolute top-[-10px] right-[-10px] p-0 opacity-[0.03] pointer-events-none mix-blend-screen">
              <span className="text-[8rem] md:text-[10rem] font-black italic text-white select-none">VS</span>
            </div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-3xl md:text-4xl shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse select-none border border-red-400/50">
                ⚔️
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <h4 className="font-black text-xl md:text-2xl uppercase tracking-tighter text-white italic truncate drop-shadow-md">Ești Provocat!</h4>
                <p className="text-[10px] md:text-xs text-white/60 uppercase font-bold tracking-[0.2em] md:tracking-[0.3em] truncate">
                  De Către: <span className="text-red-500 font-black drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{notificare.deLa}</span>
                </p>
                {notificare.teamName && (
                  <p className="text-[9px] md:text-[10px] text-yellow-500/80 uppercase font-black tracking-widest truncate">Familia: {notificare.teamName}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 md:gap-4 mt-8 md:mt-10 relative z-10">
              <button 
                onClick={handleAcceptDuel} 
                className="flex-[2] bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-95 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(220,38,38,0.4)] transition-all text-white border border-red-500/50"
              >
                ACCEPTĂ DUELUL
              </button>
              
              <button 
                onClick={() => setNotificare(null)} 
                className="flex-1 bg-white/5 hover:bg-white/10 active:scale-95 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest text-white/40 border border-white/10 transition-all hover:text-white"
              >
                Refuză
              </button>
            </div>

            {/* Bara de progres vizuală (15 secunde CSS Animation) */}
            <div className="absolute bottom-0 left-0 h-1.5 md:h-2 bg-red-900/30 w-full">
               <div 
                  className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" 
                  style={{ animation: 'shrinkX 15s linear forwards', width: '100%', transformOrigin: 'left' }}
               ></div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              @keyframes shrinkX {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
              }
            `}} />
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* ECRANUL DE ÎNCĂRCARE (BOOT SCREEN V22 OLED)                               */}
      {/* ========================================================================== */}
      {!isHydrated && (
        <div className="fixed inset-0 bg-[#020202] z-[9999] flex flex-col items-center justify-center gap-8 touch-none">
           <div className="relative w-24 h-24 md:w-32 md:h-32">
              <div className="absolute inset-0 border-[6px] border-white/5 rounded-full"></div>
              <div className="absolute inset-0 border-[6px] border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_40px_rgba(220,38,38,0.4)]"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl select-none animate-pulse">🥚</div>
           </div>
           <div className="text-center space-y-2">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.6em] md:tracking-[0.8em] text-white/40 drop-shadow-md">Sincronizare</span>
              <p className="text-[8px] font-black uppercase tracking-widest text-red-600 animate-pulse">Tradiția Românească</p>
           </div>
        </div>
      )}
    </GlobalStatsContext.Provider>
  );
}