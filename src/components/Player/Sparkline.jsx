import './Sparkline.css';

// Petite flèche inline indiquant si un attribut a globalement progressé ou régressé sur
// tous ses imports, pour repérer en un coup d'œil ce qui bouge sans cliquer dessus.
export default function Sparkline({ history }) {
  if (!history || history.length < 2) return null;

  const values = history.map(h => h.value);
  const trend = values[values.length - 1] - values[0];
  if (trend === 0) return null;

  const isUp = trend > 0;

  return (
    <svg
      className={`sparkline ${isUp ? 'sparkline-positive' : 'sparkline-negative'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {isUp ? (
        <path d="M5 17 19 3M19 3H10M19 3v9" />
      ) : (
        <path d="M5 7 19 21M19 21H10M19 21v-9" />
      )}
    </svg>
  );
}
