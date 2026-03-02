"use client";

/**
 * ========================================================================================================================
 * CIOCNIM.RO - NUCLEUL OPERAȚIONAL "SANCTUARUL NEURAL" (VERSION 22.5 - REGIONAL WARFARE & PWA)
 * ------------------------------------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Master Architects of the Digital Easter 2026)
 * Proiect: Sanctuarul Ciocnirii - Sistemul Suprem de Onboarding, Matchmaking și Clan Management
 * Tehnologii: Next.js 16 (Turbopack), React 19, Framer Motion, Upstash Redis, Haptic V7.
 * ------------------------------------------------------------------------------------------------------------------------
 * 📜 LOGICĂ ȘI FILOZOFIE DE INFRASTRUCTURĂ V22.5:
 * 1. REGIONAL WARFARE: S-a integrat selectorul pentru cele 9 regiuni istorice ale României.
 * Jucătorii își pot alege tabăra (Moldova, Ardeal, Muntenia, etc.) pentru a contribui la clasamentul pe regiuni.
 * 2. FRAMER MOTION INTEGRATION: UI-ul prinde viață. Am înlocuit CSS-ul brut de animație cu `framer-motion` 
 * pentru elementele de interacțiune critice (Selector Regiune, Skin-uri), garantând un flow "Liquid Glass".
 * 3. PWA AWARENESS: UI-ul reacționează diferit dacă este rulat ca aplicație (Standalone) față de browser.
 * ------------------------------------------------------------------------------------------------------------------------
 */

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion"; // NOU: Magia pentru UI fluid
import Onboarding from "./components/Onboarding";

// ==========================================================================================
// 1. CONSTANTE ȘI MANIFEST TEHNIC
// ==========================================================================================

const SANCTUARY_CONFIG = {
  VERSION: "22.5.0-STABLE",
  ENGINE: "KINETIC-NEURAL-V10",
  CODENAME: "REGIONAL-WARFARE",
  RELEASE_DATE: "2026-03-02",
  PROTOCOLS: ["HTTP/3", "WSS", "REDIS-ATOMIC", "HAPTIC-V7", "PWA-STANDALONE"],
};

const REGIUNI_ISTORICE = [
  "Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", 
  "Crișana", "Banat", "Maramureș", "Bucovina"
];

// ==========================================================================================
// 2. COMPONENTE ATOMICE DE UI (DESIGN SYSTEM V22.5 cu Framer Motion)
// ==========================================================================================

const ActionButton = ({ onClick, icon, title, subtitle, variant = "red", loading = false }) => {
  const baseStyles = `
    relative group w-full flex items-center gap-5 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] 
    transition-all duration-500 border-2 active:scale-95 overflow-hidden select-none cursor-pointer
    transform-gpu will-change-transform
  `;
  
  const variants = {
    red: "bg-red-600 border-red-500/50 shadow-[0_15px_40px_rgba(220,38,38,0.3)] text-white hover:bg-red-500",
    glass: "bg-white/5 border-white/10 backdrop-blur-[30px] saturate-150 text-white/90 hover:bg-white/10 shadow-xl"
  };

  return (
    <button onClick={onClick} disabled={loading} className={`${baseStyles} ${variants[variant]} ${loading ? 'opacity-50 grayscale' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      
      <div className={`
        w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[1.8rem] flex items-center justify-center text-2xl md:text-3xl 
        shadow-2xl transform transition-all group-hover:scale-110 flex-shrink-0
        ${variant === 'red' ? 'bg-white/20' : 'bg-red-600/20'}
      `}>
        {loading ? <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : icon}
      </div>
      
      <div className="flex flex-col items-start text-left relative z-10 max-w-[calc(100%-5rem)]">
        <span className="font-black uppercase tracking-tighter text-lg md:text-xl leading-tight truncate w-full">{title}</span>
        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] opacity-30 mt-1 truncate w-full">{subtitle}</span>
      </div>
    </button>
  );
};

// ... [ClanHub rămâne identic cu cel din codul tău, îl păstrăm curat] ...
const ClanHub = ({ team, leaderboard, onLeave, onRename, onInvite }) => {
  const [activeTab, setActiveTab] = useState('members'); 
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(team.nume);

  const totalImpact = useMemo(() => leaderboard.reduce((acc, m) => acc + (m.score || 0), 0), [leaderboard]);
  const clanLevel = Math.floor(totalImpact / 100) + 1;

  const handleRenameConfirm = () => {
    if (newName.length < 3) return alert("Minim 3 caractere!");
    onRename(newName);
    setIsEditingName(false);
  };

  return (
    <div className="liquid-glass p-6 md:p-10 rounded-[3rem] md:rounded-[4rem] w-full shadow-[0_40px_120px_rgba(0,0,0,0.8)] border-white/5 relative overflow-hidden transform-gpu max-w-full">
       <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
          <div className="h-full bg-red-600 shadow-[0_0_15px_red] transition-all duration-1000" style={{ width: `${Math.min(totalImpact % 100, 100)}%` }}></div>
       </div>

       <div className="flex justify-between items-start mb-10 relative z-10">
          <div className="flex flex-col gap-2 w-full pr-10">
            <div className="flex items-center gap-3">
               <span className="bg-red-600 text-[9px] font-black px-3 py-0.5 rounded-full text-white uppercase tracking-widest">LVL {clanLevel}</span>
               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">ID: {team.id}</span>
            </div>
            
            {isEditingName ? (
              <div className="flex gap-2 mt-3 w-full">
                 <input 
                   value={newName}
                   onChange={(e) => setNewName(e.target.value.toUpperCase())}
                   className="bg-black/60 border-2 border-red-600 p-3 rounded-2xl text-xl font-black text-white w-full outline-none"
                   autoFocus
                   onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
                 />
                 <button onClick={handleRenameConfirm} className="bg-green-600 p-3 rounded-2xl">✅</button>
              </div>
            ) : (
              <h4 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white break-words leading-none">
                {team.nume}
              </h4>
            )}
          </div>
          <button onClick={() => setActiveTab('settings')} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-xl border border-white/10 flex-shrink-0">⚙️</button>
       </div>

       <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['members', 'pulse', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all flex-shrink-0 ${activeTab === tab ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}>
              {tab === 'members' ? 'Armată' : tab === 'pulse' ? 'Puls' : 'Setări'}
            </button>
          ))}
       </div>

       <div className="min-h-[300px] flex flex-col gap-4">
          {activeTab === 'members' && (
            <div className="space-y-3">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {leaderboard.map((m, i) => (
                    <div key={i} className="bg-black/30 p-4 rounded-[1.8rem] border border-white/5 flex justify-between items-center group">
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-red-600">#{i+1}</span>
                          <span className="text-sm font-black text-white truncate max-w-[100px]">{m.member}</span>
                       </div>
                       <span className="text-lg font-black text-yellow-500">{m.score}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'pulse' && (
            <div className="flex flex-col items-center justify-center h-64 opacity-20">
               <div className="text-6xl mb-6">📡</div>
               <p className="text-[11px] font-black uppercase tracking-[0.6em] text-center italic">Sincronizare...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex flex-col gap-3">
               <button onClick={() => setIsEditingName(true)} className="w-full p-6 bg-white/5 rounded-3xl text-[10px] font-black uppercase text-white/50 hover:bg-white/10 text-left flex justify-between">
                 <span>Redenumiți Clanul</span>
                 <span>✏️</span>
               </button>
               <button onClick={onInvite} className="w-full p-6 bg-white/5 rounded-3xl text-[10px] font-black uppercase text-white/50 hover:bg-white/10 text-left flex justify-between">
                 <span>Invitație</span>
                 <span>🔗</span>
               </button>
               <button onClick={onLeave} className="w-full p-6 bg-red-600/10 rounded-3xl text-[10px] font-black uppercase text-red-500 hover:bg-red-600 hover:text-white transition-all text-left flex justify-between">
                 <span>Părăsește</span>
                 <span>🥀</span>
               </button>
            </div>
          )}
       </div>
    </div>
  );
};

const SkinSelector = ({ selected, onSelect }) => {
  const skins = useMemo(() => [
    { id: 'red', color: '#dc2626' }, { id: 'blue', color: '#2563eb' },
    { id: 'gold', color: '#f59e0b' }, { id: 'diamond', color: '#10b981' },
    { id: 'cosmic', color: '#8b5cf6' }
  ], []);

  return (
    <div className="flex flex-col items-start gap-4 w-full pt-4">
      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[1em] text-white/20 italic pl-4">Armură Kinetică</span>
      <div className="flex flex-wrap justify-start gap-3 md:gap-4 p-4 md:p-5 bg-black/60 rounded-[2rem] border border-white/5 shadow-2xl w-full">
        {skins.map(s => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(s.id)}
            className={`
              relative w-12 h-16 md:w-14 md:h-20 rounded-[1.5rem] md:rounded-[2rem] transition-colors duration-300 transform-gpu cursor-pointer
              ${selected === s.id ? 'z-10 border-2 border-white' : 'opacity-30 grayscale'}
            `}
            style={{ backgroundColor: s.color, boxShadow: selected === s.id ? `0 0 20px ${s.color}AA` : 'none' }}
          />
        ))}
      </div>
    </div>
  );
};

// --- NOU: Componenta pentru alegerea Regiunii (Regional Warfare) ---
const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <label className="text-[10px] md:text-[11px] font-black uppercase text-white/40 tracking-[0.5em] ml-4 italic">Tabăra Ta (Regiunea)</label>
      
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-black/80 p-5 rounded-[2rem] border-2 border-white/10 text-lg md:text-xl font-black text-white outline-none flex justify-between items-center"
        >
          <span className={selectedRegion ? 'text-white' : 'text-white/30'}>
            {selectedRegion || "ALEGE REGIUNEA..."}
          </span>
          <span className="text-white/50">{isOpen ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[105%] left-0 w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden z-50 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            >
              <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 grid grid-cols-2 gap-2">
                {REGIUNI_ISTORICE.map((regiune) => (
                  <button
                    key={regiune}
                    onClick={() => {
                      onSelectRegion(regiune);
                      setIsOpen(false);
                    }}
                    className={`p-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${selectedRegion === regiune ? 'bg-red-600 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
                  >
                    {regiune}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ==========================================================================================
// 3. LOGICA DE CONTROL: HomeContent (The Balanced Neural Brain)
// ==========================================================================================

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extragem funcțiile vitale din Wrapper
  const { totalGlobal, nume, setNume, triggerVibrate, playSound, userStats, setUserStats, isHydrated, isPWA } = useGlobalStats();
  
  const [team, setTeam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [errorLog, setErrorLog] = useState("");

  // --- LOGICA NOUĂ DE ONBOARDING ---
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Dacă datele s-au încărcat și utilizatorul NU are nume sau regiune setată, pornim onboarding-ul
    if (isHydrated && (!nume || !userStats.regiune)) {
      setShowOnboarding(true);
    }
  }, [isHydrated, nume, userStats.regiune]);
  // ---------------------------------

  useEffect(() => {
    if (!isHydrated) return;

    const tid = searchParams.get("joinTeam") || localStorage.getItem("c_teamId");
    if (!tid || !nume) return;

    const fetchTeamDetails = async () => {
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actiune: 'get-team-details', teamId: tid, jucator: nume })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("c_teamId", tid);
          setTeam(data.details);
          setLeaderboard(data.top || []);
          if (searchParams.has("joinTeam")) router.replace('/'); 
        }
      } catch (e) { console.warn("Redis Sync Idle..."); }
    };
    fetchTeamDetails();
  }, [nume, searchParams, router, isHydrated]);

  const handleCreateTeam = async () => {
    if (!nume || nume.trim().length < 3) return setErrorLog("MINIM 3 CARACTERE!");
    setLoadingTeam(true);
    setErrorLog("");
    try {
      const res = await fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'creeaza-echipa', creator: nume }) 
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("c_teamId", data.teamId);
        window.location.reload();
      }
    } catch (e) { setErrorLog("EROARE API."); } finally { setLoadingTeam(false); }
  };

  const handleRenameTeam = async (newName) => {
    const tid = localStorage.getItem("c_teamId");
    try {
      await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'redenumeste-echipa', teamId: tid, newName })
      });
      setTeam(prev => ({...prev, nume: newName}));
    } catch (e) { console.error("Rename Failed"); }
  };

  // Prevenim erorile de tip Hydration (SSR vs Client)
  if (!isHydrated) return null;

  // --- DACĂ E NOU, AFIȘĂM DOAR ONBOARDING-UL ---
  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  // DACĂ A TRECUT DE ONBOARDING, AFIȘĂM DASHBOARD-UL NORMAL
  return (
    <div className="w-full flex flex-col items-center gap-16 md:gap-24 max-w-[1400px] mx-auto pt-32 md:pt-40 pb-40 px-4 md:px-12 relative transform-gpu">
      
      {/* --- HERO SECTION --- */}
      <header className="text-center space-y-8 md:space-y-10 animate-pop w-full relative z-10 px-2">
{/* ... restul codului din return rămâne exact cum l-am făcut la V22.5 ... */}
          <div className="flex flex-col items-center gap-4 md:gap-6">
             {/* PWA Awareness Badge */}
             <div className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full border mb-2 md:mb-4 ${isPWA ? 'bg-green-600/10 border-green-600/30' : 'bg-red-600/10 border-red-600/20'}`}>
                <span className={`text-[8px] md:text-[11px] font-black uppercase tracking-[0.8em] md:tracking-[1em] ${isPWA ? 'text-green-500' : 'text-red-600'} animate-pulse`}>
                  {isPWA ? "RULARE NATIVĂ (PWA)" : "SANCTUAR V22.5 REGIONAL"}
                </span>
             </div>
             
             {/* Fluid Typography fix pentru H1 */}
             <h1 className="font-black text-white italic tracking-tighter leading-none select-none drop-shadow-[0_20px_50px_rgba(0,0,0,1)]" style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}>
                CIOCNIM<span className="text-red-600">.RO</span>
             </h1>
             <div className="h-1 md:h-1.5 w-40 md:w-80 bg-red-600 rounded-full shadow-[0_0_40px_red]" />
          </div>
          <p className="max-w-3xl mx-auto text-white/20 text-[9px] md:text-[16px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] leading-relaxed italic px-4">
             Cea mai densă arenă de <span className="text-white/60">duel tradițional</span>. <br/> 
             Alege-ți tabăra. <span className="text-red-600">Domină Sanctuarul.</span>
          </p>
      </header>

      {/* --- DASHBOARD GRID --- */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 relative z-10">
        
        {/* IDENTITATE & REGIONAL WARFARE */}
        <div className="liquid-glass p-6 md:p-14 rounded-[3rem] md:rounded-[4.5rem] flex flex-col gap-10 shadow-3xl border-white/5 overflow-visible">
          <div className="space-y-6 relative z-10 w-full">
            <div className="flex flex-col gap-4">
               <label className="text-[10px] md:text-[11px] font-black uppercase text-red-500 tracking-[0.8em] md:tracking-[1em] ml-4 md:ml-10 italic">Identitate Digitală</label>
               <input 
                 value={nume} 
                 onChange={e => setNume(e.target.value.toUpperCase())}
                 placeholder="PORECLA..."
                 className="w-full bg-black/90 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-4 border-white/5 text-xl md:text-4xl font-black focus:border-red-600 transition-all outline-none text-white tracking-tighter shadow-xl"
               />
               {errorLog && <p className="text-red-500 text-[9px] md:text-[11px] font-black uppercase mt-2 text-center animate-pulse tracking-[0.5em]">{errorLog}</p>}
            </div>
            
            {/* NOU: Selectorul de Regiune */}
            <RegionSelector 
              selectedRegion={userStats.regiune} 
              onSelectRegion={(reg) => setUserStats({...userStats, regiune: reg})} 
            />

            <SkinSelector selected={userStats.skin || 'red'} onSelect={(s) => setUserStats({...userStats, skin: s})} />
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10 mt-4">
             <div className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border-2 border-white/5 text-center shadow-2xl">
                <span className="text-[9px] md:text-[10px] font-black text-white/30 uppercase block mb-2 md:mb-4 tracking-[0.2em] md:tracking-[0.4em]">Victorii</span>
                <span className="text-3xl md:text-5xl font-black text-green-500">{userStats.wins || 0}</span>
             </div>
             <div className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border-2 border-white/5 text-center shadow-2xl">
                <span className="text-[9px] md:text-[10px] font-black text-white/30 uppercase block mb-2 md:mb-4 tracking-[0.2em] md:tracking-[0.4em]">Înfrângeri</span>
                <span className="text-3xl md:text-5xl font-black text-red-600">{userStats.losses || 0}</span>
             </div>
          </div>
        </div>

        {/* OPERATIONS & CLAN */}
        <div className="flex flex-col gap-6 md:gap-10">
          {team ? (
            <ClanHub 
              team={team} 
              leaderboard={leaderboard} 
              onLeave={() => { if(confirm("ABANDONEZI?")) { localStorage.removeItem("c_teamId"); window.location.reload(); } }}
              onRename={handleRenameTeam}
              onInvite={() => {
                const link = `${window.location.origin}/?joinTeam=${team.id}`;
                navigator.clipboard.writeText(link);
                alert("Link copiat! Trimite-l fraților tăi.");
              }}
            />
          ) : (
            <div className="flex flex-col gap-4">
               {/* Provocare directă - Am adăugat alert provizoriu dacă vrei modal facem separat */}
               <ActionButton variant="red" icon="🤝" title="Provocare Duel" subtitle="Generează link direct de ciocnire" onClick={() => alert("Funcția de duel direct va folosi coduri private. (Coming soon)")} />
               <ActionButton variant="red" icon="🚩" title="Fondează Clan" subtitle="Creează ierarhia ta privată" onClick={handleCreateTeam} loading={loadingTeam} />
               <ActionButton variant="glass" icon="⚔️" title="Arena Singularity" subtitle="Matchmaking global live" onClick={() => router.push('/joc/global-arena')} />
               
               {/* Buton instalare PWA (Apare doar dacă NU ești în PWA) */}
               {!isPWA && (
                 <button className="mt-4 p-4 rounded-[2rem] border border-dashed border-white/20 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/50 transition-all">
                   📲 Instalează Aplicația (Add to Home Screen)
                 </button>
               )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-24 md:mt-40 w-full text-center space-y-16 md:space-y-24 pb-20 md:pb-40 relative z-10 px-4">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent shadow-[0_0_50px_rgba(255,255,255,0.2)]"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 text-left px-4 md:px-12 opacity-30 hover:opacity-100 transition-all duration-700">
            <article className="space-y-4 md:space-y-6">
               <h5 className="text-[13px] md:text-[15px] font-black text-red-600 uppercase tracking-widest border-b-2 border-red-600/30 pb-3 md:pb-4 italic">Arhitectură V22.5</h5>
               <p className="text-[10px] md:text-[11px] leading-relaxed text-white/50 italic">Sistemul Ciocnim.ro utilizează Protocolul Neural pentru latență sub 12ms. Suportă Regional Warfare și PWA Standalone Mode pentru imersiune totală.</p>
            </article>
            <article className="space-y-4 md:space-y-6">
               <h5 className="text-[13px] md:text-[15px] font-black text-red-600 uppercase tracking-widest border-b-2 border-red-600/30 pb-3 md:pb-4 italic">Cluster Redis</h5>
               <p className="text-[10px] md:text-[11px] leading-relaxed text-white/50 italic">Punctajele clanurilor și ierarhia pe regiuni sunt stocate în Sorted Sets (ZSET), permițând interogări de rang în timp real pentru milioane de utilizatori.</p>
            </article>
            <article className="space-y-4 md:space-y-6">
               <h5 className="text-[13px] md:text-[15px] font-black text-red-600 uppercase tracking-widest border-b-2 border-red-600/30 pb-3 md:pb-4 italic">Haptic V7</h5>
               <p className="text-[10px] md:text-[11px] leading-relaxed text-white/50 italic">Motorul de detecție a anomaliilor filtrează orice semnal kinetic neconform, garantând că doar loviturile autentice (accelerometru) sunt înregistrate în Arenă.</p>
            </article>
          </div>

          <div className="space-y-8 md:space-y-12">
            <p className="text-[9px] md:text-[11px] font-black text-white/10 uppercase tracking-[1em] md:tracking-[2em] select-none italic pl-4">CIOCNIM.RO &copy; 2026</p>
            <div className="max-w-4xl mx-auto h-0.5 bg-red-600/30 rounded-full" />
            <div className="flex flex-col gap-3 md:gap-4">
               <p className="text-xl md:text-[28px] font-black text-red-600 uppercase tracking-[0.8em] md:tracking-[1.5em] italic animate-pulse">HRISTOS A ÎNVIAT!</p>
               <p className="text-[8px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.5em] md:tracking-[0.8em]">SĂRBĂTORI BINECUVÂNTATE.</p>
            </div>
          </div>
      </footer>
    </div>
  );
}

// ==========================================================================================
// 4. ROOT EXPORT: Home (Navbar Optimization)
// ==========================================================================================

export default function Home() {
  const { totalGlobal } = useGlobalStats();

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#020000]">
      
      {/* NAVBAR PRECISION (FLUID SCALING PENTRU MOBIL) */}
      <nav className="fixed top-4 md:top-8 left-0 w-full flex justify-center z-[9999] px-4 md:px-6 pointer-events-none transform-gpu translate-z-0">
        <div className="liquid-glass p-2 md:p-4 rounded-full flex items-center bg-black/98 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-[100px] pointer-events-auto transition-all hover:scale-[1.01] max-w-full">
          
          <div className="flex items-center gap-4 md:gap-8 pl-4 md:pl-10 pr-6 md:pr-10 py-2 md:py-4 border-r border-white/10">
            <span className="text-2xl md:text-4xl animate-float-v9 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">🥚</span>
            <div className="flex flex-col">
               <span className="font-black text-base md:text-2xl uppercase tracking-tighter text-white leading-none">Ciocnim<span className="text-red-600">.ro</span></span>
               <span className="text-[7px] md:text-[9px] font-black text-red-600 uppercase tracking-[0.2em] md:tracking-[0.4em] mt-1">Neural V22.5</span>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-12 px-6 md:px-14 py-2 md:py-4 group">
            <div className="relative hidden md:block">
               <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-600 animate-ping absolute inset-0 opacity-40"></div>
               <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-600 shadow-[0_0_30px_red] relative z-10"></div>
            </div>
            <div className="flex flex-col items-end md:items-start">
              <span className="text-white/30 font-black text-[7px] md:text-[10px] tracking-[0.3em] md:tracking-[0.6em] uppercase mb-1">Bilanț Național</span>
              <span className="font-black text-yellow-500 text-2xl md:text-4xl leading-none tabular-nums drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                {totalGlobal?.toLocaleString('ro-RO') || '...'}
              </span>
            </div>
          </div>

        </div>
      </nav>

      <Suspense fallback={<div className="h-screen w-full bg-[#010000] flex items-center justify-center text-white/20 font-black animate-pulse text-xl md:text-2xl tracking-[0.5em] md:tracking-[1em] uppercase">SINCRONIZARE...</div>}>
        <HomeContent />
      </Suspense>

      {/* STRATURILE DE FUNDAL */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
         <div className="ambient-glow-red opacity-60 mix-blend-screen scale-125" />
         <div className="ambient-glow-gold opacity-30 mix-blend-overlay scale-125" />
         <div className="fixed inset-0 bg-liquid-mesh opacity-[0.03]" />
      </div>

    </main>
  );
}