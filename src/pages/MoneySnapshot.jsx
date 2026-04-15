import '../styles/MoneySnapshot.css';
import { useFinancial } from '../context/FinancialContext';

const fmt = (value) => `R${Number(value || 0).toLocaleString('en-ZA')}`;

export default function MoneySnapshot() {
  const { financial, derived } = useFinancial();

  return (
    <div className="snapshot">
      <div className="snapshot__header">
        <div className="snapshot__header-left">
          <h1 className="snapshot__title">Money Snapshot</h1>
          <p className="snapshot__subtitle">
            Your financial position, after tax, in plain terms.
          </p>
        </div>
      </div>

      <div className="snapshot__grid">
        <div className="snapshot__card">
          <div className="snapshot__card-label">Gross monthly salary</div>
          <div className="snapshot__card-value">{fmt(financial.grossMonthly)}</div>
        </div>
        <div className="snapshot__card">
          <div className="snapshot__card-label">Take-home pay</div>
          <div className="snapshot__card-value">{fmt(derived.tax.takeHome)}</div>
        </div>
        <div className="snapshot__card">
          <div className="snapshot__card-label">Tax & UIF</div>
          <div className="snapshot__card-value">{fmt(derived.tax.paye + derived.tax.uif)}</div>
        </div>
        <div className="snapshot__card">
          <div className="snapshot__card-label">Fixed monthly costs</div>
          <div className="snapshot__card-value">{fmt(derived.totalFixedCosts)}</div>
        </div>
        <div className="snapshot__card">
          <div className="snapshot__card-label">Savings contributions</div>
          <div className="snapshot__card-value">{fmt(derived.totalSavingsContributions)}</div>
        </div>
        <div className="snapshot__card">
          <div className="snapshot__card-label">Free capital</div>
          <div className="snapshot__card-value">{fmt(derived.freeCapital)}</div>
        </div>
      </div>

      <div className="snapshot__summary">
        <div>
          <div className="snapshot__summary-label">Active strategy</div>
          <div className="snapshot__summary-value">
            {financial.selectedTrack?.replace(/([A-Z])/g, ' $1').trim() || 'Balanced Lifestyle'}
          </div>
        </div>
        <div>
          <div className="snapshot__summary-label">Debt-to-income</div>
          <div className="snapshot__summary-value">{derived.debtToIncome}%</div>
        </div>
        <div>
          <div className="snapshot__summary-label">Savings rate</div>
          <div className="snapshot__summary-value">{derived.savingsRate}%</div>
        </div>
      </div>
    </div>
  );
}