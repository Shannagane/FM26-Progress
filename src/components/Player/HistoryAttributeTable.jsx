import { attributeColorClass } from '../../data/attributesConfig.js';
import DeltaBadge from './DeltaBadge.jsx';
import './AttributeTable.css';

// Variante en lecture seule d'AttributeTable : affiche les valeurs d'un import passé
// (et leur évolution par rapport à l'import précédent), sans interaction de sélection.
export default function HistoryAttributeTable({ title, attrs, attributes, prevAttributes }) {
  return (
    <div className="attribute-table">
      <h4 className="attribute-table-title">{title}</h4>
      <table>
        <tbody>
          {attrs.map(attrDef => {
            const value = attributes?.[attrDef.key];
            const prevValue = prevAttributes?.[attrDef.key];
            let delta = null;
            if (value !== undefined && value !== null && prevValue !== undefined && prevValue !== null) {
              const d = Number(value) - Number(prevValue);
              if (!Number.isNaN(d) && d !== 0) delta = d;
            }
            return (
              <tr key={attrDef.key} className="attribute-row attribute-row-static">
                <td className="attribute-name">{attrDef.label}</td>
                <td className={`attribute-value ${attributeColorClass(value)}`}>
                  {value ?? '–'}
                  <DeltaBadge delta={delta} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
