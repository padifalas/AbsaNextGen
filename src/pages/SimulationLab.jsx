import { useState, useMemo } from 'react';
import '../styles/SimulationLab.css';
import { useFinancial } from '../context/FinancialContext';

const fmt = (v) => `R${Math.round(v || 0).toLocaleString('en-ZA')}`;
const fmtM = (v) => {
  if (Math.abs(v) >= 1000000) return `R${(v / 1000000).toFixed(2)}M`;
  if (Math.abs(v) >= 1000) return `R${Math.round(v / 1000)}K`;
  return fmt(v);
};

// ── Property vs Rent calculator ──────────────────────────────
function calcPropertyVsRent({ propertyValue, deposit, monthlyRent, investReturn, propertyAppreciation, years, interestRate, levies }) {
  const loanAmount = propertyValue - deposit;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = years * 12;
  const bondRepayment = loanAmount > 0
    ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments))
    : 0;

  // Transfer duty (SA 2024)
  let transferDuty = 0;
  if (propertyValue > 1100000) transferDuty = (propertyValue - 1100000) * 0.03 + 0;
  if (propertyValue > 1512500) transferDuty = (propertyValue - 1512500) * 0.06 + 12375;
  if (propertyValue > 2117500) transferDuty = (propertyValue - 2117500) * 0.08 + 48675;
  if (propertyValue > 2722500) transferDuty = (propertyValue - 2722500) * 0.11 + 97675;
  if (propertyValue > 12100000) transferDuty = (propertyValue - 12100000) * 0.13 + 1128600;

  const bondReg = Math.round(propertyValue * 0.012); // ~1.2% of bond
  const upfrontBuying = deposit + transferDuty + bondReg;

  const totalBuying = (bondRepayment + levies) * numPayments + upfrontBuying;
  const totalRenting = monthlyRent * numPayments;

  // Property value at end
  const endPropertyValue = propertyValue * Math.pow(1 + propertyAppreciation / 100, years);
  const remainingBond = loanAmount > 0
    ? loanAmount * Math.pow(1 + monthlyRate, numPayments) - bondRepayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / monthlyRate
    : 0;
  const equityOwner = endPropertyValue - Math.max(0, remainingBond);

  // What the deposit would grow to if invested
  const depositGrown = deposit * Math.pow(1 + investReturn / 100, years);
  const rentSurplus = Math.max(0, bondRepayment + levies - monthlyRent);
  const surplusGrown = rentSurplus > 0
    ? rentSurplus * ((Math.pow(1 + investReturn / 100 / 12, numPayments) - 1) / (investReturn / 100 / 12))
    : 0;
  const netRenterPosition = depositGrown + surplusGrown;

  // Break-even month
  let breakEvenMonth = null;
  let cumBuy = upfrontBuying;
  let cumRent = 0;
  let buyerEquity = propertyValue - loanAmount;
  let remainingLoan = loanAmount;
  for (let m = 1; m <= numPayments; m++) {
    const interest = remainingLoan * monthlyRate;
    const principal = bondRepayment - interest;
    remainingLoan = Math.max(0, remainingLoan - principal);
    const currentValue = propertyValue * Math.pow(1 + propertyAppreciation / 100, m / 12);
    buyerEquity = currentValue - remainingLoan;
    cumBuy += bondRepayment + levies;
    cumRent += monthlyRent;
    if (breakEvenMonth === null && buyerEquity > netRenterPosition * (m / numPayments)) {
      breakEvenMonth = m;
    }
  }

  return {
    bondRepayment: Math.round(bondRepayment),
    totalBuying: Math.round(totalBuying),
    totalRenting: Math.round(totalRenting),
    equityOwner: Math.round(equityOwner),
    netRenterPosition: Math.round(netRenterPosition),
    transferDuty: Math.round(transferDuty),
    bondReg: Math.round(bondReg),
    breakEvenMonth,
    upfrontBuying: Math.round(upfrontBuying),
    buyingWins: equityOwner > netRenterPosition,
  };
}

// ── Car vs Invest calculator ──────────────────────────────────
function calcCarVsInvest({ carPrice, balloonPct, term, interestRate, insurance, investReturn, years }) {
  const balloon = carPrice * balloonPct / 100;
  const financeAmount = carPrice - 0; // no deposit assumed
  const monthlyRate = interestRate / 100 / 12;
  const repayment = financeAmount > 0
    ? ((financeAmount - balloon * Math.pow(1 + monthlyRate, -term)) * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term))
    : 0;

  // Depreciation
  let carValue = carPrice;
  for (let y = 0; y < years; y++) {
    carValue *= y === 0 ? 0.82 : 0.88; // 18% yr1, 12% thereafter
  }

  const totalRepayments = repayment * Math.min(term, years * 12);
  const totalInsurance = insurance * years * 12;
  const balloonCost = years >= term / 12 ? balloon : 0;
  const totalCostOwnership = totalRepayments + totalInsurance + balloonCost;

  // Portfolio if invested instead
  const numMonths = years * 12;
  const monthly = repayment + insurance;
  const portfolioValue = monthly * ((Math.pow(1 + investReturn / 100 / 12, numMonths) - 1) / (investReturn / 100 / 12));

  const opportunityCost = portfolioValue - (carPrice - carValue);

  return {
    repayment: Math.round(repayment),
    totalCostOwnership: Math.round(totalCostOwnership),
    portfolioValue: Math.round(portfolioValue),
    carValue: Math.round(carValue),
    depreciation: Math.round(carPrice - carValue),
    opportunityCost: Math.round(opportunityCost),
    balloon: Math.round(balloon),
    investWins: portfolioValue > (carPrice - carValue + totalCostOwnership - carValue),
  };
}

// ── Year bars helper ──
function YearBars({ buyValues, rentValues, labels, colors }) {
  const max = Math.max(...buyValues, ...rentValues, 1);
  return (
    <div className="sim-bars">
      {labels.map((label, i) => (
        <div key={i} className="sim-bar-row">
          <div className="sim-bar-row__label">{label}</div>
          <div className="sim-bar-row__track">
            <div
              className="sim-bar-segment sim-bar-segment--buy"
              style={{ width: `${(buyValues[i] / max) * 50}%`, background: colors[0] }}
            />
            <div
              className="sim-bar-segment sim-bar-segment--rent"
              style={{ width: `${(rentValues[i] / max) * 50}%`, background: colors[1] }}
            />
          </div>
          <div className="sim-bar-row__value" style={{ fontSize: '0.7rem' }}>
            {fmtM(buyValues[i])}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SimulationLab() {
  const { financial } = useFinancial();
  const [activeTab, setActiveTab] = useState('property');

  // Property vs Rent state
  const [pvr, setPvr] = useState({
    propertyValue: 950000,
    deposit: 150000,
    monthlyRent: 12000,
    investReturn: 10,
    propertyAppreciation: 5,
    years: 5,
    interestRate: 12.75,
    levies: 2500,
  });

  // Car vs Invest state
  const [cvi, setCvi] = useState({
    carPrice: 550000,
    balloonPct: 25,
    term: 72,
    interestRate: 14.75,
    insurance: 2200,
    investReturn: 10,
    years: 5,
  });

  const pvrResult = useMemo(() => calcPropertyVsRent(pvr), [pvr]);
  const cviResult = useMemo(() => calcCarVsInvest(cvi), [cvi]);

  const tabs = [
    { id: 'property', label: 'Property vs Rent', badge: 'Studio 1' },
    { id: 'car', label: 'Car vs Invest', badge: 'Studio 2' },
  ];

  const updatePvr = (key, val) => setPvr(p => ({ ...p, [key]: parseFloat(val) || 0 }));
  const updateCvi = (key, val) => setCvi(p => ({ ...p, [key]: parseFloat(val) || 0 }));

  return (
    <div className="sim-page">
      {/* ── Header ── */}
      <div className="sim-page__header">
        <div className="sim-page__eyebrow">Know Your Money</div>
        <h1 className="sim-page__title">Simulation Lab</h1>
        <p className="sim-page__subtitle">
          Model real South African financial decisions before you make them. All calculations use live SA rates, SARS tables, and realistic local assumptions.
        </p>
      </div>

      {/* Tab selector  */}
      <div className="sim-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`sim-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="sim-tab__badge">{t.badge}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Studio 1: Property vs Rent */}
      {activeTab === 'property' && (
        <>
          <div className="sim-context-note">
            <strong>SA Context:</strong> Bond at prime + 1% ({pvr.interestRate}%). Transfer duty calculated on SARS 2024/25 table (0% under R1.1M, then scaled). Bond registration ~1.2% of loan. Joburg average transfer: 8–12 weeks.
          </div>

          <div className="sim-studio">
            {/* Inputs */}
            <div className="sim-inputs">
              <div className="sim-inputs__header">
                <div className="sim-inputs__title">Inputs — Property vs Rent</div>
              </div>
              <div className="sim-inputs__body">

                <div className="sim-field">
                  <div className="sim-field__label">Property Value <span className="sim-field__hint">{fmt(pvr.propertyValue)}</span></div>
                  <input type="range" className="sim-field__slider" min={500000} max={3000000} step={50000}
                    value={pvr.propertyValue} onChange={e => updatePvr('propertyValue', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>R500K</span><span>R3M</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Deposit Available <span className="sim-field__hint">{fmt(pvr.deposit)}</span></div>
                  <input type="range" className="sim-field__slider" min={0} max={Math.round(pvr.propertyValue * 0.3)} step={10000}
                    value={pvr.deposit} onChange={e => updatePvr('deposit', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>R0</span><span>{fmt(Math.round(pvr.propertyValue * 0.3))}</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Monthly Rent Alternative <span className="sim-field__hint">{fmt(pvr.monthlyRent)}/mo</span></div>
                  <input type="range" className="sim-field__slider" min={5000} max={30000} step={500}
                    value={pvr.monthlyRent} onChange={e => updatePvr('monthlyRent', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>R5K</span><span>R30K</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Monthly Levies / Rates <span className="sim-field__hint">{fmt(pvr.levies)}/mo</span></div>
                  <input type="range" className="sim-field__slider" min={0} max={8000} step={100}
                    value={pvr.levies} onChange={e => updatePvr('levies', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>R0</span><span>R8K</span></div>
                </div>

                <div className="sim-divider" />

                <div className="sim-field">
                  <div className="sim-field__label">Bond Interest Rate <span className="sim-field__hint">{pvr.interestRate}%</span></div>
                  <input type="range" className="sim-field__slider" min={10} max={18} step={0.25}
                    value={pvr.interestRate} onChange={e => updatePvr('interestRate', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>10%</span><span>18%</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Property Appreciation p.a. <span className="sim-field__hint">{pvr.propertyAppreciation}%</span></div>
                  <input type="range" className="sim-field__slider" min={0} max={12} step={0.5}
                    value={pvr.propertyAppreciation} onChange={e => updatePvr('propertyAppreciation', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>0%</span><span>12%</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Investment Return (if renting) <span className="sim-field__hint">{pvr.investReturn}%</span></div>
                  <input type="range" className="sim-field__slider" min={4} max={18} step={0.5}
                    value={pvr.investReturn} onChange={e => updatePvr('investReturn', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>4%</span><span>18%</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Time Horizon <span className="sim-field__hint">{pvr.years} years</span></div>
                  <input type="range" className="sim-field__slider" min={1} max={20} step={1}
                    value={pvr.years} onChange={e => updatePvr('years', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>1 yr</span><span>20 yrs</span></div>
                </div>
              </div>
            </div>

            {/* Outputs */}
            <div className="sim-outputs">
              {/* Compare cards */}
              <div className="sim-compare-row">
                <div className="sim-compare-card sim-compare-card--buy">
                  <div className="sim-compare-card__label">Buying — Total Cost</div>
                  <div className="sim-compare-card__value">{fmtM(pvrResult.totalBuying)}</div>
                  <div className="sim-compare-card__sub">
                    Bond: {fmt(pvrResult.bondRepayment)}/mo · Transfer duty: {fmt(pvrResult.transferDuty)} · Reg: {fmt(pvrResult.bondReg)}
                  </div>
                </div>
                <div className="sim-compare-card sim-compare-card--rent">
                  <div className="sim-compare-card__label">Renting — Total Cost</div>
                  <div className="sim-compare-card__value">{fmtM(pvrResult.totalRenting)}</div>
                  <div className="sim-compare-card__sub">
                    {fmt(pvr.monthlyRent)}/mo × {pvr.years * 12} months
                  </div>
                </div>
              </div>

              <div className="sim-compare-row">
                <div className="sim-compare-card sim-compare-card--buy">
                  <div className="sim-compare-card__label">Buyer Equity at Year {pvr.years}</div>
                  <div className="sim-compare-card__value">{fmtM(pvrResult.equityOwner)}</div>
                  <div className="sim-compare-card__sub">Property value less remaining bond</div>
                </div>
                <div className="sim-compare-card sim-compare-card--rent">
                  <div className="sim-compare-card__label">Renter Portfolio at Year {pvr.years}</div>
                  <div className="sim-compare-card__value">{fmtM(pvrResult.netRenterPosition)}</div>
                  <div className="sim-compare-card__sub">Deposit invested + surplus contributions</div>
                </div>
              </div>

              {/* Bar chart */}
              <div className="sim-bar-chart">
                <div className="sim-bar-chart__header">
                  <div className="sim-bar-chart__title">5-Year Cost Breakdown</div>
                  <div className="sim-bar-chart__legend">
                    <div className="sim-legend-item">
                      <div className="sim-legend-dot" style={{ background: 'var(--color-red)' }} /> Buying
                    </div>
                    <div className="sim-legend-item">
                      <div className="sim-legend-dot" style={{ background: '#00dac5' }} /> Renting
                    </div>
                  </div>
                </div>
                <YearBars
                  labels={['Upfront', 'Yr 1', 'Yr 3', `Yr ${pvr.years}`]}
                  buyValues={[
                    pvrResult.upfrontBuying,
                    pvrResult.bondRepayment * 12,
                    pvrResult.bondRepayment * 36,
                    pvrResult.totalBuying,
                  ]}
                  rentValues={[
                    0,
                    pvr.monthlyRent * 12,
                    pvr.monthlyRent * 36,
                    pvrResult.totalRenting,
                  ]}
                  colors={['var(--color-red)', '#3B82F6']}
                />
              </div>

              {/* Verdict */}
              <div className="sim-verdict">
                <div className="sim-verdict__label">Studio Verdict</div>
                <div className="sim-verdict__text">
                  {pvrResult.buyingWins
                    ? <>At these numbers, <strong>buying builds more wealth</strong> over {pvr.years} years. Your equity of {fmtM(pvrResult.equityOwner)} outpaces the renter's invested position of {fmtM(pvrResult.netRenterPosition)}.</>
                    : <>At these numbers, <strong>renting and investing</strong> builds more wealth over {pvr.years} years. The renter's position of {fmtM(pvrResult.netRenterPosition)} exceeds the buyer's equity of {fmtM(pvrResult.equityOwner)}.</>
                  }
                </div>
                {pvrResult.breakEvenMonth && (
                  <div className="sim-verdict__breakeven">
                    Break-even: approximately month {pvrResult.breakEvenMonth} — if you plan to stay longer, buying improves.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Studio 2: Car vs Invest ── */}
      {activeTab === 'car' && (
        <>
          <div className="sim-context-note">
            <strong>SA Context:</strong> Balloon finance at prime + 3% ({cvi.interestRate}%). Standard SA structure: 20–30% residual balloon at end of term. Vehicle depreciates ~18% year 1, ~12% per year thereafter.
          </div>

          <div className="sim-studio">
            {/* Inputs */}
            <div className="sim-inputs">
              <div className="sim-inputs__header">
                <div className="sim-inputs__title">Inputs — Car vs Invest</div>
              </div>
              <div className="sim-inputs__body">

                <div className="sim-field">
                  <div className="sim-field__label">Vehicle Price <span className="sim-field__hint">{fmt(cvi.carPrice)}</span></div>
                  <input type="range" className="sim-field__slider" min={150000} max={1500000} step={10000}
                    value={cvi.carPrice} onChange={e => updateCvi('carPrice', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>R150K</span><span>R1.5M</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Balloon Payment % <span className="sim-field__hint">{cvi.balloonPct}% = {fmt(cvi.carPrice * cvi.balloonPct / 100)}</span></div>
                  <input type="range" className="sim-field__slider" min={0} max={40} step={5}
                    value={cvi.balloonPct} onChange={e => updateCvi('balloonPct', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>0%</span><span>40%</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Finance Term <span className="sim-field__hint">{cvi.term} months</span></div>
                  <input type="range" className="sim-field__slider" min={24} max={96} step={12}
                    value={cvi.term} onChange={e => updateCvi('term', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>24 mo</span><span>96 mo</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Monthly Insurance <span className="sim-field__hint">{fmt(cvi.insurance)}/mo</span></div>
                  <input type="range" className="sim-field__slider" min={500} max={6000} step={100}
                    value={cvi.insurance} onChange={e => updateCvi('insurance', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>R500</span><span>R6K</span></div>
                </div>

                <div className="sim-divider" />

                <div className="sim-field">
                  <div className="sim-field__label">Interest Rate <span className="sim-field__hint">{cvi.interestRate}%</span></div>
                  <input type="range" className="sim-field__slider" min={10} max={22} step={0.25}
                    value={cvi.interestRate} onChange={e => updateCvi('interestRate', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>10%</span><span>22%</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Investment Return p.a. <span className="sim-field__hint">{cvi.investReturn}%</span></div>
                  <input type="range" className="sim-field__slider" min={4} max={18} step={0.5}
                    value={cvi.investReturn} onChange={e => updateCvi('investReturn', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>4%</span><span>18%</span></div>
                </div>

                <div className="sim-field">
                  <div className="sim-field__label">Comparison Period <span className="sim-field__hint">{cvi.years} years</span></div>
                  <input type="range" className="sim-field__slider" min={1} max={10} step={1}
                    value={cvi.years} onChange={e => updateCvi('years', e.target.value)} />
                  <div className="sim-field__slider-meta"><span>1 yr</span><span>10 yrs</span></div>
                </div>
              </div>
            </div>

            {/* Outputs */}
            <div className="sim-outputs">
              <div className="sim-compare-row">
                <div className="sim-compare-card sim-compare-card--buy">
                  <div className="sim-compare-card__label">Monthly Repayment</div>
                  <div className="sim-compare-card__value">{fmt(cviResult.repayment)}</div>
                  <div className="sim-compare-card__sub">
                    + {fmt(cvi.insurance)}/mo insurance · Balloon: {fmt(cviResult.balloon)}
                  </div>
                </div>
                <div className="sim-compare-card sim-compare-card--rent">
                  <div className="sim-compare-card__label">Monthly if Invested</div>
                  <div className="sim-compare-card__value">{fmt(cviResult.repayment + cvi.insurance)}</div>
                  <div className="sim-compare-card__sub">Into equity ETF at {cvi.investReturn}% p.a.</div>
                </div>
              </div>

              <div className="sim-compare-row">
                <div className="sim-compare-card sim-compare-card--buy">
                  <div className="sim-compare-card__label">Total Cost of Ownership</div>
                  <div className="sim-compare-card__value">{fmtM(cviResult.totalCostOwnership)}</div>
                  <div className="sim-compare-card__sub">
                    Car value in {cvi.years} yrs: {fmtM(cviResult.carValue)} · Lost: {fmtM(cviResult.depreciation)}
                  </div>
                </div>
                <div className="sim-compare-card sim-compare-card--rent">
                  <div className="sim-compare-card__label">Portfolio if Invested</div>
                  <div className="sim-compare-card__value">{fmtM(cviResult.portfolioValue)}</div>
                  <div className="sim-compare-card__sub">Compound growth over {cvi.years} years</div>
                </div>
              </div>

              <div className="sim-bar-chart">
                <div className="sim-bar-chart__header">
                  <div className="sim-bar-chart__title">Car Cost vs Investment Growth</div>
                  <div className="sim-bar-chart__legend">
                    <div className="sim-legend-item">
                      <div className="sim-legend-dot" style={{ background: 'var(--color-red)' }} /> Car costs
                    </div>
                    <div className="sim-legend-item">
                      <div className="sim-legend-dot" style={{ background: '#3B82F6' }} /> Portfolio
                    </div>
                  </div>
                </div>
                <YearBars
                  labels={['Year 1', 'Year 2', 'Year 3', `Year ${cvi.years}`]}
                  buyValues={[
                    (cviResult.repayment + cvi.insurance) * 12,
                    (cviResult.repayment + cvi.insurance) * 24,
                    (cviResult.repayment + cvi.insurance) * 36,
                    cviResult.totalCostOwnership,
                  ]}
                  rentValues={[
                    (cviResult.repayment + cvi.insurance) * 12 * 1.1,
                    (cviResult.repayment + cvi.insurance) * 24 * 1.21,
                    (cviResult.repayment + cvi.insurance) * 36 * 1.33,
                    cviResult.portfolioValue,
                  ]}
                  colors={['var(--color-red)', '#3B82F6']}
                />
              </div>

              <div className="sim-verdict">
                <div className="sim-verdict__label">Studio Verdict</div>
                <div className="sim-verdict__text">
                  Your {fmt(cvi.carPrice)} car costs <strong>{fmtM(cviResult.totalCostOwnership)}</strong> over {cvi.years} years including a <strong>{fmt(cviResult.balloon)} balloon</strong> and {fmtM(cviResult.depreciation)} in depreciation. Investing the same monthly amount ({fmt(cviResult.repayment + cvi.insurance)}/mo) would build a <strong>{fmtM(cviResult.portfolioValue)} portfolio</strong>.
                </div>
                <div className="sim-verdict__breakeven">
                  Opportunity cost of the car: {fmtM(cviResult.opportunityCost)} over {cvi.years} years.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Explainer strip ── */}
      <div className="sim-context-note" style={{ marginTop: 24 }}>
        <strong>How these calculators work:</strong> Property vs Rent models the true total cost of ownership (bond repayments, transfer duty, bond registration, levies) against the renter's invested position (deposit + monthly surplus into equity). Car vs Invest uses SA balloon finance structures and real depreciation curves. Numbers are estimates — consult a financial adviser before major decisions.
      </div>
    </div>
  );
}