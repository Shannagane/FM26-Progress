import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { TECHNIQUE_ATTRS, MENTAL_ATTRS, PHYSIQUE_ATTRS, GARDIEN_ATTRS } from '../../data/attributesConfig.js';
import { isGoalkeeper } from '../../data/positionOrder.js';
import { getPlayerSnapshots } from '../../utils/storage.js';
import './AttributeRadar.css';

// Moyenne des attributs d'un tableau (Technique/Mental/Physique/Gardien), en ignorant les
// attributs absents du CSV plutôt que de les compter comme 0.
function average(attrs, attributes) {
  const values = attrs
    .map(a => attributes?.[a.key])
    .filter(v => v !== undefined && v !== null && v !== '')
    .map(Number)
    .filter(v => !Number.isNaN(v));
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function raw(key, attributes) {
  const v = attributes?.[key];
  if (v === undefined || v === null || v === '') return null;
  const num = Number(v);
  return Number.isNaN(num) ? null : num;
}

function buildGeneralAxes(attributes, isGK) {
  return isGK
    ? [
        { axis: 'Gardien', value: average(GARDIEN_ATTRS, attributes) },
        { axis: 'Mental', value: average(MENTAL_ATTRS, attributes) },
        { axis: 'Physique', value: average(PHYSIQUE_ATTRS, attributes) }
      ]
    : [
        { axis: 'Technique', value: average(TECHNIQUE_ATTRS, attributes) },
        { axis: 'Mental', value: average(MENTAL_ATTRS, attributes) },
        { axis: 'Physique', value: average(PHYSIQUE_ATTRS, attributes) }
      ];
}

function buildKeyAxes(attributes, isGK) {
  return isGK
    ? [
        { axis: 'Réflexes', value: raw('reflexes', attributes) },
        { axis: 'Agilité', value: raw('agilite', attributes) },
        { axis: 'Accélération', value: raw('acceleration', attributes) },
        { axis: 'Un contre un', value: raw('un_contre_un', attributes) },
        { axis: 'Communication', value: raw('communication', attributes) },
        { axis: 'Prises de balle', value: raw('prises_de_balle', attributes) },
        { axis: 'Sorties dans la surface', value: raw('sorties_dans_la_surface', attributes) },
        { axis: 'Anticipation', value: raw('anticipation', attributes) },
        { axis: 'Concentration', value: raw('concentration', attributes) },
        { axis: 'Placement', value: raw('placement', attributes) }
      ]
    : [
        { axis: 'Accélération', value: raw('acceleration', attributes) },
        { axis: 'Vitesse', value: raw('vitesse', attributes) },
        { axis: 'Dribbles', value: raw('dribbles', attributes) },
        { axis: 'Anticipation', value: raw('anticipation', attributes) },
        { axis: 'Détente verticale', value: raw('detente_verticale', attributes) },
        { axis: 'Endurance', value: raw('endurance', attributes) }
      ];
}

// Étiquette d'axe personnalisée : le nom de la catégorie en gris, sa note en vert et en
// gras juste à côté (sur le côté) ou en dessous (en haut/bas du diagramme).
function CategoryTick({ x, y, cx, cy, payload, textAnchor, values, index }) {
  const value = values[index];
  const display = value === null ? '–' : value;
  const isVertical = Math.abs(x - cx) < 1;

  if (isVertical) {
    const isTop = y < cy;
    return (
      <g transform={`translate(${x},${y})`}>
        <text textAnchor="middle" dy={isTop ? -16 : 20} className="radar-tick-label">{payload.value}</text>
        <text textAnchor="middle" dy={isTop ? 0 : 40} className="radar-tick-value">{display}</text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor={textAnchor} dy={4} className="radar-tick-label">
        {payload.value}{'  '}
        <tspan className="radar-tick-value">{display}</tspan>
      </text>
    </g>
  );
}

// Un diagramme radar : liste d'axes { axis, value }, tous sur l'échelle 1-20 du jeu.
// Superpose, en gris clair pointillé, les valeurs du même joueur à son tout premier import
// (quand disponibles) pour visualiser la progression d'un coup d'œil.
// Ne s'affiche pas si aucun axe n'a de valeur (CSV incomplet).
function RadarBlock({ title, axes, prevAxes }) {
  if (!axes.some(a => a.value !== null)) return null;

  const values = axes.map(a => (a.value === null ? null : Math.round(a.value * 10) / 10));
  const hasPrev = !!prevAxes && prevAxes.some(a => a.value !== null);
  const prevValues = hasPrev ? prevAxes.map(a => (a.value === null ? null : Math.round(a.value * 10) / 10)) : null;

  const data = axes.map((a, i) => ({
    axis: a.axis,
    value: values[i] ?? 0,
    ...(hasPrev ? { prevValue: prevValues[i] ?? 0 } : {})
  }));

  return (
    <div className="attribute-radar">
      <h4 className="attribute-radar-title">{title}</h4>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={data} outerRadius="48%" margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="var(--radar-grid)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={<CategoryTick values={values} />}
          />
          <PolarRadiusAxis domain={[0, 20]} tick={false} axisLine={false} tickLine={false} />
          {hasPrev && (
            <Radar
              dataKey="prevValue"
              stroke="var(--grey-mid)"
              fill="var(--grey-mid)"
              fillOpacity={0.25}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={{ r: 3, fill: 'var(--grey-mid)', stroke: 'var(--surface)', strokeWidth: 1 }}
              isAnimationActive={false}
            />
          )}
          <Radar
            dataKey="value"
            stroke="var(--green)"
            fill="var(--green)"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{ r: 4, fill: 'var(--green)', stroke: 'var(--surface)', strokeWidth: 1 }}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Deux diagrammes radar sur l'onglet "Diagramme" : un profil général (Technique/Mental/
// Physique, ou Gardien/Mental/Physique pour un gardien) et une sélection d'attributs clés
// bruts, différente selon le poste. Le tout premier import du joueur est superposé en gris
// pointillé quand il existe, pour comparer visuellement avec l'import actuel (en vert).
export default function AttributeRadar({ player, snapshots }) {
  const isGK = isGoalkeeper(player.poste);
  const attributes = player.attributes || {};

  const history = getPlayerSnapshots(snapshots, player.id);
  const firstAttributes = history.length >= 2 ? history[0].player.attributes : null;
  const hasPrevious = !!firstAttributes;

  const generalAxes = buildGeneralAxes(attributes, isGK);
  const generalPrevAxes = hasPrevious ? buildGeneralAxes(firstAttributes, isGK) : null;

  const keyAxes = buildKeyAxes(attributes, isGK);
  const keyPrevAxes = hasPrevious ? buildKeyAxes(firstAttributes, isGK) : null;

  return (
    <div>
      {hasPrevious && (
        <div className="attribute-radar-legend">
          <span className="radar-legend-item">
            <span className="radar-legend-swatch radar-legend-swatch-current" />
            Actuel
          </span>
          <span className="radar-legend-item">
            <span className="radar-legend-swatch radar-legend-swatch-prev" />
            1er import
          </span>
        </div>
      )}
      <div className="attribute-radar-grid">
        <RadarBlock title="Général" axes={generalAxes} prevAxes={generalPrevAxes} />
        <RadarBlock title="Attributs importants" axes={keyAxes} prevAxes={keyPrevAxes} />
      </div>
    </div>
  );
}
