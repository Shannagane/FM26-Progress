import React from 'react';
import { FORMATIONS } from '../../data/formations.js';
import DepthModalShell from './DepthModalShell.jsx';

// Mini-terrain schématique : reprend les coordonnées x/y réelles des postes de la formation
// (les mêmes que le grand terrain), juste rendues en petits points blancs.
function MiniPitch({ formation }) {
  return (
    <div className="depth-config-mini-pitch">
      <div className="depth-config-mini-line depth-config-mini-halfway" />
      {formation.slots.map((slot, i) => (
        <span key={i} className="depth-config-mini-dot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }} />
      ))}
    </div>
  );
}

export default function DepthFormationModal({ formationKey, onSelectFormation, summary, onCancel, onApply }) {
  return (
    <DepthModalShell title="FORMATION" summary={summary} onCancel={onCancel} onApply={onApply}>
      <section className="depth-config-block">
        <h3 className="depth-config-block-title">Formation de référence</h3>
        <div className="depth-config-formation-grid">
          {FORMATIONS.map(f => (
            <button
              type="button"
              key={f.key}
              className={`depth-config-formation-card ${formationKey === f.key ? 'depth-config-formation-card-active' : ''}`}
              onClick={() => onSelectFormation(f.key)}
            >
              {formationKey === f.key && <span className="depth-config-check">✓</span>}
              <MiniPitch formation={f} />
              <span className="depth-config-formation-label">{f.label}</span>
              <span className="depth-config-formation-tag">{f.tag}</span>
            </button>
          ))}
        </div>
      </section>
    </DepthModalShell>
  );
}
