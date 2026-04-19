import { useState } from 'react';
import '../styles/MoneySnapshot.css';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { Pencil, Info, Home, Shield, TrendingUp } from 'lucide-react';

const fmt = (v) => `R${Number(v || 0).toLocaleString('en-ZA')}`;
const pct = (v) => `${Number(v || 0).toFixed(1)}%`;

const NUDGES = [
  {
    id: 'ra',
    title: 'RA Tax Opportunity',
    body: 'At your salary bracket, an R8 000/month RA contribution saves you approximately R2 880 in PAYE tax every month.',
    action: 'Open RA',
    color: 'gold',
  },
  {
    id: 'tfsa',
    title: 'TFSA Headroom Available',
    body: 'You have R36 000/year in tax-free growth available. Every rand of growth, dividends, and withdrawals is zero tax.',
    action: 'Learn more',
    color: 'green',
  },
  {
    id: 'deposit',
    title: 'Deposit Goal On Track',
    body: 'At your current savings rate you\'re on track to hit your deposit target. Keep your free capital disciplined.',
    action: 'View goal',
    color: 'red',
  },
];

export default function MoneySnapshot() {
  const { financial, derived, updateFinancial } = useFinancial();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nudgeIdx, setNudgeIdx] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // local edit state
  const [draft, setDraft] = useState({ ...financial });

  const nudge = NUDGES[nudgeIdx % NUDGES.length];
  const firstName = user?.firstName || 'there';

  const takeHome = derived.tax.takeHome;
  const fixedPct = takeHome > 0 ? ((derived.totalFixedCosts / takeHome) * 100).toFixed(1) : 0;
  const savingsPct = takeHome > 0 ? ((derived.totalSavingsContributions / takeHome) * 100).toFixed(1) : 0;
  const freePct = takeHome > 0 ? ((Math.max(0, derived.freeCapital) / takeHome) * 100).toFixed(1) : 0;

  const depositPct = Math.min(100, parseFloat(derived.depositProgress));
  const emergencyPct = financial.emergencyFundTarget > 0
    ? Math.min(100, (financial.emergencyFund / financial.emergencyFundTarget) * 100)
    : 0;
  const tfsaMonthly = financial.tfsa;
  const tfsaYearlyPct = Math.min(100, ((tfsaMonthly * 12) / 36000) * 100);

  const debtToIncome = parseFloat(derived.debtToIncome);
  const debtStatus = debtToIncome > 35 ? 'at-risk' : debtToIncome > 20 ? 'warning' : 'on-track';
  const savingsRate = parseFloat(derived.savingsRate);
  const savingsStatus = savingsRate < 10 ? 'at-risk' : savingsRate >= 20 ? 'on-track' : 'warning';

  const handleSave = () => {
    const toNum = (v) => parseFloat(String(v).replace(/\s/g, '')) || 0;
    updateFinancial({
      grossMonthly: toNum(draft.grossMonthly),
      rent: toNum(draft.rent),
      carRepayment: toNum(draft.carRepayment),
      medicalAid: toNum(draft.medicalAid),
      insurance: toNum(draft.insurance),
      studentLoan: toNum(draft.studentLoan),
      tfsa: toNum(draft.tfsa),
      ra: toNum(draft.ra),
      emergencyFund: toNum(draft.emergencyFund),
      depositSaved: toNum(draft.depositSaved),
      depositTarget: toNum(draft.depositTarget),
    });
    setEditing(false);
  };

  const field = (label, key, hint) => (
    <div className="input-row" key={key}>
      <label>{label}{hint && <span className="input-hint"> — {hint}</span>}</label>
      <input
        type="number"
        value={draft[key] ?? ''}
        onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="snapshot fade-up">
      {/* ── Header ── */}
      <div className="snapshot__header">
        <div className="snapshot__header-left">
          <div className="snapshot__greeting">Good day, {firstName}</div>
          <h1 className="snapshot__title">Money Snapshot</h1>
          <p className="snapshot__subtitle">
            Your financial position, after tax, in plain terms.
          </p>
        </div>
        <button className="snapshot__edit-btn" onClick={() => { setDraft({ ...financial }); setEditing(e => !e); }}>
          <Pencil size={16} />
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/*nudge banner  */}
      {!nudgeDismissed && (
        <div className="nudge-banner fade-up fade-up-1">
          <div className="nudge-banner__icon">
            <Info size={16} />
          </div>
          <div className="nudge-banner__content">
            <div className="nudge-banner__title">{nudge.title}</div>
            <div className="nudge-banner__body">{nudge.body}</div>
          </div>
          <button className="nudge-banner__action">{nudge.action}</button>
          <button className="nudge-banner__dismiss" onClick={() => {
            if (nudgeIdx + 1 >= NUDGES.length) setNudgeDismissed(true);
            else setNudgeIdx(i => i + 1);
          }}>✕</button>
        </div>
      )}

      {/* stat tiles */}
      <div className="snapshot__tiles fade-up fade-up-2">
        <div className="stat-tile">
          <div className="stat-tile__accent stat-tile__accent--red" />
          <div className="stat-tile__label">Gross Monthly</div>
          <div className="stat-tile__value">{fmt(financial.grossMonthly)}</div>
          <div className="stat-tile__sub">Before PAYE &amp; UIF</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__accent stat-tile__accent--green" />
          <div className="stat-tile__label">Take-Home Pay</div>
          <div className="stat-tile__value">{fmt(derived.tax.takeHome)}</div>
          <div className="stat-tile__sub">
            <span className="stat-tile__indicator stat-tile__indicator--neutral">
              {pct((derived.tax.takeHome / financial.grossMonthly) * 100)} of gross
            </span>
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__accent stat-tile__accent--gold" />
          <div className="stat-tile__label">Tax &amp; UIF</div>
          <div className="stat-tile__value">{fmt(derived.tax.paye + derived.tax.uif)}</div>
          <div className="stat-tile__sub">
            <span className="stat-tile__indicator stat-tile__indicator--neutral">
              {derived.tax.effectiveRate}% effective rate
            </span>
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__accent stat-tile__accent--blue" />
          <div className="stat-tile__label">Free Capital</div>
          <div className="stat-tile__value">{fmt(Math.max(0, derived.freeCapital))}</div>
          <div className="stat-tile__sub">
            <span className={`stat-tile__indicator stat-tile__indicator--${derived.freeCapital > 0 ? 'positive' : 'negative'}`}>
              {derived.freeCapital > 0 ? 'Available' : 'Overcommitted'}
            </span>
          </div>
        </div>
      </div>

      {/* Main grid  */}
      <div className="snapshot__grid fade-up fade-up-3">
        <div className="snapshot__grid-left">

          {/* Income Reality / Edit Card */}
          <div className="income-card">
            <div className="income-card__header">
              <div className="income-card__title">Income Reality</div>
              <button className="income-card__edit" onClick={() => { setDraft({ ...financial }); setEditing(e => !e); }}>
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <div className="income-card__input-form">
                <div className="input-section-title">Income</div>
                {field('Gross Monthly Salary (R)', 'grossMonthly')}
                <div className="input-section-title">Fixed Costs</div>
                <div className="input-grid">
                  {field('Rent / Bond', 'rent')}
                  {field('Car Repayment', 'carRepayment')}
                  {field('Medical Aid', 'medicalAid')}
                  {field('Insurance', 'insurance')}
                  {field('Student Loan', 'studentLoan')}
                </div>
                <div className="input-section-title">Savings &amp; Goals</div>
                <div className="input-grid">
                  {field('TFSA Monthly (max R3 000)', 'tfsa', 'R36K/yr limit')}
                  {field('RA Monthly', 'ra', 'Up to 27.5% of income')}
                  {field('Emergency Fund Saved', 'emergencyFund')}
                  {field('Deposit Saved', 'depositSaved')}
                  {field('Deposit Target', 'depositTarget')}
                </div>
                <div className="input-actions">
                  <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                  <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="income-card__flow">
                <div className="income-flow-row">
                  <div className="income-flow__indicator" style={{ background: '#1C1917' }} />
                  <div className="income-flow__label">
                    Gross Salary
                    <span className="income-flow__label-sub">Before any deductions</span>
                  </div>
                  <div className="income-flow__amount">{fmt(financial.grossMonthly)}</div>
                </div>
                <div className="income-flow-row">
                  <div className="income-flow__indicator" style={{ background: 'var(--color-red)' }} />
                  <div className="income-flow__label">
                    PAYE Tax
                    <span className="income-flow__label-sub">SARS 2024/25 tables · {derived.tax.effectiveRate}% effective</span>
                  </div>
                  <div className="income-flow__amount income-flow__amount--deduction">−{fmt(derived.tax.paye)}</div>
                </div>
                <div className="income-flow-row">
                  <div className="income-flow__indicator" style={{ background: 'var(--color-gold)' }} />
                  <div className="income-flow__label">
                    UIF Contribution
                    <span className="income-flow__label-sub">1% of salary, capped at R177.12</span>
                  </div>
                  <div className="income-flow__amount income-flow__amount--deduction">−{fmt(derived.tax.uif)}</div>
                </div>
                <div className="income-flow-row income-flow-row--total">
                  <div className="income-flow__indicator" style={{ background: 'var(--color-positive)' }} />
                  <div className="income-flow__label">
                    <strong>Take-Home Pay</strong>
                    <span className="income-flow__label-sub">What lands in your account</span>
                  </div>
                  <div className="income-flow__amount income-flow__amount--total">{fmt(derived.tax.takeHome)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Allocation breakdown */}
          {!editing && (
            <div className="allocation-card">
              <div className="allocation-card__header">
                <div className="allocation-card__title">Income Allocation</div>
                <div className="allocation-card__total">
                  Take-home: <strong>{fmt(takeHome)}</strong>
                </div>
              </div>
              <div className="allocation-bars">
                <div className="allocation-bar-row">
                  <div className="allocation-bar-row__meta">
                    <div className="allocation-bar-row__label">
                      <div className="allocation-bar-row__dot" style={{ background: 'var(--color-red)' }} />
                      Fixed Costs
                    </div>
                    <div className="allocation-bar-row__value">
                      {fmt(derived.totalFixedCosts)}
                      <span className="allocation-bar-row__pct">{fixedPct}%</span>
                    </div>
                  </div>
                  <div className="allocation-bar-track">
                    <div className="allocation-bar-fill" style={{ width: `${fixedPct}%`, background: 'var(--color-red)' }} />
                  </div>
                </div>
                <div className="allocation-bar-row">
                  <div className="allocation-bar-row__meta">
                    <div className="allocation-bar-row__label">
                      <div className="allocation-bar-row__dot" style={{ background: 'var(--color-gold)' }} />
                      Savings &amp; Investments
                    </div>
                    <div className="allocation-bar-row__value">
                      {fmt(derived.totalSavingsContributions)}
                      <span className="allocation-bar-row__pct">{savingsPct}%</span>
                    </div>
                  </div>
                  <div className="allocation-bar-track">
                    <div className="allocation-bar-fill" style={{ width: `${savingsPct}%`, background: 'var(--color-gold)' }} />
                  </div>
                </div>
                <div className="allocation-bar-row">
                  <div className="allocation-bar-row__meta">
                    <div className="allocation-bar-row__label">
                      <div className="allocation-bar-row__dot" style={{ background: 'var(--color-positive)' }} />
                      Free Capital
                    </div>
                    <div className="allocation-bar-row__value">
                      {fmt(Math.max(0, derived.freeCapital))}
                      <span className="allocation-bar-row__pct">{freePct}%</span>
                    </div>
                  </div>
                  <div className="allocation-bar-track">
                    <div className="allocation-bar-fill" style={{ width: `${freePct}%`, background: 'var(--color-positive)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RA opportunity */}
          {!editing && financial.ra === 0 && (
            <div className="ra-opportunity">
              <div className="ra-opportunity__label">Tax Opportunity · RA Deduction</div>
              <div className="ra-opportunity__headline">
                Save up to {fmt(Math.round(derived.tax.paye * 0.22))} in PAYE tax each month
              </div>
              <div className="ra-opportunity__body">
                You're currently contributing R0 to a Retirement Annuity. At your salary, an R8 000/month RA
                contribution would reduce your taxable income by R96 000/year and save you approximately
                R22 000–R28 000 in annual tax. This is money the government would otherwise keep.
              </div>
              <button className="ra-opportunity__cta">Explore ABSA RA →</button>
            </div>
          )}
        </div>

        {/*  Right column  */}
        <div className="snapshot__grid-right">

          {/* Property Deposit Goal */}
          <div className="goal-card">
            <div className="goal-card__header">
              <div className="goal-card__icon goal-card__icon--red">
                <Home size={16} />
              </div>
              <div className="goal-card__name">Property Deposit</div>
              <div className={`goal-card__status goal-card__status--${depositPct >= 50 ? 'on-track' : 'at-risk'}`}>
                {depositPct >= 50 ? 'On Track' : 'Building'}
              </div>
            </div>
            <div className="goal-card__body">
              <div className="goal-card__progress-meta">
                <div className="goal-card__current">{fmt(financial.depositSaved)}</div>
                <div className="goal-card__target">of {fmt(financial.depositTarget)}</div>
              </div>
              <div className="goal-card__bar-track">
                <div className="goal-card__bar-fill goal-card__bar-fill--red" style={{ width: `${depositPct}%` }} />
              </div>
              <div className="goal-card__timeline">
                {derived.monthsToDeposit
                  ? <><strong>{derived.monthsToDeposit} months</strong>&nbsp;at current pace</>
                  : <span>Increase free capital to accelerate</span>
                }
              </div>
            </div>
          </div>

          {/* Emergency Fund */}
          <div className="goal-card">
            <div className="goal-card__header">
              <div className="goal-card__icon goal-card__icon--gold">
                <Shield size={16} />
              </div>
              <div className="goal-card__name">Emergency Fund</div>
              <div className={`goal-card__status goal-card__status--${emergencyPct >= 100 ? 'on-track' : 'at-risk'}`}>
                {emergencyPct >= 100 ? 'Complete' : `${emergencyPct.toFixed(0)}% done`}
              </div>
            </div>
            <div className="goal-card__body">
              <div className="goal-card__progress-meta">
                <div className="goal-card__current">{fmt(financial.emergencyFund)}</div>
                <div className="goal-card__target">of {fmt(financial.emergencyFundTarget)}</div>
              </div>
              <div className="goal-card__bar-track">
                <div className="goal-card__bar-fill goal-card__bar-fill--gold" style={{ width: `${emergencyPct}%` }} />
              </div>
              <div className="goal-card__timeline">
                Target: <strong>3 months of fixed expenses</strong>
              </div>
            </div>
          </div>

          {/* TFSA */}
          <div className="goal-card">
            <div className="goal-card__header">
              <div className="goal-card__icon goal-card__icon--green">
                <TrendingUp size={16} />
              </div>
              <div className="goal-card__name">TFSA Annual Limit</div>
              <div className={`goal-card__status goal-card__status--${tfsaYearlyPct >= 100 ? 'on-track' : 'at-risk'}`}>
                {tfsaYearlyPct >= 100 ? 'Maxed Out' : 'Room Available'}
              </div>
            </div>
            <div className="goal-card__body">
              <div className="goal-card__progress-meta">
                <div className="goal-card__current">{fmt(tfsaMonthly * 12)}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>/yr</span></div>
                <div className="goal-card__target">of R36 000 limit</div>
              </div>
              <div className="goal-card__bar-track">
                <div className="goal-card__bar-fill goal-card__bar-fill--green" style={{ width: `${tfsaYearlyPct}%` }} />
              </div>
              <div className="goal-card__timeline">
                {tfsaYearlyPct < 100
                  ? <>Top up by <strong>{fmt(Math.round((36000 - tfsaMonthly * 12) / 12))}/month</strong> to max out</>
                  : <>Annual limit reached — zero tax on all growth</>
                }
              </div>
            </div>
          </div>

          {/* SA Benchmarks */}
          <div className="benchmarks-card">
            <div className="benchmarks-card__title">SA Peer Benchmarks</div>

            <div className="benchmark-row">
              <div className="benchmark-row__label">Debt-to-Income</div>
              <div className="benchmark-row__values">
                <div className={`benchmark-row__you`} style={{ color: debtStatus === 'on-track' ? 'var(--color-positive)' : debtStatus === 'at-risk' ? '#EF4444' : 'var(--color-gold)' }}>
                  {pct(debtToIncome)}
                </div>
                <div className="benchmark-row__vs">vs</div>
                <div className="benchmark-row__avg">28% avg</div>
              </div>
            </div>

            <div className="benchmark-row">
              <div className="benchmark-row__label">Savings Rate</div>
              <div className="benchmark-row__values">
                <div className="benchmark-row__you" style={{ color: savingsStatus === 'on-track' ? 'var(--color-positive)' : savingsStatus === 'at-risk' ? '#EF4444' : 'var(--color-gold)' }}>
                  {pct(savingsRate)}
                </div>
                <div className="benchmark-row__vs">vs</div>
                <div className="benchmark-row__avg">11% avg</div>
              </div>
            </div>

            <div className="benchmark-row">
              <div className="benchmark-row__label">Effective Tax Rate</div>
              <div className="benchmark-row__values">
                <div className="benchmark-row__you" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {derived.tax.effectiveRate}%
                </div>
                <div className="benchmark-row__vs">SARS</div>
                <div className="benchmark-row__avg">2024/25</div>
              </div>
            </div>

            <div className="benchmark-row">
              <div className="benchmark-row__label">Free Capital</div>
              <div className="benchmark-row__values">
                <div className="benchmark-row__you" style={{ color: derived.freeCapital > 0 ? 'var(--color-positive)' : '#EF4444' }}>
                  {fmt(Math.max(0, derived.freeCapital))}
                </div>
                <div className="benchmark-row__vs">of</div>
                <div className="benchmark-row__avg">{fmt(takeHome)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary strip  */}
      <div className="snapshot__summary fade-up fade-up-4">
        <div>
          <div className="snapshot__summary-label">Active Strategy</div>
          <div className="snapshot__summary-value">
            {financial.selectedTrack === 'property' ? 'First Property Path'
              : financial.selectedTrack === 'balanced' ? 'Balanced Lifestyle'
              : 'Aggressive Global'}
          </div>
        </div>
        <div>
          <div className="snapshot__summary-label">Debt-to-Income</div>
          <div className="snapshot__summary-value" style={{ color: debtStatus === 'at-risk' ? 'var(--color-red)' : 'inherit' }}>
            {pct(debtToIncome)}
          </div>
        </div>
        <div>
          <div className="snapshot__summary-label">Savings Rate</div>
          <div className="snapshot__summary-value" style={{ color: savingsStatus === 'on-track' ? 'var(--color-positive)' : 'inherit' }}>
            {pct(savingsRate)}
          </div>
        </div>
        <div>
          <div className="snapshot__summary-label">Months to Deposit</div>
          <div className="snapshot__summary-value">
            {derived.monthsToDeposit ? `${derived.monthsToDeposit} months` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}