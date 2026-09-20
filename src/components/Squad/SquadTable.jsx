import { useEffect, useRef, useState } from 'react';
import SortableHeader from './SortableHeader.jsx';
import PlayerRow from './PlayerRow.jsx';
import { loadColumnWidths, saveColumnWidths } from '../../utils/columnWidths.js';
import './SquadTable.css';

const MIN_COL_WIDTH = 70;

const DEFAULT_WIDTHS = {
  identity: 240,
  poste: 120,
  club: 120
};

function defaultWidthFor(columnId) {
  return DEFAULT_WIDTHS[columnId] ?? 130;
}

export default function SquadTable({ players, sortBy, direction, onSort, showClub, columns }) {
  const headerProps = { sortBy, direction, onSort };
  const [widths, setWidths] = useState(() => loadColumnWidths());
  const dragState = useRef(null);

  useEffect(() => {
    function onMove(e) {
      const drag = dragState.current;
      if (!drag) return;
      const next = Math.max(MIN_COL_WIDTH, drag.startWidth + (e.clientX - drag.startX));
      setWidths(prev => ({ ...prev, [drag.columnId]: next }));
    }
    function onUp() {
      if (!dragState.current) return;
      dragState.current = null;
      document.body.classList.remove('col-resizing');
      setWidths(prev => {
        saveColumnWidths(prev);
        return prev;
      });
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  function getWidth(columnId) {
    return widths[columnId] ?? defaultWidthFor(columnId);
  }

  function startResize(columnId) {
    return e => {
      dragState.current = { columnId, startX: e.clientX, startWidth: getWidth(columnId) };
      document.body.classList.add('col-resizing');
    };
  }

  const columnIds = [
    'identity',
    'poste',
    ...(showClub ? ['club'] : []),
    ...columns.map(c => c.key)
  ];
  const totalWidth = columnIds.reduce((sum, id) => sum + getWidth(id), 0);

  return (
    <div className="squad-table-wrap">
      <table className="squad-table" style={{ width: totalWidth }}>
        <colgroup>
          {columnIds.map(id => <col key={id} style={{ width: getWidth(id) }} />)}
        </colgroup>
        <thead>
          <tr>
            <SortableHeader label="Joueur" sortKey="nom" {...headerProps} onResizeStart={startResize('identity')} />
            <SortableHeader label="Meilleur poste" sortKey="poste" {...headerProps} onResizeStart={startResize('poste')} />
            {showClub && (
              <SortableHeader label="Club" sortKey="club" {...headerProps} onResizeStart={startResize('club')} />
            )}
            {columns.map(col => (
              <SortableHeader
                key={col.key}
                label={col.label}
                sortKey={col.key}
                numeric={col.numeric}
                onResizeStart={startResize(col.key)}
                {...headerProps}
              />
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
