import Papa from 'papaparse';
import { normalize } from './text';
import { IDENTITY_FIELDS } from '../data/fieldsConfig';
import { ALL_ATTRS } from '../data/attributesConfig';

const ALL_FIELD_DEFS = [
  ...IDENTITY_FIELDS.map(f => ({ key: f.key, aliases: f.aliases, kind: 'identity' })),
  ...ALL_ATTRS.map(a => ({ key: a.key, aliases: a.aliases, kind: 'attribute' }))
];

// Construit, pour chaque en-tête du CSV, la clé interne correspondante (ou null si inconnue)
export function buildHeaderMap(headers) {
  const map = {};
  const usedKeys = new Set();
  headers.forEach(header => {
    const normHeader = normalize(header);
    const match = ALL_FIELD_DEFS.find(def =>
      !usedKeys.has(def.key) && def.aliases.some(alias => normalize(alias) === normHeader)
    );
    if (match) {
      map[header] = match;
      usedKeys.add(match.key);
    } else {
      map[header] = null;
    }
  });
  return map;
}

function parseNumberLike(value) {
  if (value === undefined || value === null || value === '') return null;
  const str = String(value).replace(',', '.').trim();
  const num = parseFloat(str);
  return Number.isNaN(num) ? value : num;
}

function parseCsv(file, { requirePoste }) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          const headerMap = buildHeaderMap(headers);
          const unmatched = headers.filter(h => !headerMap[h]);

          const players = results.data.map((row, idx) => {
            const player = {
              rowIndex: idx,
              attributes: {}
            };
            headers.forEach(header => {
              const def = headerMap[header];
              if (!def) return;
              const rawValue = row[header];
              if (def.kind === 'identity') {
                player[def.key] = rawValue?.toString().trim() ?? '';
              } else {
                player.attributes[def.key] = parseNumberLike(rawValue);
              }
            });
            return player;
          }).filter(p => p.nom); // on ignore les lignes sans nom

          // id stable = nom normalisé (+ suffixe si doublon)
          const seen = new Map();
          players.forEach(p => {
            const base = normalize(p.nom);
            const count = seen.get(base) || 0;
            seen.set(base, count + 1);
            p.id = count === 0 ? base : `${base}-${count}`;
          });

          const hasNomColumn = Object.values(headerMap).some(d => d && d.key === 'nom');
          const hasPosteColumn = Object.values(headerMap).some(d => d && d.key === 'poste');
          const posteLabel = IDENTITY_FIELDS.find(f => f.key === 'poste')?.label || 'Meilleur poste';

          resolve({
            players,
            unmatchedHeaders: unmatched,
            missingRequired: [
              ...(!hasNomColumn ? ['Nom'] : []),
              ...(requirePoste && !hasPosteColumn ? [posteLabel] : [])
            ]
          });
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
}

export function parseCsvFile(file) {
  return parseCsv(file, { requirePoste: true });
}

// Import "Newgens" : seule la colonne Nom/Joueur est obligatoire (pas de poste attendu).
export function parseNewgensCsvFile(file) {
  return parseCsv(file, { requirePoste: false });
}
