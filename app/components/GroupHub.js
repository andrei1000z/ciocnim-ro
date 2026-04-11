"use client";

import { memo, useState, useEffect } from "react";
import { safeCopy } from "../lib/utils";
import { useT } from "@/app/i18n/useT";

const GroupHub = ({ teams, activeTeamIndex, setActiveTeamIndex, numePreluat, onLeave, onRename, onProvoca, onKick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const t = useT();
  const [copyText, setCopyText] = useState(t('groups.invite'));
  const currentTeam = teams?.[activeTeamIndex];
  const [newName, setNewName] = useState(currentTeam?.details?.nume || "");
  const isCreator = currentTeam?.details?.creator === numePreluat?.toUpperCase().trim();

  useEffect(() => {
    if (currentTeam) { setNewName(currentTeam.details.nume); setIsEditing(false); }
  }, [activeTeamIndex]);

  if (!teams || teams.length === 0) return null;

  const handleSave = () => { onRename(currentTeam.details.id, newName); setIsEditing(false); };

  const handleInvite = async () => {
    const url = `${window.location.origin}/?joinTeam=${currentTeam.details.id}`;
    const shareText = t('groups.shareInvite', { url });
    if (navigator.share) {
      try { await navigator.share({ title: t('groups.shareTitle'), text: shareText, url }); } catch {}
    } else {
      safeCopy(shareText);
      setCopyText(t('groups.copied'));
      setTimeout(() => setCopyText(t('groups.invite')), 2000);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-red-900/20 bg-card shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-900/10 bg-red-900/20">
        <span className="font-bold text-heading text-sm">{t('groups.myGroup')}</span>
        {teams.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => setActiveTeamIndex(p => (p - 1 + teams.length) % teams.length)} className="w-6 h-6 bg-red-800 text-white rounded-full text-xs hover:bg-red-900 transition-all flex items-center justify-center" aria-label={t('groups.previousGroup')}>◀</button>
            <span className="text-xs text-dim font-semibold">{activeTeamIndex + 1}/{teams.length}</span>
            <button onClick={() => setActiveTeamIndex(p => (p + 1) % teams.length)} className="w-6 h-6 bg-red-800 text-white rounded-full text-xs hover:bg-red-900 transition-all flex items-center justify-center" aria-label={t('groups.nextGroup')}>▶</button>
          </div>
        )}
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          {isEditing && isCreator ? (
            <div className="flex gap-2 flex-1 min-w-0">
              <label className="sr-only" htmlFor="group-rename-input">{t('groups.editName')}</label>
              <input id="group-rename-input" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-edge-strong rounded-xl text-sm font-bold text-body outline-none focus:border-red-800 bg-elevated" />
              <button onClick={handleSave} className="px-3 py-2 bg-red-800 text-white rounded-xl text-sm font-bold hover:bg-red-900 transition-all">OK</button>
              <button onClick={() => setIsEditing(false)} className="px-2.5 py-2 bg-elevated-hover rounded-xl text-sm hover:bg-overlay transition-all text-dim" aria-label={t('groups.cancelEdit')}>✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-heading text-sm">{currentTeam.details.nume}</span>
              {isCreator && <button onClick={() => setIsEditing(true)} className="text-body hover:text-red-800 transition-colors text-xs" aria-label={t('groups.editName')}>✏️</button>}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleInvite} className="flex-1 py-2.5 bg-red-800 text-white rounded-xl font-bold text-xs hover:bg-red-900 transition-all active:scale-95">{copyText}</button>
          <button onClick={() => onLeave(currentTeam.details.id)} className="px-4 py-2.5 border border-red-900/30 text-red-400 rounded-xl font-bold text-xs hover:bg-red-900/20 transition-all active:scale-95">{t('groups.leave')}</button>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {currentTeam.top.map((m, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${m.member === numePreluat?.toUpperCase().trim() ? "bg-amber-900/20 border border-amber-700/30" : "bg-card"}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-dim w-4">{i + 1}.</span>
                <span className="font-bold text-body text-sm">{m.member}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-400 text-xs">{parseInt(m.score) || 0} 🏆</span>
                {m.member !== numePreluat?.toUpperCase().trim() && (
                  <>
                    <button onClick={() => onProvoca(m.member, currentTeam.details.id)} className="w-7 h-7 bg-red-800 text-white rounded-lg text-xs hover:bg-red-900 transition-all active:scale-95 flex items-center justify-center" title="Provoacă" aria-label={t('groups.challenge')}>⚔️</button>
                    {isCreator && (
                      <button onClick={() => onKick(m.member, currentTeam.details.id)} className="w-7 h-7 bg-elevated-hover text-dim rounded-lg text-xs hover:bg-red-900/30 hover:text-red-400 transition-all active:scale-95 flex items-center justify-center" title="Elimină din grup" aria-label={t('groups.kick')}>✕</button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {currentTeam.top.length <= 1 && <p className="text-center text-dim text-xs py-4">{t('groups.inviteFriends')}</p>}
        </div>
      </div>
    </div>
  );
};

export default memo(GroupHub);
