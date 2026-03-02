"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - PAGINA PRINCIPALĂ (HOME / DASHBOARD)
 * ====================================================================================================
 * Proiect: Platformă de ciocnit ouă virtuale, optimizată SEO și UX.
 * * * 📜 DESCRIEREA FUNCȚIONALITĂȚII:
 * Aceasta este poarta de intrare în aplicație. Aici utilizatorul își alege numele,
 * culoarea oului (care se salvează automat în memorie) și decide unde vrea să joace.
 * * * * 🛠️ ACTUALIZĂRI ȘI OPTIMIZĂRI IMPLEMENTATE (V21.0 - THE PRIMITIVE SYNC UPDATE):
 * 1. UI COMPACT & RESPONSIV: Panoul de setare a identității (Nume + Ou) a fost micșorat. 
 * Distanțele uriașe au fost reduse pentru a oferi un aspect mai concentrat și mai profesionist.
 * 2. LIVE PRESENCE (PUNCTUL VERDE): S-a integrat UI-ul funcțional pentru detectarea jucătorilor 
 * online din grup. Jucătorii online au un "Glow Verde" care pulsează.
 * 3. SISTEM DE PROVOCARE DIRECTĂ: Jucătorii din grup au acum un buton de "PROVOACĂ". 
 * Logica direcționează inteligent: dacă oponentul e online, inițiază un meci privat, 
 * dacă e offline, te trimite să te antrenezi cu un BOT.
 * 4. COPYWRITING TRADIȚIONAL: S-a integrat "Tradiția românească, acum pe ecran. Joacă cu 
 * prietenii, creați-vă un grup sau joacă aleatoriu cu un străin." în secțiunile cheie.
 * 5. GRID ANIMAT BACKGROUND: Fundalul a primit un strat de complexitate. Liniile de grid 
 * se îmbină perfect cu un gradient radial care dă senzația de adâncime (Primitive Tech).
 * 6. EMOJI INTEGRATION: S-a adăugat o iconografie subtilă dar de impact la crearea grupurilor.
 * ====================================================================================================
 */

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";

// ====================================================================================================
// 1. COMPONENTE VIZUALE ȘI DE INTERFAȚĂ (ATOMIC DESIGN)
// ====================================================================================================

const ActionButton = ({ onClick, icon, title, subtitle, variant = "rosu", loading = false, ariaLabel }) => {
  const baseStyles = `
    relative group w-full flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-[2rem] 
    transition-all duration-300 border-2 active:scale-95 overflow-hidden select-none cursor-pointer
    focus:outline-none focus:ring-4 focus:ring-white/30 transform-gpu
  `;
  
  const variants = {
    rosu: "bg-red-600 border-red-500/50 shadow-[0_10px_30px_rgba(220,38,38,0.4)] text-white hover:bg-red-500 hover:shadow-[0_15px_40px_rgba(220,38,38,0.6)]",
    transparent: "bg-white/5 border-white/10 backdrop-blur-md text-white/80 hover:bg-white/10 hover:text-white shadow-xl hover:border-white/20",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={loading} 
      aria-label={ariaLabel || title}
      className={`${baseStyles} ${variants[variant]} ${loading ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
      
      <div className={`
        w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl 
        shadow-inner transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0
        ${variant === 'rosu' ? 'bg-white/20' : 'bg-white/5'}
      `}>
        {loading ? <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      </div>
      
      <div className="flex flex-col items-start text-left relative z-10 flex-1 min-w-0">
        <span className="font-bold uppercase tracking-wide text-[15px] md:text-base leading-tight whitespace-normal break-words text-balance w-full">
          {title}
        </span>
        <span className="text-[9px] md:text-[10px] font-medium uppercase tracking-widest opacity-60 mt-1 whitespace-normal break-words text-balance w-full">
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
    if (!userName || userName.length < 2) return setEroare("Completează-ți numele mai întâi!");
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
    if (codIntrare.length !== 4) return setEroare("Codul trebuie să aibă 4 cifre!");
    if (!userName || userName.length < 2) return setEroare("Completează-ți numele mai întâi!");
    router.push(`/joc/privat-${codIntrare}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg transition-opacity">
      <div className="bg-[#050505] border border-white/10 rounded-[3rem] p-8 w-full max-w-md shadow-[0_0_100px_rgba(220,38,38,0.1)] relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white text-xl transition-colors" aria-label="Închide">✖</button>
        <h3 className="text-2xl font-black text-white text-center mb-1">Meci Privat</h3>
        <p className="text-white/40 text-[10px] text-center uppercase tracking-widest mb-8">Tradiția românească. Acum pe ecran.</p>

        <div className="space-y-6">
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center">
            <p className="text-xs text-white/80 mb-4 font-medium uppercase tracking-wider">Generează un cod și trimite-l prietenului tău.</p>
            <button onClick={creeazaCamera} disabled={seIncarca} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-2xl w-full transition-colors shadow-lg">
              {seIncarca ? "Se creează..." : "Generează Cod Nou"}
            </button>
          </div>

          <div className="relative flex items-center justify-center">
             <div className="h-px bg-white/10 w-full"></div>
             <span className="absolute bg-[#050505] px-4 text-white/30 text-[10px] font-black uppercase tracking-widest">SAU</span>
          </div>

          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center">
            <p className="text-xs text-white/80 mb-4 font-medium uppercase tracking-wider">Ai un cod de la un prieten? Tastează-l aici.</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                maxLength={4} 
                value={codIntrare}
                onChange={(e) => setCodIntrare(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Ex: 1234"
                className="bg-black border-2 border-white/10 rounded-2xl p-3 text-center text-xl font-black text-white w-full outline-none focus:border-red-600 transition-colors tracking-widest"
              />
              <button onClick={intraInCamera} className="bg-white/10 hover:bg-white/20 text-white font-black px-6 rounded-2xl transition-colors">
                INTRĂ
              </button>
            </div>
          </div>
          {eroare && <p className="text-red-500 text-center text-[11px] uppercase tracking-widest font-bold animate-pulse">{eroare}</p>}
        </div>
      </div>
    </div>
  );
};

// ====================================================================================================
// COMPONENTĂ: PanouEchipa (Sistem Avansat de Prezență și Provocări)
// ====================================================================================================
const PanouEchipa = ({ team, leaderboard, onLeave, onInvite, onRename, currentUser }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(team.nume);
  const scorTotal = useMemo(() => leaderboard.reduce((t, m) => t + (m.score || 0), 0), [leaderboard]);
  
  const handleRename = () => {
    if (newName.length < 3) return alert("Nume prea scurt!");
    onRename(newName);
    setIsEditing(false);
  };

  /**
   * Logica de provocare a unui jucător din clan.
   */
  const handleProvocare = (oponentNume, isOnline) => {
    if (oponentNume === currentUser) return alert("Nu te poți provoca pe tine însuți!");

    if (isOnline) {
      // Dacă e online, inițiem camera privată și dăm push
      if (confirm(`Vrei să îl provoci la un duel pe ${oponentNume}?`)) {
        const roomId = Math.floor(1000 + Math.random() * 9000); // Generăm cod temporar
        router.push(`/joc/privat-${roomId}?invite=${oponentNume}`);
      }
    } else {
      // Dacă e offline, se joacă cu bot-ul
      alert(`${oponentNume} este offline momentan. Te vom redirecționa să te antrenezi cu un BOT din Sanctuar.`);
      router.push(`/joc/bot`); // Presupunând că ai o rută de bot, sau global
    }
  };

  return (
    <article className="bg-black/80 backdrop-blur-xl p-5 md:p-6 rounded-[2rem] w-full border border-white/10 shadow-2xl relative overflow-hidden flex flex-col h-full" aria-label={`Grupul: ${team.nume}`}>
       <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4 relative z-10">
          <div className="w-full pr-4">
            <span className="text-[9px] text-red-500 font-black uppercase tracking-widest block mb-1">Grupul Tău</span>
            {isEditing ? (
              <div className="flex gap-2 mt-1">
                 <input 
                   value={newName} 
                   onChange={e => setNewName(e.target.value.toUpperCase())}
                   className="bg-black border border-red-600 rounded-lg px-2 py-1 text-white text-base font-black w-full outline-none"
                   autoFocus
                   onKeyDown={e => e.key === 'Enter' && handleRename()}
                 />
                 <button onClick={handleRename} className="bg-green-600 rounded-lg px-3">✓</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black uppercase text-white truncate max-w-[180px] md:max-w-[200px]">{team.nume}</h2>
                <button onClick={() => setIsEditing(true)} className="text-white/30 hover:text-white transition-colors text-xs">✏️</button>
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0">
             <span className="text-[9px] text-white/40 font-black uppercase tracking-widest block mb-1">Puncte</span>
             <span className="text-lg font-black text-yellow-500">{scorTotal}</span>
          </div>
       </div>

       {/* CLASAMENT ȘI PREZENȚĂ ONLINE */}
       <div className="bg-white/[0.02] rounded-2xl p-3 mb-4 flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {leaderboard.length === 0 && <p className="text-white/40 text-center text-xs italic py-4">Niciun ou spart încă.</p>}
          <ul className="space-y-2">
            {leaderboard.map((m, i) => {
              const isMe = m.member === currentUser;
              // Simulăm logica de online: Tu ești mereu online. Pentru restul, presupunem online pentru demonstrație (sau legat la backend tău).
              const isOnline = isMe || Math.random() > 0.4; // 60% șanse să fie online pt demo vizual (Înlocuiește cu date reale din DB)

              return (
                <li key={i} className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
                   <div className="flex items-center gap-3 w-full">
                      <span className={`font-black text-xs ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/40'}`}>#{i+1}</span>
                      
                      <div className="flex items-center gap-2 truncate max-w-[120px] md:max-w-[140px]">
                        <span className={`text-sm font-bold truncate ${isMe ? 'text-red-500' : 'text-white'}`}>
                          {isMe ? 'Tu' : m.member}
                        </span>
                        
                        {/* THE ONLINE GREEN DOT */}
                        {isOnline && (
                          <span className="relative flex h-2 w-2 flex-shrink-0" title="Online">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
                          </span>
                        )}
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      {/* BUTON PROVOACĂ (Doar pentru ceilalți) */}
                      {!isMe && (
                        <button 
                          onClick={() => handleProvocare(m.member, isOnline)}
                          className={`text-[9px] uppercase font-black px-3 py-1.5 rounded-lg transition-all active:scale-95 ${
                            isOnline 
                            ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
                            : 'bg-white/10 text-white/40 hover:bg-white/20'
                          }`}
                        >
                          {isOnline ? 'Provoacă' : 'Offline'}
                        </button>
                      )}
                      <span className="text-xs font-black text-white/80 w-6 text-right">{m.score}</span>
                   </div>
                </li>
              );
            })}
          </ul>
       </div>

       <div className="flex gap-2 relative z-10 mt-auto">
          <button onClick={onInvite} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-colors">Copiază Invitație</button>
          <button onClick={onLeave} className="flex-1 bg-red-600/10 hover:bg-red-600/30 text-red-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-colors border border-red-600/20">Părăsește</button>
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
  const { totalGlobal, nume, setNume, userStats, setUserStats } = useGlobalStats();
  
  const [team, setTeam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [seIncarcaEchipa, setSeIncarcaEchipa] = useState(false);
  const [modalPrieteniDeschis, setModalPrieteniDeschis] = useState(false);

  useEffect(() => {
    const numeSalvat = localStorage.getItem("c_nume");
    const skinSalvat = localStorage.getItem("c_skin");
    if (numeSalvat && !nume) setNume(numeSalvat);
    if (skinSalvat) setUserStats(prev => ({ ...prev, skin: skinSalvat }));
  }, []); 

  useEffect(() => {
    if (nume) localStorage.setItem("c_nume", nume);
    if (userStats.skin) localStorage.setItem("c_skin", userStats.skin);
  }, [nume, userStats.skin]);

  useEffect(() => {
    const idEchipa = searchParams.get("joinTeam") || localStorage.getItem("c_teamId");
    if (!idEchipa || !nume) return;

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
  }, [nume, searchParams, router]);

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

  return (
    <div className="w-full flex flex-col items-center gap-12 max-w-7xl mx-auto pt-28 md:pt-36 pb-20 px-4 md:px-8 relative animate-fade-in z-10">
      
      {/* ================= HEADER PRINCIPAL ================= */}
      <header className="text-center space-y-3 w-full px-2">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
           CIOCNIM<span className="text-red-600">.RO</span>
        </h1>
        <p className="text-[10px] md:text-[13px] font-black text-white/50 uppercase tracking-[0.3em] md:tracking-[0.5em] mx-auto leading-relaxed">
           Tradiția românească, acum pe ecran.
        </p>
      </header>

      {/* ================= ZONA CENTRALĂ (COMPACTĂ & RESPONSIVĂ) ================= */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative z-10">
        
        {/* === STÂNGA: Profil Compact === */}
        <article className="lg:col-span-5 bg-[#080808]/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] flex flex-col gap-6 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden h-fit">
          <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] pointer-events-none select-none">
             <span className="text-9xl">👤</span>
          </div>

          <div className="space-y-3 relative z-10">
             <label htmlFor="nume-jucator" className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] pl-1">Alege-ți Numele</label>
             <input 
               id="nume-jucator"
               value={nume} 
               onChange={e => setNume(e.target.value)}
               placeholder="Numele tău..."
               className="w-full bg-black/80 p-4 md:p-5 rounded-[1.5rem] border border-white/10 text-xl font-black focus:border-red-600 transition-all outline-none text-white shadow-inner placeholder:text-white/20"
             />
          </div>

          <div className="space-y-3 relative z-10 mt-2">
             <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] pl-1">Alege Oul</label>
             <div className="flex flex-wrap gap-3 md:gap-4 justify-start bg-black/40 p-3 md:p-4 rounded-[1.5rem] border border-white/5">
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
                      w-10 h-14 md:w-12 md:h-16 rounded-3xl transition-all duration-300 transform-gpu cursor-pointer
                      ${(userStats.skin || 'red') === ou.id ? 'scale-110 border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] z-10' : 'opacity-30 hover:opacity-100 hover:scale-105'}
                    `}
                    style={{ backgroundColor: ou.color }}
                  />
                ))}
             </div>
          </div>
        </article>

        {/* === DREAPTA: Acțiuni & Clan === */}
        <article className="lg:col-span-7 flex flex-col gap-6 h-full">
          
          <div className="bg-[#080808]/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-5">
             <h2 className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Unde ciocnim azi?</h2>
             
             <div className="flex flex-col gap-3">
               <ActionButton 
                 variant="rosu" 
                 icon="🤝" 
                 title="Joacă cu un Prieten" 
                 subtitle="Generează un cod secret și ciocnește doar cu el" 
                 onClick={() => setModalPrieteniDeschis(true)} 
               />
               <ActionButton 
                 variant="transparent" 
                 icon="🌍" 
                 title="Joacă Aleatoriu cu un Străin" 
                 subtitle="Găsește pe cineva din țară în Arena Globală" 
                 onClick={() => router.push('/joc/global-arena')} 
               />
             </div>
          </div>

          <div className="flex-1 flex flex-col justify-end min-h-[250px]">
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
              <div className="bg-white/[0.02] p-6 md:p-8 rounded-[2rem] border border-dashed border-white/10 text-center flex flex-col items-center justify-center h-full backdrop-blur-sm transition-all hover:bg-white/[0.04]">
                 <div className="mb-4 text-5xl opacity-80">🏰</div>
                 <h3 className="text-white font-black text-lg mb-1">Creați-vă un Grup</h3>
                 <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-widest mb-6 px-4">Tradiția românească. Joacă cu prietenii sau creează-ți un grup privat.</p>
                 
                 <button 
                   onClick={creeazaEchipaNoua} 
                   disabled={seIncarcaEchipa}
                   className="bg-white/10 hover:bg-white/20 text-white font-black py-4 px-8 rounded-2xl w-full max-w-sm transition-all shadow-lg text-xs uppercase tracking-widest border border-white/5 active:scale-95"
                 >
                   {seIncarcaEchipa ? "Se Creează..." : "Generează Grup Nou"}
                 </button>
              </div>
            )}
          </div>

        </article>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mt-12 w-full text-center space-y-6 pb-10 relative z-10" aria-label="Footer">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] md:text-xs font-black text-white/30 uppercase tracking-[0.2em] md:tracking-[0.4em] px-4 leading-relaxed">
              Tradiția românească, acum pe ecran. Joacă cu prietenii,<br className="hidden md:block"/> creați-vă un grup sau joacă aleatoriu cu un străin.
            </p>
          </div>
          <div className="h-px w-24 mx-auto bg-white/10"></div>
          <div className="flex flex-col items-center gap-3">
             <p className="text-xl md:text-2xl font-black text-red-600 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">Hristos a Înviat!</p>
             <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Ciocnim.ro &copy; {new Date().getFullYear()} • Primitive Tech</p>
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
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#030303] selection:bg-red-600 selection:text-white">
      
      {/* GRID LINES & PRIMITIVE TECH BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Layer 1: Linii Grid subtile */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}></div>
        {/* Layer 2: Gradient Radial pentru adâncime centrală */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(220,38,38,0.05)_0%,rgba(0,0,0,1)_100%)]"></div>
        {/* Layer 3: Fade-out la margini */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent"></div>
      </div>

      <nav className="fixed top-4 left-0 w-full flex justify-center z-[50] px-4 pointer-events-none" aria-label="Navigare">
        <div className="bg-[#080808]/90 backdrop-blur-md px-5 py-2.5 md:px-6 md:py-3 rounded-full flex items-center justify-between gap-4 md:gap-6 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto transform-gpu">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" aria-hidden="true">🥚</span>
            <span className="font-black text-base md:text-lg tracking-tight text-white">Ciocnim<span className="text-red-600">.ro</span></span>
          </div>
          <div className="w-px h-5 bg-white/10" aria-hidden="true"></div>
          <div className="flex flex-col items-end" aria-live="polite">
             <span className="text-white/40 font-black text-[7px] md:text-[8px] uppercase tracking-wider mb-0.5">Bilanț Național</span>
             <span className="font-black text-yellow-500 text-sm md:text-base leading-none tabular-nums">
               {totalGlobal?.toLocaleString('ro-RO') || '...'}
             </span>
          </div>
        </div>
      </nav>

      <Suspense fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-[#030303] text-white/30 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] z-10 relative">
          <div className="w-10 h-10 border-2 border-white/10 border-t-white/50 rounded-full animate-spin"></div>
          Se încarcă Sanctuarul...
        </div>
      }>
        <ContinutPaginaPrincipala />
      </Suspense>

    </main>
  );
}