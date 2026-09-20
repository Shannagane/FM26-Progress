import './ProgressComment.css';

export default function ProgressComment({ segments }) {
  return (
    <div className="progress-comment">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="progress-comment-icon">
        <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle cx="12" cy="12" r="3.4" />
      </svg>
      <p>
        {segments.map((seg, i) => (
          <span key={i} className={`comment-${seg.tone}`}>
            {seg.text}{i < segments.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
    </div>
  );
}
