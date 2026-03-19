"use client";

import { useState, useEffect } from "react";

// Paștele Ortodox 2026: 12 Aprilie
const EASTER_DATE = new Date("2026-04-12T00:00:00+03:00");

function getTimeLeft() {
  const now = new Date();
  const diff = EASTER_DATE - now;
  if (diff <= 0) return null;
  return {
    zile: Math.floor(diff / (1000 * 60 * 60 * 24)),
    ore: Math.floor((diff / (1000 * 60 * 60)) % 24),
    min: Math.floor((diff / (1000 * 60)) % 60),
    sec: Math.floor((diff / 1000) % 60),
  };
}

export default function EasterCountdown() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const units = [
    { val: time.zile, label: "Zile" },
    { val: time.ore, label: "Ore" },
    { val: time.min, label: "Min" },
    { val: time.sec, label: "Sec" },
  ];

  return (
    <div className="rounded-2xl border border-red-900/20 bg-white/[0.04] backdrop-blur-xl p-4 shadow-sm">
      <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-[0.3em] text-center mb-3">
        Până la Paștele Ortodox 2026
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map(u => (
          <div key={u.label} className="text-center">
            <div className="bg-red-900/20 border border-red-900/20 rounded-xl py-2 px-1">
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
                {String(u.val).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1 block">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
