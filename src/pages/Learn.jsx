import '../styles/Learn.css';

export default function Learn() {
  return (
    <div className="learn-page">
      <div className="learn-page__header">
        <div className="learn-page__eyebrow">Financial Literacy</div>
        <h1 className="learn-page__title">Learn</h1>
        <p className="learn-page__subtitle">
          These are SA-specific explainers on the financial concepts that matter most in your first five years. No hectic wording, no textbook - just what you need to know and why.

          <br />
          <br />

          <b style={{ color: 'var(--sage)' }}>NB:</b> I thought of putting mock info but figured I can replace the EXPLAINERS, GLOSSARY, and QUICK_LINKS constant arrays with a useEffect data fetch later on for the exam.
        </p>


      </div>
    </div>
  );
}
