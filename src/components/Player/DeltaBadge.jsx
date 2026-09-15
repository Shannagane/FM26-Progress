import React from 'react';
import './DeltaBadge.css';

export default function DeltaBadge({ delta }) {
  if (delta === null || delta === undefined || delta === 0) return null;
  const positive = delta > 0;
  return (
    <span className={`delta-badge ${positive ? 'delta-up' : 'delta-down'}`}>
      {positive ? `+${delta}` : delta}
    </span>
  );
}
