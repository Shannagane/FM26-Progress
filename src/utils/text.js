// Normalise une chaîne pour comparaison tolérante (accents, casse, espaces)
export function normalize(str) {
  return (str ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

// Les champs numériques sont stockés en texte brut par le parseur CSV et utilisent parfois
// la virgule française comme séparateur décimal (ex : "7,45") : on la convertit en point
// avant conversion en nombre, sinon Number() renvoie NaN pour toutes les valeurs.
export function parseNumericValue(raw) {
  if (raw === '' || raw === undefined || raw === null) return null;
  const num = Number(String(raw).trim().replace(',', '.'));
  return Number.isNaN(num) ? null : num;
}

