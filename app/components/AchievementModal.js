import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementModal = ({ isOpen, onClose, achievements, userStats }) => {
  if (!isOpen) return null;

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  // Group achievements by category
  const categories = {
    'victories': { name: '🏆 Victorii', achievements: [] },
    'social': { name: '👥 Social', achievements: [] },
    'special': { name: '✨ Special', achievements: [] },
    'streaks': { name: '🔥 Serie', achievements: [] }
  };

  achievements.forEach(ach => {
    if (ach.key.includes('wins_') || ach.key === 'first_win') {
      categories.victories.achievements.push(ach);
    } else if (ach.key.includes('group') || ach.key.includes('chat') || ach.key.includes('duel') || ach.key.includes('friend')) {
      categories.social.achievements.push(ach);
    } else if (ach.key.includes('streak') || ach.key.includes('golden') || ach.key.includes('star')) {
      categories.special.achievements.push(ach);
    } else {
      categories.streaks.achievements.push(ach);
    }
  });

  const getProgressInfo = (ach) => {
    const stats = userStats || {};

    if (ach.key === 'first_win') return { current: stats.wins || 0, target: 1 };
    if (ach.key === 'wins_10') return { current: stats.wins || 0, target: 10 };
    if (ach.key === 'wins_50') return { current: stats.wins || 0, target: 50 };
    if (ach.key === 'wins_100') return { current: stats.wins || 0, target: 100 };
    if (ach.key === 'wins_500') return { current: stats.wins || 0, target: 500 };
    if (ach.key === 'wins_1000') return { current: stats.wins || 0, target: 1000 };
    if (ach.key === 'chat_master') return { current: stats.messagesSent || 0, target: 100 };
    if (ach.key === 'streak_5') return { current: stats.currentStreak || 0, target: 5 };
    if (ach.key === 'streak_10') return { current: stats.currentStreak || 0, target: 10 };
    if (ach.key === 'provocator') return { current: stats.duelsSent || 0, target: 50 };
    if (ach.key === 'group_wins_25') return { current: stats.teamWins || 0, target: 25 };

    return null;
  };

  const AchievementCard = ({ ach }) => {
    const progress = getProgressInfo(ach);
    const progressPercent = progress ? Math.min((progress.current / progress.target) * 100, 100) : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border-2 transition-all ${
          ach.earned
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
            : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80'
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

            {progress && !ach.earned && (
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progres: {progress.current}/{progress.target}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

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
    );
  };

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
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">🏆 Realizările Tale</h2>
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
            {Object.entries(categories).map(([key, category]) => (
              category.achievements.length > 0 && (
                <div key={key} className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    {category.name}
                    <span className="text-sm font-normal text-gray-500">
                      ({category.achievements.filter(a => a.earned).length}/{category.achievements.length})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.achievements.map((ach) => (
                      <AchievementCard key={ach.key} ach={ach} />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementModal;