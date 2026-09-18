import React from 'react';
import SortableHeader from './SortableHeader.jsx';
import PlayerRow from './PlayerRow.jsx';
import './SquadTable.css';

export default function SquadTable({ players, sortBy, direction, onSort, showClub, columns }) {
  const headerProps = { sortBy, direction, onSort };
  const identityWidth = showClub ? 22 : 25;
  const posteWidth = showClub ? 13 : 15;
  const clubWidth = showClub ? 13 : 0;
  const extraWidth = columns.length > 0
    ? (100 - identityWidth - posteWidth - clubWidth) / columns.length
    : 0;

  return (
    <div className="squad-table-wrap">
      <table className="squad-table">
        <colgroup>
          <col style={{ width: `${identityWidth}%` }} />
          <col style={{ width: `${posteWidth}%` }} />
          {showClub && <col style={{ width: `${clubWidth}%` }} />}
          {columns.map(col => <col key={col.key} style={{ width: `${extraWidth}%` }} />)}
        </colgroup>
        <thead>
          <tr>
            <SortableHeader label="Joueur" sortKey="nom" {...headerProps} />
            <SortableHeader label="Meilleur poste" sortKey="poste" {...headerProps} />
            {showClub && <SortableHeader label="Club" sortKey="club" {...headerProps} />}
            {columns.map(col => (
              <SortableHeader key={col.key} label={col.label} sortKey={col.key} numeric={col.numeric} {...headerProps} />
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map(p => <PlayerRow key={p.id} player={p} showClub={showClub} columns={columns} />)}
        </tbody>
      </table>
    </div>
  );
}
