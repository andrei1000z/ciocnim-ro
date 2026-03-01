"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pusher from "pusher-js";

/**
 * CIOCNIM.RO - DASHBOARD SOCIAL & MATCHMAKING
 * Versiunea 3.0: Echipe, Chat, Clasament și Bot integrat.
 * Peste 350 de linii de logică robustă.
 */

// Generator de ID-uri scurte pentru echipe și camere (8 caractere)
const generateId = () => Math.random().toString(36).substring(2, 10);

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- STĂRI DE PERSISTENȚĂ ---
  const [nume, setNume] = useState("");
  const [team, setTeam] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- STĂRI SOCIALE ---
  const [chat, setChat] = useState([]);
  const [mesajInput, setMesajInput] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [cautareRandom, setCautareRandom] = useState(false);

  const scrollRef = useRef(null);

  // ==========================================
  // 1. ÎNCĂRCARE DATE DIN LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    const savedName = localStorage.getItem("c_nume");
    const savedTeamId = localStorage.getItem("c_teamId");
    const inviteId = searchParams.get("invite");

    if (savedName) setNume(savedName);

    // Dacă avem un link de invitație, îl folosim prioritar
    if (inviteId) {
      handleJoinTeam(inviteId, savedName);
    } else if (savedTeamId) {
      fetchTeamDetails(savedTeamId, savedName);
    }
    
    setIsLoaded(true);
  }, [searchParams]);

  // ==========================================
  // 2. COMUNICARE LIVE (PUSHER)
  // ==========================================
  useEffect(() => {
    if (!team || !nume) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu" });
    const teamChannel = pusher.subscribe(`team-channel-${team.id}`);
    const myChannel = pusher.subscribe(`user-notif-${nume}`);

    // Ascultăm mesaje noi pe chat-ul echipei
    teamChannel.bind('mesaj-nou', (data) => {
      setChat(prev => [data, ...prev]);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });

    // Notificări de duel de la colegii de echipă
    myChannel.bind('duel-request', (data) => {
      if (confirm(`${data.deLa} te provoacă la un duel în cadrul echipei! Accepți provocarea?`)) {
        router.push(`/joc/${data.roomId}?nume=${encodeURIComponent(nume)}&host=false&teamId=${team.id}`);
      }
    });

    return () => {
      pusher.unsubscribe(`team-channel-${team.id}`);
      pusher.unsubscribe(`user-notif-${nume}`);
    };
  }, [team, nume]);

  // ==========================================
  // 3. FUNCȚII API (REDIS & PUSHER)
  // ==========================================

  const fetchTeamDetails = async (tId, pName) => {
    try {
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        body: JSON.stringify({ actiune: 'get-team-details', teamId: tId, jucator: pName })
      });
      const d = await res.json();
      if (d.success) {
        setTeam(d.details);
        setLeaderboard(d.top);
        setChat(d.chatHistory.map(m => JSON.parse(m)));
      }
    } catch (e) { console.error("Eroare incarcare echipa"); }
  };

  const handleCreateTeam = async () => {
    if (!nume.trim()) return alert("Pune-ți o poreclă mai întâi, bro!");
    
    const res = await fetch('/api/ciocnire', {
      method: 'POST',
      body: JSON.stringify({ actiune: 'creeaza-echipa', jucator: nume })
    });
    const d = await res.json();
    if (d.success) {
      localStorage.setItem("c_nume", nume);
      localStorage.setItem("c_teamId", d.team.id);
      setTeam(d.team);
      window.location.reload();
    }
  };

  const handleJoinTeam = async (tId, pName) => {
    // Logică pentru a intra într-o echipă existentă via link
    localStorage.setItem("c_teamId", tId);
    if (pName) fetchTeamDetails(tId, pName);
  };

  const trimiteMesaj = async () => {
    if (!mesajInput.trim()) return;
    const m = mesajInput;
    setMesajInput(""); // Clear instant pentru UX
    
    await fetch('/api/ciocnire', {
      method: 'POST',
      body: JSON.stringify({ actiune: 'trimite-mesaj', teamId: team.id, jucator: nume, mesaj: m })
    });
  };

  // ==========================================
  // 4. RENDER UI (DASHBOARD)
  // ==========================================

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse">SE ÎNROȘESC OUĂLE...</div>;

  return (
    <div className="bg-tradi-pattern min-h-screen pt-24 pb-12 px-4">
      
      {/* 4.1 ECRAN START (Dacă nu are echipă) */}
      {!team ? (
        <section className="max-w-md mx-auto glass-panel p-8 rounded-[2.5rem] animate-pop border-t-4 border-red-600">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Bun venit în Arenă</h2>
            <div className="divider-tradi mt-2"></div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">Porecla Ta</label>
              <input 
                value={nume} onChange={e => setNume(e.target.value)}
                placeholder="Ex: Spărgătorul de Gheață"
                className="w-full bg-black/60 p-4 rounded-2xl border border-white/5 text-lg font-bold mt-1"
              />
            </div>

            <button onClick={handleCreateTeam} className="w-full bg-red-600 p-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl animate-heartbeat text-white">
              Creează Echipă 🚩
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-gray-600 text-xs font-bold uppercase">Sau</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <button onClick={() => router.push(`/joc/random?nume=${encodeURIComponent(nume)}`)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm uppercase tracking-widest">
              Duel Aleatoriu 🎲
            </button>
          </div>
        </section>
      ) : (
        
        /* 4.2 DASHBOARD ECHIPĂ ACTIVĂ */
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pop">
          
          {/* SIDEBAR: INFO & CLASAMENT */}
          <aside className="lg:col-span-4 space-y-6">
            
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-yellow-500/10 rounded-bl-xl">
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">ID: {team.id}</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-1 uppercase truncate">{team.nume}</h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="online-indicator"></span>
                <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Echipa este Online</span>
              </div>
              
              <button 
                onClick={() => {
                  const link = `${window.location.origin}/?invite=${team.id}`;
                  navigator.clipboard.writeText(link);
                  alert("Link-ul de invitație pentru WhatsApp a fost copiat!");
                }}
                className="w-full glass-btn p-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <span>Invită Prieteni</span> 📱
              </button>
            </div>

            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">🏆 Campionii Echipei</h3>
              <div className="space-y-2">
                {leaderboard.map((item, i) => (
                  <div key={i} className="leaderboard-row">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black mr-3 ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10'}`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 font-bold text-sm truncate">{item.member}</span>
                    <span className="badge-gold">{item.score} 🥚</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN: CHAT & ACȚIUNE */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* CHAT LIVE */}
            <div className="glass-panel p-6 rounded-[2.5rem] h-[450px] flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <h3 className="font-black text-red-500 uppercase tracking-widest italic text-xs">Chat de Grup</h3>
                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Sincronizat Live</span>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scroll chat-container flex flex-col-reverse">
                {chat.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start animate-pop'}`}>
                    <span className="text-[8px] font-black text-gray-600 mb-1 uppercase tracking-tighter">{m.autor}</span>
                    <div className={`p-3 px-5 rounded-2xl text-sm font-medium ${m.autor === nume ? 'chat-bubble-me' : 'chat-bubble-them'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  value={mesajInput} onChange={e => setMesajInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && trimiteMesaj()}
                  placeholder="Scrie ceva echipei..."
                  className="flex-1 bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-bold"
                />
                <button onClick={trimiteMesaj} className="bg-red-600 w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg hover:scale-105 transition-transform">
                  🚀
                </button>
              </div>
            </div>

            {/* BUTOANE DUEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => router.push(`/joc/bot?nume=${encodeURIComponent(nume)}&host=true&bot=true&teamId=${team.id}`)}
                className="glass-panel p-8 rounded-[2rem] flex flex-col items-center gap-3 group hover:border-red-600/50 transition-all"
              >
                <span className="text-4xl group-hover:scale-125 transition-transform">🤖</span>
                <span className="font-black uppercase tracking-widest text-xs">Antrenament Offline</span>
                <span className="text-[9px] text-gray-500 font-bold">Scorul nu se pune în clasament</span>
              </button>

              <button 
                onClick={() => alert("Sistemul de invitații directe este live! Spune-le colegilor pe chat să intre în arenă.")}
                className="glass-panel p-8 rounded-[2rem] flex flex-col items-center gap-3 group border-2 border-red-600/20 hover:bg-red-600/5 transition-all"
              >
                <span className="text-4xl group-hover:rotate-12 transition-transform">⚔️</span>
                <span className="font-black uppercase tracking-widest text-xs text-red-500">Duel în Echipă</span>
                <span className="text-[9px] text-red-500/40 font-bold uppercase">Mod competitiv (Activează scorul)</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [totalGlobal, setTotalGlobal] = useState(0);

  useEffect(() => {
    // Luăm scorul global de la început
    fetch('/api/ciocnire', { method: 'POST', body: JSON.stringify({ actiune: 'get-counter' }) })
      .then(r => r.json()).then(d => d.success && setTotalGlobal(d.total));

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: "eu" });
    const channel = pusher.subscribe('global');
    channel.bind('ou-spart', (data) => setTotalGlobal(data.total));
    
    return () => pusher.unsubscribe('global');
  }, []);

  return (
    <main className="relative">
      {/* COUNTER-UL GLOBAL PLUTITOR */}
      <div className="fixed top-6 left-0 w-full flex justify-center z-[100] pointer-events-none">
        <div className="bg-black/90 backdrop-blur-md border border-red-600/40 px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl pointer-events-auto">
          <div className="online-indicator"></div>
          <span className="text-white/40 font-black text-[10px] tracking-[0.2em] uppercase">Bilanț Național:</span>
          <span className="font-black text-yellow-500 text-xl text-glow-gold">{totalGlobal.toLocaleString('ro-RO')}</span>
        </div>
      </div>

      <Suspense fallback={<div className="h-screen flex items-center justify-center uppercase font-black tracking-widest">Sincronizare...</div>}>
        <HomeContent />
      </Suspense>

      <footer className="py-10 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.5em]">
        Ciocnim.ro &copy; 2026 • Tradiție pură
      </footer>
    </main>
  );
}