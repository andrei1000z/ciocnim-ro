"use client";

import { useEffect, useState, useSyncExternalStore, createContext, useContext, useCallback, useRef, useMemo } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { safeLS } from "@/app/lib/utils";
import { useT } from "@/app/i18n/useT";
import { useLocaleConfig } from "./DictionaryProvider";

const GlobalStatsContext = createContext();
export const useGlobalStats = () => useContext(GlobalStatsContext);

// Toast component for inline notifications (replaces alert())
function ToastBar({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      role="alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[1100] px-5 py-3 rounded-2xl bg-surface-hover border border-red-900/30 shadow-xl shadow-black/40 text-sm font-bold text-body max-w-[90vw] text-center pointer-events-auto"
    >
      {msg}
    </motion.div>
  );
}

// Achievement toast — shows when a new achievement is unlocked
function AchievementToast({ achievement, onDone }) {
  const t = useT();
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(onDone, 5000);
    return () => clearTimeout(timer);
  }, [achievement, onDone]);
  if (!achievement) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -40 }}
      transition={{ type: "spring", bounce: 0.5 }}
      role="alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[1100] px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-900/90 to-red-900/90 border border-amber-500/30 shadow-2xl shadow-amber-900/30 text-center pointer-events-auto backdrop-blur-xl max-w-[90vw]"
    >
      <div className="text-3xl mb-1">{achievement.icon}</div>
      <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-0.5">{t('achievement.unlocked')}</div>
      <div className="font-bold text-white text-sm">{achievement.key ? t(`content.achievements.${achievement.key}.name`) : achievement.name}</div>
      <div className="text-[11px] text-amber-200/60 mt-0.5">{achievement.key ? t(`content.achievements.${achievement.key}.desc`) : achievement.desc}</div>
    </motion.div>
  );
}

function CookieBanner() {
  const t = useT();
  const { locale } = useLocaleConfig();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem('c_cookie_consent')) setVisible(true);
    } catch {}
  }, []);
  if (!visible) return null;
  const accept = () => {
    try { localStorage.setItem('c_cookie_consent', '1'); } catch {}
    setVisible(false);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      role="dialog"
      aria-label="Informații despre stocarea datelor"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-[1300] max-w-md mx-auto bg-surface-hover border border-red-900/30 rounded-2xl p-4 shadow-2xl shadow-black/50 flex flex-col gap-3"
    >
      <p className="text-xs text-body leading-relaxed">
        {t('cookie.text')}{' '}
        <a href={`/${locale}/privacy`} className="text-red-400 hover:text-red-300 underline">{t('cookie.privacyLink')}</a>.
      </p>
      <button
        onClick={accept}
        className="self-end px-5 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all active:scale-95 border border-red-600"
      >
        {t('cookie.accept')}
      </button>
    </motion.div>
  );
}

function LoadingScreen() {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="fixed inset-0 bg-main z-[100001] flex flex-col items-center justify-center">
      {!timedOut ? (
        <div className="flex flex-col items-center gap-5">
          <span className="text-8xl animate-bounce" aria-hidden="true">🥚</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 text-center px-6 max-w-sm">
          <span className="text-6xl" aria-hidden="true">⚠️</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-2xl transition-all active:scale-95 border border-red-600"
          >
            ↻
          </button>
        </div>
      )}
    </div>
  );
}

const emptySubscribe = () => () => {};

// Client-side namespace must match server-side getNamespace() in app/api/ciocnire/utils.js
// Per-locale: ro/bg/el/en are each isolated in Redis.
const VALID_LOCALES = ['ro', 'bg', 'el', 'en'];
export function getClientNamespace(locale) {
  return VALID_LOCALES.includes(locale) ? locale : 'ro';
}

/**
 * Returnează regiunea default pe baza locale-ului curent.
 * Folosită pentru inițializarea user-ului neînregistrat.
 * Pentru `en` (international) nu avem regiuni — folosim "Global".
 */
function getDefaultRegion(locale) {
  if (locale === 'bg') return 'София-град';
  if (locale === 'el') return 'Αττική';
  if (locale === 'en') return 'Global';
  return 'Muntenia';
}

function buildDefaultStats(locale) {
  const base = { nume: "", wins: 0, losses: 0, skin: "red", regiune: getDefaultRegion(locale) };
  // On /en we skip the region selector entirely
  if (locale === 'en') base.regiuneSet = true;
  return base;
}

// Data version — bump this to wipe all localStorage on next visit
const DATA_VERSION = "2";

function checkDataReset() {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem("c_version") !== DATA_VERSION) {
      // Preserve critical data across version bumps
      const preserve = {};
      for (const key of ['c_nume', 'c_teamIds', 'c_visitorId']) {
        const val = localStorage.getItem(key);
        if (val) preserve[key] = val;
      }
      const keys = Object.keys(localStorage).filter(k => k.startsWith("c_"));
      keys.forEach(k => localStorage.removeItem(k));
      for (const [k, v] of Object.entries(preserve)) {
        localStorage.setItem(k, v);
      }
      localStorage.setItem("c_version", DATA_VERSION);
    }
  } catch {}
}

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const t = useT();
  const { locale } = useLocaleConfig();

  useEffect(() => { checkDataReset(); }, []);

  const [userStats, setUserStats] = useState(() => {
    const DS = buildDefaultStats(locale);
    const savedStats = safeLS.get("c_stats");
    const savedName = safeLS.get("c_nume");
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        const safeStats = { ...DS, ...parsed };
        if (savedName && safeStats.nume !== savedName) {
          const healed = { ...safeStats, nume: savedName };
          safeLS.set("c_stats", JSON.stringify(healed));
          return healed;
        }
        return safeStats;
      } catch {}
    }
    if (savedName) return { ...DS, nume: savedName };
    return DS;
  });
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [topRegiuni, setTopRegiuni] = useState([]);
  const [topJucatori, setTopJucatori] = useState([]);
  const [nume, setNumeLocal] = useState(() => {
    return safeLS.get("c_nume") || "";
  });
  const [notificare, setNotificare] = useState(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [toastMsg, setToastMsg] = useState(null);
  const [achievementToast, setAchievementToast] = useState(null);
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const pusherRef = useRef(null);
  const visitorIdRef = useRef(null);
  const [connectionState, setConnectionState] = useState('connecting');

  // Inițializare Pusher o singură dată — disconnect la unmount.
  // IMPORTANT: folosim DEFAULT-urile Pusher Cloud pentru wsHost/wsPort (port 443 cu
  // cluster EU) — CSP-ul nostru permite DOAR port 443 pe *.pusher.com.
  // Override-urile pentru wsPort/wsHost se aplică DOAR dacă sunt setate explicit prin env
  // (ex: soketi self-hosted pe dev).
  useEffect(() => {
    const forceTLS = process.env.NEXT_PUBLIC_PUSHER_TLS !== 'false';
    const customHost = process.env.NEXT_PUBLIC_PUSHER_HOST;
    const customPort = process.env.NEXT_PUBLIC_PUSHER_PORT;
    const pusherConfig = {
      cluster: 'eu',
      forceTLS: forceTLS,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      activityTimeout: 30000,
      pongTimeout: 15000,
      // Authorizer custom: citește c_session fresh la fiecare auth request
      // (Pusher.config.auth e static la creation; authorizer permite dynamic).
      authorizer: function(channel) {
        return {
          authorize: function(socketId, callback) {
            const session = safeLS.get('c_session') || '';
            fetch('/api/pusher/auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Session': session,
              },
              body: `socket_id=${encodeURIComponent(socketId)}&channel_name=${encodeURIComponent(channel.name)}`,
            })
              .then(r => r.ok ? r.json() : Promise.reject(new Error(`auth ${r.status}`)))
              .then(data => callback(null, data))
              .catch(err => callback(err, null));
          },
        };
      },
    };
    if (customHost) {
      pusherConfig.wsHost = customHost;
      pusherConfig.httpHost = customHost;
    }
    if (customPort) {
      const p = parseInt(customPort);
      pusherConfig.wsPort = p;
      pusherConfig.wssPort = p;
    }
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, pusherConfig);
    pusherRef.current = pusher;

    // Track connection state for visual indicator
    pusher.connection.bind('state_change', ({ current }) => {
      setConnectionState(current);
    });
    pusher.connection.bind('connected', () => setConnectionState('connected'));
    pusher.connection.bind('disconnected', () => setConnectionState('disconnected'));

    // CRITICAL: sync initial state from pusher.connection.state.
    // Race condition fix: dacă Pusher s-a conectat BEFORE noi am apucat să
    // bind-uim 'connected' event, evenimentul e pierdut și React state
    // rămâne blocat pe 'connecting' → pollings folosesc interval disconnected
    // (rapide) + Pusher useEffect gate `if (connectionState !== 'connected')`
    // nu trece niciodată → jocul rulează 100% pe polling, nu Pusher.
    // Fix: sync explicit + re-check periodic pt primele 5s.
    setConnectionState(pusher.connection.state);
    const syncTimer = setInterval(() => {
      const s = pusher.connection.state;
      if (s === 'connected' || s === 'disconnected') {
        setConnectionState(s);
      }
    }, 500);
    const stopSync = setTimeout(() => clearInterval(syncTimer), 8000);

    return () => {
      clearInterval(syncTimer);
      clearTimeout(stopSync);
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, []);

  const triggerVibrate = useCallback((pattern = [50]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const playSound = useCallback((soundFile) => {
    try { const audio = new Audio(`/${soundFile}.mp3`); audio.volume = 0.4; audio.play().catch(() => {}); } catch (e) {}
  }, []);

  const updateUserStats = useCallback((newStats) => {
    setUserStats(prevStats => {
      const updated = typeof newStats === 'function' ? newStats(prevStats) : newStats;
      safeLS.set("c_stats", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateStats = useCallback(async (type) => {
    if (!nume) return;
    try {
      const session = safeLS.get('c_session');
      if (!session) return; // no session = bootstrap pending, skip silently
      await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session': session },
        body: JSON.stringify({ actiune: 'update-stats', jucator: nume, text: type, locale })
      });
    } catch (e) {}
  }, [nume, locale]);

  // ==========================================================================
  // SCHIMBARE NUME (FIX PENTRU DUPLICATE ÎN GRUP)
  // ==========================================================================
  const setNume = useCallback(async (nouNume) => {
    const cleanName = nouNume.toUpperCase().trim();
    if (cleanName === nume) return true;
    if (cleanName.length < 2) {
      setToastMsg(t('notifications.nameMinChars'));
      return false;
    }

    try {
      const storedTeamIds = JSON.parse(safeLS.get("c_teamIds") || "[]");
      const existingSession = safeLS.get("c_session");
      const headers = { 'Content-Type': 'application/json' };
      if (existingSession) headers['X-Session'] = existingSession;

      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          actiune: 'schimba-porecla',
          oldName: nume,
          newName: cleanName,
          teamIds: storedTeamIds,
          locale
        })
      });
      const data = await res.json();

      if (!data.success) {
        setToastMsg(data.error || t('notifications.nameTaken'));
        return false;
      }

      // Salvează noul session token (dacă serverul îl emite)
      if (data.session) safeLS.set("c_session", data.session);

      setNumeLocal(cleanName);
      safeLS.set("c_nume", cleanName);
      setUserStats(prev => {
         const nextStats = { ...prev, nume: cleanName };
         safeLS.set("c_stats", JSON.stringify(nextStats));
         return nextStats;
      });
      return true;

    } catch {
      setToastMsg(t('notifications.errorNetwork'));
      return false;
    }
  }, [nume, setToastMsg, t, locale]);

  // NOTA: nu mai există bootstrap legacy. Useri vechi cu nume în localStorage
  // dar fără session pierd accesul la profil/rename/sterge-cont (game endpoints
  // continuă să meargă). Decizia e dictată de securitate — bootstrap-ul deschis
  // permitea atacatorilor să fure conturi rezervate prin simplu curl request.

  // ==========================================================================
  // INCREMENTARE SCOR (CLEAN & BULLETPROOF)
  // ==========================================================================
  const incrementGlobal = useCallback(async (amCastigat = false, teamIdToUpdate = null, roomId = null, isBot = false) => {
    try {
      if (!nume || nume.trim() === "") return;

      const payload = {
        actiune: 'increment-global',
        jucator: nume,
        regiune: (amCastigat && userStats.regiune && userStats.regiune !== "Alege regiunea...") ? userStats.regiune.trim() : null,
        teamId: amCastigat ? teamIdToUpdate : null,
        roomId: roomId,
        bot: isBot,
        amCastigat: amCastigat,
        locale
      };

      const res = await fetch('/api/ciocnire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setTotalGlobal(data.total);
        if (data.topRegiuni) setTopRegiuni(data.topRegiuni);
        if (data.topJucatori) setTopJucatori(data.topJucatori);

        if (amCastigat) {
            updateUserStats(prev => ({...prev, wins: (prev.wins || 0) + 1}));
        } else {
            updateUserStats(prev => ({...prev, losses: (prev.losses || 0) + 1}));
        }
      }
    } catch {
      setToastMsg(t('notifications.unstableConnection'));
    }
  }, [userStats.regiune, nume, updateUserStats, t, locale]);

  // HEARTBEAT: ping la fiecare 120s pentru a număra utilizatorii activi
  useEffect(() => {
    if (!isHydrated) return;
    if (!visitorIdRef.current) {
      let vid = safeLS.get('c_visitorId');
      if (!vid) {
        try { vid = sessionStorage.getItem('c_visitorId'); } catch {}
      }
      if (!vid) vid = `v-${Math.random().toString(36).substring(2, 10)}`;
      visitorIdRef.current = vid;
      safeLS.set('c_visitorId', vid);
      try { sessionStorage.setItem('c_visitorId', vid); } catch {}
    }
    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actiune: 'arena-heartbeat', visitorId: visitorIdRef.current, locale })
        });
        const data = await res.json();
        if (data.success && typeof data.online === 'number') setOnlineCount(data.online);
      } catch {}
    };
    const sendDisconnect = () => {
      try {
        const payload = JSON.stringify({ actiune: 'arena-disconnect', visitorId: visitorIdRef.current, locale });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/ciocnire', new Blob([payload], { type: 'application/json' }));
        } else {
          fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
        }
      } catch {}
    };
    // Trimite heartbeat instant la montare
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 300000);

    // Când user-ul revine pe tab → heartbeat instant (actualizare imediată)
    const onVisibility = () => { if (document.visibilityState === 'visible') sendHeartbeat(); };
    document.addEventListener('visibilitychange', onVisibility);

    // Când user-ul închide tab-ul → scoate-l din lista instant
    window.addEventListener('beforeunload', sendDisconnect);
    // Și pe pagehide (mobil - Safari)
    window.addEventListener('pagehide', sendDisconnect);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', sendDisconnect);
      window.removeEventListener('pagehide', sendDisconnect);
      sendDisconnect();
    };
  }, [isHydrated, locale]);

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const res = await fetch('/api/ciocnire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actiune: 'get-counter', locale }) });
        const data = await res.json();
        if (data.success) {
          setTotalGlobal(parseInt(data.total) || 0);
          setTopRegiuni(data.topRegiuni || []);
          setTopJucatori(data.topJucatori || []);
          if (typeof data.online === 'number') setOnlineCount(data.online);
        }
      } catch (err) {}
    };
    getInitialData();
  }, [locale]);

  // Sync stats from server when user has a name (handles new device / cleared localStorage)
  useEffect(() => {
    if (!isHydrated || !nume || nume.length < 2) return;
    (async () => {
      try {
        const res = await fetch('/api/ciocnire', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actiune: 'get-user-stats', jucator: nume, locale })
        });
        const data = await res.json();
        if (data.success && data.stats) {
          const server = data.stats;
          updateUserStats(prev => ({
            ...prev,
            wins: Math.max(prev.wins || 0, server.wins || 0),
            losses: Math.max(prev.losses || 0, server.losses || 0),
            regiune: prev.regiune || server.regiune || getDefaultRegion(locale)
          }));
        }
      } catch {}
    })();
  }, [isHydrated, nume, updateUserStats, locale]);

  useEffect(() => {
    if (!isHydrated || !pusherRef.current) return;

    const ns = getClientNamespace(locale);
    const globalChName = `${ns}-global`;
    const channel = pusherRef.current.subscribe(globalChName);
    channel.bind('update-complet', (data) => {
      if (data.total !== undefined) setTotalGlobal(parseInt(data.total));
      if (data.topRegiuni) setTopRegiuni(data.topRegiuni);
      if (data.topJucatori) setTopJucatori(data.topJucatori);
    });
    channel.bind('online-count', (data) => {
      if (typeof data.online === 'number') setOnlineCount(data.online);
    });

    return () => {
      channel.unbind_all();
      pusherRef.current?.unsubscribe(globalChName);
    };
  }, [isHydrated, locale]);

  useEffect(() => {
    if (!isHydrated || !nume || !pusherRef.current) return;

    const ns = getClientNamespace(locale);
    const channelName = `private-${ns}-user-notif-${nume}`;
    const channel = pusherRef.current.subscribe(channelName);
    let notifTimer = null;
    channel.bind('duel-request', (data) => {
      setNotificare({ deLa: data.deLa, roomId: data.roomId, teamId: data.teamId || null });
      triggerVibrate([100, 50, 100, 50, 200]);
      playSound('esec');
      if (notifTimer) clearTimeout(notifTimer);
      notifTimer = setTimeout(() => setNotificare(null), 20000);
    });

    let achQueue = [];
    let achShowing = false;
    let achTimer = null;
    const shownAchKeys = new Set(); // client-side dedup per sesiune
    const showNextAch = () => {
      if (achQueue.length === 0) { achShowing = false; return; }
      achShowing = true;
      setAchievementToast(achQueue.shift());
      achTimer = setTimeout(showNextAch, 5500);
    };
    channel.bind('achievement-unlocked', (data) => {
      if (!data.achievements || !Array.isArray(data.achievements)) return;
      const fresh = data.achievements.filter(a => !shownAchKeys.has(a.key));
      if (fresh.length === 0) return;
      fresh.forEach(a => shownAchKeys.add(a.key));
      achQueue.push(...fresh);
      playSound('victorie');
      triggerVibrate([50, 30, 50, 30, 100]);
      if (!achShowing) showNextAch();
    });

    return () => {
      if (notifTimer) clearTimeout(notifTimer);
      if (achTimer) clearTimeout(achTimer);
      achQueue = [];
      channel.unbind_all();
      pusherRef.current?.unsubscribe(channelName);
    };
  }, [isHydrated, nume, locale, playSound, triggerVibrate]);

  // Memoize context value: previne re-randarea întregului subtree când
  // doar toast/achievement/online se schimbă (fără memo, fiecare render
  // crea object nou → toți consumerii se actualizau).
  const contextValue = useMemo(() => ({
    totalGlobal,
    topRegiuni,
    topJucatori,
    nume,
    setNume,
    userStats,
    setUserStats: updateUserStats,
    playSound, triggerVibrate, incrementGlobal, isHydrated,
    updateStats,
    onlineCount,
    toastMsg, setToastMsg,
    pusherRef,
    connectionState,
  }), [
    totalGlobal, topRegiuni, topJucatori, nume, setNume, userStats,
    updateUserStats, playSound, triggerVibrate, incrementGlobal,
    isHydrated, updateStats, onlineCount, toastMsg, connectionState,
  ]);

  return (
    <GlobalStatsContext.Provider value={contextValue}>
      {children}

      {/* Toast notifications */}
      <AnimatePresence>
        {toastMsg && <ToastBar msg={toastMsg} onDone={() => setToastMsg(null)} />}
        {achievementToast && <AchievementToast achievement={achievementToast} onDone={() => setAchievementToast(null)} />}
      </AnimatePresence>

      {/* Container izolat pentru notificări */}
      <div className="fixed inset-0 z-[1200] pointer-events-none flex justify-center items-start pt-6 md:pt-10">
          <AnimatePresence>
            {notificare && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ type: "spring", bounce: 0.5 }}
                role="alertdialog"
                className="relative w-[90%] max-w-sm bg-surface p-8 md:p-10 rounded-3xl border border-red-900/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto"
              >
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center gap-2 bg-red-900/30 px-4 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-red-400 rounded-full mb-4">
                    {t('notifications.challenge')}
                  </div>

                  <p className="font-black text-2xl md:text-3xl text-heading leading-tight">
                    <span className="text-red-500">{notificare.deLa}</span> <br/> {t('notifications.challengeText')}
                  </p>

                  <div className="flex flex-col gap-3 pt-6 relative z-50">
                    <button
                      className="w-full bg-red-700 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-900/30 active:scale-95 text-white cursor-pointer pointer-events-auto"
                      onClick={() => { setNotificare(null); const pfx = locale === 'ro' ? '' : `/${locale}`; router.push(`${pfx}/joc/${notificare.roomId}?provocare=true&teamId=${notificare.teamId || ''}`); }}
                    >
                      {t('notifications.accept')}
                    </button>
                    <button
                      className="w-full bg-elevated py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-muted hover:bg-elevated-hover hover:text-dim transition-all active:scale-95 cursor-pointer pointer-events-auto"
                      onClick={() => setNotificare(null)}
                    >
                      {t('notifications.decline')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      {!isHydrated && <LoadingScreen />}
      <CookieBanner />
    </GlobalStatsContext.Provider>
  );
}
