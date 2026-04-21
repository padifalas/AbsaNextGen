import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FlaskConical, HelpCircle, LogOut, Menu, X, LayoutDashboard, BookOpen, BarChart2, User } from 'lucide-react';
import '../styles/Sidebar.css';

const NAV_ITEMS = [
  { label: 'Money Snapshot',  to: '/',           icon: <LayoutDashboard size={18} />,  end: true },
  { label: 'Strategy Tracks', to: '/tracks',      icon: <BarChart2 size={18} /> },
  { label: 'Simulation Lab',  to: '/simulation',  icon: <FlaskConical size={18} /> },
  { label: 'Learn',           to: '/learn',        icon: <BookOpen size={18} /> },
];

export default function Sidebar({ userTrack = 'First Property Path', collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>

      {/* Brand + Toggle */}
      <div className="sidebar__brand">
        <NavLink to="/" className="sidebar__brand-mark">
          <div className="sidebar__logo-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15, color: '#fff' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">Wealth Studio</span>
            <span className="sidebar__brand-sub">ABSA NextGen</span>
          </div>
        </NavLink>

        <button className="sidebar__toggle" onClick={onToggle} aria-label={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Active track chip */}
      <div className="sidebar__track-chip">
        <div className="sidebar__track-dot" />
        <div className="sidebar__track-body">
          <div className="sidebar__track-label">Active Track</div>
          <div className="sidebar__track-name">{userTrack}</div>
          <div className="sidebar__track-sub">First five years</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {NAV_ITEMS.map(({ label, to, icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
              >
                <span className="sidebar__link-icon">{icon}</span>
                <span className="sidebar__link-label">{label}</span>
                {/* tooltip shown only when collapsed */}
                <span className="sidebar__link-tooltip">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__footer-link">
          <span className="sidebar__footer-icon"><User size={17} /></span>
          <span className="sidebar__footer-text">Profile</span>
          <span className="sidebar__link-tooltip">Profile</span>
        </div>
        <div className="sidebar__footer-link">
          <span className="sidebar__footer-icon"><HelpCircle size={17} /></span>
          <span className="sidebar__footer-text">Help & Glossary</span>
          <span className="sidebar__link-tooltip">Help</span>
        </div>
        <button className="sidebar__logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span className="sidebar__footer-text">Log Out</span>
          <span className="sidebar__link-tooltip">Log Out</span>
        </button>
      </div>

      <div className="sidebar__credit">ABSA Next Gen © Padi</div>
    </aside>
  );
}
