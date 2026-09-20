import './TutoStep.css';

export default function TutoStep({ number, title, children }) {
  return (
    <div className="tuto-step">
      <div className="tuto-step-number">{number}</div>
      <div className="tuto-step-body">
        <h3 className="tuto-step-title">{title}</h3>
        <div className="tuto-step-content">{children}</div>
      </div>
    </div>
  );
}
