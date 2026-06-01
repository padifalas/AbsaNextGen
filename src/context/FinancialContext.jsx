import { createContext, useContext, useState } from 'react';

const FinancialContext = createContext(null);

// SARS 2024/25 TAX TABLES
//  idk how accrrate these are but i used this Source: https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/


const TAX_BRACKETS = [
  { min: 0,        max: 237100,   base: 0,      rate: 0.18 },
  { min: 237101,   max: 370500,   base: 42678,  rate: 0.26 },
  { min: 370501,   max: 512800,   base: 77362,  rate: 0.31 },
  { min: 512801,   max: 673000,   base: 121475, rate: 0.36 },
  { min: 673001,   max: 857900,   base: 179147, rate: 0.39 },
  { min: 857901,   max: 1817000,  base: 251258, rate: 0.41 },
  { min: 1817001,  max: Infinity, base: 644489, rate: 0.45 },
];

const PRIMARY_REBATE    = 17235;
const UIF_RATE          = 0.01;
const UIF_CAP_MONTHLY   = 177.12; // Annual ceiling R17 712 / 12


const RA_DEDUCTION_PCT  = 0.275;  // 27.5% of greater of remuneration or taxable income
const RA_DEDUCTION_CAP  = 350000; // Absolute annual cap ........R350 000 peryear


// calculateTax(grossMonthly, raMonthly?)
//

//
// RETURNS:
//   paye          — monthly PAYE after RA deduction
//   uif           — monthly UIF (calculated on gross, not taxable income)
//   takeHome      — grossMonthly − paye − uif
//   effectiveRate — effective tax rate on gross income (for display)
//   raTaxSaving   — monthly PAYE reduction attributable to the RA contribution
//   raDeductionUsed — annual RA amount actually deducted (may be < raMonthly * 12 if capped)


export function calculateTax(grossMonthly, raMonthly = 0) {
  const grossAnnual = grossMonthly * 12;


  const raAnnual           = raMonthly * 12;
  const maxByPct           = grossAnnual * RA_DEDUCTION_PCT;
  const allowableDeduction = Math.min(raAnnual, maxByPct, RA_DEDUCTION_CAP);
  const taxableAnnual      = Math.max(0, grossAnnual - allowableDeduction);


  const bracket = TAX_BRACKETS.find(b => taxableAnnual >= b.min && taxableAnnual <= b.max)
    || TAX_BRACKETS[0];

  const annualTaxBeforeRebate = bracket.base + (taxableAnnual - bracket.min) * bracket.rate;
  const annualTaxAfterRebate  = Math.max(0, annualTaxBeforeRebate - PRIMARY_REBATE);
  const monthlyPaye           = annualTaxAfterRebate / 12;


  const bracketNoRa            = TAX_BRACKETS.find(b => grossAnnual >= b.min && grossAnnual <= b.max)
    || TAX_BRACKETS[0];
  const annualTaxNoRa          = Math.max(0,
    bracketNoRa.base + (grossAnnual - bracketNoRa.min) * bracketNoRa.rate - PRIMARY_REBATE
  );
  const monthlyPayeNoRa        = annualTaxNoRa / 12;
  const raTaxSavingMonthly     = Math.round(monthlyPayeNoRa - monthlyPaye);


  const monthlyUif = Math.min(grossMonthly * UIF_RATE, UIF_CAP_MONTHLY);
  const takeHome = Math.round(grossMonthly - monthlyPaye - monthlyUif);

  return {
    paye:              Math.round(monthlyPaye),
    uif:               Math.round(monthlyUif),
    takeHome,
    effectiveRate:     grossAnnual > 0
      ? ((annualTaxAfterRebate / grossAnnual) * 100).toFixed(1)
      : '0.0',
    raTaxSaving:       raTaxSavingMonthly,          // monthly PAYE reduction from RA
    raDeductionUsed:   Math.round(allowableDeduction), // annual amount actually deducted
    raDeductionCapped: raAnnual > 0 && allowableDeduction < raAnnual, // true if SARS cap hit
  };
}



const DEFAULT_STATE = {
  // Income
  grossMonthly: 45000,

  // Fixed expenses
  rent:         12000,
  carRepayment: 6500,
  medicalAid:   3200,
  insurance:    1200,
  studentLoan:  0,

  // Savings
  tfsa:         3000,
  ra:           0,

  // Emergency fund
  emergencyFund:       0,
  emergencyFundTarget: 36000, // 3 months of R12k rent

  // Property goal
  depositTarget: 180000,
  depositSaved:  22000,


  selectedTrack: 'property',
};



export function FinancialProvider({ children }) {
  const [financial, setFinancial] = useState(() => {
    try {
      const stored = localStorage.getItem('ws_financial');
      return stored ? { ...DEFAULT_STATE, ...JSON.parse(stored) } : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  const updateFinancial = (updates) => {
    setFinancial((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('ws_financial', JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };


  const tax = calculateTax(financial.grossMonthly, financial.ra);

  const totalFixedCosts =
    financial.rent +
    financial.carRepayment +
    financial.medicalAid +
    financial.insurance +
    financial.studentLoan;

  const totalSavingsContributions = financial.tfsa + financial.ra;

  // Free money/capital = what's for real unallocated each month
  const freeCapital = tax.takeHome - totalFixedCosts - totalSavingsContributions;

  const debtToIncome = tax.takeHome > 0
    ? ((financial.carRepayment + financial.studentLoan) / tax.takeHome * 100).toFixed(1)
    : '0.0';

  const savingsRate = tax.takeHome > 0
    ? ((totalSavingsContributions / tax.takeHome) * 100).toFixed(1)
    : '0.0';

  const depositProgress = financial.depositTarget > 0
    ? ((financial.depositSaved / financial.depositTarget) * 100).toFixed(1)
    : '0.0';

  const monthsToDeposit = freeCapital > 0
    ? Math.ceil((financial.depositTarget - financial.depositSaved) / (freeCapital * 0.7))
    : null;

  return (
    <FinancialContext.Provider
      value={{
        financial,
        updateFinancial,
        derived: {
          tax,
          totalFixedCosts,
          totalSavingsContributions,
          freeCapital,
          debtToIncome,
          savingsRate,
          depositProgress,
          monthsToDeposit,
        },
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error('useFinancial must be used within FinancialProvider');
  return ctx;
}
