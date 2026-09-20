import { useState } from 'react';
import { FOUR_DEFENDER_FORMATIONS, THREE_DEFENDER_FORMATIONS, FORMATIONS } from '../../data/formations.js';
import DepthModalShell from './DepthModalShell.jsx';

// Mini-terrain schématique (aperçu, non interactif) : reprend les coordonnées x/y réelles des
// postes de la formation, rendues en petits points blancs sur fond noir.
function MiniPitch({ slots }) {
  return (
    <div className="depth-config-mini-pitch">
      <div className="depth-config-mini-line depth-config-mini-halfway" />
      {slots.map((slot, i) => (
        <span key={i} className="depth-config-mini-dot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }} />
      ))}
    </div>
  );
}

function FormationCard({ formation, active, onSelect }) {
  return (
    <button
      type="button"
      className={`depth-config-formation-card ${active ? 'depth-config-formation-card-active' : ''}`}
      onClick={() => onSelect(formation.key)}
    >
      {active && <span className="depth-config-check">✓</span>}
      <h2 className="depth-config-formation-label">{formation.label}</h2>
      <span className="depth-config-formation-tag">{formation.tag}</span>
      <MiniPitch slots={formation.slots} />
    </button>
  );
}

// Choix en brouillon tant qu'on n'a pas cliqué "Appliquer" (résumé live dans le footer) : la
// formation réellement affiquée sur le terrain (prop `formationKey`) n'est modifiée qu'au
// moment d'onApply — "Annuler"/la croix referment sans rien changer, l'état brouillon
// disparaissant simplement avec le démontage de la modale.
export default function DepthFormationModal({
  formationKey, club, onApply, onClose
}) {
  const [draftKey, setDraftKey] = useState(formationKey);
  const draftFormation = FORMATIONS.find(f => f.key === draftKey) || FORMATIONS[0];
  const summary = `${club || 'Aucun club'} • ${draftFormation.label}`;

  function handleApply() {
    onApply(draftKey);
  }

  return (
    <DepthModalShell title="FORMATION" summary={summary} onCancel={onClose} onApply={handleApply} onClose={onClose}>
      <section className="depth-config-block">
        <h3 className="depth-config-block-title">Système à 4 défenseurs</h3>
        <div className="depth-config-formation-grid">
          {FOUR_DEFENDER_FORMATIONS.map(f => (
            <FormationCard
              key={f.key}
              formation={f}
              active={draftKey === f.key}
              onSelect={setDraftKey}
            />
          ))}
        </div>
      </section>

      <section className="depth-config-block">
        <h3 className="depth-config-block-title">Système à 3 défenseurs</h3>
        <div className="depth-config-formation-grid">
          {THREE_DEFENDER_FORMATIONS.map(f => (
            <FormationCard
              key={f.key}
              formation={f}
              active={draftKey === f.key}
              onSelect={setDraftKey}
            />
          ))}
        </div>
      </section>
    </DepthModalShell>
  );
}
