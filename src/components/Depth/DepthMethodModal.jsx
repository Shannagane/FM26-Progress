import React from 'react';
import { NEWGENS_METHODS } from '../../data/newgensPositionProfiles.js';
import DepthModalShell from './DepthModalShell.jsx';

const METHOD_DESCRIPTIONS = {
  fm26: 'Note pondérée par poste, avec pénalité sous 11 pour pénaliser les points faibles.',
  polynomial: 'Score polynomial (coefficients par attribut), sans pénalité sous 11.'
};

export default function DepthMethodModal({ method, onSelectMethod, summary, onCancel, onApply }) {
  return (
    <DepthModalShell title="MÉTHODE D'ÉVALUATION" summary={summary} onCancel={onCancel} onApply={onApply}>
      <section className="depth-config-block">
        <h3 className="depth-config-block-title">Choisir la méthode</h3>
        <div className="depth-config-method-grid">
          {NEWGENS_METHODS.map(m => (
            <button
              type="button"
              key={m.key}
              className={`depth-config-method-card ${method === m.key ? 'depth-config-method-card-active' : ''}`}
              onClick={() => onSelectMethod(m.key)}
            >
              {method === m.key && <span className="depth-config-check">✓</span>}
              <span className="depth-config-method-label">{m.label}</span>
              <span className="depth-config-method-desc">{METHOD_DESCRIPTIONS[m.key]}</span>
            </button>
          ))}
        </div>
      </section>
    </DepthModalShell>
  );
}
