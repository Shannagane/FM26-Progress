import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ProgressChart.css';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
  } catch {
    return iso;
  }
}

export default function ProgressChart({ attrLabel, history }) {
  if (!attrLabel) {
    return (
      <div className="progress-chart progress-chart-empty">
        Clique sur un attribut dans les tableaux ci-dessous pour afficher sa courbe de progression.
      </div>
    );
  }

  if (history.length < 2) {
    return (
      <div className="progress-chart progress-chart-empty">
        Pas encore assez d'imports pour tracer la progression de « {attrLabel} ». Importe un nouveau CSV plus tard.
      </div>
    );
  }

  const data = history.map(h => ({ date: formatDate(h.gameDate), csvName: h.csvName, value: h.value }));

  return (
    <div className="progress-chart">
      <h4 className="progress-chart-title">Progression · {attrLabel}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
          <YAxis domain={[1, 20]} stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-secondary)' }}
            formatter={(value) => [value, attrLabel]}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.csvName ? `${payload[0].payload.csvName} · ${label}` : label}
          />
          <Line type="monotone" dataKey="value" stroke="#1D4ED8" strokeWidth={2.5} dot={{ r: 4, fill: '#1D4ED8' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
