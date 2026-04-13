"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalStats, getClientNamespace } from "./ClientWrapper";
import { useLocaleConfig } from "./DictionaryProvider";

export default function LiveFeed() {
  const { pusherRef, isHydrated } = useGlobalStats();
  const { locale } = useLocaleConfig();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!isHydrated || !pusherRef?.current) return;
    const ns = getClientNamespace(locale);
    const channelName = `${ns}-global`;
    const channel = pusherRef.current.channel(channelName) || pusherRef.current.subscribe(channelName);

    const onBattle = (data) => {
      if (!data?.winner || !data?.loser) return;
      setEvents((prev) => [
        { id: `${data.t}-${data.winner}`, ...data },
        ...prev,
      ].slice(0, 5));
    };
    channel.bind("battle-feed", onBattle);
    return () => {
      try { channel.unbind("battle-feed", onBattle); } catch {}
    };
  }, [isHydrated, locale, pusherRef]);

  if (events.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 justify-center mb-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Activitate live</span>
      </div>
      <div className="space-y-1 max-h-32 overflow-hidden">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-edge rounded-xl text-xs"
            >
              <span className="text-amber-400">🏆</span>
              <span className="font-bold text-heading truncate">{e.winner}</span>
              <span className="text-muted text-[10px]">a câștigat contra</span>
              <span className="font-bold text-red-400 truncate">{e.loser}</span>
              {e.regiune && <span className="text-[9px] text-dim ml-auto">{e.regiune}</span>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
