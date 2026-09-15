import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import PlayerAvatar from '../Squad/PlayerAvatar.jsx';
import NationFlag from './NationFlag.jsx';
import PlayerInfo from './PlayerInfo.jsx';
import PlayerTabs from './PlayerTabs.jsx';
import AttributesTab from './AttributesTab.jsx';
import PersonalityTab from './PersonalityTab.jsx';
import HistoryTab from './HistoryTab.jsx';
import StatsTab from './StatsTab.jsx';
import { isGoalkeeper } from '../../data/positionOrder.js';
import { formatTransferValue } from '../../utils/transferValue.js';
import './PlayerPage.css';

export default function PlayerPage() {
  const { id } = useParams();
  const { getPlayerById, snapshots } = useAppData();
  const [tab, setTab] = useState('attributs');

  const player = getPlayerById(id);

  if (!player) {
    return <Navigate to="/effectif" replace />;
  }

  return (
    <div className="player-page">
      <Link to="/effectif" className="back-link">← Retour à l'effectif</Link>

      <div className="player-header">
        <PlayerAvatar nom={player.nom} photo={player.photo} numero={player.numero} poste={player.poste} size={64} />
        <div>
          <div className="player-header-title-row">
            <h2 className="player-header-name">{player.nom}</h2>
            <NationFlag nation={player.nation} />
            <NationFlag nation={player.nation2} />
          </div>
          <div className="player-header-badges">
            <span className={`position-badge ${isGoalkeeper(player.poste) ? 'position-gk' : ''}`}>
              {player.poste || '–'}
            </span>
            {player.valeur_transfert && (
              <span className="value-badge">{formatTransferValue(player.valeur_transfert)}</span>
            )}
          </div>
        </div>
      </div>

      <PlayerInfo player={player} />

      <PlayerTabs active={tab} onChange={setTab} />

      {tab === 'attributs' && <AttributesTab player={player} snapshots={snapshots} />}
      {tab === 'historique' && <HistoryTab player={player} snapshots={snapshots} />}
      {tab === 'personnalite' && <PersonalityTab player={player} snapshots={snapshots} />}
      {tab === 'stats' && <StatsTab player={player} snapshots={snapshots} />}
    </div>
  );
}
