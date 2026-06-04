import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/StrategyTracks.css';
import { useFinancial } from '../context/FinancialContext';
import heroImage from '../assets/first-prop.jpg';
import {
  Home, TrendingUp, Globe, ChevronRight, AlertTriangle,
} from 'lucide-react';
import {
  TRACKS, COMPARISON_ROWS, RISK_PILL, trackPath, loadMilestones,
} from '../data/tracksData';


const TRACK_ICONS = {
  home:          <Home        size={22} color="#fff" />,
  'trending-up': <TrendingUp  size={22} color="#fff" />,
  globe:         <Globe       size={22} color="#fff" />,
};


function CardProgressBar({ track, milestoneMap }) {
  const done  = track.milestones.filter(m => milestoneMap[m.id]).length;
  const total = track.milestones.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  if (done === 0) return null;
  return (
    <div className="track-card__progress">
      <div className="track-card__progress-bar">
        <div
          className="track-card__progress-fill"
          style={{ width: `${pct}%`, background: track.accentColor }}
        />
      </div>
      <span className="track-card__progress-label">{done}/{total} milestones</span>
    </div>
  );
}

export default function StrategyTracks() {
  const { financial, updateFinancial } = useFinancial();
  const navigate = useNavigate();
  const milestoneMap = loadMilestones();

  const handleSelect = useCallback((id) => {
    updateFinancial({ selectedTrack: id });
  }, [updateFinancial]);

  const activeTrack = TRACKS.find(t => t.id === (financial.selectedTrack || 'balanced'));

  return (
    <div className="tracks-page">


      <div className="tracks-page__header">
        <div className="tracks-page__eyebrow">First Five Years</div>
        <h1 className="tracks-page__title">Strategy Tracks</h1>
        <p className="tracks-page__subtitle">
          Opinionated, named financial roadmaps that make deliberate trade-offs.
          Pick one track as your primary path — it filters your nudges, milestones,
          and Simulation Lab recommendations.
        </p>
        {activeTrack && (
          <div className="tracks-page__active-pill">
            <div className="tracks-page__active-dot" />
            Active strategy: <strong>{activeTrack.name}</strong>
            <Link to={trackPath(activeTrack.id)} className="tracks-page__active-link">
              View detail <ChevronRight size={12} />
            </Link>
          </div>
        )}
      </div>


      <div className="tracks-grid">
        {TRACKS.map(track => {
          const isActive = financial.selectedTrack === track.id;
          const icon     = TRACK_ICONS[track.iconId] || <Home size={22} color="#fff" />;

          return (
            <div
              key={track.id}
              className={`track-card${isActive ? ' active-track' : ''}`}
              onClick={() => handleSelect(track.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleSelect(track.id)}
              aria-pressed={isActive}
            >
              <div
                className={`track-card__header ${track.headerClass}`}
                style={{ backgroundImage: `url(${heroImage})` }}
              >
                {isActive && <div className="track-card__active-badge">Active</div>}
                <div className="track-card__icon">{icon}</div>
                <div className="track-card__tagline">{track.tagline}</div>
                <div className="track-card__name">{track.name}</div>
                <div className="track-card__pitch">{track.pitch}</div>
              </div>

              <div className="track-card__body">
                <div>
                  <div className="track-card__section-label">Prioritises</div>
                  <div className="track-card__priorities">
                    {track.priorities.slice(0, 3).map((p, i) => (
                      <div key={i} className="track-card__priority-item">
                        <div className="track-card__priority-dot" style={{ background: 'var(--positive)' }} />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="track-card__divider" />

                <div>
                  <div className="track-card__section-label">Avoids</div>
                  <div className="track-card__avoids">
                    {track.avoids.slice(0, 2).map((a, i) => (
                      <div key={i} className="track-card__avoid-item">
                        <div className="track-card__priority-dot" style={{ background: 'var(--negative)', opacity: 0.5 }} />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="track-card__outcome">
                  <div className="track-card__outcome-label">5-Year Outcome</div>
                  <div className="track-card__outcome-text">{track.outcome}</div>
                </div>


                <CardProgressBar track={track} milestoneMap={milestoneMap} />


                <div className="track-card__actions">
                  <button
                    className={`track-card__select-btn${isActive ? ' selected' : ''}`}
                    onClick={e => { e.stopPropagation(); handleSelect(track.id); }}
                  >
                    {isActive ? '✓ Active' : 'Select'}
                  </button>
                  <Link
                    to={trackPath(track.id)}
                    className="track-card__detail-link"
                    onClick={e => e.stopPropagation()}
                  >
                    View detail <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>


      <div className="tracks-comparison">
        <div className="tracks-comparison__header">
          <div className="tracks-comparison__title">Quick Comparison</div>
        </div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Factor</th>
              {TRACKS.map(t => (
                <th key={t.id}>
                  <Link to={trackPath(t.id)} className="comparison-table__track-link">
                    {t.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map(row => (
              <tr key={row.key}>
                <td data-label="Factor">{row.label}</td>
                {TRACKS.map(t => (
                  <td key={t.id} data-label={t.name}>
                    {row.key === 'risk'
                      ? <span className={`comparison-pill ${RISK_PILL[t.comparison[row.key]] || ''}`}>
                          {t.comparison[row.key]}
                        </span>
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


      <div className="tracks-explainer">
        <div className="tracks-explainer__title">Why Strategy Tracks work</div>
        <p>
          Generic financial advice says "do everything at once": max your RA, max your TFSA,
          save a deposit, invest offshore, build an emergency fund. For most people earning
          R30K–R70K/pm, this is paralyzing.
        </p>
        <p>
          Strategy Tracks solve this by making <strong>deliberate trade-offs</strong>. Each track picks
          a primary goal and builds a sequenced, realistic five-year plan around it. You don't do
          everything — you do the right things in the right order.
        </p>
        <p>
          Select a track above, then open its detail page to see your interactive milestone
          timeline, personalised nudges, allocation model, and full rationale.
        </p>
      </div>
    </div>
  );
}
