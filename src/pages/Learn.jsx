

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScrollLock } from '../hooks/useScrollLock';
import { useFinancial } from '../context/FinancialContext';
import { useLearningData } from '../hooks/useLearningData';
import '../styles/Learn.css';
import {
  BookOpen, ChevronRight, Search, X,
  CheckCircle, Circle, Star, Zap, TrendingUp, Home, Shield,
  DollarSign, Globe, BarChart2, AlertTriangle, Info, Award,
  Clock, Check, HelpCircle, ExternalLink, RefreshCw, AlertCircle,
} from 'lucide-react';


const CATEGORY_ICONS = {
  tax:        <DollarSign   size={16} />,
  savings:    <TrendingUp   size={16} />,
  retirement: <Shield       size={16} />,
  property:   <Home         size={16} />,
  investing:  <BarChart2    size={16} />,
  debt:       <AlertTriangle size={16} />,
  offshore:   <Globe        size={16} />,
  basics:     <BookOpen     size={16} />,
};

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];



function LevelBadge({ level }) {
  const map = {
    Beginner:     'badge--beginner',
    Intermediate: 'badge--intermediate',
    Advanced:     'badge--advanced',
  };
  return <span className={`learn-badge ${map[level] || ''}`}>{level}</span>;
}

/** Renders a single structured content block from the JSON schema. */
function ContentBlock({ block }) {
  switch (block.type) {
    case 'intro':
      return <p className="learn-content__intro">{block.text}</p>;
    case 'text':
      return <p className="learn-content__text">{block.text}</p>;
    case 'heading':
      return <h4 className="learn-content__heading">{block.text}</h4>;
    case 'callout':
      return (
        <div className={`learn-callout learn-callout--${block.variant}`}>
          <Info size={14} className="learn-callout__icon" />
          <span>{block.text}</span>
        </div>
      );
    case 'table':
      return (
        <div className="learn-table-wrap">
          <table className="learn-table">
            <thead>
              <tr>{block.headers.map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'example':
      return (
        <div className="learn-example">
          <div className="learn-example__title">{block.title}</div>
          <ol className="learn-example__steps">
            {block.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      );
    case 'comparison':
      return (
        <div className="learn-comparison">
          <div className="learn-comparison__title">{block.title}</div>
          <div className="learn-comparison__items">
            {block.items.map((item, i) => (
              <div key={i} className={`learn-comparison__item${item.highlight ? ' highlighted' : ''}`}>
                <div className="learn-comparison__label">{item.label}</div>
                <div className="learn-comparison__value">{item.value}</div>
                <div className="learn-comparison__sub">{item.sub}</div>
              </div>
            ))}
          </div>
          {block.note && <div className="learn-comparison__note">{block.note}</div>}
        </div>
      );
    default:
      return null;
  }
}


function QuizBlock({ questions }) {
  const [answers,  setAnswers]  = useState({});
  const [revealed, setRevealed] = useState({});

  const pick = (qIdx, oIdx) => {
    if (revealed[qIdx]) return;
    setAnswers(a => ({ ...a, [qIdx]: oIdx }));
  };
  const reveal = (qIdx) => {
    if (answers[qIdx] === undefined) return;
    setRevealed(r => ({ ...r, [qIdx]: true }));
  };

  return (
    <div className="learn-quiz">
      <div className="learn-quiz__header">
        <HelpCircle size={15} />
        <span>Quick Check</span>
      </div>
      {questions.map((q, qIdx) => {
        const selected   = answers[qIdx];
        const isRevealed = revealed[qIdx];
        const isCorrect  = selected === q.answer;

        return (
          <div key={qIdx} className="learn-quiz__question">
            <p className="learn-quiz__q">{q.q}</p>
            <div className="learn-quiz__options">
              {q.options.map((opt, oIdx) => {
                let cls = 'learn-quiz__opt';
                if (selected === oIdx && !isRevealed) cls += ' selected';
                if (isRevealed && oIdx === q.answer)  cls += ' correct';
                if (isRevealed && selected === oIdx && !isCorrect) cls += ' wrong';
                return (
                  <button key={oIdx} className={cls} onClick={() => pick(qIdx, oIdx)}>
                    <span className="learn-quiz__opt-label">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {!isRevealed && selected !== undefined && (
              <button className="learn-quiz__check" onClick={() => reveal(qIdx)}>
                Check Answer
              </button>
            )}
            {isRevealed && (
              <div className={`learn-quiz__explanation ${isCorrect ? 'correct' : 'wrong'}`}>
                <strong>{isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong>{' '}
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


function LearnModalPortal({ children }) {
  return createPortal(children, document.body);
}

function ModuleModal({ module, absaDeepLinks, externalLinks, onClose, onComplete, isCompleted }) {
  const [tab, setTab] = useState('content');
  const cat = { color: module._catColor };

  // Resolve ABSA link from the data (noooooo hardcoded here)
  const absaLinkData   = module.absaLink     ? absaDeepLinks?.[module.absaLink]   : null;
  const externalSource = module.externalLink ? externalLinks?.[module.externalLink] : null;

  useScrollLock();

  return (
    <LearnModalPortal>
    <div className="learn-modal-overlay" onClick={onClose}>
      <div className="learn-modal" onClick={e => e.stopPropagation()}>


        <div className="learn-modal__header" style={{ borderColor: module._catColor }}>
          <div className="learn-modal__meta">
            <span className="learn-modal__cat" style={{ color: module._catColor }}>
              {CATEGORY_ICONS[module.category]}
              {module._catLabel}
            </span>
            <LevelBadge level={module.level} />
            <span className="learn-modal__read-time">
              <Clock size={12} /> {module.readTime} min read
            </span>
          </div>
          <h2 className="learn-modal__title">{module.title}</h2>
          <div className="learn-modal__tabs">
            <button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>
              Explainer
            </button>
            <button className={tab === 'quiz' ? 'active' : ''} onClick={() => setTab('quiz')}>
              Quiz ({module.quiz.length})
            </button>
          </div>
          <button className="learn-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>


        <div className="learn-modal__body">
          {tab === 'content' && (
            <div className="learn-content">
              {module.content.map((block, i) => (
                <ContentBlock key={i} block={block} />
              ))}

              {/* Did You Know */}
              <div className="learn-did-you-know">
                <div className="learn-dyk__label"><Zap size={12} /> Did You Know?</div>
                <p>{module.didYouKnow}</p>
              </div>


              {absaLinkData && (
                <div className="learn-absa-cta">
                  <div className="learn-absa-cta__label">Ready to take action?</div>
                  <a
                    href={absaLinkData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="learn-absa-cta__btn"
                  >
                    {absaLinkData.cta}
                    <ExternalLink size={13} />
                  </a>
                  <span className="learn-absa-cta__disclaimer">
                    Opens ABSA's website · Not financial advice
                  </span>
                </div>
              )}


              {externalSource && (
                <div className="learn-source-link">
                  <Info size={12} />
                  <span>Source / further reading: </span>
                  <a href={externalSource} target="_blank" rel="noopener noreferrer">
                    Official SA government / regulator page
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          )}

          {tab === 'quiz' && (
            <div className="learn-content">
              <p className="learn-content__intro" style={{ marginBottom: 20 }}>
                Test your understanding of <strong>{module.title}</strong>.
              </p>
              <QuizBlock questions={module.quiz} />
            </div>
          )}
        </div>


        <div className="learn-modal__footer">
          {isCompleted ? (
            <span className="learn-modal__done">
              <CheckCircle size={15} /> Completed
            </span>
          ) : (
            <button
              className="learn-modal__complete-btn"
              onClick={() => { onComplete(module.id); onClose(); }}
            >
              <Check size={14} /> Mark as Complete
            </button>
          )}
        </div>
      </div>
    </div>
    </LearnModalPortal>
  );
}

/** glossary sfetched terms rendered with live search. */
function GlossaryPanel({ terms, onClose }) {
  const [search, setSearch] = useState('');
  const bodyRef = useRef(null);

  useScrollLock();

  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0);
  }, []);

  const filtered = terms.filter(t =>
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.def.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, t) => {
    const letter = t.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(t);
    return acc;
  }, {});

  return (
    <LearnModalPortal>
    <div className="learn-modal-overlay" onClick={onClose}>
      <div className="learn-modal learn-modal--glossary" onClick={e => e.stopPropagation()}>
        <div className="learn-modal__header" style={{ borderColor: 'var(--gold)' }}>
          <h2 className="learn-modal__title">SA Financial Glossary</h2>
          <p style={{ color: 'var(--slate)', fontSize: '0.8rem', marginTop: 4 }}>
            {terms.length} terms · Every financial term used in Wealth Studio, defined.
          </p>
          <div className="learn-glossary-search">
            <Search size={14} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search terms…"
              autoFocus
            />
          </div>
          <button className="learn-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="learn-modal__body" ref={bodyRef}>
          {Object.keys(grouped).sort().map(letter => (
            <div key={letter} className="learn-glossary-group">
              <div className="learn-glossary-group__letter">{letter}</div>
              {grouped[letter].map(t => (
                <div key={t.term} className="learn-glossary-term">
                  <div className="learn-glossary-term__name">{t.term}</div>
                  <div className="learn-glossary-term__def">{t.def}</div>
                </div>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)' }}>
              No terms match "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
    </LearnModalPortal>
  );
}

/** Single module card in the grid. */
function ModuleCard({ module, done, recommended, onClick }) {
  return (
    <div
      className={`learn-card${done ? ' learn-card--done' : ''}${recommended ? ' learn-card--recommended' : ''}`}
      onClick={onClick}
    >
      {recommended && !done && (
        <div className="learn-card__rec-badge"><Star size={10} /> Recommended</div>
      )}
      {done && (
        <div className="learn-card__done-badge"><CheckCircle size={12} /> Done</div>
      )}
      <div className="learn-card__cat-bar" style={{ background: module._catColor }} />
      <div className="learn-card__body">
        <div className="learn-card__meta">
          <span className="learn-card__cat-label" style={{ color: module._catColor }}>
            {CATEGORY_ICONS[module.category]}
            {module._catLabel}
          </span>
          <LevelBadge level={module.level} />
        </div>
        <h3 className="learn-card__title">{module.title}</h3>
        <p className="learn-card__summary">{module.summary}</p>
        <div className="learn-card__footer">
          <span className="learn-card__time"><Clock size={11} /> {module.readTime} min</span>
          <span className="learn-card__cta">
            {done ? 'Review' : 'Read'} <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

// loafing & ERROR STATES


function LearnSkeleton() {
  return (
    <div className="learn-page">
      <div className="learn-skeleton__header" />
      <div className="learn-skeleton__grid">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="learn-skeleton__card">
            <div className="learn-skeleton__bar" />
            <div className="learn-skeleton__lines">
              <div className="learn-skeleton__line learn-skeleton__line--short" />
              <div className="learn-skeleton__line" />
              <div className="learn-skeleton__line learn-skeleton__line--med" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearnError({ message, onRetry }) {
  return (
    <div className="learn-page">
      <div className="learn-error-state">
        <AlertCircle size={32} style={{ color: 'var(--negative)', opacity: 0.7 }} />
        <h3>Couldn't load learning content</h3>
        <p>{message}</p>
        <button onClick={onRetry}>
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    </div>
  );
}



export default function Learn() {
  const { financial } = useFinancial();
  const location = useLocation();
  const navigate = useNavigate();


  const { data, loading, error } = useLearningData();
  const [retryKey, setRetryKey] = useState(0);


  const [completed,       setCompleted]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('ws_learn_completed') || '[]'); } catch { return []; }
  });
  const [activeLevel,     setActiveLevel]     = useState('All');
  const [activeCategory,  setActiveCategory]  = useState('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [openModule,      setOpenModule]      = useState(null);
  const [showGlossary,    setShowGlossary]    = useState(false);

  useEffect(() => {
    if (location.state?.openGlossary) {
      setShowGlossary(true);
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const markComplete = (id) => {
    const next = completed.includes(id) ? completed : [...completed, id];
    setCompleted(next);
    localStorage.setItem('ws_learn_completed', JSON.stringify(next));
  };


  if (error)   return <LearnError message={error} onRetry={() => setRetryKey(k => k + 1)} />;
  if (!data)   return null;


  const categoryMap = Object.fromEntries(
    (data.categories || []).map(c => [c.id, c])
  );

  const enrichedModules = (data.modules || []).map(m => ({
    ...m,
    _catColor: categoryMap[m.category]?.colorVar || 'var(--slate)',
    _catLabel: categoryMap[m.category]?.label    || m.category,
  }));


  const track          = financial?.selectedTrack || 'balanced';
  const recommendedIds = data.trackRecommendations?.[track] || data.trackRecommendations?.balanced || [];

  const filtered = enrichedModules.filter(m => {
    const levelMatch  = activeLevel    === 'All' || m.level    === activeLevel;
    const catMatch    = activeCategory === 'all' || m.category === activeCategory;
    const searchMatch = !searchQuery   ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return levelMatch && catMatch && searchMatch;
  });

  const completedCount = completed.length;
  const totalCount     = enrichedModules.length;
  const progressPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const trackLabel = {
    property:   'First Property Path',
    balanced:   'Balanced Lifestyle',
    aggressive: 'Aggressive Global',
  }[track] || 'Balanced Lifestyle';

  const categoriesWithAll = [
    { id: 'all', label: 'All Topics', colorVar: '' },
    ...(data.categories || []),
  ];


  return (
    <div className="learn-page">

      {/*Header  */}
      <div className="learn-page__header">
        <div className="learn-page__eyebrow">Financial Literacy</div>
        <h1 className="learn-page__title">Learn</h1>
        <p className="learn-page__subtitle">
          SA-specific explainers on the financial concepts that matter most in your
          first five years. Real numbers, real context — no textbook fluff.
        </p>


        <div className="learn-progress-banner">
          <div className="learn-progress-banner__left">
            <Award size={18} className="learn-progress-banner__icon" />
            <div>
              <div className="learn-progress-banner__label">Your Learning Progress</div>
              <div className="learn-progress-banner__sub">
                {completedCount} of {totalCount} modules completed
              </div>
            </div>
          </div>
          <div className="learn-progress-banner__bar-wrap">
            <div className="learn-progress-banner__bar">
              <div
                className="learn-progress-banner__fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="learn-progress-banner__pct">{progressPct}%</span>
          </div>
        </div>
      </div>


      <div className="learn-quick-actions">
        <button className="learn-quick-btn" onClick={() => setShowGlossary(true)}>
          <BookOpen size={15} />
          SA Glossary ({data.glossary?.length || 0} terms)
        </button>
        <div className="learn-search">
          <Search size={14} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search modules…"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}><X size={12} /></button>
          )}
        </div>
      </div>

      {/* Recommended section */}
      {!searchQuery && activeCategory === 'all' && (
        <div className="learn-section">
          <div className="learn-section__header">
            <Star size={15} className="learn-section__icon" style={{ color: 'var(--gold)' }} />
            <span>Recommended for your track</span>
            <span
              className="learn-section__badge"
              style={{ background: 'var(--gold)', color: '#000' }}
            >
              {trackLabel}
            </span>
          </div>
          <div className="learn-cards-grid learn-cards-grid--3">
            {enrichedModules
              .filter(m => recommendedIds.includes(m.id))
              .map(m => (
                <ModuleCard
                  key={m.id}
                  module={m}
                  done={completed.includes(m.id)}
                  recommended
                  onClick={() => setOpenModule(m)}
                />
              ))}
          </div>
        </div>
      )}


      <div className="learn-filters">
        <div className="learn-filter-row">
          <span className="learn-filter-label">Level:</span>
          {['All', ...LEVELS].map(l => (
            <button
              key={l}
              className={`learn-filter-pill${activeLevel === l ? ' active' : ''}`}
              onClick={() => setActiveLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="learn-filter-row learn-filter-row--cats">
          <span className="learn-filter-label">Topic:</span>
          {categoriesWithAll.map(c => (
            <button
              key={c.id}
              className={`learn-filter-pill learn-filter-pill--cat${activeCategory === c.id ? ' active' : ''}`}
              style={activeCategory === c.id && c.colorVar
                ? { borderColor: c.colorVar, color: c.colorVar }
                : {}
              }
              onClick={() => setActiveCategory(c.id)}
            >
              {c.id !== 'all' && CATEGORY_ICONS[c.id]}
              {c.label}
            </button>
          ))}
        </div>
      </div>


      <div className="learn-section">
        <div className="learn-section__header">
          <BookOpen size={15} className="learn-section__icon" />
          <span>
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeCategory !== 'all'
                ? categoriesWithAll.find(c => c.id === activeCategory)?.label
                : activeLevel !== 'All'
                  ? `${activeLevel} Modules`
                  : 'All Modules'
            }
          </span>
          <span className="learn-section__count">
            {filtered.length} module{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="learn-empty">
            <Search size={28} style={{ opacity: 0.3 }} />
            <p>No modules match your filters.</p>
            <button onClick={() => {
              setActiveLevel('All');
              setActiveCategory('all');
              setSearchQuery('');
            }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="learn-cards-grid">
            {filtered.map(m => (
              <ModuleCard
                key={m.id}
                module={m}
                done={completed.includes(m.id)}
                onClick={() => setOpenModule(m)}
              />
            ))}
          </div>
        )}
      </div>


      <div className="learn-level-guide">
        <div className="learn-level-guide__title">Learning Path Guide</div>
        <div className="learn-level-guide__items">
          {[
            { level: 'Beginner',     icon: <Circle size={14} />,    desc: 'Core concepts every earner must understand — PAYE, TFSA, emergency funds, and credit basics.' },
            { level: 'Intermediate', icon: <TrendingUp size={14} />, desc: 'Deep dives into RA, property maths, and debt management — the decisions that shape your first five years.' },
            { level: 'Advanced',     icon: <Zap size={14} />,       desc: 'Offshore investing, compound growth mechanics, and strategies for aggressive wealth building.' },
          ].map(item => (
            <div key={item.level} className="learn-level-item">
              <div className={`learn-level-item__icon badge--${item.level.toLowerCase()}`}>
                {item.icon}
              </div>
              <div>
                <div className="learn-level-item__name">{item.level}</div>
                <div className="learn-level-item__desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {openModule && (
        <ModuleModal
          module={openModule}
          absaDeepLinks={data.absaDeepLinks}
          externalLinks={data.externalLinks}
          onClose={() => setOpenModule(null)}
          onComplete={markComplete}
          isCompleted={completed.includes(openModule.id)}
        />
      )}
      {showGlossary && (
        <GlossaryPanel
          terms={data.glossary || []}
          onClose={() => setShowGlossary(false)}
        />
      )}
    </div>
  );
}
