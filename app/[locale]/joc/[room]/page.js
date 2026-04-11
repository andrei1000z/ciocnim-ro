"use client";


import React, { useEffect, useState, Suspense, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalStats } from "../../../components/ClientWrapper";
import { useT } from "../../../i18n/useT";
import { useLocaleConfig } from "../../../components/DictionaryProvider";
// Dynamic import — only loads canvas-confetti when needed (victory)
const fireConfetti = async (opts) => {
  const confetti = (await import("canvas-confetti")).default;
  confetti(opts);
};
import { motion, AnimatePresence } from "framer-motion";
import { safeCopy } from "../../../lib/utils";
import { playCrack, playVictory, playDefeat, isSoundEnabled, toggleSound } from "../../../lib/sounds";

// Quotes (CITATE_IERTARE / CITATE_SMERENIE) now loaded from dictionary via t('quotes.forgiveness') / t('quotes.humility')

// ==========================================================================================
// 1. ENGINE GRAFIC: OuTitan (Renderizare Liquid Glass)
// ==========================================================================================

const OuTitan = ({ skin, spart = false, hasStar = false, isGolden = false }) => {
  const t = useT();
  const skinId = isGolden ? 'golden' : (skin || 'red');

  const skins = useMemo(() => ({
    red: {
      label: t('eggSkins.red'),
      grad1: '#dc2626', grad2: '#7f1d1d',
      glow: 'rgba(220,38,38,0.5)',
      patternColor: 'rgba(255,255,255,0.18)',
      patternType: 'cross-stitch',
    },
    blue: {
      label: t('eggSkins.blue'),
      grad1: '#2563eb', grad2: '#1e3a8a',
      glow: 'rgba(37,99,235,0.5)',
      patternColor: 'rgba(255,255,255,0.25)',
      patternType: 'brau',
    },
    gold: {
      label: t('eggSkins.gold'),
      grad1: '#f59e0b', grad2: '#78350f',
      glow: 'rgba(245,158,11,0.5)',
      patternColor: 'rgba(255,255,255,0.3)',
      patternType: 'ie-gala',
    },
    green: {
      label: t('eggSkins.green'),
      grad1: '#166534', grad2: '#052e16',
      glow: 'rgba(22,101,52,0.5)',
      patternColor: 'rgba(255,255,255,0.2)',
      patternType: 'brad',
    },
    golden: {
      label: t('eggSkins.golden'),
      grad1: '#fbbf24', grad2: '#78350f',
      glow: 'rgba(251,191,36,0.6)',
      patternColor: 'rgba(255,255,255,0.25)',
      patternType: 'cross-stitch',
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [t]);

  const current = skins[skinId] || skins.red;
  const uid = React.useId().replace(/:/g, '');

  const renderPattern = () => {
    const c = current.patternColor;
    switch (current.patternType) {
      case 'cross-stitch':
        return (
          <pattern id={`pat-${uid}`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <line x1="2" y1="2" x2="6" y2="6" stroke={c} strokeWidth="1.2" />
            <line x1="6" y1="2" x2="2" y2="6" stroke={c} strokeWidth="1.2" />
            <line x1="10" y1="10" x2="14" y2="14" stroke={c} strokeWidth="1.2" />
            <line x1="14" y1="10" x2="10" y2="14" stroke={c} strokeWidth="1.2" />
            <rect x="3" y="10" width="2" height="2" fill={c} opacity="0.5" transform="rotate(45 4 11)" />
            <rect x="11" y="2" width="2" height="2" fill={c} opacity="0.5" transform="rotate(45 12 3)" />
          </pattern>
        );
      case 'brau':
        return (
          <pattern id={`pat-${uid}`} x="0" y="0" width="20" height="130" patternUnits="userSpaceOnUse">
            <rect x="0" y="55" width="20" height="20" fill={c} opacity="0.2" />
            <line x1="0" y1="57" x2="20" y2="57" stroke={c} strokeWidth="1.5" />
            <line x1="0" y1="73" x2="20" y2="73" stroke={c} strokeWidth="1.5" />
            <line x1="0" y1="59" x2="4" y2="65" stroke={c} strokeWidth="1" />
            <line x1="4" y1="65" x2="0" y2="71" stroke={c} strokeWidth="1" />
            <line x1="5" y1="59" x2="10" y2="65" stroke={c} strokeWidth="1" />
            <line x1="10" y1="65" x2="5" y2="71" stroke={c} strokeWidth="1" />
            <line x1="10" y1="59" x2="15" y2="65" stroke={c} strokeWidth="1" />
            <line x1="15" y1="65" x2="10" y2="71" stroke={c} strokeWidth="1" />
            <line x1="15" y1="59" x2="20" y2="65" stroke={c} strokeWidth="1" />
            <line x1="20" y1="65" x2="15" y2="71" stroke={c} strokeWidth="1" />
          </pattern>
        );
      case 'ie-gala':
        return (
          <pattern id={`pat-${uid}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth="0.8" />
            <circle cx="12" cy="12" r="1" fill={c} opacity="0.6" />
            <line x1="12" y1="0" x2="12" y2="9" stroke={c} strokeWidth="0.5" opacity="0.4" />
            <line x1="12" y1="15" x2="12" y2="24" stroke={c} strokeWidth="0.5" opacity="0.4" />
            <line x1="0" y1="12" x2="9" y2="12" stroke={c} strokeWidth="0.5" opacity="0.4" />
            <line x1="15" y1="12" x2="24" y2="12" stroke={c} strokeWidth="0.5" opacity="0.4" />
            <rect x="0" y="0" width="3" height="3" fill={c} opacity="0.15" />
            <rect x="21" y="0" width="3" height="3" fill={c} opacity="0.15" />
            <rect x="0" y="21" width="3" height="3" fill={c} opacity="0.15" />
            <rect x="21" y="21" width="3" height="3" fill={c} opacity="0.15" />
          </pattern>
        );
      case 'brad':
        return (
          <pattern id={`pat-${uid}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="10" y1="2" x2="4" y2="10" stroke={c} strokeWidth="1" />
            <line x1="10" y1="2" x2="16" y2="10" stroke={c} strokeWidth="1" />
            <line x1="10" y1="8" x2="2" y2="18" stroke={c} strokeWidth="1" />
            <line x1="10" y1="8" x2="18" y2="18" stroke={c} strokeWidth="1" />
            <line x1="10" y1="10" x2="10" y2="20" stroke={c} strokeWidth="0.8" opacity="0.5" />
          </pattern>
        );
      default: return null;
    }
  };

  const eggPath = "M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z";

  const crackPath1 = "M35 25 L42 40 L38 52 L50 65 L44 78 L52 90 L47 105 L55 118 L50 130";
  const crackPath2 = "M65 20 L58 38 L63 50 L55 62 L62 75 L57 88 L65 100 L60 115";

  return (
    <div className={`relative transition-all duration-700 flex-shrink-0 ${!spart ? 'animate-float-v9' : 'scale-[0.85] opacity-70 rotate-6'}`} style={{ width: 'clamp(90px, 25vw, 160px)', height: 'auto', aspectRatio: '1 / 1.35' }}>
      {!spart && (
        <div className="absolute inset-[-20%] rounded-full blur-[40px] md:blur-[50px] opacity-30 animate-pulse transition-all duration-1000 mix-blend-screen pointer-events-none" style={{ backgroundColor: current.glow }} />
      )}
      <svg viewBox="0 0 100 130" role="img" aria-label={`Ou ${current.label}${spart ? ' — spart' : ''}`} className="w-full h-full relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={current.grad1} />
            <stop offset="100%" stopColor={current.grad2} />
          </linearGradient>
          <radialGradient id={`hl-${uid}`} cx="38%" cy="28%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <clipPath id={`clip-${uid}`}><path d={eggPath} /></clipPath>
          {renderPattern()}
        </defs>
        <path d={eggPath} fill={`url(#grad-${uid})`} />
        <rect x="0" y="0" width="100" height="130" fill={`url(#pat-${uid})`} clipPath={`url(#clip-${uid})`} />
        <path d={eggPath} fill={`url(#hl-${uid})`} opacity="0.6" />
        {spart && (
          <g stroke="rgba(0,0,0,0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" className="crack-animate">
            <path d={crackPath1} className="crack-line-1" />
            <path d={crackPath2} className="crack-line-2" />
            <g stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
              <path d={crackPath1} className="crack-line-1" />
              <path d={crackPath2} className="crack-line-2" />
            </g>
          </g>
        )}
      </svg>
      {hasStar && <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 text-4xl md:text-6xl animate-star drop-shadow-[0_0_20px_rgba(234,179,8,1)] z-20 select-none">⭐</div>}
      {spart && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"><div className="spark-burst" /></div>}
      {spart && <div className="absolute inset-0 particle-burst pointer-events-none" />}
      {spart && <div className="absolute inset-0 shell-fragments pointer-events-none" />}
    </div>
  );
};

// ==========================================================================================
// 2. ARENA MASTER: Logica de Luptă
// ==========================================================================================

function ArenaMaster({ room }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nume, triggerVibrate, userStats, setUserStats, incrementGlobal, updateStats, totalGlobal, onlineCount, pusherRef, connectionState } = useGlobalStats();
  const t = useT();
  const { locale } = useLocaleConfig();

  const [me] = useState({ skin: userStats.skin || 'red', hasStar: userStats.wins >= 10 });
  const [opponent, setOpponent] = useState(null);

  const [isStriking, setIsStriking] = useState(false);

  const [rezultat, setRezultat] = useState(null);

  const [citatFinal, setCitatFinal] = useState("");
  const [impactFlash, setImpactFlash] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  const [collisionAnim, setCollisionAnim] = useState(false);

  const [atacantName, setAtacantName] = useState(null);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(() => !isSoundEnabled());
  const chatContainerRef = useRef(null);
  const [revansaRequests, setRevansaRequests] = useState({});
  const opponentRef = useRef(null);
  const matchmakingCancelledRef = useRef(false);
  const lastStrikeRef = useRef(0); // debounce: max 1 lovitură la 150ms
  const strikePendingRef = useRef(false);
  const resetForRevansaRef = useRef(null);
  // Dedupe pentru revansa-ok: păstrăm timestamp-ul ultimului reset ca să nu
  // triggerăm resetul de multiple ori pentru același eveniment (Pusher + polling).
  const lastRevansaAtRef = useRef(0);
  const teamIdPreluat = searchParams.get("teamId");
  const [isHost, setIsHost] = useState(false);
  const isPrivate = room.includes("privat-");
  const isProvocare = searchParams.get("provocare") === "true";
  const isHostRef = useRef(false);

  // Read host token from sessionStorage after hydration (SSR-safe)
  useEffect(() => {
    try {
      const token = sessionStorage.getItem('room-host-token');
      if (token === 'arena-host' || token === 'provocare-host') {
        setIsHost(true);
        isHostRef.current = true;
      }
    } catch {}
  }, []);

  // Preload sounds so they play instantly during battle
  useEffect(() => {
    const sounds = ['/spargere.mp3', '/victorie.mp3', '/esec.mp3'];
    sounds.forEach(src => {
      try { const a = new Audio(src); a.preload = 'auto'; a.load(); } catch {}
    });
  }, []);

  // Refs stabile — rezolvă stale closure-uri din Pusher handlers
  const regiuneRef = useRef(userStats.regiune);
  useEffect(() => { regiuneRef.current = userStats.regiune; }, [userStats.regiune]);
  const numeRef = useRef(nume);
  useEffect(() => { numeRef.current = nume; }, [nume]);

  // Refs pt guard-uri executeBattle — imperative, fără stale closures
  const rezultatRef = useRef(null);
  const isStrikingRef = useRef(false);
  const battleExecutedRef = useRef(false);
  const executeBattleRef = useRef(null);
  const incrementGlobalRef = useRef(incrementGlobal);
  useEffect(() => { incrementGlobalRef.current = incrementGlobal; }, [incrementGlobal]);
  // broadcastJoin ref — folosit ca să NU re-subscriem Pusher când broadcastJoin
  // se schimbă (ceea ce se întâmplă la fiecare nume update). Re-subscribing
  // crează gap unde Pusher events sunt pierdute → opponent apare cu delay.
  const broadcastJoinRef = useRef(null);

  const canStrike = !rezultat && !isStriking && opponent && !collisionAnim && atacantName === nume;

  const playArenaSound = (name) => {
    if (isMuted) return;
    try {
      const audio = new Audio(`/${name}.mp3`);
      audio.volume = 0.35 + Math.random() * 0.3;
      audio.playbackRate = 0.9 + Math.random() * 0.2;
      audio.play().catch(() => {});
    } catch {}
    if (name === "victorie") playVictory();
    else if (name === "esec") playDefeat();
  };

  const broadcastJoin = useCallback(async () => {
    const currentNume = numeRef.current;
    if (!currentNume) return;
    try {
      let hostToken = '';
      try { hostToken = sessionStorage.getItem('room-host-token') || ''; } catch {}
      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room, actiune: 'join', jucator: currentNume,
          skin: me.skin, hasStar: me.hasStar,
          hostToken, regiune: regiuneRef.current, locale
        })
      });
      const data = await res.json();
      if (!data.success && data.error === "Camera este ocupată!") {
        router.replace(locale === 'ro' ? '/?error=ocupata' : `/${locale}?error=ocupata`);
        return;
      }
      // Server determines host status
      if (data.isHost !== undefined) {
        isHostRef.current = data.isHost;
        setIsHost(data.isHost);
      }
    } catch {}
    if (me.hasStar) updateStats('star');
  }, [room, me, updateStats, router, locale]); // nume scos din deps — folosim numeRef
  // Update ref imediat
  useEffect(() => { broadcastJoinRef.current = broadcastJoin; }, [broadcastJoin]);

  // POLLING FALLBACK — discover opponents via Redis when WebSocket is unreliable
  // Slower interval when Pusher is connected (fallback only), faster when disconnected
  useEffect(() => {
    if (!nume || opponent || isBotMatch) return;
    const pollRoom = async () => {
      // Polling safety net — rulează ÎNTOTDEAUNA (nu skip-uim pe connected) ca să
      // prindem evenimentele Pusher pierdute din cauza race conditions la subscribe.
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actiune: 'get-room-players', roomId: room, locale })
        });
        const data = await res.json();
        if (data.success && data.players) {
          const otherPlayer = data.players.find(p => p !== nume.toUpperCase());
          if (otherPlayer && !opponentRef.current) {
            const sd = data.skinData?.[otherPlayer] || {};
            const defaultOppRegion = locale === 'bg' ? 'България' : locale === 'el' ? 'Ελλάδα' : locale === 'en' ? 'Global' : 'România';
            const oppData = { jucator: otherPlayer, skin: sd.skin || 'red', hasStar: sd.hasStar || false, regiune: sd.regiune || defaultOppRegion };
            setOpponent(oppData);
            opponentRef.current = oppData;
            setAtacantName(prev => {
              if (prev !== null && prev !== "") return prev;
              const n = numeRef.current;
              if (!n) return null;
              return [n.toUpperCase(), otherPlayer.toUpperCase()].sort()[0] === n.toUpperCase() ? n : otherPlayer;
            });
          }
        }
      } catch {}
    };
    // Pusher primary: 15s fallback când connected, 3s când disconnected.
    // Reduce server load la ~2x mai puțin pentru scalabilitate.
    const pollInterval = connectionState === 'connected' ? 15000 : 3000;
    const interval = setInterval(pollRoom, pollInterval);
    pollRoom(); // poll immediately
    return () => clearInterval(interval);
  }, [nume, opponent, isBotMatch, room, isPrivate, isProvocare, connectionState, pusherRef]);

  // LOVITURA POLLING — defender discovers battle result when Pusher is unreliable
  useEffect(() => {
    if (!opponent || rezultat || isBotMatch || !atacantName) return;
    if (atacantName === nume) return; // attacker gets result from API response
    const poll = async () => {
      // Polling safety net — rulează ÎNTOTDEAUNA, nu skip pe connected.
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actiune: 'get-room-lovitura', roomId: room, locale })
        });
        const data = await res.json();
        if (data.success && data.lovitura) {
          executeBattleRef.current?.(data.lovitura);
        }
      } catch {}
    };
    const pollInterval = connectionState === 'connected' ? 10000 : 2000;
    const interval = setInterval(poll, pollInterval);
    return () => clearInterval(interval);
  }, [opponent, rezultat, isBotMatch, atacantName, nume, room, connectionState, pusherRef]);

  // REVANSA POLLING — discover opponent's revansa request when Pusher fails
  useEffect(() => {
    if (!rezultat || isBotMatch || !opponent) return;
    const poll = async () => {
      // Polling safety net — rulează ÎNTOTDEAUNA. Captură revansa-ok dacă Pusher o ratează.
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actiune: 'get-room-revansa', roomId: room, locale })
        });
        const data = await res.json();
        if (data.success) {
          // Timestamp dedupe: resetăm DOAR dacă flag-ul e mai nou decât ultimul
          // reset știut de clientul ăsta. Previne double-reset și flag-uri vechi
          // care persistă după reset (TTL 120s).
          if (data.revansaOk && data.revansaOkAt && data.revansaOkAt > lastRevansaAtRef.current) {
            lastRevansaAtRef.current = data.revansaOkAt;
            resetForRevansaRef.current?.();
          } else if (data.players && data.players.length > 0) {
            setRevansaRequests(prev => {
              const next = { ...prev };
              data.players.forEach(p => { next[p] = true; });
              return next;
            });
          }
        }
      } catch {}
    };
    poll(); // poll immediately for instant sync
    const pollInterval = connectionState === 'connected' ? 8000 : 1500;
    const interval = setInterval(poll, pollInterval);
    return () => clearInterval(interval);
  }, [rezultat, isBotMatch, opponent, room, connectionState, pusherRef]);

  // LOGICĂ BOT — fallback to bot if no opponent found after timeout
  useEffect(() => {
    if (opponent || rezultat || isStriking || isBotMatch) return;
    if (isPrivate && !isProvocare) return;

    const isArenaRoom = room.startsWith('arena-');
    const waitTime = isArenaRoom ? 10000 : (isProvocare ? 15000 : 8000);

    const botTimeout = setTimeout(() => {
      if (isArenaRoom) {
        fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'arena-cancel-matchmaking', roomId: room, locale }) });
      }
      setIsBotMatch(true);
      const botName = "🤖 BOT";
      const culoriDisponibile = ['red', 'blue', 'gold', 'green'];
      const randomSkin = culoriDisponibile[Math.floor(Math.random() * culoriDisponibile.length)];
      const botRegion = locale === 'bg' ? 'България' : locale === 'el' ? 'Ελλάδα' : locale === 'en' ? 'Global' : 'România';
      setOpponent({ jucator: botName, skin: randomSkin, isGolden: false, hasStar: false, regiune: botRegion });
      const botLoveseste = Math.random() > 0.5;
      setAtacantName(botLoveseste ? botName : nume);
    }, waitTime);

    return () => clearTimeout(botTimeout);
  }, [opponent, rezultat, isStriking, isBotMatch, isPrivate, isProvocare, nume, room]);

  // Dacă botul e atacantul, dă el
  useEffect(() => {
      if (isBotMatch && atacantName === "🤖 BOT" && !rezultat && !isStriking) {
          const timeout = setTimeout(() => {
              const castigaCelCareDaRandom = Math.random() < 0.5;
              // executeBattle handles incrementGlobal internally
              executeBattleRef.current({ castigaCelCareDa: castigaCelCareDaRandom, atacant: "🤖 BOT" });
          }, 1500 + Math.random() * 1500);
          return () => clearTimeout(timeout);
      }
  }, [isBotMatch, atacantName, rezultat, isStriking]);

  // PUSHER SYNC — subscribe ASAP. Pusher client queuing handles pre-connected state.
  // NU așteptăm connectionState='connected' — Pusher gestionează subscribing când
  // connection-ul devine ready. Așteptarea introduce race condition unde celălalt
  // jucător broadcastJoin BEFORE noi subscribem, evenimentul se pierde.
  useEffect(() => {
    if (isBotMatch || !pusherRef?.current) return;
    const pusher = pusherRef.current;
    const ns = locale; // per-locale Redis/Pusher namespace (ro/bg/el/en)
    const arenaChannelName = `${ns}-arena-v22-${room}`;
    const arenaChannel = pusher.subscribe(arenaChannelName);

    arenaChannel.bind("pusher:subscription_succeeded", async () => {
      // Trimitem join imediat dacă avem deja nume (hidratat)
      if (numeRef.current) broadcastJoinRef.current?.();
      // Catch-up: dacă oponentul a intrat deja înainte ca noi să fim subscribe
      // (race: Pusher subscribe după ce celălalt a dat broadcastJoin), îl găsim
      // prin get-room-players care citește direct din Redis.
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actiune: 'get-room-players', roomId: room, locale })
        });
        const data = await res.json();
        if (data.success && data.players && !opponentRef.current) {
          const currentNume = numeRef.current?.toUpperCase();
          const otherPlayer = data.players.find(p => p !== currentNume);
          if (otherPlayer) {
            const sd = data.skinData?.[otherPlayer] || {};
            const defaultOppRegion = locale === 'bg' ? 'България' : locale === 'el' ? 'Ελλάδα' : locale === 'en' ? 'Global' : 'România';
            const oppData = { jucator: otherPlayer, skin: sd.skin || 'red', hasStar: sd.hasStar || false, regiune: sd.regiune || defaultOppRegion };
            setOpponent(oppData);
            opponentRef.current = oppData;
            setAtacantName(prev => {
              if (prev !== null && prev !== "") return prev;
              const n = numeRef.current;
              if (!n) return null;
              // Deterministic: sortare alfabetică. Ambii clienți calculează același atacant.
              return [n.toUpperCase(), otherPlayer.toUpperCase()].sort()[0] === n.toUpperCase() ? n : otherPlayer;
            });
          }
        }
      } catch {}
    });

    arenaChannel.bind("join", (data) => {
      const currentNume = numeRef.current;
      // Guard: ignoră dacă numele nu e încă setat SAU dacă evenimentul e al nostru
      if (!currentNume || data.jucator === currentNume) return;
      {
        const hadOpponent = !!opponentRef.current;
        setOpponent(data);
        opponentRef.current = data;

        // Scoate camera din coada de matchmaking (o singură dată, doar host-ul)
        if (isHostRef.current && room.startsWith('arena-') && !matchmakingCancelledRef.current) {
          matchmakingCancelledRef.current = true;
          fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'arena-cancel-matchmaking', roomId: room, locale }) });
        }

        // Set attacker only ONCE — deterministic via sortare alfabetică (ambii clienți = același atacant)
        setAtacantName(prev => {
          if (prev !== null && prev !== "") return prev;
          const n = numeRef.current;
          if (!n) return null;
          return [n.toUpperCase(), data.jucator.toUpperCase()].sort()[0] === n.toUpperCase() ? n : data.jucator;
        });

        // Răspundem cu join-ul nostru DOAR prima dată — previne loop infinit
        if (!hadOpponent) broadcastJoinRef.current?.();
      }
    });

    arenaChannel.bind("arena-chat", (data) => {
      setMessages(prev => [{ autor: data.jucator, text: data.text }, ...prev].slice(0, 20));
    });

    arenaChannel.bind("revansa", (data) => {
      setRevansaRequests(prev => ({ ...prev, [data.jucator]: true }));
    });

    arenaChannel.bind("revansa-ok", (data) => {
      const ts = data?.t || Date.now();
      if (ts > lastRevansaAtRef.current) {
        lastRevansaAtRef.current = ts;
        resetForRevansaRef.current?.();
      }
    });

    arenaChannel.bind("lovitura", (data) => {
       // executeBattle handles incrementGlobal internally (guarded, runs once)
       executeBattleRef.current(data);
    });

    return () => {
      try { arenaChannel.unbind_all(); } catch {}
      pusher.unsubscribe(arenaChannelName);
    };
  // incrementGlobal + setUserStats scoase din deps — folosim refs, previne reconectări Pusher
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Subscription STABLE — nu re-subscriem la fiecare schimbare de nume/broadcastJoin.
  // Folosim broadcastJoinRef + numeRef pentru a evita gap-urile în care events se pierd.
  }, [room, isBotMatch, isPrivate, isProvocare, teamIdPreluat, pusherRef, locale]);

  // Warn before leaving during active game — stable handler via ref to avoid
  // leaks when deps change (B3). The ref tracks whether the game is active,
  // and the listener is attached/removed exactly once.
  const beforeUnloadActiveRef = useRef(false);
  const beforeUnloadMsgRef = useRef('');
  useEffect(() => {
    beforeUnloadActiveRef.current = !!opponent && !rezultat;
  }, [opponent, rezultat]);
  useEffect(() => {
    beforeUnloadMsgRef.current = t('game.confirmLeave');
  }, [t]);
  useEffect(() => {
    const handler = (e) => {
      if (!beforeUnloadActiveRef.current) return;
      e.preventDefault();
      e.returnValue = beforeUnloadMsgRef.current;
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, [messages]);


  // Retry join — safety net pentru rețele flaky. Pusher handle most cases via
  // subscription_succeeded. Retry la 15s (era 3s) pentru a reduce server load
  // ×5 în scenariul de 1000+ useri simultani în camere awaiting opponent.
  useEffect(() => {
    if (opponent || rezultat || isStriking || isBotMatch || !nume) return;
    const callJoin = () => broadcastJoinRef.current?.();
    callJoin();
    const interval = setInterval(callJoin, 15000);
    return () => clearInterval(interval);
  }, [opponent, rezultat, isStriking, isBotMatch, nume]);

  // Auto-return to home after 45s of inactivity post-result
  useEffect(() => {
    if (!rezultat) return;
    const timeout = setTimeout(() => {
      router.replace(locale === 'ro' ? '/' : `/${locale}`);
    }, 45000);
    return () => clearTimeout(timeout);
  }, [rezultat, router, locale]);

  const executeBattle = (data) => {
    // Guard cu refs — funcționează chiar și în stale closures din Pusher
    if (battleExecutedRef.current) return;
    battleExecutedRef.current = true;

    if (rezultatRef.current || isStrikingRef.current) {
      battleExecutedRef.current = false;
      return;
    }
    rezultatRef.current = 'pending';
    isStrikingRef.current = true;
    setIsStriking(true);

    let amCastigat = false;
    const myName = numeRef.current;
    const celCareALovit = data.atacant || myName;

    amCastigat = celCareALovit === myName ? data.castigaCelCareDa : !data.castigaCelCareDa;

    // INCREMENT GLOBAL — called once here, guarded by rezultatRef (prevents double-call)
    incrementGlobalRef.current(amCastigat, (isProvocare && teamIdPreluat) ? teamIdPreluat : null, room);

    const quotes = amCastigat ? t('quotes.humility') : t('quotes.forgiveness');
    const citatAles = Array.isArray(quotes) ? quotes[Math.floor(Math.random() * quotes.length)] : quotes;
    setCitatFinal(citatAles);

    // Faza 1: ouăle se mișcă unul spre celălalt (450ms)
    setCollisionAnim(true);

    // Pre-load sunetul de ciocnit ca să fie instant
    let crackAudio;
    try { crackAudio = new Audio('/spargere.mp3'); crackAudio.volume = 0.5 + Math.random() * 0.2; crackAudio.load(); } catch {}

    setTimeout(() => {
      // Faza 2: EXACT la impact — sunet + shake + vibrație
      setImpactFlash(true);
      try { crackAudio?.play().catch(() => {}); } catch {}
      if (!isMuted) playCrack();
      triggerVibrate(amCastigat ? [100, 50, 100] : [800]);

      setTimeout(() => {
        setCollisionAnim(false);
        setImpactFlash(false);
        rezultatRef.current = { win: amCastigat };
        setRezultat({ win: amCastigat });
        playArenaSound(amCastigat ? 'victorie' : 'esec');
        if (amCastigat) fireConfetti({ particleCount: 200, spread: 90, origin: { y: 0.55 }, colors: ['#dc2626', '#fbbf24', '#f97316', '#ef4444'] });
      }, 500);
    }, 450);
  };

  // B4: assign in useEffect instead of component body so Pusher handlers
  // (which read via .current) always get the latest executeBattle without
  // racing against renders.
  useEffect(() => {
    executeBattleRef.current = executeBattle;
  }, [executeBattle]);

  const resetForRevansa = () => {
    if (!rezultatRef.current) return; // already reset
    rezultatRef.current = null;
    isStrikingRef.current = false;
    battleExecutedRef.current = false;
    strikePendingRef.current = false;
    setRezultat(null);
    setIsStriking(false);
    setCollisionAnim(false);
    setRevansaRequests({});
    const currentNume = numeRef.current;
    if (isPrivate || isBotMatch) {
      setAtacantName(prev => {
        if (!prev || !opponentRef.current) return prev;
        return prev === currentNume ? opponentRef.current.jucator : currentNume;
      });
    }
    // Clear stale Redis keys so lovitura/revansa-ok can't re-trigger next round
    fetch('/api/ciocnire', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room, actiune: 'clear-round', locale })
    }).catch(() => {});
  };
  resetForRevansaRef.current = resetForRevansa;

  const handleStrike = useCallback(async () => {
    if (!canStrike || strikePendingRef.current) return;
    if (rezultatRef.current || isStrikingRef.current) return;
    const now = Date.now();
    if (now - lastStrikeRef.current < 150) return;
    lastStrikeRef.current = now;
    strikePendingRef.current = true;
    try {
      if (isBotMatch) {
        const castigaCelCareDaRandom = Math.random() < 0.5;
        executeBattleRef.current({ castigaCelCareDa: castigaCelCareDaRandom, atacant: nume });
      } else {
        // Await server result — API is fast (fire-and-forget Pusher, just Redis + random)
        try {
          const res = await fetch('/api/ciocnire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: room, actiune: 'lovitura', jucator: nume, atacant: nume, locale })
          });
          const data = await res.json();
          if (data.success && data.castigaCelCareDa !== undefined) {
            executeBattleRef.current({ castigaCelCareDa: data.castigaCelCareDa, atacant: nume });
          }
        } catch {
          // Fallback: local random if server unreachable
          executeBattleRef.current({ castigaCelCareDa: Math.random() < 0.5, atacant: nume });
        }
      }
    } finally {
      // B5: always clear pending flag, regardless of sync/async path or thrown errors
      strikePendingRef.current = false;
    }
  }, [canStrike, isBotMatch, nume, room, locale]);

  useEffect(() => {
    if (!canStrike) return;
    const handleMotion = (e) => {
      const acc = e.acceleration;
      if (!acc) return;
      if (Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0) > 20) {
        window.removeEventListener("devicemotion", handleMotion);
        handleStrike();
      }
    };
    // iOS 13+ requires explicit permission for DeviceMotionEvent
    const startListening = () => {
      window.addEventListener("devicemotion", handleMotion);
    };
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(state => { if (state === 'granted') startListening(); }).catch(() => {});
    } else {
      startListening();
    }
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [canStrike, handleStrike]);

  const BOT_CHAT_REPLIES = t('botChat');

  const handleChat = () => {
    const msg = chatInput.trim().slice(0, 200);
    if (!msg) return;
    if (isBotMatch) {
      setMessages(prev => [{ autor: nume, text: msg }, ...prev].slice(0, 20));
      setChatInput("");
      // Bot replies after a short delay
      setTimeout(() => {
        const reply = BOT_CHAT_REPLIES[Math.floor(Math.random() * BOT_CHAT_REPLIES.length)];
        setMessages(prev => [{ autor: "🤖 BOT", text: reply }, ...prev].slice(0, 20));
      }, 800 + Math.random() * 1200);
    } else {
      fetch('/api/ciocnire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room, actiune: 'arena-chat', jucator: nume, text: msg, locale })
      });
      setChatInput("");
      updateStats('message');
    }
  };

  const handleRevansa = () => {
    if (isBotMatch) { window.location.reload(); return; }
    if (revansaRequests[nume]) return;
    setRevansaRequests(prev => ({ ...prev, [nume]: true }));
    // Server stores request in Redis + auto-detects when both players want revansa
    fetch('/api/ciocnire', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room, actiune: 'revansa', jucator: nume, locale })
    }).then(r => r.json()).then(data => {
      if (data.revansaOk) {
        if (data.revansaOkAt && data.revansaOkAt > lastRevansaAtRef.current) {
          lastRevansaAtRef.current = data.revansaOkAt;
        }
        resetForRevansaRef.current?.();
      }
    }).catch(() => {});
  };

  const copyRoomCode = () => {
    safeCopy(room.replace('privat-', ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareRoom = () => {
    const url = `${window.location.origin}/${locale}/joc/${room}`;
    const text = t('game.shareInvite');
    if (navigator.share) {
      navigator.share({ title: t('game.shareTitle'), text, url }).then(() => {}).catch(() => {
        // Fallback if share was dismissed
        safeCopy(`${text} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      safeCopy(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const url = `${window.location.origin}/${locale}/joc/${room}`;
    const text = `${t('game.shareInvite')} ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      {/* Wrapper principal: Modificat pentru anti-suprapunere. Folosim flex-col cu overflow safe */}
      <div className={`w-full max-w-4xl flex flex-col items-center justify-start md:justify-center flex-1 py-4 md:py-6 px-4 md:px-0 transition-all z-10 ${impactFlash ? 'animate-impact scale-[1.02] blur-[1px]' : ''}`}>

        {/* Buton Cod Cameră + Share */}
        {isPrivate && !teamIdPreluat && (
          <div className="flex items-center gap-2 z-20 flex-shrink-0 mt-2 mb-4 md:mt-4 md:mb-8">
            <button onClick={copyRoomCode} className="group relative bg-elevated backdrop-blur-xl px-5 py-3 md:px-8 md:py-4 rounded-full border border-red-900/30 shadow-lg shadow-black/30 hover:bg-elevated-hover hover:border-red-700/50 transition-all active:scale-95">
              <div className="flex items-center gap-2 md:gap-3 relative z-10">
                <span className="text-xs md:text-xs font-black uppercase tracking-[0.3em] text-red-500/60 group-hover:text-accent-red transition-colors hidden sm:inline">{t('game.roomCode')}</span>
                <span className="text-red-500 font-black text-xl md:text-2xl tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">{room.replace('privat-', '')}</span>
                <span className="bg-red-900/30 p-1.5 md:p-2 rounded-xl text-xs md:text-xs ml-1 md:ml-2 group-hover:bg-red-900/40 transition-all border border-red-900/30">{copied ? '✅' : '📋'}</span>
              </div>
              {copied && <span className="absolute -bottom-5 md:-bottom-6 left-1/2 -translate-x-1/2 text-xs md:text-xs font-black text-accent-green tracking-widest">{t('game.copied')}</span>}
            </button>
            <button onClick={shareRoom} className="bg-red-700 hover:bg-red-600 text-white p-3 md:p-4 rounded-full border border-red-800 shadow-lg shadow-black/30 transition-all active:scale-95" title={t('game.shareRoom')} aria-label={t('game.shareRoom')}>
              <span className="text-base md:text-lg">📲</span>
            </button>
            <button onClick={shareWhatsApp} className="bg-green-700 hover:bg-green-600 text-white p-3 md:p-4 rounded-full border border-green-800 shadow-lg shadow-black/30 transition-all active:scale-95" title="WhatsApp" aria-label="WhatsApp">
              <span className="text-base md:text-lg">💬</span>
            </button>
          </div>
        )}

        {/* LIVE Indicator + Connection Status + Mute */}
        <div className="flex flex-col items-center gap-1 mb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectionState === 'connected' ? 'bg-green-500' : connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${connectionState === 'connected' ? 'bg-green-500' : connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
            </span>
            <span className={`text-xs md:text-xs font-black uppercase tracking-[0.2em] ${connectionState === 'connected' ? 'text-accent-green' : connectionState === 'connecting' ? 'text-yellow-400' : 'text-accent-red'}`}>
              {connectionState === 'connected' ? t('game.live') : connectionState === 'connecting' ? t('game.connecting') : t('game.disconnected')}
            </span>
            <span className="text-xs md:text-xs font-black text-heading tabular-nums">{onlineCount || 1}</span>
            <span className="text-xs md:text-xs font-semibold text-faint">{onlineCount === 1 ? t('game.person') : t('game.persons')} {t('game.online')}</span>
            <button onClick={() => { const next = toggleSound(); setIsMuted(!next); }} className="ml-1 text-sm opacity-60 hover:opacity-100 transition-opacity" aria-label={isMuted ? "Unmute" : "Mute"}>{isMuted ? '🔇' : '🔊'}</button>
          </div>
          <span className="text-xs md:text-xs font-bold text-muted tabular-nums">{totalGlobal.toLocaleString(locale === 'bg' ? 'bg-BG' : 'ro-RO')} {t('game.totalCracks')}</span>
        </div>

        {/* TURN INDICATOR — clar pentru toți */}
        {opponent && !rezultat && !collisionAnim && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-3 px-5 py-2.5 rounded-2xl font-black text-center text-base flex-shrink-0 ${
              canStrike
                ? 'bg-green-900/30 border border-green-700/30 text-green-400 animate-pulse'
                : 'bg-amber-900/20 border border-amber-700/20 text-amber-400'
            }`}
          >
            {canStrike ? t('game.yourTurn') : t('game.waitOpponent')}
          </motion.div>
        )}

        {/* Zona de Duel */}
        <div className="flex justify-center items-center w-full gap-2 sm:gap-6 md:gap-16 mb-6 relative z-10 flex-shrink-0">

          {/* Jucător 1 (TU) */}
          <motion.div
            className="flex flex-col items-center gap-4 w-1/3 max-w-[160px]"
            animate={collisionAnim ? { x: 52, scale: 1.1 } : { x: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.55, 0, 1, 0.45] }}
          >
            <OuTitan skin={me.skin} spart={rezultat && !rezultat.win} hasStar={me.hasStar} isGolden={me.isGolden} />
            <div className="bg-elevated backdrop-blur-md p-3 md:p-4 rounded-2xl text-center border border-red-900/30 border-l-2 border-l-green-500/60 relative w-full shadow-lg shadow-black/30 overflow-hidden">
              <span suppressHydrationWarning className="text-xs md:text-xs font-black uppercase tracking-widest text-red-500/60 block mb-1 truncate relative z-10">{userStats.regiune || t('game.regionUnknown')}</span>
              <span suppressHydrationWarning className="text-sm md:text-xl font-black text-heading italic relative z-10 truncate block">{nume}</span>
            </div>
          </motion.div>

          {/* VS / Impact */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-10 md:w-16">
            <AnimatePresence mode="wait">
              {impactFlash ? (
                <motion.div
                  key="impact"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1.6, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.6, duration: 0.4 }}
                  className="text-4xl md:text-6xl select-none drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] z-20"
                >
                  💥
                </motion.div>
              ) : (
                <motion.div
                  key="vs"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-2xl md:text-5xl font-black text-red-600/30 italic"
                >
                  VS
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Jucător 2 (OPONENT) */}
          <motion.div
            className="flex flex-col items-center gap-4 w-1/3 max-w-[160px] text-center"
            animate={collisionAnim ? { x: -52, scale: 1.1 } : { x: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.55, 0, 1, 0.45] }}
          >
            {opponent ? (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 w-full">
                <OuTitan skin={opponent.skin} spart={rezultat && rezultat.win} hasStar={opponent.hasStar} isGolden={opponent.isGolden} />
                <div className="bg-elevated backdrop-blur-md p-3 md:p-4 rounded-2xl border border-red-900/30 border-r-2 border-r-red-600/60 relative w-full shadow-lg shadow-black/30 overflow-hidden">
                  <span className="text-xs md:text-xs font-black uppercase tracking-widest text-red-500/60 block mb-1 truncate relative z-10">{opponent.regiune || t('game.regionUnknown')}</span>
                  <span className="text-sm md:text-xl font-black text-heading italic relative z-10 truncate block">{opponent.jucator}</span>
                </div>
              </motion.div>
            ) : (
              <div className="w-full aspect-[1/1.35] bg-card rounded-[2rem] border border-dashed border-red-900/30 flex flex-col items-center justify-center text-center px-3 backdrop-blur-sm relative overflow-hidden gap-2">
                <span className="text-3xl animate-bounce">🥚</span>
                <span className="text-xs font-bold text-red-400/60">
                  {isPrivate ? t('game.sendCode') : t('game.searching')}
                </span>
                <span className="text-xs font-medium text-muted">{t('game.fewSeconds')}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* BUTON LUPTĂ */}
        <div className="w-full max-w-sm z-30 relative mb-4 flex-shrink-0">
          {opponent && !rezultat && !collisionAnim && (
            <motion.button
              onClick={canStrike ? handleStrike : undefined}
              whileTap={canStrike ? { scale: 0.94 } : {}}
              animate={canStrike ? { scale: [1, 1.03, 1] } : {}}
              transition={{ repeat: Infinity, repeatDelay: 0.4, duration: 1.6, ease: "easeInOut" }}
              className={`w-full py-6 md:py-7 rounded-[2rem] transition-all shadow-lg overflow-hidden relative ${
                canStrike
                  ? 'bg-red-700 text-white shadow-[0_20px_40px_rgba(220,38,38,0.3)] border border-red-500/40 hover:bg-red-600 cursor-pointer pointer-events-auto'
                  : 'bg-card text-faint border border-red-900/20 backdrop-blur-md cursor-not-allowed pointer-events-none'
              }`}
            >
              <span className="relative z-10 text-center flex flex-col items-center justify-center gap-1">
                <span className="font-black uppercase tracking-[0.3em] text-base md:text-lg">
                  {canStrike ? t('game.strike') : t('game.defend')}
                </span>
                {canStrike && (
                  <span className="text-xs opacity-70 normal-case tracking-widest font-bold text-red-200 block">
                    {t('game.tapOrShake')}
                  </span>
                )}
              </span>
            </motion.button>
          )}
          {opponent && !rezultat && collisionAnim && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-5 md:py-6 rounded-[2rem] bg-card text-muted border border-red-900/20 backdrop-blur-md text-center flex items-center justify-center shadow-lg"
            >
              <span className="font-black uppercase tracking-[0.3em] text-sm md:text-base animate-pulse">{t('game.cracking')}</span>
            </motion.div>
          )}
        </div>

        {/* CHAT REDESIGN: Z-index separat suprem (70) pentru a fi mereu accesibil */}
        <div className="w-full max-w-sm bg-card border border-red-900/20 p-4 md:p-6 rounded-[2rem] shadow-lg shadow-black/30 relative overflow-hidden z-[70] flex-shrink-0 pointer-events-auto backdrop-blur-sm">

          <div className="h-28 md:h-36 overflow-y-auto flex flex-col-reverse gap-2 mb-3 custom-scrollbar pr-2 relative z-10" ref={chatContainerRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.autor === nume ? 'items-end' : 'items-start'}`}>
                <span className="text-xs md:text-xs font-black uppercase tracking-[0.3em] text-amber-500/50 px-2 mb-1">{m.autor}</span>
                <div className={`px-3 py-2 md:px-4 md:py-2.5 rounded-2xl text-xs md:text-sm font-bold border ${m.autor === nume ? 'bg-red-700 text-white rounded-tr-sm border-red-600/30' : 'bg-elevated text-dim rounded-tl-sm border-edge'}`}>
                   {m.text}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
                <div className="text-center w-full h-full flex flex-col justify-center items-center opacity-40 mt-2 pointer-events-none">
                    <span className="text-xl md:text-2xl mb-1 filter sepia-[0.3]">💬</span>
                    <span className="text-xs md:text-xs font-black uppercase tracking-[0.3em] text-amber-500/70">{t('game.chatEmpty')}</span>
                </div>
            )}
          </div>

          <div className="flex gap-2 bg-card p-1.5 rounded-full border border-red-900/20 focus-within:border-red-700/40 focus-within:bg-elevated transition-all relative z-10">
            <label className="sr-only" htmlFor="chat-input">{t('game.chatPlaceholder')}</label>
            <input
               id="chat-input"
               value={chatInput}
               onChange={e => setChatInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleChat()}
               placeholder={t('game.chatPlaceholder')}
               maxLength={200}
               className="flex-1 bg-transparent pl-4 text-sm md:text-xs font-black outline-none text-heading tracking-widest placeholder:text-amber-500/30"
            />
            <button onClick={handleChat} className="bg-red-900/30 w-12 h-12 md:w-10 md:h-10 rounded-full hover:bg-red-700 transition-colors border border-red-900/30 text-sm md:text-xs active:scale-95 flex items-center justify-center cursor-pointer" aria-label={t('game.sendMessage')}>🕊️</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {rezultat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 text-center backdrop-blur-2xl"
            style={{ background: rezultat.win ? 'radial-gradient(ellipse at center, rgba(0,40,10,0.97) 0%, rgba(0,0,0,0.98) 100%)' : 'radial-gradient(ellipse at center, rgba(40,0,0,0.97) 0%, rgba(0,0,0,0.98) 100%)' }}
          >
            {/* Glow fundal */}
            <div className={`absolute inset-0 pointer-events-none ${rezultat.win ? 'bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,197,94,0.12),transparent_60%)]' : 'bg-[radial-gradient(ellipse_at_50%_30%,rgba(220,38,38,0.15),transparent_60%)]'}`} />

            <motion.div
              initial={{ scale: 0.7, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
              className={`max-w-sm w-full bg-surface rounded-[2.5rem] border shadow-[0_60px_120px_rgba(0,0,0,0.95)] relative overflow-hidden pointer-events-auto ${rezultat.win ? 'border-green-700/30' : 'border-red-800/30'}`}
            >

              {/* Header colorat */}
              <div className={`relative px-6 pt-8 pb-6 ${rezultat.win ? 'bg-gradient-to-b from-green-900/30 to-transparent' : 'bg-gradient-to-b from-red-900/30 to-transparent'}`}>
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.15 }}
                  className="text-6xl md:text-8xl mb-3 select-none"
                >
                  {rezultat.win ? '👑' : '🥚'}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <p className={`text-xs font-black uppercase tracking-[0.4em] mb-1 ${rezultat.win ? 'text-green-400/70' : 'text-red-400/70'}`}>
                    {rezultat.win ? t('result.greetingWin') : t('result.greetingLose')}
                  </p>
                  <h2 className={`text-3xl md:text-4xl font-black italic tracking-tight ${rezultat.win ? 'text-accent-green' : 'text-accent-red'}`}>
                    {rezultat.win ? t('result.victory') : t('result.defeat')}
                  </h2>
                  {/* Scor */}
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="text-xs font-black text-green-500/70 uppercase tracking-widest">{userStats.wins || 0} {t('result.winsCount')}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs font-black text-red-400/70 uppercase tracking-widest">{userStats.losses || 0} {t('result.lossesCount')}</span>
                  </div>
                </motion.div>
              </div>

              {/* Citat */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mx-5 mb-5 bg-card border border-edge rounded-2xl p-4 relative"
              >
                <span className="absolute top-1 left-3 text-3xl text-amber-500/10 font-serif leading-none">&ldquo;</span>
                <p className="text-xs md:text-sm font-medium text-amber-400/70 italic leading-relaxed px-2 mt-1">
                  {citatFinal}
                </p>
              </motion.div>

              {/* Butoane */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="flex flex-col gap-2.5 px-5 pb-6"
              >
                {/* Share Result Button */}
                <button
                  onClick={async () => {
                    const siteName = t('seo.siteName');
                    const text = rezultat.win
                      ? t('result.shareWinText', { site: siteName, wins: userStats.wins || 0 })
                      : t('result.shareLoseText', { site: siteName });
                    const url = `https://${siteName.toLowerCase()}`;
                    // Try to generate and share an image card
                    try {
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      canvas.width = 1080; canvas.height = 1080;
                      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                      if (rezultat.win) {
                        grad.addColorStop(0, '#002810'); grad.addColorStop(1, '#0c0a0a');
                      } else {
                        grad.addColorStop(0, '#280808'); grad.addColorStop(1, '#0c0a0a');
                      }
                      ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
                      ctx.strokeStyle = rezultat.win ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)';
                      ctx.lineWidth = 3; ctx.strokeRect(40, 40, 1000, 1000);
                      ctx.font = '120px serif'; ctx.textAlign = 'center';
                      ctx.fillText(rezultat.win ? '👑' : '🥚', 540, 300);
                      const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                      ctx.fillStyle = rezultat.win ? '#22c55e' : '#ef4444';
                      ctx.font = `bold 72px ${fontFamily}`;
                      ctx.fillText(rezultat.win ? t('result.victory').toUpperCase() : t('result.defeat'), 540, 450);
                      ctx.fillStyle = '#e5e5e5'; ctx.font = `36px ${fontFamily}`;
                      ctx.fillText(nume || t('game.player'), 540, 550);
                      ctx.fillStyle = '#9ca3af'; ctx.font = `28px ${fontFamily}`;
                      ctx.fillText(`${userStats.wins || 0} ${t('result.winsCount')}`, 540, 620);
                      ctx.fillStyle = 'rgba(220,38,38,0.6)'; ctx.font = `bold 32px ${fontFamily}`;
                      ctx.fillText(t('seo.siteName').toLowerCase(), 540, 950);
                      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
                      if (blob && navigator.share && navigator.canShare) {
                        const file = new File([blob], 'rezultat-ciocnim.png', { type: 'image/png' });
                        if (navigator.canShare({ files: [file] })) {
                          await navigator.share({ files: [file], title: siteName, text });
                          return;
                        }
                      }
                    } catch {}
                    // Fallback to text share
                    if (navigator.share) {
                      navigator.share({ title: siteName, text, url }).catch(() => {
                        safeCopy(`${text} ${url}`);
                      });
                    } else {
                      safeCopy(`${text} ${url}`);
                    }
                  }}
                  className="w-full py-4 rounded-[1.5rem] font-black uppercase tracking-[0.25em] text-xs transition-all active:scale-95 border cursor-pointer relative z-50 pointer-events-auto bg-gradient-to-r from-red-700 to-red-600 text-white border-red-500/30 hover:from-red-600 hover:to-red-500 shadow-lg shadow-red-900/30"
                >
                  {t('result.shareResult')}
                </button>
                <button
                  onClick={() => {
                    const siteName = t('seo.siteName');
                    const text = rezultat.win
                      ? t('result.shareWinText', { site: siteName, wins: userStats.wins || 0 })
                      : t('result.shareLoseText', { site: siteName });
                    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} https://${siteName.toLowerCase()}`)}`, '_blank');
                  }}
                  className="w-full py-4 rounded-[1.5rem] font-black uppercase tracking-[0.25em] text-xs transition-all active:scale-95 border cursor-pointer relative z-50 pointer-events-auto bg-green-700 text-white border-green-600/30 hover:bg-green-600 shadow-lg shadow-green-900/30"
                >
                  {t('result.shareWhatsApp')}
                </button>
                <button
                  onClick={handleRevansa}
                  disabled={!isBotMatch && revansaRequests[nume]}
                  className={`w-full py-4 rounded-[1.5rem] font-black uppercase tracking-[0.25em] text-xs transition-all active:scale-95 border cursor-pointer relative z-50 pointer-events-auto
                    ${!isBotMatch && revansaRequests[nume]
                      ? 'bg-white/5 text-faint border-edge-strong cursor-default'
                      : 'bg-white text-red-800 border-white/80 hover:bg-red-50 shadow-[0_10px_30px_rgba(255,255,255,0.08)]'
                    }`}
                >
                  {isBotMatch
                    ? t('result.revanche')
                    : revansaRequests[nume]
                      ? `${t('result.waiting')} (${Object.values(revansaRequests).filter(Boolean).length}/2)...`
                      : `${t('result.revanche')} (${Object.values(revansaRequests).filter(Boolean).length}/2)`
                  }
                </button>
                <button
                  onClick={() => router.push(locale === 'ro' ? '/' : `/${locale}`)}
                  className="w-full py-4 rounded-[1.5rem] font-black uppercase tracking-[0.25em] text-xs transition-all active:scale-95 border cursor-pointer relative z-50 pointer-events-auto text-muted bg-card border-edge hover:bg-card-hover hover:text-dim"
                >
                  {t('result.home')}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}

function ArenaFallback() {
  const t = useT();
  return <div className="font-black animate-pulse text-red-500/70 tracking-widest text-sm uppercase flex-1 flex items-center justify-center">{t('game.preparing')}</div>;
}

export default function PaginaJoc({ params }) {
  const resolvedParams = React.use(params);
  return (
    <main className="game-arena min-h-[100dvh] w-full bg-main text-body flex flex-col items-center justify-start md:justify-center relative pattern-tradition" style={{ overflowX: 'clip' }}>
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] bg-amber-900/5 rounded-full blur-[150px] pointer-events-none" />

      <Suspense fallback={<ArenaFallback />}>
        <ArenaMaster room={resolvedParams.room} />
      </Suspense>
    </main>
  );
}
