import { useState, useRef, useEffect } from 'react';
import '../styles/MoneySnapshot.css';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { Pencil, Info, Home, Shield, TrendingUp, X, Zap, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';

const fmt  = (v) => `R${Number(v || 0).toLocaleString('en-ZA')}`;
const pct  = (v) => `${Number(v || 0).toFixed(1)}%`;


//
// the RA nudge thingie is now driven by real calculated values, not hardcoded estimates!!!....


function buildNudges(derived, financial) {
  const { tax } = derived;
  return [
    // Only show RA nudge when user has no RA
    ...(financial.ra === 0 ? [{
      id:     'ra',
      title:  'RA Tax Opportunity',
      body:   `At your salary, an R8 000/month RA contribution would reduce your taxable income by R96 000/year and save you approximately ${fmt(Math.round(tax.raTaxSaving * (8000 / Math.max(financial.ra, 1)) || 2880))}/month in PAYE tax.`,
      action: 'Learn more',
    }] : []),
    // Show RA saving if user already has one
    ...(financial.ra > 0 && tax.raTaxSaving > 0 ? [{
      id:     'ra-active',
      title:  'RA Saving This Month',
      body:   `Your R${financial.ra.toLocaleString('en-ZA')}/month RA is reducing your PAYE by ${fmt(tax.raTaxSaving)}/month — ${fmt(tax.raTaxSaving * 12)}/year back from SARS.`,
      action: 'View tracks',
    }] : []),
    {
      id:     'tfsa',
      title:  'TFSA Headroom Available',
      body:   'You have R36 000/year in tax-free growth available. Every rand of growth, dividends, and withdrawals is zero tax.',
      action: 'Learn more',
    },
    {
      id:     'deposit',
      title:  'Deposit Goal On Track',
      body:   "At your current savings rate you're on track to hit your deposit target. Keep your free capital disciplined.",
      action: 'View goal',
    },
  ];
}

export default function MoneySnapshot() {
  const { financial, derived, updateFinancial } = useFinancial();
  const { user } = useAuth();

  const [editing,        setEditing]        = useState(false);
  const [nudgeIdx,       setNudgeIdx]       = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [draft,          setDraft]          = useState({ ...financial });

  const valueRefs = useRef([]);

  const nudges    = buildNudges(derived, financial);
  const nudge     = nudges[nudgeIdx % nudges.length];
  const firstName = user?.firstName || 'there';

  const { tax } = derived;
  const takeHome = tax.takeHome;

  const fixedPct   = takeHome > 0 ? ((derived.totalFixedCosts          / takeHome) * 100).toFixed(1) : 0;
  const savingsPct = takeHome > 0 ? ((derived.totalSavingsContributions / takeHome) * 100).toFixed(1) : 0;
  const freePct    = takeHome > 0 ? ((Math.max(0, derived.freeCapital)  / takeHome) * 100).toFixed(1) : 0;

  const depositPct    = Math.min(100, parseFloat(derived.depositProgress));
  const emergencyPct  = financial.emergencyFundTarget > 0
    ? Math.min(100, (financial.emergencyFund / financial.emergencyFundTarget) * 100) : 0;
  const tfsaYearlyPct = Math.min(100, ((financial.tfsa * 12) / 36000) * 100);

  const debtToIncome = parseFloat(derived.debtToIncome);
  const debtStatus   = debtToIncome > 35 ? 'at-risk' : debtToIncome > 20 ? 'warning' : 'on-track';
  const savingsRate  = parseFloat(derived.savingsRate);
  const savingsStatus = savingsRate < 10 ? 'at-risk' : savingsRate >= 20 ? 'on-track' : 'warning';


  const raOverCap = derived.tax.raDeductionCapped;
  const raAnnualInput = financial.ra * 12;
  const maxAllowedAnnual = Math.min(raAnnualInput, Math.round(financial.grossMonthly * 12 * 0.275), 350000);

  useEffect(() => {
    valueRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: i * 0.08, ease: 'power1.out' }
      );
    });
  }, [financial.grossMonthly, tax.takeHome, tax.paye, tax.uif, derived.freeCapital, financial.ra]);

  const handleSave = () => {
    const toNum = (v) => parseFloat(String(v).replace(/\s/g, '')) || 0;
    updateFinancial({
      grossMonthly:  toNum(draft.grossMonthly),
      rent:          toNum(draft.rent),
      carRepayment:  toNum(draft.carRepayment),
      medicalAid:    toNum(draft.medicalAid),
      insurance:     toNum(draft.insurance),
      studentLoan:   toNum(draft.studentLoan),
      tfsa:          toNum(draft.tfsa),
      ra:            toNum(draft.ra),
      emergencyFund: toNum(draft.emergencyFund),
      depositSaved:  toNum(draft.depositSaved),
      depositTarget: toNum(draft.depositTarget),
    });
    setEditing(false);
  };

  const field = (label, key, hint) => (
    <div className="ms-input-row" key={key}>
      <label>{label}{hint && <span> ({hint})</span>}</label>
      <input
        type="number"
        value={draft[key] ?? ''}
        onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="ms-page">


      <div className="ms-page__header">
        <div className="ms-page__eyebrow">Good day, {firstName}</div>
        <h1 className="ms-page__title">Money Snapshot</h1>
        <p className="ms-page__subtitle">
          Your financial position, after tax, in plain terms.
        </p>
      </div>


      {!nudgeDismissed && nudge && (
        <div className="ms-nudge">
          <Info size={15} className="ms-nudge__icon" />
          <div className="ms-nudge__text">
            <strong>{nudge.title}</strong> — {nudge.body}
          </div>
          <button className="ms-nudge__action">{nudge.action}</button>
          <button className="ms-nudge__close" onClick={() => {
            if (nudgeIdx + 1 >= nudges.length) setNudgeDismissed(true);
            else setNudgeIdx(i => i + 1);
          }}>
            <X size={14} />
          </button>
        </div>
      )}


      {raOverCap && !editing && (
        <div className="ms-ra-warning">
          <AlertTriangle size={14} className="ms-ra-warning__icon" />
          <div>
            <strong>RA contribution exceeds SARS deduction limit.</strong>{' '}
            Your R{(raAnnualInput).toLocaleString('en-ZA')}/year contribution exceeds the allowable
            deduction of {fmt(maxAllowedAnnual)}/year (27.5% of gross or R350 000, whichever is lower).
            The excess is locked in with no immediate tax benefit.
          </div>
        </div>
      )}


      <div className="ms-tiles">
        <div className="ms-tile ms-tile--primary">
          <div className="ms-tile__label">Take-Home Pay</div>
          <div className="ms-tile__value" ref={el => valueRefs.current[1] = el}>
            {fmt(takeHome)}
          </div>
          <div className="ms-tile__sub">
            from <span ref={el => valueRefs.current[0] = el}>{fmt(financial.grossMonthly)}</span> gross
          </div>
        </div>

        <div className={`ms-tile ${derived.freeCapital > 0 ? 'ms-tile--positive-state' : 'ms-tile--negative-state'}`}>
          <div className="ms-tile__label">Free Capital</div>
          <div
            className={`ms-tile__value ${derived.freeCapital > 0 ? 'ms-tile__value--pos' : 'ms-tile__value--neg'}`}
            ref={el => valueRefs.current[3] = el}
          >
            {fmt(Math.max(0, derived.freeCapital))}
          </div>
          <div className="ms-tile__sub">
            <span className={derived.freeCapital > 0 ? 'ms-pill ms-pill--pos' : 'ms-pill ms-pill--neg'}>
              {derived.freeCapital > 0 ? 'Available' : 'Overcommitted'}
            </span>
          </div>
        </div>

        <div className="ms-tile">
          <div className="ms-tile__label">Tax &amp; UIF</div>
          <div className="ms-tile__value ms-tile__value--muted" ref={el => valueRefs.current[2] = el}>
            {fmt(tax.paye + tax.uif)}
          </div>
          <div className="ms-tile__sub">{tax.effectiveRate}% effective rate</div>
        </div>

        <div className={`ms-tile ${
          savingsStatus === 'on-track'  ? 'ms-tile--positive-state'
          : savingsStatus === 'at-risk' ? 'ms-tile--negative-state'
          : 'ms-tile--warning-state'
        }`}>
          <div className="ms-tile__label">Savings Rate</div>
          <div className={`ms-tile__value ${
            savingsStatus === 'on-track'  ? 'ms-tile__value--pos'
            : savingsStatus === 'at-risk' ? 'ms-tile__value--neg'
            : 'ms-tile__value--warn'
          }`}>
            {pct(savingsRate)}
          </div>
          <div className="ms-tile__sub">
            SA avg: 11% · {savingsStatus === 'on-track' ? '✓ Good' : savingsStatus === 'at-risk' ? '↓ Below target' : '~ Improving'}
          </div>
        </div>
      </div>


      <div className="ms-grid">


        <div className="ms-col-left">


          <div className="ms-card">
            <div className="ms-card__hdr">
              <div className="ms-card__title">Income Reality</div>
              <button
                className="ms-edit-btn"
                onClick={() => { setDraft({ ...financial }); setEditing(e => !e); }}
              >
                <Pencil size={13} />
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <div className="ms-form">
                <div className="ms-form__section">Income</div>
                {field('Gross Monthly Salary (R)', 'grossMonthly')}
                <div className="ms-form__section">Fixed Costs</div>
                <div className="ms-form__grid">
                  {field('Rent / Bond', 'rent')}
                  {field('Car Repayment', 'carRepayment')}
                  {field('Medical Aid', 'medicalAid')}
                  {field('Insurance', 'insurance')}
                  {field('Student Loan', 'studentLoan')}
                </div>
                <div className="ms-form__section">Savings &amp; Goals</div>
                <div className="ms-form__grid">
                  {field('TFSA Monthly (R)', 'tfsa', 'R36K/yr limit')}
                  {field('RA Monthly (R)', 'ra', 'up to 27.5% of gross')}
                  {field('Emergency Fund Saved (R)', 'emergencyFund')}
                  {field('Deposit Saved (R)', 'depositSaved')}
                  {field('Deposit Target (R)', 'depositTarget')}
                </div>
                <div className="ms-form__actions">
                  <button className="ms-btn-primary" onClick={handleSave}>Save Changes</button>
                  <button className="ms-btn-ghost"    onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="ms-flow">
                  <div className="ms-flow__row">
                    <div className="ms-flow__dot" style={{ background: 'var(--surface-dark)' }} />
                    <div className="ms-flow__info">
                      <span>Gross Salary</span>
                      <small>Before any deductions</small>
                    </div>
                    <div className="ms-flow__amt">{fmt(financial.grossMonthly)}</div>
                  </div>


                  {financial.ra > 0 && (
                    <div className="ms-flow__row ms-flow__row--ra">
                      <div className="ms-flow__dot" style={{ background: 'var(--gold)' }} />
                      <div className="ms-flow__info">
                        <span>RA Contribution</span>
                        <small>
                          Deducted from taxable income · saves {fmt(tax.raTaxSaving)}/month PAYE
                          {raOverCap && <span className="ms-flow__cap-warn"> · partial cap applied</span>}
                        </small>
                      </div>
                      <div className="ms-flow__amt ms-flow__amt--ra">−{fmt(financial.ra)}</div>
                    </div>
                  )}

                  <div className="ms-flow__row">
                    <div className="ms-flow__dot" style={{ background: 'var(--negative)' }} />
                    <div className="ms-flow__info">
                      <span>PAYE Tax</span>
                      <small>
                        SARS 2024/25 · {tax.effectiveRate}% effective
                        {financial.ra > 0 && tax.raTaxSaving > 0 && (
                          <span className="ms-flow__saving"> · {fmt(tax.raTaxSaving)}/pm saved via RA</span>
                        )}
                      </small>
                    </div>
                    <div className="ms-flow__amt ms-flow__amt--deduct">−{fmt(tax.paye)}</div>
                  </div>

                  <div className="ms-flow__row">
                    <div className="ms-flow__dot" style={{ background: 'var(--gold)' }} />
                    <div className="ms-flow__info">
                      <span>UIF Contribution</span>
                      <small>1% of salary, capped at R177.12</small>
                    </div>
                    <div className="ms-flow__amt ms-flow__amt--deduct">−{fmt(tax.uif)}</div>
                  </div>

                  <div className="ms-flow__row ms-flow__row--total">
                    <div className="ms-flow__dot" style={{ background: 'var(--positive)' }} />
                    <div className="ms-flow__info">
                      <strong>Take-Home Pay</strong>
                      <small>Cash received after PAYE &amp; UIF</small>
                    </div>
                    <div className="ms-flow__amt ms-flow__amt--total">{fmt(takeHome)}</div>
                  </div>
                </div>


                {financial.ra > 0 && tax.raTaxSaving > 0 && (
                  <div className="ms-ra-saving">
                    <Zap size={13} className="ms-ra-saving__icon" />
                    <div>
                      <div className="ms-ra-saving__title">
                        RA saves you {fmt(tax.raTaxSaving)}/month in PAYE tax
                      </div>
                      <div className="ms-ra-saving__sub">
                        That's {fmt(tax.raTaxSaving * 12)}/year back from SARS.
                        Your net RA cost is {fmt(Math.max(0, financial.ra - tax.raTaxSaving))}/month
                        (R{financial.ra.toLocaleString('en-ZA')} contribution minus {fmt(tax.raTaxSaving)} tax saving).
                        Effective annual RA deduction used: {fmt(tax.raDeductionUsed)}.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Capital aallocation card */}
          {!editing && (
            <div className="ms-card">
              <div className="ms-card__hdr">
                <div className="ms-card__title">Capital Allocation</div>
                <div className="ms-card__sub">of {fmt(takeHome)} take-home</div>
              </div>
              <div className="ms-allocation">
                {[
                  { label: 'Fixed Costs',           amount: derived.totalFixedCosts,           pctVal: fixedPct,   color: 'var(--negative)'  },
                  { label: 'Savings & Investments', amount: derived.totalSavingsContributions,  pctVal: savingsPct, color: 'var(--gold)'      },
                  { label: 'Free Capital',          amount: Math.max(0, derived.freeCapital),  pctVal: freePct,    color: 'var(--positive)'  },
                ].map(({ label, amount, pctVal, color }) => (
                  <div className="ms-alloc-row" key={label}>
                    <div className="ms-alloc-meta">
                      <div className="ms-alloc-label">
                        <div className="ms-alloc-dot" style={{ background: color }} />
                        {label}
                      </div>
                      <div className="ms-alloc-vals">
                        <span>{fmt(amount)}</span>
                        <span className="ms-alloc-pct">{pctVal}%</span>
                      </div>
                    </div>
                    <div className="ms-alloc-track">
                      <div className="ms-alloc-fill" style={{ width: `${pctVal}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {!editing && financial.ra === 0 && (
            <div className="ms-promo">
              <div className="ms-promo__label">Tax Opportunity · RA Deduction</div>
              <div className="ms-promo__headline">
                An R8 000/month RA could save you approximately {fmt(tax.raTaxSaving > 0 ? tax.raTaxSaving : Math.round(tax.paye * 0.22))}/month in PAYE
              </div>
              <p className="ms-promo__body">
                You're currently contributing R0 to a Retirement Annuity. At your gross salary of{' '}
                {fmt(financial.grossMonthly)}/month, an R8 000/month RA contribution would reduce
                your taxable income by R96 000/year. Based on your current tax bracket, this saves
                approximately {fmt(Math.round(tax.paye * 0.22))}–{fmt(Math.round(tax.paye * 0.26))}/month
                in PAYE tax — roughly {fmt(Math.round(tax.paye * 0.24) * 12)}/year.
                Your net RA cost after the tax saving would be approximately{' '}
                {fmt(Math.max(0, 8000 - Math.round(tax.paye * 0.22)))}/month.
              </p>
                            <button className="ms-promo__cta"
                onClick={() => window.open("https://www.absa.co.za/personal/save-invest/products/absa-retirement-annuity/", "_blank", "noopener,noreferrer"

                     )} >
               Explore ABSA RA →
              </button>
            </div>
          )}
        </div>


        <div className="ms-col-right">


          <div className="ms-card">
            <div className="ms-card__hdr">
              <div className="ms-card__title">Strategic Targets</div>
            </div>

            <div className="ms-goal">
              <div className="ms-goal__hdr">
                <div className="ms-goal__icon ms-goal__icon--red"><Home size={14} /></div>
                <div className="ms-goal__name">Property Deposit</div>
                <div className={`ms-goal__badge ${depositPct >= 50 ? 'ms-goal__badge--pos' : 'ms-goal__badge--warn'}`}>
                  {depositPct >= 50 ? 'On Track' : 'Building'}
                </div>
              </div>
              <div className="ms-goal__bar">
                <div className="ms-goal__fill" style={{ width: `${depositPct}%`, background: 'var(--negative)' }} />
              </div>
              <div className="ms-goal__meta">
                <strong>{fmt(financial.depositSaved)}</strong> of {fmt(financial.depositTarget)} · {depositPct.toFixed(0)}%
              </div>
            </div>

            <div className="ms-goal">
              <div className="ms-goal__hdr">
                <div className="ms-goal__icon ms-goal__icon--gold"><Shield size={14} /></div>
                <div className="ms-goal__name">Emergency Runway</div>
                <div className={`ms-goal__badge ${emergencyPct >= 100 ? 'ms-goal__badge--pos' : 'ms-goal__badge--warn'}`}>
                  {emergencyPct >= 100 ? 'Complete' : `${emergencyPct.toFixed(0)}% done`}
                </div>
              </div>
              <div className="ms-goal__bar">
                <div className="ms-goal__fill" style={{ width: `${emergencyPct}%`, background: 'var(--gold)' }} />
              </div>
              <div className="ms-goal__meta">
                <strong>{fmt(financial.emergencyFund)}</strong> of {fmt(financial.emergencyFundTarget)} · 3-month target
              </div>
            </div>

            <div className="ms-goal">
              <div className="ms-goal__hdr">
                <div className="ms-goal__icon ms-goal__icon--green"><TrendingUp size={14} /></div>
                <div className="ms-goal__name">TFSA Annual Limit</div>
                <div className={`ms-goal__badge ${tfsaYearlyPct >= 100 ? 'ms-goal__badge--pos' : 'ms-goal__badge--neutral'}`}>
                  {tfsaYearlyPct >= 100 ? 'Maxed Out' : 'Room Available'}
                </div>
              </div>
              <div className="ms-goal__bar">
                <div className="ms-goal__fill" style={{ width: `${tfsaYearlyPct}%`, background: 'var(--positive)' }} />
              </div>
              <div className="ms-goal__meta">
                <strong>{fmt(financial.tfsa * 12)}</strong>/yr of R36 000 limit · {tfsaYearlyPct.toFixed(0)}%
              </div>
            </div>
          </div>


          <div className="ms-card">
            <div className="ms-card__hdr">
              <div className="ms-card__title">SA Peer Benchmarks</div>
            </div>
            <div className="ms-bench">
              {[
                {
                  label:  'Debt-to-Income',
                  you:    pct(debtToIncome),
                  avg:    '28% avg',
                  status: debtStatus,
                },
                {
                  label:  'Savings Rate',
                  you:    pct(savingsRate),
                  avg:    '11% avg',
                  status: savingsStatus,
                },
                {
                  label:  'Effective Tax Rate',
                  you:    `${tax.effectiveRate}%`,
                  avg:    'SARS 2024/25',
                  status: 'neutral',
                },
                {
                  label:  'Free Capital',
                  you:    fmt(Math.max(0, derived.freeCapital)),
                  avg:    `of ${fmt(takeHome)}`,
                  status: derived.freeCapital > 0 ? 'on-track' : 'at-risk',
                },
                // New row: RA tax saving (only when relevant)
                ...(financial.ra > 0 && tax.raTaxSaving > 0 ? [{
                  label:  'RA Tax Saving',
                  you:    fmt(tax.raTaxSaving) + '/pm',
                  avg:    fmt(tax.raTaxSaving * 12) + '/yr',
                  status: 'on-track',
                }] : []),
              ].map(({ label, you, avg, status }) => (
                <div className="ms-bench__row" key={label}>
                  <div className="ms-bench__label">{label}</div>
                  <div className="ms-bench__vals">
                    <span className={`ms-bench__you ms-bench__you--${status}`}>{you}</span>
                    <span className="ms-bench__avg">{avg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>


      <div className="ms-strip">
        <div className="ms-strip__item">
          <div className="ms-strip__label">Active Strategy</div>
          <div className="ms-strip__val">
            {financial.selectedTrack === 'property'   ? 'First Property Path'
              : financial.selectedTrack === 'balanced' ? 'Balanced Lifestyle'
              : 'Aggressive Global'}
          </div>
        </div>
        <div className="ms-strip__item">
          <div className="ms-strip__label">Debt-to-Income</div>
          <div className={`ms-strip__val ms-strip__val--${debtStatus}`}>{pct(debtToIncome)}</div>
        </div>
        <div className="ms-strip__item">
          <div className="ms-strip__label">Savings Rate</div>
          <div className={`ms-strip__val ms-strip__val--${savingsStatus}`}>{pct(savingsRate)}</div>
        </div>
        <div className="ms-strip__item">
          <div className="ms-strip__label">Months to Deposit</div>
          <div className="ms-strip__val">
            {derived.monthsToDeposit ? `${derived.monthsToDeposit} months` : '—'}
          </div>
        </div>

        {financial.ra > 0 && tax.raTaxSaving > 0 && (
          <div className="ms-strip__item">
            <div className="ms-strip__label">RA Annual Tax Saving</div>
            <div className="ms-strip__val ms-strip__val--on-track">
              {fmt(tax.raTaxSaving * 12)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
