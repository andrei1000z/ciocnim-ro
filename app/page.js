"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pusher from "pusher-js";

/**
 * ==========================================================================
 * CIOCNIM.RO - DASHBOARD SOCIAL ELITE (VERSION 4.0)
 * Hub-ul central pentru Echipe, Chat Global și Matchmaking Competitiv.
 * Proiectat pentru performanță maximă pe Next.js 15+ și Tailwind v4.
 * ==========================================================================
 */

// --- UTILITARE HELPER ---
const generateShortId = () => Math.random().toString(36).substring(2, 10).toUpperCase();

/**
 * COMPONENTA PRINCIPALĂ DE CONȚINUT
 * Folosim Suspense pentru a gestiona searchParams fără a bloca randarea serverului.
 */
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef(null);
  
  // --- STĂRI DE IDENTITATE ȘI PERSISTENȚĂ ---
  const [nume, setNume] = useState("");
  const [team, setTeam] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // --- STĂRI SOCIALE ȘI REAL-TIME ---
  const [chat, setChat] = useState([]);
  const [mesajInput, setMesajInput] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [cautareRandom, setCautareRandom] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);

  // ==========================================================================
  // 1. INIȚIALIZARE ȘI RECUPERARE DATE (LOCAL STORAGE)
  // ==========================================================================
  useEffect(() => {
    const savedName = localStorage.getItem("c_nume");
    const savedTeamId = localStorage.getItem("c_teamId");
    const inviteId = searchParams.get("invite");

    if (savedName) setNume(savedName);

    // Prioritizăm invitația de pe link dacă există
    if (inviteId) {
      handleJoinViaInvite(inviteId, savedName);
    } else if (savedTeamId) {
      fetchTeamDetails(savedTeamId, savedName);
    }
    
    setIsLoaded(true);
  }, [searchParams]);

  // ==========================================================================
  // 2. LOGICA PUSHER (CANALE TEAM, USER ȘI GLOBAL)
  // ==========================================================================
  useEffect(() => {
    if (!team || !nume) return;

    // Inițializăm conexiunea Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu"
    });

    // Subscriere la canalul echipei pentru CHAT și UPDATE-URI SCOR
    const teamChannel = pusher.subscribe(`team-channel-${team.id}`);
    
    // Subscriere la canalul privat al utilizatorului pentru INVITAȚII DUEL
    const myChannel = pusher.subscribe(`user-notif-${nume}`);

    // Handler: Mesaj nou în chat
    teamChannel.bind('mesaj-nou', (data) => {
      setChat(prev => [data, ...prev]);
      // Auto-scroll la ultimul mesaj
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // Handler: Provocare la duel de la un membru al echipei
    myChannel.bind('duel-request', (data) => {
      if (confirm(`⚔️ ${data.deLa} te provoacă la un duel în ${team.nume}! Ești gata să ciocnești?`)) {
        router.push(`/joc/${data.roomId}?nume=${encodeURIComponent(nume)}&host=false&teamId=${team.id}`);
      }
    });

    // Heartbeat pentru status online (Update la 15 secunde)
    const interval = setInterval(() => {
      fetch('/api/ciocnire', { 
        method: 'POST', 
        body: JSON.stringify({ actiune: 'update-online', teamId: team.id, jucator: nume }) 
      });
    }, 15000);

    return () => {
      pusher.unsubscribe(`team-channel-${team.id}`);
      pusher.unsubscribe(`user-notif-${nume}`);
      clearInterval(interval);
    };
  }, [team, nume, router]);

  // ==========================================================================
  // 3. FUNCȚII API ȘI MANIPULARE DATE (REDIS INTEGRATION)
  // ==========================================================================

  const fetchTeamDetails = async (tId, pName) => {
    try {
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'get-team-details', teamId: tId, jucator: pName })
      });
      const d = await res.json();
      if (d.success) {
        setTeam(d.details);
        setLeaderboard(d.top || []);
        setChat(d.chatHistory?.map(m => typeof m === 'string' ? JSON.parse(m) : m) || []);
      } else {
        setIsError(true);
      }
    } catch (e) {
      console.error("Eroare critică la încărcarea echipei:", e);
      setIsError(true);
    }
  };

  const handleCreateTeam = async () => {
    if (!nume.trim() || nume.length < 3) return alert("Porecla trebuie să aibă minim 3 caractere!");
    
    try {
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'creeaza-echipa', jucator: nume })
      });
      const d = await res.json();
      if (d.success) {
        localStorage.setItem("c_nume", nume);
        localStorage.setItem("c_teamId", d.team.id);
        setTeam(d.team);
        router.refresh(); // Reîncărcăm starea serverului
      }
    } catch (e) { alert("Eroare la crearea echipei. Încearcă din nou."); }
  };

  const handleJoinViaInvite = (tId, pName) => {
    localStorage.setItem("c_teamId", tId);
    if (pName) fetchTeamDetails(tId, pName);
  };

  const handleLeaveTeam = () => {
    if (confirm("Sigur vrei să părăsești echipa? Progresul tău va rămâne, dar nu vei mai vedea chat-ul.")) {
      localStorage.removeItem("c_teamId");
      setTeam(null);
      setChat([]);
      setLeaderboard([]);
    }
  };

  const trimiteMesaj = async () => {
    if (!mesajInput.trim()) return;
    const currentMsg = mesajInput;
    setMesajInput(""); // Optimistic UI clear
    
    try {
      await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'trimite-mesaj', teamId: team.id, jucator: nume, mesaj: currentMsg })
      });
    } catch (e) { console.error("Mesaj netrimis"); }
  };

  const toggleCautareRandom = () => {
    setCautareRandom(!cautareRandom);
    if (!cautareRandom) {
      // Simulăm o căutare vizuală înainte de redirect
      setTimeout(() => {
        router.push(`/joc/random?nume=${encodeURIComponent(nume)}`);
      }, 2500);
    }
  };

  // ==========================================================================
  // 4. RENDER UI (INTERFAȚA DE ELITĂ)
  // ==========================================================================

  if (!isLoaded) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0000]">
      <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-black uppercase tracking-[0.3em] text-white/50 animate-pulse">Sincronizare...</p>
    </div>
  );

  return (
    <div className="bg-tradi-pattern min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      
      {/* --- 4.1 LOGARE / CREARE ECHIPĂ (MODAL) --- */}
      {!team ? (
        <section className="max-w-md mx-auto glass-panel p-10 rounded-[3rem] animate-pop border-t-8 border-red-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <header className="text-center mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Arena Ciocnim.ro</h2>
            <div className="divider-tradi mt-4 opacity-50"></div>
          </header>
          
          <div className="space-y-8">
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em] ml-2 mb-2 block">Cine ești?</label>
              <input 
                value={nume} onChange={e => setNume(e.target.value)}
                placeholder="Porecla ta de luptător..."
                className="w-full bg-black/60 p-5 rounded-[1.5rem] border border-white/10 text-xl font-bold focus:border-red-600 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-4">
              <button onClick={handleCreateTeam} className="w-full bg-gradient-to-b from-red-600 to-red-800 p-6 rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(220,38,38,0.3)] animate-heartbeat">
                Creează Echipă 🚩
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-white/10"></div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">sau joacă singur</span>
                <div className="h-[1px] flex-1 bg-white/10"></div>
              </div>

              <button 
                onClick={() => router.push(`/joc/random?nume=${encodeURIComponent(nume)}`)}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Duel Rapid 🎲
              </button>
            </div>
          </div>
        </section>
      ) : (
        
        /* --- 4.2 DASHBOARD ACTIV (TEAM VIEW) --- */
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pop">
          
          {/* SIDEBAR STÂNGA: PROFIL ȘI LIDERI */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Card Echipa Mea */}
            <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden border-l-8 border-red-600">
              <div className="absolute top-0 right-0 p-3 bg-red-600/10 rounded-bl-2xl">
                <span className="text-[9px] font-black text-red-500 uppercase">ID Echipă: {team.id}</span>
              </div>
              
              <h2 className="text-3xl font-black text-white mb-2 uppercase truncate pr-10 tracking-tighter">{team.nume}</h2>
              
              <div className="flex items-center gap-2 mb-8">
                <span className="online-indicator"></span>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Echipă activă</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    const link = `${window.location.origin}/?invite=${team.id}`;
                    navigator.clipboard.writeText(link);
                    alert("Link-ul de invitație a fost copiat! Trimite-l prietenilor.");
                  }}
                  className="glass-btn p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  Invită 📱
                </button>
                <button 
                  onClick={handleLeaveTeam}
                  className="bg-white/5 hover:bg-red-950/30 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/40 hover:text-red-500 transition-all"
                >
                  Părăsește
                </button>
              </div>
            </div>

            {/* Clasament Intern */}
            <div className="glass-panel p-8 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">🏆 Top Spărgători</h3>
                <span className="text-[9px] font-bold text-yellow-500 uppercase bg-yellow-500/10 px-2 py-1 rounded">Live</span>
              </div>
              
              <div className="space-y-3">
                {leaderboard.length > 0 ? leaderboard.map((item, i) => (
                  <div key={i} className="leaderboard-row group">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black mr-4 ${i === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-white/5 text-white/40'}`}>
                      {i + 1}
                    </div>
                    <span className="flex-1 font-bold text-sm text-white/80 group-hover:text-white transition-colors">{item.member}</span>
                    <span className="badge-gold">{item.score} 🥚</span>
                  </div>
                )) : (
                  <p className="text-center text-xs text-white/20 py-4 italic">Încă nu sunt scoruri înregistrate...</p>
                )}
              </div>
            </div>
          </aside>

          {/* SECȚIUNEA CENTRALĂ: CHAT ȘI ACȚIUNE */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Fereastră de Chat */}
            <div className="glass-panel p-8 rounded-[3rem] h-[550px] flex flex-col relative overflow-hidden shadow-2xl">
              <header className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs italic">Mesagerie Echipă</h3>
                </div>
                <button onClick={() => setChat([])} className="text-[9px] font-black text-white/20 uppercase hover:text-white">Curăță chat</button>
              </header>

              {/* Container Mesaje */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scroll chat-container flex flex-col-reverse">
                {chat.length > 0 ? chat.map((m, i) => (
                  <article key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start animate-pop'}`}>
                    <span className="text-[8px] font-black text-gray-500 mb-1 uppercase tracking-tighter ml-2 mr-2">
                      {m.autor} • {new Date(m.t || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`p-4 px-6 rounded-[1.5rem] text-sm font-medium max-w-[80%] ${m.autor === nume ? 'chat-bubble-me' : 'chat-bubble-them'}`}>
                      {m.text}
                    </div>
                  </article>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <span className="text-4xl mb-2">💬</span>
                    <p className="text-xs font-bold uppercase tracking-widest">Niciun mesaj încă.<br/>Fii tu primul care scrie!</p>
                  </div>
                )}
              </div>

              {/* Input Chat */}
              <div className="flex gap-3 items-center bg-black/40 p-2 rounded-[2rem] border border-white/5 focus-within:border-red-600/50 transition-all">
                <input 
                  value={mesajInput} onChange={e => setMesajInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && trimiteMesaj()}
                  placeholder="Scrie ceva familiei tale..."
                  className="flex-1 bg-transparent border-none p-4 rounded-2xl text-sm font-bold placeholder:text-white/20"
                />
                <button onClick={trimiteMesaj} className="bg-red-600 hover:bg-red-500 w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-90">
                  <span className="text-xl">🚀</span>
                </button>
              </div>
            </div>

            {/* Selector Mod de Joc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button 
                onClick={() => router.push(`/joc/bot?nume=${encodeURIComponent(nume)}&host=true&bot=true&teamId=${team.id}`)}
                className="glass-panel p-10 rounded-[2.5rem] flex flex-col items-center gap-4 group hover:border-red-600/50 transition-all shadow-xl"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-300">🤖</div>
                <div className="text-center">
                  <span className="font-black uppercase tracking-[0.2em] text-xs block mb-1">Mod Antrenament</span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase">Joacă cu AI-ul offline</span>
                </div>
              </button>

              <button 
                onClick={toggleCautareRandom}
                className={`glass-panel p-10 rounded-[2.5rem] flex flex-col items-center gap-4 group border-2 transition-all shadow-xl relative overflow-hidden ${cautareRandom ? 'border-red-600' : 'border-red-600/20'}`}
              >
                {cautareRandom && <div className="animate-scan absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-red-600 to-transparent"></div>}
                <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-125 transition-all duration-300">
                  {cautareRandom ? '🛰️' : '⚔️'}
                </div>
                <div className="text-center">
                  <span className="font-black uppercase tracking-[0.2em] text-xs block mb-1 text-red-500">Duel Rapid</span>
                  <span className="text-[9px] text-red-500/50 font-black uppercase">
                    {cautareRandom ? 'Scanăm Arena...' : 'Matchmaking Global'}
                  </span>
                </div>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

/**
 * COMPONENTA ROOT HOME
 * Gestionează Counter-ul Global și randarea Suspense.
 */
export default function Home() {
  const [totalGlobal, setTotalGlobal] = useState(0);

  useEffect(() => {
    // Preluăm statistica națională inițială
    fetch('/api/ciocnire', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actiune: 'get-counter' }) 
    })
    .then(r => r.json())
    .then(d => { if (d.success) setTotalGlobal(d.total); });

    // Ne conectăm la canalul global pentru actualizări live
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu" });
    const globalChannel = pusher.subscribe('global');
    
    globalChannel.bind('ou-spart', (data) => {
      setTotalGlobal(data.total);
    });
    
    return () => {
      pusher.unsubscribe('global');
      pusher.disconnect();
    };
  }, []);

  return (
    <main className="relative selection:bg-red-600 selection:text-white">
      
      {/* --- HEADER PLUTITOR: STATISTICI NAȚIONALE --- */}
      <div className="fixed top-8 left-0 w-full flex justify-center z-[100] pointer-events-none px-4">
        <article className="bg-black/90 backdrop-blur-xl border border-red-600/40 px-8 py-3 rounded-full flex items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
          <div className="online-indicator"></div>
          <div className="flex flex-col">
            <span className="text-white/30 font-black text-[8px] tracking-[0.3em] uppercase leading-none mb-1">Bilanț Național</span>
            <span className="font-black text-yellow-500 text-2xl leading-none text-glow-gold">
              {totalGlobal.toLocaleString('ro-RO')} <span className="text-[10px] text-white/50 ml-1">OUĂ</span>
            </span>
          </div>
        </article>
      </div>

      <Suspense fallback={
        <div className="h-screen flex items-center justify-center bg-[#0a0000]">
          <span className="text-xs font-black text-white/20 uppercase tracking-[0.5em] animate-pulse">Sincronizare Arena...</span>
        </div>
      }>
        <HomeContent />
      </Suspense>

      <footer className="py-16 text-center">
        <div className="divider-tradi w-32 mx-auto mb-6 opacity-20"></div>
        <p className="opacity-20 text-[9px] font-black uppercase tracking-[0.6em] text-white">
          Ciocnim.ro &copy; 2026 • Creat pentru Tradiție
        </p>
      </footer>
    </main>
  );
}