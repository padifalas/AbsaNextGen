import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Home, TrendingUp, Globe, CheckCircle, Clock, AlertTriangle,
  Zap, BookOpen, BarChart2, Target, Award, RotateCcw, Info,
  ChevronLeft, Shield, TrendingDown, ArrowRight,
} from 'lucide-react';
import propertyImage from '../assets/first-prop.jpg';
import balancedImage from '../assets/balanced-lifestyle.jpeg';
import aggressiveImage from '../assets/aggressive-global.jpeg';
import { useFinancial } from '../context/FinancialContext';
import {
  getTrackBySlug, TRACKS, trackPath,
  loadMilestones, saveMilestones,
} from '../data/tracksData';
import '../styles/StrategyTracks.css';


const TRACK_ICONS = {
  home:        <Home        size={22} color="#fff" />,
  'trending-up': <TrendingUp size={22} color="#fff" />,
  globe:       <Globe       size={22} color="#fff" />,
};



function ProgressRing({ pct, size = 56, stroke = 5, color = '#b28a50', trackColor = '#e8e6e1' }) {
  const r      = (size - stroke * 2) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
}

function AllocationBar({ model }) {
  return (
    <div className="allocation-bar">
      <div className="allocation-bar__track">
        {model.map((seg, i) => (
          <div key={i} className="allocation-bar__seg"
            style={{ width: `${seg.pct}%`, background: seg.color }}
            title={`${seg.label}: ${seg.pct}%`}
          />
        ))}
      </div>
      <div className="allocation-bar__legend">
        {model.map((seg, i) => (
          <div key={i} className="allocation-bar__legend-item">
            <span className="allocation-bar__dot" style={{ background: seg.color }} />
            <span>{seg.label}</span>
            <span className="allocation-bar__pct">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MilestoneRow({ milestone, index, isDone, isActive, onToggle }) {
  const status = isDone ? 'done' : isActive ? 'active' : 'pending';
  return (
    <div className={`milestone-row milestone-row--${status}`}>
      <div className="milestone-row__connector" />
      <button
        className={`milestone-dot milestone-dot--${status}`}
        onClick={() => onToggle(milestone.id)}
        aria-label={isDone ? `Undo: ${milestone.label}` : `Complete: ${milestone.label}`}
        title={isDone ? 'Click to undo' : 'Click to mark complete'}
      >
        {isDone ? <CheckCircle size={13} /> : index + 1}
      </button>
      <div className="milestone-content">
        <div className="milestone-header">
          <span className="milestone-time"><Clock size={10} /> {milestone.time}</span>
          <span className="milestone-xp"><Zap size={10} /> +{milestone.xp} XP</span>
        </div>
        <div className={`milestone-desc${isDone ? ' milestone-desc--done' : ''}`}>
          {milestone.label}
        </div>
      </div>
    </div>
  );
}



function TrackNotFound({ slug }) {
  return (
    <div className="tracks-page">
      <div className="track-detail-notfound">
        <div className="track-detail-notfound__title">Track not found</div>
        <p>No track exists for the slug <code>"{slug}"</code>.</p>
        <Link to="/tracks" className="track-detail-notfound__back">
          <ChevronLeft size={14} /> Back to Strategy Tracks
        </Link>
      </div>
    </div>
  );
}


// MAIN PAGE — /tracks/:slug


export default function TrackDetail() {
  const { slug }                          = useParams();
  const navigate                          = useNavigate();
  const { financial, updateFinancial, derived } = useFinancial();

  const track = getTrackBySlug(slug);

  //  Tab state — tabs live inside the route page
  const [activeTab, setActiveTab]       = useState('milestones');
  const [celebrationId, setCelebrationId] = useState(null);


  const [milestoneMap, setMilestoneMap] = useState(loadMilestones);

  const toggleMilestone = useCallback((milestoneId) => {
    setMilestoneMap(prev => {
      const next = { ...prev, [milestoneId]: !prev[milestoneId] };
      saveMilestones(next);
      if (!prev[milestoneId]) {
        setCelebrationId(milestoneId);
        setTimeout(() => setCelebrationId(null), 2400);
      }
      return next;
    });
  }, []);

  //2 mark  track as active
  const handleSetActive = useCallback(() => {
    if (track) updateFinancial({ selectedTrack: track.id });
  }, [track, updateFinancial]);


  if (!track) return <TrackNotFound slug={slug} />;

  const isActiveTrack = financial.selectedTrack === track.id;
  const trackIcon     = TRACK_ICONS[track.iconId] || <Home size={22} color="#fff" />;

  const heroImage = track.id === 'balanced'
    ? balancedImage
    : track.id === 'aggressive'
      ? aggressiveImage
      : propertyImage;

  const trackMilestones = track.milestones;
  const completedCount  = trackMilestones.filter(m => milestoneMap[m.id]).length;
  const totalCount      = trackMilestones.length;
  const progressPct     = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalXP         = trackMilestones.reduce((s, m) => milestoneMap[m.id] ? s + m.xp : s, 0);
  const maxXP           = trackMilestones.reduce((s, m) => s + m.xp, 0);
  const firstPendingIdx = trackMilestones.findIndex(m => !milestoneMap[m.id]);

  const nudgeText = track.nudgeTemplate({
    takeHome:     derived.tax.takeHome,
    rent:         financial.rent,
    ra:           financial.ra,
    grossMonthly: financial.grossMonthly,
  });

  return (
    <div className="tracks-page">


      <nav className="track-detail__breadcrumb">
        <Link to="/tracks" className="track-detail__breadcrumb-back">
          <ChevronLeft size={14} />
          Strategy Tracks
        </Link>
        <span className="track-detail__breadcrumb-sep">/</span>
        <span className="track-detail__breadcrumb-current">{track.name}</span>
      </nav>


      <div
        className={`track-detail__hero ${track.headerClass}`}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {isActiveTrack && (
          <div className="track-detail__hero-active-badge">
            Active Track
          </div>
        )}
        <div className="track-detail__hero-icon">{trackIcon}</div>
        <div className="track-detail__hero-tagline">{track.tagline}</div>
        <h1 className="track-detail__hero-name">{track.name}</h1>
        <p className="track-detail__hero-pitch">{track.pitch}</p>


        <div className="track-detail__hero-progress">
          <div className="track-detail__hero-ring-wrap">
            <ProgressRing pct={progressPct} color="#fff" trackColor="rgba(255,255,255,0.2)" size={52} stroke={4} />
            <span className="track-detail__hero-ring-label">{progressPct}%</span>
          </div>
          <div className="track-detail__hero-stats">
            <span className="track-detail__hero-stat-val">{completedCount}/{totalCount}</span>
            <span className="track-detail__hero-stat-sub">milestones</span>
            <span className="track-detail__hero-stat-val" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
              {totalXP.toLocaleString('en-ZA')} XP
            </span>
            <span className="track-detail__hero-stat-sub">of {maxXP.toLocaleString('en-ZA')}</span>
          </div>
        </div>
      </div>


      <div className="track-detail__action-bar">
        <div className="track-detail__action-bar-left">
          <span className="track-detail__outcome-pill">{track.outcome}</span>
        </div>
        <div className="track-detail__action-bar-right">

          {TRACKS.filter(t => t.id !== track.id).map(t => (
            <button
              key={t.id}
              className="track-detail__switch-btn"
              onClick={() => navigate(trackPath(t.id))}
            >
              {t.name} <ArrowRight size={12} />
            </button>
          ))}
          {!isActiveTrack && (
            <button className="track-detail__activate-btn" onClick={handleSetActive}>
              Set as Active Track
            </button>
          )}
        </div>
      </div>


      <div className="track-detail__tabs">
        {[
          { id: 'milestones', label: 'Milestones',     icon: <Target    size={14} /> },
          { id: 'rationale',  label: 'Why It Works',   icon: <BookOpen  size={14} /> },
          { id: 'allocation', label: 'Allocation',     icon: <BarChart2 size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            className={`track-detail__tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? { borderBottomColor: track.accentColor, color: track.accentColor } : {}}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>


      {activeTab === 'milestones' && (
        <div className="track-detail__body">

          {/* Progress bar */}
          <div className="milestones-progress-bar">
            <div className="milestones-progress-bar__fill"
              style={{ width: `${progressPct}%`, background: track.accentColor }} />
          </div>
          <div className="milestones-progress-label">
            <span>{completedCount} of {totalCount} milestones complete · {totalXP} XP earned</span>
            {completedCount > 0 && (
              <button
                className="milestones-reset-btn"
                onClick={() => {
                  const keys = trackMilestones.map(m => m.id);
                  setMilestoneMap(prev => {
                    const next = { ...prev };
                    keys.forEach(k => delete next[k]);
                    saveMilestones(next);
                    return next;
                  });
                }}
              >
                <RotateCcw size={11} /> Reset track
              </button>
            )}
          </div>

          <div className="milestones-timeline">
            {trackMilestones.map((m, i) => (
              <MilestoneRow
                key={m.id}
                milestone={m}
                index={i}
                isDone={!!milestoneMap[m.id]}
                isActive={i === firstPendingIdx}
                onToggle={toggleMilestone}
              />
            ))}
          </div>


          <div className="track-nudge">
            <div className="track-nudge__label"><Zap size={11} /> Track Nudge</div>
            <p className="track-nudge__text">{nudgeText}</p>
          </div>


          <div className="track-tradeoffs">
            <div className="track-tradeoffs__title">
              <AlertTriangle size={13} /> Trade-offs
            </div>
            {track.tradeoffs.map((t, i) => (
              <div key={i} className="track-tradeoff-item">{t}</div>
            ))}
          </div>


          <div className="track-warnings">
            <div className="track-warnings__title">
              <Shield size={13} /> SA Context — Watch out for
            </div>
            {track.warnings.map((w, i) => (
              <div key={i} className="track-warning-item">{w}</div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: WHY IT WORKS*/}
      {activeTab === 'rationale' && (
        <div className="track-detail__body track-detail__body--rationale">
          <div className="rationale-hero">
            <div className={`rationale-hero__icon-wrap ${track.headerClass}`}>{trackIcon}</div>
            <div>
              <div className="rationale-hero__tagline">{track.tagline}</div>
              <div className="rationale-hero__outcome">{track.outcome}</div>
            </div>
          </div>

          <div className="rationale-body">
            <h4 className="rationale-body__heading">Why this track works</h4>
            <p className="rationale-body__text">{track.rationale}</p>
          </div>

          <div className="rationale-grid">
            <div className="rationale-col">
              <div className="rationale-col__title" style={{ color: 'var(--positive)' }}>
                <CheckCircle size={13} /> Prioritises
              </div>
              {track.priorities.map((p, i) => (
                <div key={i} className="rationale-list-item rationale-list-item--pos">{p}</div>
              ))}
            </div>
            <div className="rationale-col">
              <div className="rationale-col__title" style={{ color: 'var(--negative)' }}>
                <TrendingDown size={13} /> Avoids
              </div>
              {track.avoids.map((a, i) => (
                <div key={i} className="rationale-list-item rationale-list-item--neg">{a}</div>
              ))}
            </div>
          </div>

          <div className="rationale-tradeoffs">
            <div className="rationale-tradeoffs__title">
              <AlertTriangle size={13} /> Deliberate trade-offs this track makes
            </div>
            {track.tradeoffs.map((t, i) => (
              <div key={i} className="rationale-tradeoff">{t}</div>
            ))}
          </div>
        </div>
      )}


      {activeTab === 'allocation' && (
        <div className="track-detail__body track-detail__body--allocation">
          <p className="allocation-intro">
            Suggested allocation of your <strong>free capital</strong> (after fixed costs) on this track.
            {derived.freeCapital > 0
              ? ` At your current income, that's approximately R${Math.round(derived.freeCapital).toLocaleString('en-ZA')}/month to allocate.`
              : ' Update your income and expenses in Money Snapshot to see your personalised free capital.'
            }
          </p>

          <AllocationBar model={track.allocationModel} />

          {derived.freeCapital > 0 && (
            <div className="allocation-live-table">
              <div className="allocation-live-table__heading">
                At R{Math.round(derived.freeCapital).toLocaleString('en-ZA')}/month free capital
              </div>
              <div className="allocation-live-rows">
                {track.allocationModel.map((seg, i) => {
                  const rand = Math.round(derived.freeCapital * seg.pct / 100);
                  return (
                    <div key={i} className="allocation-live-row">
                      <span className="allocation-live-dot" style={{ background: seg.color }} />
                      <span className="allocation-live-label">{seg.label}</span>
                      <span className="allocation-live-pct">{seg.pct}%</span>
                      <span className="allocation-live-rand">R{rand.toLocaleString('en-ZA')}/pm</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="allocation-disclaimer">
            <Info size={12} />
            This is a suggested allocation model, not financial advice. Adjust based on your personal circumstances and goals.
          </div>
        </div>
      )}


      {celebrationId && (
        <div className="milestone-celebration">
          <Award size={18} />
          <div>
            <div className="milestone-celebration__title">Milestone Complete!</div>
            <div className="milestone-celebration__sub">
              +{trackMilestones.find(m => m.id === celebrationId)?.xp ?? 0} XP earned
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
