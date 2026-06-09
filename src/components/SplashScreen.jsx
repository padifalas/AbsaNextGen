import { useState, useEffect, useRef } from 'react';
import absaLogo from '../assets/absa-logoo.svg';
import '../styles/SplashScreen.css';


let _splashDone = false;

export default function SplashScreen() {
  const [visible, setVisible]   = useState(() => {
    if (_splashDone) return false;
    if (sessionStorage.getItem('splash_shown')) { _splashDone = true; return false; }
    return true;
  });
  const [leaving, setLeaving]   = useState(false);
  const timersRef               = useRef([]);

  useEffect(() => {
    if (!visible) return;

    sessionStorage.setItem('splash_shown', '1');

    const t1 = setTimeout(() => setLeaving(true),        2400);
    const t2 = setTimeout(() => { _splashDone = true; setVisible(false); }, 3100);

    timersRef.current = [t1, t2];
    return () => timersRef.current.forEach(clearTimeout);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`splash${leaving ? ' splash--leaving' : ''}`} aria-hidden="true">
      <div className="splash__orb splash__orb--1" />
      <div className="splash__orb splash__orb--2" />
      <div className="splash__orb splash__orb--3" />

      <div className="splash__center">
        <div className="splash__logo">
          <img src={absaLogo} alt="ABSA" className="splash__logo-img" />
        </div>

        <div className="splash__wordmark">
          <span className="splash__wordmark-main">Wealth Studio</span>
          <span className="splash__wordmark-sub">ABSA NextGen</span>
        </div>

        <p className="splash__tagline">Your wealth journey, starts here.</p>

        <div className="splash__bar-track">
          <div className="splash__bar-fill" />
        </div>
      </div>
    </div>
  );
}
