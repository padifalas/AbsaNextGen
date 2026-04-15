import '../styles/StrategyTracks.css';
import { useFinancial } from '../context/FinancialContext';

const TRACK_NAMES = {
  property: 'First Property Path',
  balanced: 'Balanced Lifestyle',
  aggressive: 'Aggressive Global',
};

export default function StrategyTracks() {
  const { financial } = useFinancial();
  const activeTrack = TRACK_NAMES[financial.selectedTrack] || 'Balanced Lifestyle';

  return (
    <div className="tracks-page">
      <div className="tracks-page__header">
        <div className="tracks-page__eyebrow">First Five Years</div>
        <h1 className="tracks-page__title">Strategy Tracks</h1>
        <p className="tracks-page__subtitle">
          Opinionated, named financial roadmaps that make deliberate trade-offs. Pick one track as your primary path — it filters your nudges, milestones, and Studio recommendations.
        </p>
        <p className="tracks-page__summary">
          Active strategy: <strong>{activeTrack}</strong>
        </p>
      </div>
    </div>
  );
}
