"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - TITAN APP EDITION (VERSION 7.0 - THE GOLDEN UPDATE)
 * ------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei
 * Tehnologii: Next.js 15 (Turbopack), Tailwind v4, Pusher-JS, Upstash Redis.
 * * 📜 CHANGELOG 7.0:
 * 1. PERSISTENCE ENGINE: Salvează porecla, victoriile și skin-ul în localStorage.
 * 2. GOLDEN EGG SYSTEM: 0.1% șansă la start meci + Drop orar (Verificare automată).
 * 3. VETERAN STATUS: Steluța de onoare aplicată automat la peste 10 victorii.
 * 4. UI REORDERING: Butoane optimizate pentru conversie (Invite -> Play -> Team).
 * 5. CHAT RANDOM: Flag-uri pregătite pentru arena aleatorie.
 * 6. MODERN DESIGN: Skin selector 3D-ish și efecte de glow OLED.
 * ==========================================================================================
 */

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";

// --- COMPONENTE DE UI MODERNIZATE ---

/**
 * COMPONENTA: ActionButton
 * Buton cu design hibrid între Gaming și App-Native.
 */
const ActionButton = ({ onClick, icon, title, subtitle, color, primary = false }) => (
  <button 
    onClick={onClick}
    className={`relative group flex items-center gap-6 p-6 rounded-[2.5rem] transition-all duration-500 border-2 ${
      primary 
      ? 'bg-red-600 border-red-500 shadow-[0_15px_40px_rgba(220,38,38,0.4)] hover:scale-[1.03] active:scale-95' 
      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 active:scale-95'
    }`}
  >
    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shadow-inner transition-transform group-hover:rotate-12 duration-500 ${color}`}>
      {icon}
    </div>
    <div className="flex flex-col items-start text-left">
      <span className={`font-black uppercase tracking-widest text-sm ${primary ? 'text-white' : 'text-white/80'}`}>{title}</span>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${primary ? 'text-red-200' : 'text-white/20'}`}>{subtitle}</span>
    </div>
    {primary && <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping"></div>}
  </button>
);

/**
 * COMPONENTA: SkinSelector
 * Permite utilizatorului să își aleagă identitatea vizuală.
 */
const SkinSelector = ({ selectedSkin, onSelect, hasStar }) => {
  const skins = [
    { id: 'red', color: 'bg-red-600', name: 'Tradițional' },
    { id: 'blue', color: 'bg-blue-600', name: 'Modern' },
    { id: 'gold', color: 'bg-yellow-500', name: 'Dacic' },
    { id: 'diamond', color: 'bg-cyan-300', name: 'Elite' },
    { id: 'cosmic', color: 'bg-purple-600', name: 'Cosmic' },
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center py-4">
      {skins.map(skin => (
        <button
          key={skin.id}
          onClick={() => onSelect(skin.id)}
          className={`relative w-14 h-18 rounded-full transition-all duration-300 transform ${skin.color} ${
            selectedSkin === skin.id ? 'scale-125 ring-4 ring-white shadow-2xl z-10' : 'opacity-40 hover:opacity-100'
          }`}
        >
          {hasStar && <span className="absolute -top-1 -right-1 text-xs">⭐</span>}
          {selectedSkin === skin.id && <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>}
        </button>
      ))}
    </div>
  );
};

// --- LOGICA PRINCIPALĂ A PAGINII ---

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalGlobal, nume, setNume, triggerVibrate, playSound } = useGlobalStats();
  
  // --- STĂRI DE PERSISTENȚĂ (APP MEMORY) ---
  const [userStats, setUserStats] = useState({
    wins: 0,
    losses: 0,
    skin: 'red',
    hasGoldenEgg: false,
    lastGoldenCheck: 0
  });

  const [team, setTeam] = useState(null);
  const [chat, setChat] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cautareMeci, setCautareMeci] = useState(false);
  const [showGoldenModal, setShowGoldenModal] = useState(false);

  /**
   * EFECT: HIDRATARE DATE (Tine minte tot ce ai facut)
   */
  useEffect(() => {
    const savedStats = localStorage.getItem("c_stats");
    const tid = localStorage.getItem("c_teamId");
    const inviteId = searchParams.get("invite");

    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      setUserStats(parsed);
      
      // LOGICA DROP ORAR (Golden Egg)
      const now = Date.now();
      if (now - parsed.lastGoldenCheck > 3600000) { // 1 ora in ms
        const roll = Math.random() < 0.05; // 5% sansa la drop orar pentru fidelitate
        if (roll) {
          const newStats = { ...parsed, hasGoldenEgg: true, lastGoldenCheck: now };
          setUserStats(newStats);
          localStorage.setItem("c_stats", JSON.stringify(newStats));
          setShowGoldenModal(true);
          playSound('golden-drop');
        } else {
          localStorage.setItem("c_stats", JSON.stringify({ ...parsed, lastGoldenCheck: now }));
        }
      }
    } else {
      // Initializare pentru user nou
      const initial = { wins: 0, losses: 0, skin: 'red', hasGoldenEgg: false, lastGoldenCheck: Date.now() };
      localStorage.setItem("c_stats", JSON.stringify(initial));
    }

    if (inviteId) {
      localStorage.setItem("c_teamId", inviteId);
      if (nume) syncTeam(inviteId);
    } else if (tid && nume) {
      syncTeam(tid);
    }
    
    setIsLoaded(true);
  }, [nume, searchParams]);

  /**
   * FUNCȚIE: Sincronizare Echipă
   */
  const syncTeam = async (tid) => {
    try {
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'get-team-details', teamId: tid, jucator: nume })
      });
      const d = await res.json();
      if (d.success) {
        setTeam(d.details);
        setLeaderboard(d.top || []);
        setChat(d.chatHistory || []);
      }
    } catch (e) { console.error("Sync buba."); }
  };

  /**
   * FUNCȚIE: Matchmaking cu 0.1% Golden Egg
   */
  const handleRandomDuel = useCallback(() => {
    if (!nume || nume.trim().length < 2) return alert("Poreclă, te rugăm!");
    
    setCautareMeci(true);
    triggerVibrate([100, 50, 100]);
    playSound('radar-search');

    // 0.1% SANSA LA OU DE AUR IN TIMPUL JOCULUI
    const goldenRoll = Math.random() < 0.001; 
    if (goldenRoll) {
      const newStats = { ...userStats, hasGoldenEgg: true };
      setUserStats(newStats);
      localStorage.setItem("c_stats", JSON.stringify(newStats));
    }

    setTimeout(() => {
      // Trimitem si statusul de Golden Egg in URL pentru Arena
      router.push(`/joc/random?nume=${encodeURIComponent(nume)}&host=true&golden=${userStats.hasGoldenEgg}&skin=${userStats.skin}&chat=true`);
    }, 2800);
  }, [nume, userStats, router, triggerVibrate, playSound]);

  /**
   * FUNCȚIE: Update Skin
   */
  const updateSkin = (newSkin) => {
    const newStats = { ...userStats, skin: newSkin };
    setUserStats(newStats);
    localStorage.setItem("c_stats", JSON.stringify(newStats));
    playSound('click-skin');
    triggerVibrate(30);
  };

  if (!isLoaded) return null;

  return (
    <div className="bg-ethnic-dark min-h-screen pt-36 pb-20 px-4 sm:px-10 max-w-7xl mx-auto relative">
      
      {/* MODAL OU DE AUR (DROP ORAR) */}
      {showGoldenModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="glass-panel p-12 rounded-[4rem] text-center border-4 border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.5)] max-w-md">
            <div className="text-8xl mb-6 animate-bounce">✨🥚✨</div>
            <h2 className="text-4xl font-black text-yellow-500 uppercase tracking-tighter mb-4 text-glow-gold">DROP LEGENDAR!</h2>
            <p className="text-white/70 font-bold uppercase tracking-widest text-xs leading-relaxed">
              Ai primit OUL DE AUR! Următorul tău duel va fi o victorie automată. Profită de putere!
            </p>
            <button 
              onClick={() => setShowGoldenModal(false)}
              className="mt-8 bg-yellow-500 text-black px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all"
            >
              ÎNȚELES!
            </button>
          </div>
        </div>
      )}

      <section className="max-w-4xl mx-auto flex flex-col gap-10 items-center">
        
        {/* HEADER & BRANDING */}
        <div className="text-center space-y-4">
           <h1 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter drop-shadow-[0_20px_50px_rgba(220,38,38,0.4)]">
             Ciocnim<span className="text-red-600">.ro</span>
           </h1>
           <div className="flex items-center justify-center gap-4">
             <div className="h-[2px] w-12 bg-red-600/30"></div>
             <p className="text-yellow-500 font-bold uppercase tracking-[0.6em] text-[10px]">App Version 7.0 Titan</p>
             <div className="h-[2px] w-12 bg-red-600/30"></div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
          
          {/* COLOANA STÂNGA: IDENTITATE & SKINS */}
          <div className="glass-panel p-10 rounded-[3.5rem] flex flex-col gap-8 shadow-2xl border-t border-white/5">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-red-500 tracking-[0.4em] ml-6 block">Porecla Ta</label>
              <input 
                value={nume} 
                onChange={e => setNume(e.target.value)} 
                placeholder="Introdu numele..." 
                className="w-full bg-black/80 p-6 rounded-[2rem] text-2xl font-black border-2 border-white/5 focus:border-red-600 transition-all text-white shadow-inner"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-6">
                <label className="text-[11px] font-black uppercase text-white/20 tracking-[0.4em]">Skin-ul Oului</label>
                {userStats.wins >= 10 && <span className="text-yellow-500 font-black text-[10px] uppercase tracking-widest animate-pulse">⭐ VETERAN ⭐</span>}
              </div>
              <SkinSelector selectedSkin={userStats.skin} onSelect={updateSkin} hasStar={userStats.wins >= 10} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/5 p-6 rounded-[2rem] text-center border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Victorii</p>
                <p className="text-3xl font-black text-green-500">{userStats.wins}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] text-center border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Status Aur</p>
                <p className={`text-xl font-black ${userStats.hasGoldenEgg ? 'text-yellow-500 animate-pulse' : 'text-white/10'}`}>
                  {userStats.hasGoldenEgg ? "ACTIV ✨" : "INACTIV"}
                </p>
              </div>
            </div>
          </div>

          {/* COLOANA DREAPTĂ: CENTRUL DE ACȚIUNE (ORDINE NOUA) */}
          <div className="flex flex-col gap-4">
            
            {/* 1. INVITĂ PRIETENII (PROMOVAT) */}
            <ActionButton 
              onClick={() => {
                const link = team ? `${window.location.origin}/?invite=${team.id}` : `${window.location.origin}`;
                navigator.clipboard.writeText(link);
                alert("Link de invitație copiat! Trimite-l pe WhatsApp!");
                triggerVibrate(50);
              }}
              icon="📱"
              title="Invită Prietenii"
              subtitle="Cea mai tare provocare de Paște"
              color="bg-blue-600/20 text-blue-500"
            />

            {/* 2. JOACĂ ALEATORIU (ACTION PRIMARY) */}
            <ActionButton 
              onClick={handleRandomDuel}
              icon={cautareMeci ? "🛰️" : "⚔️"}
              title={cautareMeci ? "Căutare..." : "Duel Aleatoriu"}
              subtitle="Înfruntă spărgători din toată țara"
              color="bg-white/10 text-white"
              primary={true}
            />

            {/* 3. CREEAZĂ ECHIPĂ */}
            <ActionButton 
              onClick={() => {
                if(!team) {
                  // Apel API Creeaza Echipa (logica existenta)
                  fetch('/api/ciocnire', { 
                    method: 'POST', 
                    body: JSON.stringify({ actiune: 'creeaza-echipa', jucator: nume }) 
                  }).then(r => r.json()).then(d => {
                    if(d.success) { localStorage.setItem("c_teamId", d.team.id); window.location.reload(); }
                  });
                }
              }}
              icon="🚩"
              title="Creează Echipa"
              subtitle="Formează propriul clan de familie"
              color="bg-green-600/20 text-green-500"
            />

            {/* 4. VEZI ECHIPA "X" (DINAMIC) */}
            {team ? (
              <ActionButton 
                onClick={() => setActiveTab('chat')} // Sau scroll la zona de echipa
                icon="👀"
                title={`Vezi Echipa ${team.nume.split(' ')[2] || ''}`}
                subtitle="Dashboard-ul familiei tale"
                color="bg-purple-600/20 text-purple-500"
              />
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-20">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Nu ești în nicio echipă</span>
              </div>
            )}

          </div>

        </div>

      </section>

      {/* FOOTER PERSISTENCE INFO */}
      <footer className="mt-20 text-center opacity-10">
        <div className="divider-folk w-64 mx-auto mb-8"></div>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white">
          Toate datele sunt salvate local pe dispozitivul tău. <br/>
          Next Checkpoint: {new Date(userStats.lastGoldenCheck + 3600000).toLocaleTimeString()}
        </p>
      </footer>

      {/* BACKGROUND TEXTS */}
      <div className="fixed bottom-[-5vh] left-[-2vw] text-[35vh] opacity-[0.02] select-none pointer-events-none z-0 rotate-6 font-black italic tracking-tighter">
        TITAN
      </div>
      <div className="fixed top-[-5vh] right-[-2vw] text-[35vh] opacity-[0.02] select-none pointer-events-none z-0 -rotate-6 font-black italic tracking-tighter">
        APP 7.0
      </div>

    </div>
  );
}

export default function Home() {
  const { totalGlobal } = useGlobalStats();

  return (
    <main className="relative min-h-screen">
      <nav className="fixed top-8 left-0 w-full flex justify-center z-[150] pointer-events-none px-6">
        <div className="glass-panel p-2 rounded-full flex items-center shadow-[0_30px_80px_rgba(0,0,0,0.9)] pointer-events-auto bg-black/90 backdrop-blur-3xl border border-white/5">
          <div className="flex items-center gap-4 pl-8 pr-6 py-2 border-r border-white/10">
            <span className="text-3xl">🥚</span>
            <span className="font-black text-sm uppercase tracking-tighter text-white">Ciocnim<span className="text-red-600">.ro</span></span>
          </div>
          <div className="flex items-center gap-6 px-10 py-2">
            <div className="presence-dot"></div>
            <div className="flex flex-col">
              <span className="text-white/20 font-black text-[8px] tracking-[0.5em] uppercase leading-none mb-1.5">Bilanț Național</span>
              <span className="font-black text-yellow-500 text-4xl leading-none tabular-nums tracking-tighter drop-shadow-lg text-glow-gold">
                {totalGlobal.toLocaleString('ro-RO')}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <Suspense fallback={<div className="h-screen flex items-center justify-center text-white/10 uppercase tracking-[1em]">Initializare Aplicatie...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}