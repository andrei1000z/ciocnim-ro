"use client";

import { useState } from "react";

function safeCopy(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
    }
  } catch {}
}

const GroupHub = ({ teams, activeTeamIndex, setActiveTeamIndex, numePreluat, onLeave, onRename, onProvoca, onKick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copyText, setCopyText] = useState("🔗 Invită");
  const currentTeam = teams?.[activeTeamIndex];
  const [newName, setNewName] = useState(currentTeam?.details?.nume || "");
  const isCreator = currentTeam?.details?.creator === numePreluat?.toUpperCase().trim();

  const [prevIndex, setPrevIndex] = useState(activeTeamIndex);
  if (activeTeamIndex !== prevIndex) {
    setPrevIndex(activeTeamIndex);
    if (currentTeam) { setNewName(currentTeam.details.nume); setIsEditing(false); }
  }

  if (!teams || teams.length === 0) return null;

  const handleSave = () => { onRename(currentTeam.details.id, newName); setIsEditing(false); };

  const handleInvite = async () => {
    const url = `${window.location.origin}/?joinTeam=${currentTeam.details.id}`;
    const shareText = `Hai în grupul meu de ciocnit ouă! Intră pe ${url} și arată-ne cine are cel mai tare ou 🥚⚔️`;
    if (navigator.share) {
      try { await navigator.share({ title: "Ciocnim.ro - Hai la ciocneală!", text: shareText, url }); } catch {}
    } else {
      safeCopy(shareText);
      setCopyText("✅ Copiat!");
      setTimeout(() => setCopyText("🔗 Invită"), 2000);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-red-900/20 bg-white/[0.04] backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-900/10 bg-red-900/20">
        <span className="font-bold text-white text-sm">👥 Grupul Meu</span>
        {teams.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => setActiveTeamIndex(p => (p - 1 + teams.length) % teams.length)} className="w-6 h-6 bg-red-800 text-white rounded-full text-xs hover:bg-red-900 transition-all flex items-center justify-center">◀</button>
            <span className="text-xs text-gray-400 font-semibold">{activeTeamIndex + 1}/{teams.length}</span>
            <button onClick={() => setActiveTeamIndex(p => (p + 1) % teams.length)} className="w-6 h-6 bg-red-800 text-white rounded-full text-xs hover:bg-red-900 transition-all flex items-center justify-center">▶</button>
          </div>
        )}
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          {isEditing && isCreator ? (
            <div className="flex gap-2 flex-1 min-w-0">
              <input value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-white/[0.1] rounded-xl text-sm font-bold text-gray-200 outline-none focus:border-red-800 bg-white/[0.05]" />
              <button onClick={handleSave} className="px-3 py-2 bg-red-800 text-white rounded-xl text-sm font-bold hover:bg-red-900 transition-all">OK</button>
              <button onClick={() => setIsEditing(false)} className="px-2.5 py-2 bg-white/[0.08] rounded-xl text-sm hover:bg-white/[0.12] transition-all text-gray-400">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-white text-sm">{currentTeam.details.nume}</span>
              {isCreator && <button onClick={() => setIsEditing(true)} className="text-gray-300 hover:text-red-800 transition-colors text-xs">✏️</button>}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleInvite} className="flex-1 py-2.5 bg-red-800 text-white rounded-xl font-bold text-xs hover:bg-red-900 transition-all active:scale-95">{copyText}</button>
          <button onClick={() => onLeave(currentTeam.details.id)} className="px-4 py-2.5 border border-red-900/30 text-red-400 rounded-xl font-bold text-xs hover:bg-red-900/20 transition-all active:scale-95">Ieși</button>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {currentTeam.top.map((m, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${m.member === numePreluat?.toUpperCase().trim() ? "bg-amber-900/20 border border-amber-700/30" : "bg-white/[0.03]"}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                <span className="font-bold text-gray-200 text-sm">{m.member}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-400 text-xs">{parseInt(m.score) || 0} 🏆</span>
                {m.member !== numePreluat?.toUpperCase().trim() && (
                  <>
                    <button onClick={() => onProvoca(m.member, currentTeam.details.id)} className="w-7 h-7 bg-red-800 text-white rounded-lg text-xs hover:bg-red-900 transition-all active:scale-95 flex items-center justify-center" title="Provoacă">⚔️</button>
                    {isCreator && (
                      <button onClick={() => onKick(m.member, currentTeam.details.id)} className="w-7 h-7 bg-white/[0.08] text-gray-400 rounded-lg text-xs hover:bg-red-900/30 hover:text-red-400 transition-all active:scale-95 flex items-center justify-center" title="Elimină din grup">✕</button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {currentTeam.top.length <= 1 && <p className="text-center text-gray-400 text-xs py-4">Invită prieteni să joace!</p>}
        </div>
      </div>
    </div>
  );
};

export default GroupHub;
