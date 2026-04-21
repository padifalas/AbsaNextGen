import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import '../styles/SimulationLab.css';
import { useFinancial } from '../context/FinancialContext';

const fmt = (v) => `R${Math.round(v || 0).toLocaleString('en-ZA')}`;
const fmtM = (v) => {
  if (Math.abs(v) >= 1000000) return `R${(v / 1000000).toFixed(2)}M`;
  if (Math.abs(v) >= 1000) return `R${Math.round(v / 1000)}K`;
  return fmt(v);
};

function calcPropertyVsRent({ propertyValue, deposit, monthlyRent, investReturn, propertyAppreciation, years, interestRate, levies }) {
  const loanAmount = propertyValue - deposit;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = years * 12;
  const bondRepayment = loanAmount > 0
    ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments))
    : 0;

  let transferDuty = 0;
  if (propertyValue > 1100000) transferDuty = (propertyValue - 1100000) * 0.03 + 0;
  if (propertyValue > 1512500) transferDuty = (propertyValue - 1512500) * 0.06 + 12375;
  if (propertyValue > 2117500) transferDuty = (propertyValue - 2117500) * 0.08 + 48675;
  if (propertyValue > 2722500) transferDuty = (propertyValue - 2722500) * 0.11 + 97675;
  if (propertyValue > 12100000) transferDuty = (propertyValue - 12100000) * 0.13 + 1128600;

  const bondReg = Math.round(propertyValue * 0.012);
  const upfrontBuying = deposit + transferDuty + bondReg;
  const totalBuying = (bondRepayment + levies) * numPayments + upfrontBuying;
  const totalRenting = monthlyRent * numPayments;

  const endPropertyValue = propertyValue * Math.pow(1 + propertyAppreciation / 100, years);
  const remainingBond = loanAmount > 0
    ? loanAmount * Math.pow(1 + monthlyRate, numPayments) - bondRepayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / monthlyRate
    : 0;
  const equityOwner = endPropertyValue - Math.max(0, remainingBond);

  const depositGrown = deposit * Math.pow(1 + investReturn / 100, years);
  const rentSurplus = Math.max(0, bondRepayment + levies - monthlyRent);
  const surplusGrown = rentSurplus > 0
    ? rentSurplus * ((Math.pow(1 + investReturn / 100 / 12, numPayments) - 1) / (investReturn / 100 / 12))
    : 0;
  const netRenterPosition = depositGrown + surplusGrown;

  let breakEvenMonth = null;
  let cumBuy = upfrontBuying;
  let remainingLoan = loanAmount;
  for (let m = 1; m <= numPayments; m++) {
    const interest = remainingLoan * monthlyRate;
    const principal = bondRepayment - interest;
    remainingLoan = Math.max(0, remainingLoan - principal);
    const currentValue = propertyValue * Math.pow(1 + propertyAppreciation / 100, m / 12);
    const buyerEquity = currentValue - remainingLoan;
    cumBuy += bondRepayment + levies;
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

function calcCarVsInvest({ carPrice, balloonPct, term, interestRate, insurance, investReturn, years }) {
  const balloon = carPrice * balloonPct / 100;
  const financeAmount = carPrice;
  const monthlyRate = interestRate / 100 / 12;
  const repayment = financeAmount > 0
    ? ((financeAmount - balloon * Math.pow(1 + monthlyRate, -term)) * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term))
    : 0;

  let carValue = carPrice;
  for (let y = 0; y < years; y++) carValue *= y === 0 ? 0.82 : 0.88;

  const totalRepayments = repayment * Math.min(term, years * 12);
  const totalInsurance = insurance * years * 12;
  const balloonCost = years >= term / 12 ? balloon : 0;
  const totalCostOwnership = totalRepayments + totalInsurance + balloonCost;

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

function YearBars({ buyValues, rentValues, labels, colors, tooltipLabels }) {
  const max = Math.max(...buyValues, ...rentValues, 1);
  const buyRefs = useRef([]);
  const rentRefs = useRef([]);
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });


  useEffect(() => {
    buyValues.forEach((val, i) => {
      const targetW = `${(val / max) * 50}%`;
      if (buyRefs.current[i]) {
        gsap.fromTo(buyRefs.current[i],
          { width: 0 },
          { width: targetW, duration: 0.7, delay: i * 0.08, ease: 'power2.out' }
        );
      }
      if (rentRefs.current[i]) {
        gsap.fromTo(rentRefs.current[i],
          { width: 0 },
          { width: `${(rentValues[i] / max) * 50}%`, duration: 0.7, delay: i * 0.08 + 0.06, ease: 'power2.out' }
        );
      }
    });
  }, [buyValues, rentValues, max]);

  const handleMouseMove = (e, i) => {
    const rect = e.currentTarget.closest('.sim-bar-chart').getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHovered(i);
  };

  return (
    <div className="sim-bars" style={{ position: 'relative' }}>
      {labels.map((label, i) => (
        <div
          key={i}
          className={`sim-bar-row${hovered === i ? ' sim-bar-row--hovered' : ''}`}
          onMouseMove={e => handleMouseMove(e, i)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="sim-bar-row__label">{label}</div>
          <div className="sim-bar-row__track">
            <div
              ref={el => buyRefs.current[i] = el}
              className="sim-bar-segment"
              style={{ width: 0, background: colors[0] }}
            />
            <div
              ref={el => rentRefs.current[i] = el}
              className="sim-bar-segment"
              style={{ width: 0, background: colors[1], opacity: 0.6 }}
            />
          </div>
          <div className="sim-bar-row__value">{fmtM(buyValues[i])}</div>
        </div>
      ))}

      {/* Hover tooltip thing - still need to fix omg */}
      {hovered !== null && (
        <div
          className="sim-bar-tooltip"
          style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 20 }}
        >
          <div className="sim-bar-tooltip__label">{labels[hovered]}</div>
          <div className="sim-bar-tooltip__row">
            <span className="sim-bar-tooltip__dot" style={{ background: colors[0] }} />
            <span>{tooltipLabels?.[0] ?? 'Option A'}</span>
            <strong>{fmtM(buyValues[hovered])}</strong>
          </div>
          <div className="sim-bar-tooltip__row">
            <span className="sim-bar-tooltip__dot" style={{ background: colors[1] }} />
            <span>{tooltipLabels?.[1] ?? 'Option B'}</span>
            <strong>{fmtM(rentValues[hovered])}</strong>
          </div>
          {buyValues[hovered] !== rentValues[hovered] && (
            <div className="sim-bar-tooltip__diff">
              Δ {fmtM(Math.abs(buyValues[hovered] - rentValues[hovered]))}
              {' '}
              <span>{buyValues[hovered] > rentValues[hovered] ? '↑ more costly' : '↓ less costly'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function SliderField({ label, hint, min, max, step, value, onChange, metaMin, metaMax }) {
  return (
    <div className="sim-field">
      <div className="sim-field__label">
        <span>{label}</span>
        <span className="sim-field__hint">{hint}</span>
      </div>
      <input
        type="range"
        className="sim-field__slider"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div className="sim-field__slider-meta">
        <span>{metaMin}</span>
        <span>{metaMax}</span>
      </div>
    </div>
  );
}

export default function SimulationLab() {
  const { financial } = useFinancial();
  const [activeTab, setActiveTab] = useState('property');

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

  const up = (setter) => (key) => (val) => setter(p => ({ ...p, [key]: parseFloat(val) || 0 }));
  const updatePvr = up(setPvr);
  const updateCvi = up(setCvi);

  const tabs = [
    { id: 'property', label: 'Property vs Rent', badge: 'Studio 1' },
    { id: 'car', label: 'Car vs Invest', badge: 'Studio 2' },
  ];

  return (
    <div className="sim-page">

      {/* Heading at top */}
      <div className="sim-page__header">
        <div className="sim-page__eyebrow">Know Your Money</div>
        <h1 className="sim-page__title">Simulation Lab</h1>
        <p className="sim-page__subtitle">
          Model real South African financial decisions before you make them. All calculations use live SA rates, SARS tables, and realistic local assumptions.
        </p>
      </div>


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
            <strong>SA Context:</strong> Bond at prime + 1% ({pvr.interestRate}%). Transfer duty on SARS 2024/25 table (0% under R1.1M). Bond registration ~1.2% of loan.
          </div>

          <div className="sim-studio">
            <div className="sim-inputs">
              <div className="sim-inputs__header">
                <div className="sim-inputs__title">Property vs Rent</div>
              </div>
              <div className="sim-inputs__body">

                <div className="sim-field-group">
                  <div className="sim-field-group__label">Property</div>
                  <SliderField label="Property Value" hint={fmt(pvr.propertyValue)}
                    min={500000} max={3000000} step={50000} value={pvr.propertyValue}
                    onChange={updatePvr('propertyValue')} metaMin="R500K" metaMax="R3M" />
                  <SliderField label="Deposit Available" hint={fmt(pvr.deposit)}
                    min={0} max={Math.round(pvr.propertyValue * 0.3)} step={10000} value={pvr.deposit}
                    onChange={updatePvr('deposit')} metaMin="R0" metaMax={fmt(Math.round(pvr.propertyValue * 0.3))} />
                  <SliderField label="Monthly Levies / Rates" hint={`${fmt(pvr.levies)}/mo`}
                    min={0} max={8000} step={100} value={pvr.levies}
                    onChange={updatePvr('levies')} metaMin="R0" metaMax="R8K" />
                </div>

                <div className="sim-field-group">
                  <div className="sim-field-group__label">Renting Alternative</div>
                  <SliderField label="Monthly Rent" hint={`${fmt(pvr.monthlyRent)}/mo`}
                    min={5000} max={30000} step={500} value={pvr.monthlyRent}
                    onChange={updatePvr('monthlyRent')} metaMin="R5K" metaMax="R30K" />
                </div>

                <div className="sim-field-group">
                  <div className="sim-field-group__label">Assumptions</div>
                  <SliderField label="Bond Interest Rate" hint={`${pvr.interestRate}%`}
                    min={10} max={18} step={0.25} value={pvr.interestRate}
                    onChange={updatePvr('interestRate')} metaMin="10%" metaMax="18%" />
                  <SliderField label="Property Appreciation p.a." hint={`${pvr.propertyAppreciation}%`}
                    min={0} max={12} step={0.5} value={pvr.propertyAppreciation}
                    onChange={updatePvr('propertyAppreciation')} metaMin="0%" metaMax="12%" />
                  <SliderField label="Investment Return (renting)" hint={`${pvr.investReturn}%`}
                    min={4} max={18} step={0.5} value={pvr.investReturn}
                    onChange={updatePvr('investReturn')} metaMin="4%" metaMax="18%" />
                  <SliderField label="Time Horizon" hint={`${pvr.years} years`}
                    min={1} max={20} step={1} value={pvr.years}
                    onChange={updatePvr('years')} metaMin="1 yr" metaMax="20 yrs" />
                </div>

              </div>
            </div>

            <div className="sim-outputs">
              <div className="sim-compare-row">
                <div className="sim-compare-card sim-compare-card--buy">
                  <div className="sim-compare-card__label">Buying — Total Cost</div>
                  <div className="sim-compare-card__value">{fmtM(pvrResult.totalBuying)}</div>
                  <div className="sim-compare-card__sub">
                    Bond: {fmt(pvrResult.bondRepayment)}/mo · Transfer: {fmt(pvrResult.transferDuty)} · Reg: {fmt(pvrResult.bondReg)}
                  </div>
                </div>
                <div className="sim-compare-card sim-compare-card--rent">
                  <div className="sim-compare-card__label">Renting — Total Cost</div>
                  <div className="sim-compare-card__value">{fmtM(pvrResult.totalRenting)}</div>
                  <div className="sim-compare-card__sub">{fmt(pvr.monthlyRent)}/mo × {pvr.years * 12} months</div>
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

              <div className="sim-bar-chart">
                <div className="sim-bar-chart__header">
                  <div className="sim-bar-chart__title">Cost Breakdown</div>
                  <div className="sim-bar-chart__legend">
                    <div className="sim-legend-item"><div className="sim-legend-dot" style={{ background: 'var(--surface-dark)' }} /> Buying</div>
                    <div className="sim-legend-item"><div className="sim-legend-dot" style={{ background: '#3B82F6' }} /> Renting</div>
                  </div>
                </div>
                <YearBars
                  labels={['Upfront', 'Yr 1', 'Yr 3', `Yr ${pvr.years}`]}
                  buyValues={[pvrResult.upfrontBuying, pvrResult.bondRepayment * 12, pvrResult.bondRepayment * 36, pvrResult.totalBuying]}
                  rentValues={[0, pvr.monthlyRent * 12, pvr.monthlyRent * 36, pvrResult.totalRenting]}
                  colors={['var(--surface-dark)', '#3B82F6']}
                  tooltipLabels={['Buying', 'Renting']}
                />
              </div>

              <div className="sim-verdict">
                <div className="sim-verdict__label">Studio Verdict</div>
                <div className="sim-verdict__text">
                  {pvrResult.buyingWins
                    ? <><strong>Buying builds more wealth</strong> at these inputs over {pvr.years} years. Your equity of {fmtM(pvrResult.equityOwner)} outpaces the renter's invested position of {fmtM(pvrResult.netRenterPosition)}.</>
                    : <><strong>Renting and investing</strong> wins at these inputs over {pvr.years} years. The renter's {fmtM(pvrResult.netRenterPosition)} exceeds the buyer's equity of {fmtM(pvrResult.equityOwner)}.</>
                  }
                </div>
                {pvrResult.breakEvenMonth && (
                  <div className="sim-verdict__breakeven">
                    Break-even: approximately month {pvrResult.breakEvenMonth} — staying longer tips the scales toward buying.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Studio 22 Car vs Invest */}
      {activeTab === 'car' && (
        <>
          <div className="sim-context-note">
            <strong>SA Context:</strong> Balloon finance at prime + 3% ({cvi.interestRate}%). Standard SA structure: 20–30% residual balloon at end of term. Vehicle depreciates ~18% in year 1, ~12% per year thereafter.
          </div>

          <div className="sim-studio">
            <div className="sim-inputs">
              <div className="sim-inputs__header">
                <div className="sim-inputs__title">Car vs Invest</div>
              </div>
              <div className="sim-inputs__body">

                <div className="sim-field-group">
                  <div className="sim-field-group__label">Vehicle Finance</div>
                  <SliderField label="Vehicle Price" hint={fmt(cvi.carPrice)}
                    min={150000} max={1500000} step={10000} value={cvi.carPrice}
                    onChange={updateCvi('carPrice')} metaMin="R150K" metaMax="R1.5M" />
                  <SliderField label="Balloon Payment" hint={`${cvi.balloonPct}% = ${fmt(cvi.carPrice * cvi.balloonPct / 100)}`}
                    min={0} max={40} step={5} value={cvi.balloonPct}
                    onChange={updateCvi('balloonPct')} metaMin="0%" metaMax="40%" />
                  <SliderField label="Finance Term" hint={`${cvi.term} months`}
                    min={24} max={96} step={12} value={cvi.term}
                    onChange={updateCvi('term')} metaMin="24 mo" metaMax="96 mo" />
                  <SliderField label="Monthly Insurance" hint={`${fmt(cvi.insurance)}/mo`}
                    min={500} max={6000} step={100} value={cvi.insurance}
                    onChange={updateCvi('insurance')} metaMin="R500" metaMax="R6K" />
                </div>

                <div className="sim-field-group">
                  <div className="sim-field-group__label">Assumptions</div>
                  <SliderField label="Interest Rate" hint={`${cvi.interestRate}%`}
                    min={10} max={22} step={0.25} value={cvi.interestRate}
                    onChange={updateCvi('interestRate')} metaMin="10%" metaMax="22%" />
                  <SliderField label="Investment Return p.a." hint={`${cvi.investReturn}%`}
                    min={4} max={18} step={0.5} value={cvi.investReturn}
                    onChange={updateCvi('investReturn')} metaMin="4%" metaMax="18%" />
                  <SliderField label="Comparison Period" hint={`${cvi.years} years`}
                    min={1} max={10} step={1} value={cvi.years}
                    onChange={updateCvi('years')} metaMin="1 yr" metaMax="10 yrs" />
                </div>

              </div>
            </div>

            <div className="sim-outputs">
              <div className="sim-compare-row">
                <div className="sim-compare-card sim-compare-card--buy">
                  <div className="sim-compare-card__label">Monthly Repayment</div>
                  <div className="sim-compare-card__value">{fmt(cviResult.repayment)}</div>
                  <div className="sim-compare-card__sub">+ {fmt(cvi.insurance)}/mo insurance · Balloon: {fmt(cviResult.balloon)}</div>
                </div>
                <div className="sim-compare-card sim-compare-card--rent">
                  <div className="sim-compare-card__label">Monthly if Invested Instead</div>
                  <div className="sim-compare-card__value">{fmt(cviResult.repayment + cvi.insurance)}</div>
                  <div className="sim-compare-card__sub">Into equity ETF at {cvi.investReturn}% p.a.</div>
                </div>
              </div>

              <div className="sim-compare-row">
                <div className="sim-compare-card sim-compare-card--buy">
                  <div className="sim-compare-card__label">Total Cost of Ownership</div>
                  <div className="sim-compare-card__value">{fmtM(cviResult.totalCostOwnership)}</div>
                  <div className="sim-compare-card__sub">Car value in {cvi.years} yrs: {fmtM(cviResult.carValue)} · Depreciation: {fmtM(cviResult.depreciation)}</div>
                </div>
                <div className="sim-compare-card sim-compare-card--rent">
                  <div className="sim-compare-card__label">Portfolio if Invested</div>
                  <div className="sim-compare-card__value">{fmtM(cviResult.portfolioValue)}</div>
                  <div className="sim-compare-card__sub">Compound growth over {cvi.years} years</div>
                </div>
              </div>

              <div className="sim-bar-chart">
                <div className="sim-bar-chart__header">
                  <div className="sim-bar-chart__title">Car Cost vs Portfolio Growth</div>
                  <div className="sim-bar-chart__legend">
                    <div className="sim-legend-item"><div className="sim-legend-dot" style={{ background: 'var(--surface-dark)' }} /> Car costs</div>
                    <div className="sim-legend-item"><div className="sim-legend-dot" style={{ background: '#3B82F6' }} /> Portfolio</div>
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
                  colors={['var(--surface-dark)', '#3B82F6']}
                  tooltipLabels={['Car costs', 'Portfolio']}
                />
              </div>

              <div className="sim-verdict">
                <div className="sim-verdict__label">Studio Verdict</div>
                <div className="sim-verdict__text">
                  Your {fmt(cvi.carPrice)} car costs <strong>{fmtM(cviResult.totalCostOwnership)}</strong> over {cvi.years} years — including a <strong>{fmt(cviResult.balloon)} balloon</strong> and {fmtM(cviResult.depreciation)} in depreciation. The same monthly amount into equities would build a <strong>{fmtM(cviResult.portfolioValue)} portfolio</strong>.
                </div>
                <div className="sim-verdict__breakeven">
                  Opportunity cost of this car: {fmtM(cviResult.opportunityCost)} over {cvi.years} years.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Explainer */}
      <div className="sim-context-note" style={{ marginTop: 28 }}>
        <strong>How these calculators work:</strong> Property vs Rent models true total cost of ownership (bond, transfer duty, registration, levies) against the renter's invested position. Car vs Invest uses SA balloon finance structures and real depreciation curves. Numbers are estimates — consult a financial adviser before major decisions.
      </div>
    </div>
  );
}