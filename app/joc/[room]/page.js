"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";

// ==========================================
// 1. COMPONENTE VIZUALE: CONFETTI & SUNET
// ==========================================
const Confetti = () => {
  const culori = ['#dc2626', '#eab308', '#2563eb', '#16a34a', '#ffffff', '#a855f7'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 80 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute top-[-10%] confetti-piece shadow-lg"
          style={{
            left: `${Math.random() * 100}vw`,
            width: `${Math.random() * 12 + 6}px`,
            height: `${Math.random() * 24 + 12}px`,
            backgroundColor: culori[Math.floor(Math.random() * culori.length)],
            animationDelay: `${Math.random() * 2.5}s`,
            animationDuration: `${Math.random() * 2.5 + 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px' // Mix de forme
          }}
        />
      ))}
    </div>
  );
};

const playSound = (soundName) => {
  try {
    const audio = new Audio(`/sunete/${soundName}.mp3`);
    audio.play().catch(e => console.log("Sunet ignorat de browser"));
  } catch(e) {}
};

// ==========================================
// 2. DESIGN OUĂ (9 SKIN-URI + 3 PATTERN-URI SVG)
// ==========================================
const OuDesenat = ({ culoare, width = "120px", spart = false, pattern = "zigzag" }) => (
  <div style={{ position: 'relative', width, height: `calc(${width} * 1.3)`, margin: '0 auto' }}>
    <svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%', filter: "drop-shadow(0px 15px 20px rgba(0,0,0,0.7))" }} className="transition-all duration-300">
      
      /* Forma de bază a oului */
      <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={culoare} />
      
      /* PATTERN 1: ZIG-ZAG TRADIȚIONAL */
      {pattern === "zigzag" && (
        <>
          <path d="M5 60 L15 50 L25 60 L35 50 L45 60 L55 50 L65 60 L75 50 L85 60 L95 50" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M2 75 L15 88 L25 75 L35 88 L45 75 L55 88 L65 75 L75 88 L85 75 L98 88" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="50" cy="69" r="4" fill="rgba(255,255,255,0.4)" />
        </>
      )}

      /* PATTERN 2: PUNCTE (INCONDEIAT MODERN) */
      {pattern === "puncte" && (
        <>
          <circle cx="20" cy="40" r="3" fill="rgba(255,255,255,0.3)" />
          <circle cx="50" cy="30" r="4" fill="rgba(255,255,255,0.4)" />
          <circle cx="80" cy="40" r="3" fill="rgba(255,255,255,0.3)" />
          <circle cx="35" cy="90" r="5" fill="rgba(255,255,255,0.2)" />
          <circle cx="65" cy="90" r="5" fill="rgba(255,255,255,0.2)" />
        </>
      )}

      /* PATTERN 3: VALURI (NORDIC / MINIMALIST) */
      {pattern === "valuri" && (
        <>
          <path d="M0 50 Q 25 30, 50 50 T 100 50" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
          <path d="M0 70 Q 25 90, 50 70 T 100 70" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
        </>
      )}

      /* Efectul de luciu 3D pe ou */
      <path d="M25 30 Q40 10 65 20 Q50 30 35 50 Z" fill="rgba(255,255,255,0.15)" /> 
      
      /* Crăpătura masivă când e spart */
      {spart && (
         <path d="M5 50 L30 65 L15 80 L50 95 L40 115 L75 95 L65 125 L95 85" stroke="#0a0000" strokeWidth="5" fill="none" opacity="0.95" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
    {/* Emoji-ul de explozie */ }
    {spart && <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-2xl animate-pop opacity-90 z-10">💥</div>}
  </div>
);

// Baza de date cu cele 9 skin-uri
const SKIN_URI = [
  { nume: "Tradițional Roșu", hex: "#dc2626", pattern: "zigzag" }, 
  { nume: "Albastru Safir", hex: "#2563eb", pattern: "valuri" },
  { nume: "Verde Smarald", hex: "#16a34a", pattern: "puncte" }, 
  { nume: "Galben Aur", hex: "#ca8a04", pattern: "zigzag" },
  { nume: "Mov Ametist", hex: "#9333ea", pattern: "valuri" }, 
  { nume: "Negru Carbon", hex: "#171717", pattern: "puncte" },
  { nume: "Roz Trandafir", hex: "#db2777", pattern: "zigzag" },
  { nume: "Portocaliu Foc", hex: "#ea580c", pattern: "valuri" },
  { nume: "Alb Pur", hex: "#f8fafc", pattern: "puncte" } // Alb are nevoie de contrast
];

// ==========================================
// 3. LOGICA PRINCIPALĂ A JOCULUI
// ==========================================
function LogicaJoc({ room }) {
  const searchParams = useSearchParams();
  const nume = searchParams.get("nume") || "Jucător";
  const isHost = searchParams.get("host") === "true";
  const router = useRouter();

  // Referință pentru a trimite oul corect adversarului
  const ouMeuRef = useRef(null); 
  
  // Stările jocului
  const [ouMeu, setOuMeu] = useState(null);
  const [ouAdversar, setOuAdversar] = useState(null);
  const [numeAdversar, setNumeAdversar] = useState("Adversarul");
  
  const [rezultat, setRezultat] = useState(null);
  const [permisiuneSenzor, setPermisiuneSenzor] = useState(false);
  const [animatieImpact, setAnimatieImpact] = useState(false);

  // Stările pentru Revanșă / Ieșire
  const [dorintaRevansa, setDorintaRevansa] = useState(false);
  const [adversarVreaRevansa, setAdversarVreaRevansa] = useState(false);
  const [adversarIesit, setAdversarIesit] = useState(false);
  
  // Sistemul de reacții rapide
  const [reactiePrimita, setReactiePrimita] = useState(null);

  // Funcție centralizată pentru comunicarea cu API-ul (Pusher)
  const trimiteLaServer = (actiune, dateExtra = {}) => {
    fetch('/api/ciocnire', {
      method: 'POST',
      body: JSON.stringify({ roomId: room, actiune, jucator: nume, isHost, ...dateExtra })
    }).catch(e => console.error("Eroare trimitere:", e));
  };

  // Dacă utilizatorul apasă "Meniu Principal", anunțăm adversarul că am fugit
  const handlePlecareForțată = () => {
    trimiteLaServer('paraseste'); 
    router.push('/');
  };

  // Anunțăm serverul și la închiderea tab-ului (BeforeUnload)
  useEffect(() => {
    const laIesire = () => navigator.sendBeacon('/api/ciocnire', JSON.stringify({ roomId: room, actiune: 'paraseste' }));
    window.addEventListener('beforeunload', laIesire);
    return () => { window.removeEventListener('beforeunload', laIesire); laIesire(); };
  }, [room]);

  // INIȚIALIZARE WEBSOCKET (PUSHER)
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe(`camera-${room}`);

    // Când intrăm, strigăm în cameră să ne spună cineva ce ou are
    trimiteLaServer('cere-stare');

    // Dacă primim cere-stare de la celălalt, îi răspundem cu oul nostru
    channel.bind("cere-stare", (data) => {
      if (data.isHost !== isHost && ouMeuRef.current) {
        trimiteLaServer('pregatit', { culoare: ouMeuRef.current.hex, pattern: ouMeuRef.current.pattern, isReply: true });
      }
    });

    // Când adversarul și-a ales oul
    channel.bind("pregatit", (data) => {
      if (data.isHost !== isHost) {
        setOuAdversar({ hex: data.culoare, pattern: data.pattern || "zigzag" });
        setNumeAdversar(data.jucator);
        if (ouMeuRef.current && !data.isReply) {
          trimiteLaServer('pregatit', { culoare: ouMeuRef.current.hex, pattern: ouMeuRef.current.pattern, isReply: true });
        }
      }
    });

    // Când cineva dă cu telefonul, serverul decide rezultatul
    channel.bind("lovitura", (data) => {
      let amCastigat = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;
      
      // Declanșăm animația de șoc
      setAnimatieImpact(true);
      playSound('spargere');
      
      // După jumătate de secundă afișăm rezultatul
      setTimeout(() => {
        setAnimatieImpact(false);
        setRezultat({ amCastigat, mesaj: amCastigat ? "VICTORIE SUPREMĂ! 👑" : "OUL TĂU S-A SPART! 😭" });
        playSound(amCastigat ? 'victorie' : 'esec');
        if (navigator.vibrate) navigator.vibrate(amCastigat ? [100, 50, 100, 50, 200] : [800]); 
      }, 500);
    });

    channel.bind("revansa", (data) => { if (data.isHost !== isHost) setAdversarVreaRevansa(true); });
    channel.bind("adversar-iesit", () => setAdversarIesit(true));
    
    // Sistem de reacții live
    channel.bind("emoji", (data) => {
      if (data.isHost !== isHost) {
        setReactiePrimita(data.emoji);
        setTimeout(() => setReactiePrimita(null), 3500); // dispare dupa 3.5 secunde
      }
    });

    return () => pusher.unsubscribe(`camera-${room}`);
  }, [room, isHost, nume]);

  // RESETARE PENTRU REVANȘĂ
  useEffect(() => {
    if (dorintaRevansa && adversarVreaRevansa) {
      setRezultat(null); setOuMeu(null); ouMeuRef.current = null; setOuAdversar(null);
      setPermisiuneSenzor(false); setDorintaRevansa(false); setAdversarVreaRevansa(false); setAdversarIesit(false);
    }
  }, [dorintaRevansa, adversarVreaRevansa]);

  // ALEGERE OU + CERERE PERMISIUNE SENZOR
  const handleAlegeOu = async (skin) => {
    setOuMeu(skin);
    ouMeuRef.current = skin;
    trimiteLaServer('pregatit', { culoare: skin.hex, pattern: skin.pattern, isReply: false });

    // Pentru iOS: trebuie activat senzorul pe un click direct al utilizatorului
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const state = await DeviceMotionEvent.requestPermission();
        if (state === 'granted') setPermisiuneSenzor(true);
      } catch (e) { console.error("Senzor blocat:", e); }
    } else { 
      setPermisiuneSenzor(true); // Pentru Android
    }
  };

  const trimiteEmoji = (emoji) => {
    trimiteLaServer('emoji', { emoji });
    setReactiePrimita(emoji); // Ne arătăm și nouă ce am trimis
    setTimeout(() => setReactiePrimita(null), 3500);
  };

  // ==========================================
  // BUTONUL DE SHARE VIRAL
  // ==========================================
  const handleShareViral = async () => {
    const textViral = rezultat?.amCastigat 
      ? `Hai să vedem care e mai tare în coajă! 🥚 L-am distrus pe ${numeAdversar} la Ciocnim.ro! Intră să alegi oul și hai la duel!`
      : `Hai să vedem care e mai tare în coajă! 🥚 Mi-am spart oul în fața lui ${numeAdversar}... Răzbună-mă! Intră să alegi oul:`;

    if (navigator.share) {
      try { await navigator.share({ title: 'Ciocnim.ro 🥚', text: textViral, url: window.location.origin }); } catch (e) {}
    } else {
      navigator.clipboard.writeText(`${textViral} -> ${window.location.origin}`);
      alert("Mesajul a fost copiat! Dă-i Paste oriunde vrei.");
    }
  };

  // ASCULTAREA ACCELEROMETRULUI
  useEffect(() => {
    if (!permisiuneSenzor || !isHost || rezultat || !ouMeu || !ouAdversar) return;

    const handleMotion = (event) => {
      const acc = event.acceleration;
      if (!acc) return;
      const forta = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      
      if (forta > 20) { 
        window.removeEventListener("devicemotion", handleMotion);
        trimiteLaServer('lovitura'); 
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [permisiuneSenzor, isHost, rezultat, ouMeu, ouAdversar]);


  // ==========================================
  // UI - ECRAN 1: ALEGEREA OULUI
  // ==========================================
  if (!ouMeu) {
    return (
      <article className="flex flex-col items-center gap-6 glass-panel p-6 sm:p-10 rounded-[2.5rem] w-full max-w-lg animate-pop">
        <header className="text-center">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 uppercase tracking-widest drop-shadow-md">Alege Armura</h2>
          <p className="text-sm font-semibold text-yellow-500 mt-2 uppercase tracking-widest">Pregătește-te de luptă, {nume}!</p>
        </header>

        <section className="grid grid-cols-3 gap-y-8 gap-x-4 w-full mt-4">
          {SKIN_URI.map((skin) => (
            <button 
              key={skin.nume} 
              onClick={() => handleAlegeOu(skin)} 
              className="group flex flex-col items-center gap-3 focus:outline-none"
              aria-label={`Alege oul ${skin.nume}`}
            >
              <div className="transform group-hover:scale-125 group-active:scale-95 group-hover:-rotate-12 transition-all duration-300 drop-shadow-xl">
                <OuDesenat culoare={skin.hex} pattern={skin.pattern} width="70px" />
              </div>
              <span className="font-bold text-[10px] tracking-wider uppercase bg-black/60 px-3 py-1 rounded-full text-white/90 border border-white/10 group-hover:border-white/40 transition-colors">
                {skin.nume.split(" ")[0]} {/* Afișăm doar primul cuvânt ca să încapă bine */}
              </span>
            </button>
          ))}
        </section>
      </article>
    );
  }

  // ==========================================
  // UI - ECRAN 2: AȘTEPTARE ADVERSAR
  // ==========================================
  if (ouMeu && !ouAdversar) {
    return (
      <section className="flex flex-col items-center gap-12 animate-pop">
        <div className="text-sm font-black tracking-[0.4em] uppercase animate-pulse text-yellow-500 bg-red-950/80 px-8 py-3 rounded-full border-2 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
          Așteptăm adversarul...
        </div>
        <div className="opacity-100 transform scale-110 drop-shadow-2xl animate-float">
          <OuDesenat culoare={ouMeu.hex} pattern={ouMeu.pattern} width="160px" />
        </div>
      </section>
    );
  }

  // ==========================================
  // UI - ECRAN 3: ARENA (Lupta și Rezultatul)
  // ==========================================
  return (
    <main className={`flex flex-col items-center gap-8 w-full max-w-xl transition-transform duration-75 ${animatieImpact ? 'animate-shake-hard' : ''}`}>
      {/* Randăm Confetti doar dacă a câștigat */}
      {rezultat?.amCastigat && <Confetti />}

      {/* BANNER REZULTAT */}
      {!rezultat ? (
        <div className="text-4xl font-black text-white px-12 py-4 rounded-full tracking-[0.2em] uppercase bg-gradient-to-r from-red-600 to-red-800 shadow-[0_0_30px_rgba(220,38,38,0.8)] border-2 border-red-400 animate-pulse-glow z-20">
          LUPTĂ!
        </div>
      ) : (
        <div className={`text-3xl sm:text-4xl font-black px-8 py-6 rounded-3xl shadow-2xl w-full flex justify-center uppercase tracking-widest text-white animate-pop z-20 text-center ${rezultat.amCastigat ? 'bg-gradient-to-b from-green-500 to-green-700 border-2 border-green-400' : 'bg-gradient-to-b from-neutral-900 to-black border-2 border-red-900 text-red-500'}`}>
          {rezultat.mesaj}
        </div>
      )}

      {/* ZONA CENTRALĂ: CELE DOUĂ OUĂ */}
      <section className="flex justify-between w-full items-end mt-4 px-2 sm:px-8 relative z-10">
        
        {/* Sistemul flotant de reacții Emoji */}
        {reactiePrimita && (
          <div className="absolute top-[-60px] left-1/2 transform -translate-x-1/2 text-7xl animate-pop z-50 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            {reactiePrimita}
          </div>
        )}

        <div className="flex flex-col items-center gap-5 z-10 w-[40%]">
          <div className={`${animatieImpact && isHost ? 'translate-x-12 rotate-[20deg]' : ''} transition-transform duration-100`}>
            <OuDesenat culoare={ouMeu.hex} pattern={ouMeu.pattern} width="130px" spart={rezultat && !rezultat.amCastigat} />
          </div>
          <span className="font-black tracking-widest uppercase bg-white text-red-950 px-6 py-2 rounded-full text-xs shadow-[0_5px_15px_rgba(255,255,255,0.2)]">TU</span>
        </div>
        
        <div className="text-4xl font-black pb-16 opacity-40 text-white italic z-0 w-[20%] text-center tracking-widest">VS</div>

        <div className="flex flex-col items-center gap-5 z-10 w-[40%]">
          <div className={`${animatieImpact && !isHost ? '-translate-x-12 -rotate-[20deg]' : ''} transition-transform duration-100`}>
             <OuDesenat culoare={ouAdversar.hex} pattern={ouAdversar.pattern} width="130px" spart={rezultat && rezultat.amCastigat} />
          </div>
          <span className="font-black tracking-widest uppercase bg-red-950 border border-red-500/50 text-white px-4 py-2 rounded-full text-xs truncate w-full max-w-[140px] text-center shadow-lg">{numeAdversar}</span>
        </div>
      </section>

      {/* PANOU INFERIOR (TEXTE CERUTE + COMENZI) */}
      {!rezultat ? (
        <section className="mt-6 w-full px-2 flex flex-col gap-6 z-20">
          {isHost ? (
            <div className="w-full font-black animate-pulse-glow bg-gradient-to-b from-red-600 to-red-800 p-6 rounded-[2rem] text-center text-white shadow-xl flex flex-col gap-3 border border-red-400">
              <span className="text-3xl tracking-widest uppercase">📱 DĂ CU OUL!</span>
              <div className="text-sm font-semibold text-white/90 normal-case tracking-wide opacity-90">
                Țineți telefoanele ca pe niște ouă! <br/><span className="text-yellow-400 font-bold uppercase mt-1 inline-block">Și tu lovești!</span>
              </div>
              <div className="text-xs font-bold text-yellow-300 normal-case tracking-widest bg-black/30 py-2 rounded-xl mt-1 uppercase">
                Spune: "Hristos a înviat!"
              </div>
            </div>
          ) : (
            <div className="w-full font-bold bg-neutral-900/90 p-6 rounded-[2rem] text-center border-2 border-white/10 flex flex-col gap-3 shadow-2xl backdrop-blur-sm">
              <span className="text-3xl tracking-widest uppercase text-blue-400">🥶 ȚINE STRÂNS!</span>
              <div className="text-sm font-semibold text-white/80 normal-case tracking-wide">
                Țineți telefoanele ca pe niște ouă! <br/><span className="text-red-400 font-black uppercase mt-1 inline-block text-lg">{numeAdversar} lovește!</span>
              </div>
              <div className="text-xs font-bold text-yellow-500 normal-case tracking-widest bg-white/5 py-2 rounded-xl mt-1 uppercase">
                Răspunde: "Adevărat a înviat!"
              </div>
            </div>
          )}

          {/* BARĂ EMOJI RAPIDĂ */}
          <div className="flex justify-center gap-6 bg-black/60 p-4 rounded-full backdrop-blur-xl w-max mx-auto border border-white/10 shadow-lg">
            <button aria-label="Trimite reacție de râs" onClick={() => trimiteEmoji('🤣')} className="text-3xl hover:scale-125 hover:-translate-y-2 transition-all">🤣</button>
            <button aria-label="Trimite reacție de supărare" onClick={() => trimiteEmoji('😡')} className="text-3xl hover:scale-125 hover:-translate-y-2 transition-all">😡</button>
            <button aria-label="Trimite reacție de frig" onClick={() => trimiteEmoji('🥶')} className="text-3xl hover:scale-125 hover:-translate-y-2 transition-all">🥶</button>
            <button aria-label="Trimite reacție cu ou" onClick={() => trimiteEmoji('🥚')} className="text-3xl hover:scale-125 hover:-translate-y-2 transition-all">🥚</button>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-4 w-full px-2 mt-4 z-20">
          <button 
            onClick={handleShareViral}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black py-5 rounded-2xl text-base transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-blue-400"
          >
            <span className="text-2xl">📱</span> Distribuie Rezultatul
          </button>

          <button 
            onClick={!adversarIesit ? () => { setDorintaRevansa(true); trimiteLaServer('revansa'); } : undefined}
            disabled={dorintaRevansa || adversarIesit}
            className={`w-full font-black py-5 rounded-2xl text-sm transition-all uppercase tracking-widest shadow-xl ${
              adversarIesit
                ? "bg-black text-red-500 border-2 border-red-900 cursor-not-allowed" 
                : dorintaRevansa 
                  ? "bg-yellow-900/40 text-yellow-500 border border-yellow-700/50 cursor-not-allowed" 
                  : adversarVreaRevansa
                    ? "bg-gradient-to-b from-green-500 to-green-700 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-pulse border border-green-400" 
                    : "bg-white text-black hover:bg-gray-200" 
            }`}
          >
            {adversarIesit ? "Adversarul a fugit!" : dorintaRevansa ? "Așteptăm (1/2)" : adversarVreaRevansa ? "Acceptă Revanșa (1/2)" : "Cere Revanșă (0/2)"}
          </button>
          
          <button onClick={handlePlecareForțată} className="w-full bg-transparent text-white/50 font-bold py-4 rounded-xl text-xs transition-all uppercase tracking-[0.3em] mt-2 hover:text-white/90 border border-transparent hover:border-white/10">
            Înapoi la meniu
          </button>
        </section>
      )}
    </main>
  );
}

export default function Joc({ params }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative">
      <Suspense fallback={<div className="text-base text-yellow-500 uppercase tracking-[0.3em] animate-pulse font-black mt-20">Arena se pregătește...</div>}>
        <LogicaJoc room={params.room} />
      </Suspense>
    </div>
  );
}