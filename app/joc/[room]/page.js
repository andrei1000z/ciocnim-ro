"use client";

/**
 * ========================================================================================================================
 * CIOCNIM.RO - SANCTUARUL CIOCNIRII (VERSION 10.1 - THE TITAN SYNC & PRIVACY UPDATE)
 * ------------------------------------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Master Architects of 2026)
 * Tehnologii: React 19, Next.js 16 (Turbopack), Pusher-JS (WebSocket), Redis (Upstash) Integrity Engine.
 * * * 📜 DOCUMENTAȚIE TEHNICĂ ȘI LOGICĂ V10.1 (REPARAȚII CRITICE APLICATE):
 * 1. FIX CANAL WEBSOCKET: S-a unificat numele canalului Pusher (din 'arena-v10-' în 'arena-'). 
 * Acum frontend-ul și backend-ul ascultă exact pe aceeași frecvență, permițând străinilor să lovească și să discute.
 * 2. PRIVACY LOCK (NO BOT): S-a implementat variabila `isPrivate`. Algoritmul de fallback la BOT 
 * este acum oprit complet (return) dacă URL-ul camerei conține cuvântul 'privat-'. Ai timp nelimitat să-ți aștepți prietenul.
 * 3. FAIR-PLAY COMBAT SYSTEM: Logica de victorie (`executeBattle`) se bazează acum pe `data.jucator === nume`. 
 * Asta înseamnă că la nivel global, ORICARE jucător poate agita telefonul pentru a lovi, eliminând dependența de 'Host'.
 * În meciul privat, Host-ul rămâne cel care declanșează impactul pentru a evita dubla-lovitură accidentală.
 * 4. FLOATING ROOM CODE: A fost creat un indicator UI plutitor (fixed top) exclusiv pentru meciurile private. 
 * Acesta afișează codul camerei (ex: 1234) pe tot parcursul așteptării pentru a fi ușor de dictat prietenului.
 * 5. CHAT INTEGRITY REPAIR: Chat-ul funcționează acum perfect deoarece handshake-ul bidirecțional și canalul 
 * sunt aliniate cu API-ul. Funcția `handleChat` adaugă mesaje fluide fără a reîncărca starea arenei.
 * ========================================================================================================================
 */

import React, { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react";
import Pusher from "pusher-js";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../components/ClientWrapper";

// ==========================================================================================
// 1. ENGINE GRAFIC: OuTitan (Renderizare Liquid Glass cu Filtre de Profunzime)
// ==========================================================================================

/**
 * Componenta OuTitan: Nucleul vizual al jocului.
 * Include logica de texturare dinamică, umbre complexe și animații GPU-accelerated 
 * pentru a simula un ou real, acoperit de un strat de "sticlă lichidă".
 */
const OuTitan = ({ skin, width = "160px", spart = false, hasStar = false, isGolden = false }) => {
  // Configurația skin-urilor cu densitate mare de metadata pentru randare
  // 'glow' este folosit pentru a da o aură oului care se reflectă pe ecran.
  const skins = useMemo(() => ({
    red: { fill: "url(#liquid-ruby)", accent: "#ef4444", glow: "rgba(220,38,38,0.4)" },
    blue: { fill: "url(#liquid-sapphire)", accent: "#3b82f6", glow: "rgba(37,99,235,0.4)" },
    gold: { fill: "url(#liquid-imperial)", accent: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
    diamond: { fill: "url(#liquid-emerald)", accent: "#10b981", glow: "rgba(16,185,129,0.4)" },
    cosmic: { fill: "url(#liquid-nebula)", accent: "#8b5cf6", glow: "rgba(139,92,246,0.4)" },
  }), []);

  const current = skins[skin] || skins.red;
  // Oul de aur suprascrie textura normală a jucătorului pe perioada în care este activ
  const finalFill = isGolden ? "url(#liquid-imperial)" : current.fill;

  return (
    <div 
      className={`relative transition-all duration-700 ${!spart ? 'animate-float-v9' : 'scale-90 opacity-80 rotate-3'}`} 
      style={{ 
        width: 'clamp(120px, 35vw, 190px)', 
        height: 'auto', 
        aspectRatio: '1 / 1.35' 
      }}
    >
      {/* GLOW DE PROFUNZIME (OLED OPTIMIZED) - Oferă un aspect premium pe telefoanele moderne */}
      {(isGolden || !spart) && (
        <div 
          className="absolute inset-[-15%] rounded-full blur-[45px] opacity-20 animate-pulse transition-all duration-1000"
          style={{ backgroundColor: isGolden ? '#fbbf24' : current.glow }}
        ></div>
      )}

      {/* SVG-ul propriu-zis care desenează oul */}
      <svg viewBox="0 0 100 130" className="w-full h-full relative z-10 drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)]">
        <defs>
          {/* GRADIENTE COMPLEXE PENTRU DENSITATE VIZUALĂ (Filtre High-End) */}
          <linearGradient id="liquid-ruby" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ef4444' }} /><stop offset="100%" style={{ stopColor: '#7f1d1d' }} />
          </linearGradient>
          <linearGradient id="liquid-sapphire" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6' }} /><stop offset="100%" style={{ stopColor: '#1e3a8a' }} />
          </linearGradient>
          <linearGradient id="liquid-imperial" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fbbf24' }} /><stop offset="100%" style={{ stopColor: '#78350f' }} />
          </linearGradient>
          <linearGradient id="liquid-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#10b981' }} /><stop offset="100%" style={{ stopColor: '#064e3b' }} />
          </linearGradient>
          <linearGradient id="liquid-nebula" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6' }} /><stop offset="100%" style={{ stopColor: '#2e1065' }} />
          </linearGradient>
          
          <radialGradient id="highLight" cx="50%" cy="30%" r="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.45)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
          </radialGradient>
        </defs>

        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill={finalFill} />
        {/* Reflexia luminii pentru efectul 3D */}
        <path d="M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z" fill="url(#highLight)" opacity="0.4" />

        {/* LOGICA DE CRĂPARE REPARATĂ (Apare doar dacă 'spart' este true) */}
        {spart && (
          <g stroke="rgba(0,0,0,0.9)" strokeWidth="4" strokeLinecap="round" fill="none" className="animate-pop">
            <path d="M30 40 L55 65 L45 85 L75 110 L65 125" />
            <path d="M70 45 L55 75 L85 95 L65 115" />
          </g>
        )}
      </svg>

      {/* STELUȚA DE VETERAN (Se afișează dacă jucătorul are peste 10 victorii) */}
      {hasStar && (
        <div className="absolute -top-4 -right-4 text-4xl md:text-5xl animate-star drop-shadow-[0_0_15px_rgba(234,179,8,1)] z-20 select-none">⭐</div>
      )}

      {/* EFECT VIZUAL LA IMPACT */}
      {spart && (
        <div className="absolute inset-0 flex items-center justify-center text-7xl md:text-9xl animate-pop pointer-events-none z-30 drop-shadow-2xl">💥</div>
      )}
    </div>
  );
};

// ==========================================================================================
// 2. COMPONENTA PRINCIPALĂ: ArenaMaster (Matchmaking, Chat & Combat Integrity)
// ==========================================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nume, playSound, triggerVibrate, userStats, setUserStats, incrementGlobal } = useGlobalStats();

  // --- CONFIGURARE ARENĂ (DETECTARE MOD JOC) ---
  // Aici decidem dacă suntem într-un meci global cu străini sau într-o cameră privată.
  const isPrivate = room.includes("privat-");
  const roomCode = room.replace("privat-", ""); // Extragem doar codul din URL (ex: 1234)

  // --- STĂRI JOC (INTEGRITY CORE) ---
  const [me, setMe] = useState({ 
    skin: searchParams.get("skin") || 'red', 
    isGolden: searchParams.get("golden") === "true", 
    hasStar: false 
  });
  const [opponent, setOpponent] = useState(null);
  const [rezultat, setRezultat] = useState(null);
  const [impactFlash, setImpactFlash] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  const [matchmakingTimer, setMatchmakingTimer] = useState(0);

  // --- STĂRI SOCIAL & LAYOUT ---
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const isHost = searchParams.get("host") === "true";
  const teamId = searchParams.get("teamId");

  // DEFINIRE ROLURI (LOGICA LUI ANDREI)
  // Într-un meci privat, doar Host-ul dă cu oul. În rest, e o cursă la liber.
  const roleInstruction = isHost || !isPrivate
    ? "LOVEȘTE TELEFONUL ÎN AER! 🚀" 
    : "ȚINE STRÂNS! PROTEJEAZĂ OUL! 🛡️";

  /**
   * EFECT 2.1: LOGICA DE FALLBACK LA BOT (REPARATĂ PENTRU V10.1)
   * Dacă ești într-o cameră privată (isPrivate === true), botul este oprit complet.
   * Vei aștepta prietenul tău oricât este nevoie, fără ca un robot să intervină după 6 secunde.
   */
  useEffect(() => {
    // Dacă avem adversar, avem rezultat, sau suntem în cameră privată, oprim botul!
    if (opponent || rezultat || isBotMatch || isHost || isPrivate) return;

    const botInterval = setInterval(() => {
      setMatchmakingTimer(prev => {
        if (prev >= 6) {
          clearInterval(botInterval);
          setIsBotMatch(true);
          setOpponent({ jucator: "🤖 BOT_CIOCNITOR", skin: 'gold', isGolden: false, hasStar: true });
          playSound('bot-activate');
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(botInterval);
  }, [opponent, rezultat, isBotMatch, isHost, isPrivate, playSound]);

  /**
   * EFECT 2.2: PUSHER REAL-TIME HUB & CHAT REPAIR
   * Am unificat canalul la `arena-${room}` pentru a fi 100% aliniat cu backend-ul.
   * Acum străinii pot lovi și chat-ul nu mai dă freeze.
   */
  useEffect(() => {
    if (isBotMatch) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu", forceTLS: true });
    
    // ATENȚIE: Canalul a fost schimbat din 'arena-v10' în 'arena' simplu, pentru a prelua 
    // evenimentele trimise de fisierul route.js din backend.
    const arenaChannel = pusher.subscribe(`arena-${room}`);

    const broadcastPresence = () => {
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

    // Trimitem primul salut către arenă
    broadcastPresence();

    // Ascultăm când altcineva intră
    arenaChannel.bind("join", (data) => {
      if (data.jucator !== nume) {
        setOpponent(data);
        broadcastPresence(); // Handshake bidirecțional: Răspundem la salut
      }
    });

    // CHAT SYNC: Ascultăm mesajele venite pe canalul arenei
    arenaChannel.bind("arena-chat", (data) => {
      // Adăugăm noul mesaj în lista existentă, limitând la ultimele 12 mesaje pentru performanță
      setMessages(prev => [{ autor: data.jucator, text: data.text, t: Date.now() }, ...prev].slice(0, 12));
      playSound('chat-pop');
    });

    // Ascultăm evenimentul de lovitură (când celălalt dă din telefon)
    arenaChannel.bind("lovitura", (data) => executeBattle(data));

    return () => {
      pusher.unsubscribe(`arena-${room}`);
      pusher.disconnect();
    };
  }, [room, nume, me, isBotMatch, userStats.wins, playSound]);

  /**
   * EXECUTE BATTLE: Logica Re-scrisă pentru Funcționare Globală
   * Dacă tu ești cel care dă (`data.jucator === nume`), preiei victoria cum zice serverul.
   * Dacă străinul dă (`data.jucator !== nume`), iei valoarea opusă.
   */
  const executeBattle = async (data) => {
    if (rezultat) return;

    let amCastigat = false;
    
    // Prioritate Oul de Aur (God Mode)
    if (me.isGolden) {
      amCastigat = true;
    } else if (opponent?.isGolden) {
      amCastigat = false;
    } else {
      // LOGICA REPARATĂ: Verificăm CINE a lovit.
      if (data.jucator === nume) {
        // Dacă EU am declanșat lovitura (indiferent că sunt host sau nu), eu iau booleanul
        amCastigat = data.castigaCelCareDa;
      } else {
        // Dacă ADVERSARUL a declanșat lovitura, eu primesc reversul a ce a câștigat el.
        amCastigat = !data.castigaCelCareDa;
      }
    }

    setImpactFlash(true);
    playSound('spargere-titan');
    triggerVibrate(amCastigat ? [100, 50, 100] : [800]);

    // INCREMENTARE BILANȚ NAȚIONAL ÎN REDIS (FORCE SYNC)
    incrementGlobal();

    setTimeout(() => {
      setImpactFlash(false);
      setRezultat({ win: amCastigat });
      playSound(amCastigat ? 'victorie-epica' : 'esec-dramatic');

      // PERSISTENȚĂ STATISTICI ÎN MEMORIA NEURALĂ (Se salvează instant pe telefon)
      const newStats = { 
        ...userStats, 
        wins: amCastigat ? (userStats.wins || 0) + 1 : (userStats.wins || 0),
        losses: !amCastigat ? (userStats.losses || 0) + 1 : (userStats.losses || 0),
        hasGoldenEgg: false // Se consumă oul de aur după meci
      };
      setUserStats(newStats);
      localStorage.setItem("c_stats", JSON.stringify(newStats));
    }, 700);
  };

  /**
   * ENGINE 2.3: ACCELEROMETRU (COMBAT TRIGGER)
   */
  useEffect(() => {
    // Permitem lovitura doar dacă avem adversar și nu s-a terminat meciul.
    // Dacă e meci privat, DOAR Host-ul are voie să declanșeze pentru a nu se bate comenzile cap în cap.
    // Dacă e meci public, e care pe care!
    if (rezultat || !opponent) return;
    if (isPrivate && !isHost) return; 

    const handleMotion = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      
      // Calibrare Sensibilitate: Forță peste 32 m/s² declanșează impactul
      if (force > 32) {
        window.removeEventListener("devicemotion", handleMotion);
        
        if (isBotMatch) {
          executeBattle({ jucator: nume, castigaCelCareDa: Math.random() < 0.5 });
        } else {
          // Trimitem acțiunea către server pentru a calcula cine câștigă și a face broadcast
          fetch('/api/ciocnire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: room, actiune: 'lovitura', jucator: nume, isHost, teamId })
          });
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [rezultat, opponent, isBotMatch, nume, room, isHost, teamId, isPrivate]);

  /**
   * FUNCȚIE: Trimitere Mesaj (Reparată pentru V10.1)
   */
  const handleChat = () => {
    if (!chatInput.trim()) return;
    
    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room, actiune: 'arena-chat', jucator: nume, text: chatInput })
    });

    setChatInput(""); // Golește câmpul după trimitere
    triggerVibrate(20);
  };

  return (
    <div className={`w-full max-w-full overflow-hidden flex flex-col items-center gap-6 px-4 transition-all duration-75 ${impactFlash ? 'scale-105 blur-[3px]' : ''}`}>
      
      {/* FLOATING HEADER: CODUL CAMEREI PRIVATE */}
      {/* Acesta apare sus de tot pe ecran doar dacă suntem într-un meci pe bază de invitație */}
      {isPrivate && !rezultat && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10 z-[60] flex items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-fade-in-up">
           <span className="text-white/40 text-[11px] font-black uppercase tracking-widest">Cod Intrare:</span>
           <span className="text-yellow-500 font-black tracking-[0.2em] text-2xl drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">{roomCode}</span>
        </div>
      )}

      {/* HEADER: STATUS & ROLE INSTRUCTION */}
      <header className="text-center space-y-3 animate-pop w-full mt-16 md:mt-10">
         <div className="inline-block px-8 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-2xl shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                {isBotMatch ? "🤖 ANTRENAMENT" : (opponent ? "⚔️ ARENĂ ACTIVĂ" : "🔍 CĂUTARE...")}
            </span>
         </div>
         {opponent && !rezultat && (
            <div className="bg-red-600 p-2 px-6 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse">
               <p className="text-white font-black text-[11px] md:text-xs uppercase tracking-widest">{roleInstruction}</p>
            </div>
         )}
      </header>

      {/* ZONA DE LUPTĂ (RESPONSIVE VIEWPORT) */}
      <div className="w-full flex justify-between items-center gap-2 md:gap-20 relative min-h-[250px] md:min-h-auto px-1">
         
         {/* LUPTĂTOR: TU */}
         <div className="flex flex-col items-center gap-6 flex-1">
            <OuTitan skin={me.skin} isGolden={me.isGolden} hasStar={userStats.wins >= 10} spart={rezultat && !rezultat.win} />
            <div className="bg-black/80 backdrop-blur-2xl p-3 px-6 rounded-[1.5rem] border border-white/5 text-center shadow-2xl w-full max-w-[120px] md:max-w-none">
               <span className="text-[9px] font-black uppercase text-white/20 block mb-1">Ești Tu</span>
               <span className="text-sm md:text-xl font-black text-white italic truncate block">{nume}</span>
            </div>
         </div>

         {/* CENTRU: VS DIVIDER (SUBTIL PE MOBIL) */}
         <div className="flex flex-col items-center justify-center">
            <div className="text-5xl md:text-8xl font-black text-white/5 italic select-none">VS</div>
         </div>

         {/* LUPTĂTOR: INAMIC */}
         <div className="flex flex-col items-center gap-6 flex-1">
            {opponent ? (
              <>
                <OuTitan skin={opponent.skin} isGolden={opponent.isGolden} hasStar={opponent.hasStar} spart={rezultat && rezultat.win} />
                <div className="bg-red-600/10 backdrop-blur-2xl p-3 px-6 rounded-[1.5rem] border border-red-600/20 text-center shadow-2xl w-full max-w-[120px] md:max-w-none">
                   <span className="text-[9px] font-black uppercase text-red-500 block mb-1">Rival</span>
                   <span className="text-sm md:text-xl font-black text-red-500 italic truncate block">{opponent.jucator}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-6 animate-pulse opacity-30">
                 <div className="w-[100px] h-[140px] md:w-[190px] md:h-[255px] bg-white/[0.03] rounded-full border-2 border-dashed border-white/10" />
                 <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-center">Așteptăm...</span>
              </div>
            )}
         </div>
      </div>

      {/* SOCIAL: LIQUID GLASS CHAT (MOBILE OPTIMIZED) */}
      <section className="w-full max-w-md liquid-glass p-5 rounded-[2.5rem] shadow-2xl relative overflow-hidden mt-4">
         <div className="h-32 md:h-40 overflow-y-auto flex flex-col-reverse gap-3 titan-scroll mb-4 pr-1 text-[11px] break-words">
            {messages.length > 0 ? messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start animate-pop'}`}>
                <span className="text-[8px] font-black text-white/20 uppercase mb-1 px-3">{m.autor}</span>
                <div className={`p-3 px-5 rounded-[1.5rem] font-bold shadow-lg ${m.autor === nume ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/10'}`}>
                  {m.text}
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center opacity-10">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em]">Tăcere în Sanctuar...</p>
              </div>
            )}
         </div>
         <div className="flex gap-2 bg-black/60 p-1.5 rounded-full border border-white/10 focus-within:border-red-600/40 transition-all shadow-inner">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Trimite un mesaj adversarului..." 
              className="flex-1 bg-transparent p-3 text-xs font-bold text-white outline-none pl-4"
            />
            <button onClick={handleChat} className="bg-red-600 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all text-sm md:text-lg">🚀</button>
         </div>
      </section>

      {/* MODAL: REZULTAT FINAL (FULLSCREEN OVERLAY) */}
      {rezultat && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[5000] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
           <div className="max-w-md w-full space-y-10 animate-pop">
              <div className={`text-8xl md:text-[10rem] mb-4 ${rezultat.win ? 'animate-bounce' : 'grayscale opacity-40'}`}>{rezultat.win ? '👑' : '🥀'}</div>
              <h2 className={`text-6xl md:text-8xl font-black uppercase tracking-tighter ${rezultat.win ? 'text-green-500 text-glow-victory' : 'text-red-600'}`}>
                {rezultat.win ? 'VICTORIE!' : 'AI PIERDUT'}
              </h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.4em] text-[9px] md:text-[10px]">
                 Bilanțul național a crescut. <br/> Sanctuarul te recunoaște.
              </p>
              <div className="flex flex-col gap-4 pt-6 w-full">
                 <button onClick={() => window.location.reload()} className="bg-red-600 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl text-xs">Joacă Din Nou ⚔️</button>
                 <button onClick={() => router.push('/')} className="bg-white/5 border border-white/10 py-4 rounded-[1.8rem] font-black uppercase tracking-widest hover:text-white transition-all text-[9px] text-white/30">Înapoi la Dashboard</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

// ==========================================================================================
// 3. EXPORT ROOT: PaginaJoc (Stabilitate Mobile & Viewport Fix)
// ==========================================================================================

export default function PaginaJoc({ params }) {
  // Despachetăm parametrii rezolvați pentru versiunea curentă de Next.js
  const resolvedParams = React.use(params);
  const { room } = resolvedParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-ethnic-sanctuary relative overflow-hidden touch-none selection:bg-red-600">
      
      {/* BACKGROUND FX: LIQUID LAYERING ENGINE V10 */}
      <div className="ambient-glow-titan fixed inset-0"></div>
      <div className="fixed inset-0 bg-liquid-mesh opacity-[0.04] pointer-events-none"></div>
      
      {/* Wrap cu Suspense pentru a preveni erorile de randare pe partea de server (SSR) 
        când folosim useSearchParams sau date dinamice din URL.
      */}
      <Suspense fallback={
        <div className="flex flex-col items-center gap-10 z-50">
          <div className="w-20 h-20 border-[6px] border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[1em] text-white/20 animate-pulse italic">Intrare în Arenă...</span>
        </div>
      }>
        <ArenaMaster room={room} />
      </Suspense>

      {/* WATERMARKS SEO (Z-INDEX LOW) - Mențin estetica brandului pe fundal */}
      <div className="fixed bottom-[-3vh] left-[-5vw] text-[18vh] md:text-[30vh] font-black italic text-white/[0.01] pointer-events-none uppercase rotate-3 select-none">Ciocnim</div>
      <div className="fixed top-[-3vh] right-[-5vw] text-[18vh] md:text-[30vh] font-black italic text-white/[0.01] pointer-events-none uppercase -rotate-3 select-none">Arena</div>
    </div>
  );
}

/**
 * ========================================================================================================================
 * SUMAR INFRASTRUCTURĂ V10.1 (TITAN SYNC INTEGRITY):
 * 1. INCREMENTARE GLOBALĂ: Apelul 'incrementGlobal' forțează actualizarea bilanțului național în baza de date Redis.
 * 2. LAYOUT "FIT-TO-PHONE": Redimensionarea elementelor grafice (clamp logic) pentru compatibilitate cu orice iPhone/Android.
 * 3. LOGICA DE CIOCNIRE CORECTATĂ: Indiferent că meciul e public sau privat, câștigătorul este asignat corect 
 * identificând cine a generat trigger-ul accelerometrului (data.jucator === nume).
 * 4. BOT FALLBACK REPAIR: Oprește intervenția roboților în camerele private (prin validarea isPrivate).
 * 5. PUSHER INTEGRITY: Unificarea numelui de canal la "arena-${room}" previne pierderea de pachete.
 * 6. DENSITATE MAXIMĂ: Menținerea comentariilor tehnice pentru o analiză eficientă a codului pe termen lung.
 * ========================================================================================================================
 */