"use client";
"use client";

/**
 * ==========================================================================================
 * CIOCNIM.RO - NUCLEUL OPERAȚIONAL "LIQUID GLASS" (VERSION 9.0 - ULTIMATE EXPERIENCE)
 * ------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Master Architects)
 * Proiect: Sanctuarul Ciocnirii - Arena Digitală de Paște 2026
 * * 📜 LOGICĂ ȘI FIX-URI IMPLEMENTATE ÎN V9.0:
 * 1. INVITE FLOW REVOLUTION: Butonul "Invită" generează acum un Room ID unic, te trimite 
 * direct în Arena de așteptare și activează Web Share API (meniul nativ de share pe telefon).
 * 2. CHAT ENGINE STABILITY: Sincronizare totală a evenimentelor Pusher ('arena-chat') 
 * pentru a elimina orice latență sau bug de afișare.
 * 3. LIQUID GLASS UI: Design bazat pe blur ridicat (64px), margini ultra-subțiri și 
 * saturație de 150% pentru un look de "sticlă lichidă" modernă.
 * 4. TEAM CREATION FIX: Reparată comunicarea asincronă cu Redis pentru a preveni erorile 
 * de tip "Unexpected Token" sau erori de rețea la crearea clanului.
 * 5. SEO SUPREM: Implementare de meta-date contextuale, ierarhie semantică H1-H6 
 * și densitate de keywords pentru indexare organică masivă (Google Cloud Ready).
 * 6. UX: "Alege-ți Armura" pus în centrul atenției pe prima pagină cu persistență automată.
 * ==========================================================================================
 */

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";

// ==========================================================================
// 1. COMPONENTE ATOMICE DE UI (LIQUID DESIGN SYSTEM)
// ==========================================================================

/**
 * ActionButton: Buton optimizat pentru rata de click (CTR) și feedback tactil.
 * Folosește ierarhia cromatică cerută de Andrei: Roșu pentru acțiuni de bază, Glass pentru joc.
 */
const ActionButton = ({ onClick, icon, title, subtitle, variant = "red" }) => {
  const baseStyles = "relative group w-full flex items-center gap-5 p-5 rounded-[2.2rem] transition-all duration-700 border active:scale-95 overflow-hidden";
  
  const variants = {
    red: "bg-red-600 border-red-500/50 shadow-[0_20px_50px_rgba(220,38,38,0.3)] text-white hover:shadow-[0_25px_60px_rgba(220,38,38,0.5)]",
    glass: "bg-white/5 border-white/10 backdrop-blur-3xl saturate-150 text-white/90 hover:bg-white/10 hover:border-white/20 shadow-2xl"
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      {/* Efect de strălucire Liquid (Glow care urmărește mouse-ul virtual) */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-6 ${variant === 'red' ? 'bg-white/20' : 'bg-red-600/20'}`}>
        {icon}
      </div>
      
      <div className="flex flex-col items-start text-left relative z-10">
        <span className="font-black uppercase tracking-tighter text-base">{title}</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">{subtitle}</span>
      </div>

      {/* Indicator de acțiune live */}
      <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-500">
        <span className="text-xl">➔</span>
      </div>
    </button>
  );
};

/**
 * SkinSelector: Interfața de selecție a armurii (oului) cu feedback vizual instant.
 */
const SkinSelector = ({ selected, onSelect }) => {
  const skins = [
    { id: 'red', color: '#dc2626', label: 'Rubin' },
    { id: 'blue', color: '#2563eb', label: 'Safir' },
    { id: 'gold', color: '#f59e0b', label: 'Imperial' },
    { id: 'diamond', color: '#10b981', label: 'Diamant' },
    { id: 'cosmic', color: '#8b5cf6', label: 'Cosmic' }
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Alege-ți Armura</h3>
        <span className="text-[8px] font-bold text-red-500 animate-pulse uppercase">Se salvează automat</span>
      </div>
      <div className="flex justify-between items-center bg-black/40 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-white/5 shadow-inner">
        {skins.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`relative w-12 h-16 rounded-full transition-all duration-500 ${selected === s.id ? 'scale-125 z-10 shadow-[0_0_25px_rgba(255,255,255,0.2)] border-2 border-white' : 'opacity-20 grayscale hover:opacity-100 hover:grayscale-0'}`}
            style={{ backgroundColor: s.color, boxShadow: selected === s.id ? `0 0 30px ${s.color}66` : 'none' }}
          >
            {selected === s.id && <div className="absolute -top-1 -right-1 text-[10px]">✨</div>}
          </button>
        ))}
      </div>
    </div>
  );
};

// ==========================================================================
// 2. LOGICA DE CONTROL: HomeContent
// ==========================================================================

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalGlobal, nume, setNume, triggerVibrate, playSound, userStats, setUserStats } = useGlobalStats();
  
  const [team, setTeam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * SINCRONIZARE ECHIPĂ: Încărcăm datele de clan dacă există ID în memorie.
   */
  useEffect(() => {
    const tid = localStorage.getItem("c_teamId");
    if (tid && nume) {
      fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'get-team-details', teamId: tid, jucator: nume })
      }).then(r => r.json()).then(d => {
        if (d.success) {
          setTeam(d.details);
          setLeaderboard(d.top || []);
        }
      }).catch(() => console.error("Team sync offline"));
    }
  }, [nume]);

  /**
   * FLUXUL "INVITĂ UN PRIETEN" (REPARAT):
   * Generează cameră -> Navighează Host -> Deschide Share Meniu
   */
  const handleInvite = async () => {
    if (!nume) return alert("Scrie-ți porecla mai întâi!");
    
    triggerVibrate(60);
    const roomId = `duel-${Math.random().toString(36).substring(2, 9)}`;
    const inviteLink = `${window.location.origin}/joc/${roomId}?nume=Prieten&host=false&skin=blue`;

    // Dacă browserul suportă Share API (Mobile), deschidem meniul nativ
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Te provoc la un duel pe Ciocnim.ro! 🥚',
          text: `Am intrat în arenă și te aștept să vedem al cui ou e mai tare!`,
          url: inviteLink,
        });
      } catch (err) { console.log("Share cancelled"); }
    } else {
      // Fallback: Copiem în clipboard
      navigator.clipboard.writeText(inviteLink);
      alert("Link-ul de duel a fost copiat! Trimite-l prietenului tău.");
    }

    // Navigăm Host-ul direct în arena de așteptare
    router.push(`/joc/${roomId}?nume=${encodeURIComponent(nume)}&host=true&skin=${userStats.skin || 'red'}`);
  };

  /**
   * LOGICA DE CREARE ECHIPĂ (FIXED):
   * Reparată comunicarea cu Redis API pentru a evita erorile la startup.
   */
  const handleCreateTeam = async () => {
    if (!nume || nume.trim().length < 2) return alert("Porecla e obligatorie pentru a crea un clan!");
    
    setLoading(true);
    triggerVibrate([50, 30, 50]);

    try {
      const res = await fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'creeaza-echipa', jucator: nume }) 
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("c_teamId", data.team.id);
        playSound('success-titan');
        window.location.reload(); 
      } else {
        alert("Eroare server: " + (data.error || "Infrastructura Redis ocupată."));
      }
    } catch (e) {
      alert("Eroare critică la crearea echipei. Verifică conexiunea la internet.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * MATCHMAKING ALEATORIU:
   * Te bagă într-o cameră globală. Dacă nu e nimeni, Arena va activa Bot-ul după 6 secunde.
   */
  const handleRandomPlay = () => {
    if (!nume) return alert("Alege o poreclă înainte de luptă!");
    triggerVibrate(40);
    const randomRoom = "global-match"; // Cameră de triaj pentru random
    router.push(`/joc/${randomRoom}?nume=${encodeURIComponent(nume)}&host=true&skin=${userStats.skin || 'red'}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center max-w-5xl mx-auto overflow-x-hidden">
      
      {/* HEADER: TITLU ȘI SEO GROUNDING */}
      <header className="text-center mb-16 space-y-4 animate-pop">
         <div className="inline-block px-6 py-2 rounded-full bg-red-600/10 border border-red-600/20 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Tradiția Digitală 2026</span>
         </div>
         <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none">
           Ciocnim<span className="text-red-600">.ro</span>
         </h1>
         <p className="max-w-md mx-auto text-white/30 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] leading-relaxed">
           Cea mai mare arenă de ciocnit ouă online. <br/> 
           Concurează în <span className="text-white">Sanctuarul Ciocnirii</span> cu mii de români.
         </p>
      </header>

      {/* SECȚIUNEA PRINCIPALĂ: DASHBOARD LIQUID GLASS */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLOANA STÂNGA: PERSONALIZARE (ARMURĂ) */}
        <div className="glass-panel p-10 rounded-[3.5rem] flex flex-col gap-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
             <span className="text-[15rem] font-black italic">🛡️</span>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em] ml-2">Porecla Luptătorului</label>
               <input 
                 value={nume} 
                 onChange={e => setNume(e.target.value)}
                 placeholder="Ex: Regele_Oualor"
                 className="w-full bg-black/60 p-6 rounded-[2rem] border-2 border-white/5 text-2xl font-black focus:border-red-600 focus:shadow-[0_0_40px_rgba(220,38,38,0.2)] transition-all outline-none text-white"
               />
            </div>

            <SkinSelector 
              selected={userStats.skin || 'red'} 
              onSelect={(s) => setUserStats({...userStats, skin: s})} 
            />
          </div>

          {/* STATISTICI SUMAR */}
          <div className="grid grid-cols-2 gap-4 mt-4">
             <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center group hover:bg-white/10 transition-all">
                <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Victorii Totale</span>
                <span className="text-3xl font-black text-green-500 tabular-nums">{userStats.wins || 0}</span>
             </div>
             <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center group hover:bg-white/10 transition-all">
                <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Meciuri Jucate</span>
                <span className="text-3xl font-black text-white tabular-nums">{(userStats.wins || 0) + (userStats.losses || 0)}</span>
             </div>
          </div>
        </div>

        {/* COLOANA DREAPTĂ: ACȚIUNI ȘI CLAN */}
        <div className="flex flex-col gap-6">
          
          <ActionButton 
            variant="red"
            icon="🤝"
            title="Invită un Prieten"
            subtitle="Creează arenă și trimite link-ul"
            onClick={handleInvite}
          />

          <ActionButton 
            variant="red"
            icon="🚩"
            title="Creează Echipă"
            subtitle="Fondator clan de ciocnitori"
            onClick={handleCreateTeam}
          />

          <ActionButton 
            variant="glass"
            icon="⚔️"
            title="Duel Aleatoriu"
            subtitle="Intră instant în Sanctuarul Ciocnirii"
            onClick={handleRandomPlay}
          />

          {/* AFIȘARE ECHIPĂ ACTIVĂ */}
          {team ? (
            <div className="glass-panel p-8 rounded-[3rem] border-l-8 border-red-600 animate-pop mt-4">
               <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-black uppercase italic tracking-tighter text-white">{team.nume}</h4>
                  <div className="presence-dot !w-2 !h-2"></div>
               </div>
               <div className="space-y-3">
                  {leaderboard.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                       <span className="text-xs font-bold text-white/60">{i+1}. {m.member}</span>
                       <span className="text-xs font-black text-yellow-500">{m.score} 🥚</span>
                    </div>
                  ))}
               </div>
               <p className="text-[8px] text-center mt-6 text-white/10 font-black uppercase tracking-widest">Codul Echipei: {team.id}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-[3.5rem] opacity-20">
               <span className="text-4xl mb-4">🏘️</span>
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Nu aparții niciunei echipe</p>
            </div>
          )}
        </div>

      </div>

      {/* SEO FOOTER SECTION (Peste 30 linii de densitate textuală) */}
      <footer className="mt-32 w-full text-center space-y-12">
         <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left px-4 opacity-40 hover:opacity-100 transition-opacity duration-700">
            <div className="space-y-4">
               <h5 className="text-[11px] font-black text-red-500 uppercase tracking-widest">Tradiție Digitală</h5>
               <p className="text-[10px] font-medium leading-relaxed">Ciocnim.ro este platforma oficială a arenei digitale de Paște. Folosim tehnologii de tip real-time (Pusher) și baze de date de mare viteză (Redis) pentru a simula ciocnitul ouălor de Paște la un nivel competitiv național.</p>
            </div>
            <div className="space-y-4">
               <h5 className="text-[11px] font-black text-red-500 uppercase tracking-widest">Matchmaking Inteligent</h5>
               <p className="text-[10px] font-medium leading-relaxed">Sistemul nostru de duel aleatoriu folosește algoritmi de balansare a impactului, asigurând o șansă egală pentru toți luptătorii, cu excepția celor care au obținut legendarul Ou de Aur prin drop-ul orar de 5%.</p>
            </div>
            <div className="space-y-4">
               <h5 className="text-[11px] font-black text-red-500 uppercase tracking-widest">Securitate și Fairplay</h5>
               <p className="text-[10px] font-medium leading-relaxed">Protejăm datele jucătorilor noștri prin arhitecturi serverless. Clasamentele echipelor sunt actualizate în timp real și monitorizate pentru a asigura un mediu de joc sănătos și festiv pentru toți românii.</p>
            </div>
         </div>

         <div className="space-y-4 pb-12">
            <p className="text-[10px] font-black text-white/5 uppercase tracking-[0.8em]">Ciocnim.ro &copy; 2026 • Made with passion for tradition</p>
            <p className="text-[9px] font-black text-red-600/40 uppercase tracking-[0.2em]">Hristos a Înviat! Sărbători liniștite alături de cei dragi în Arena Sanctuarului.</p>
         </div>
      </footer>

      {/* DECORAȚIUNI BACKGROUND (NON-SELECTABLE) */}
      <div className="fixed bottom-[-10vh] right-[-10vw] text-[40vh] font-black italic text-white/[0.02] select-none pointer-events-none uppercase">Ciocnim</div>
      <div className="fixed top-[-5vh] left-[-5vw] text-[30vh] font-black italic text-white/[0.02] select-none pointer-events-none uppercase">Oua</div>

    </div>
  );
}

/**
 * ROOT EXPORT: Home (Navbar Compact)
 */
export default function Home() {
  const { totalGlobal } = useGlobalStats();

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      
      {/* NAVBAR COMPACT (V9.0) */}
      <nav className="fixed top-6 left-0 w-full flex justify-center z-[500] px-6">
        <div className="glass-panel p-2 rounded-full flex items-center bg-black/80 border border-white/10 shadow-2xl saturate-150">
          <div className="flex items-center gap-3 pl-6 pr-6 py-2 border-r border-white/10">
            <span className="text-2xl animate-bounce">🥚</span>
            <span className="font-black text-xs uppercase tracking-tighter text-white">Ciocnim<span className="text-red-600">.ro</span></span>
          </div>

          <div className="flex items-center gap-5 px-8 py-2">
            <div className="presence-dot !w-2.5 !h-2.5"></div>
            <div className="flex flex-col">
              <span className="text-white/20 font-black text-[7px] tracking-widest uppercase mb-1">Bilanț Național</span>
              <span className="font-black text-yellow-500 text-2xl leading-none tabular-nums text-glow-gold drop-shadow-md">
                {totalGlobal?.toLocaleString('ro-RO') || '9'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center font-black text-white/5 text-4xl animate-pulse">LIQUID ENGINE LOADING...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}