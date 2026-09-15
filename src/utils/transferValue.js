// Convertit une valeur de transfert telle qu'exportée par FM26 (ex: "15,5 M €",
// "800 K€", "1 200 000", "€1.2M") en nombre exploitable pour le tri.
// Renvoie null si la valeur est vide ou illisible.
export function parseTransferValue(raw) {
  if (raw === undefined || raw === null) return null;
  const str = raw.toString().trim();
  if (!str) return null;

  const compact = str.replace(/\s/g, '');

  // Nombre "brut" simple, ex: "1200000" ou "1200000.5"
  const directCandidate = compact.replace(/[^\d,.-]/g, '').replace(',', '.');
  if (/^-?\d+(\.\d+)?$/.test(directCandidate) && !/[MK]/i.test(compact)) {
    return parseFloat(directCandidate);
  }

  // Formats avec suffixe multiplicateur, ex: "15,5M€", "800K", "1.2Md"
  const match = compact.match(/([\d.,]+)\s*(md|m|k)?/i);
  if (!match) return null;

  const numPart = match[1].replace(',', '.');
  const num = parseFloat(numPart);
  if (Number.isNaN(num)) return null;

  const suffix = (match[2] || '').toLowerCase();
  if (suffix === 'm') return num * 1_000_000;
  if (suffix === 'md') return num * 1_000_000_000;
  if (suffix === 'k') return num * 1_000;
  return num;
}

// Affichage lisible en euros, ex: 15500000 -> "15 500 000 €"
// Si la valeur n'est pas interprétable comme un nombre, elle est renvoyée telle quelle.
export function formatTransferValue(raw) {
  if (raw === undefined || raw === null || raw === '') return '–';
  const num = parseTransferValue(raw);
  if (num === null) return raw.toString();
  return `${num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
}
