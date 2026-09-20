import './Logo.css';

export default function Logo() {
  return (
    <div className="logo">
      <img src="LOGO.webp" alt="Logo de l'application" />
      <div className="logo-text">
        <span className="logo-title">FM26</span>
        <span className="logo-subtitle">Progress Tracker</span>
      </div>
    </div>
  );
}
