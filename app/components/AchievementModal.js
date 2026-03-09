import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementModal = ({ isOpen, onClose, achievements }) => {
  if (!isOpen) return null;

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">🏆 Realizări</h2>
                <p className="text-yellow-100">{earnedCount} / {totalCount} deblocate</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <motion.div
                  key={ach.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    ach.earned
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${ach.earned ? '' : 'grayscale'}`}>
                      {ach.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${ach.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                        {ach.name}
                      </h3>
                      <p className={`text-sm mb-2 ${ach.earned ? 'text-gray-700' : 'text-gray-400'}`}>
                        {ach.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ach.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                          ach.rarity === 'epic' ? 'bg-pink-100 text-pink-800' :
                          ach.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ach.rarity === 'legendary' ? 'Legendary' :
                           ach.rarity === 'epic' ? 'Epic' :
                           ach.rarity === 'rare' ? 'Rare' : 'Common'}
                        </span>
                        {ach.earned && (
                          <span className="text-yellow-500 text-sm">✓ Deblocat</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementModal;