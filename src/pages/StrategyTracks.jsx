import { useState } from 'react';
import '../styles/StrategyTracks.css';
import { useFinancial } from '../context/FinancialContext';
import { Home, TrendingUp, Globe, CheckCircle, Clock, Circle } from 'lucide-react';

const TRACKS = [
  {
    id: 'property',
    name: 'First Property Path',
    tagline: 'Own a home before 30',
    pitch: 'Everything is secondary to building your deposit and getting into the property market. Deliberate lifestyle sacrifice, low-volatility savings, and a clear 3-year purchase plan.',
    headerClass: 'track-card__header--property',
    icon: <Home size={20} color="#fff" />,
    priorities: [
      'Deposit accumulation — 20% target to avoid LTV premium',
      'Bond pre-qualification readiness',
      'Emergency fund (3 months) before purchase',
      'Low-risk savings (money market, 32-day notice)',
    ],
    avoids: [
      'Aggressive offshore equity before purchase',
      'Lifestyle upgrades that reduce cash surplus',
      'Balloon vehicle finance',
    ],
    outcome: 'Property owned or consciously decided by year 3. Bond repayment replaces rent by year 4.',
    comparison: { property: 'Year 3 target', ra: 'Minimal', offshore: 'None', risk: 'Low' },
    milestones: [
      { label: 'Emergency fund at 3 months expenses', time: 'Month 6', status: 'active' },
      { label: 'Deposit savings at R60 000+', time: 'Year 1', status: 'pending' },
      { label: 'Bond pre-qualification complete', time: 'Year 2', status: 'pending' },
      { label: 'Property purchased or pivot decision', time: 'Year 3', status: 'pending' },
      { label: 'Bond repayments replacing rent', time: 'Year 4–5', status: 'pending' },
    ],
    nudge: 'Bond repayment on a R900K property would be ~R9 840/pm at current prime. That\'s R2 200 less than your rent.',
  },
  {
    id: 'balanced',
    name: 'Balanced Lifestyle',
    tagline: 'Live well now. Build seriously for later.',
    pitch: 'No guilt, no extremes. TFSA maxed, RA opened, emergency fund complete — and a defined lifestyle budget that lets you enjoy your income consciously.',
    headerClass: 'track-card__header--balanced',
    icon: <TrendingUp size={20} color="#fff" />,
    priorities: [
      'TFSA maximisation — R36 000/year, zero tax on growth',
      'RA contribution to SARS deduction limit',
      'Emergency fund at 6 months of expenses',
      'Conscious lifestyle budget — quality not guilt',
    ],
    avoids: [
      'Property fixation before financial foundations are solid',
      'Panic-driven financial decisions',
      'Lifestyle inflation beyond the defined envelope',
    ],
    outcome: 'R250 000+ invested by year 5, net worth positive by year 3, with a clear property decision in sight.',
    comparison: { property: 'Year 5 option', ra: 'Maxed', offshore: 'Moderate', risk: 'Medium' },
    milestones: [
      { label: 'TFSA open — R3 000/month contribution active', time: 'Month 3', status: 'done' },
      { label: 'R36 000 TFSA annual contribution complete, RA opened', time: 'Year 1', status: 'active' },
      { label: 'Emergency fund complete, portfolio at R80 000+', time: 'Year 2', status: 'pending' },
      { label: 'Net worth positive — investments exceed debt', time: 'Year 3', status: 'pending' },
      { label: 'R250 000+ invested, property decision point', time: 'Year 5', status: 'pending' },
    ],
    nudge: 'Your RA is saving you R1 890/month in PAYE tax. That\'s R22 680/year back in your pocket.',
  },
  {
    id: 'aggressive',
    name: 'Aggressive Global',
    tagline: 'Maximise long-term wealth. Minimise SA exposure.',
    pitch: 'Offshore equity ETFs, maxed RA and TFSA, minimal lifestyle spend. Built for users who want R1M+ invested by 32 and the optionality to leave, retire early, or fund a startup.',
    headerClass: 'track-card__header--aggressive',
    icon: <Globe size={20} color="#fff" />,
    priorities: [
      'Offshore equity ETF allocation (Satrix MSCI World)',
      'RA maximised — 27.5% of taxable income',
      'TFSA maxed for tax-free compound growth',
      'SARB R1M annual discretionary allowance strategy',
    ],
    avoids: [
      'SA property as investment in first 5 years',
      'Lifestyle inflation of any kind',
      'Balloon vehicle finance',
      'Low-yield savings beyond emergency fund',
    ],
    outcome: 'R1M+ invested portfolio by year 5. Full financial independence roadmap in place by year 5.',
    comparison: { property: 'Not in plan', ra: 'Maxed', offshore: 'High (60%+)', risk: 'High' },
    milestones: [
      { label: 'RA and TFSA open at max contributions', time: 'Month 1', status: 'done' },
      { label: 'Offshore account open, R200K+ in global ETFs', time: 'Year 1', status: 'active' },
      { label: 'R500K+ total invested portfolio', time: 'Year 2', status: 'pending' },
      { label: 'Review SARB foreign allowance strategy', time: 'Year 3', status: 'pending' },
      { label: 'R1M+ portfolio, full FIRE roadmap in place', time: 'Year 5', status: 'pending' },
    ],
    nudge: 'You\'re on pace for a R1M portfolio by 32. At 7% real return that\'s R2.7M by 45.',
  },
];

const COMPARISON_ROWS = [
  { label: 'Property', key: 'property' },
  { label: 'RA', key: 'ra' },
  { label: 'Offshore', key: 'offshore' },
  { label: 'Risk Level', key: 'risk' },
];

const RISK_PILL = {
  Low: 'comparison-pill--low',
  Medium: 'comparison-pill--medium',
  High: 'comparison-pill--high',
};

export default function StrategyTracks() {
  const { financial, updateFinancial } = useFinancial();
  const [activeTab, setActiveTab] = useState(financial.selectedTrack || 'property');

  const handleSelect = (id) => {
    updateFinancial({ selectedTrack: id });
    setActiveTab(id);
  };

  const activeTrack = TRACKS.find(t => t.id === (financial.selectedTrack || 'property'));

  return (
    <div className="tracks-page">
      {/* ── Header ── */}
      <div className="tracks-page__header">
        <div className="tracks-page__eyebrow">First Five Years</div>
        <h1 className="tracks-page__title">Strategy Tracks</h1>
        <p className="tracks-page__subtitle">
          Opinionated, named financial roadmaps that make deliberate trade-offs. Pick one track as your primary path — it filters your nudges, milestones, and Studio recommendations.
        </p>
        {activeTrack && (
          <p className="tracks-page__summary">
            Active strategy: <strong>{activeTrack.name}</strong>
          </p>
        )}
      </div>

      {/* track cards grid */}
      <div className="tracks-grid">
        {TRACKS.map((track) => {
          const isActive = financial.selectedTrack === track.id;
          return (
            <div
              key={track.id}
              className={`track-card${isActive ? ' active-track' : ''}`}
              onClick={() => handleSelect(track.id)}
            >
              {/* Coloured header */}
              <div className={`track-card__header ${track.headerClass}`}>
                {isActive && <div className="track-card__active-badge">Active</div>}
                <div className="track-card__icon">{track.icon}</div>
                <div className="track-card__tagline">{track.tagline}</div>
                <div className="track-card__name">{track.name}</div>
                <div className="track-card__pitch">{track.pitch}</div>
              </div>

              {/* Body */}
              <div className="track-card__body">
                <div>
                  <div className="track-card__section-label">Prioritises</div>
                  <div className="track-card__priorities">
                    {track.priorities.map((p, i) => (
                      <div key={i} className="track-card__priority-item">
                        <div className="track-card__priority-dot" style={{ background: 'var(--color-positive)' }} />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="track-card__divider" />

                <div>
                  <div className="track-card__section-label">Avoids</div>
                  <div className="track-card__avoids">
                    {track.avoids.map((a, i) => (
                      <div key={i} className="track-card__avoid-item">
                        <div className="track-card__priority-dot" style={{ background: 'var(--color-negative)', opacity: 0.5 }} />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="track-card__outcome">
                  <div className="track-card__outcome-label">5-Year Outcome</div>
                  <div className="track-card__outcome-text">{track.outcome}</div>
                </div>

                <button
                  className={`track-card__select-btn${isActive ? ' selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleSelect(track.id); }}
                >
                  {isActive ? '✓ Active Track' : 'Select This Track'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/*  Comparison table  */}
      <div className="tracks-comparison">
        <div className="tracks-comparison__header">
          <div className="tracks-comparison__title">Quick Comparison</div>
        </div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Factor</th>
              {TRACKS.map(t => <th key={t.id} data-label={t.name}>{t.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map(row => (
              <tr key={row.key}>
                <td data-label="Factor">{row.label}</td>
                {TRACKS.map(t => (
                  <td key={t.id} data-label={t.name}>
                    {row.key === 'risk'
                      ? <span className={`comparison-pill ${RISK_PILL[t.comparison[row.key]] || ''}`}>{t.comparison[row.key]}</span>
                      : t.comparison[row.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td data-label="Factor">Trade-off</td>
              <td data-label="First Property Path">RA &amp; offshore sacrificed short-term</td>
              <td data-label="Balanced Lifestyle">Slower deposit, less aggressive growth</td>
              <td data-label="Aggressive Global">Zero property equity, lifestyle constrained</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Active track milestones */}
      {activeTrack && (
        <div className="track-milestones">
          <div className="track-milestones__header">
            <div className="track-milestones__title">Milestone Timeline</div>
            <div className="track-milestones__track-name">{activeTrack.name}</div>
          </div>

          <div className="milestones-timeline">
            {activeTrack.milestones.map((m, i) => (
              <div key={i} className="milestone-row">
                <div className={`milestone-dot milestone-dot--${m.status}`}>
                  {m.status === 'done' ? '✓' : i + 1}
                </div>
                <div className="milestone-content">
                  <div className="milestone-time">{m.time}</div>
                  <div className="milestone-desc">{m.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Track nudge */}
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{
              background: '#1a1a2e',
              borderLeft: '3px solid var(--color-gold)',
              borderRadius: '10px',
              padding: '14px 18px',
            }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 6 }}>
                Track Nudge
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
                {activeTrack.nudge}
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  Explainer thingie */}
      <div className="tracks-explainer">
        <div className="tracks-explainer__title">Why Strategy Tracks work</div>
        <p>
          Generic financial advice says "do everything at once": max your RA, max your TFSA, save a deposit, invest offshore, build an emergency fund. For most people earning R30K–R70K/pm, this is paralyzing.
        </p>
        <p>
          Strategy Tracks solve this by making <strong>deliberate trade-offs</strong>. Each track picks a primary goal and builds a sequenced, realistic five-year plan around it. You don't do everything — you do the right things in the right order.
        </p>
        <p>
          You can switch tracks at any time. Your milestones, nudges, and Simulation Lab recommendations will update automatically.
        </p>
      </div>
    </div>
  );
}