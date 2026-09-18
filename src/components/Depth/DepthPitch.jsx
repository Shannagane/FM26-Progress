import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { EXACT_POSITION_LABELS, FORMATIONS } from '../../data/formations.js';
import { formatTransferValue } from '../../utils/transferValue.js';
import { scoreTier } from '../../data/newgensPositionProfiles.js';
import './DepthPitch.css';

function shortName(nom) {
  const parts = (nom || '').trim().split(/\s+/);
  if (parts.length < 2) return nom || '–';
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

function initialsOf(nom) {
  const parts = (nom || '').trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function scoreStars(percent) {
  return Math.max(0, Math.min(5, Math.round((percent / 100) * 5)));
}

function Tooltip({ hovered }) {
  if (!hovered) return null;
  const { entry, code, coords } = hovered;
  const { player, percent, scoreLabel } = entry;
  return createPortal(
    <div className="pitch-tooltip" style={{ top: coords.top, left: coords.left }}>
      <div className="pitch-tooltip-name">{player.nom} • {player.age || '–'} ans</div>
      <div className="pitch-tooltip-line">
        {code} • {EXACT_POSITION_LABELS[code]}
        {player.valeur_transfert ? ` • ${formatTransferValue(player.valeur_transfert)}` : ''}
      </div>
      <div className="pitch-tooltip-line">
        Note moy. : {player.note_moyenne || '–'} • {player.matchs_joues || '0'} matchs
      </div>
      <div className={`pitch-tooltip-score pitch-text-${scoreTier(percent, 100)}`}>
        Score au poste : {scoreLabel}
      </div>
    </div>,
    document.body
  );
}

function BenchAvatar({ entry, code, offset, onSelect, onHover, onLeave }) {
  const tier = scoreTier(entry.percent, 100);
  return (
    <button
      type="button"
      className={`pitch-avatar pitch-avatar-bench pitch-avatar-${tier}`}
      style={{ '--offset': offset }}
      onClick={e => { e.stopPropagation(); onSelect(entry); }}
      onMouseEnter={e => onHover(entry, code, e.currentTarget)}
      onMouseLeave={onLeave}
    >
      {initialsOf(entry.player.nom)}
    </button>
  );
}

function PitchSlot({ slot, isLocked, onSelectSlot }) {
  const { code, main, bench, status } = slot;
  const [hover, setHover] = useState(null);

  function handleHover(entry, slotCode, el) {
    const rect = el.getBoundingClientRect();
    setHover({ entry, code: slotCode, coords: clampTooltip(rect) });
  }
  const clearHover = () => setHover(null);

  const mainTier = main ? scoreTier(main.percent, 100) : null;
  const stars = main ? scoreStars(main.percent) : 0;

  return (
    <div
      className={`pitch-slot pitch-slot-${status.tier} ${isLocked ? 'pitch-slot-locked' : ''}`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      <div className="pitch-avatar-cluster">
        {bench.map((entry, i) => (
          <BenchAvatar
            key={entry.player.id}
            entry={entry}
            code={code}
            offset={i + 1}
            onSelect={e => onSelectSlot(slot, e)}
            onHover={handleHover}
            onLeave={clearHover}
          />
        ))}
        {main ? (
          <button
            type="button"
            className={`pitch-avatar pitch-avatar-main pitch-avatar-${mainTier}`}
            onClick={e => { e.stopPropagation(); onSelectSlot(slot, main); }}
            onMouseEnter={e => handleHover(main, code, e.currentTarget)}
            onMouseLeave={clearHover}
          >
            {initialsOf(main.player.nom)}
          </button>
        ) : (
          <button
            type="button"
            className="pitch-avatar pitch-avatar-empty"
            onClick={e => { e.stopPropagation(); onSelectSlot(slot, null); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 8v8M8 12h8" />
            </svg>
          </button>
        )}
      </div>

      {main ? (
        <>
          <span className={`pitch-stars pitch-text-${mainTier}`}>
            {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
          </span>
          <span className="pitch-badge">
            <span className={`pitch-badge-code pitch-bg-${mainTier}`}>{code}</span>
            <span className="pitch-badge-name">{shortName(main.player.nom)}</span>
          </span>
        </>
      ) : (
        <span className="pitch-badge pitch-badge-empty">
          <span className="pitch-badge-code pitch-bg-red">{code}</span>
          <span className="pitch-badge-name">Vide</span>
        </span>
      )}

      <Tooltip hovered={hover} />
    </div>
  );
}

function clampTooltip(rect) {
  const width = 240;
  const margin = 10;
  let left = rect.right + 12;
  if (left + width > window.innerWidth - margin) left = rect.left - width - 12;
  if (left < margin) left = margin;
  let top = rect.top;
  if (top + 120 > window.innerHeight - margin) top = window.innerHeight - 120 - margin;
  return { top, left };
}

export default function DepthPitch({ formation, slots, lockedSlotId, onSelectSlot, onClear }) {
  const isDefaultFormation = formation && FORMATIONS[0].key === formation.key;
  const title = formation
    ? `XI Type — ${formation.label} ${formation.tag || ''}${isDefaultFormation ? ' (par défaut)' : ''}`
    : 'XI Type';

  return (
    <div className="pitch-wrap">
      <div className="pitch-topbar">
        <span className="pitch-topbar-title">{title.toUpperCase()}</span>
        <span className="pitch-topbar-live">
          <span className="pitch-live-dot" />
          LIVE
        </span>
      </div>

      <div className="pitch-field" onClick={onClear}>
        <div className="pitch-lines">
          <div className="pitch-border" />
          <div className="pitch-corner pitch-corner-tl" />
          <div className="pitch-corner pitch-corner-tr" />
          <div className="pitch-corner pitch-corner-bl" />
          <div className="pitch-corner pitch-corner-br" />
          <div className="pitch-halfway" />
          <div className="pitch-center-circle" />
          <div className="pitch-center-spot" />
          <div className="pitch-box pitch-box-top" />
          <div className="pitch-box-small pitch-box-small-top" />
          <div className="pitch-box pitch-box-bottom" />
          <div className="pitch-box-small pitch-box-small-bottom" />
        </div>
        {slots.map(slot => (
          <PitchSlot
            key={slot.id}
            slot={slot}
            isLocked={lockedSlotId === slot.id}
            onSelectSlot={onSelectSlot}
          />
        ))}
      </div>
    </div>
  );
}
