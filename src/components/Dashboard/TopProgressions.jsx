import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { getAttributeDeltas } from '../../utils/attributeProgress.js';
import './TopProgressions.css';

// Regroupe les joueurs par club (celui de leur import le plus récent) et calcule, pour
// chacun, la même "progression" que sur sa fiche joueur (somme des écarts d'attributs
// entre ses deux derniers imports). Ne garde que les joueurs ayant au moins 2 imports
// (progression non calculable sinon, comme sur la fiche joueur), puis les 5 meilleures et
// les 5 pires progressions par club.
function buildRankingsByClub(players, snapshots) {
  const byClub = new Map();

  players.forEach(player => {
    const { total, importCount } = getAttributeDeltas(snapshots, player.id);
    if (importCount < 2) return;

    const club = player.importClub || 'Sans club';
    if (!byClub.has(club)) byClub.set(club, []);
    byClub.get(club).push({ player, total });
  });

  return Array.from(byClub.entries())
    .map(([club, entries]) => ({
      club,
      best: [...entries].sort((a, b) => b.total - a.total).slice(0, 5),
      worst: [...entries].sort((a, b) => a.total - b.total).slice(0, 5)
    }))
    .filter(group => group.best.length > 0)
    .sort((a, b) => a.club.localeCompare(b.club, 'fr'));
}

function RankingCard({ club, entries }) {
  return (
    <div className="top-progressions-card">
      <h4 className="top-progressions-club">{club}</h4>
      <ol className="top-progressions-list">
        {entries.map(({ player, total }, index) => {
          const tone = total > 0 ? 'positive' : total < 0 ? 'negative' : 'neutral';
          return (
            <li key={player.id}>
              <Link to={`/joueur/${player.id}`} className="top-progressions-row">
                <span className="top-progressions-rank">#{index + 1}</span>
                <span className="top-progressions-name">{player.nom || '–'}</span>
                <span className="top-progressions-poste">{player.poste || '–'}</span>
                <span className={`top-progressions-value top-progressions-value-${tone}`}>
                  {total > 0 ? '+' : ''}{total}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function TopProgressions() {
  const { players, snapshots } = useAppData();

  const groups = useMemo(() => buildRankingsByClub(players, snapshots), [players, snapshots]);

  if (groups.length === 0) return null;

  return (
    <div className="top-progressions-columns">
      <div className="top-progressions">
        <h3 className="top-progressions-title">Top 5 des meilleures progressions par club</h3>
        <div className="top-progressions-grid">
          {groups.map(({ club, best }) => (
            <RankingCard key={club} club={club} entries={best} />
          ))}
        </div>
      </div>

      <div className="top-progressions">
        <h3 className="top-progressions-title">Top 5 des plus grosses régressions par club</h3>
        <div className="top-progressions-grid">
          {groups.map(({ club, worst }) => (
            <RankingCard key={club} club={club} entries={worst} />
          ))}
        </div>
      </div>
      
    </div>
  );
}
