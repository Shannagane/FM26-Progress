import React from 'react';
import SortableHeader from './SortableHeader.jsx';
import PlayerRow from './PlayerRow.jsx';
import './SquadTable.css';

export default function SquadTable({ players, sortBy, direction, onSort, showClub }) {
  const headerProps = { sortBy, direction, onSort };

  return (
    <div className="squad-table-wrap">
      <table className="squad-table">
        <colgroup>
          <col style={{ width: showClub ? '22%' : '25%' }} />
          <col style={{ width: showClub ? '13%' : '15%' }} />
          {showClub && <col style={{ width: '13%' }} />}
          <col style={{ width: showClub ? '8%' : '9%' }} />
          <col style={{ width: showClub ? '9%' : '10%' }} />
          <col style={{ width: showClub ? '9%' : '10%' }} />
          <col style={{ width: showClub ? '12%' : '13%' }} />
          <col style={{ width: showClub ? '12%' : '13%' }} />
        </colgroup>
        <thead>
          <tr>
            <SortableHeader label="Joueur" sortKey="nom" {...headerProps} />
            <SortableHeader label="Meilleur poste" sortKey="poste" {...headerProps} />
            {showClub && <SortableHeader label="Club" sortKey="club" {...headerProps} />}
            <SortableHeader label="Âge" sortKey="age" {...headerProps} />
            <SortableHeader label="MJ" sortKey="matchs_joues" numeric {...headerProps} />
            <SortableHeader label="Buts" sortKey="buts" numeric {...headerProps} />
            <SortableHeader label="Passes D." sortKey="passes_decisives" numeric {...headerProps} />
            <SortableHeader label="Note moy." sortKey="note_moyenne" numeric {...headerProps} />
          </tr>
        </thead>
        <tbody>
          {players.map(p => <PlayerRow key={p.id} player={p} showClub={showClub} />)}
        </tbody>
      </table>
    </div>
  );
}
