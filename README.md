# ABSA NextGen Wealth Studio-  First Five Years

A fintech-style React + Vite web application for young South African professionals (22–35). Helps users understand their finances, explore trade-offs, and make smarter decisions through interactive dashboards, strategy tracks, and simulations — grounded in a South African financial context (ZAR, SARS, RA, TFSA, medical aid).
 
> This is not a budgeting app.
>
> ## Tech Stack
 
- [React](https://react.dev/) + [Vite](https://vite.dev/) — fast dev server and build tooling
- [React Router v6](https://reactrouter.com/) — multi-page client-side routing
- React Context + `useState` — shared financial state across the app
- CSS Modules — scoped, component-level styling (no UI frameworks)

- ## Core Features
 
### Money Snapshot
The user's financial home base. Input gross salary and get a full SA-contextualised breakdown — PAYE, UIF, take-home, RA deduction potential, TFSA headroom, and a debt-to-income ratio benchmarked against SA norms.
 
### Strategy Tracks
Three opinionated five-year financial roadmaps that make deliberate trade-offs based on the user's values and goals:
 
- **Track 1 — First Property Path** — deposit accumulation, bond pre-qualification, property purchase before 30
- **Track 2 — Balanced Lifestyle & Investing** — TFSA + RA maximisation alongside a conscious lifestyle budget
- **Track 3 — Aggressive Global Investor** — offshore ETF allocation, SARB allowance strategy, FIRE-oriented planning
### Simulation Lab
SA-contextualised decision modellers with real numbers:
 
- **Studio 1 — Property vs Renting in Joburg** - 5-year cost comparison, break-even month, transfer duty, bond registration
- **Studio 2 — Luxury Car vs Invest the Difference** - true cost of ownership, balloon payment modelling, depreciation curve
- **Studio 3 — Local vs Offshore Portfolio** - ZAR depreciation scenarios, JSE vs global ETF comparison
### Education Layer
Financial literacy embedded contextually throughout the product — not a separate section. Explainers on RA, TFSA, transfer duty, prime rate, and more surface inline wherever relevant.
 
## South African Financial Context
 
All calculations use real SA figures:
 
- SARS PAYE 2024/25 tax tables (marginal rates 18–45%)
- RA deduction limit: 27.5% of taxable income (max R350 000/year)
- TFSA: R36 000/year contribution limit, R500 000 lifetime cap
- Medical Aid Tax Credit: R364/month (primary member)
- Prime rate: 11.75% - used in all bond and debt calculations
- Transfer duty: 0% under R1.1M, scaled thereafter
- Property: Joburg entry-level from R900K, Cape Town from R1.4M
- SARB Single Discretionary Allowance: R1M/year for offshore investing

## Disclaimer
 
This application is a prototype built for demonstration purposes for a uni assignment. It is not affiliated with or endorsed by ABSA Group Limited. Financial figures are based on publicly available South African tax and market data and should not be treated as professional financial advice.
