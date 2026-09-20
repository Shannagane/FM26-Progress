import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ProgressChart.css';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
  } catch {
    return iso;
  }
}

// `attrLabel` absent = courbe de progression globale (somme des écarts de tous les
// attributs depuis le premier import, échelle libre). `attrLabel` présent = courbe d'un
// attribut précis (échelle fixe 1-20, comme sa valeur en jeu).
export default function ProgressChart({ attrLabel, history }) {
  const label = attrLabel || 'Progression totale';

  if (history.length < 2) {
    return (
      <div className="progress-chart progress-chart-empty">
        {attrLabel
          ? `Pas encore assez d'imports pour tracer la progression de « ${attrLabel} ». Importe un nouveau CSV plus tard.`
          : "Pas encore assez d'imports pour tracer la progression globale de ce joueur. Importe un nouveau CSV plus tard."}
      </div>
    );
  }

  const data = history.map(h => ({ date: formatDate(h.gameDate), csvName: h.csvName, value: h.value }));

  return (
    <div className="progress-chart">
      <h4 className="progress-chart-title">Progression · {label}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
          <YAxis domain={attrLabel ? [1, 20] : ['auto', 'auto']} stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-secondary)' }}
            formatter={(value) => [value, label]}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.csvName ? `${payload[0].payload.csvName} · ${label}` : label}
          />
          <Line type="monotone" dataKey="value" stroke="var(--blue-600)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--blue-600)' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
