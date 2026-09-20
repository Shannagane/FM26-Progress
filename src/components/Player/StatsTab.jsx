import { useMemo, useState } from 'react';
import { groupSeasons } from '../../utils/seasons.js';
import { loadClubLogos } from '../../utils/clubLogos.js';
import { isGoalkeeper } from '../../data/positionOrder.js';
import NationFlag from './NationFlag.jsx';
import './StatsTab.css';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function cellValue(value) {
  return (value !== undefined && value !== null && value !== '') ? value : '–';
}

// Silhouette d'écusson générique, affichée quand le club n'a pas de logo importé
// (le CSV FM26 n'en fournit pas — voir utils/clubLogos.js).
function ClubShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6Z" strokeLinejoin="round" />
    </svg>
  );
}

function StatsTable({ data, logos }) {
  const logo = logos[data.club];
  // Pour un gardien, "Buts" et "Passe décisives" n'ont pas de sens : on affiche ses stats
  // défensives à la place. Ces stats n'existent que côté club (pas de champ CSV équivalent
  // pour la sélection nationale), la ligne sélection affiche donc "–" sur ces colonnes.
  const isGK = isGoalkeeper(data.poste);
  const goalsLabel = isGK ? 'Buts encaissés' : 'Buts';
  const assistsLabel = isGK ? 'Cage(s) inviolée(s)' : 'Passe décisives';

  return (
    <div className="stats-table-wrap">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Equipe</th>
            <th>Division</th>
            <th>Matchs Disputés</th>
            <th>{goalsLabel}</th>
            <th>{assistsLabel}</th>
            <th>Homme du match</th>
            <th>Note moyenne en club</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="stats-table-team">
              <span className="stats-table-team-logo">
                {logo ? <img src={logo} alt="" /> : <ClubShieldIcon />}
              </span>
              {cellValue(data.club)}
            </td>
            <td>{cellValue(data.division)}</td>
            <td>{cellValue(data.matchs_joues)}</td>
            <td>{cellValue(isGK ? data.buts_encaisses : data.buts)}</td>
            <td>{cellValue(isGK ? data.cages_inviolees : data.passes_decisives)}</td>
            <td>{cellValue(data.joueur_du_match)}</td>
            <td>{cellValue(data.note_moyenne)}</td>
          </tr>
          <tr className="stats-table-row-nation">
            <td className="stats-table-team">
              <NationFlag nation={data.nation} />
              {cellValue(data.nation)}
            </td>
            <td>{cellValue(data.selection_nationale)}</td>
            <td>{cellValue(data.matchs_selection)}</td>
            <td>{cellValue(isGK ? data.buts_encaisses_selection : data.buts_selection)}</td>
            <td>{cellValue(isGK ? null : data.passes_selection)}</td>
            <td />
            <td>{cellValue(data.note_selection)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function StatsTab({ player, snapshots }) {
  const seasons = groupSeasons(snapshots, player.id);
  const logos = useMemo(() => loadClubLogos(), []);
  const [openSeasons, setOpenSeasons] = useState({});

  function toggle(label) {
    setOpenSeasons(prev => ({ ...prev, [label]: !prev[label] }));
  }

  if (seasons.length === 0) {
    return (
      <div className="stats-tab">
        <StatsTable data={player} logos={logos} />
      </div>
    );
  }

  const [current, ...previous] = seasons;

  return (
    <div className="stats-tab">
      <div className="stats-current">
        <div className="stats-current-header">
          <span className="stats-current-badge">Saison en cours</span>
          <span className="stats-current-meta">
            {current.label} · {current.importCount} import{current.importCount > 1 ? 's' : ''}
          </span>
        </div>
        <StatsTable data={current.latest} logos={logos} />
      </div>

      {previous.length > 0 && (
        <div className="stats-history">
          <h3 className="stats-history-title">Saisons précédentes</h3>
          {previous.map(season => {
            const isOpen = !!openSeasons[season.label];
            return (
              <div className={`stats-season-card ${isOpen ? 'stats-season-card-open' : ''}`} key={season.label}>
                <button
                  type="button"
                  className="stats-season-header"
                  onClick={() => toggle(season.label)}
                  aria-expanded={isOpen}
                >
                  <svg
                    className={`stats-season-chevron ${isOpen ? 'stats-season-chevron-open' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                  <span className="stats-season-name">Saison {season.label}</span>
                  <span className="stats-season-range">
                    {formatDate(season.startDate)} → {formatDate(season.endDate)}
                  </span>
                </button>
                {isOpen && (
                  <div className="stats-season-body">
                    <StatsTable data={season.latest} logos={logos} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
