import { getAttributeDeltas } from './attributeProgress';

// Construit une synthèse sur l'évolution du joueur entre les deux derniers imports,
// sous forme de segments typés (positif / négatif / neutre) afin que l'affichage
// puisse colorer le texte en conséquence (vert = positif, rouge = négatif).
// Renvoie un tableau de { tone: 'positive' | 'negative' | 'neutral', text: string }.
export function buildProgressComment(snapshots, playerId, prenomNom) {
  const { deltas, total, importCount } = getAttributeDeltas(snapshots, playerId);

  if (importCount === 0) {
    return [{ tone: 'neutral', text: 'Aucune donnée disponible pour ce joueur.' }];
  }
  if (importCount === 1) {
    return [{
      tone: 'neutral',
      text: `Premier import enregistré pour ${prenomNom}. Importe un nouveau CSV après quelques matchs pour voir apparaître sa courbe de progression.`
    }];
  }

  if (deltas.length === 0) {
    return [{ tone: 'neutral', text: `Aucun changement d'attribut détecté pour ${prenomNom} depuis le dernier import.` }];
  }

  const gains = deltas.filter(d => d.delta > 0).sort((a, b) => b.delta - a.delta);
  const drops = deltas.filter(d => d.delta < 0).sort((a, b) => a.delta - b.delta);

  const segments = [];

  if (gains.length > 0) {
    const top = gains.slice(0, 3).map(g => `${g.label} (+${g.delta})`).join(', ');
    segments.push({ tone: 'positive', text: `${prenomNom} progresse surtout en ${top}.` });
  }
  if (drops.length > 0) {
    const top = drops.slice(0, 2).map(d => `${d.label} (${d.delta})`).join(', ');
    segments.push({ tone: 'negative', text: `En revanche, on note une baisse en ${top}.` });
  }

  let trendTone = 'neutral';
  let trendText;
  if (total > 3) { trendTone = 'positive'; trendText = 'Le bilan global depuis le dernier import est très positif.'; }
  else if (total > 0) { trendTone = 'positive'; trendText = 'Le bilan global depuis le dernier import est légèrement positif.'; }
  else if (total === 0) { trendTone = 'neutral'; trendText = "Le bilan global est stable sur l'ensemble des attributs."; }
  else if (total > -3) { trendTone = 'negative'; trendText = 'Le bilan global marque un léger recul depuis le dernier import.'; }
  else { trendTone = 'negative'; trendText = 'Le bilan global montre un net recul depuis le dernier import, à surveiller.'; }

  segments.push({ tone: trendTone, text: trendText });

  return segments;
}
