import { NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';
import './Sidebar.css';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Tableau de bord',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    )
  },
  {
    to: '/effectif',
    label: 'Effectif',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="7" r="2.4" />
        <path d="M15.5 14.2c2.7.3 4.9 2.6 5.5 5.8" />
      </svg>
    )
  },
  {
    to: '/profondeur',
    label: "Profondeur d'effectif",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="13" width="4" height="7.5" rx="1" />
        <rect x="10" y="8.5" width="4" height="12" rx="1" />
        <rect x="16.5" y="3.5" width="4" height="17" rx="1" />
      </svg>
    )
  },
  {
    to: '/newgens',
    label: 'Labo des postes FM24',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.9L12 3Z" />
        <path d="M19 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" />
      </svg>
    )
  }
];

const NAV_ITEMS_SECONDARY = [
  {
    to: '/tuto-import',
    label: 'Tuto import CSV',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.5v7l6-3.5-6-3.5Z" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: '/tuto-facepack',
    label: 'Tuto import Facepacks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="M21 16.5 16 12l-9.5 7" strokeLinejoin="round" />
      </svg>
    )
  }
];

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
    >
      <span className="sidebar-icon">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <Logo />
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
        <div className="sidebar-separator" />
        {NAV_ITEMS_SECONDARY.map(item => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="sidebar-footer">
        <span>Import local · aucune donnée envoyée</span>
      </div>
    </aside>
  );
}
