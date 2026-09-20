import { TIER_LEGEND } from '../../data/attributeHighlights.js';
import './AttributeLegend.css';

export default function AttributeLegend() {
  return (
    <div className="attribute-legend">
      {TIER_LEGEND.map(item => (
        <div className="attribute-legend-item" key={item.tier}>
          <span className={`attribute-legend-swatch attribute-legend-swatch-${item.tier}`} />
          <span className="attribute-legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
