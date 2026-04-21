import { NavLink } from 'react-router-dom';
import { LayoutGrid, BarChart3, FlaskConical, GraduationCap } from 'lucide-react';
import '../styles/MobileNav.css';

const MOBILE_ITEMS = [
  {
    label: 'Snapshot',
    to: '/',
    icon: <LayoutGrid size={20} />,
  },
  {
    label: 'Tracks',
    to: '/tracks',
    icon: <BarChart3 size={20} />,
  },
  {
    label: 'Simulate',
    to: '/simulation',
    icon: <FlaskConical size={20} />,
  },
  {
    label: 'Learn',
    to: '/learn',
    icon: <GraduationCap size={20} />,
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
