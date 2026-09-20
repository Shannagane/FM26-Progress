import { getPositionColor } from '../../data/positionOrder.js';
import './JerseyNumberBadge.css';

export default function JerseyNumberBadge({ numero, poste, size = 38 }) {
  const color = getPositionColor(poste);

  return (
    <div
      className={`jersey-badge jersey-badge-${color}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {numero ? numero : '–'}
    </div>
  );
}
