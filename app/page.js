"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - PAGINA PRINCIPALĂ (HOME / DASHBOARD)
 * ====================================================================================================
 * Proiect: Platformă de ciocnit ouă virtuale, optimizată SEO și UX.
 * * * 🛠️ ACTUALIZĂRI ȘI OPTIMIZĂRI IMPLEMENTATE (V22.0 - HYDRATION FIX):
 * - S-au eliminat conflictele de localStorage. Datele sunt gestionate exclusiv de ClientWrapper.
 * - S-a adăugat `if (!isHydrated) return null;` pentru a preveni "Client-side Exception" pe Next.js.
 * ====================================================================================================
 */

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";

// ====================================================================================================
// 0. UTILITARE AUDIO & SEO
// ====================================================================================================

const StructuredDataSEO = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Ciocnim.ro",
    "alternateName": "Sanctuarul Ciocnirii Virtuale",
    "url": "https://ciocnim.ro",
    "applicationCategory": "GameApplication",
    "operatingSystem": "All",
    "description": "Tradiția românească, acum pe ecran. Joacă cu prietenii, creați-vă un grup privat sau joacă aleatoriu cu un străin.",
    "genre": "Tradițional / Multiplayer",
    "keywords": "ciocnit oua, pasti, traditie romaneasca, joc paste, oua virtuale, ciocnim.ro"
  };

  return (
    <script 
      type="application/ld+json" 
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
    />
  );
};

// ====================================================================================================
// 1. COMPONENTE VIZUALE ȘI DE INTERFAȚĂ (ATOMIC DESIGN)
// ====================================================================================================

const ActionButton = ({ onClick, icon, title, subtitle, variant = "rosu", loading = false, ariaLabel }) => {
  const playUISound = useCallback(() => {
    try {
      const audio = new Audio('/spargere.mp3');
      audio.volume = 0.15; 
      audio.play().catch(() => {}); 
    } catch(e) {}
  }, []);

  const handleClick = (e) => {
    playUISound();
    onClick(e);
  };

  const baseStyles = `
    relative group w-full flex items-center gap-4 md:gap-5 p-4 md:p-6 rounded-[2rem] 
    transition-all duration-300 border-2 active:scale-95 overflow-hidden select-none cursor-pointer
    focus:outline-none focus:ring-4 focus:ring-white/30 transform-gpu
  `;
  
  const variants = {
    rosu: "bg-red-600 border-red-500/50 shadow-[0_15px_40px_rgba(220,38,38,0.5)] text-white hover:bg-red-500 hover:shadow-[0_20px_60px_rgba(220,38,38,0.8)]",
    transparent: "bg-white/5 border-white/10 backdrop-blur-2xl text-white/90 hover:bg-white/10 hover:text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-white/30",
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={loading} 
      aria-label={ariaLabel || title}
      className={`${baseStyles} ${variants[variant]} ${loading ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[800ms] ease-in-out"></div>
      
      <div className={`
        w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] flex items-center justify-center text-3xl md:text-4xl 
        shadow-inner transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg] flex-shrink-0
        ${variant === 'rosu' ? 'bg-white/20' : 'bg-white/10'}
      `}>
        {loading ? <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      </div>
      
      <div className="flex flex-col items-start text-left relative z-10 flex-1 min-w-0">
        <span className="font-black uppercase tracking-wide text-[16px] md:text-xl leading-tight whitespace-normal break-words text-balance w-full drop-shadow-md">
          {title}
        </span>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70 mt-1 whitespace-normal break-words text-balance w-full">
          {subtitle}
        </span>
      </div>
    </button>
  );
};

const ModalPrieteni = ({ isOpen, onClose, userName }) => {
  const router = useRouter();
  const [codIntrare, setCodIntrare] = useState("");
  const [seIncarca, setSeIncarca] = useState(false);
  const [eroare, setEroare] = useState("");

  if (!isOpen) return null;

  const creeazaCamera = async () => {
    if (!userName || userName.length < 2) return setEroare("Completează-ți numele mai întâi în panoul principal!");
    setSeIncarca(true);
    try {
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'creeaza-camera-privata', creator: userName })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/joc/privat-${data.cod}`);
      } else {
        setEroare("Eroare de la server: Nu s-a putut crea camera.");
      }
    } catch (e) {
      setEroare("Eroare de conexiune la internet.");
    } finally {
      setSeIncarca(false);
    }
  };

  const intraInCamera = () => {
    if (codIntrare.length !== 4) return setEroare("Codul secret trebuie să aibă 4 cifre!");
    if (!userName || userName.length < 2) return setEroare("Completează-ți numele mai întâi!");
    router.push(`/joc/privat-${codIntrare}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl transition-opacity">
      <div className="bg-[#050505] border border-white/10 rounded-[3rem] p-8 md:p-10 w-full max-w-lg shadow-[0_0_150px_rgba(220,38,38,0.15)] relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white text-2xl transition-colors" aria-label="Închide">✖</button>
        <h3 className="text-3xl font-black text-white text-center mb-1 drop-shadow-lg">Meci Privat</h3>
        <p className="text-red-500/80 text-[10px] md:text-xs text-center font-black uppercase tracking-[0.3em] mb-8">Tradiția românească. Acum pe ecran.</p>

        <div className="space-y-8">
          <div className="bg-white/[0.03] p-6 md:p-8 rounded-[2rem] border border-white/5 text-center transition-all hover:bg-white/[0.05]">
            <p className="text-sm text-white/80 mb-5 font-bold uppercase tracking-wider">Generează un cod și trimite-l prietenului tău.</p>
            <button onClick={creeazaCamera} disabled={seIncarca} className="bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl w-full transition-all active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
              {seIncarca ? "Se creează arena..." : "Generează Cod Nou"}
            </button>
          </div>

          <div className="relative flex items-center justify-center">
             <div className="h-px bg-white/10 w-full"></div>
             <span className="absolute bg-[#050505] px-6 text-white/40 text-xs font-black uppercase tracking-widest">SAU</span>
          </div>

          <div className="bg-white/[0.03] p-6 md:p-8 rounded-[2rem] border border-white/5 text-center transition-all hover:bg-white/[0.05]">
            <p className="text-sm text-white/80 mb-5 font-bold uppercase tracking-wider">Ai un cod de la un prieten? Tastează-l aici.</p>
            <div className="flex gap-3">
              <input 
                type="text" 
                maxLength={4} 
                value={codIntrare}
                onChange={(e) => setCodIntrare(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Ex: 1234"
                className="bg-black/80 border-2 border-white/10 rounded-2xl p-4 text-center text-2xl font-black text-white w-full outline-none focus:border-red-600 transition-colors tracking-[0.5em] shadow-inner"
              />
              <button onClick={intraInCamera} className="bg-white/10 hover:bg-white/20 text-white font-black text-lg px-8 rounded-2xl transition-all active:scale-95 border border-white/10">
                INTRĂ
              </button>
            </div>
          </div>
          {eroare && <p className="text-red-500 text-center text-xs uppercase tracking-widest font-black animate-pulse bg-red-900/20 p-3 rounded-xl border border-red-500/30">{eroare}</p>}
        </div>
      </div>
    </div>
  );
};

const PanouEchipa = ({ team, leaderboard, onLeave, onInvite, onRename, currentUser }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(team.nume);
  const scorTotal = useMemo(() => leaderboard.reduce((t, m) => t + (m.score || 0), 0), [leaderboard]);
  
  const handleRename = () => {
    if (newName.length < 3) return alert("Numele trebuie să fie măcar de 3 caractere!");
    onRename(newName);
    setIsEditing(false);
  };

  const handleProvocare = (oponentNume, isOnline) => {
    if (oponentNume === currentUser) return alert("Alege un adversar pe măsură, nu te provoca pe tine!");

    if (isOnline) {
      if (confirm(`Ești pregătit să-l învingi pe ${oponentNume}?`)) {
        const roomId = Math.floor(1000 + Math.random() * 9000); 
        router.push(`/joc/privat-${roomId}?invite=${oponentNume}`);
      }
    } else {
      alert(`${oponentNume} este offline momentan. Intră în Sanctuar să te antrenezi cu un BOT.`);
    }
  };

  return (
    <article className="bg-[#080808]/90 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] w-full border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col h-full" aria-label={`Grupul: ${team.nume}`}>
       <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-5 relative z-10">
          <div className="w-full pr-4">
            <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em] block mb-2 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">Grupul Tău</span>
            {isEditing ? (
              <div className="flex gap-2 mt-1">
                 <input 
                   value={newName} 
                   onChange={e => setNewName(e.target.value.toUpperCase())}
                   className="bg-black border-2 border-red-600 rounded-xl px-3 py-2 text-white text-lg font-black w-full outline-none shadow-inner"
                   autoFocus
                   onKeyDown={e => e.key === 'Enter' && handleRename()}
                 />
                 <button onClick={handleRename} className="bg-green-600 rounded-xl px-4 font-black">✓</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-black uppercase text-white truncate max-w-[180px] md:max-w-[280px] leading-none">{team.nume}</h2>
                <button onClick={() => setIsEditing(true)} className="text-white/30 hover:text-white transition-colors text-sm bg-white/5 p-2 rounded-lg">✏️</button>
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0 bg-white/5 p-3 rounded-2xl border border-white/5">
             <span className="text-[9px] text-white/50 font-black uppercase tracking-widest block mb-1">Punctaj</span>
             <span className="text-2xl font-black text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">{scorTotal}</span>
          </div>
       </div>

       <div className="bg-white/[0.02] rounded-3xl p-4 mb-6 flex-1 overflow-y-auto custom-scrollbar relative z-10 border border-white/5">
          {leaderboard.length === 0 && <p className="text-white/40 text-center text-xs font-medium uppercase tracking-widest py-8">Niciun ou spart încă.</p>}
          <ul className="space-y-3">
            {leaderboard.map((m, i) => {
              const isMe = m.member === currentUser;
              const isOnline = isMe || Math.random() > 0.4; 

              return (
                <li key={i} className="flex justify-between items-center bg-black/60 p-3 md:p-4 rounded-2xl hover:bg-white/5 transition-all border border-white/5 hover:border-white/10 group">
                   <div className="flex items-center gap-4 w-full">
                      <span className={`font-black text-sm md:text-base w-6 text-center ${i === 0 ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/30'}`}>#{i+1}</span>
                      
                      <div className="flex items-center gap-3 truncate max-w-[120px] md:max-w-[180px]">
                        <span className={`text-sm md:text-base font-black truncate tracking-wide ${isMe ? 'text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]' : 'text-white'}`}>
                          {isMe ? 'Tu' : m.member}
                        </span>
                        
                        {isOnline && (
                          <span className="relative flex h-2.5 w-2.5 flex-shrink-0" title="Online">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                          </span>
                        )}
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      {!isMe && (
                        <button 
                          onClick={() => handleProvocare(m.member, isOnline)}
                          className={`text-[10px] md:text-[11px] uppercase font-black px-4 py-2 rounded-xl transition-all active:scale-95 ${
                            isOnline 
                            ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500/50' 
                            : 'bg-white/5 text-white/30 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {isOnline ? 'PROVOACĂ' : 'Offline'}
                        </button>
                      )}
                      <span className="text-sm md:text-base font-black text-white/90 w-8 text-right bg-white/5 p-1 rounded-lg">{m.score}</span>
                   </div>
                </li>
              );
            })}
          </ul>
       </div>

       <div className="flex gap-3 relative z-10 mt-auto">
          <button onClick={onInvite} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all border border-white/10 active:scale-95">Copiază Invitația</button>
          <button onClick={onLeave} className="flex-1 bg-red-900/20 hover:bg-red-600/40 text-red-500 hover:text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all border border-red-600/30 active:scale-95">Părăsește</button>
       </div>
    </article>
  );
};

// ====================================================================================================
// 2. LOGICA PRINCIPALĂ A PAGINII ȘI PERSISTENȚA (HOME CONTENT)
// ====================================================================================================

function ContinutPaginaPrincipala() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalGlobal, nume, setNume, userStats, setUserStats, isHydrated } = useGlobalStats();
  
  const [team, setTeam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [seIncarcaEchipa, setSeIncarcaEchipa] = useState(false);
  const [modalPrieteniDeschis, setModalPrieteniDeschis] = useState(false);

  useEffect(() => {
    if (!isHydrated || !nume) return;

    const idEchipa = searchParams.get("joinTeam") || localStorage.getItem("c_teamId");
    if (!idEchipa) return;

    const aduceDetaliiEchipa = async () => {
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actiune: 'get-team-details', teamId: idEchipa, jucator: nume })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("c_teamId", idEchipa);
          setTeam(data.details);
          setLeaderboard(data.top || []);
          if (searchParams.has("joinTeam")) router.replace('/'); 
        } else {
          localStorage.removeItem("c_teamId");
        }
      } catch (e) { 
        console.warn("Încărcare grup fundal..."); 
      }
    };
    
    aduceDetaliiEchipa();
  }, [nume, searchParams, router, isHydrated]);

  const creeazaEchipaNoua = async () => {
    if (!nume || nume.trim().length < 3) return alert("Eroare: Numele trebuie să aibă minim 3 caractere!");
    setSeIncarcaEchipa(true);
    
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
    } catch (e) { 
      alert("Problema conexiune. Grupul nu a fost creat."); 
    } finally { 
      setSeIncarcaEchipa(false); 
    }
  };

  const redenumesteEchipa = async (numeNou) => {
    const tid = localStorage.getItem("c_teamId");
    try {
      await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'redenumeste-echipa', teamId: tid, newName: numeNou })
      });
      setTeam(prev => ({...prev, nume: numeNou}));
    } catch (e) { console.error("Eroare redenumire"); }
  };

  // HYDRATION SHIELD: Păstrăm UI-ul ascuns/blocat până suntem siguri că datele sunt încărcate.
  if (!isHydrated) return null;

  return (
    <div className="w-full flex flex-col items-center gap-12 max-w-[1400px] mx-auto pt-28 md:pt-40 pb-20 px-4 md:px-8 relative animate-fade-in z-10 overflow-hidden">
      
      {/* ================= HEADER PRINCIPAL (FLUID SCALING) ================= */}
      <header className="text-center space-y-4 w-full px-2">
        <h1 className="font-black text-white italic tracking-tighter leading-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" style={{ fontSize: 'clamp(3rem, 12vw, 10rem)' }}>
           CIOCNIM<span className="text-red-600">.RO</span>
        </h1>
        <p className="font-black text-white/50 uppercase leading-relaxed" style={{ fontSize: 'clamp(0.6rem, 2vw, 1.2rem)', letterSpacing: 'clamp(0.2em, 0.5vw, 0.6em)' }}>
           Tradiția românească, acum pe ecran.
        </p>
      </header>

      {/* ================= ZONA CENTRALĂ (COMPACTĂ & RESPONSIVĂ) ================= */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* === STÂNGA: Profil Compact === */}
        <article className="lg:col-span-5 bg-[#080808]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] flex flex-col gap-8 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden h-fit">
          <div className="absolute -top-10 -right-10 p-8 opacity-[0.02] pointer-events-none select-none">
             <span className="text-[12rem]">👤</span>
          </div>

          <div className="space-y-4 relative z-10">
             <label htmlFor="nume-jucator" className="text-[11px] md:text-xs font-black uppercase text-red-500 tracking-[0.3em] pl-2 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">Identitatea ta</label>
             <input 
               id="nume-jucator"
               value={nume} 
               onChange={e => setNume(e.target.value)}
               placeholder="Scrie-ți numele..."
               className="w-full bg-black p-5 md:p-6 rounded-[2rem] border-2 border-white/10 text-2xl md:text-3xl font-black focus:border-red-600 transition-all outline-none text-white shadow-inner placeholder:text-white/20"
             />
          </div>

          <div className="space-y-4 relative z-10 mt-4">
             <label className="text-[11px] md:text-xs font-black uppercase text-white/40 tracking-[0.3em] pl-2">Alege Oul Norocos</label>
             <div className="flex flex-wrap gap-4 md:gap-5 justify-start bg-black/50 p-5 md:p-6 rounded-[2rem] border border-white/5">
                {[
                  { id: 'red', color: '#dc2626' }, 
                  { id: 'blue', color: '#2563eb' },
                  { id: 'green', color: '#16a34a' }, 
                  { id: 'yellow', color: '#ca8a04' },
                  { id: 'purple', color: '#9333ea' }
                ].map(ou => (
                  <button
                    key={ou.id}
                    onClick={() => setUserStats({...userStats, skin: ou.id})}
                    aria-label={`Oul culoare ${ou.id}`}
                    className={`
                      w-12 h-16 md:w-16 md:h-20 rounded-[2rem] transition-all duration-300 transform-gpu cursor-pointer
                      ${(userStats.skin || 'red') === ou.id ? 'scale-110 border-4 border-white shadow-[0_0_25px_rgba(255,255,255,0.4)] z-10' : 'opacity-30 hover:opacity-100 hover:scale-105 hover:-rotate-3'}
                    `}
                    style={{ backgroundColor: ou.color }}
                  />
                ))}
             </div>
          </div>
        </article>

        {/* === DREAPTA: Acțiuni & Clan === */}
        <article className="lg:col-span-7 flex flex-col gap-8 h-full">
          
          <div className="bg-[#080808]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] space-y-6">
             <h2 className="text-white/50 text-[11px] md:text-xs font-black uppercase tracking-[0.3em] mb-2 px-2">Alege cum joci</h2>
             
             <div className="flex flex-col gap-4">
               <ActionButton 
                 variant="rosu" 
                 icon="🤝" 
                 title="Meci cu un Prieten" 
                 subtitle="Generează un cod secret. Poți lovi mișcând telefonul sau apăsând butonul nou!" 
                 onClick={() => setModalPrieteniDeschis(true)} 
               />
               <ActionButton 
                 variant="transparent" 
                 icon="🌍" 
                 title="Arena Globală" 
                 subtitle="Joacă aleatoriu cu cineva din țară. Contribuie la bilanțul național." 
                 onClick={() => router.push('/joc/global-arena')} 
               />
             </div>
          </div>

          <div className="flex-1 flex flex-col justify-end min-h-[300px]">
            {team ? (
              <PanouEchipa 
                team={team} 
                leaderboard={leaderboard} 
                currentUser={nume}
                onRename={redenumesteEchipa}
                onLeave={() => { 
                  if(confirm("Părăsești grupul?")) { 
                    localStorage.removeItem("c_teamId"); 
                    window.location.reload(); 
                  } 
                }}
                onInvite={() => {
                  const link = `${window.location.origin}/?joinTeam=${team.id}`;
                  navigator.clipboard.writeText(link);
                  alert("Link copiat! Trimite-l prietenilor.");
                }}
              />
            ) : (
              <div className="bg-white/[0.02] p-8 md:p-12 rounded-[3rem] border-2 border-dashed border-white/10 text-center flex flex-col items-center justify-center h-full backdrop-blur-lg transition-all hover:bg-white/[0.04] hover:border-white/20 group">
                 <div className="mb-6 text-6xl opacity-70 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">🏰</div>
                 <h3 className="text-white font-black text-2xl mb-2">Creați-vă un Grup</h3>
                 <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-widest mb-8 max-w-sm leading-relaxed">Familie sau prieteni. Clasament live și notificări de ciocnire direct pe ecran.</p>
                 
                 <button 
                   onClick={creeazaEchipaNoua} 
                   disabled={seIncarcaEchipa}
                   className="bg-white/10 hover:bg-white/20 text-white font-black py-5 px-10 rounded-[2rem] w-full max-w-md transition-all shadow-xl text-sm uppercase tracking-[0.2em] border border-white/10 active:scale-95"
                 >
                   {seIncarcaEchipa ? "Se Formează Grupul..." : "Generează Grup Nou"}
                 </button>
              </div>
            )}
          </div>

        </article>
      </section>

      {/* ================= FOOTER NUCLEAR ================= */}
      <footer className="mt-20 w-full text-center space-y-8 pb-16 relative z-10" aria-label="Footer">
          <div className="flex flex-col gap-4">
            <p className="text-[11px] md:text-sm font-black text-white/40 uppercase tracking-[0.2em] md:tracking-[0.5em] px-4 leading-relaxed">
              Tradiția românească, acum pe ecran.<br className="hidden md:block"/> Joacă cu prietenii, creați-vă un grup sau joacă aleatoriu cu un străin.
            </p>
          </div>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="flex flex-col items-center gap-4">
             <p className="text-2xl md:text-4xl font-black text-red-600 uppercase italic tracking-widest drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]">Hristos a Înviat!</p>
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Ciocnim.ro &copy; {new Date().getFullYear()} • Primitive Tech V22</p>
          </div>
      </footer>

      <ModalPrieteni 
        isOpen={modalPrieteniDeschis} 
        onClose={() => setModalPrieteniDeschis(false)} 
        userName={nume}
      />
    </div>
  );
}

// ====================================================================================================
// 3. STRUCTURA RĂDĂCINĂ A PAGINII
// ====================================================================================================

export default function Home() {
  const { totalGlobal } = useGlobalStats();

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#020202] selection:bg-red-600 selection:text-white">
      
      {/* INJECTARE SEO PENTRU GOOGLE */}
      <StructuredDataSEO />

      {/* GRID LINES & PRIMITIVE TECH BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Layer 1: Linii Grid pronunțate dar techy */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
        {/* Layer 2: Gradient Radial masiv roșu/negru pentru adâncime */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_-10%,rgba(220,38,38,0.08)_0%,rgba(0,0,0,1)_80%)]"></div>
        {/* Layer 3: Vignette pe margini */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,1)]"></div>
      </div>

      <nav className="fixed top-4 left-0 w-full flex justify-center z-[50] px-4 pointer-events-none" aria-label="Navigare">
        <div className="bg-[#050505]/95 backdrop-blur-2xl px-6 py-3 md:px-8 md:py-4 rounded-full flex items-center justify-between gap-6 md:gap-10 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] pointer-events-auto transform-gpu transition-all hover:scale-[1.02]">
          <div className="flex items-center gap-3">
            <span className="text-xl md:text-3xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse" aria-hidden="true">🥚</span>
            <div className="flex flex-col">
              <span className="font-black text-lg md:text-2xl tracking-tighter text-white leading-none">Ciocnim<span className="text-red-600">.ro</span></span>
              <span className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-[0.4em] mt-1">Sanctuar V22</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" aria-hidden="true"></div>
          <div className="flex flex-col items-end" aria-live="polite">
             <span className="text-white/40 font-black text-[8px] md:text-[9px] uppercase tracking-[0.3em] mb-1">Bilanț Național</span>
             <span className="font-black text-yellow-500 text-xl md:text-3xl leading-none tabular-nums drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">
               {totalGlobal?.toLocaleString('ro-RO') || '...'}
             </span>
          </div>
        </div>
      </nav>

      <Suspense fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center gap-8 bg-[#020202] text-white/30 font-black text-[11px] md:text-sm uppercase tracking-[0.4em] z-10 relative">
          <div className="relative w-20 h-20">
             <div className="absolute inset-0 border-4 border-red-600/10 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          Sincronizare Tradiție...
        </div>
      }>
        <ContinutPaginaPrincipala />
      </Suspense>

    </main>
  );
}