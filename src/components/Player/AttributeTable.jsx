import React from 'react';
import { attributeColorClass } from '../../data/attributesConfig.js';
import { attributeTierClass } from '../../data/attributeHighlights.js';
import { getAttributeDelta, getAttributeHistory } from '../../utils/storage.js';
import DeltaBadge from './DeltaBadge.jsx';
import Sparkline from './Sparkline.jsx';
import './AttributeTable.css';

export default function AttributeTable({ title, attrs, player, snapshots, selectedKey, onSelect }) {
  return (
    <div className="attribute-table">
      <h4 className="attribute-table-title">{title}</h4>
      <table>
        <tbody>
          {attrs.map(attrDef => {
            const value = player.attributes?.[attrDef.key];
            const delta = getAttributeDelta(snapshots, player.id, attrDef.key);
            const history = getAttributeHistory(snapshots, player.id, attrDef.key);
            const isSelected = selectedKey === attrDef.key;
            const tierClass = attributeTierClass(player.poste, attrDef.key);
            return (
              <tr
                key={attrDef.key}
                className={`attribute-row ${tierClass} ${isSelected ? 'attribute-row-selected' : ''}`}
                onClick={() => onSelect(attrDef.key)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') onSelect(attrDef.key); }}
              >
                <td className="attribute-name">{attrDef.label}</td>
                <td className={`attribute-value ${attributeColorClass(value)}`}>
                  <span className="attribute-value-inner">
                    <Sparkline history={history} />
                    <span>{value ?? '–'}</span>
                    <DeltaBadge delta={delta} />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
