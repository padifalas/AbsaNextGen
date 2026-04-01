import { createContext, useContext, useState } from 'react';

const FinancialContext = createContext(null);

// SARS 2024/25 tax tables (annual brackets)
const TAX_BRACKETS = [
  { min: 0, max: 237100, base: 0, rate: 0.18 },
  { min: 237101, max: 370500, base: 42678, rate: 0.26 },
  { min: 370501, max: 512800, base: 77362, rate: 0.31 },
  { min: 512801, max: 673000, base: 121475, rate: 0.36 },
  { min: 673001, max: 857900, base: 179147, rate: 0.39 },
  { min: 857901, max: 1817000, base: 251258, rate: 0.41 },
  { min: 1817001, max: Infinity, base: 644489, rate: 0.45 },
];

const PRIMARY_REBATE = 17235; // 2024/25
const UIF_RATE = 0.01;
const UIF_CAP_MONTHLY = 177.12; // R17 712 annual ceiling / 12

export function calculateTax(grossMonthly) {
  const annual = grossMonthly * 12;
  const bracket = TAX_BRACKETS.find(b => annual >= b.min && annual <= b.max);
  if (!bracket) return { paye: 0, uif: 0, takeHome: grossMonthly };

  const annualTax = bracket.base + (annual - bracket.min) * bracket.rate;
  const afterRebate = Math.max(0, annualTax - PRIMARY_REBATE);
  const monthlyPaye = afterRebate / 12;
  const monthlyUif = Math.min(grossMonthly * UIF_RATE, UIF_CAP_MONTHLY);

  return {
    paye: Math.round(monthlyPaye),
    uif: Math.round(monthlyUif),
    takeHome: Math.round(grossMonthly - monthlyPaye - monthlyUif),
    effectiveRate: ((afterRebate / annual) * 100).toFixed(1),
  };
}

const DEFAULT_STATE = {
  // Income
  grossMonthly: 45000,

  // Fixed expenses
  rent: 12000,
  carRepayment: 6500,
  medicalAid: 3200,
  insurance: 1200,
  studentLoan: 0,

  // Savings / Investments
  tfsa: 3000,
  ra: 0,
  emergencyFund: 0,
  emergencyFundTarget: 36000, // 3 months of R12k rent

  // Goals
  depositTarget: 180000,
  depositSaved: 22000,

  // Track selection
  selectedTrack: 'property', // 'property' | 'balanced' | 'aggressive'
};

export function FinancialProvider({ children }) {
  const [financial, setFinancial] = useState(DEFAULT_STATE);

  const updateFinancial = (updates) => {
    setFinancial(prev => ({ ...prev, ...updates }));
  };

  // Derived values
  const tax = calculateTax(financial.grossMonthly);

  const totalFixedCosts =
    financial.rent +
    financial.carRepayment +
    financial.medicalAid +
    financial.insurance +
    financial.studentLoan;

  const totalSavingsContributions = financial.tfsa + financial.ra;

  const freeCapital = tax.takeHome - totalFixedCosts - totalSavingsContributions;

  const debtToIncome = ((financial.carRepayment + financial.studentLoan) / tax.takeHome * 100).toFixed(1);

  const savingsRate = ((totalSavingsContributions / tax.takeHome) * 100).toFixed(1);

  const depositProgress = ((financial.depositSaved / financial.depositTarget) * 100).toFixed(1);

  const monthsToDeposit =
    freeCapital > 0
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
