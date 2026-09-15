import React from 'react';
import './HelpStep.css';

export default function HelpStep({ number, title, children }) {
  return (
    <div className="help-step">
      <div className="help-step-number">{number}</div>
      <div className="help-step-body">
        <h3 className="help-step-title">{title}</h3>
        <div className="help-step-content">{children}</div>
      </div>
    </div>
  );
}
