"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FriendList = ({ isOpen, onClose, currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Mock data for now - in real implementation, fetch from API
      setFriends([
        { id: 1, name: "ION_POPESCU", status: "online", inGame: false },
        { id: 2, name: "MARIA_IONESCU", status: "in_game", inGame: true, gameType: "private" },
        { id: 3, name: "ANDREI_VASILE", status: "offline", inGame: false },
        { id: 4, name: "ANA_MARIA", status: "online", inGame: false }
      ]);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'in_game': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (friend) => {
    if (friend.status === 'in_game') return 'În meci';
    return friend.status === 'online' ? 'Online' : 'Offline';
  };

  const handleInvite = (friendName) => {
    // Mock invite - in real implementation, send invite via API
    alert(`Invitație trimisă către ${friendName}!`);
  };

  if (!isOpen) return null;

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
        className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-purple-200 w-full max-w-md shadow-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white">👥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Prieteni</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="text-gray-600 text-lg">×</span>
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <motion.div 
                key={friend.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-white/70 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(friend.status)} shadow-sm`}></div>
                  <div>
                    <div className="font-bold text-gray-800">{friend.name}</div>
                    <div className="text-sm text-gray-600">{getStatusText(friend)}</div>
                  </div>
                </div>
                
                {friend.status === 'online' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleInvite(friend.name)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:from-purple-600 hover:to-pink-700 transition-all"
                  >
                    Invită
                  </motion.button>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-600 font-semibold">Niciun prieten adăugat</p>
              <p className="text-gray-500 text-sm mt-2">Invită prieteni să se alăture!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FriendList;