import { ShieldCheck, TrendingUp, BookOpen, Target } from 'lucide-react';
import authPanelImage from '../assets/auth-panel.png';
import absaLogo from '../assets/absa-logoo.svg';

const FEATURES = [
  { icon: TrendingUp,  label: 'Investment Strategy Tracks',   sub: 'Property · Balanced · Aggressive' },
  { icon: Target,      label: 'Tax & SARS Simulator',         sub: 'Real estimates from your salary' },
  { icon: BookOpen,    label: 'Financial Learning Hub',        sub: 'Modules built for South Africans' },
];

export default function AuthPanel() {
  return (
    <div className="login-left">

      <div className="login-left__image">
        <img src={authPanelImage} alt="" aria-hidden="true" />
      </div>


      <div className="login-left__overlay" aria-hidden="true" />


      <div className="login-left__orb login-left__orb--1" aria-hidden="true" />
      <div className="login-left__orb login-left__orb--2" aria-hidden="true" />


      <div className="login-left__content">


        <div className="login-brand">
          <div className="login-brand__pill">
            <img src={absaLogo} alt="ABSA" className="login-brand__logo-img" />
          </div>
          <div className="login-brand__text">
            <span className="login-brand__name">Wealth Studio</span>
            <span className="login-brand__sub">ABSA NextGen</span>
          </div>
        </div>

        {/* Hero tagline */}
        <div className="login-left__hero">
          <h1 className="login-left__tagline">
            Your wealth<br />
            journey,{' '}
            <em>starts here.</em>
          </h1>
          <p className="login-left__body">
            A modern financial planning platform built for the next generation of South African investors.
          </p>
        </div>

        {/* Feature list */}
        <ul className="login-features" role="list">
          {FEATURES.map(({ icon: Icon, label, sub }, i) => (
            <li
              key={label}
              className="login-feature"
              style={{ animationDelay: `${0.25 + i * 0.1}s` }}
            >
              <div className="login-feature__icon-wrap">
                <Icon size={15} strokeWidth={1.8} />
              </div>
              <div className="login-feature__copy">
                <span className="login-feature__label">{label}</span>
                <span className="login-feature__sub">{sub}</span>
              </div>
            </li>
          ))}
        </ul>


      </div>
    </div>
  );
}
