import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DailyChallenges = ({ isOpen, onClose, userStats, onCompleteChallenge }) => {
  const [challenges, setChallenges] = useState([]);
  const [completedToday, setCompletedToday] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      generateDailyChallenges();
      loadCompletedChallenges();
    }
  }, [isOpen]);

  const generateDailyChallenges = () => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

    // Pseudo-random challenges based on date
    const challengeTypes = [
      {
        id: 'wins',
        title: 'Câștigă meciuri',
        description: 'Câștigă {count} meciuri astăzi',
        icon: '🏆',
        reward: 'Ou auriu',
        getTarget: (seed) => [3, 5, 7][seed % 3],
        checkProgress: (stats) => stats.wins || 0
      },
      {
        id: 'messages',
        title: 'Socializează',
        description: 'Trimite {count} mesaje în chat',
        icon: '💬',
        reward: 'Stea specială',
        getTarget: (seed) => [5, 10, 15][(seed + 1) % 3],
        checkProgress: (stats) => stats.messagesSent || 0
      },
      {
        id: 'streak',
        title: 'Serie câștigătoare',
        description: 'Obține o serie de {count} victorii consecutive',
        icon: '🔥',
        reward: 'Skin nou',
        getTarget: (seed) => [3, 5, 7][(seed + 2) % 3],
        checkProgress: (stats) => stats.currentStreak || 0
      },
      {
        id: 'duels',
        title: 'Provocator',
        description: 'Provoacă {count} jucători la duel',
        icon: '⚔️',
        reward: 'Puncte bonus',
        getTarget: (seed) => [2, 3, 5][seed % 3],
        checkProgress: (stats) => stats.duelsSent || 0
      }
    ];

    // Select 3 random challenges for today
    const selectedChallenges = [];
    const used = new Set();

    while (selectedChallenges.length < 3) {
      const index = (seed + selectedChallenges.length * 7) % challengeTypes.length;
      if (!used.has(index)) {
        used.add(index);
        const type = challengeTypes[index];
        selectedChallenges.push({
          ...type,
          target: type.getTarget(seed + selectedChallenges.length),
          progress: 0,
          completed: false
        });
      }
    }

    setChallenges(selectedChallenges);
  };

  const loadCompletedChallenges = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`daily_challenges_${today}`);
    if (stored) {
      setCompletedToday(new Set(JSON.parse(stored)));
    }
  };

  const saveCompletedChallenges = (completed) => {
    const today = new Date().toDateString();
    localStorage.setItem(`daily_challenges_${today}`, JSON.stringify([...completed]));
  };

  useEffect(() => {
    if (challenges.length > 0) {
      const updatedChallenges = challenges.map(challenge => {
        const progress = challenge.checkProgress(userStats);
        const wasCompleted = completedToday.has(challenge.id);
        const nowCompleted = progress >= challenge.target;

        if (nowCompleted && !wasCompleted) {
          // Mark as completed
          const newCompleted = new Set(completedToday);
          newCompleted.add(challenge.id);
          setCompletedToday(newCompleted);
          saveCompletedChallenges(newCompleted);

          // Trigger reward
          onCompleteChallenge && onCompleteChallenge(challenge);
        }

        return {
          ...challenge,
          progress: Math.min(progress, challenge.target),
          completed: nowCompleted
        };
      });

      setChallenges(updatedChallenges);
    }
  }, [userStats, challenges.length]);

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  if (!isOpen) return null;

  const completedCount = challenges.filter(c => c.completed).length;

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
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">📅 Provocări Zilnice</h2>
                <p className="text-blue-100">{completedCount}/3 completate • Reset în {getTimeUntilReset()}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    challenge.completed
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-3xl ${challenge.completed ? 'animate-bounce' : ''}`}>
                      {challenge.completed ? '✅' : challenge.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${challenge.completed ? 'text-green-800' : 'text-gray-800'}`}>
                        {challenge.title}
                      </h3>
                      <p className={`text-sm mb-3 ${challenge.completed ? 'text-green-600' : 'text-gray-600'}`}>
                        {challenge.description.replace('{count}', challenge.target)}
                      </p>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={challenge.completed ? 'text-green-700 font-medium' : 'text-gray-600'}>
                            Progres: {challenge.progress}/{challenge.target}
                          </span>
                          <span className="text-blue-600 font-medium">
                            Recompensă: {challenge.reward}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`h-full rounded-full ${
                              challenge.completed
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                : 'bg-gradient-to-r from-blue-400 to-purple-500'
                            }`}
                          />
                        </div>
                      </div>

                      {challenge.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          <span>🎉</span>
                          <span>Completat!</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <h4 className="font-bold text-yellow-800 mb-2">💡 Sfaturi pentru provocări:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Joacă meciuri pentru a câștiga victorii</li>
                <li>• Trimite mesaje în chat pentru provocarea socială</li>
                <li>• Menține serii de victorii consecutive</li>
                <li>• Provoacă prieteni la dueluri</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyChallenges;