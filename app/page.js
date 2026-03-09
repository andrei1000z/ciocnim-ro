"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStats } from "./components/ClientWrapper";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const REGIUNI_ISTORICE = ["Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", "Crișana", "Banat", "Maramureș", "Bucovina"];

// Clasament Jucători și Regiuni
const DualLeaderboard = ({ topRegiuni, topPlayers, myName, myScore }) => {
  const [view, setView] = useState("jucatori");

  const maxRegionScore = useMemo(() => {
    if (!topRegiuni || topRegiuni.length === 0) return 1;
    return Math.max(...topRegiuni.map(r => parseInt(r.scor) || 0), 1);
  }, [topRegiuni]);

  const { myRank, ouaUrmatorulLoc, ouaNecesareTop10 } = useMemo(() => {
    if (!topPlayers || !myName || myName.trim() === "") return { myRank: null };
    
    const cleanMyName = myName.trim().toUpperCase();
    const myIndexInTop = topPlayers.findIndex(p => p.nume === cleanMyName);
    const myScoreNum = parseInt(myScore) || 0;
    
    if (myIndexInTop !== -1) {
      if (myIndexInTop === 0) {
        return { myRank: 1, ouaUrmatorulLoc: 0, ouaNecesareTop10: 0 };
      } else {
        const scorPrecedent = parseInt(topPlayers[myIndexInTop - 1].scor) || 0;
        const necesar = Math.max(1, scorPrecedent - myScoreNum + 1);
        return { myRank: myIndexInTop + 1, ouaUrmatorulLoc: necesar, ouaNecesareTop10: 0 };
      }
    }
    
    const scorLocul10 = topPlayers.length >= 10 ? (parseInt(topPlayers[9].scor) || 1) : (topPlayers.length > 0 ? (parseInt(topPlayers[topPlayers.length - 1].scor) || 1) : 1);
    let diferenta = scorLocul10 - myScoreNum;
    if (diferenta <= 0) diferenta = 1;
    
    return { myRank: 10 + diferenta, ouaUrmatorulLoc: diferenta, ouaNecesareTop10: diferenta };
  }, [topPlayers, myName, myScore]);

  const safeMyScore = parseInt(myScore) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-red-200 shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex gap-2 mb-8 p-2 bg-gray-100 rounded-2xl">
        <button 
          onClick={() => setView("jucatori")}
          className={`flex-1 py-4 font-bold text-center rounded-xl transition-all duration-300 ${
            view === "jucatori" 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105' 
              : 'bg-transparent text-gray-600 hover:text-red-600 hover:bg-white/50'
          }`}
        >
          🏆 JUCĂTORI
        </button>
        <button 
          onClick={() => setView("regiuni")}
          className={`flex-1 py-4 font-bold text-center rounded-xl transition-all duration-300 ${
            view === "regiuni" 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105' 
              : 'bg-transparent text-gray-600 hover:text-red-600 hover:bg-white/50'
          }`}
        >
          🗺️ REGIUNI
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === "jucatori" ? (
          <motion.div 
            key="jucatori" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3"
          >
            {topPlayers && topPlayers.length > 0 ? (
              <>
                {topPlayers.map((p, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex justify-between items-center p-5 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                      p.nume === myName?.toUpperCase().trim() 
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 shadow-yellow-200' 
                        : 'bg-white/70 border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                        i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                        i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-red-400 to-red-600'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="font-bold text-gray-800 text-lg">{p.nume}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🥚</span>
                      <span className="font-bold text-green-700 text-xl">{parseInt(p.scor) || 0}</span>
                    </div>
                  </motion.div>
                ))}
                
                {myName && myRank !== null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 pt-6 border-t-2 border-red-200"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-300 shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                            #{myRank}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 text-lg">{myName}</span>
                            <div className="text-sm text-blue-600 font-medium">(TU)</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🥚</span>
                          <span className="font-bold text-green-700 text-xl">{safeMyScore}</span>
                        </div>
                      </div>
                      <div className="bg-white/70 p-4 rounded-xl">
                        <p className="text-center font-bold text-blue-800 text-sm">
                          {myRank === 1 ? "🎉 CAMPION NAȚIONAL! 🎉" : myRank <= 10 ? `Ai nevoie de ${ouaUrmatorulLoc} victorie/e pentru a avansa` : `Ai nevoie de ${ouaNecesareTop10} victorie/e pentru TOP 10`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-bounce">🥚</div>
                <p className="text-gray-600 font-semibold text-lg">Niciun jucător în clasament</p>
                <p className="text-gray-500 text-sm mt-2">Fii primul care începe tradiția!</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="regiuni" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {topRegiuni && topRegiuni.length > 0 ? (
              topRegiuni.map((reg, i) => (
                <motion.div 
                  key={reg.regiune}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                        {i + 1}
                      </div>
                      <span className="font-bold text-gray-800">#{i + 1} {reg.regiune}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🥚</span>
                      <span className="font-bold text-green-700">{parseInt(reg.scor) || 0}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 border border-gray-300 overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(parseInt(reg.scor || 0) / maxRegionScore) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-sm"
                    />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-pulse">🗺️</div>
                <p className="text-gray-600 font-semibold text-lg">Așteptăm prima bătălie...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Butoane de acțiune
const ActionButton = ({ onClick, icon, title, subtitle, loading = false }) => {
  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      disabled={loading}
      className="w-full p-6 md:p-8 rounded-2xl border-2 border-red-200 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-red-300 transition-all duration-300 flex items-center gap-6 text-left active:scale-95 disabled:opacity-50 shadow-lg hover:shadow-xl group"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <span className="text-2xl md:text-3xl text-white group-hover:animate-bounce">{icon}</span>
      </div>
      <div className="flex-1">
        <div className="font-bold text-gray-800 text-lg md:text-xl mb-1 group-hover:text-red-700 transition-colors">{title}</div>
        {subtitle && <div className="text-sm text-gray-600 group-hover:text-red-600 transition-colors">{subtitle}</div>}
      </div>
      {loading && (
        <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      )}
      {!loading && (
        <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-sm">→</span>
        </div>
      )}
    </motion.button>
  );
};

// Modal pentru joc privat
const PlayModal = ({ isOpen, onClose, router, userSkin }) => {
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase(); 
    onClose();
    router.push(`/joc/privat-${code}?host=true&skin=${userSkin}`);
  };

  const joinRoom = () => {
    if (roomCode.length >= 3) {
      onClose();
      router.push(`/joc/privat-${roomCode}?host=false&skin=${userSkin}`);
    } else {
      alert("Codul trebuie să aibă minim 3 caractere!");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-red-200 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white">🥚</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Meci Privat</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="text-gray-600 text-lg">×</span>
          </button>
        </div>
        
        <div className="space-y-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRoom} 
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-5 rounded-2xl font-bold border-2 border-red-500 hover:from-red-600 hover:to-red-700 transition-all active:scale-95 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">➕</span>
              <span>Creează Cameră</span>
            </div>
          </motion.button>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
            <span className="text-red-600 font-semibold px-3">SAU</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
          </div>
          
          <div className="space-y-4">
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().trim())}
              placeholder="COD CAMERA"
              maxLength={6}
              className="w-full p-4 rounded-2xl border-2 border-gray-200 font-bold text-center text-lg uppercase outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all bg-white/50"
            />
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={joinRoom} 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl font-bold border-2 border-green-500 hover:from-green-600 hover:to-green-700 transition-all active:scale-95 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl">🎯</span>
                <span>INTRĂ ÎN JOC</span>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Hub Grup Privat
const GroupHub = ({ teams, activeTeamIndex, setActiveTeamIndex, numePreluat, onLeave, onRename, onProvoca }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copyLinkText, setCopyLinkText] = useState("🔗 INVITĂ");
  
  if (!teams || teams.length === 0) return null;
  
  const currentTeam = teams[activeTeamIndex];
  const [newName, setNewName] = useState(currentTeam.details.nume);

  useEffect(() => {
    setNewName(currentTeam.details.nume);
    setIsEditing(false);
  }, [activeTeamIndex, currentTeam]);

  const handleSave = () => {
    onRename(currentTeam.details.id, newName);
    setIsEditing(false);
  };

  const nextTeam = () => setActiveTeamIndex((prev) => (prev + 1) % teams.length);
  const prevTeam = () => setActiveTeamIndex((prev) => (prev - 1 + teams.length) % teams.length);

  const handleInvite = async () => {
    const inviteUrl = `${window.location.origin}/?joinTeam=${currentTeam.details.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Jucă Ciocnim cu mine!',
          text: `Te provoc la ${currentTeam.details.nume}`,
          url: inviteUrl,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(inviteUrl);
      setCopyLinkText("✅ COPIAT");
      setTimeout(() => setCopyLinkText("🔗 INVITĂ"), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-red-200 w-full shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Grup Privat</h3>
          </div>
          {teams.length > 1 && (
            <div className="bg-red-100 px-4 py-2 rounded-full border border-red-200">
              <span className="text-sm font-bold text-red-700">{activeTeamIndex + 1}/{teams.length}</span>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          {isEditing ? (
            <div className="flex gap-3">
              <input 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="flex-1 p-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all bg-white/50"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave} 
                className="px-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl border-2 border-green-500 hover:from-green-600 hover:to-green-700 transition-all active:scale-95 shadow-lg"
              >
                OK
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-3 cursor-pointer group p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all" onClick={() => setIsEditing(true)}>
              <h4 className="text-xl font-bold text-gray-800">{currentTeam.details.nume}</h4>
              <motion.span 
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="text-red-500 group-hover:text-red-600 transition-colors"
              >
                ✏️
              </motion.span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInvite} 
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 font-bold rounded-xl border-2 border-blue-500 hover:from-blue-600 hover:to-blue-700 transition-all active:scale-95 shadow-lg hover:shadow-xl"
          >
            {copyLinkText}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onLeave(currentTeam.details.id)} 
            className="px-6 py-4 bg-red-100 text-red-700 font-bold rounded-xl border-2 border-red-300 hover:bg-red-200 transition-all active:scale-95 shadow-lg"
          >
            Ieși
          </motion.button>
        </div>
      </div>

      {teams.length > 1 && (
        <div className="flex gap-3 mb-6 justify-between items-center bg-gray-100 p-4 rounded-2xl border border-gray-200">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevTeam} 
            className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
          >
            ◀
          </motion.button>
          <span className="text-sm font-bold text-gray-700">Schimbă Grupul</span>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextTeam} 
            className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
          >
            ▶
          </motion.button>
        </div>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-transparent">
        {currentTeam.top.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-5 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
              m.member === numePreluat?.toUpperCase().trim() 
                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400' 
                : 'bg-white/70 border-gray-200 hover:border-red-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                  i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                  i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                  i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                  'bg-gradient-to-br from-red-400 to-red-600'
                }`}>
                  {i + 1}
                </div>
                <span className="font-bold text-gray-800 text-lg">{m.member}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥚</span>
                  <span className="font-bold text-green-700 text-lg">{parseInt(m.score) || 0}</span>
                </div>
                
                {m.member !== numePreluat?.toUpperCase().trim() && (
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onProvoca(m.member, currentTeam.details.id)}
                    className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center transition-all hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                    title="Provocă la duel"
                  >
                    ⚔️
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {currentTeam.top.length <= 1 && (
          <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-red-300">
            <div className="text-6xl mb-4 animate-bounce">👥</div>
            <p className="text-gray-600 font-semibold text-lg">Invită prieteni pentru a juca</p>
            <p className="text-gray-500 text-sm mt-2">Construiește-ți echipa!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Selectoare Culoare și Regiune
const ColorSelector = ({ selected, onSelect }) => {
  const culori = [
    { id: 'red', color: '#dc2626', name: 'Roșu', emoji: '❤️' },
    { id: 'blue', color: '#2563eb', name: 'Albastru', emoji: '💙' },
    { id: 'gold', color: '#f59e0b', name: 'Auriu', emoji: '🥇' },
    { id: 'diamond', color: '#10b981', name: 'Verde', emoji: '💚' },
    { id: 'cosmic', color: '#8b5cf6', name: 'Violet', emoji: '💜' }
  ];
  
  return (
    <div className="space-y-3">
      <label className="block font-semibold text-gray-700 text-sm">Culoare Ou</label>
      <div className="grid grid-cols-5 gap-3">
        {culori.map(c => (
          <motion.button 
            key={c.id} 
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(c.id)} 
            className={`aspect-square rounded-2xl border-3 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden ${
              selected === c.id 
                ? 'scale-110 border-red-500 ring-4 ring-red-200' 
                : 'border-gray-300 opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: c.color }}
            title={c.name}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl drop-shadow-lg">{c.emoji}</span>
            </div>
            {selected === c.id && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xs">✓</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-3">
      <label className="block font-semibold text-gray-700 text-sm">Regiunea Ta</label>
      <div className="relative">
        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsOpen(!isOpen)} 
          className="w-full p-4 bg-white/70 rounded-2xl border-2 border-gray-200 font-semibold text-left flex justify-between items-center hover:bg-white/80 hover:border-red-300 transition-all duration-300 shadow-lg"
        >
          <span className={selectedRegion ? 'text-gray-800' : 'text-gray-500'}>
            {selectedRegion || "Alege regiunea..."}
          </span>
          <motion.span 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-500"
          >
            ▼
          </motion.span>
        </motion.button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 w-full mt-3 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-red-200 p-4 grid grid-cols-2 gap-3 z-50 shadow-2xl"
            >
              {REGIUNI_ISTORICE.map((regiune) => (
                <motion.button 
                  key={regiune}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(220, 38, 38, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { 
                    onSelectRegion(regiune); 
                    setIsOpen(false); 
                  }}
                  className={`p-4 font-semibold rounded-xl border-2 transition-all duration-200 ${
                    selectedRegion === regiune 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-lg' 
                      : 'bg-white/70 text-gray-700 border-gray-200 hover:border-red-300'
                  }`}
                >
                  {regiune}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Componenta Principală
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { totalGlobal, topRegiuni, topJucatori, nume, setNume, userStats, setUserStats, isHydrated, triggerVibrate } = useGlobalStats();
  
  const [loadedTeams, setLoadedTeams] = useState([]); 
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [localNume, setLocalNume] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [hasInitializedName, setHasInitializedName] = useState(false);

  useEffect(() => {
    if (nume && !hasInitializedName) {
      setLocalNume(nume);
      setHasInitializedName(true);
    }
  }, [nume, hasInitializedName]);

  const getStoredTeamIds = () => {
    const stored = localStorage.getItem("c_teamIds");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return []; }
    }
    return [];
  };

  const addStoredTeamId = (id) => {
    const ids = getStoredTeamIds();
    if (!ids.includes(id)) {
      const newIds = [...ids, id];
      localStorage.setItem("c_teamIds", JSON.stringify(newIds));
      return newIds;
    }
    return ids;
  };

  const removeStoredTeamId = (id) => {
    const ids = getStoredTeamIds();
    const newIds = ids.filter(teamId => teamId !== id);
    localStorage.setItem("c_teamIds", JSON.stringify(newIds));
    return newIds;
  };

  const handleSaveNume = async () => {
    const finalName = localNume.trim().toUpperCase();
    if (finalName.length < 3) return;
    if (finalName === (nume || "").trim().toUpperCase()) return;

    triggerVibrate();
    setIsSavingName(true);
    
    const success = await setNume(finalName);
    if (!success) setLocalNume(nume || "");
    
    setIsSavingName(false);
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!nume || nume.length < 3) {
      setLoadedTeams([]);
      return;
    }

    const fetchAllTeams = async () => {
      let idsToFetch = getStoredTeamIds();
      const paramId = searchParams.get("joinTeam");
      
      if (paramId && !idsToFetch.includes(paramId)) {
        idsToFetch.push(paramId);
        addStoredTeamId(paramId); 
      }

      if (idsToFetch.length === 0) {
        setLoadedTeams([]);
        return;
      }

      const results = [];
      const validIds = [];

      for (const tid of idsToFetch) {
        try {
          const res = await fetch('/api/ciocnire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actiune: 'get-team-details', teamId: tid, jucator: nume })
          });
          const data = await res.json();
          if (data.success) {
            results.push({ details: data.details, top: data.top || [] });
            validIds.push(tid);
          }
        } catch (e) {}
      }
      
      localStorage.setItem("c_teamIds", JSON.stringify(validIds));
      setLoadedTeams(results);
      
      if (paramId) router.replace('/'); 
    };

    fetchAllTeams();
  }, [nume, searchParams, router, isHydrated]);

  const handleCreateTeam = async () => {
    if (!nume || nume.trim().length < 3) return alert("Scrie-ți porecla mai întâi!");
    setLoadingTeam(true);
    triggerVibrate();
    try {
      const res = await fetch('/api/ciocnire', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actiune: 'creeaza-echipa', creator: nume }) 
      });
      const data = await res.json();
      if (data.success) {
        addStoredTeamId(data.teamId);
        
        const newTeamData = { 
          details: { id: data.teamId, nume: `GRUPUL LUI ${nume.toUpperCase().trim()}` }, 
          top: [{ member: nume.toUpperCase().trim(), score: 0 }] 
        };
        
        setLoadedTeams(prev => [...prev, newTeamData]);
        setActiveTeamIndex(loadedTeams.length);
      }
    } catch (e) { alert("Eroare la crearea grupului. Mai încearcă o dată."); } 
    finally { setLoadingTeam(false); }
  };

  const handleRenameTeam = async (teamId, nouNume) => {
    if (nouNume.length < 3) return alert("Nume prea scurt pentru un grup.");
    triggerVibrate();
    
    setLoadedTeams(prev => prev.map(t => {
      if (t.details.id === teamId) {
        return { ...t, details: { ...t.details, nume: nouNume.toUpperCase().trim() } };
      }
      return t;
    }));

    fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actiune: 'redenumeste-echipa', teamId: teamId, newName: nouNume })
    });
  };

  const handleLeaveTeam = (teamId) => {
    if(confirm("Ești sigur că vrei să părăsești acest grup?")) { 
      removeStoredTeamId(teamId);
      setLoadedTeams(prev => prev.filter(t => t.details.id !== teamId));
      setActiveTeamIndex(0);
    }
  };

  const handleProvocare = async (oponent, teamId) => {
    triggerVibrate([50, 50, 50]);
    const roomCode = `privat-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    await fetch('/api/ciocnire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        actiune: 'provocare-duel', 
        jucator: nume, 
        oponentNume: oponent, 
        roomId: roomCode,
        teamId: teamId 
      })
    });

    router.push(`/joc/${roomCode}?host=true&skin=${userStats.skin}&provocare=true&teamId=${teamId}`);
  };

  if (!isHydrated) return null;

  const isNameInvalid = localNume.trim().length < 3 || localNume.trim().toUpperCase() === (nume || "").trim().toUpperCase();

  return (
    <div className="w-full max-w-5xl mx-auto pt-24 pb-20 px-4 space-y-12 relative z-10">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-red-200 shadow-lg mb-6">
          <span className="text-3xl animate-bounce">🥚</span>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Ciocnim.ro
          </h1>
          <span className="text-3xl animate-bounce">🥚</span>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-red-200 shadow-lg">
          <p className="text-red-700 font-semibold text-sm md:text-base">
            Ciocniri Naționale: 
            <span className="text-2xl font-bold text-red-800 ml-2">
              {totalGlobal?.toLocaleString('ro-RO') || '...'}
            </span>
          </p>
        </div>
      </motion.div>

      {/* PROFIL JUCĂTOR */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-red-200 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Profilul Tău</h2>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block font-semibold text-gray-700 text-sm">Porecla Ta</label>
            <div className="flex gap-3">
              <input 
                value={localNume} 
                onChange={e => setLocalNume(e.target.value)}
                placeholder="Scrie porecla..."
                maxLength={30}
                className="flex-1 p-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all duration-200 bg-white/50"
              />
              <button 
                onClick={handleSaveNume} 
                disabled={isSavingName || isNameInvalid}
                className={`px-8 py-4 font-semibold rounded-xl border-2 transition-all duration-200 active:scale-95 shadow-lg ${
                  isNameInvalid || isSavingName 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 hover:from-red-600 hover:to-red-700 hover:shadow-xl'
                }`}
              >
                {isSavingName ? (
                  <div className="animate-spin">⟳</div>
                ) : (
                  "Salvează"
                )}
              </button>
            </div>
            {localNume.trim().length > 0 && localNume.trim().length < 3 && (
              <p className="text-red-500 font-medium text-sm animate-pulse">Minim 3 caractere!</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RegionSelector selectedRegion={userStats.regiune} onSelectRegion={(reg) => setUserStats({...userStats, regiune: reg})} />
            <ColorSelector selected={userStats.skin || 'red'} onSelect={(s) => setUserStats({...userStats, skin: s})} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-white text-xl">🏆</span>
              </div>
              <p className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wide">Victorii</p>
              <p className="text-3xl font-bold text-green-800">{parseInt(userStats.wins) || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-white text-xl">💔</span>
              </div>
              <p className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Înfrângeri</p>
              <p className="text-3xl font-bold text-red-800">{parseInt(userStats.losses) || 0}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BUTOANE ACȚIUNI */}
      <div className="space-y-3">
        <ActionButton 
          icon="⚔️" 
          title="Meci Cu Um Prieten" 
          subtitle="Joacă privat pe o cameră"
          onClick={() => { if (!nume || nume.length < 3) return alert("Porecla prea scurtă!"); triggerVibrate(); setIsPlayModalOpen(true); }} 
        />
        <ActionButton 
          icon="🏰" 
          title={loadedTeams.length > 0 ? "Grup Nou" : "Creează Grup Privat"} 
          subtitle="Invită prieteni să joace"
          onClick={handleCreateTeam} 
          loading={loadingTeam}
        />
        <ActionButton 
          icon="🌍" 
          title="Arenă Națională" 
          subtitle="Joacă cu cineva din țară"
          onClick={() => { if (!nume || nume.length < 3) return alert("Porecla prea scurtă!"); triggerVibrate(); router.push(`/joc/global-arena?skin=${userStats.skin || 'red'}`); }} 
        />
      </div>

      {/* GRUPURI */}
      {loadedTeams.length > 0 && (
        <GroupHub 
          teams={loadedTeams} 
          activeTeamIndex={activeTeamIndex}
          setActiveTeamIndex={setActiveTeamIndex}
          numePreluat={nume}
          onRename={handleRenameTeam}
          onProvoca={handleProvocare}
          onLeave={handleLeaveTeam}
        />
      )}

      {/* CLASAMENT */}
      <DualLeaderboard 
        topRegiuni={topRegiuni} 
        topPlayers={topJucatori} 
        myName={nume} 
        myScore={userStats.wins || 0} 
      />

      {/* LINKURI TRADIȚII */}
      <div className="bg-gradient-to-r from-red-100 to-orange-100 p-6 md:p-8 rounded-3xl border-4 border-red-700 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-2xl md:text-3xl font-black text-red-900 mb-6 text-center">📚 Tradiții și Ghiduri</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/traditii" className="bg-white/90 p-4 rounded-2xl border-3 border-red-500 hover:bg-red-50 transition-all active:scale-95 text-center shadow-lg hover:shadow-xl">
            <span className="text-3xl block mb-2">📖</span>
            <span className="font-bold text-sm text-red-900">Reguli</span>
          </Link>
          <Link href="/vopsit-natural" className="bg-white/90 p-4 rounded-2xl border-3 border-red-500 hover:bg-red-50 transition-all active:scale-95 text-center shadow-lg hover:shadow-xl">
            <span className="text-3xl block mb-2">🧅</span>
            <span className="font-bold text-sm text-red-900">Vopsit</span>
          </Link>
          <Link href="/calendar" className="bg-white/90 p-4 rounded-2xl border-3 border-red-500 hover:bg-red-50 transition-all active:scale-95 text-center shadow-lg hover:shadow-xl">
            <span className="text-3xl block mb-2">📅</span>
            <span className="font-bold text-sm text-red-900">Calendar</span>
          </Link>
          <Link href="/urari" className="bg-white/90 p-4 rounded-2xl border-3 border-red-500 hover:bg-red-50 transition-all active:scale-95 text-center shadow-lg hover:shadow-xl">
            <span className="text-3xl block mb-2">🕊️</span>
            <span className="font-bold text-sm text-red-900">Urări</span>
          </Link>
        </div>
      </div>

      <PlayModal isOpen={isPlayModalOpen} onClose={() => setIsPlayModalOpen(false)} router={router} userSkin={userStats.skin || 'red'} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-gray-900 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-3 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl md:text-8xl animate-float-slow">🥚</div>
        <div className="absolute top-20 right-20 text-4xl md:text-6xl">🐔</div>
        <div className="absolute bottom-20 left-20 text-5xl md:text-7xl animate-float-slow">🌸</div>
        <div className="absolute bottom-10 right-10 text-3xl md:text-5xl">🌷</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl opacity-10">✝️</div>
      </div>

      <Suspense fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin text-4xl">🥚</div>
            <p className="text-lg font-semibold text-red-600 animate-pulse">Se încarcă tradiția...</p>
          </div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </main>
  );
}