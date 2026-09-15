import { ATTR_BY_KEY } from '../data/attributesConfig';
import { getPlayerSnapshots } from './storage';

// Calcule, pour chaque attribut, l'écart entre les deux derniers imports d'un joueur.
// Renvoie la liste des écarts non nuls et leur somme totale (la "progression" globale).
export function getAttributeDeltas(snapshots, playerId) {
  const history = getPlayerSnapshots(snapshots, playerId);
  if (history.length < 2) {
    return { deltas: [], total: 0, importCount: history.length };
  }

  const last = history[history.length - 1].player;
  const prev = history[history.length - 2].player;
  const deltas = [];

  Object.keys(ATTR_BY_KEY).forEach(key => {
    const a = last.attributes?.[key];
    const b = prev.attributes?.[key];
    if (a === undefined || a === null || b === undefined || b === null) return;
    const delta = Number(a) - Number(b);
    if (!Number.isNaN(delta) && delta !== 0) {
      deltas.push({ key, label: ATTR_BY_KEY[key].label, delta });
    }
  });

  const total = deltas.reduce((sum, d) => sum + d.delta, 0);
  return { deltas, total, importCount: history.length };
}
