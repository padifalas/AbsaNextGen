import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinancial, calculateTax } from '../context/FinancialContext';
import '../styles/Onboarding.css';

const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheck = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M1.5 4.5l2.2 2.2 3.8-3.9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Track metadata ── */
const TRACKS = [
  {
    id: 'property',
    name: 'First Property Path',
    desc: 'Deposit-first. Own a home before 30.',
    iconClass: 'ob-track__icon--property',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 14V7l6-5 6 5v7H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <rect x="5.5" y="9" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    id: 'balanced',
    name: 'Balanced Lifestyle',
    desc: 'TFSA + RA + quality of life. No guilt.',
    iconClass: 'ob-track__icon--balanced',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'aggressive',
    name: 'Aggressive Global',
    desc: 'Max offshore ETFs. Build to options.',
    iconClass: 'ob-track__icon--aggressive',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 9.5l2-3 2 1.5 2-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const TRACK_DISPLAY = {
  property:   'First Property Path',
  balanced:   'Balanced Lifestyle & Investing',
  aggressive: 'Aggressive Global Investor',
};

const STEP_META = [
  {
    eyebrow: 'Your income',
    title: 'What do you earn?',
    sub: "Enter your gross monthly salary — we'll calculate your PAYE and take-home using SARS 2024/25 tables.",
  },
  {
    eyebrow: 'Monthly costs',
    title: 'Where does it go?',
    sub: 'Add your fixed monthly commitments. We use these to calculate your free capital and benchmark against SA peers.',
  },
  {
    eyebrow: 'Your strategy',
    title: 'Pick your track',
    sub: 'Choose the financial roadmap that matches your five-year goals. This shapes your nudges, milestones, and Simulation Lab recommendations.',
  },
  {
    eyebrow: "You're all set",
    title: 'Confirm & launch',
    sub: 'Review your setup and head into your dashboard. Everything can be edited at any time from Money Snapshot.',
  },
];


const parseNum = (str) => parseInt(String(str).replace(/\D/g, ''), 10) || 0;
const fmt = (n) => `R${Math.round(n).toLocaleString('en-ZA')}`;

/*  Step 1:which for  Income */
function StepIncome({ data, onChange }) {
  const tax = data.grossMonthly ? calculateTax(data.grossMonthly) : null;

  return (
    <>
      <div className="ob-field">
        <label htmlFor="ob-gross">Gross monthly salary (R)</label>
        <input
          id="ob-gross"
          className="ob-input"
          type="text"
          placeholder="45 000"
          value={data.grossMonthly ? data.grossMonthly.toLocaleString('en-ZA') : ''}
          onChange={(e) => onChange({ grossMonthly: parseNum(e.target.value) })}
        />
        <span className="ob-field__hint">The number on your offer letter — before any deductions</span>
      </div>

      <div className="ob-derived">
        <div className="ob-derived-tile">
          <div className="ob-derived-tile__label">PAYE est.</div>
          <div className="ob-derived-tile__value neg">{tax ? fmt(tax.paye) : '—'}</div>
        </div>
        <div className="ob-derived-tile">
          <div className="ob-derived-tile__label">UIF</div>
          <div className="ob-derived-tile__value neg">{tax ? fmt(tax.uif) : '—'}</div>
        </div>
        <div className="ob-derived-tile">
          <div className="ob-derived-tile__label">Take-home</div>
          <div className="ob-derived-tile__value pos">{tax ? fmt(tax.takeHome) : '—'}</div>
        </div>
      </div>

      <div className="ob-field-row">
        <div className="ob-field">
          <label htmlFor="ob-city">City</label>
          <select
            id="ob-city"
            className="ob-input"
            value={data.city || ''}
            onChange={(e) => onChange({ city: e.target.value })}
          >
            <option value="">Select your city</option>
            <option>Pretoria</option>
            <option>Cape Town</option>
            <option>Joburg</option>
            <option>Durban</option>
            <option>Other</option>
          </select>
        </div>
        <div className="ob-field">
          <label htmlFor="ob-years">Years working in SA</label>
          <select
            id="ob-years"
            className="ob-input"
            value={data.yearsWorking || ''}
            onChange={(e) => onChange({ yearsWorking: e.target.value })}
          >
            <option value="">Select</option>
            <option>Less than 1 year</option>
            <option>1–2 years</option>
            <option>2–5 years</option>
            <option>5+ years</option>
          </select>
        </div>
      </div>
    </>
  );
}

/*  Step 2: Expenses  */
function StepExpenses({ data, onChange }) {
  const fields = [
    { key: 'rent',          label: 'Rent / Bond repayment (R)', placeholder: '12 000' },
    { key: 'carRepayment',  label: 'Car repayment (R)',          placeholder: '6 500'  },
    { key: 'medicalAid',    label: 'Medical aid (R)',            placeholder: '3 200'  },
    { key: 'insurance',     label: 'Insurance (R)',              placeholder: '1 200'  },
    { key: 'tfsa',          label: 'TFSA contribution (R)',      placeholder: '3 000'  },
    { key: 'ra',            label: 'RA contribution (R)',        placeholder: '0'      },
  ];

  return (
    <>
      <div className="ob-expense-grid">
        {fields.map(({ key, label, placeholder }) => (
          <div className="ob-field" key={key}>
            <label>{label}</label>
            <input
              className="ob-input"
              type="text"
              placeholder={placeholder}
              value={data[key] ? data[key].toLocaleString('en-ZA') : ''}
              onChange={(e) => onChange({ [key]: parseNum(e.target.value) })}
            />
          </div>
        ))}
      </div>
      <div className="ob-callout ob-callout--gold">
        <strong>Leave anything at zero</strong> — you can update all of these any time from Money Snapshot.
      </div>
    </>
  );
}

/*  Step 3: Track */
function StepTrack({ data, onChange }) {
  return (
    <>
      <div className="ob-tracks">
        {TRACKS.map((t) => (
          <div
            key={t.id}
            className={`ob-track${data.selectedTrack === t.id ? ' selected' : ''}`}
            onClick={() => onChange({ selectedTrack: t.id })}
            role="radio"
            aria-checked={data.selectedTrack === t.id}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onChange({ selectedTrack: t.id })}
          >
            <div className="ob-track__check"><IconCheck /></div>
            <div className={`ob-track__icon ${t.iconClass}`}>{t.icon}</div>
            <div className="ob-track__name">{t.name}</div>
            <div className="ob-track__desc">{t.desc}</div>
          </div>
        ))}
      </div>
      <div className="ob-callout ob-callout--gold">
        Not sure? Pick <strong>Balanced Lifestyle</strong> — it's the most flexible and can be changed any time from Strategy Tracks.
      </div>
    </>
  );
}

/* Step 4: Confirm */
function StepConfirm({ data }) {
  const tax = data.grossMonthly ? calculateTax(data.grossMonthly) : null;

  return (
    <>
      <div className="ob-callout ob-callout--sage" style={{ marginBottom: 20 }}>
        <strong>Your Wealth Studio is ready.</strong> Here's a summary of what we've set up — you can edit everything from your dashboard.
      </div>
      <div className="ob-confirm-grid">
        <div className="ob-confirm-tile">
          <div className="ob-confirm-tile__label">Gross salary</div>
          <div className="ob-confirm-tile__value">{data.grossMonthly ? fmt(data.grossMonthly) + '/pm' : '—'}</div>
        </div>
        <div className="ob-confirm-tile">
          <div className="ob-confirm-tile__label">Take-home</div>
          <div className="ob-confirm-tile__value">{tax ? fmt(tax.takeHome) + '/pm' : '—'}</div>
        </div>
        <div className="ob-confirm-tile">
          <div className="ob-confirm-tile__label">Tax (PAYE + UIF)</div>
          <div className="ob-confirm-tile__value">{tax ? fmt(tax.paye + tax.uif) + '/pm' : '—'}</div>
        </div>
        <div className="ob-confirm-tile">
          <div className="ob-confirm-tile__label">City</div>
          <div className="ob-confirm-tile__value">{data.city || '—'}</div>
        </div>
        <div className="ob-confirm-track">
          <div className="ob-confirm-track__label">Active strategy track</div>
          <div className="ob-confirm-track__value">{TRACK_DISPLAY[data.selectedTrack] || '—'}</div>
        </div>
      </div>
    </>
  );
}

/* main*/
export default function Onboarding() {
  const { completeOnboarding } = useAuth();
  const { updateFinancial } = useFinancial();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  //  form data gotten — like FinancialContext 
  const [formData, setFormData] = useState({
    grossMonthly: 0,
    city: '',
    yearsWorking: '',
    rent: 0,
    carRepayment: 0,
    medicalAid: 0,
    insurance: 0,
    tfsa: 0,
    ra: 0,
    selectedTrack: 'balanced',
  });

  const patchForm = (patch) => setFormData(prev => ({ ...prev, ...patch }));

  const TOTAL_STEPS = 4;

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Final step: commit the collected onboarding values and mark the user onboarded.
    updateFinancial(formData);
    const result = await completeOnboarding();
    if (result.success) {
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const meta = STEP_META[step];
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="onboarding-page">

      {/* Top bar */}
      <div className="onboarding-topbar">
        <Link to="/" className="onboarding-brand">
          <div className="onboarding-brand__pill">
            <svg viewBox="0 0 18 18" fill="none">
              <path d="M9 2L3 6v6l6 4 6-4V6L9 2z" fill="white" opacity="0.95"/>
              <path d="M6 9.5l2 2 4-4" stroke="#C1121F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="onboarding-brand__name">Wealth Studio</span>
        </Link>
        <span className="onboarding-step-count">Step {step + 1} of {TOTAL_STEPS}</span>
      </div>

      {/* Progress bar */}
      <div className="onboarding-progress">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`onboarding-progress__seg${i < step ? ' done' : i === step ? ' active' : ''}`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="onboarding-card">
        <div className="onboarding-card__header">
          <div className="onboarding-card__eyebrow">
            <div className="onboarding-card__eyebrow-dot" />
            {meta.eyebrow}
          </div>
          <h2 className="onboarding-card__title">{meta.title}</h2>
          <p className="onboarding-card__sub">{meta.sub}</p>
        </div>

        <div className="onboarding-card__body">
          {step === 0 && <StepIncome     data={formData} onChange={patchForm} />}
          {step === 1 && <StepExpenses   data={formData} onChange={patchForm} />}
          {step === 2 && <StepTrack      data={formData} onChange={patchForm} />}
          {step === 3 && <StepConfirm    data={formData} />}
        </div>

        <div className="onboarding-card__footer">
          <button
            className="ob-btn-back"
            onClick={handleBack}
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
          >
            <IconChevronLeft />
            Back
          </button>

          <button
            className={`ob-btn-next${isLast ? ' finish' : ''}`}
            onClick={handleNext}
          >
            {isLast ? 'Launch my dashboard' : 'Continue'}
            {!isLast && <IconChevronRight />}
          </button>
        </div>
      </div>

    </div>
  );
}