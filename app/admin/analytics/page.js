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

function BreakdownList({ title, data, total, color = 'red' }) {
  if (!data || Object.keys(data).length === 0) return null;
  const entries = Object.entries(data)
    .map(([k, v]) => [k, parseInt(v) || 0])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  const max = entries[0]?.[1] || 1;
  return (
    <div className="bg-card border border-edge rounded-2xl p-5">
      <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-3">{title}</h3>
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
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Views totale" value={t.views} accent="red" />
          <StatCard label="DAU azi" value={today.dau} sub={`ieri: ${fmt(yesterday.dau)}`} accent="green" />
          <StatCard label="Views azi" value={today.views} sub={`ieri: ${fmt(yesterday.views)}`} accent="amber" />
          <StatCard label="PWA installs" value={pwaInstalls} sub={`${pwaRatio}% deschideri PWA`} accent="blue" />
        </div>

        {/* Breakdown grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BreakdownList title="🌍 Locale" data={data.locales} />
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
        </div>

        <button
          onClick={() => loadData(secret)}
          className="w-full bg-elevated hover:bg-elevated-hover border border-edge text-body font-bold py-3 rounded-xl transition-all"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
