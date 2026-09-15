import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { TECHNIQUE_ATTRS, MENTAL_ATTRS, PHYSIQUE_ATTRS, GARDIEN_ATTRS } from '../../data/attributesConfig.js';
import { isGoalkeeper } from '../../data/positionOrder.js';
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

// Diagramme radar résumant le profil du joueur : 3 moyennes de catégorie (Technique/
// Mental/Physique, ou Gardien/Mental/Physique pour un gardien) + une sélection d'attributs
// clés bruts, tous sur l'échelle 1-20 du jeu.
export default function AttributeRadar({ player }) {
  const isGK = isGoalkeeper(player.poste);
  const attributes = player.attributes || {};

  const axes = isGK
    ? [
        { axis: 'Gardien', value: average(GARDIEN_ATTRS, attributes) },
        { axis: 'Mental', value: average(MENTAL_ATTRS, attributes) },
        { axis: 'Physique', value: average(PHYSIQUE_ATTRS, attributes) },
        { axis: 'Réflexes', value: raw('reflexes', attributes) },
        { axis: 'Agilité', value: raw('agilite', attributes) },
        { axis: 'Accélération', value: raw('acceleration', attributes) },
        { axis: 'Un contre un', value: raw('un_contre_un', attributes) }
      ]
    : [
        { axis: 'Technique', value: average(TECHNIQUE_ATTRS, attributes) },
        { axis: 'Mental', value: average(MENTAL_ATTRS, attributes) },
        { axis: 'Physique', value: average(PHYSIQUE_ATTRS, attributes) },
        { axis: 'Dribbles', value: raw('dribbles', attributes) },
        { axis: 'Anticipation', value: raw('anticipation', attributes) },
        { axis: 'Accélération', value: raw('acceleration', attributes) },
        { axis: 'Détente verticale', value: raw('detente_verticale', attributes) },
        { axis: 'Vitesse', value: raw('vitesse', attributes) },
        { axis: 'Endurance', value: raw('endurance', attributes) }
      ];

  if (!axes.some(a => a.value !== null)) return null;

  const values = axes.map(a => (a.value === null ? null : Math.round(a.value * 10) / 10));
  const data = axes.map((a, i) => ({ axis: a.axis, value: values[i] ?? 0 }));

  return (
    <div className="attribute-radar">
      <h4 className="attribute-radar-title">Profil du joueur</h4>
      <ResponsiveContainer width="100%" height={420}>
        <RadarChart data={data} outerRadius="62%">
          <PolarGrid stroke="var(--radar-grid)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={<CategoryTick values={values} />}
          />
          <PolarRadiusAxis domain={[0, 20]} tick={false} axisLine={false} tickLine={false} />
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
