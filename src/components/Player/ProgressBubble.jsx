import React from 'react';
import './ProgressBubble.css';

export default function ProgressBubble({ total, importCount }) {
  if (importCount < 2) return null;

  const sign = total > 0 ? '+' : '';
  const tone = total > 0 ? 'positive' : total < 0 ? 'negative' : 'neutral';

  return (
    <div className={`progress-bubble progress-bubble-${tone}`}>
      <span className="progress-bubble-title">PROGRESSION</span>
      <span className="progress-bubble-value">{sign}{total}</span>
    </div>
  );
}
