import React, { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { computeIdealPosition, getMethodProfiles, formatIdealScore, getIdealScorePercent, scoreTier } from '../../data/newgensPositionProfiles.js';
import { personalityRank, mediaHandlingRank } from '../../data/personalityRanking.js';
import { isNewgenByContract } from '../../utils/contractDate.js';
import SortableHeader from '../Squad/SortableHeader.jsx';
import './NewgensPage.css';

const DEFAULT_SORT = { sortBy: 'note', direction: 'desc' };

const SCORE_LEGEND = [
  { tier: 'green', label: 'Excellent' },
  { tier: 'violet', label: 'Bon' },
  { tier: 'orange', label: 'Moyen' },
  { tier: 'red', label: 'Faible' }
];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function compareEntries(a, b, sortBy) {
  switch (sortBy) {
    case 'age':
      return (Number(a.player.age) || 0) - (Number(b.player.age) || 0);
    case 'nom':
      return (a.player.nom || '').localeCompare(b.player.nom || '', 'fr');
    case 'personnalite':
      return personalityRank(a.player.personnalite) - personalityRank(b.player.personnalite);
    case 'media':
      return mediaHandlingRank(a.player.rapports_media) - mediaHandlingRank(b.player.rapports_media);
    case 'note':
    default:
      return a.score - b.score;
  }
}

function sortAnalyzed(list, sortBy, direction) {
  const sorted = [...list];
  sorted.sort((a, b) => {
    const cmp = compareEntries(a, b, sortBy);
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

function ProfileTable({ profile, entries, sortBy, direction, onSort, onSelectPlayer, method }) {
  const headerProps = { sortBy, direction, onSort };

  return (
    <div className="newgens-profile-block">
      <h3 className={`newgens-profile-title newgens-profile-title-${profile.color}`}>
        {profile.label} <span className="newgens-profile-short">{profile.shortLabel}</span>
        <span className="newgens-profile-count">{entries.length} joueur(s)</span>
      </h3>
      {entries.length === 0 ? (
        <p className="newgens-profile-empty">Aucun joueur pour ce poste.</p>
      ) : (
        <div className="newgens-table-wrap">
          <table className="newgens-table">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead>
              <tr>
                <SortableHeader label="Joueur" sortKey="nom" {...headerProps} />
                <SortableHeader label="Age" sortKey="age" numeric {...headerProps} />
                <SortableHeader label="Personnalité" sortKey="personnalite" {...headerProps} />
                <SortableHeader label="Rapport media" sortKey="media" {...headerProps} />
                <SortableHeader label="Note idéale" sortKey="note" numeric {...headerProps} />
              </tr>
            </thead>
            <tbody>
              {entries.map(({ player, score }) => {
                const percent = getIdealScorePercent(score, profile, method);
                const tier = percent === null ? scoreTier(score, 20) : scoreTier(percent, 100);
                return (
                  <tr
                    key={player.id}
                    className="newgens-row"
                    tabIndex={0}
                    role="button"
                    onClick={() => onSelectPlayer(player)}
                    onKeyDown={e => { if (e.key === 'Enter') onSelectPlayer(player); }}
                  >
                    <td className="newgens-cell-name">{player.nom || '–'}</td>
                    <td className="cell-numeric">{player.age || '–'}</td>
                    <td>{player.personnalite || '–'}</td>
                    <td>{player.rapports_media || '–'}</td>
                    <td className="cell-numeric">
                      <span className={`newgens-score-value newgens-score-text-${tier}`}>
                        {formatIdealScore(score, profile, method)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function NewgensResultsPage() {
  const { snapshotId } = useParams();
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method') === 'fm26' ? 'fm26' : 'polynomial';
  const squad = searchParams.get('squad') === 'newgens' ? 'newgens' : 'all';
  const { snapshots } = useAppData();
  const navigate = useNavigate();
  const [sortStates, setSortStates] = useState({});

  const selectedSnapshot = snapshots.find(snap => snap.id === snapshotId) || null;

  const profiles = getMethodProfiles(method);

  const groupedByProfile = useMemo(() => {
    if (!selectedSnapshot) return {};
    const eligible = Object.values(selectedSnapshot.players)
      .filter(player => squad !== 'newgens' || isNewgenByContract(player));

    const groups = Object.fromEntries(profiles.map(profile => [profile.key, []]));
    eligible.forEach(player => {
      const ideal = computeIdealPosition(player, method);
      if (!ideal) return;
      groups[ideal.profile.key].push({ player, score: ideal.score });
    });

    return groups;
  }, [selectedSnapshot, method, squad, profiles]);

  if (!selectedSnapshot) {
    return <Navigate to="/newgens" replace />;
  }

  function handleSort(profileKey, sortKey) {
    setSortStates(prev => {
      const current = prev[profileKey] || DEFAULT_SORT;
      const next = current.sortBy === sortKey
        ? { sortBy: sortKey, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { sortBy: sortKey, direction: sortKey === 'note' ? 'desc' : 'asc' };
      return { ...prev, [profileKey]: next };
    });
  }

  return (
    <div className="newgens-page">
      <Link to="/newgens" className="back-link">← Retour au Labo des Postes</Link>

      <div className="newgens-results">
        <h3 className="newgens-results-title">
          Résultats — {selectedSnapshot.csvName || 'Import'} ({formatDate(selectedSnapshot.gameDate)})
          {squad === 'newgens' ? ' · Newgens' : ' · Effectif complet'}
        </h3>

        <div className="newgens-score-legend">
          <span className="newgens-score-legend-label">Note idéale :</span>
          {SCORE_LEGEND.map(item => (
            <div className="newgens-score-legend-item" key={item.tier}>
              <span className={`newgens-score-legend-dot newgens-score-legend-dot-${item.tier}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {profiles.map(profile => {
          const sortState = sortStates[profile.key] || DEFAULT_SORT;
          const entries = sortAnalyzed(groupedByProfile[profile.key] || [], sortState.sortBy, sortState.direction);
          return (
            <ProfileTable
              key={profile.key}
              profile={profile}
              entries={entries}
              sortBy={sortState.sortBy}
              direction={sortState.direction}
              method={method}
              onSort={sortKey => handleSort(profile.key, sortKey)}
              onSelectPlayer={player => navigate(`/newgens/${selectedSnapshot.id}/${player.id}?method=${method}&squad=${squad}`)}
            />
          );
        })}
      </div>
    </div>
  );
}
