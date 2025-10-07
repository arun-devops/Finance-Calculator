// ===== Helpers =====
function fmtMoneyDec(x,d=2){ return "₹ " + Number(x).toLocaleString('en-IN',{minimumFractionDigits:d, maximumFractionDigits:d}); }
function fmtLakh(x){ const v = Number(x)/100000; return "₹ " + v.toLocaleString('en-IN',{minimumFractionDigits:2, maximumFractionDigits:2}) + " Lacs"; }
function fmtMoney(x){ return "₹ " + Math.round(Number(x)).toLocaleString("en-IN"); }
function fmtPct(x){
  let v = Number(x);
  if (!isFinite(v)) v = 0;
  v = Math.round((v + 1e-10)*100)/100;
  const whole = Math.round(v);
  return (Math.abs(v - whole) < 1e-6 ? whole : v.toLocaleString("en-IN", {maximumFractionDigits:2})) + " %";
}
function clampNum(v, min=0){ v = Number(v); if(Number.isNaN(v)) return 0; return v<min?min:v; }
function buildTable(headers, rows){
  let th = headers.map(h=>`<th>${h}</th>`).join("");
  let body = rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`;
}
function showWarning(msg,id){
  const el = document.getElementById(id);
  el.insertAdjacentHTML('afterbegin', `<div class='warning'>⚠️ ${msg}</div>`);
}

// ===== FD =====
function calcFD(){
  const P = clampNum(document.getElementById('fd_principal').value);
  const r = clampNum(document.getElementById('fd_rate').value)/100;
  const years = clampNum(document.getElementById('fd_years').value);
  const n = Number(document.getElementById('fd_comp').value);
  const A = P * Math.pow(1 + r/n, n*years);
  const interest = A - P;
  document.getElementById('fd_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(P)}</span><span class="l">Principal</span></div>
      <div><span class="v">${fmtPct(r*100)}</span><span class="l">Annual Rate</span></div>
      <div><span class="v">${fmtMoney(A)}</span><span class="l">Maturity Amount</span></div>
      <div><span class="v">${fmtMoney(interest)}</span><span class="l">Total Interest</span></div>
    </div>
    <div class="payout">
      <div class="phead">Interest Payout Guide (simple payout, not compounded)</div>
      <div class="prow">
        <div><span class="l">Monthly</span><span class="v">${fmtMoney(P * r/12)}</span></div>
        <div><span class="l">Quarterly</span><span class="v">${fmtMoney(P * r/4)}</span></div>
        <div><span class="l">Half-yearly</span><span class="v">${fmtMoney(P * r/2)}</span></div>
        <div><span class="l">Yearly</span><span class="v">${fmtMoney(P * r)}</span></div>
      </div>
      <div class="pnote">These are approximate interest payouts if your bank pays out interest periodically instead of compounding it.</div>
    </div>`;
  const headers = ["Year","Start Balance","Interest","End Balance"];
  let rows = [], start=P;
  for(let y=1;y<=Math.round(years);y++){
    const end = start * Math.pow(1+r/n, n);
    rows.push([y, fmtMoney(start), fmtMoney(end-start), fmtMoney(end)]);
    start = end;
  }
  document.getElementById('fd_schedule').innerHTML = buildTable(headers, rows);
}

// ===== RD =====
function calcRD(){
  const R = clampNum(document.getElementById('rd_monthly').value);
  const r = clampNum(document.getElementById('rd_rate').value)/100;
  const months = Math.max(1, parseInt(document.getElementById('rd_months').value||"1",10));
  const im = Math.pow(1 + r/4, 1/3) - 1;
  let rows=[], bal=0;
  for(let k=1;k<=months;k++){
    bal = bal*(1+im) + R;
    const interest = (bal - R)/(1+im) * im;
    rows.push([k, fmtMoney(R), fmtMoney(interest), fmtMoney(bal)]);
  }
  const maturity = bal;
  const totalDeposit = R * months;
  const interest = maturity - totalDeposit;
  document.getElementById('rd_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(totalDeposit)}</span><span class="l">Total Deposited</span></div>
      <div><span class="v">${fmtPct(r*100)}</span><span class="l">Annual Rate (approx quarterly)</span></div>
      <div><span class="v">${fmtMoney(maturity)}</span><span class="l">Maturity Amount</span></div>
      <div><span class="v">${fmtMoney(interest)}</span><span class="l">Total Interest</span></div>
    </div>`;
  document.getElementById('rd_schedule').innerHTML = buildTable(["Month","Deposit","Interest","End Balance"], rows);
}

// ===== SIP =====
function calcSIP(){
  const P = clampNum(document.getElementById('sip_amount').value);
  const r = Math.pow(1 + clampNum(document.getElementById('sip_rate').value)/100, 1/12) - 1;
  const years = clampNum(document.getElementById('sip_years').value);
  const n = Math.round(years*12);
  const timingEl = document.getElementById('sip_timing');
  const timing = timingEl ? timingEl.value : 'end';
  let rows=[], bal=0;
  for(let m=1;m<=n;m++){
    if(timing==="start") bal += P;
    const before = bal;
    bal = bal * (1+r);
    const interest = bal - before;
    if(timing==="end") bal += P;
    rows.push([m, fmtMoney(P), fmtMoney(interest), fmtMoney(bal)]);
  }
  const fv = bal, invested = P*n, gains=fv-invested;
  document.getElementById('sip_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(invested)}</span><span class="l">Total Invested</span></div>
      <div><span class="v">${fmtMoney(fv)}</span><span class="l">Future Value</span></div>
      <div><span class="v">${fmtMoney(gains)}</span><span class="l">Estimated Gains</span></div>
    </div>`;
  document.getElementById('sip_schedule').innerHTML = buildTable(["Month","Contribution","Interest","End Balance"], rows);
}

// ===== Lumpsum =====
function calcLumpsum(){
  const P = clampNum(document.getElementById('ls_amount').value);
  const i = Math.pow(1 + clampNum(document.getElementById('ls_rate').value)/100, 1/12) - 1;
  const years = clampNum(document.getElementById('ls_years').value);
  const n = Math.round(years*12);
  const fv = P * Math.pow(1+i, n);
  document.getElementById('ls_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(P)}</span><span class="l">Principal</span></div>
      <div><span class="v">${fmtMoney(fv)}</span><span class="l">Future Value</span></div>
      <div><span class="v">${fmtMoney(fv-P)}</span><span class="l">Estimated Gains</span></div>
    </div>`;
  let bal=P, rows=[];
  for(let y=1;y<=Math.round(years);y++){
    const before=bal; bal = bal*Math.pow(1+i,12);
    rows.push([y, fmtMoney(bal-before), fmtMoney(bal)]);
  }
  document.getElementById('ls_schedule').innerHTML = buildTable(["Year","Interest","End Balance"], rows);
}

// ===== SWP =====
function calcSWP(){
  let corpus = clampNum(document.getElementById('swp_corpus').value);
  const w = clampNum(document.getElementById('swp_withdraw').value);
  const r = Math.pow(1 + clampNum(document.getElementById('swp_rate').value)/100, 1/12) - 1;
  const years = clampNum(document.getElementById('swp_years').value);
  const n = Math.round(years*12);
  let monthsSurvived = 0;
  let rows = [];
  let depletedEarly = false;
  for(let m=1;m<=n;m++){
    const start = corpus;
    const growth = corpus * r;
    corpus = corpus + growth;
    corpus -= w;
    monthsSurvived = m;
    rows.push([m, fmtMoney(start), fmtMoney(growth), fmtMoney(w), fmtMoney(Math.max(0, corpus))]);
    if(corpus <= 0){ corpus = 0; depletedEarly = true; break; }
  }
  const yearsSurvived = Math.round((monthsSurvived/12)*10)/10;
  document.getElementById('swp_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(w)}</span><span class="l">Monthly Withdrawal</span></div>
      <div><span class="v">${fmtMoney(w*n)}</span><span class="l">Total Withdrawals</span></div>
      <div><span class="v">${fmtMoney(corpus)}</span><span class="l">Final Value after ${monthsSurvived} months</span></div>
      <div><span class="v">${depletedEarly ? "Yes" : "No"}</span><span class="l">Depleted?</span></div>
      <div><span class="v">${yearsSurvived} yrs</span><span class="l">Sustainment (approx)</span></div>
    </div>`;
  if(depletedEarly){ showWarning("Corpus depleted before chosen tenure. Reduce withdrawal or tenure.", "swp_result"); }
  document.getElementById('swp_schedule').innerHTML = buildTable(["Month","Start","Growth","Withdrawal","End"], rows);
}

// ===== EMI =====
function calcEMI(){
  const P = clampNum(document.getElementById('emi_principal').value);
  const i = clampNum(document.getElementById('emi_rate').value)/100/12;
  const years = clampNum(document.getElementById('emi_years').value);
  const n = Math.round(years*12);

  let EMI;
  if(i===0){ EMI = P/n; } else {
    EMI = P * i * Math.pow(1+i,n) / (Math.pow(1+i,n) - 1);
  }
  let balance = P;
  let totalInterest = 0;
  let rows = [];
  for(let m=1;m<=n;m++){
    const interest = balance * i;
    const principal = Math.min(EMI - interest, balance);
    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    rows.push([m, fmtMoney(EMI), fmtMoney(principal), fmtMoney(interest), fmtMoney(balance)]);
    if(balance<=0) break;
  }

  document.getElementById('emi_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(EMI)}</span><span class="l">Monthly EMI</span></div>
      <div><span class="v">${fmtMoney(EMI*rows.length)}</span><span class="l">Total Payment</span></div>
      <div><span class="v">${fmtMoney(totalInterest)}</span><span class="l">Total Interest</span></div>
      <div><span class="v">${rows.length}</span><span class="l">Months</span></div>
    </div>`;

  const headers = ["Month","EMI","Principal","Interest","Balance"];
  document.getElementById('emi_schedule').innerHTML = buildTable(headers, rows);
}

// ===== NPS =====
function calcNPS(){
  let contrib = clampNum(document.getElementById('nps_contrib').value);
  const step = clampNum(document.getElementById('nps_stepup').value)/100;
  const r = clampNum(document.getElementById('nps_return').value)/100;
  const years = Math.max(1, parseInt(document.getElementById('nps_years').value||"1",10));
  const annPct = clampNum(document.getElementById('nps_annuity_pct').value)/100;
  const annRate = clampNum(document.getElementById('nps_annuity_rate').value)/100;

  let corpus = 0;
  let rows = [];
  for(let y=1;y<=years;y++){
    const before = corpus + contrib;
    const end = before * (1+r);
    const interest = end - before;
    corpus = end;
    rows.push([y, fmtMoney(contrib), fmtMoney(interest), fmtMoney(corpus)]);
    contrib *= (1+step);
  }
  const annuityPurchase = corpus * annPct;
  const lumpSum = corpus - annuityPurchase;
  const estMonthlyPension = annuityPurchase * (annRate/12);

  document.getElementById('nps_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(corpus)}</span><span class="l">Corpus at Retirement</span></div>
      <div><span class="v">${fmtMoney(lumpSum)}</span><span class="l">Lump Sum (post annuity)</span></div>
      <div><span class="v">${fmtMoney(annuityPurchase)}</span><span class="l">Annuity Purchase</span></div>
      <div><span class="v">${fmtMoney(estMonthlyPension)}</span><span class="l">Est. Monthly Pension</span></div>
    </div>`;
  document.getElementById('nps_schedule').innerHTML = buildTable(["Year","Contribution","Interest","End Balance"], rows);
}

// ===== PPF =====
function calcPPF(){
  const C = clampNum(document.getElementById('ppf_yearly').value);
  const r = clampNum(document.getElementById('ppf_rate').value)/100;
  const n = Math.max(1, parseInt(document.getElementById('ppf_years').value||"1",10));
  const timing = document.getElementById('ppf_timing').value;
  let fv = 0, rows=[], bal=0;
  for(let y=1;y<=n;y++){
    if(timing==="start"){ bal += C; }
    const before=bal;
    bal = bal*(1+r);
    const interest = bal - before;
    if(timing==="end"){ bal += C; }
    rows.push([y, fmtMoney(C), fmtMoney(interest), fmtMoney(bal)]);
  }
  fv = bal;
  const invested = C * n;
  const gains = fv - invested;
  document.getElementById('ppf_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(invested)}</span><span class="l">Total Deposited</span></div>
      <div><span class="v">${fmtMoney(fv)}</span><span class="l">Estimated Maturity</span></div>
      <div><span class="v">${fmtMoney(gains)}</span><span class="l">Estimated Interest</span></div>
    </div>`;
  document.getElementById('ppf_schedule').innerHTML = buildTable(["Year","Deposit","Interest","End Balance"], rows);
}

// ===== CAGR =====
function calcCAGR(){
  const S = clampNum(document.getElementById('cagr_start').value);
  const E = clampNum(document.getElementById('cagr_end').value);
  const n = clampNum(document.getElementById('cagr_years').value);
  if(S<=0 || n<=0){ document.getElementById('cagr_result').innerHTML = "<div class='kpi'><div>Enter valid values.</div></div>"; return; }
  const c = Math.pow(E/S, 1/n) - 1;
  document.getElementById('cagr_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtPct(c*100)}</span><span class="l">CAGR</span></div>
    </div>`;
  document.getElementById('cagr_schedule').innerHTML = buildTable(["Start","End","Years","CAGR"], [[fmtMoney(S), fmtMoney(E), n, fmtPct(c*100)]]);
}

// ===== Inflation =====
function calcInflation(){
  const nom = clampNum(document.getElementById('inf_nom').value)/100;
  const inf = clampNum(document.getElementById('inf_infl').value)/100;
  const fv = clampNum(document.getElementById('inf_fv').value);
  const real = (1+nom)/(1+inf) - 1;
  const pv_today = fv / (1+inf);
  document.getElementById('inflation_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtPct(real*100)}</span><span class="l">Real Return (approx)</span></div>
      <div><span class="v">${fmtMoney(pv_today)}</span><span class="l">Future Value in Today's Money (1 year)</span></div>
    </div>`;
  document.getElementById('inflation_schedule').innerHTML = buildTable(["Nominal %","Inflation %","Real %","FV in Today's ₹ (1y)"], [[fmtPct(nom*100), fmtPct(inf*100), fmtPct(real*100), fmtMoney(pv_today)]]);
}

// ===== Goal SIP =====


function calcGoal(){
  const target = clampNum(document.getElementById('goal_target').value);
  const annual = clampNum(document.getElementById('goal_rate').value)/100;
  const years = clampNum(document.getElementById('goal_years').value);
  const n = Math.round(years*12);

  // Indian convention: nominal monthly rate (annual ÷ 12), ordinary annuity (end of month)
  const r = annual/12;

  const factor = (Math.pow(1+r, n) - 1)/r; // ordinary (no extra (1+r))
  const sip = target / factor;             // monthly SIP
  const invested = sip * n;

  // KPI (Monthly SIP with 2 decimals; Total Investment in Lacs)
  const sipRounded = Math.round(sip);
  document.getElementById('goal_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(sipRounded)}</span><span class="l">Required Monthly SIP</span></div>
      <div><span class="v">${fmtLakh(invested)}</span><span class="l">Your Total Investment</span></div>
    </div>`;

  // Build monthly schedule for transparency
  let rows = [], bal = 0;
  for(let m=1;m<=n;m++){
    const before = bal;
    bal = bal * (1+r) + sipRounded; // pay at end of month
    const interest = before * r;
    rows.push([m, fmtMoney(sipRounded), fmtMoneyDec(interest,2), fmtMoneyDec(bal,2)]);
  }

  const summary = buildTable(
    ["Target","Monthly rate (per month)","Months","Timing","Method","Required SIP","Total Invested"],
    [[fmtMoney(target), fmtPct(r*100), n, "Ordinary (end of month)", "Nominal (p.a./12)", fmtMoney(sipRounded), fmtMoney(invested)]]
  );
  const schedule = buildTable(["Month","Contribution","Interest","End Balance"], rows);
  const sc = document.getElementById('goal_schedule'); if(sc) sc.innerHTML = summary + schedule;
}

function toggleTheme(){ const isLight=document.body.classList.toggle('light'); try{localStorage.setItem('theme', isLight?'light':'dark');}catch(e){} }

// APPLY_SAVED_THEME
window.addEventListener('DOMContentLoaded', () => {
  try{
    const saved = localStorage.getItem('theme');
    if(saved === 'light'){ document.body.classList.add('light'); }
    else { document.body.classList.remove('light'); }
  }catch(e){ /* ignore */ }
}, { once: true });
