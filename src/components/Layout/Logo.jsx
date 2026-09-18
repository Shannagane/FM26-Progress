import React from 'react';
import './Logo.css';

export default function Logo() {
  return (
    <div className="logo">
      <svg className="logo-mark" viewBox="0 0 100 100" aria-hidden="true">
        <rect width="100" height="100" rx="22" fill="var(--blue-600)" />
        <path d="M30 70 L30 30 L70 30 L70 40 L42 40 L42 47 L62 47 L62 57 L42 57 L42 70 Z" fill="white" />
      </svg>
      <div className="logo-text">
        <span className="logo-title">FM26</span>
        <span className="logo-subtitle">Progress Tracker</span>
      </div>
    </div>
  );
}
