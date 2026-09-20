import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { loadGroups } from '../../utils/groups.js';
import { loadClubLogos } from '../../utils/clubLogos.js';
import './ClubsPage.css';

// Aucune vraie image de blason n'est disponible (le CSV FM26 n'en exporte pas) : on affiche
// à la place un écusson générique, dans le même esprit que les icônes déjà utilisées
// ailleurs dans l'app (PlayerInfo, StatsTab…).
function ClubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

// Page d'accueil de l'Effectif : choix du club à consulter, avec les groupes personnalisés
// déjà créés pour chaque club affichés en dessous (voir CreateGroupModal.jsx / groups.js).
export default function ClubsPage() {
  const { players } = useAppData();
  const groups = useMemo(() => loadGroups(), []);
  const logos = useMemo(() => loadClubLogos(), []);

  const clubCounts = useMemo(() => {
    const counts = new Map();
    players.forEach(p => {
      const club = (p.importClub || '').trim() || 'Sans club';
      counts.set(club, (counts.get(club) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([club, count]) => ({ club, count }))
      .sort((a, b) => a.club.localeCompare(b.club, 'fr'));
  }, [players]);

  // On rattache chaque groupe au(x) club(s) de ses joueurs actuels plutôt qu'au seul club
  // enregistré à la création : ça couvre aussi bien les groupes créés en vue "Tous les
  // clubs" que ceux dont les joueurs viennent de plusieurs clubs (le groupe apparaît alors
  // dans chaque carte concernée), sans jamais les reléguer à tort dans "Autres groupes".
  const groupsByClub = useMemo(() => {
    const map = new Map();
    groups.forEach(g => {
      const memberClubs = new Set(
        players
          .filter(p => g.playerIds.includes(p.id))
          .map(p => (p.importClub || '').trim() || 'Sans club')
      );
      memberClubs.forEach(club => {
        if (!map.has(club)) map.set(club, []);
        map.get(club).push(g);
      });
    });
    return map;
  }, [groups, players]);

  // "Autres groupes" ne contient plus que les groupes réellement orphelins : aucun de leurs
  // joueurs n'est présent dans l'effectif importé actuel (import supprimé, par exemple).
  const unclassifiedGroups = useMemo(() => (
    groups.filter(g => !players.some(p => g.playerIds.includes(p.id)))
  ), [groups, players]);

  if (players.length === 0) {
    return (
      <div className="clubs-page">
        <div className="squad-empty">
          Aucun joueur importé pour le moment. Rends-toi sur le{' '}
          <Link to="/">tableau de bord</Link> pour charger ton export CSV.
        </div>
      </div>
    );
  }

  return (
    <div className="clubs-page">
      <p className="clubs-page-intro">Choisis un club pour voir son effectif et ses groupes.</p>

      <div className="clubs-grid">
        {clubCounts.map(({ club, count }) => {
          const clubGroups = groupsByClub.get(club) || [];
          return (
            <div className="club-card" key={club}>
              <span className="club-card-logo">
                {logos[club] ? <img src={logos[club]} alt="" /> : <ClubIcon />}
              </span>
              <div className="club-card-content">
                <Link to={`/effectif/${encodeURIComponent(club)}`} className="club-card-header">
                  <h3>{club}</h3>
                  <span className="squad-category-count">{count} joueur(s)</span>
                </Link>
                {clubGroups.length > 0 && (
                  <div className="club-card-groups">
                    {clubGroups.map(g => (
                      <Link key={g.id} to={`/effectif/groupe/${g.id}`} className="club-card-group-chip">
                        {g.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {unclassifiedGroups.length > 0 && (
        <div className="clubs-page-other-groups">
          <h3>Autres groupes</h3>
          <div className="club-card-groups">
            {unclassifiedGroups.map(g => (
              <Link key={g.id} to={`/effectif/groupe/${g.id}`} className="club-card-group-chip">
                {g.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
