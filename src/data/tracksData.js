
import { calculateTax } from '../context/FinancialContext';


export const SLUG_TO_ID = {
  'first-property-path': 'property',
  'balanced-lifestyle':  'balanced',
  'aggressive-global':   'aggressive',
};

export const ID_TO_SLUG = {
  property:   'first-property-path',
  balanced:   'balanced-lifestyle',
  aggressive: 'aggressive-global',
};


export function trackPath(id) {
  return `/tracks/${ID_TO_SLUG[id] || id}`;
}


export function getTrackBySlug(slug) {
  const id = SLUG_TO_ID[slug];
  return TRACKS.find(t => t.id === id) || null;
}


export function getTrackById(id) {
  return TRACKS.find(t => t.id === id) || null;
}



export const MILESTONE_KEY = 'ws_milestones';

export function loadMilestones() {
  try { return JSON.parse(localStorage.getItem(MILESTONE_KEY) || '{}'); }
  catch { return {}; }
}

export function saveMilestones(map) {
  try { localStorage.setItem(MILESTONE_KEY, JSON.stringify(map)); }
  catch { /* ignore quota errors */ }
}



export const TRACKS = [
  {
    id: 'property',
    slug: 'first-property-path',
    name: 'First Property Path',
    tagline: 'Own a home before 30.',
    pitch: 'Build your deposit fast. Get into the property market within 3 years.',
    headerClass: 'track-card__header--property',
    accentColor: '#7C8FD4',

    iconId: 'home',
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
      { id: 'prop-m1', label: 'Emergency fund at 3 months expenses',                   time: 'Month 6',  xp: 100 },
      { id: 'prop-m2', label: 'Deposit savings at R60 000+',                           time: 'Year 1',   xp: 150 },
      { id: 'prop-m3', label: 'Credit score reviewed — above 700 TransUnion',          time: 'Year 1',   xp: 80  },
      { id: 'prop-m4', label: 'Bond pre-qualification complete',                        time: 'Year 2',   xp: 200 },
      { id: 'prop-m5', label: 'Deposit savings at R120 000+ (target R180K)',           time: 'Year 2',   xp: 150 },
      { id: 'prop-m6', label: 'Property purchased or conscious pivot decision made',   time: 'Year 3',   xp: 500 },
      { id: 'prop-m7', label: 'Bond repayments replacing rent — net cost lower',       time: 'Year 4–5', xp: 300 },
    ],
    nudgeTemplate: ({ takeHome, rent }) => {
      const bondRepayment = 9840;
      const saving = (rent || 0) - bondRepayment;
      if (saving > 0)
        return `Bond repayment on a R900K property is ~R9 840/pm at current prime. That's R${saving.toLocaleString('en-ZA')} less than your rent — building equity instead of paying someone else's bond.`;
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
    slug: 'balanced-lifestyle',
    name: 'Balanced Lifestyle',
    tagline: 'Live well now. Build seriously for later.',
    pitch: 'Max your TFSA and RA while enjoying life. No guilt, no extremes.',
    headerClass: 'track-card__header--balanced',
    accentColor: '#1f6b47',
    iconId: 'trending-up',
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
      'Less aggressive wealth accumulation than the Aggressive track over a 10-year horizon',
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
      { id: 'bal-m1', label: 'TFSA open — R3 000/month contribution active',              time: 'Month 3', xp: 120 },
      { id: 'bal-m2', label: 'Emergency fund at 3 months expenses',                        time: 'Month 6', xp: 100 },
      { id: 'bal-m3', label: 'R36 000 TFSA annual contribution complete',                  time: 'Year 1',  xp: 200 },
      { id: 'bal-m4', label: 'RA opened — contributing for PAYE reduction',                time: 'Year 1',  xp: 150 },
      { id: 'bal-m5', label: 'Emergency fund at 6 months expenses',                        time: 'Year 2',  xp: 150 },
      { id: 'bal-m6', label: 'Portfolio at R80 000+ (TFSA + RA combined)',                 time: 'Year 2',  xp: 200 },
      { id: 'bal-m7', label: 'Net worth positive — investments exceed all debt',           time: 'Year 3',  xp: 300 },
      { id: 'bal-m8', label: 'R250 000+ invested — property decision point reached',       time: 'Year 5',  xp: 500 },
    ],
    nudgeTemplate: ({ ra, grossMonthly }) => {
      if (ra > 0) {
        const tax       = calculateTax(grossMonthly);
        const taxWithRa = calculateTax(Math.max(0, grossMonthly - ra));
        const saving    = tax.paye - taxWithRa.paye;
        if (saving > 0)
          return `Your R${ra.toLocaleString('en-ZA')}/month RA is saving you ~R${saving.toLocaleString('en-ZA')}/month in PAYE tax — R${(saving * 12).toLocaleString('en-ZA')}/year back from SARS.`;
      }
      return `At your income, an R8 000/month RA contribution would save ~R2 880/month in PAYE tax. That's R34 560/year from SARS that you're currently leaving on the table.`;
    },
    allocationModel: [
      { label: 'TFSA',           pct: 25, color: '#1f6b47' },
      { label: 'RA',             pct: 15, color: '#2d8a5e' },
      { label: 'Emergency fund', pct: 15, color: '#5BA08E' },
      { label: 'Fixed costs',    pct: 35, color: '#C1848A' },
      { label: 'Lifestyle',      pct: 10, color: '#94845B' },
    ],
  },

  {
    id: 'aggressive',
    slug: 'aggressive-global',
    name: 'Aggressive Global',
    tagline: 'Maximise long-term wealth. Minimise SA exposure.',
    pitch: 'Go global. Max out RA & TFSA, heavy offshore. Target R1M+ by 32.',
    headerClass: 'track-card__header--aggressive',
    accentColor: '#7C9BC4',
    iconId: 'globe',
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
      { id: 'agg-m1', label: 'RA and TFSA open at max contributions',                    time: 'Month 1', xp: 200 },
      { id: 'agg-m2', label: 'Offshore brokerage account open (EasyEquities/Investec)',  time: 'Month 2', xp: 150 },
      { id: 'agg-m3', label: 'R200K+ in global ETFs (MSCI World / S&P 500)',             time: 'Year 1',  xp: 300 },
      { id: 'agg-m4', label: 'R36K TFSA contribution complete — year 1',                 time: 'Year 1',  xp: 200 },
      { id: 'agg-m5', label: 'R500K+ total invested portfolio',                           time: 'Year 2',  xp: 400 },
      { id: 'agg-m6', label: 'SARB SDA strategy reviewed — R1M allowance optimised',    time: 'Year 3',  xp: 200 },
      { id: 'agg-m7', label: 'Portfolio rebalanced to target 60%+ offshore allocation', time: 'Year 3',  xp: 150 },
      { id: 'agg-m8', label: 'R1M+ portfolio — full FIRE roadmap modelled',              time: 'Year 5',  xp: 700 },
    ],
    nudgeTemplate: ({ takeHome }) => {
      const investable = Math.round((takeHome || 0) * 0.4);
      return `At your income, investing R${investable.toLocaleString('en-ZA')}/month (40% of take-home) at 10% real return for 5 years = ~R${Math.round(investable * 12 * 6.1).toLocaleString('en-ZA')}. You're on pace for a R1M portfolio by 32.`;
    },
    allocationModel: [
      { label: 'Offshore ETFs',  pct: 45, color: '#7C9BC4' },
      { label: 'TFSA',           pct: 15, color: '#5BA08E' },
      { label: 'RA',             pct: 20, color: '#1f6b47' },
      { label: 'Fixed costs',    pct: 15, color: '#C1848A' },
      { label: 'Emergency fund', pct:  5, color: '#94845B' },
    ],
  },
];

export const COMPARISON_ROWS = [
  { label: 'Property',   key: 'property' },
  { label: 'RA',         key: 'ra'       },
  { label: 'Offshore',   key: 'offshore' },
  { label: 'Risk Level', key: 'risk'     },
];

export const RISK_PILL = {
  Low:    'comparison-pill--low',
  Medium: 'comparison-pill--medium',
  High:   'comparison-pill--high',
};
