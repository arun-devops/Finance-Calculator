# India Finance Calculator Suite

A modern, single‑page website with clean UI and **11 calculators** commonly used in India:

- Fixed Deposit (FD)
- Recurring Deposit (RD)
- SIP (Systematic Investment Plan)
- Lumpsum Investment
- SWP (Systematic Withdrawal Plan)
- Loan EMI (Home / Personal / Car / Education) + Amortization table
- NPS Corpus & Pension
- PPF Maturity (approximation note included)
- CAGR
- Inflation & Real Returns
- Goal‑based SIP requirement

## How to use
Open `index.html` in any modern browser. No build steps or external packages are required.

## Notes on logic (India‑specific nuances)
- **FD**: Compounding frequency selectable; default quarterly (typical in India).
- **RD**: Simulated monthly using an equivalent monthly rate derived from quarterly compounding: `(1 + r/4)^(1/3) - 1`.
- **SIP/Lumpsum**: Monthly compounding by default; SIP supports start/end‑of‑month toggles.
- **SWP**: Simulates month‑by‑month: growth, then withdrawal.
- **EMI**: Standard formula with monthly rate; full amortization schedule shown.
- **NPS**: Yearly contributions with optional annual step‑up; split into annuity (min 40%) + lump sum. Monthly pension is estimated with a simple annuity‑rate/12 approximation.
- **PPF**: Annual compounding with deposit timing toggle (start/end of year). Real PPF interest is credited annually based on monthly minimum balances; this is a close approximation suitable for planning.
- **Inflation**: Real return uses Fisher approximation. Also shows 1‑year FV adjustment to today’s money.
- **Goal SIP**: Inverts SIP FV formula to compute the required monthly SIP.

All results are **estimates** for planning; actual bank products can vary. Always check bank/NPS/PPF rules and prevailing rates.

## Styling
Pure CSS (no external frameworks) with a clean, dark theme. Responsive layout with sticky sidebar navigation.
