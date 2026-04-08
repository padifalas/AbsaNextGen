import { Link } from 'react-router-dom';

const FEATURES = [
  'SARS 2024/25 PAYE — live, in seconds',
  'Rent vs buy in Joburg, with real transfer duty',
  'Strategy tracks for your first five years',
  'RA tax savings calculator baked in',
];

export default function AuthPanel({ variant = 'login' }) {
  return (
    <div className="login-left">
      <Link to="/" className="login-brand">
        {/* <div className="login-brand__pill">
          <svg viewBox="0 0 18 18" fill="none">
            <path d="M9 2L3 6v6l6 4 6-4V6L9 2z" fill="white" opacity="0.95"/>
            <path d="M6 9.5l2 2 4-4" stroke="#C1121F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div> */}
        <div className="login-brand__text">
          <span className="login-brand__name">Wealth Studio</span>
          <span className="login-brand__sub">ABSA NextGen</span>
        </div>
      </Link>

      <div className="login-left__hero">
        <h1 className="login-left__tagline">
          {/* {variant === 'register' ? (
            <>Your wealth.<br /><em>Starts here.</em></>
          ) : (
            <>Your money.<br /><em>Finally clear.</em></>
          )} */}
        </h1>
        <p className="login-left__body">
          {/* {variant === 'register'
            ? 'Join thousands of young South African professionals building real wealth — not just managing expenses.'
            : 'Built for young South African professionals who earn well but need a framework — not another budgeting app.'
          } */}
        </p>
        <div className="login-features">
          {/* {FEATURES.map((f) => (
            <div className="login-feature" key={f}>
              <div className="login-feature__dot" />
              <span className="login-feature__text">{f}</span>
            </div>
          ))} */}
        </div>
      </div>

      <div className="login-left__footer">
        <svg className="login-left__footer-icon" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5L2.5 4v4.5C2.5 11.5 4.9 13.8 8 14.5c3.1-.7 5.5-3 5.5-6V4L8 1.5z"
            stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M5.5 8l1.8 1.8 3.2-3.3" stroke="currentColor" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* <span className="login-left__footer-text">
              ABSA NextGen Assignment · Padi Falas-Maifala · Not Affiliated with ABSA Group
        </span> */}
      </div>
    </div>
  );
}