"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalStats } from "./ClientWrapper";

const REGIUNI = [
  "Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", 
  "Crișana", "Banat", "Maramureș", "Bucovina"
];

const SKINS = [
  { id: 'red', color: '#dc2626', name: 'Rubin Tradițional' }, 
  { id: 'blue', color: '#2563eb', name: 'Safir Imperial' },
  { id: 'gold', color: '#f59e0b', name: 'Aur Pur' }, 
  { id: 'diamond', color: '#10b981', name: 'Smarald Nativ' },
  { id: 'cosmic', color: '#8b5cf6', name: 'Nebuloasă' }
];

export default function Onboarding({ onComplete }) {
  const { userStats, setUserStats, setNume, triggerVibrate, playSound } = useGlobalStats();
  const [step, setStep] = useState(1);
  const [localName, setLocalName] = useState("");
  const [localRegion, setLocalRegion] = useState("");
  const [localSkin, setLocalSkin] = useState("red");

  const nextStep = () => {
    triggerVibrate(30);
    playSound('victorie'); // Un mic sunet de confirmare pe fiecare pas
    setStep(prev => prev + 1);
  };

  const finishOnboarding = () => {
    // Salvăm toate datele odată în Nucleu
    setNume(localName.toUpperCase());
    setUserStats({
      ...userStats,
      regiune: localRegion,
      skin: localSkin
    });
    triggerVibrate([50, 100, 50]);
    playSound('spargere'); // Adrenalină la intrarea în Sanctuar
    onComplete();
  };

  const variants = {
    enter: { opacity: 0, x: 50, filter: "blur(10px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -50, filter: "blur(10px)" }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#010000] flex flex-col items-center justify-center p-6 overflow-hidden touch-none">
      
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12 w-full justify-center">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-red-600 shadow-[0_0_10px_red]' : 'w-4 bg-white/10'}`} />
          ))}
        </div>

        <div className="w-full h-[400px] relative flex justify-center items-center">
          <AnimatePresence mode="wait">
            
            {/* PASUL 1: NUMELE */}
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="absolute w-full flex flex-col items-center text-center gap-8">
                <span className="text-6xl animate-float-v9">🥚</span>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Cine intră în <span className="text-red-600">Arenă?</span></h2>
                  <p className="text-[10px] text-white/50 uppercase tracking-[0.3em]">Identitatea ta digitală</p>
                </div>
                <input 
                  value={localName} 
                  onChange={e => setLocalName(e.target.value)}
                  placeholder="PORECLA TA..."
                  className="w-full bg-white/5 p-6 rounded-[2rem] border-2 border-white/10 text-2xl font-black focus:border-red-600 transition-all outline-none text-white text-center tracking-widest shadow-xl"
                  autoFocus
                />
                <button 
                  onClick={nextStep} 
                  disabled={localName.length < 3}
                  className="w-full bg-red-600 disabled:bg-white/5 disabled:text-white/20 p-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Continuă ⚡
                </button>
              </motion.div>
            )}

            {/* PASUL 2: REGIUNEA */}
            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="absolute w-full flex flex-col items-center text-center gap-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Alege-ți <span className="text-red-600">Tabăra</span></h2>
                  <p className="text-[10px] text-white/50 uppercase tracking-[0.3em]">Pentru clasamentul național</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-h-[250px] overflow-y-auto custom-scrollbar p-1">
                  {REGIUNI.map(reg => (
                    <button 
                      key={reg} 
                      onClick={() => setLocalRegion(reg)}
                      className={`p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${localRegion === reg ? 'bg-red-600 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={nextStep} 
                  disabled={!localRegion}
                  className="w-full mt-2 bg-red-600 disabled:bg-white/5 disabled:text-white/20 p-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Confirmă Tabăra 🚩
                </button>
              </motion.div>
            )}

            {/* PASUL 3: SKIN-UL */}
            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="absolute w-full flex flex-col items-center text-center gap-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Armura <span className="text-red-600">Kinetică</span></h2>
                  <p className="text-[10px] text-white/50 uppercase tracking-[0.3em]">Alege culoarea oului tău</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {SKINS.map(s => (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setLocalSkin(s.id)}
                      className={`w-16 h-20 rounded-[2rem] transition-all duration-300 ${localSkin === s.id ? 'border-4 border-white z-10 scale-110' : 'opacity-40 grayscale'}`}
                      style={{ backgroundColor: s.color, boxShadow: localSkin === s.id ? `0 0 30px ${s.color}AA` : 'none' }}
                    />
                  ))}
                </div>
                <p className="text-xs font-black uppercase text-white/80">{SKINS.find(s => s.id === localSkin)?.name}</p>
                <button 
                  onClick={nextStep} 
                  className="w-full bg-red-600 p-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Echipează 🛡️
                </button>
              </motion.div>
            )}

            {/* PASUL 4: TUTORIALUL (CALIBRAREA) */}
            {step === 4 && (
              <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="absolute w-full flex flex-col items-center text-center gap-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic text-red-600">Calibrare!</h2>
                  <p className="text-[10px] text-white/50 uppercase tracking-[0.3em]">Cum lovești în Sanctuar?</p>
                </div>
                
                <div className="relative w-40 h-40 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <motion.div
                    animate={{ rotate: [-20, 20, -20], x: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="text-7xl drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]"
                  >
                    📱
                  </motion.div>
                </div>

                <p className="text-xs font-bold text-white/80 max-w-[250px] leading-relaxed">
                  Când ești <strong className="text-red-500 uppercase">Atacant</strong>, ține bine de telefon și simulează o lovitură reală din încheietură!
                </p>

                <button 
                  onClick={finishOnboarding} 
                  className="w-full bg-red-600 p-6 rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all shadow-[0_15px_40px_rgba(220,38,38,0.4)] animate-pulse"
                >
                  INTRĂ ÎN SANCTUAR ⚔️
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}