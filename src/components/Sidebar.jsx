import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Lucide
import { FlaskConical, ChevronLeft, ChevronRight, HelpCircle, LogOut } from 'lucide-react';

// Heroicons
import { ChartBarIcon } from '@heroicons/react/24/outline';

// Material
import SchoolIcon from '@mui/icons-material/School';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons';

import '../styles/Sidebar.css';

const NAV_ITEMS = [
  {
    // section: 'Core',
    items: [
      {
        label: 'Money Snapshot',
        to: '/',
        // badge: '2',
        badgeVariant: 'red',
        icon: <FontAwesomeIcon icon={faWallet} style={{ width: 17, height: 17 }} />,
      },
      {
        label: 'Strategy Tracks',
        to: '/tracks',
        icon: <ChartBarIcon width={19} height={19} />,
      },
    ],
  },
  {
    // section: 'Simulate',
    items: [
      {
        label: 'Simulation Lab',
        to: '/simulation',
        // badge: 'NEW',
        // badgeVariant: 'gold',
        icon: <FlaskConical size={18} />,
      },
    ],
  },
  {
    // section: 'Learn',
    items: [
      {
        label: 'Learn',
        to: '/learn',
        icon: <SchoolIcon style={{ fontSize: 19 }} />,
      },
    ],
  },
];

export default function Sidebar({ userTrack = 'First Property Path', collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>

      {/* ── Brand ── */}
      <div className="sidebar__brand">
        <NavLink to="/" className="sidebar__brand-mark">

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
          {collapsed
            ? <ChevronRight size={14} />
            : <ChevronLeft size={14} />
          }
        </button>
      </div>

      {/* ── Active track chip ── */}
      <div className="sidebar__user">
        <div className="sidebar__user-dot" />
        <div className="sidebar__user-label">Active Track</div>
        <div className="sidebar__user-track">{userTrack}</div>
        <div className="sidebar__user-track-sub">First five years</div>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ section, items }) => (
          <div className="sidebar__section" key={section}>
            <div className="sidebar__section-label">{section}</div>
            <ul className="sidebar__menu">
              {items.map(({ label, to, icon, badge, badgeVariant }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `sidebar__link${isActive ? ' active' : ''}`
                    }
                  >
                    <span className="sidebar__link-icon">{icon}</span>
                    <span className="sidebar__link-label">{label}</span>
                    {badge && (
                      <span className={`sidebar__link-badge${badgeVariant === 'gold' ? ' sidebar__link-badge--gold' : ''}`}>
                        {badge}
                      </span>
                    )}
                    {/* tooltip shown only when collapsed */}
                    <span className="sidebar__link-tooltip">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar__footer">
        <div className="sidebar__footer-link">
          <span className="sidebar__footer-icon">
            <PersonOutlineIcon style={{ fontSize: 19 }} />
          </span>
          <span>Profile</span>
          <span className="sidebar__link-tooltip">Profile</span>
        </div>
        <div className="sidebar__footer-link">
          <span className="sidebar__footer-icon">
            <HelpCircle size={18} />
          </span>
          <span>Help & Glossary</span>
          <span className="sidebar__link-tooltip">Help & Glossary</span>
        </div>
        <button className="sidebar__footer-link" onClick={handleLogout}>
          <span className="sidebar__footer-icon">
            <LogOut size={18} />
          </span>
          <span>Log Out</span>
          <span className="sidebar__link-tooltip">Log Out</span>
        </button>
      </div>

      <div className="sidebar__absa-credit">ABSA Next Gen © Padi</div>
    </aside>
  );
}
