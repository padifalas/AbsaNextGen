import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FlaskConical, HelpCircle, LogOut, Menu, X,
  LayoutDashboard, BookOpen, BarChart2, User,
} from 'lucide-react';
import '../styles/Sidebar.css';
import absaLogo from '../assets/absa-logo.png';

const NAV_ITEMS = [
  { label: 'Money Snapshot',  to: '/',          icon: <LayoutDashboard size={18} />, end: true  },
  { label: 'Strategy Tracks', to: '/tracks',     icon: <BarChart2       size={18} />, end: false },
  { label: 'Simulation Lab',  to: '/simulation', icon: <FlaskConical    size={18} />, end: false },
  { label: 'Learn',           to: '/learn',      icon: <BookOpen        size={18} />, end: false },
];

export default function Sidebar({ userTrack = 'First Property Path', collapsed, onToggle }) {
  const { logout }  = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleHelpGlossary = () => {
    navigate('/learn', { state: { openGlossary: true } });
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>

      {/* Brand + Toggle */}
      <div className="sidebar__brand">
        <NavLink to="/" className="sidebar__brand-mark">
          <div className="sidebar__logo-pill">
            <img src={absaLogo} alt="ABSA" className="sidebar__logo-img" />
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">Wealth Studio</span>
            <span className="sidebar__brand-sub">ABSA NextGen</span>
          </div>
        </NavLink>

        <button
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
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
        <div className="sidebar__nav-section-label">Navigate</div>
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
                <span className="sidebar__link-tooltip">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar__footer-link${isActive ? ' active' : ''}`}
        >
          <span className="sidebar__footer-icon"><User size={17} /></span>
          <span className="sidebar__footer-text">Profile</span>
          <span className="sidebar__link-tooltip">Profile</span>
        </NavLink>
        <button
          type="button"
          className={`sidebar__footer-link${location.pathname === '/learn' ? ' active' : ''}`}
          onClick={handleHelpGlossary}
        >
          <span className="sidebar__footer-icon"><HelpCircle size={17} /></span>
          <span className="sidebar__footer-text">Help &amp; Glossary</span>
          <span className="sidebar__link-tooltip">Help &amp; Glossary</span>
        </button>
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
