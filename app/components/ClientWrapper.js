"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - SISTEMUL CENTRAL DE STARE ȘI SINCRONIZARE (VERSIUNEA 3.1 - STABLE CORE)
 * ====================================================================================================
 * Proiect: Platformă de ciocnit ouă virtuale, optimizată SEO și UX.
 * Tehnologii: React 19 (Context API), Next.js 16 (App Router), Pusher-JS (WebSockets).
 * * * * 📜 DESCRIEREA ARHITECTURII ACESTUI FIȘIER:
 * Acest fișier reprezintă "memoria" și "sistemul nervos" al întregii aplicații. El rulează
 * o singură dată (la încărcarea site-ului) și învelește toate celelalte pagini (este declarat 
 * în layout.js). Orice componentă din site poate accesa datele de aici folosind `useGlobalStats()`.
 * * * * 🛠️ FUNCȚIONALITĂȚI ȘI OPTIMIZĂRI CRITICE APLICATE PENTRU PRODUCȚIE:
 * 1. PERSISTENȚA DATELOR (LocalStorage Sync): Orice modificare a numelui, culorii oului sau
 * scorului (victorii/înfrângeri) este salvată instantaneu în browser. Dacă utilizatorul
 * închide fereastra și revine mâine, va avea aceleași date. Am adăugat verificări SSR (Server Side Rendering)
 * pentru a ne asigura că `localStorage` este apelat doar în browser.
 * 2. BILANȚUL NAȚIONAL LIVE (Global Incrementor): Funcția `incrementGlobal` comunică cu baza
 * de date (prin API) pentru a crește contorul de ouă sparte la nivel național. Pusher ascultă
 * aceste modificări și actualizează numărul pe ecranele tuturor utilizatorilor din țară în timp real.
 * 3. SISTEMUL DE NOTIFICĂRI: Dacă un utilizator este provocat la un duel privat, acest wrapper
 * interceptează semnalul prin WebSockets și afișează un pop-up pe ecran, indiferent pe ce
 * pagină se află utilizatorul în acel moment.
 * 4. FEEDBACK SENZORIAL (Audio & Haptic): Funcțiile `playSound` și `triggerVibrate` sunt 
 * centralizate aici pentru a putea fi apelate din orice pagină (ex: când se sparge oul în Arenă).
 * Folosim useCallback pentru a preveni re-crearea inutilă a funcțiilor la fiecare randare.
 * ====================================================================================================
 */

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useRouter, usePathname } from "next/navigation";

// Inițializarea Contextului Global React
// Acesta va "transporta" datele noastre (nume, scor, funcții) către toate componentele copil (Home, Arena, etc.).
const GlobalStatsContext = createContext();

/**
 * HOOK EXPORTAT: useGlobalStats
 * Permite oricărei pagini (Acasă, Arena) să citească și să modifice datele utilizatorului.
 * @returns {Object} Un obiect care conține state-ul global și funcțiile de update.
 */
export const useGlobalStats = () => {
  const context = useContext(GlobalStatsContext);
  if (!context) {
    // Aruncăm o eroare clară dacă cineva încearcă să folosească hook-ul în afara wrapper-ului.
    throw new Error("EROARE CRITICĂ: useGlobalStats trebuie folosit DOAR în interiorul componentelor învelite de ClientWrapper!");
  }
  return context;
};

/**
 * COMPONENTA PRINCIPALĂ: ClientWrapper
 * Acționează ca un provider de context și manager principal de evenimente asincrone (WebSockets).
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
    hasGoldenEgg: false, // Mecanism de noroc (Loot Drop)
    lastGoldenCheck: 0,
    teamId: null
  });

  // ==========================================
  // 2. STĂRI GLOBALE LIVE (Comune pentru toți jucătorii)
  // ==========================================
  const [totalGlobal, setTotalGlobal] = useState(0); // Bilanțul Național de Ouă Sparte
  const [nume, setNume] = useState(""); // Numele setat de utilizator (separat pentru acces rapid)
  const [notificare, setNotificare] = useState(null); // Duelurile solicitate (Pop-up-uri pe ecran)
  const [isHydrated, setIsHydrated] = useState(false); // S-au încărcat datele din memoria telefonului?
  
  // Referință către conexiunea Pusher. Folosim useRef pentru a nu crea o conexiune nouă
  // la fiecare re-randare a componentei, economisind astfel baterie și resurse de rețea.
  const pusherRef = useRef(null);

  // ==========================================================================
  // ENGINE 1: FEEDBACK SENZORIAL (Haptic & Audio)
  // ==========================================================================

  /**
   * Declanșează vibrația telefonului (Haptic Feedback) pe dispozitivele compatibile (Android).
   * iOS limitează acest lucru din browser, dar funcționează perfect pe Android și PWA.
   * @param {Array} pattern - Modelul de vibrație (ex: [100, 50, 100] = scurt, pauză, scurt).
   */
  const triggerVibrate = useCallback((pattern = [50]) => {
    try {
      if (typeof window !== 'undefined' && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (err) {
      console.warn("Sistemul de vibrații nu este suportat de acest browser/dispozitiv sau a fost blocat.");
    }
  }, []);

  /**
   * Redă un sunet specific acțiunii (ex: "spargere-titan").
   * Funcția este asincronă și gestionează eroarea clasică în care browserul 
   * blochează sunetul dacă utilizatorul nu a dat încă click pe pagină.
   * @param {string} soundFile - Numele fișierului mp3 din folderul /public/sunete/.
   */
  const playSound = useCallback((soundFile) => {
    try {
      if (typeof window !== 'undefined') {
        const audio = new Audio(`/sunete/${soundFile}.mp3`);
        audio.volume = 0.5; // Volum moderat (50%) pentru a nu fi deranjant
        const playPromise = audio.play();
        
        // Browserele moderne (Chrome/Safari) blochează sunetul autoplay.
        if (playPromise !== undefined) {
          playPromise.catch(() => console.log(`Sunetul ${soundFile} a fost blocat de politica de autoplay a browserului.`));
        }
      }
    } catch (e) {
      console.error("Eroare la redarea sunetului:", e);
    }
  }, []);

  // ==========================================================================
  // ENGINE 2: BILANȚUL NAȚIONAL (Global Incrementor)
  // ==========================================================================
  
  /**
   * Funcția care forțează creșterea Bilanțului Național în baza de date Redis.
   * Se apelează din Arena de fiecare dată când un ou se sparge pe ecran (de către un câștigător).
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
        // Actualizăm contorul local instant pentru a oferi un feedback fluid utilizatorului,
        // până când confirmarea oficială vine înapoi prin rețeaua Pusher.
        setTotalGlobal(prev => prev + 1);
      }
    } catch (e) {
      console.error("Eroare Critică: Nu s-a putut incrementa bilanțul național. Verificați conexiunea la internet.", e);
    }
  }, []);

  // ==========================================================================
  // ENGINE 3: ÎNCĂRCAREA DATELOR SALVATE (Hydration)
  // ==========================================================================

  useEffect(() => {
    // Verificăm dacă suntem în mediul de browser înainte de a accesa localStorage (Regulă de aur în Next.js)
    if (typeof window !== 'undefined') {
      // La deschiderea site-ului, căutăm în memoria locală (LocalStorage) datele vechi
      const savedName = localStorage.getItem("c_nume");
      const savedStats = localStorage.getItem("c_stats");
      const savedTeam = localStorage.getItem("c_teamId");
      
      let statsObject = {
        wins: 0,
        losses: 0,
        skin: "red", // Skin-ul clasic românesc (default)
        hasGoldenEgg: false, // Mecanism de recompensă rară (Oul de Aur)
        lastGoldenCheck: Date.now(),
        teamId: savedTeam || null
      };

      if (savedName) setNume(savedName);
      
      if (savedStats) {
        try {
          const parsed = JSON.parse(savedStats);
          statsObject = { ...statsObject, ...parsed };
          
          // --- LOGICA DE DROP PENTRU OUL DE AUR (GAMIFICATION) ---
          // Jucătorul are 5% șanse pe oră să primească skin-ul special de aur când intră pe site.
          // Acest lucru încurajează revenirile periodice.
          const now = Date.now();
          const oOraInMilisecunde = 3600000;
          
          if (now - statsObject.lastGoldenCheck > oOraInMilisecunde) {
            if (Math.random() < 0.05 && !statsObject.hasGoldenEgg) {
              statsObject.hasGoldenEgg = true;
            }
            statsObject.lastGoldenCheck = now;
          }
        } catch (err) {
          console.warn("Avertisment: Datele locale din browser sunt corupte sau în format vechi. Se resetează statisticile profilului pentru a preveni crash-uri.");
        }
      }

      // Salvăm în State-ul React și rescriem în LocalStorage pentru a consolida formatul curent
      setUserStats(statsObject);
      localStorage.setItem("c_stats", JSON.stringify(statsObject));
      
      // Am terminat încărcarea datelor. Oprim ecranul de loading (Boot Screen).
      setIsHydrated(true);
    }
  }, []);

  // ==========================================================================
  // ENGINE 4: CONEXIUNEA WEBSOCKETS (Pusher Hub)
  // ==========================================================================

  useEffect(() => {
    if (!isHydrated) return; // Așteptăm să se încarce datele locale înainte de a deschide conexiuni

    // Inițializăm clientul Pusher o singură dată (Singleton Pattern)
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
        forceTLS: true // Criptare obligatorie pentru securitatea datelor
      });
    }

    const pusher = pusherRef.current;

    // 1. CANALUL GLOBAL: Ne abonăm pentru a actualiza Bilanțul Național Live
    const canalGlobal = pusher.subscribe('global');
    canalGlobal.bind('ou-spart', (data) => {
      const totalDinBazaDeDate = parseInt(data.total);
      if (!isNaN(totalDinBazaDeDate)) {
        setTotalGlobal(totalDinBazaDeDate);
      }
    });

    // 2. CANALUL PERSONAL: Ne abonăm pentru notificări de duel direct către acest utilizator
    if (nume) {
      // Fiecare utilizator are un canal unic bazat pe numele său (ex: 'user-notif-Andrei')
      const canalPersonal = pusher.subscribe(`user-notif-${nume}`);
      canalPersonal.bind('duel-request', (data) => {
        // Dacă utilizatorul se află deja într-un meci (pe o pagină de /joc/), ignorăm notificarea
        // pentru a nu-l întrerupe din concentrarea actuală.
        if (pathname.includes('/joc/')) return;

        playSound('notificare-duel');
        triggerVibrate([100, 50, 100, 50, 100]); // Model de vibrație insistentă de "Atenție!"
        setNotificare(data);

        // Notificarea dispare automat de pe ecran după 15 secunde dacă este ignorată
        const timer = setTimeout(() => setNotificare(null), 15000);
        return () => clearTimeout(timer);
      });
    }

    // 3. GET COUNTER INITIAL: Sincronizarea inițială a Bilanțului Național la intrarea pe site
    fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'get-counter' }) 
    })
    .then(r => r.json())
    .then(d => { 
      if (d.success) setTotalGlobal(Math.max(0, d.total)); 
    })
    .catch(() => console.warn("Avertisment Secundar: Nu s-a putut sincroniza contorul inițial cu Redis. Se va folosi valoarea locală."));

    // Cleanup Function (Demontarea Componentei)
    // Când utilizatorul pleacă de pe site sau componenta se distruge, ne dezabonăm
    // de la canale pentru a preveni 'memory leaks'.
    return () => {
      pusher.unsubscribe('global');
      if (nume) pusher.unsubscribe(`user-notif-${nume}`);
    };
  }, [nume, pathname, playSound, triggerVibrate, isHydrated]);

  /**
   * Funcție care actualizează numele în State, îl salvează definitiv în browser 
   * și declanșează o scurtă vibrație pentru confirmare tactilă.
   */
  const handleUpdateNume = (nouNume) => {
    setNume(nouNume);
    if (typeof window !== 'undefined') {
      localStorage.setItem("c_nume", nouNume);
    }
    triggerVibrate(30);
  };

  /**
   * Funcție apelată când utilizatorul apasă "ACCEPTĂ" pe notificarea de duel.
   * Îl redirecționează către camera privată de joc generată de cel care a trimis invitația.
   */
  const handleAcceptDuel = () => {
    if (notificare) {
      playSound('duel-start');
      triggerVibrate(60);
      // Construim link-ul cu toți parametrii necesari.
      // Setăm host=false pentru că el este 'guest-ul' (cel invitat), nu creatorul camerei.
      const url = `/joc/${notificare.roomId}?nume=${encodeURIComponent(nume)}&host=false&teamId=${notificare.teamId || ''}&golden=${userStats.hasGoldenEgg}&skin=${userStats.skin || 'red'}`;
      router.push(url);
      setNotificare(null); // Ascundem notificarea din interfață după acceptare
    }
  };

  // Obiectul central care conține toate datele și funcțiile pe care le expunem către restul aplicației.
  // Orice componentă învelită de ClientWrapper poate apela 'useGlobalStats()' pentru a primi acest obiect.
  const contextValue = {
    totalGlobal,
    nume,
    setNume: handleUpdateNume,
    userStats,
    // Permitem actualizarea statisticilor (ex: din Arena după un meci) și le salvăm automat în browser
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
      {/* UI NOTIFICARE DUEL: Pop-up-ul care apare când ești provocat de un prieten  */}
      {/* ========================================================================== */}
      {notificare && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[9999] animate-fade-in px-2">
          <div className="bg-black/90 p-6 rounded-[2rem] border-2 border-red-600 shadow-[0_20px_50px_rgba(220,38,38,0.5)] relative overflow-hidden backdrop-blur-xl">
            
            {/* Design de fundal (Watermark VS supradimensionat) */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
              <span className="text-[6rem] font-black italic text-white select-none">VS</span>
            </div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg animate-pulse select-none">
                ⚔️
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <h4 className="font-black text-xl uppercase tracking-tighter text-white italic truncate">Ai fost provocat!</h4>
                <p className="text-xs text-white/60 uppercase font-bold tracking-widest truncate">
                  De către: <span className="text-red-500 font-black">{notificare.deLa}</span>
                </p>
                {/* Afișăm grupul/familia dacă provocarea vine din interiorul unui grup */}
                {notificare.teamName && (
                  <p className="text-[10px] text-yellow-500/80 uppercase font-bold tracking-widest truncate">Din Grupul: {notificare.teamName}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6 relative z-10">
              <button 
                onClick={handleAcceptDuel} 
                className="flex-[2] bg-red-600 hover:bg-red-500 py-4 rounded-xl font-black text-xs uppercase tracking-[0.1em] shadow-lg transition-colors text-white"
              >
                ACCEPTĂ DUELUL
              </button>
              
              <button 
                onClick={() => setNotificare(null)} 
                className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl font-bold text-xs uppercase text-white/50 border border-white/10 transition-colors"
              >
                Refuză
              </button>
            </div>

            {/* Bara de progres vizuală care scade în cele 15 secunde cât este valabilă notificarea */}
            <div className="absolute bottom-0 left-0 h-1.5 bg-red-600/20 w-full">
               <div className="h-full bg-red-600 animate-shrink" style={{ animationDuration: '15s', width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* ECRANUL DE ÎNCĂRCARE (Boot Screen) - Evită afișarea de date vechi sau erori */}
      {/* ========================================================================== */}
      {!isHydrated && (
        <div className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col items-center justify-center gap-6">
           <div className="relative w-20 h-20">
              {/* Spinner animat sofisticat în jurul unui emoji */}
              <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl select-none">🥚</div>
           </div>
           <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.5em] text-white/50 animate-pulse">Se încarcă Tradiția...</span>
           </div>
        </div>
      )}
    </GlobalStatsContext.Provider>
  );
}