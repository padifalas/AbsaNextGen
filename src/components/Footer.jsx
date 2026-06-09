import { ExternalLink } from 'lucide-react';
import absaLogo from '../assets/absa-logoo.svg';
import '../styles/Footer.css';

const IconGithub = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 19 19" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" />
  </svg>
);

const IconLinkedin = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const ABSA_LINKS = [
  { label: 'About Us',       href: 'https://www.absa.co.za/about-us/' },
  { label: 'Careers',        href: 'https://www.absa.co.za/about-us/careers/' },
  { label: 'Investors',      href: 'https://www.absa.africa/investor-relations/'},
  { label: 'Newsroom',       href: 'https://www.absa.co.za/about-us/media/' },
  { label: 'Sustainability', href: 'https://www.absa.co.za/about-us/sustainability/' },
];

const GITHUB_REPO = 'https://github.com/padifalas/AbsaNextGen';

const linkProps = { target: '_blank', rel: 'noopener noreferrer' };

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__logo-badge" aria-hidden="true">
        <img src={absaLogo} alt="" />
      </div>

      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <div className="site-footer__brand-name">Wealth Studio</div>
            <div className="site-footer__brand-sub">ABSA Next Gen</div>
          </div>

          <div className="site-footer__col">
            <h3 className="site-footer__heading">About Absa</h3>
            <ul className="site-footer__links">
              {ABSA_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} {...linkProps}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h3 className="site-footer__heading">Developer</h3>
            <ul className="site-footer__links">
              <li>
                <a href={GITHUB_REPO} {...linkProps}>
                  <IconGithub size={15} />
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href={GITHUB_REPO} {...linkProps}>
                  <ExternalLink size={14} aria-hidden="true" />
                  View Source Code
                </a>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h3 className="site-footer__heading">Connect</h3>
            <a
              href="https://www.linkedin.com/company/absa/"
              className="site-footer__social"
              aria-label="ABSA on LinkedIn"
              {...linkProps}
            >
              <IconLinkedin size={18} />
            </a>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>2025 © Absa NextGen</span>
        </div>
      </div>
    </footer>
  );
}
