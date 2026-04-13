"use client";

import { useState, useEffect } from "react";

const NUMBER_FMT = new Intl.NumberFormat('ro-RO');
const fmt = (n) => NUMBER_FMT.format(parseInt(n) || 0);

function StatCard({ label, value, sub, accent = 'red' }) {
  const colors = {
    red: 'border-red-600/30 bg-red-900/15 text-red-400',
    green: 'border-green-600/30 bg-green-900/15 text-green-400',
    amber: 'border-amber-600/30 bg-amber-900/15 text-amber-400',
    blue: 'border-blue-600/30 bg-blue-900/15 text-blue-400',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[accent]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-3xl font-black mt-1 tabular-nums">{fmt(value)}</p>
      {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

function BreakdownList({ title, data, total, color = 'red', wrap = true }) {
  if (!data || Object.keys(data).length === 0) return null;
  const entries = Object.entries(data)
    .map(([k, v]) => [k, parseInt(v) || 0])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  const max = entries[0]?.[1] || 1;
  const inner = (
    <div className="space-y-2">
      {entries.map(([key, val]) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-body truncate flex-1 mr-2">{key}</span>
            <span className="font-black text-red-400 tabular-nums">{fmt(val)}</span>
          </div>
          <div className="w-full h-1.5 bg-edge rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full"
              style={{ width: `${(val / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
  if (!title) return inner;
  return (
    <div className="bg-card border border-edge rounded-2xl p-5">
      <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-3">{title}</h3>
      {inner}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  async function loadUserDetails(userName) {
    setSelectedUser(userName);
    setUserDetails(null);
    setUserLoading(true);
    try {
      const res = await fetch("/api/ciocnire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actiune: "analytics-user", secret, userName, locale: "ro" }),
      });
      const json = await res.json();
      if (json.success) setUserDetails(json);
    } catch {}
    setUserLoading(false);
  }

  // Token persisted în sessionStorage (nu localStorage — dispare la închidere browser)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("_admin_secret");
      if (saved) {
        setSecret(saved);
        loadData(saved);
      }
    } catch {}
  }, []);

  // Auto-refresh la 5 secunde dacă autentificat
  useEffect(() => {
    if (!authed || !secret) return;
    const interval = setInterval(() => loadData(secret), 5000);
    return () => clearInterval(interval);
  }, [authed, secret]);

  async function loadData(s) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ciocnire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actiune: "analytics-summary", secret: s, locale: "ro" }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
        setAuthed(true);
        try { sessionStorage.setItem("_admin_secret", s); } catch {}
      } else {
        setError(json.error || "Parolă incorectă");
        setAuthed(false);
      }
    } catch {
      setError("Eroare rețea");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    try { sessionStorage.removeItem("_admin_secret"); } catch {}
    setSecret("");
    setData(null);
    setAuthed(false);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center p-4">
        <div className="bg-card border border-edge rounded-2xl p-8 max-w-sm w-full space-y-4">
          <h1 className="text-2xl font-black text-heading text-center">🔒 Admin</h1>
          <p className="text-xs text-dim text-center">Acces restricționat — introdu parola.</p>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData(secret)}
            placeholder="Parolă admin"
            className="w-full px-4 py-3 bg-elevated border border-edge-strong rounded-xl text-body outline-none focus:border-red-700 font-mono"
            autoFocus
            autoComplete="off"
          />
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <button
            onClick={() => loadData(secret)}
            disabled={!secret || loading}
            className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
          >
            {loading ? "..." : "Intră"}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const t = data.total || {};
  const today = data.today || {};
  const yesterday = data.yesterday || {};
  const pwaInstalls = parseInt(t.pwa_installs) || 0;
  const standalone = parseInt(t.display_standalone) || 0;
  const browser = parseInt(t.display_browser) || 0;
  const pwaRatio = (standalone + browser) > 0 ? Math.round((standalone / (standalone + browser)) * 100) : 0;

  return (
    <div className="min-h-screen bg-main text-body p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black text-heading">📊 Analytics</h1>
          <button onClick={logout} className="text-xs font-bold text-dim hover:text-red-400 transition-colors">
            Logout
          </button>
        </header>

        {/* LIVE indicator */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-green-400 font-bold">LIVE — {fmt(data.onlineNow)} online acum · auto-refresh 5s</span>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Online ACUM" value={data.onlineNow} sub="Live (1s precision)" accent="green" />
          <StatCard label="DAU azi" value={today.dau} sub={`ieri: ${fmt(yesterday.dau)}`} accent="amber" />
          <StatCard label="Views azi" value={today.views} sub={`ieri: ${fmt(yesterday.views)}`} accent="red" />
          <StatCard label="Useri activi azi" value={today.activeUsers} sub="(cu poreclă setată)" accent="blue" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Views totale" value={t.views} accent="red" />
          <StatCard label="PWA installs" value={pwaInstalls} sub={`${pwaRatio}% PWA opens`} accent="blue" />
          <StatCard label="Installs azi" value={today.pwa_installs} accent="green" />
          <StatCard label="Total useri unici" value={Object.values(data.locales || {}).reduce((a, b) => a + parseInt(b || 0), 0)} accent="amber" />
        </div>

        {/* Hourly chart */}
        {data.hourly && Object.keys(data.hourly).length > 0 && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-3">⏰ Activitate orară (ultimele 24h)</h3>
            <HourlyChart data={data.hourly} />
          </div>
        )}

        {/* Top users — clickable pentru drill-down */}
        {data.topUsers && data.topUsers.length > 0 && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-3">👤 Top useri (click pentru detalii)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.topUsers.map((u, i) => (
                <button
                  key={u.nume}
                  onClick={() => loadUserDetails(u.nume)}
                  className="flex items-center gap-2 px-3 py-2 bg-elevated hover:bg-elevated-hover rounded-lg transition-all text-left active:scale-95"
                >
                  <span className="text-xs font-bold text-dim w-5">{i + 1}.</span>
                  <span className="text-xs font-bold text-body truncate flex-1">{u.nume}</span>
                  <span className="text-xs font-black text-red-400 tabular-nums">{fmt(u.views)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal detalii user */}
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            details={userDetails}
            loading={userLoading}
            onClose={() => { setSelectedUser(null); setUserDetails(null); }}
          />
        )}

        {/* Breakdown grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BreakdownList title="🌍 Locale" data={data.locales} />
          <BreakdownList title="🌐 Țări" data={data.countries} />
          <BreakdownList title="📱 Top pagini" data={data.routes} />
          <BreakdownList title="🔗 Surse trafic" data={data.referrers} />
          <div className="bg-card border border-edge rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-2">📲 Device</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span>Mobile</span><span className="tabular-nums font-bold text-red-400">{fmt(t.device_mobile)}</span></div>
                <div className="flex justify-between"><span>Desktop</span><span className="tabular-nums font-bold text-red-400">{fmt(t.device_desktop)}</span></div>
                <div className="flex justify-between"><span>Tablet</span><span className="tabular-nums font-bold text-red-400">{fmt(t.device_tablet)}</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-2">💻 OS</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span>Android</span><span className="tabular-nums font-bold text-red-400">{fmt(t.os_android)}</span></div>
                <div className="flex justify-between"><span>iOS</span><span className="tabular-nums font-bold text-red-400">{fmt(t.os_ios)}</span></div>
                <div className="flex justify-between"><span>Windows</span><span className="tabular-nums font-bold text-red-400">{fmt(t.os_windows)}</span></div>
                <div className="flex justify-between"><span>macOS</span><span className="tabular-nums font-bold text-red-400">{fmt(t.os_macos)}</span></div>
                <div className="flex justify-between"><span>Linux</span><span className="tabular-nums font-bold text-red-400">{fmt(t.os_linux)}</span></div>
              </div>
            </div>
          </div>
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-2">🌐 Browser</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span>Chrome</span><span className="tabular-nums font-bold text-red-400">{fmt(t.browser_chrome)}</span></div>
              <div className="flex justify-between"><span>Safari</span><span className="tabular-nums font-bold text-red-400">{fmt(t.browser_safari)}</span></div>
              <div className="flex justify-between"><span>Firefox</span><span className="tabular-nums font-bold text-red-400">{fmt(t.browser_firefox)}</span></div>
              <div className="flex justify-between"><span>Edge</span><span className="tabular-nums font-bold text-red-400">{fmt(t.browser_edge)}</span></div>
              <div className="flex justify-between"><span>Opera</span><span className="tabular-nums font-bold text-red-400">{fmt(t.browser_opera)}</span></div>
              <div className="flex justify-between"><span>Other</span><span className="tabular-nums font-bold text-red-400">{fmt(t.browser_other)}</span></div>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-dim">
          Server time: {new Date(data.serverTime).toLocaleString('ro-RO')} · Auto-refresh 5s
        </p>
      </div>
    </div>
  );
}

function UserDetailModal({ user, details, loading, onClose }) {
  const m = details?.meta || {};
  const routes = details?.routes || {};
  const countries = details?.countries || {};
  const devices = details?.devices || {};
  const days = details?.days || {};
  const gameStats = details?.gameStats || {};

  const firstSeen = parseInt(m.first_seen) || 0;
  const lastSeen = parseInt(m.last_seen) || 0;
  const totalDuration = lastSeen - firstSeen;
  const fmtDuration = (ms) => {
    if (ms <= 0) return "—";
    const h = Math.floor(ms / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}z ${h % 24}h`;
    if (h > 0) return `${h}h ${Math.floor((ms % 3600000) / 60000)}m`;
    const min = Math.floor(ms / 60000);
    if (min > 0) return `${min}m`;
    return `${Math.floor(ms / 1000)}s`;
  };
  const fmtDate = (ts) => ts ? new Date(parseInt(ts)).toLocaleString('ro-RO') : '—';

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-main border border-edge rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-main border-b border-edge px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-heading">👤 {user}</h2>
          <button onClick={onClose} className="text-dim hover:text-red-400 text-2xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !details ? (
          <div className="p-12 text-center text-dim">Eroare la încărcare</div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Stat cards principale */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card border border-red-900/30 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-red-400/70">Pageviews</p>
                <p className="text-2xl font-black text-heading tabular-nums">{fmt(m.views)}</p>
              </div>
              <div className="bg-card border border-green-900/30 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-green-400/70">Timp total</p>
                <p className="text-xl font-black text-heading">{fmtDuration(totalDuration)}</p>
              </div>
              <div className="bg-card border border-amber-900/30 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-amber-400/70">Zile active</p>
                <p className="text-2xl font-black text-heading tabular-nums">{Object.keys(days).length}</p>
              </div>
              <div className="bg-card border border-blue-900/30 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-blue-400/70">Țară</p>
                <p className="text-xl font-black text-heading">{m.last_country || '—'}</p>
              </div>
            </div>

            {/* Game stats */}
            {(parseInt(gameStats.wins) > 0 || parseInt(gameStats.losses) > 0) && (
              <div className="bg-card border border-edge rounded-xl p-4">
                <h3 className="text-xs font-black uppercase text-heading mb-2">🎮 Joc</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-black text-green-400">{fmt(gameStats.wins)}</p>
                    <p className="text-[10px] text-muted uppercase">victorii</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-red-400">{fmt(gameStats.losses)}</p>
                    <p className="text-[10px] text-muted uppercase">înfrângeri</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-400">{fmt(gameStats.currentStreak)}</p>
                    <p className="text-[10px] text-muted uppercase">streak</p>
                  </div>
                </div>
                {gameStats.regiune && <p className="text-xs text-center text-dim mt-2">📍 {gameStats.regiune}</p>}
              </div>
            )}

            {/* Meta info */}
            <div className="bg-card border border-edge rounded-xl p-4 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted">Prima vizită:</span><span className="font-bold text-body">{fmtDate(firstSeen)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Ultima vizită:</span><span className="font-bold text-body">{fmtDate(lastSeen)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Ultima pagină:</span><span className="font-bold text-body truncate ml-2">{m.last_pathname || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Sursă:</span><span className="font-bold text-body">{m.last_referrer || 'direct'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Locale:</span><span className="font-bold text-body uppercase">{m.last_locale || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Mod afișare:</span><span className="font-bold text-body">{m.last_display_mode === 'standalone' ? '📱 PWA' : '🌐 Browser'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Device:</span><span className="font-bold text-body">{m.last_device || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted">OS:</span><span className="font-bold text-body">{m.last_os || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Browser:</span><span className="font-bold text-body">{m.last_browser || '—'}</span></div>
            </div>

            {/* Routes vizitate */}
            {Object.keys(routes).length > 0 && (
              <div className="bg-card border border-edge rounded-xl p-4">
                <h3 className="text-xs font-black uppercase text-heading mb-3">📄 Pagini vizitate</h3>
                <BreakdownList title="" data={routes} color="red" />
              </div>
            )}

            {/* Țări */}
            {Object.keys(countries).length > 1 && (
              <div className="bg-card border border-edge rounded-xl p-4">
                <h3 className="text-xs font-black uppercase text-heading mb-3">🌍 Țări</h3>
                <BreakdownList title="" data={countries} />
              </div>
            )}

            {/* Devices distinct */}
            {Object.keys(devices).length > 0 && (
              <div className="bg-card border border-edge rounded-xl p-4">
                <h3 className="text-xs font-black uppercase text-heading mb-3">📱 Combinații device/OS/browser</h3>
                <BreakdownList title="" data={devices} />
              </div>
            )}

            {/* Activitate pe zile */}
            {Object.keys(days).length > 0 && (
              <div className="bg-card border border-edge rounded-xl p-4">
                <h3 className="text-xs font-black uppercase text-heading mb-3">📅 Activitate pe zile</h3>
                <BreakdownList title="" data={days} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HourlyChart({ data }) {
  const entries = Object.entries(data)
    .map(([k, v]) => [k, parseInt(v) || 0])
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-24);
  if (entries.length === 0) return null;
  const max = Math.max(...entries.map(e => e[1]), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {entries.map(([hour, val]) => (
        <div key={hour} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
          <div
            className="w-full bg-gradient-to-t from-red-700 to-red-500 rounded-t hover:from-red-600 hover:to-red-400 transition-all"
            style={{ height: `${(val / max) * 100}%`, minHeight: val > 0 ? '2px' : '0' }}
          />
          <span className="text-[8px] text-dim opacity-50">{hour.slice(11, 13)}</span>
          <div className="absolute -top-8 hidden group-hover:flex bg-elevated border border-edge px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap">
            {val} views
          </div>
        </div>
      ))}
    </div>
  );
}
