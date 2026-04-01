import '../styles/MoneySnapshot.css';

export default function MoneySnapshot() {
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
    </div>
  );
}