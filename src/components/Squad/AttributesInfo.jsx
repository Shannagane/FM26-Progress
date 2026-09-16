import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getAttributeColumns, attributeColorClass } from '../../data/attributesConfig.js';
import { isGoalkeeper } from '../../data/positionOrder.js';
import './AttributesInfo.css';

// Petite bulle "i" affichée dans le tableau Effectif : au survol (ou au clic/focus pour le
// tactile et le clavier), affiche tous les attributs du joueur sans avoir à ouvrir sa fiche.
// Rendue via un portail dans <body> et positionnée en `fixed` pour ne pas être rognée par le
// scroll horizontal du tableau (`.squad-table-wrap` a overflow-x: auto, qui force aussi
// overflow-y à se comporter comme "auto" et couperait un tooltip simplement en `absolute`).
export default function AttributesInfo({ player }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);
  const tooltipRef = useRef(null);

  const isGK = isGoalkeeper(player.poste);
  const columns = getAttributeColumns(isGK);
  const attributes = player.attributes || {};
  const metaLine = [player.personnalite, player.rapports_media, player.age ? `${player.age} ans` : null]
    .filter(Boolean)
    .join(' · ');

  useLayoutEffect(() => {
    if (!open || !iconRef.current) return;
    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 520;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 300;
    const margin = 12;

    let left = iconRect.left;
    if (left + tooltipWidth > window.innerWidth - margin) {
      left = window.innerWidth - tooltipWidth - margin;
    }
    if (left < margin) left = margin;

    let top = iconRect.bottom + 8;
    if (top + tooltipHeight > window.innerHeight - margin) {
      top = iconRect.top - tooltipHeight - 8;
      if (top < margin) top = margin;
    }

    setCoords({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (iconRef.current?.contains(e.target)) return;
      if (tooltipRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <span className="attr-info-wrap">
      <button
        type="button"
        ref={iconRef}
        className="attr-info-icon"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        aria-label={`Voir les attributs de ${player.nom || 'ce joueur'}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9.25" />
          <circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none" />
          <path d="M12 11v6.2" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
      </button>
      {open && createPortal(
        <div
          className="attr-info-tooltip"
          style={{ top: coords.top, left: coords.left }}
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="attr-info-header">
            <div className="attr-info-header-top">
              <span className="attr-info-name">{player.nom}</span>
              {player.poste && <span className="attr-info-poste">{player.poste}</span>}
            </div>
            {metaLine && <div className="attr-info-header-meta">{metaLine}</div>}
          </div>
          <div className="attr-info-groups">
            {columns.map((column, colIndex) => (
              <div className="attr-info-column" key={colIndex}>
                {column.map(table => (
                  <div className="attr-info-group" key={table.title}>
                    <h5>{table.title}</h5>
                    <ul>
                      {table.attrs.map(a => {
                        const value = attributes[a.key];
                        return (
                          <li key={a.key}>
                            <span className="attr-info-label">{a.label}</span>
                            <span className={`attr-info-value ${attributeColorClass(value)}`}>{value ?? '–'}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
