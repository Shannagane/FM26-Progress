import './SortableHeader.css';

export default function SortableHeader({
  label, sortKey, sortBy, direction, onSort, numeric = false, width, onResizeStart
}) {
  const isActive = sortBy === sortKey;

  return (
    <th
      className={`sortable-th ${numeric ? 'th-numeric' : ''} ${isActive ? 'sortable-th-active' : ''}`}
      style={width ? { width } : undefined}
      onClick={() => onSort(sortKey)}
      tabIndex={0}
      role="button"
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      onKeyDown={e => { if (e.key === 'Enter') onSort(sortKey); }}
    >
      <span className="sortable-th-inner">
        {label}
        <svg
          className={`sort-arrow ${isActive ? 'sort-arrow-visible' : ''} ${isActive && direction === 'desc' ? 'sort-arrow-desc' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
        >
          <path d="M7 10l5 5 5-5" />
        </svg>
      </span>
      {onResizeStart && (
        <span
          className="col-resize-handle"
          onMouseDown={e => { e.stopPropagation(); onResizeStart(e); }}
          onClick={e => e.stopPropagation()}
          role="presentation"
        />
      )}
    </th>
  );
}
