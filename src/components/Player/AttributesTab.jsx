import React, { useMemo, useState } from 'react';
import { getAttributeColumns, ATTR_BY_KEY } from '../../data/attributesConfig.js';
import { isGoalkeeper } from '../../data/positionOrder.js';
import { getAttributeHistory } from '../../utils/storage.js';
import { buildProgressComment } from '../../utils/progressComment.js';
import { getAttributeDeltas, getGlobalProgressHistory } from '../../utils/attributeProgress.js';
import AttributeTable from './AttributeTable.jsx';
import AttributeLegend from './AttributeLegend.jsx';
import ProgressChart from './ProgressChart.jsx';
import ProgressComment from './ProgressComment.jsx';
import ProgressBubble from './ProgressBubble.jsx';
import './AttributesTab.css';

export default function AttributesTab({ player, snapshots }) {
  const isGK = isGoalkeeper(player.poste);
  const columns = useMemo(() => getAttributeColumns(isGK), [isGK]);
  const [selectedKey, setSelectedKey] = useState(null);

  const history = selectedKey
    ? getAttributeHistory(snapshots, player.id, selectedKey)
    : getGlobalProgressHistory(snapshots, player.id);
  const commentSegments = useMemo(
    () => buildProgressComment(snapshots, player.id, player.nom),
    [snapshots, player.id, player.nom]
  );
  const { total: totalProgress, importCount } = useMemo(
    () => getAttributeDeltas(snapshots, player.id),
    [snapshots, player.id]
  );

  return (
    <div className="attributes-tab">
      <div className="attributes-summary-row">
        <ProgressComment segments={commentSegments} />
        <ProgressBubble total={totalProgress} importCount={importCount} />
      </div>

      <ProgressChart attrLabel={selectedKey ? ATTR_BY_KEY[selectedKey].label : null} history={history} />

      <AttributeLegend />

      <div className="attributes-columns">
        {columns.map((tables, colIndex) => (
          <div className="attributes-column" key={colIndex}>
            {tables.map(table => (
              <AttributeTable
                key={table.title}
                title={table.title}
                attrs={table.attrs}
                player={player}
                snapshots={snapshots}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
