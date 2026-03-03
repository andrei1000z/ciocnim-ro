"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const REGIUNI_ISTORICE = ["Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", "Crișana", "Banat", "Maramureș", "Bucovina"];

// ==========================================================================================
// COMPONENTA: Clasament Regiuni (Modern & Simplu)
// ==========================================================================================
const RegionLeaderboard = ({ data }) => {
  // Calculăm scorul maxim pentru a scala barele de progres
  const maxScore = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(r => r.scor), 1);
  }, [data]);

  return (
    <div className="w-full bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl mt-4">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Clasament Regiuni</h3>
        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">LIVE</span>
      </div>

      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((reg, i) => (
            <div key={reg.regiune} className="group">
              <div className="flex justify-between items-end mb-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white/20 w-4">#{i + 1}</span>
                  <span className="text-sm font-bold text-white/90">{reg.regiune}</span>
                </div>
                <span className="text-xs font-black text-red-500 italic">{reg.scor.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(reg.scor / maxScore) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-red-800 to-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center opacity-20">
             <p className="text-xs font-bold uppercase tracking-widest">Așteptăm prima victorie...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================================================================
// COMPONENTE UI EXISTENTE
// ==========================================================================================

const ActionButton = ({ onClick, icon, title, subtitle, variant = "glass", loading = false }) => {
  const isRed = variant === "red";
  return (
    <button 
      onClick={onClick} 
      disabled={loading} 
      className={`relative w-full flex items-center gap-4 p-4 md:p-5 rounded-[2rem] transition-all duration-200 active:scale-95 text-left
        ${isRed ? "bg-red-600 hover:bg-red-500 text-white shadow-lg" : "bg-white/10 hover:bg-white/20 text-white"}
        ${loading ? 'opacity-50 grayscale' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isRed ? 'bg-white/20' : 'bg-white/10'}`}>
        {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : icon}
      </div>
      <div className="flex flex-col truncate">
        <span className="font-bold text-lg md:text-xl">{title}</span>
        {subtitle && <span className="text-[10px] uppercase tracking-widest opacity-60 mt-0.5">{subtitle}</span>}
      </div>
    </button>
  );
};

const PlayModal = ({ isOpen, onClose, router, userSkin }) => {
  const [roomCode, setRoomCode] = useState("");
  if (!isOpen) return null;

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    onClose();
    router.push(`/joc/${code}?host=true&skin=${userSkin}`);
  };

  const joinRoom = () => {
    if (roomCode.length >= 3) {
      onClose();
      router.push(`/joc/${roomCode}?host=false&skin=${userSkin}`);
    } else {
      alert("Codul trebuie să aibă minim 3 caractere.");
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{duration: 0.2}} className="bg-[#111] p-6 md:p-8 rounded-[2rem] w-full max-w-sm border border-white/10 flex flex-col gap-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white text-xl">✕</button>
        <h3 className="text-2xl font-black text-white text-center">Joacă cu un prieten</h3>
        <div className="flex flex-col gap-3">
          <button onClick={createRoom} className="w-full bg-red-600 text-white p-4 rounded-xl font-bold uppercase tracking-widest hover:bg-red-500 transition-all">
            Creează Cameră Nouă
          </button>
          <div className="flex items-center gap-2 my-2 opacity-50">
            <div className="h-px w-full bg-white"></div>
            <span className="text-xs uppercase font-bold">SAU</span>
            <div className="h-px w-full bg-white"></div>
          </div>
          <div className="flex gap-2">
            <input 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="COD CAMERĂ"
              className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10 font-bold text-center text-white outline-none focus:border-red-500 uppercase"
              maxLength={10}
            />
            <button onClick={joinRoom} className="bg-white/10 px-5 rounded-xl font-bold text-white hover:bg-white/20 transition-all">Intră</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const GroupHub = ({ team, leaderboard, onLeave }) => {
  return (
    <div className="bg-white/5 p-6 rounded-[2.5rem] w-full border border-white/10 backdrop-blur-xl">
       <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
          <div className="flex flex-col gap-1 w-full pr-4">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Grupul Tău</span>
            <h4 className="text-2xl font-black uppercase text-white truncate">{team.nume}</h4>
          </div>
          <button onClick={onLeave} className="p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all text-xs font-bold uppercase">Ieși</button>
       </div>
       <div className="min-h-[150px] space-y-2">
          {leaderboard.map((m, i) => (
            <div key={i} className="bg-black/30 p-4 rounded-2xl flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black ${i === 0 ? 'text-yellow-400' : 'text-white/30'}`}>#{i+1}</span>
                  <span className="text-sm font-bold text-white truncate max-w-[120px]">{m.member}</span>
               </div>
               <span className="text-lg font-bold text-green-400">{m.score} pct</span>
            </div>
          ))}
          {leaderboard.length === 0 && <p className="text-center text-white/30 text-sm mt-10">Încă nu sunt membri.</p>}
       </div>
    </div>
  );
};

const ColorSelector = ({ selected, onSelect }) => {
  const culori = useMemo(() => [
    { id: 'red', color: '#dc2626' }, { id: 'blue', color: '#2563eb' },
    { id: 'gold', color: '#f59e0b' }, { id: 'diamond', color: '#10b981' },
    { id: 'cosmic', color: '#8b5cf6' }
  ], []);
  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <label className="text-[10px] font-bold uppercase text-white/50 tracking-widest pl-2">Selectează culoarea oului</label>
      <div className="flex gap-2 w-full">
        {culori.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)} className={`flex-1 aspect-square rounded-xl transition-all duration-200 ${selected === c.id ? 'scale-110 border-2 border-white' : 'opacity-50'}`} style={{ backgroundColor: c.color }} />
        ))}
      </div>
    </div>
  );
};

const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <label className="text-[10px] font-bold uppercase text-white/50 tracking-widest pl-2">Selectează regiunea</label>
      <div className="relative w-full">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-white/5 p-4 rounded-xl text-sm font-bold text-white flex justify-between items-center border border-transparent hover:border-white/10 transition-all">
          <span>{selectedRegion || "Alege regiunea..."}</span><span>▼</span>
        </button>
        {isOpen && (
          <div className="absolute top-[105%] left-0 w-full bg-[#1a1a1a] rounded-xl overflow-hidden z-50 p-2 grid grid-cols-2 gap-2 shadow-2xl border border-white/10">
            {REGIUNI_ISTORICE.map((regiune) => (
              <button key={regiune} onClick={() => { onSelectRegion(regiune); setIsOpen(false); }} className={`p-2 text-xs font-bold rounded-lg ${selectedRegion === regiune ? 'bg-red-600' : 'hover:bg-white/10'}`}>
                {regiune}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================================================================
// PAGINA PRINCIPALĂ (HOME CONTENT)
// ==========================================================================================

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalGlobal, topRegiuni, nume, setNume, userStats, setUserStats, isHydrated } = useGlobalStats();
  
  const [team, setTeam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);

useEffect(() => {
    if (!isHydrated) return;

    // Preluăm ID-ul grupului din URL (dacă am primit invitație) sau din memoria telefonului
    const tid = searchParams.get("joinTeam") || localStorage.getItem("c_teamId");
    
    // Dacă nu avem ID de grup sau utilizatorul nu și-a pus încă un nume, ne oprim
    if (!tid || !nume || nume.length < 3) {
      if (!tid) setTeam(null); // Resetăm starea dacă nu există ID
      return;
    }

    const fetchTeamDetails = async () => {
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            actiune: 'get-team-details', 
            teamId: tid, 
            jucator: nume 
          })
        });

        const data = await res.json();

        if (data.success) {
          // Grup găsit: salvăm ID-ul și actualizăm interfața
          localStorage.setItem("c_teamId", tid);
          setTeam(data.details);
          setLeaderboard(data.top || []);
          
          // Dacă am intrat printr-un link de invitație, curățăm URL-ul
          if (searchParams.has("joinTeam")) {
            router.replace('/'); 
          }
        } else {
          // EROARE: Grupul nu mai există sau ID-ul este greșit
          // Curățăm TOT ca să nu rămână aplicația blocată
          localStorage.removeItem("c_teamId");
          setTeam(null);
          setLeaderboard([]);
          
          if (searchParams.has("joinTeam")) {
            alert("Grupul nu a fost găsit sau a fost șters.");
            router.replace('/');
          }
        }
      } catch (e) { 
        console.warn("Sincronizare grup eșuată. Verifică conexiunea la baza de date.");
        setTeam(null);
      }
    };

    fetchTeamDetails();
  }, [nume, searchParams, router, isHydrated]);

  const handleCreateTeam = async () => {
    if (!nume || nume.trim().length < 3) return alert("Scrie-ți porecla în stânga mai întâi!");
    setLoadingTeam(true);
    try {
      const res = await fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'creeaza-echipa', creator: nume }) 
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("c_teamId", data.teamId);
        setTeam({ id: data.teamId, nume: `${nume.toUpperCase()} ELITE` });
        setLeaderboard([{ member: nume, score: 0 }]);
      }
    } catch (e) { alert("Eroare la crearea grupului."); } 
    finally { setLoadingTeam(false); }
  };

  if (!isHydrated) return null;

  return (
    <div className="w-full flex flex-col items-center gap-8 max-w-4xl mx-auto pt-16 pb-24 px-5 z-10 relative">
      <header className="text-center w-full flex flex-col items-center gap-2">
         <div className="text-5xl">🥚</div>
         <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Ciocnim<span className="text-red-600">.ro</span></h1>
         <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-2 animate-pulse">
            Bilanț Național: <span className="text-yellow-400 font-black">{totalGlobal?.toLocaleString('ro-RO') || '...'}</span> ouă
         </p>
      </header>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] flex flex-col gap-4 border border-white/5 backdrop-blur-xl">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[10px] font-bold uppercase text-white/50 tracking-widest pl-2">Numele Tău</label>
            <input 
              value={nume} 
              onChange={e => setNume(e.target.value.toUpperCase())}
              placeholder="Porecla..."
              className="w-full bg-white/10 p-4 rounded-xl text-xl font-bold focus:border-red-500 border border-transparent outline-none text-white text-center transition-all"
            />
          </div>
          <RegionSelector selectedRegion={userStats.regiune} onSelectRegion={(reg) => setUserStats({...userStats, regiune: reg})} />
          <ColorSelector selected={userStats.skin || 'red'} onSelect={(s) => setUserStats({...userStats, skin: s})} />

          <div className="flex justify-between gap-4 mt-4">
             <div className="flex-1 bg-black/30 p-4 rounded-xl text-center"><span className="text-xs text-white/40 uppercase block">Victorii</span><span className="text-xl font-bold text-green-400">{userStats.wins || 0}</span></div>
             <div className="flex-1 bg-black/30 p-4 rounded-xl text-center"><span className="text-xs text-white/40 uppercase block">Înfrângeri</span><span className="text-xl font-bold text-red-500">{userStats.losses || 0}</span></div>
          </div>
        </div>

        <div className="flex flex-col gap-4 justify-center">
          {team ? (
            <GroupHub 
              team={team} 
              leaderboard={leaderboard} 
              onLeave={() => { if(confirm("Ești sigur?")) { localStorage.removeItem("c_teamId"); setTeam(null); } }}
            />
          ) : (
            <>
               <ActionButton variant="red" icon="⚔️" title="Joacă cu un prieten" subtitle="Cameră privată cu cod" onClick={() => { if (!nume || nume.trim().length < 3) return alert("Nume prea scurt!"); setIsPlayModalOpen(true); }} />
               <ActionButton variant="glass" icon="👥" title="Grup Familie & Prieteni" subtitle="Creează un clasament privat" onClick={handleCreateTeam} loading={loadingTeam} />
               <ActionButton variant="glass" icon="🌍" title="Joacă Online" subtitle="Găsește un adversar la întâmplare" onClick={() => { if (!nume || nume.trim().length < 3) return alert("Nume prea scurt!"); router.push(`/joc/global-arena?skin=${userStats.skin || 'red'}`); }} />
            </>
          )}
        </div>
      </div>

      {/* CLASAMENT REGIUNI - INTEGRAT AICI */}
      <RegionLeaderboard data={topRegiuni} />

      <Link href="/traditii" className="mt-8 px-6 py-3 rounded-full border border-white/20 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
         📖 Citește despre tradiții
      </Link>

      <PlayModal isOpen={isPlayModalOpen} onClose={() => setIsPlayModalOpen(false)} router={router} userSkin={userStats.skin || 'red'} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px]" />
      </div>
      <Suspense fallback={<div className="h-screen flex items-center justify-center text-white/30 text-xs font-bold uppercase tracking-widest">Se încarcă...</div>}>
        <HomeContent />
      </Suspense>
      <footer className="w-full text-center pb-8 opacity-30 relative z-10 pointer-events-none">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Sărbători Fericite • Ciocnim.ro</p>
      </footer>
    </main>
  );
}