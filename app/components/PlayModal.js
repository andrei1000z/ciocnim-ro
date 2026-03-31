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
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const createRoom = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'creeaza-camera-privata', gameMode: 'classic' }) });
      if (!res.ok) { setRoomError("Eroare server. Încearcă din nou."); return; }
      const data = await res.json();
      if (data.success) {
        try {
          sessionStorage.setItem('room-host-token', data.hostToken || '');
        } catch {}
        onClose();
        router.push(`/joc/privat-${data.cod}`);
      } else { setRoomError(data.error || "Nu s-a putut crea camera."); }
    } catch { setRoomError("Eroare de rețea. Încearcă din nou."); }
    finally { setIsCreating(false); }
  };

  const joinRoom = async () => {
    if (roomCode.length !== 4) { setRoomError("Codul are exact 4 caractere!"); return; }
    setIsJoining(true); setRoomError("");
    try {
      const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'check-room', cod: roomCode }) });
      if (!res.ok) { setRoomError("Eroare server. Încearcă din nou."); return; }
      const data = await res.json();
      if (!data.success) { setRoomError(data.error || "Camera este ocupată!"); }
      else { onClose(); router.push(`/joc/privat-${roomCode}`); }
    } catch { setRoomError("Eroare de rețea. Încearcă din nou."); }
    finally { setIsJoining(false); }
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
        className="bg-surface backdrop-blur-xl rounded-3xl border border-red-900/15 w-full max-w-sm shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-black text-heading">Joacă cu un Prieten 🥚</h2>
            <p className="text-xs mt-0.5 text-dim">Creezi o cameră, trimiți codul prietenului</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-elevated hover:bg-overlay rounded-full flex items-center justify-center transition-colors text-sm text-dim">×</button>
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
            <div className="flex-1 h-px bg-edge-strong" />
            <span className="text-xs font-bold uppercase tracking-wider text-dim">sau</span>
            <div className="flex-1 h-px bg-edge-strong" />
          </div>
          <input
            value={roomCode}
            onChange={e => { setRoomCode(e.target.value.toUpperCase().trim()); setRoomError(""); }}
            onKeyDown={e => e.key === "Enter" && joinRoom()}
            placeholder="COD CAMERĂ"
            maxLength={4}
            className={`w-full px-4 py-3 rounded-2xl border-2 font-bold text-center text-base uppercase outline-none transition-all text-heading bg-elevated focus:bg-elevated-hover ${roomError ? "border-red-400 focus:border-red-600" : "border-edge-strong focus:border-red-800"}`}
          />
          {roomError && <p className="text-red-500 text-xs font-semibold text-center -mt-1">{roomError}</p>}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinRoom}
            disabled={isJoining}
            className="w-full bg-overlay hover:bg-elevated-hover disabled:opacity-60 text-heading py-3 rounded-2xl font-bold text-sm transition-all"
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
