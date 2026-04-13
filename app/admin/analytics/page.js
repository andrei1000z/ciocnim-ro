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
  const [contactData, setContactData] = useState(null);

  async function loadContactData() {
    try {
      const res = await fetch("/api/ciocnire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actiune: "contact-list", secret, locale: "ro" }),
      });
      const json = await res.json();
      if (json.success) setContactData(json);
    } catch {}
  }

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

  // Load contact data o dată după auth
  useEffect(() => {
    if (!authed || !secret) return;
    loadContactData();
    const i = setInterval(loadContactData, 15000);
    return () => clearInterval(i);
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
          <span className="text-green-400 font-bold">LIVE — {fmt(data.onlineNow)} online · auto-refresh 5s · {data.gameStats?.totalCiocniri || 0} ciocniri · {data.gameStats?.totalJucatori || 0} jucători</span>
        </div>

        {/* Top stats — 8 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Online ACUM" value={data.onlineNow} sub="Live 1s precision" accent="green" />
          <StatCard label="DAU azi" value={today.dau} sub={`ieri: ${fmt(yesterday.dau)}`} accent="amber" />
          <StatCard label="WAU săptămână" value={data.wau} sub={`MAU: ${fmt(data.mau)}`} accent="blue" />
          <StatCard label="Stickiness" value={`${data.stickiness}%`} sub="DAU/MAU ratio" accent="red" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Views azi" value={today.views} sub={`ieri: ${fmt(yesterday.views)}`} accent="red" />
          <StatCard label="Views totale" value={t.views} accent="amber" />
          <StatCard label="Useri activi azi" value={today.activeUsers} sub="(cu poreclă)" accent="green" />
          <StatCard label="PWA installs" value={pwaInstalls} sub={`${pwaRatio}% PWA opens`} accent="blue" />
        </div>

        {/* Performance + game stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Avg load time" value={`${data.perf?.avgLoadTime || 0}ms`} sub="Page load median" accent="green" />
          <StatCard label="Avg time on page" value={`${Math.round((data.perf?.avgTimeOnPage || 0) / 1000)}s`} sub="Engagement" accent="amber" />
          <StatCard label="Battles total" value={data.eventsTotal?.['battle-win'] + data.eventsTotal?.['battle-loss'] || 0} sub={`${fmt(data.eventsTotal?.['battle-win'])} W / ${fmt(data.eventsTotal?.['battle-loss'])} L`} accent="red" />
          <StatCard label="Camere create" value={(parseInt(data.eventsTotal?.['room-private']) || 0) + (parseInt(data.eventsTotal?.['room-arena']) || 0)} sub={`${fmt(data.eventsTotal?.['room-private'])} privat / ${fmt(data.eventsTotal?.['room-arena'])} arena`} accent="blue" />
        </div>

        {/* Real-time event feed */}
        {data.eventsStream && data.eventsStream.length > 0 && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              📡 Event feed live (ultimele 50)
            </h3>
            <div className="max-h-80 overflow-y-auto space-y-1 text-[10px] font-mono">
              {data.eventsStream.map((e, i) => {
                const time = new Date(e.t).toLocaleTimeString('ro-RO');
                const ago = Math.round((Date.now() - e.t) / 1000);
                const icon = e.type === 'pageview' ? '👁' : e.type === 'battle-win' ? '🏆' : e.type === 'battle-loss' ? '💔' : e.type === 'room-private' ? '🚪' : e.type === 'pwa-install' ? '📲' : '⚡';
                return (
                  <div key={i} className="flex items-center gap-2 px-2 py-1 hover:bg-elevated rounded">
                    <span className="text-base">{icon}</span>
                    <span className="text-dim w-16">{time}</span>
                    <span className="text-amber-400 font-bold w-20">{e.type}</span>
                    {e.jucator && <span className="text-green-400 font-bold">{e.jucator}</span>}
                    {e.country && <span className="text-blue-400">{e.country}</span>}
                    {e.city && <span className="text-blue-300/70">· {e.city}</span>}
                    {e.pathname && <span className="text-body truncate flex-1">· {e.pathname}</span>}
                    {e.referrer && e.referrer !== 'direct' && <span className="text-purple-400/70 ml-auto">← {e.referrer}</span>}
                    <span className="text-faint text-[9px]">{ago}s ago</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hourly chart */}
        {data.hourly && Object.keys(data.hourly).length > 0 && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-3">⏰ Activitate orară (ultimele 24h)</h3>
            <HourlyChart data={data.hourly} />
          </div>
        )}

        {/* UTM generator */}
        <UTMGenerator />

        {/* Contact + Newsletter + Reservations */}
        {contactData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="📬 Newsletter" value={contactData.newsletterCount} sub="abonați" accent="amber" />
              <StatCard label="🔒 Rezervări 2027" value={contactData.reservations2027Count} sub="nume rezervate" accent="blue" />
              <StatCard label="💬 Contact total" value={contactData.meta?.total} sub="mesaje primite" accent="green" />
              <StatCard label="🐛 Bug-uri raportate" value={contactData.meta?.topic_bug} sub="din contact" accent="red" />
            </div>

            {/* 📬 NEWSLETTER — lista completă emails */}
            {contactData.newsletter && contactData.newsletter.length > 0 && (
              <div className="bg-card border border-edge rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-heading">📬 Newsletter abonați ({contactData.newsletter.length})</h3>
                  <button
                    onClick={() => {
                      const emails = contactData.newsletter.map(n => n.email).join(', ');
                      try { navigator.clipboard.writeText(emails); } catch {}
                    }}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 px-2 py-1 bg-elevated rounded"
                  >
                    📋 Copiază toate
                  </button>
                </div>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {contactData.newsletter.map((n, i) => {
                    const when = n.joined ? new Date(n.joined).toLocaleString('ro-RO') : '—';
                    return (
                      <div key={n.email} className="flex items-center gap-2 px-3 py-2 bg-elevated rounded-lg text-xs">
                        <span className="text-dim w-6 text-right">{i + 1}.</span>
                        <a href={`mailto:${n.email}`} className="font-bold text-amber-300 hover:text-amber-200 flex-1 truncate">{n.email}</a>
                        <span className="text-[10px] text-dim uppercase font-bold">{n.locale}</span>
                        <span className="text-[10px] text-muted whitespace-nowrap">{when}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🔒 REZERVĂRI 2027 */}
            {contactData.reservations && contactData.reservations.length > 0 && (
              <div className="bg-card border border-edge rounded-2xl p-5">
                <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-3">🔒 Nume rezervate pentru Sezonul 2027 ({contactData.reservations.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {contactData.reservations.map((r) => {
                    const when = r.reservedAt ? new Date(r.reservedAt).toLocaleDateString('ro-RO') : '—';
                    return (
                      <div key={r.name} className="flex flex-col px-3 py-2 bg-elevated rounded-lg">
                        <span className="font-black text-blue-300 text-sm truncate">{r.name}</span>
                        <span className="text-[10px] text-muted">{when}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 💬 MESAJE CONTACT */}
            {contactData.messages && contactData.messages.length > 0 && (
              <div className="bg-card border border-edge rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-heading">💬 Mesaje contact ({contactData.messages.length})</h3>
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-2 py-0.5 bg-red-900/30 text-red-400 rounded">🐛 {contactData.meta?.topic_bug || 0}</span>
                    <span className="px-2 py-0.5 bg-amber-900/30 text-amber-400 rounded">💡 {contactData.meta?.topic_suggestion || 0}</span>
                    <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded">❤️ {contactData.meta?.topic_compliment || 0}</span>
                    <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">💭 {contactData.meta?.topic_other || 0}</span>
                  </div>
                </div>
                <div className="space-y-2 max-h-[32rem] overflow-y-auto">
                  {contactData.messages.map((m, i) => {
                    const when = new Date(m.t).toLocaleString('ro-RO');
                    const topicIcon = m.topic === 'bug' ? '🐛' : m.topic === 'suggestion' ? '💡' : m.topic === 'compliment' ? '❤️' : '💭';
                    const topicColor = m.topic === 'bug' ? 'text-red-400 border-red-800/40 bg-red-900/10' : m.topic === 'suggestion' ? 'text-amber-400 border-amber-800/40 bg-amber-900/10' : m.topic === 'compliment' ? 'text-green-400 border-green-800/40 bg-green-900/10' : 'text-blue-400 border-blue-800/40 bg-blue-900/10';
                    // Parse browser din UA
                    const ua = m.ua || '';
                    let browserInfo = '';
                    if (/Chrome/.test(ua) && !/Edg|OPR/.test(ua)) browserInfo = 'Chrome';
                    else if (/Firefox/.test(ua)) browserInfo = 'Firefox';
                    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browserInfo = 'Safari';
                    else if (/Edg/.test(ua)) browserInfo = 'Edge';
                    let deviceInfo = '';
                    if (/Android/.test(ua)) deviceInfo = '🤖 Android';
                    else if (/iPhone|iPad/.test(ua)) deviceInfo = '📱 iOS';
                    else if (/Windows/.test(ua)) deviceInfo = '🪟 Windows';
                    else if (/Mac/.test(ua)) deviceInfo = '🍎 macOS';
                    else if (/Linux/.test(ua)) deviceInfo = '🐧 Linux';
                    return (
                      <div key={i} className={`p-3 rounded-xl border ${topicColor}`}>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] mb-2">
                          <span className="text-base">{topicIcon}</span>
                          <span className={`font-black uppercase ${topicColor.split(' ')[0]}`}>{m.topic}</span>
                          <span className="text-dim">·</span>
                          <span className="text-dim">{when}</span>
                          {m.locale && <><span className="text-dim">·</span><span className="text-dim uppercase font-bold">{m.locale}</span></>}
                          {deviceInfo && <><span className="text-dim">·</span><span className="text-dim">{deviceInfo}</span></>}
                          {browserInfo && <><span className="text-dim">·</span><span className="text-dim">{browserInfo}</span></>}
                          {m.email ? (
                            <a href={`mailto:${m.email}?subject=Re: ${m.topic} pe Ciocnim.ro`} className="ml-auto text-red-400 hover:text-red-300 font-bold text-[11px]">
                              ✉ {m.email}
                            </a>
                          ) : (
                            <span className="ml-auto text-faint text-[10px] italic">fără email</span>
                          )}
                        </div>
                        <p className="text-xs text-body whitespace-pre-wrap break-words leading-relaxed">{m.message}</p>
                        {m.ip && (
                          <p className="text-[9px] text-faint mt-1.5 font-mono">IP: {m.ip}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Top inviters */}
        {data.topInviters && data.topInviters.length > 0 && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-3">🎯 Top invitatori (useri care aduc alți jucători)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {data.topInviters.map((u, i) => (
                <div key={u.nume} className="flex items-center gap-2 px-3 py-2 bg-elevated rounded-lg">
                  <span className="text-xs font-bold text-amber-400 w-5">{i + 1}.</span>
                  <span className="text-xs font-bold text-body truncate flex-1">{u.nume}</span>
                  <span className="text-xs font-black text-green-400 tabular-nums">{u.invites}</span>
                </div>
              ))}
            </div>
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
          <BreakdownList title="🏙️ Orașe" data={data.cities} />
          <BreakdownList title="🗺️ Regiuni" data={data.regions} />
          <BreakdownList title="🕒 Timezones" data={data.timezones} />
          <BreakdownList title="🔤 Limbi browser" data={data.languages} />
          <BreakdownList title="📐 Viewports" data={data.viewports} />
          <BreakdownList title="🖥️ Rezoluții ecran" data={data.screens} />
          <BreakdownList title="📱 Top pagini" data={data.routes} />
          <BreakdownList title="🚪 Landing pages" data={data.landingPages} />
          <BreakdownList title="🔗 Surse trafic (domain)" data={data.referrers} />
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
          <div className="bg-card border border-edge rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-2">📶 Conexiune</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span>4G/wifi</span><span className="tabular-nums font-bold text-red-400">{fmt(t.connection_4g)}</span></div>
                <div className="flex justify-between"><span>3G</span><span className="tabular-nums font-bold text-red-400">{fmt(t.connection_3g)}</span></div>
                <div className="flex justify-between"><span>2G</span><span className="tabular-nums font-bold text-red-400">{fmt(t.connection_2g)}</span></div>
                <div className="flex justify-between"><span>Slow 2G</span><span className="tabular-nums font-bold text-red-400">{fmt(t['connection_slow-2g'])}</span></div>
                <div className="flex justify-between"><span>Necunoscut</span><span className="tabular-nums font-bold text-red-400">{fmt(t.connection_unknown)}</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-2">📐 Orientare + Theme</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span>Portrait</span><span className="tabular-nums font-bold text-red-400">{fmt(t.orientation_portrait)}</span></div>
                <div className="flex justify-between"><span>Landscape</span><span className="tabular-nums font-bold text-red-400">{fmt(t.orientation_landscape)}</span></div>
                <div className="flex justify-between"><span>Dark theme</span><span className="tabular-nums font-bold text-red-400">{fmt(t.scheme_dark)}</span></div>
                <div className="flex justify-between"><span>Light theme</span><span className="tabular-nums font-bold text-red-400">{fmt(t.scheme_light)}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Full referrer URLs */}
        {data.referrersFull && Object.keys(data.referrersFull).length > 0 && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-1">🔗 URL-uri complete (referrer)</h3>
            <p className="text-[10px] text-dim mb-3">URL-urile exacte de unde vin vizitatorii. Instagram/Facebook strip URL-ul → vezi doar wrapperul. Folosește UTM params pentru tracking precis.</p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto text-xs">
              {Object.entries(data.referrersFull)
                .map(([k, v]) => [k, parseInt(v) || 0])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 30)
                .map(([url, count]) => (
                  <div key={url} className="flex items-center gap-2 px-2 py-1.5 hover:bg-elevated rounded">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-400 hover:text-blue-300 truncate flex-1">{url}</a>
                    <span className="font-black text-red-400 tabular-nums flex-shrink-0">{fmt(count)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* UTM tracking */}
        {(data.utmSource && Object.keys(data.utmSource).length > 0) && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-1">📣 UTM Campaigns</h3>
            <p className="text-[10px] text-dim mb-3">Tracking precis cu link-uri UTM. Adaugă <code className="bg-elevated px-1 rounded">?utm_source=instagram&amp;utm_campaign=story1</code> la link-urile distribuite.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h4 className="text-[10px] font-bold uppercase text-dim mb-1">utm_source</h4>
                <BreakdownList title="" data={data.utmSource} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-dim mb-1">utm_medium</h4>
                <BreakdownList title="" data={data.utmMedium} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-dim mb-1">utm_campaign</h4>
                <BreakdownList title="" data={data.utmCampaign} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-dim mb-1">utm_content</h4>
                <BreakdownList title="" data={data.utmContent} />
              </div>
            </div>
          </div>
        )}

        {/* Scroll depth + CTA clicks — insights pentru îmbunătățire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.scrollDepth && Object.keys(data.scrollDepth).length > 0 && (
            <BreakdownList title="📜 Scroll depth (% pagină citită)" data={data.scrollDepth} />
          )}
          {data.ctaClicks && Object.keys(data.ctaClicks).length > 0 && (
            <BreakdownList title="🎯 CTA clicks" data={data.ctaClicks} />
          )}
        </div>

        {/* Errors */}
        {data.errors && Object.keys(data.errors).length > 0 && (
          <BreakdownList title="🐛 Erori JavaScript" data={data.errors} />
        )}

        <p className="text-center text-[10px] text-dim">
          Server time: {new Date(data.serverTime).toLocaleString('ro-RO')} · Auto-refresh 5s
        </p>
      </div>
    </div>
  );
}

function UTMGenerator() {
  const [source, setSource] = useState("instagram");
  const [medium, setMedium] = useState("story");
  const [campaign, setCampaign] = useState("paste2026");
  const [content, setContent] = useState("");
  const [basePath, setBasePath] = useState("/");
  const [copied, setCopied] = useState(false);

  const url = (() => {
    const params = new URLSearchParams();
    if (source) params.set("utm_source", source);
    if (medium) params.set("utm_medium", medium);
    if (campaign) params.set("utm_campaign", campaign);
    if (content) params.set("utm_content", content);
    const qs = params.toString();
    return `https://www.ciocnim.ro${basePath}${qs ? '?' + qs : ''}`;
  })();

  const copy = () => {
    try {
      navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const presets = [
    { label: "📸 Instagram Story", source: "instagram", medium: "story", campaign: "paste2026" },
    { label: "📷 Instagram Bio", source: "instagram", medium: "bio", campaign: "profile" },
    { label: "💬 Instagram DM", source: "instagram", medium: "dm", campaign: "personal" },
    { label: "📘 Facebook Post", source: "facebook", medium: "post", campaign: "paste2026" },
    { label: "🎵 TikTok Bio", source: "tiktok", medium: "bio", campaign: "profile" },
    { label: "💚 WhatsApp Grup", source: "whatsapp", medium: "group", campaign: "invite" },
    { label: "🔴 Reddit Post", source: "reddit", medium: "post", campaign: "launch" },
    { label: "📧 Email", source: "email", medium: "newsletter", campaign: "launch" },
  ];

  const paths = [
    { label: "Homepage", value: "/" },
    { label: "Clasament", value: "/clasament" },
    { label: "Rețete", value: "/retete" },
    { label: "Tradiții", value: "/traditii" },
    { label: "Urări", value: "/urari" },
  ];

  return (
    <div className="bg-card border border-edge rounded-2xl p-5">
      <h3 className="text-sm font-black uppercase tracking-wider text-heading mb-1">🔗 UTM Link Generator</h3>
      <p className="text-[10px] text-dim mb-3">Generează link-uri cu tracking UTM pentru campanii (Instagram, Facebook, TikTok, etc.)</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => { setSource(p.source); setMedium(p.medium); setCampaign(p.campaign); setContent(""); }}
            className="px-2.5 py-1 bg-elevated hover:bg-elevated-hover rounded-lg text-[10px] font-bold text-body transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-[10px] font-bold text-dim uppercase">utm_source</label>
          <input value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-2 py-1.5 bg-elevated border border-edge rounded-lg text-xs font-mono text-body" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-dim uppercase">utm_medium</label>
          <input value={medium} onChange={(e) => setMedium(e.target.value)} className="w-full px-2 py-1.5 bg-elevated border border-edge rounded-lg text-xs font-mono text-body" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-dim uppercase">utm_campaign</label>
          <input value={campaign} onChange={(e) => setCampaign(e.target.value)} className="w-full px-2 py-1.5 bg-elevated border border-edge rounded-lg text-xs font-mono text-body" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-dim uppercase">utm_content (opt)</label>
          <input value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-2 py-1.5 bg-elevated border border-edge rounded-lg text-xs font-mono text-body" />
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[10px] font-bold text-dim uppercase">Pagina destinație</label>
        <div className="flex flex-wrap gap-1 mt-1">
          {paths.map(p => (
            <button key={p.value} onClick={() => setBasePath(p.value)} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${basePath === p.value ? 'bg-red-700 text-white' : 'bg-elevated text-dim'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-elevated border border-edge rounded-xl p-3 mb-2">
        <code className="text-[10px] text-amber-400 font-mono break-all">{url}</code>
      </div>
      <button
        onClick={copy}
        className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white font-black text-xs rounded-xl transition-all active:scale-95"
      >
        {copied ? "✅ Copiat!" : "📋 Copiază link"}
      </button>
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
