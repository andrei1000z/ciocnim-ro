"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

const PlayModal = ({ isOpen, onClose, router, userSkin }) => {
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomError, setRoomError] = useState("");

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; setRoomError(""); }
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const createRoom = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'creeaza-camera-privata' }) });
      const data = await res.json();
      if (data.success) { onClose(); router.push(`/joc/privat-${data.cod}?host=true&skin=${userSkin}`); }
    } catch { setRoomError("Eroare de rețea. Încearcă din nou."); }
    finally { setIsCreating(false); }
  };

  const joinRoom = async () => {
    if (roomCode.length < 3) { setRoomError("Codul trebuie să aibă minim 3 caractere!"); return; }
    setIsJoining(true); setRoomError("");
    try {
      const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'check-room', cod: roomCode }) });
      const data = await res.json();
      if (!data.success) { setRoomError(data.error || "Camera este ocupată!"); }
      else { onClose(); router.push(`/joc/privat-${roomCode}?host=false&skin=${userSkin}`); }
    } catch { setRoomError("Eroare de rețea. Încearcă din nou."); }
    finally { setIsJoining(false); }
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
        style={{ background: 'rgba(20,17,17,0.98)', backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid rgba(220,38,38,0.15)', width: '100%', maxWidth: '384px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Ciocnește cu un Prieten 🥚</h2>
            <p className="text-xs text-gray-400 mt-0.5">Creezi o cameră, trimiți codul prietenului</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/[0.05] hover:bg-white/[0.1] rounded-full flex items-center justify-center text-gray-400 transition-colors text-sm">×</button>
        </div>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRoom}
            disabled={isCreating}
            className="w-full bg-red-800 hover:bg-red-900 disabled:opacity-60 text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-red-900/20"
          >
            {isCreating ? "Se creează..." : "Creează Cameră Nouă"}
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.1]" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">sau</span>
            <div className="flex-1 h-px bg-white/[0.1]" />
          </div>
          <input
            value={roomCode}
            onChange={e => { setRoomCode(e.target.value.toUpperCase().trim()); setRoomError(""); }}
            onKeyDown={e => e.key === "Enter" && joinRoom()}
            placeholder="COD CAMERĂ"
            maxLength={6}
            className={`w-full px-4 py-3 rounded-2xl border-2 font-bold text-center text-base uppercase outline-none transition-all bg-white/[0.05] focus:bg-white/[0.08] text-white ${roomError ? "border-red-400 focus:border-red-600" : "border-white/[0.1] focus:border-red-800"}`}
          />
          {roomError && <p className="text-red-500 text-xs font-semibold text-center -mt-1">{roomError}</p>}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinRoom}
            disabled={isJoining}
            className="w-full bg-white/[0.1] hover:bg-white/[0.15] disabled:opacity-60 text-white py-3 rounded-2xl font-bold text-sm transition-all"
          >
            {isJoining ? "Se verifică..." : "Intră cu Codul"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default PlayModal;
