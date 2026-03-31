"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REGIUNI_ISTORICE = ["Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", "Crișana", "Banat", "Maramureș", "Bucovina", "Diaspora"];

// ─── Mini Egg SVG ──────────────────────────────────────────────────────────────
const MiniEgg = ({ grad1, grad2, patternType, patternColor }) => {
  const uid = `mini-${grad1.replace('#','')}-${patternType}`;
  const eggPath = "M25 0 C10 0 0 20 0 40 C0 55 10 65 25 65 C40 65 50 55 50 40 C50 20 40 0 25 0 Z";
  const renderPat = () => {
    const c = patternColor;
    switch (patternType) {
      case 'cross-stitch':
        return <pattern id={`mp-${uid}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <line x1="1" y1="1" x2="4" y2="4" stroke={c} strokeWidth="0.8"/><line x1="4" y1="1" x2="1" y2="4" stroke={c} strokeWidth="0.8"/>
          <line x1="6" y1="6" x2="9" y2="9" stroke={c} strokeWidth="0.8"/><line x1="9" y1="6" x2="6" y2="9" stroke={c} strokeWidth="0.8"/>
        </pattern>;
      case 'brau':
        return <pattern id={`mp-${uid}`} width="12" height="65" patternUnits="userSpaceOnUse">
          <line x1="0" y1="28" x2="12" y2="28" stroke={c} strokeWidth="1"/><line x1="0" y1="37" x2="12" y2="37" stroke={c} strokeWidth="1"/>
          <line x1="0" y1="30" x2="6" y2="33" stroke={c} strokeWidth="0.7"/><line x1="6" y1="33" x2="0" y2="36" stroke={c} strokeWidth="0.7"/>
          <line x1="6" y1="30" x2="12" y2="33" stroke={c} strokeWidth="0.7"/><line x1="12" y1="33" x2="6" y2="36" stroke={c} strokeWidth="0.7"/>
        </pattern>;
      case 'ie-gala':
        return <pattern id={`mp-${uid}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2" fill="none" stroke={c} strokeWidth="0.6"/><circle cx="7" cy="7" r="0.7" fill={c} opacity="0.5"/>
          <line x1="7" y1="0" x2="7" y2="5" stroke={c} strokeWidth="0.4" opacity="0.3"/><line x1="7" y1="9" x2="7" y2="14" stroke={c} strokeWidth="0.4" opacity="0.3"/>
        </pattern>;
      case 'brad':
        return <pattern id={`mp-${uid}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <line x1="6" y1="1" x2="2" y2="6" stroke={c} strokeWidth="0.7"/><line x1="6" y1="1" x2="10" y2="6" stroke={c} strokeWidth="0.7"/>
          <line x1="6" y1="5" x2="1" y2="11" stroke={c} strokeWidth="0.7"/><line x1="6" y1="5" x2="11" y2="11" stroke={c} strokeWidth="0.7"/>
        </pattern>;
      default: return null;
    }
  };
  return (
    <svg viewBox="0 0 50 65" className="w-full h-full">
      <defs>
        <linearGradient id={`mg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={grad1}/><stop offset="100%" stopColor={grad2}/></linearGradient>
        <clipPath id={`mc-${uid}`}><path d={eggPath}/></clipPath>
        <radialGradient id={`mh-${uid}`} cx="38%" cy="28%" r="50%"><stop offset="0%" stopColor="rgba(255,255,255,0.45)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></radialGradient>
        {renderPat()}
      </defs>
      <path d={eggPath} fill={`url(#mg-${uid})`}/>
      <rect x="0" y="0" width="50" height="65" fill={`url(#mp-${uid})`} clipPath={`url(#mc-${uid})`}/>
      <path d={eggPath} fill={`url(#mh-${uid})`} opacity="0.5"/>
    </svg>
  );
};

// ─── Selector Culoare ───────────────────────────────────────────────────────────
export const ColorSelector = ({ selected, onSelect }) => {
  const culori = [
    { id: "red", label: "Roșu", grad1: '#dc2626', grad2: '#7f1d1d', patternType: 'cross-stitch', patternColor: 'rgba(255,255,255,0.2)' },
    { id: "blue", label: "Albastru", grad1: '#2563eb', grad2: '#1e3a8a', patternType: 'brau', patternColor: 'rgba(255,255,255,0.25)' },
    { id: "gold", label: "Auriu", grad1: '#f59e0b', grad2: '#78350f', patternType: 'ie-gala', patternColor: 'rgba(255,255,255,0.3)' },
    { id: "green", label: "Verde", grad1: '#166534', grad2: '#052e16', patternType: 'brad', patternColor: 'rgba(255,255,255,0.22)' },
  ];
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-dim uppercase tracking-wide">Culoare Ou</label>
      <div className="grid grid-cols-4 gap-1.5">
        {culori.map(c => (
          <motion.button
            key={c.id}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(c.id)}
            className={`rounded-xl border-2 transition-all relative flex flex-col items-center justify-center p-1.5 ${selected === c.id ? "border-white shadow-md bg-elevated-hover" : "border-transparent opacity-60 hover:opacity-90 bg-card"}`}
          >
            <div className="w-8 h-10">
              <MiniEgg grad1={c.grad1} grad2={c.grad2} patternType={c.patternType} patternColor={c.patternColor} />
            </div>
            <span className="text-xs font-bold text-dim mt-0.5">{c.label}</span>
            {selected === c.id && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center text-white text-[9px] border border-white/30">✓</motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ─── Selector Regiune ───────────────────────────────────────────────────────────
export const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-dim uppercase tracking-wide">Regiunea Ta</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(v => !v)}
          className="w-full px-3 py-2.5 bg-elevated rounded-xl border border-edge-strong font-semibold text-left flex justify-between items-center hover:border-red-800 transition-all text-sm"
        >
          <span className={selectedRegion ? "text-body" : "text-dim text-xs"}>{selectedRegion || "Alege..."}</span>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-dim text-xs">▾</motion.span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 w-full mb-1.5 bg-surface/95 backdrop-blur-xl rounded-2xl border border-edge-strong p-2 grid grid-cols-2 gap-1 z-50 shadow-2xl shadow-black/30"
            >
              {REGIUNI_ISTORICE.map(r => (
                <button
                  key={r}
                  onClick={() => { onSelectRegion(r); setIsOpen(false); }}
                  className={`px-2 py-2 text-xs font-semibold rounded-xl border transition-all ${selectedRegion === r ? "bg-red-800 text-white border-red-800" : "bg-elevated text-body border-edge hover:border-red-800 hover:text-red-400"}`}
                >
                  {r}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
