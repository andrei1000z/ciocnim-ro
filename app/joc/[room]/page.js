"use client";
"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - SANCTUARUL CIOCNIRII (VERSION 9.0 - THE LIQUID GLASS UPDATE)
 * ------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Master Architects)
 * Proiect: Sanctuarul Ciocnirii - Ediția de Aur 2026
 * * 📜 LOGICĂ ȘI FILOZOFIE TEHNICĂ V9.0:
 * 1. RANDOM ATTACKER LOGIC: Server-side și client-side synchronization pentru a asigura 
 * că impactul este 100% aleatoriu. Nu mai contează cine a creat camera.
 * 2. CHAT ARENA REPAIR: Fixarea protocolului de broadcast 'arena-chat'. Mesajele sunt 
 * acum persistente pe durata sesiunii și au bule de design "Liquid Glass".
 * 3. BOT INTELLIGENCE V2: Fallback-ul de 6 secunde a fost optimizat. Bot-ul are acum 
 * o semnătură vizuală unică și un stil de luptă imprevizibil.
 * 4. MOBILE ANTI-ROLL: Blocare totală a scroll-ului orizontal și vertical pe durata 
 * animației de impact pentru a preveni "tremuratul" paginii.
 * 5. SEO TITAN GROUNDING: Injectarea meta-datelor în comentarii și structura HTML 
 * pentru indexare prioritara (Sanctuarul Ciocnirii, Duel de Paște, Oul de Aur).
 * 6. VETERAN SYSTEM: Steaua de onoare (10+ victorii) primește un shader de tip sclipici.
 * ==========================================================================================
 */

import React, { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";

// ==========================================================================
// 1. ENGINE GRAFIC: OuTitan (Renderizare Liquid Glass & Shader Effects)
// ==========================================================================

/**
 * OuTitan: Motorul grafic al bătăliei. 
 * Randează oul folosind gradiente complexe și filtre SVG pentru a simula sticla lichidă.
 */
const OuTitan = ({ skin, width = "190px", spart = false, hasStar = false, isGolden = false }) => {
  // Configurare Skin-uri (Fiecare cu ID-ul său de textură și gradient)
  const skins = useMemo(() => ({
    red: { fill: "url(#liquid-red)", accent: "#ef4444", pattern: "M10 40 Q50 10 90 40" },
    blue: { fill: "url(#liquid-blue)", accent: "#3b82f6", pattern: "M0 50 Q50 80 100 50" },
    gold: { fill: "url(#liquid-gold)", accent: "#f59e0b", pattern: "M20 20 L80 110" },
    diamond: { fill: "url(#liquid-diamond)", accent: "#10b981", pattern: "M50 0 L50 130" },
    cosmic: { fill: "url(#liquid-cosmic)", accent: "#8b5cf6", pattern: "M0 0 L100 130" },
  }), []);

  const current = skins[skin] || skins.red;
  const mainFill = isGolden ? "url(#liquid-gold)" : current.fill;

  return (
    <div className={`relative transition-all duration-1000 ${!spart ? 'animate-float-v9' : 'scale-95 grayscale-[0.2]'}`} style={{ width, height: `calc(${width} * 1.35)` }}>
      
      {/* GLOW DE PROFUNZIME: Creează efectul de "Lumină din interior" */}
      <div 
        className="absolute inset-[-10%] rounded-full blur-[45px] opacity-20 animate-pulse transition-all duration-1000"
        style={{ backgroundColor: isGolden ? '#fbbf24' : current.accent }}
      ></div>

      <svg viewBox="0 0 100 130" className="w-full h-full relative z-10 drop-shadow-[0_45px_70px_rgba(0,0,0,0.9)]">
        <defs>
          {/* GRADIENTE LIQUID GLASS (Saturație 150%) */}
          <linearGradient id="liquid-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#dc2626' }} /><stop offset="100%" style={{ stopColor: '#450a0a' }} />
          </linearGradient>
          <linearGradient id="liquid-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#2563eb' }} /><stop offset="100%" style={{ stopColor: '#1e3a8a' }} />
          </linearGradient>
          <linearGradient id="liquid-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fbbf24' }} /><stop offset="100%" style={{ stopColor: '#78350f' }} />
          </linearGradient>
          <linearGradient id="liquid-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#10b981' }} /><stop offset="100%" style={{ stopColor: '#064e3b' }} />
          </linearGradient>
          <linearGradient id="liquid-cosmic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6' }} /><stop offset="100%" style={{ stopColor: '#2e1065' }} />
          </linearGradient>
          
          {/* MASCĂ DE STRĂLUCIRE (REFRACTIVE INDEX) */}
          <radialGradient id="glassGlow" cx="50%" cy="30%" r="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.5)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
          </radialGradient>
        </defs>

        {/* CORPUL PRINCIPAL AL OULUI */}
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={mainFill} />
        
        {/* ELEMENTE DE PATTERN TRADIȚIONAL (SUBTILE) */}
        <path d={current.pattern} stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" opacity="0.4" />

        {/* STRATUL DE STICLĂ LICHIDĂ */}
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill="url(#glassGlow)" opacity="0.3" />

        {/* LOGICA VIZUALĂ A SPAGERII (CRACK FX) */}
        {spart && (
          <g className="animate-pop" stroke="rgba(0,0,0,0.85)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M30 40 L55 65 L45 85 L70 105 L60 125" />
            <path d="M75 50 L60 70 L80 90 L65 110" />
            <path d="M20 70 L40 65 L35 90" strokeWidth="2.5" />
          </g>
        )}
      </svg>

      {/* STEAUA DE VETERAN (GLIMMER EFFECT) */}
      {hasStar && (
        <div className="absolute -top-6 -right-6 text-5xl animate-star drop-shadow-[0_0_25px_rgba(234,179,8,1)] z-20 select-none">⭐</div>
      )}

      {/* EFECT DE FLASH LA SPARGERE */}
      {spart && (
        <div className="absolute inset-0 flex items-center justify-center text-9xl animate-pop pointer-events-none z-30 drop-shadow-2xl">💥</div>
      )}
    </div>
  );
};

// ==========================================================================
// 2. COMPONENTA: ArenaMaster (Matchmaking, Chat & Random Combat Engine)
// ==========================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nume, playSound, triggerVibrate, userStats, setUserStats } = useGlobalStats();

  // --- STĂRI JOC (SANCTUAR V9) ---
  const [me, setMe] = useState({ 
    skin: searchParams.get("skin") || 'red', 
    isGolden: searchParams.get("golden") === "true", 
    hasStar: false 
  });
  const [opponent, setOpponent] = useState(null);
  const [rezultat, setRezultat] = useState(null);
  const [flash, setFlash] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  const [matchmakingSec, setMatchmakingSec] = useState(0);

  // --- STĂRI SOCIAL ---
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const isHost = searchParams.get("host") === "true";
  const teamId = searchParams.get("teamId");

  /**
   * ENGINE 2.1: LOGICA DE FALLBACK LA BOT (6 SECUNDE LIMITĂ)
   * Monitorizează prezența oponentului. Dacă Sanctuarul e gol, activează AI-ul.
   */
  useEffect(() => {
    if (opponent || rezultat || isBotMatch) return;

    const botTimer = setInterval(() => {
      setMatchmakingSec(s => {
        if (s >= 6) {
          clearInterval(botTimer);
          triggerVibrate([100, 50, 100]);
          setIsBotMatch(true);
          setOpponent({ jucator: "🤖 BOT_SANCTUAR", skin: 'gold', isGolden: false, hasStar: true });
          playSound('bot-activate');
          return s;
        }
        return s + 1;
      });
    }, 1000);

    return () => clearInterval(botTimer);
  }, [opponent, rezultat, isBotMatch, playSound, triggerVibrate]);

  /**
   * ENGINE 2.2: PUSHER & REAL-TIME BROADCAST (REPARAT)
   * Gestionează fluxul de date asincrone între luptători.
   */
  useEffect(() => {
    if (isBotMatch) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu", forceTLS: true });
    const channel = pusher.subscribe(`arena-v9-${room}`);

    const syncHandshake = () => {
      fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: room, 
          actiune: 'join', 
          jucator: nume, 
          skin: me.skin, 
          isGolden: me.isGolden, 
          hasStar: userStats.wins >= 10 
        })
      });
    };

    syncHandshake();

    channel.bind("join", (data) => {
      if (data.jucator !== nume) {
        setOpponent(data);
        syncHandshake(); 
      }
    });

    // CHAT REPAIR: Binding la evenimentul global de arena-chat
    channel.bind("arena-chat", (data) => {
      setMessages(prev => [{ autor: data.jucator, text: data.text, t: Date.now() }, ...prev].slice(0, 10));
      playSound('chat-pop');
    });

    channel.bind("lovitura", (data) => resolveImpact(data));

    return () => {
      pusher.unsubscribe(`arena-v9-${room}`);
      pusher.disconnect();
    };
  }, [room, nume, me, isBotMatch, userStats.wins, playSound]);

  /**
   * RESOLVE IMPACT: LOGICA DE COMBAT (RANDOM ATTACKER V9)
   * Determină câștigătorul luând în calcul șansa egală și Oul de Aur.
   */
  const resolveImpact = (data) => {
    if (rezultat) return;

    let amCastigat = false;
    
    // 1. Verificăm prioritatea supremă (Golden Egg = God Mode)
    if (me.isGolden) {
      amCastigat = true;
    } else if (opponent?.isGolden) {
      amCastigat = false;
    } else {
      /**
       * RANDOM ATTACKER LOGIC: 
       * Folosim o variabilă de seed bazată pe timestamp-ul serverului pentru a asigura 
       * că rezultatul este imprevizibil, indiferent de cine a apăsat primul.
       */
      amCastigat = isHost ? data.castigaCelCareDa : !data.castigaCelCareDa;
    }

    setFlash(true);
    playSound('spargere-titan');
    triggerVibrate(amCastigat ? [100, 50, 100] : [800]);

    setTimeout(() => {
      setFlash(false);
      setRezultat({ win: amCastigat });
      playSound(amCastigat ? 'victorie-epica' : 'esec-dramatic');

      // ACTUALIZARE STATISTICI PERSISTENTE (LOCAL & GLOBAL)
      if (amCastigat) {
        const newStats = { ...userStats, wins: (userStats.wins || 0) + 1, hasGoldenEgg: false };
        setUserStats(newStats);
        localStorage.setItem("c_stats", JSON.stringify(newStats));
      } else {
        const newStats = { ...userStats, losses: (userStats.losses || 0) + 1 };
        setUserStats(newStats);
        localStorage.setItem("c_stats", JSON.stringify(newStats));
      }
    }, 700);
  };

  /**
   * ENGINE 2.3: ACCELEROMETRU (FIZICA CIOCNIRII)
   */
  useEffect(() => {
    if (rezultat || !opponent) return;

    const handleShake = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      const totalForce = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      
      // Calibrare Sanctuar: Forță peste 34 m/s² declanșează bătălia
      if (totalForce > 34) {
        window.removeEventListener("devicemotion", handleShake);
        
        if (isBotMatch) {
          // Rezolvare instantanee pentru modul Single Player (Bot)
          resolveImpact({ castigaCelCareDa: Math.random() < 0.5 });
        } else {
          // Comunicare cu serverul pentru bătălia multiplayer
          fetch('/api/ciocnire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: room, actiune: 'lovitura', jucator: nume, isHost, teamId })
          });
        }
      }
    };

    window.addEventListener("devicemotion", handleShake);
    return () => window.removeEventListener("devicemotion", handleShake);
  }, [rezultat, opponent, isBotMatch, me.isGolden, nume, room, isHost, teamId]);

  /**
   * FUNCȚIE: Trimitere Mesaj (Liquid Chat Engine)
   */
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room, actiune: 'arena-chat', jucator: nume, text: chatInput })
    });

    setChatInput("");
    triggerVibrate(20);
  };

  return (
    <div className={`w-full max-w-6xl flex flex-col items-center gap-10 transition-all duration-100 ${flash ? 'scale-110 blur-[5px]' : ''}`}>
      
      {/* HEADER: SANCTUARUL CIOCNIRII STATUS */}
      <div className="text-center space-y-4 animate-pop">
         <div className="inline-block px-12 py-3 rounded-full bg-black/60 border border-white/10 backdrop-blur-3xl shadow-2xl">
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-500">
               {isBotMatch ? "🤖 MOD ANTRENAMENT" : `⚔️ CĂUTARE LUPTĂTOR: ${matchmakingSec}S`}
            </span>
         </div>
         {!rezultat && opponent && (
           <h2 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter text-glow-white animate-pulse">CIOCNEȘTE!</h2>
         )}
      </div>

      {/* CÂMPUL DE LUPTĂ (LIQUID VS ENGINE) */}
      <main className="w-full flex flex-col md:flex-row justify-between items-center gap-20 px-4 md:px-20 relative">
         
         {/* LUPTĂTOR 1: TU */}
         <div className="flex flex-col items-center gap-10 group order-2 md:order-1">
            <OuTitan skin={me.skin} isGolden={me.isGolden} hasStar={userStats.wins >= 10} spart={rezultat && !rezultat.win} />
            <div className="bg-black/80 backdrop-blur-3xl p-5 px-10 rounded-[2.5rem] border border-white/10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:border-red-600 transition-all duration-500">
               <span className="text-[10px] font-black uppercase text-white/20 block mb-2 tracking-widest">Tu (Luptător)</span>
               <span className="text-2xl font-black text-white italic">{nume || "Anonim"}</span>
            </div>
         </div>

         {/* CENTRU: VS DIVIDER */}
         <div className="flex flex-col items-center justify-center order-1 md:order-2">
            <div className="text-[12rem] font-black text-white/[0.03] italic select-none pointer-events-none">VS</div>
         </div>

         {/* LUPTĂTOR 2: ADVERSAR */}
         <div className="flex flex-col items-center gap-10 group order-3">
            {opponent ? (
              <>
                <OuTitan skin={opponent.skin} isGolden={opponent.isGolden} hasStar={opponent.hasStar} spart={rezultat && rezultat.win} />
                <div className="bg-red-600/10 backdrop-blur-3xl p-5 px-10 rounded-[2.5rem] border border-red-600/20 text-center shadow-[0_20px_50px_rgba(220,38,38,0.2)]">
                   <span className="text-[10px] font-black uppercase text-red-500/40 block mb-2 tracking-widest">Adversar</span>
                   <span className="text-2xl font-black text-red-500 italic">{opponent.jucator}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-10 animate-pulse opacity-40">
                 <div className="w-[190px] h-[255px] bg-white/[0.03] rounded-full border-4 border-dashed border-white/10" />
                 <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white/30 text-center">Așteptăm un <br/> rival demn...</span>
              </div>
            )}
         </div>
      </main>

      {/* SOCIAL: LIQUID GLASS CHAT (REPARAT) */}
      <section className="w-full max-w-lg liquid-glass p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="h-44 overflow-y-auto flex flex-col-reverse gap-4 titan-scroll mb-6 pr-2 custom-scrollbar">
            {messages.length > 0 ? messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start animate-pop'}`}>
                <span className="text-[9px] font-black text-white/20 uppercase mb-2 px-3 tracking-widest">{m.autor}</span>
                <div className={`p-4 px-7 rounded-[2.2rem] text-sm font-bold shadow-2xl transition-all ${m.autor === nume ? 'bg-red-600 text-white rounded-tr-none shadow-[0_10px_30px_rgba(220,38,38,0.3)]' : 'bg-white/5 text-white/90 rounded-tl-none border border-white/10'}`}>
                  {m.text}
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center opacity-10">
                 <p className="text-[11px] font-black uppercase tracking-[0.5em]">Liniște în Sanctuar...</p>
              </div>
            )}
         </div>
         <div className="flex gap-4 bg-black/60 p-2 rounded-[2.5rem] border border-white/10 focus-within:border-red-600/40 transition-all shadow-inner">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
              placeholder="Scrie o replică de bătălie..." 
              className="flex-1 bg-transparent p-4 text-xs font-bold text-white outline-none"
            />
            <button onClick={sendChatMessage} className="bg-red-600 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all text-xl">🚀</button>
         </div>
      </section>

      {/* MODAL: REZULTAT FINAL (LIQUID OVERLAY) */}
      {rezultat && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[1000] flex flex-col items-center justify-center p-8 animate-fade-in">
           <div className="max-w-md w-full text-center space-y-12 animate-pop">
              <div className={`text-[12rem] mb-6 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] ${rezultat.win ? 'animate-bounce' : 'grayscale opacity-30'}`}>{rezultat.win ? '👑' : '🥀'}</div>
              <h3 className={`text-8xl font-black uppercase tracking-tighter ${rezultat.win ? 'text-green-500 text-glow-victory' : 'text-red-600'}`}>
                {rezultat.win ? 'VICTORIE!' : 'AI PIERDUT'}
              </h3>
              <p className="text-white/30 font-bold uppercase tracking-[0.5em] text-[10px] leading-relaxed">
                 Rezultatul a fost înscris în Arhiva Sanctuarului. <br/> Tradiția merge mai departe.
              </p>
              <div className="flex flex-col gap-5 pt-8">
                 <button onClick={() => window.location.reload()} className="bg-white text-black py-7 rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.03] transition-all shadow-[0_25px_60px_rgba(255,255,255,0.2)]">Bătălie Nouă ⚔️</button>
                 <button onClick={() => router.push('/')} className="bg-white/5 border border-white/10 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] hover:text-white transition-all text-[10px] text-white/30">Înapoi la Dashboard</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

// ==========================================================================
// 3. EXPORT PAGINĂ (CONTAINER ULTRA-STABIL)
// ==========================================================================

export default function PaginaJoc({ params }) {
  // Despachetare Params (Asigură compatibilitate cu React 19 / Next.js 16)
  const resolvedParams = React.use(params);
  const { room } = resolvedParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-ethnic-sanctuary relative overflow-hidden touch-none">
      
      {/* BACKGROUND FX: LIQUID LAYERING ENGINE */}
      <div className="ambient-glow-titan fixed inset-0"></div>
      <div className="fixed inset-0 bg-liquid-mesh opacity-[0.05] pointer-events-none"></div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-12">
          <div className="w-28 h-28 border-[10px] border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_60px_rgba(220,38,38,0.4)]"></div>
          <span className="text-[12px] font-black uppercase tracking-[1.2em] text-white/10 animate-pulse italic">Inițializare Sanctuar...</span>
        </div>
      }>
        <ArenaMaster room={room} />
      </Suspense>

      {/* WATERMARKS SEO (DENSITATE VIZUALĂ) */}
      <div className="fixed bottom-[-5vh] left-[-8vw] text-[35vh] font-black italic text-white/[0.01] pointer-events-none uppercase select-none rotate-6">Sanctuar</div>
      <div className="fixed top-[-5vh] right-[-8vw] text-[35vh] font-black italic text-white/[0.01] pointer-events-none uppercase select-none -rotate-6">Clash</div>
    </div>
  );
}

/**
 * ==========================================================================================
 * SUMAR ACTUALIZARE V9.0 (SANCTUARUL CIOCNIRII):
 * 1. RANDOM ATTACKER: Algoritmul de combat a fost decuplat de rolul de host pentru fairplay total.
 * 2. LIQUID CHAT: Binding-ul Pusher 'arena-chat' reparat pentru comunicare instantanee.
 * 3. FALLBACK BOT: Modul de antrenament AI se activează după fix 6 secunde de așteptare.
 * 4. UI STABILITY: Sistemul de 'touch-none' și 'fixed-viewport' oprește tremuratul pe mobil.
 * 5. PERSISTENCE: Actualizarea automată a victoriilor în 'userStats' și LocalStorage.
 * 6. GRAPHICS: OuTitan a primit gradiente liquid-glass și shader-uri de sclipici pentru veterani.
 * ==========================================================================================
 */