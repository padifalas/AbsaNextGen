import { NavLink } from 'react-router-dom';
import '../styles/MobileNav.css';

const MOBILE_ITEMS = [
  {
    label: 'Snapshot',
    to: '/',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Tracks',
    to: '/tracks',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 10h14M3 5h9M3 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Simulate',
    to: '/simulation',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M7 3v6l-4 7h14l-4-7V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Learn',
    to: '/learn',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 3L2 7l8 4 8-4-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6 9v5.5c0 1.1 1.8 2 4 2s4-.9 4-2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav__items">
        {MOBILE_ITEMS.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `mobile-nav__item${isActive ? ' active' : ''}`}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
