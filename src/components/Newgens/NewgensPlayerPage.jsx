import React from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { scoreAllProfiles, formatIdealScore } from '../../data/newgensPositionProfiles.js';
import { describeFootPreference, FOOT_CHECK_POSITION_KEYS, WINGER_POSITION_KEY } from '../../data/footPreference.js';
import { getPitchPosition } from '../../data/pitchCoords.js';
import { getPositionColor } from '../../data/positionColors.js';
import PlayerAvatar from '../Squad/PlayerAvatar.jsx';
import NationFlag from '../Player/NationFlag.jsx';
import PositionPitch from './PositionPitch.jsx';
import { formatTransferValue } from '../../utils/transferValue.js';
import '../Player/PlayerPage.css';
import '../Player/PersonalityTab.css';
import './NewgensPlayerPage.css';

function FootDirectionIcon({ side }) {
  if (side === 'both') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h18M7 7l-4 5 4 5M17 7l4 5-4 5" />
      </svg>
    );
  }
  return side === 'right' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h16M13 6l6 6-6 6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12H4M11 6l-6 6 6 6" />
    </svg>
  );
}

function FootChip({ description }) {
  const { footLabel, side, sideLabel, intensity, sentence } = description;
  return (
    <div className="newgens-foot-boxes" title={sentence}>
      <div className={`newgens-foot-box newgens-foot-box-${intensity}`}>
        <span className="newgens-foot-box-icon">{footLabel.charAt(0)}</span>
        <span className="newgens-foot-box-content">
          <span className="newgens-foot-box-title">Pied</span>
          <span className="newgens-foot-box-value">{footLabel}</span>
        </span>
      </div>
      <div className={`newgens-foot-box newgens-foot-box-${intensity}`}>
        <span className="newgens-foot-box-icon">
          <FootDirectionIcon side={side} />
        </span>
        <span className="newgens-foot-box-content">
          <span className="newgens-foot-box-title">Côté</span>
          <span className="newgens-foot-box-value">{sideLabel}</span>
        </span>
      </div>
    </div>
  );
}

function FootCheck({ player, profileKey, method }) {
  const wideKeys = FOOT_CHECK_POSITION_KEYS[method] || [];
  if (!wideKeys.includes(profileKey)) return null;

  const standard = describeFootPreference(player, false);
  if (!standard) return null;

  if (WINGER_POSITION_KEY[method] !== profileKey) {
    return (
      <div className="newgens-foot-check">
        <FootChip description={standard} />
      </div>
    );
  }

  const inverted = describeFootPreference(player, true);
  return (
    <div className="newgens-foot-check newgens-foot-check-double">
      <div className="newgens-foot-check-variant">
        <span className="newgens-foot-check-variant-label">Ailier extérieur</span>
        <FootChip description={standard} />
      </div>
      <div className="newgens-foot-check-variant">
        <span className="newgens-foot-check-variant-label">Ailier intérieur</span>
        <FootChip description={inverted} />
      </div>
    </div>
  );
}

export default function NewgensPlayerPage() {
  const { snapshotId, playerId } = useParams();
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method') === 'fm26' ? 'fm26' : 'polynomial';
  const squad = searchParams.get('squad') === 'newgens' ? 'newgens' : 'all';
  const { snapshots } = useAppData();

  const snapshot = snapshots.find(snap => snap.id === snapshotId);
  const player = snapshot?.players?.[playerId];

  if (!snapshot || !player) {
    return <Navigate to="/newgens" replace />;
  }

  const topPositions = scoreAllProfiles(player, method)
    .filter(entry => entry.score !== null)
    .slice(0, 3);

  const pitchDots = topPositions
    .flatMap((entry, index) => {
      const coords = getPitchPosition(entry.profile.key, method, player);
      if (!coords) return [];
      const rank = index + 1;
      const dots = [{ key: entry.profile.key, rank, ...coords }];

      if (entry.profile.key === WINGER_POSITION_KEY[method]) {
        const standard = describeFootPreference(player, false);
        if (standard && (standard.side === 'left' || standard.side === 'right')) {
          dots.push({ key: `${entry.profile.key}-interior`, rank, variant: 'interior', x: 100 - coords.x, y: coords.y });
        }
      }

      return dots;
    });

  return (
    <div className="newgens-player-page">
      <Link to={`/newgens/${snapshotId}?method=${method}&squad=${squad}`} className="back-link">← Retour aux résultats</Link>

      <div className="newgens-player-header">
        <div className="player-header">
          <PlayerAvatar nom={player.nom} photo={player.photo} numero={player.numero} poste={player.poste} size={64} />
          <div>
            <div className="player-header-title-row">
              <h2 className="player-header-name">{player.nom || 'Joueur'}</h2>
              <NationFlag nation={player.nation} />
              <NationFlag nation={player.nation2} />
            </div>
            {player.valeur_transfert && (
              <div className="player-header-badges">
                <span className="value-badge">{formatTransferValue(player.valeur_transfert)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="personality-row">
          <div className="personality-block">
            <span className="personality-label">Âge</span>
            <p className="personality-value">{player.age ? `${player.age} ans` : '–'}</p>
          </div>
          <div className="personality-block">
            <span className="personality-label">Personnalité</span>
            <p className="personality-value">{player.personnalite || 'Non renseigné dans le CSV'}</p>
          </div>
          <div className="personality-block">
            <span className="personality-label">Rapports média</span>
            <p className="personality-value">{player.rapports_media || 'Non renseigné dans le CSV'}</p>
          </div>
        </div>
      </div>

      {topPositions.length === 0 ? (
        <p className="newgens-player-no-data">
          Impossible de calculer un poste idéal : ce joueur n'a aucun attribut exploitable dans le CSV importé.
        </p>
      ) : (
        <div className="newgens-analysis-layout">
          <PositionPitch dots={pitchDots} />
          <div className="newgens-top-positions">
            {topPositions.map((entry, index) => (
              <div key={entry.profile.key} className="newgens-top-position-block">
                <div
                  className="newgens-top-position"
                  style={{ '--position-accent': getPositionColor(entry.profile.key, method) }}
                >
                  <span className="newgens-top-position-rank">#{index + 1}</span>
                  <span className="newgens-top-position-label">
                    {entry.profile.label} <span className="newgens-top-position-short">{entry.profile.shortLabel}</span>
                  </span>
                  <span className="newgens-top-position-score">{formatIdealScore(entry.score, entry.profile, method)}</span>
                </div>
                <FootCheck player={player} profileKey={entry.profile.key} method={method} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
