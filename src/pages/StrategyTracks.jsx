import { useState, useCallback } from 'react';
import '../styles/StrategyTracks.css';
import { useFinancial, calculateTax } from '../context/FinancialContext';
import {
  Home, TrendingUp, Globe, CheckCircle, Clock, Circle,
  ChevronRight, ChevronLeft, AlertTriangle, Zap, BookOpen,
  BarChart2, Target, Award, RotateCcw, Info, ArrowRight,
  Shield, DollarSign, TrendingDown,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TRACK DATA
// Rich content per track: priorities, avoids, trade-offs, warnings, rationale,
// milestones with unique IDs for persistence, and personalised nudge templates.
// ─────────────────────────────────────────────────────────────────────────────

const TRACKS = [
  {
    id: 'property',
    name: 'First Property Path',
    tagline: 'Own a home before 30.',
    pitch: 'Build your deposit fast. Get into the property market within 3 years.',
    headerClass: 'track-card__header--property',
    accentColor: '#7C8FD4',
    icon: <Home size={22} color="#fff" />,
    priorities: [
      'Save 20% deposit — avoid LTV premium on bond',
      'Get bond pre-qualified at ABSA or FNB',
      'Build 3-month emergency fund first',
      'Use low-risk savings (32-day notice, money market)',
    ],
    avoids: [
      'Offshore equity before deposit is secured',
      'Lifestyle upgrades that erode monthly surplus',
      'Balloon vehicle finance (inflates DTI ratio)',
      'Opening too many credit accounts before bond application',
    ],
    tradeoffs: [
      'RA contributions minimised short-term — sacrificing tax deduction and compound growth',
      'TFSA contributions are secondary — deposit takes priority over tax-free investing',
      'Offshore exposure is deferred — ZAR depreciation risk accepted for 3 years',
    ],
    warnings: [
      'Cape Town entry level is R1.4M+ — this track is optimised for JHB/Pretoria where R900K–R1.1M is realistic',
      'Transfer duty is 0% under R1.1M — targeting sub-R1.1M saves ~R10–19K in upfront costs',
      'Bond approval requires clean credit history for 12+ months before application',
    ],
    outcome: 'Own property by year 3, or make a conscious decision to pivot.',
    rationale: 'Property in South Africa remains one of the few leveraged wealth-building instruments available to people without large capital. A R900K bond at 12.75% builds equity from month one — rent builds zero equity. The deposit-first approach sacrifices short-term investment diversification for a tangible, leveraged asset with forced savings built in. For users in JHB and Pretoria where entry prices are still sub-R1.1M, this track has the highest risk-adjusted long-term wealth outcome of the three.',
    comparison: { property: 'Year 3 target', ra: 'Minimal', offshore: 'None', risk: 'Low' },
    milestones: [
      { id: 'prop-m1', label: 'Emergency fund at 3 months expenses',                    time: 'Month 6',   xp: 100, defaultStatus: 'active'  },
      { id: 'prop-m2', label: 'Deposit savings at R60 000+',                            time: 'Year 1',    xp: 150, defaultStatus: 'pending' },
      { id: 'prop-m3', label: 'Credit score reviewed — above 700 TransUnion',           time: 'Year 1',    xp: 80,  defaultStatus: 'pending' },
      { id: 'prop-m4', label: 'Bond pre-qualification complete',                         time: 'Year 2',    xp: 200, defaultStatus: 'pending' },
      { id: 'prop-m5', label: 'Deposit savings at R120 000+ (target R180K)',            time: 'Year 2',    xp: 150, defaultStatus: 'pending' },
      { id: 'prop-m6', label: 'Property purchased or conscious pivot decision made',    time: 'Year 3',    xp: 500, defaultStatus: 'pending' },
      { id: 'prop-m7', label: 'Bond repayments replacing rent — net cost lower',        time: 'Year 4–5',  xp: 300, defaultStatus: 'pending' },
    ],
    nudgeTemplate: ({ takeHome, rent, ra }) => {
      const bondRepayment = 9840;
      const saving = rent - bondRepayment;
      if (saving > 0) return `Bond repayment on a R900K property is ~R9 840/pm at current prime. That's R${saving.toLocaleString('en-ZA')} less than your rent — building equity instead of paying someone else's bond.`;
      return `At your current rent level, a R900K bond repayment of R9 840/pm is comparable. The difference: every payment builds equity you own.`;
    },
    allocationModel: [
      { label: 'Deposit savings', pct: 40, color: '#7C8FD4' },
      { label: 'Emergency fund',  pct: 20, color: '#5BA08E' },
      { label: 'Fixed costs',     pct: 30, color: '#C1848A' },
      { label: 'Lifestyle',       pct: 10, color: '#94845B' },
    ],
  },
  {
    id: 'balanced',
    name: 'Balanced Lifestyle',
    tagline: 'Live well now. Build seriously for later.',
    pitch: 'Max your TFSA and RA while enjoying life. No guilt, no extremes.',
    headerClass: 'track-card__header--balanced',
    accentColor: '#1f6b47',
    icon: <TrendingUp size={22} color="#fff" />,
    priorities: [
      'Max TFSA — R36 000/yr, zero tax on growth',
      'RA contributions for PAYE tax reduction',
      '6-month emergency fund target',
      'Conscious lifestyle spend within a defined envelope',
    ],
    avoids: [
      'Property fixation before financial foundations are solid',
      'Lifestyle guilt — this track validates quality-of-life spending',
      'Panic-driven financial decisions during market volatility',
      'Lifestyle inflation that erodes the savings envelope',
    ],
    tradeoffs: [
      'Slower deposit accumulation — property decision deferred to year 5',
      'Less aggressive wealth accumulation than Track 3 over a 10-year horizon',
      'Deliberate balance means neither goal is fully optimised — but both are meaningfully progressed',
    ],
    warnings: [
      'TFSA withdrawals permanently reduce your R500K lifetime cap — treat as long-term capital',
      'RA deduction is up to 27.5% of gross income — excess contributions get no immediate tax benefit',
      'Lifestyle envelope must be defined explicitly — "conscious spending" without a number drifts upward',
    ],
    outcome: 'R250K+ invested by year 5, net worth positive by year 3.',
    rationale: 'Generic financial advice paralysis comes from trying to do everything at once. The Balanced track solves this by sequencing deliberately: emergency fund first, then TFSA, then RA, then property optionality. The RA deduction at higher income brackets (31–36%+) effectively returns R1 500–R2 500/month from SARS — making the RA contribution cost significantly less than its face value. This track is best for users who want compound growth, tax efficiency, and lifestyle quality simultaneously, and are willing to accept that property is a year-5 decision rather than year-3.',
    comparison: { property: 'Year 5 option', ra: 'Maxed', offshore: 'Moderate', risk: 'Medium' },
    milestones: [
      { id: 'bal-m1', label: 'TFSA open — R3 000/month contribution active',                  time: 'Month 3',  xp: 120, defaultStatus: 'done'    },
      { id: 'bal-m2', label: 'Emergency fund at 3 months expenses',                            time: 'Month 6',  xp: 100, defaultStatus: 'active'  },
      { id: 'bal-m3', label: 'R36 000 TFSA annual contribution complete',                      time: 'Year 1',   xp: 200, defaultStatus: 'pending' },
      { id: 'bal-m4', label: 'RA opened — contributing for PAYE reduction',                    time: 'Year 1',   xp: 150, defaultStatus: 'pending' },
      { id: 'bal-m5', label: 'Emergency fund at 6 months expenses',                            time: 'Year 2',   xp: 150, defaultStatus: 'pending' },
      { id: 'bal-m6', label: 'Portfolio at R80 000+ (TFSA + RA combined)',                     time: 'Year 2',   xp: 200, defaultStatus: 'pending' },
      { id: 'bal-m7', label: 'Net worth positive — investments exceed all debt',               time: 'Year 3',   xp: 300, defaultStatus: 'pending' },
      { id: 'bal-m8', label: 'R250 000+ invested — property decision point reached',           time: 'Year 5',   xp: 500, defaultStatus: 'pending' },
    ],
    nudgeTemplate: ({ takeHome, ra, grossMonthly }) => {
      const tax = calculateTax(grossMonthly);
      const taxWithRa = calculateTax(grossMonthly - (ra || 0));
      const saving = tax.paye - taxWithRa.paye;
      if (ra > 0 && saving > 0) return `Your R${ra.toLocaleString('en-ZA')}/month RA is saving you ~R${saving.toLocaleString('en-ZA')}/month in PAYE tax — R${(saving * 12).toLocaleString('en-ZA')}/year back from SARS.`;
      return `At your income, an R8 000/month RA contribution would save ~R2 880/month in PAYE tax. That's R34 560/year from SARS that you're currently leaving on the table.`;
    },
    allocationModel: [
      { label: 'TFSA',            pct: 25, color: '#1f6b47' },
      { label: 'RA',              pct: 15, color: '#2d8a5e' },
      { label: 'Emergency fund',  pct: 15, color: '#5BA08E' },
      { label: 'Fixed costs',     pct: 35, color: '#C1848A' },
      { label: 'Lifestyle',       pct: 10, color: '#94845B' },
    ],
  },
  {
    id: 'aggressive',
    name: 'Aggressive Global',
    tagline: 'Maximise long-term wealth. Minimise SA exposure.',
    pitch: 'Go global. Max out RA & TFSA, heavy offshore. Target R1M+ by 32.',
    headerClass: 'track-card__header--aggressive',
    accentColor: '#7C9BC4',
    icon: <Globe size={22} color="#fff" />,
    priorities: [
      'Offshore equity ETFs — Satrix MSCI World, CoreShares S&P 500',
      'Max RA at 27.5% of income for compounding + PAYE reduction',
      'Max TFSA R36K/year — tax-free compound growth',
      'Use R1M SARB Single Discretionary Allowance annually',
    ],
    avoids: [
      'SA property in first 5 years — opportunity cost is too high',
      'Lifestyle inflation of any kind',
      'Balloon vehicle finance',
      'Low-yield local savings accounts beyond emergency fund',
    ],
    tradeoffs: [
      'Zero property equity — renting is a deliberate, financially modelled choice',
      'Lifestyle is constrained — the track requires discipline most people underestimate',
      'High equity concentration means short-term volatility is unavoidable and must be emotionally tolerated',
      'SARB reporting obligations for direct offshore — SARS requires disclosure of foreign assets',
    ],
    warnings: [
      'This track only works for users with genuine 5–10 year time horizons and emotional tolerance for 20–30% drawdowns',
      'ZAR depreciation is a feature, not a bug — your offshore returns include currency gains that are subject to CGT',
      'CGT on offshore gains: 40% inclusion rate × your marginal rate. At 36% bracket, effective CGT = 14.4%',
    ],
    outcome: 'R1M+ portfolio by year 5. Financial independence roadmap ready.',
    rationale: 'ZAR has depreciated ~6.5% annually against USD over the last decade. A purely SA-invested portfolio loses purchasing power in USD terms every year, regardless of nominal rand returns. The Aggressive Global track accepts this reality and acts on it: maximum offshore allocation within SARB rules, compounded with the most tax-efficient SA vehicles (TFSA + RA). The R1M by 32 target is achievable for someone earning R40K+ net — it requires ~R15–18K/month in total investment contributions consistently over 5 years at 10% real return.',
    comparison: { property: 'Not in plan', ra: 'Maxed', offshore: 'High (60%+)', risk: 'High' },
    milestones: [
      { id: 'agg-m1', label: 'RA and TFSA open at max contributions (month 1)',            time: 'Month 1',  xp: 200, defaultStatus: 'done'    },
      { id: 'agg-m2', label: 'Offshore brokerage account open (EasyEquities/Investec)',   time: 'Month 2',  xp: 150, defaultStatus: 'active'  },
      { id: 'agg-m3', label: 'R200K+ in global ETFs (MSCI World / S&P 500)',              time: 'Year 1',   xp: 300, defaultStatus: 'pending' },
      { id: 'agg-m4', label: 'R36K TFSA contribution complete — year 1',                  time: 'Year 1',   xp: 200, defaultStatus: 'pending' },
      { id: 'agg-m5', label: 'R500K+ total invested portfolio',                            time: 'Year 2',   xp: 400, defaultStatus: 'pending' },
      { id: 'agg-m6', label: 'SARB SDA strategy reviewed — R1M allowance optimised',     time: 'Year 3',   xp: 200, defaultStatus: 'pending' },
      { id: 'agg-m7', label: 'Portfolio rebalanced to target 60%+ offshore allocation',  time: 'Year 3',   xp: 150, defaultStatus: 'pending' },
      { id: 'agg-m8', label: 'R1M+ portfolio — full FIRE roadmap modelled',               time: 'Year 5',   xp: 700, defaultStatus: 'pending' },
    ],
    nudgeTemplate: ({ takeHome, grossMonthly }) => {
      const investable = Math.round(takeHome * 0.4);
      return `At your income, investing R${investable.toLocaleString('en-ZA')}/month (40% of take-home) at 10% real return for 5 years = ~R${Math.round(investable * 12 * 6.1).toLocaleString('en-ZA')}. You're on pace for a R1M portfolio by 32.`;
    },
    allocationModel: [
      { label: 'Offshore ETFs',   pct: 45, color: '#7C9BC4' },
      { label: 'TFSA',            pct: 15, color: '#5BA08E' },
      { label: 'RA',              pct: 20, color: '#1f6b47' },
      { label: 'Fixed costs',     pct: 15, color: '#C1848A' },
      { label: 'Emergency fund',  pct:  5, color: '#94845B' },
    ],
  },
];

const COMPARISON_ROWS = [
  { label: 'Property',     key: 'property' },
  { label: 'RA',           key: 'ra'       },
  { label: 'Offshore',     key: 'offshore' },
  { label: 'Risk Level',   key: 'risk'     },
];

const RISK_PILL = {
  Low:    'comparison-pill--low',
  Medium: 'comparison-pill--medium',
  High:   'comparison-pill--high',
};

// ─────────────────────────────────────────────────────────────────────────────
// MILESTONE PERSISTENCE KEY
// Stored in localStorage under ws_milestones as { [milestoneId]: boolean }
// ─────────────────────────────────────────────────────────────────────────────

const MILESTONE_KEY = 'ws_milestones';

function loadMilestones() {
  try { return JSON.parse(localStorage.getItem(MILESTONE_KEY) || '{}'); }
  catch { return {}; }
}

function saveMilestones(map) {
  try { localStorage.setItem(MILESTONE_KEY, JSON.stringify(map)); }
  catch { /* ignore */ }
}


function ProgressRing({ pct, size = 56, stroke = 5, color = '#b28a50', trackColor = '#e8e6e1' }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
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
          <div
            key={i}
            className="allocation-bar__seg"
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

/** Single interactive milestone row */
function MilestoneRow({ milestone, index, isDone, isActive, onToggle }) {
  const status = isDone ? 'done' : isActive ? 'active' : 'pending';
  return (
    <div className={`milestone-row milestone-row--${status}`}>
      {/* Connector line */}
      <div className="milestone-row__connector" />

      {/* Dot / button */}
      <button
        className={`milestone-dot milestone-dot--${status}`}
        onClick={() => onToggle(milestone.id)}
        aria-label={isDone ? `Undo: ${milestone.label}` : `Complete: ${milestone.label}`}
        title={isDone ? 'Click to undo' : 'Click to mark complete'}
      >
        {isDone ? <CheckCircle size={13} /> : isActive ? index + 1 : index + 1}
      </button>

      <div className="milestone-content">
        <div className="milestone-header">
          <span className="milestone-time">
            <Clock size={10} /> {milestone.time}
          </span>
          <span className="milestone-xp">
            <Zap size={10} /> +{milestone.xp} XP
          </span>
        </div>
        <div className={`milestone-desc${isDone ? ' milestone-desc--done' : ''}`}>
          {milestone.label}
        </div>
      </div>
    </div>
  );
}

/** Track selection card in the grid */
function TrackCard({ track, isActive, onSelect }) {
  return (
    <div
      className={`track-card${isActive ? ' active-track' : ''}`}
      onClick={() => onSelect(track.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(track.id)}
      aria-pressed={isActive}
    >
      <div className={`track-card__header ${track.headerClass}`}>
        {isActive && <div className="track-card__active-badge">Active</div>}
        <div className="track-card__icon">{track.icon}</div>
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

        <button
          className={`track-card__select-btn${isActive ? ' selected' : ''}`}
          onClick={e => { e.stopPropagation(); onSelect(track.id); }}
        >
          {isActive ? '✓ Active Track' : 'Select This Track'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function StrategyTracks() {
  const { financial, updateFinancial, derived } = useFinancial();

  // Which track's detail panel is open (defaults to active track)
  const [detailTrackId, setDetailTrackId] = useState(financial.selectedTrack || 'balanced');
  const [detailTab, setDetailTab]         = useState('milestones'); // milestones | rationale | allocation
  const [celebrationId, setCelebrationId] = useState(null);

  // Milestone completion state — keyed by milestone ID, value = boolean
  const [milestoneMap, setMilestoneMap] = useState(loadMilestones);

  const handleSelect = useCallback((id) => {
    updateFinancial({ selectedTrack: id });
    setDetailTrackId(id);
  }, [updateFinancial]);

  const toggleMilestone = useCallback((milestoneId) => {
    setMilestoneMap(prev => {
      const next = { ...prev, [milestoneId]: !prev[milestoneId] };
      saveMilestones(next);
      // Trigger celebration only when marking DONE (not undoing)
      if (!prev[milestoneId]) setCelebrationId(milestoneId);
      return next;
    });
  }, []);

  // Dismiss celebration after 2.4s
  if (celebrationId) {
    setTimeout(() => setCelebrationId(null), 2400);
  }

  const activeTrack = TRACKS.find(t => t.id === (financial.selectedTrack || 'balanced'));
  const detailTrack = TRACKS.find(t => t.id === detailTrackId) || activeTrack;

  // Progress stats for detail track
  const trackMilestones  = detailTrack.milestones;
  const completedIds     = trackMilestones.filter(m => milestoneMap[m.id]).map(m => m.id);
  const completedCount   = completedIds.length;
  const totalCount       = trackMilestones.length;
  const progressPct      = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalXP          = trackMilestones.reduce((s, m) => milestoneMap[m.id] ? s + m.xp : s, 0);
  const maxXP            = trackMilestones.reduce((s, m) => s + m.xp, 0);

  // Which milestone is currently "active" = first pending one
  const firstPendingIdx  = trackMilestones.findIndex(m => !milestoneMap[m.id]);

  // Live nudge from FinancialContext
  const nudgeText = detailTrack.nudgeTemplate({
    takeHome:     derived.tax.takeHome,
    rent:         financial.rent,
    ra:           financial.ra,
    grossMonthly: financial.grossMonthly,
  });

  return (
    <div className="tracks-page">

      {/* ── Header ── */}
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
          </div>
        )}
      </div>

      {/* ── Track selection grid ── */}
      <div className="tracks-grid">
        {TRACKS.map(track => (
          <TrackCard
            key={track.id}
            track={track}
            isActive={financial.selectedTrack === track.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* ── Detail Panel (tab-based, deep-dives the selected/active track) ── */}
      <div className="track-detail-panel">

        {/* Detail panel header — track switcher */}
        <div className="track-detail-panel__header">
          <div className="track-detail-panel__track-switcher">
            {TRACKS.map(t => (
              <button
                key={t.id}
                className={`track-switcher-btn${detailTrackId === t.id ? ' active' : ''}`}
                onClick={() => setDetailTrackId(t.id)}
                style={detailTrackId === t.id ? { borderColor: t.accentColor, color: t.accentColor } : {}}
              >
                <span className="track-switcher-btn__icon">{t.icon}</span>
                <span>{t.name}</span>
                {financial.selectedTrack === t.id && (
                  <span className="track-switcher-btn__active-dot" />
                )}
              </button>
            ))}
          </div>

          {/* Progress summary strip */}
          <div className="track-detail-panel__progress-strip">
            <div className="progress-strip__ring-wrap">
              <ProgressRing
                pct={progressPct}
                color={detailTrack.accentColor}
                size={52}
                stroke={4}
              />
              <span className="progress-strip__ring-label">{progressPct}%</span>
            </div>
            <div className="progress-strip__stats">
              <div className="progress-strip__stat">
                <span className="progress-strip__stat-value">{completedCount}/{totalCount}</span>
                <span className="progress-strip__stat-label">milestones</span>
              </div>
              <div className="progress-strip__stat">
                <span className="progress-strip__stat-value" style={{ color: 'var(--gold)' }}>
                  {totalXP.toLocaleString('en-ZA')} XP
                </span>
                <span className="progress-strip__stat-label">of {maxXP.toLocaleString('en-ZA')} total</span>
              </div>
            </div>
            {/* XP bar */}
            <div className="progress-strip__xp-bar">
              <div
                className="progress-strip__xp-fill"
                style={{ width: `${maxXP > 0 ? (totalXP / maxXP) * 100 : 0}%`, background: detailTrack.accentColor }}
              />
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="track-detail-panel__tabs">
          {[
            { id: 'milestones', label: 'Milestones', icon: <Target size={14} /> },
            { id: 'rationale',  label: 'Why It Works', icon: <BookOpen size={14} /> },
            { id: 'allocation', label: 'Allocation Model', icon: <BarChart2 size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              className={`track-detail-tab${detailTab === tab.id ? ' active' : ''}`}
              onClick={() => setDetailTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Milestones ── */}
        {detailTab === 'milestones' && (
          <div className="track-detail-panel__body">
            {/* Progress bar */}
            <div className="milestones-progress-bar">
              <div className="milestones-progress-bar__fill"
                style={{ width: `${progressPct}%`, background: detailTrack.accentColor }} />
            </div>
            <div className="milestones-progress-label">
              <span>{completedCount} of {totalCount} milestones complete</span>
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

            {/* Live nudge */}
            <div className="track-nudge">
              <div className="track-nudge__label"><Zap size={11} /> Track Nudge</div>
              <p className="track-nudge__text">{nudgeText}</p>
            </div>

            {/* Trade-offs */}
            <div className="track-tradeoffs">
              <div className="track-tradeoffs__title">
                <AlertTriangle size={13} /> Trade-offs
              </div>
              {detailTrack.tradeoffs.map((t, i) => (
                <div key={i} className="track-tradeoff-item">{t}</div>
              ))}
            </div>

            {/* Warnings */}
            <div className="track-warnings">
              <div className="track-warnings__title">
                <Shield size={13} /> SA Context — Watch out for
              </div>
              {detailTrack.warnings.map((w, i) => (
                <div key={i} className="track-warning-item">{w}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Why It Works ── */}
        {detailTab === 'rationale' && (
          <div className="track-detail-panel__body track-detail-panel__body--rationale">
            <div className="rationale-hero">
              <div className={`rationale-hero__icon-wrap ${detailTrack.headerClass}`}>
                {detailTrack.icon}
              </div>
              <div>
                <div className="rationale-hero__tagline">{detailTrack.tagline}</div>
                <div className="rationale-hero__outcome">{detailTrack.outcome}</div>
              </div>
            </div>

            <div className="rationale-body">
              <h4 className="rationale-body__heading">Why this track works</h4>
              <p className="rationale-body__text">{detailTrack.rationale}</p>
            </div>

            <div className="rationale-grid">
              <div className="rationale-col">
                <div className="rationale-col__title" style={{ color: 'var(--positive)' }}>
                  <CheckCircle size={13} /> Prioritises
                </div>
                {detailTrack.priorities.map((p, i) => (
                  <div key={i} className="rationale-list-item rationale-list-item--pos">{p}</div>
                ))}
              </div>
              <div className="rationale-col">
                <div className="rationale-col__title" style={{ color: 'var(--negative)' }}>
                  <TrendingDown size={13} /> Avoids
                </div>
                {detailTrack.avoids.map((a, i) => (
                  <div key={i} className="rationale-list-item rationale-list-item--neg">{a}</div>
                ))}
              </div>
            </div>

            <div className="rationale-tradeoffs">
              <div className="rationale-tradeoffs__title">
                <AlertTriangle size={13} /> Deliberate trade-offs this track makes
              </div>
              {detailTrack.tradeoffs.map((t, i) => (
                <div key={i} className="rationale-tradeoff">{t}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Allocation Model ── */}
        {detailTab === 'allocation' && (
          <div className="track-detail-panel__body track-detail-panel__body--allocation">
            <p className="allocation-intro">
              Suggested allocation of your <strong>free capital</strong> (after fixed costs) on this track.
              {derived.freeCapital > 0
                ? ` At your current income, that's approximately R${Math.round(derived.freeCapital).toLocaleString('en-ZA')}/month to allocate.`
                : ' Update your income and expenses in Money Snapshot to see your personalised free capital.'
              }
            </p>

            <AllocationBar model={detailTrack.allocationModel} />

            {/* Live numbers if we have financial data */}
            {derived.freeCapital > 0 && (
              <div className="allocation-live-table">
                <div className="allocation-live-table__heading">
                  At R{Math.round(derived.freeCapital).toLocaleString('en-ZA')}/month free capital
                </div>
                <div className="allocation-live-rows">
                  {detailTrack.allocationModel.map((seg, i) => {
                    const rand = Math.round(derived.freeCapital * seg.pct / 100);
                    return (
                      <div key={i} className="allocation-live-row">
                        <span className="allocation-live-dot" style={{ background: seg.color }} />
                        <span className="allocation-live-label">{seg.label}</span>
                        <span className="allocation-live-pct">{seg.pct}%</span>
                        <span className="allocation-live-rand">
                          R{rand.toLocaleString('en-ZA')}/pm
                        </span>
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
      </div>

      {/* ── Comparison table ── */}
      <div className="tracks-comparison">
        <div className="tracks-comparison__header">
          <div className="tracks-comparison__title">Quick Comparison</div>
        </div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Factor</th>
              {TRACKS.map(t => <th key={t.id}>{t.name}</th>)}
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
              <td data-label="First Property Path">RA & offshore sacrificed short-term</td>
              <td data-label="Balanced Lifestyle">Slower deposit, less aggressive growth</td>
              <td data-label="Aggressive Global">Zero property equity, lifestyle constrained</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Why Strategy Tracks work ── */}
      <div className="tracks-explainer">
        <div className="tracks-explainer__title">Why Strategy Tracks work</div>
        <p>
          Generic financial advice says "do everything at once": max your RA, max your TFSA, save a deposit,
          invest offshore, build an emergency fund. For most people earning R30K–R70K/pm, this is paralyzing.
        </p>
        <p>
          Strategy Tracks solve this by making <strong>deliberate trade-offs</strong>. Each track picks a
          primary goal and builds a sequenced, realistic five-year plan around it. You don't do everything
          — you do the right things in the right order.
        </p>
        <p>
          You can switch tracks at any time. Your milestones, nudges, and Simulation Lab recommendations
          will update automatically.
        </p>
      </div>

      {/* ── Celebration toast ── */}
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
