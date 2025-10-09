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
  
  // Generate chart
  const chartContainer = document.getElementById('fd_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const balanceData = [];
  const interestData = [];
  
  let balance = P;
  chartLabels.push('Start');
  balanceData.push(P);
  interestData.push(0);
  
  for(let y = 1; y <= Math.round(years); y++){
    const newBalance = balance * Math.pow(1 + r/n, n);
    const yearInterest = newBalance - balance;
    
    chartLabels.push(`Year ${y}`);
    balanceData.push(newBalance);
    interestData.push(yearInterest);
    
    balance = newBalance;
  }
  
  createBarChart('fd_chart', chartLabels, [
    { label: 'Balance', data: balanceData },
    { label: 'Interest Earned', data: interestData }
  ], 'Fixed Deposit Growth Over Time');
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
  
  // Generate chart
  const chartContainer = document.getElementById('rd_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const balanceData = [];
  const depositData = [];
  
  let balance = 0;
  let totalDeposits = 0;
  
  // Show data every 6 months for better readability
  for(let m = 6; m <= months; m += 6){
    balance = 0;
    for(let k = 1; k <= m; k++){
      balance = balance * (1 + im) + R;
    }
    totalDeposits = R * m;
    
    chartLabels.push(`Month ${m}`);
    balanceData.push(balance);
    depositData.push(totalDeposits);
  }
  
  createLineChart('rd_chart', chartLabels, [
    { label: 'Maturity Value', data: balanceData },
    { label: 'Total Deposits', data: depositData }
  ], 'Recurring Deposit Growth Over Time');
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
  
  // Generate chart
  const chartContainer = document.getElementById('sip_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const balanceData = [];
  const investedData = [];
  
  let balance = 0;
  let totalInvested = 0;
  
  for(let y = 1; y <= Math.round(years); y++){
    const monthsInYear = Math.min(12, n - (y-1)*12);
    
    for(let m = 1; m <= monthsInYear; m++){
      if(timing==="start") balance += P;
      const before = balance;
      balance = balance * (1+r);
      if(timing==="end") balance += P;
      totalInvested += P;
    }
    
    chartLabels.push(`Year ${y}`);
    balanceData.push(balance);
    investedData.push(totalInvested);
  }
  
  createLineChart('sip_chart', chartLabels, [
    { label: 'Portfolio Value', data: balanceData },
    { label: 'Total Invested', data: investedData }
  ], 'SIP Growth Over Time');
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
  
  // Generate chart
  const chartContainer = document.getElementById('ls_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const balanceData = [];
  const principalData = [];
  
  let balance = P;
  chartLabels.push('Start');
  balanceData.push(P);
  principalData.push(P);
  
  for(let y = 1; y <= Math.round(years); y++){
    const newBalance = balance * Math.pow(1 + i, 12);
    
    chartLabels.push(`Year ${y}`);
    balanceData.push(newBalance);
    principalData.push(P);
    
    balance = newBalance;
  }
  
  createLineChart('ls_chart', chartLabels, [
    { label: 'Investment Value', data: balanceData },
    { label: 'Principal', data: principalData }
  ], 'Lumpsum Investment Growth Over Time');
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
  
  // Generate chart
  const chartContainer = document.getElementById('swp_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const balanceData = [];
  const withdrawalData = [];
  
  let currentCorpus = clampNum(document.getElementById('swp_corpus').value);
  let totalWithdrawn = 0;
  
  // Show data every 12 months for better readability
  for(let y = 1; y <= Math.min(years, 20); y++){
    for(let m = 1; m <= 12; m++){
      const growth = currentCorpus * r;
      currentCorpus = currentCorpus + growth - w;
      totalWithdrawn += w;
      if(currentCorpus <= 0) {
        currentCorpus = 0;
        break;
      }
    }
    
    chartLabels.push(`Year ${y}`);
    balanceData.push(Math.max(0, currentCorpus));
    withdrawalData.push(totalWithdrawn);
    
    if(currentCorpus <= 0) break;
  }
  
  createLineChart('swp_chart', chartLabels, [
    { label: 'Remaining Corpus', data: balanceData },
    { label: 'Total Withdrawn', data: withdrawalData }
  ], 'SWP Corpus Depletion Over Time');
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
  
  // Generate chart
  const chartContainer = document.getElementById('emi_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const balanceData = [];
  const principalData = [];
  const interestData = [];
  
  let currentBalance = P;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  
  // Show data every 12 months for better readability
  for(let y = 1; y <= Math.round(years); y++){
    let yearPrincipal = 0;
    let yearInterest = 0;
    
    for(let m = 1; m <= 12 && currentBalance > 0; m++){
      const interest = currentBalance * i;
      const principal = Math.min(EMI - interest, currentBalance);
      currentBalance = Math.max(0, currentBalance - principal);
      
      yearPrincipal += principal;
      yearInterest += interest;
    }
    
    cumulativePrincipal += yearPrincipal;
    cumulativeInterest += yearInterest;
    
    chartLabels.push(`Year ${y}`);
    balanceData.push(currentBalance);
    principalData.push(cumulativePrincipal);
    interestData.push(cumulativeInterest);
    
    if(currentBalance <= 0) break;
  }
  
  createLineChart('emi_chart', chartLabels, [
    { label: 'Outstanding Balance', data: balanceData },
    { label: 'Principal Paid', data: principalData }
  ], 'EMI Loan Repayment Progress');
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
  
  // Generate chart
  const chartContainer = document.getElementById('nps_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const corpusData = [];
  const contributionData = [];
  
  let currentCorpus = 0;
  let currentContrib = clampNum(document.getElementById('nps_contrib').value);
  let totalContributions = 0;
  
  for(let y = 1; y <= years; y++){
    const before = currentCorpus + currentContrib;
    const end = before * (1 + r);
    currentCorpus = end;
    totalContributions += currentContrib;
    
    chartLabels.push(`Year ${y}`);
    corpusData.push(currentCorpus);
    contributionData.push(totalContributions);
    
    currentContrib *= (1 + step);
  }
  
  createLineChart('nps_chart', chartLabels, [
    { label: 'NPS Corpus', data: corpusData },
    { label: 'Total Contributions', data: contributionData }
  ], 'NPS Corpus Growth Over Time');
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
  
  // Generate chart
  const chartContainer = document.getElementById('ppf_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const balanceData = [];
  const depositData = [];
  
  let balance = 0;
  let totalDeposits = 0;
  
  for(let y = 1; y <= n; y++){
    if(timing==="start"){ balance += C; }
    const before = balance;
    balance = balance * (1 + r);
    if(timing==="end"){ balance += C; }
    totalDeposits += C;
    
    chartLabels.push(`Year ${y}`);
    balanceData.push(balance);
    depositData.push(totalDeposits);
  }
  
  createLineChart('ppf_chart', chartLabels, [
    { label: 'PPF Balance', data: balanceData },
    { label: 'Total Deposits', data: depositData }
  ], 'PPF Growth Over Time');
}

// ===== EPF Toggle Function =====
function toggleEPFContributionType(){
  const contributionType = document.getElementById('epf_contribution_type').value;
  const percentageFields = document.getElementById('epf_percentage_fields');
  const fixedFields = document.getElementById('epf_fixed_fields');
  
  if(contributionType === 'percentage'){
    percentageFields.style.display = 'contents';
    fixedFields.style.display = 'none';
  } else {
    percentageFields.style.display = 'none';
    fixedFields.style.display = 'contents';
  }
}

// ===== EPF =====
function calcEPF(){
  const monthlySalary = clampNum(document.getElementById('epf_salary').value);
  const contributionType = document.getElementById('epf_contribution_type').value;
  const currentBalance = clampNum(document.getElementById('epf_current_balance').value);
  const epfRate = clampNum(document.getElementById('epf_rate').value)/100;
  const years = Math.max(1, parseInt(document.getElementById('epf_years').value||"1",10));
  const salaryIncrease = clampNum(document.getElementById('epf_salary_increase').value)/100;
  
  let balance = currentBalance;
  let currentSalary = monthlySalary;
  let totalEmployeeContrib = 0;
  let totalEmployerContrib = 0;
  let rows = [];
  
  // Get fixed contribution amounts once (if applicable)
  let fixedEmployeeContrib = 0;
  let fixedEmployerContrib = 0;
  if(contributionType === 'fixed'){
    fixedEmployeeContrib = clampNum(document.getElementById('epf_employee_fixed').value);
    fixedEmployerContrib = clampNum(document.getElementById('epf_employer_fixed').value);
  }
  
  for(let y = 1; y <= years; y++){
    const yearStartBalance = balance;
    const yearStartSalary = currentSalary;
    
    let yearEmployeeContrib = 0;
    let yearEmployerContrib = 0;
    let yearInterest = 0;
    
    // For EPF, interest is calculated on March 31st balance, so we add all contributions first
    // then calculate interest once at year end (simplified approach)
    for(let m = 1; m <= 12; m++){
      let monthlyEmployeeContrib, monthlyEmployerContrib;
      
      if(contributionType === 'percentage'){
        const employeePct = clampNum(document.getElementById('epf_employee_pct').value)/100;
        const employerPct = clampNum(document.getElementById('epf_employer_pct').value)/100;
        monthlyEmployeeContrib = currentSalary * employeePct;
        monthlyEmployerContrib = currentSalary * employerPct;
      } else {
        // Use fixed amounts - no salary dependency
        monthlyEmployeeContrib = fixedEmployeeContrib;
        monthlyEmployerContrib = fixedEmployerContrib;
      }
      
      const monthlyTotalContrib = monthlyEmployeeContrib + monthlyEmployerContrib;
      
      yearEmployeeContrib += monthlyEmployeeContrib;
      yearEmployerContrib += monthlyEmployerContrib;
      
      // Add contributions to balance
      balance += monthlyTotalContrib;
    }
    
    // Calculate annual interest on the year-end balance (after all contributions)
    yearInterest = balance * epfRate;
    balance += yearInterest;
    
    totalEmployeeContrib += yearEmployeeContrib;
    totalEmployerContrib += yearEmployerContrib;
    
    // For display purposes: show current salary (which increases each year regardless of contribution type)
    const displaySalary = yearStartSalary;
    
    // Calculate contribution amounts for display (yearly amounts for both types)
    let displayEmployeeContrib, displayEmployerContrib;
    if(contributionType === 'percentage'){
      // Show yearly amounts for percentage-based contributions
      displayEmployeeContrib = yearEmployeeContrib;
      displayEmployerContrib = yearEmployerContrib;
    } else {
      // Show yearly amounts for fixed contributions (monthly × 12)
      displayEmployeeContrib = fixedEmployeeContrib * 12;
      displayEmployerContrib = fixedEmployerContrib * 12;
    }
    
    rows.push([
      y,
      fmtMoney(displaySalary),
      fmtMoney(displayEmployeeContrib),
      fmtMoney(displayEmployerContrib),
      fmtMoney(yearInterest),
      fmtMoney(balance)
    ]);
    
    // Increase salary for next year (affects display and percentage calculations)
    currentSalary *= (1 + salaryIncrease);
  }
  
  const totalContributions = totalEmployeeContrib + totalEmployerContrib;
  const totalInterest = balance - currentBalance - totalContributions;
  const finalSalary = monthlySalary * Math.pow(1 + salaryIncrease, years);
  
  // Get contribution details for display
  let contributionDetails = '';
  if(contributionType === 'percentage'){
    const employeePct = clampNum(document.getElementById('epf_employee_pct').value);
    const employerPct = clampNum(document.getElementById('epf_employer_pct').value);
    contributionDetails = `Employee: ${employeePct}% + Employer: ${employerPct}% of Basic Salary`;
  } else {
    contributionDetails = `Employee: ${fmtMoney(fixedEmployeeContrib)} + Employer: ${fmtMoney(fixedEmployerContrib)} per month`;
  }
  
  document.getElementById('epf_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(balance)}</span><span class="l">EPF Maturity Amount</span></div>
      <div><span class="v">${fmtMoney(totalEmployeeContrib)}</span><span class="l">Your Total Contribution</span></div>
      <div><span class="v">${fmtMoney(totalEmployerContrib)}</span><span class="l">Employer Total Contribution</span></div>
      <div><span class="v">${fmtMoney(totalInterest)}</span><span class="l">Total Interest Earned</span></div>
      <div><span class="v">${fmtMoney(finalSalary)}</span><span class="l">Final Monthly Salary</span></div>
      <div><span class="v">${fmtPct(epfRate*100)}</span><span class="l">EPF Interest Rate</span></div>
    </div>
    
    <div class="epf-breakdown" style="margin-top: 16px; padding: 12px; background: var(--input-bg); border-radius: 12px;">
      <h4 style="margin: 0 0 8px; color: var(--primary);">💡 EPF Breakdown</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 14px;">
        <div><span style="color: var(--text-secondary);">Starting Balance:</span> <strong>${fmtMoney(currentBalance)}</strong></div>
        <div><span style="color: var(--text-secondary);">Total Contributions:</span> <strong>${fmtMoney(totalContributions)}</strong></div>
        <div><span style="color: var(--text-secondary);">Interest Component:</span> <strong>${fmtMoney(totalInterest)}</strong></div>
        <div><span style="color: var(--text-secondary);">Contribution Type:</span> <strong>${contributionType === 'percentage' ? 'Percentage-based' : 'Fixed Amount'}</strong></div>
        <div style="grid-column: 1 / -1;"><span style="color: var(--text-secondary);">Contribution Details:</span> <strong>${contributionDetails}</strong></div>
        <div><span style="color: var(--text-secondary);">Tax-free Withdrawal:</span> <strong>Yes (after 5 years)</strong></div>
      </div>
    </div>`;
  
  document.getElementById('epf_schedule').innerHTML = buildTable(
    ["Year", "Monthly Salary", "Employee Contribution", "Employer Contribution", "Interest Earned", "EPF Balance"], 
    rows
  );
  
  // Generate chart
  const chartContainer = document.getElementById('epf_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const balanceData = [];
  const contributionData = [];
  
  let chartBalance = currentBalance;
  let chartTotalContrib = 0;
  let chartSalary = monthlySalary;
  
  for(let y = 1; y <= years; y++){
    let yearContrib = 0;
    
    for(let m = 1; m <= 12; m++){
      let monthlyContrib;
      
      if(contributionType === 'percentage'){
        const employeePct = clampNum(document.getElementById('epf_employee_pct').value)/100;
        const employerPct = clampNum(document.getElementById('epf_employer_pct').value)/100;
        monthlyContrib = chartSalary * (employeePct + employerPct);
      } else {
        // Use fixed amounts
        monthlyContrib = fixedEmployeeContrib + fixedEmployerContrib;
      }
      
      chartBalance += monthlyContrib;
      yearContrib += monthlyContrib;
      
      const monthlyInterest = chartBalance * (epfRate / 12);
      chartBalance += monthlyInterest;
    }
    
    chartTotalContrib += yearContrib;
    
    chartLabels.push(`Year ${y}`);
    balanceData.push(chartBalance);
    contributionData.push(chartTotalContrib + currentBalance);
    
    // Only increase salary for percentage-based contributions
    if(contributionType === 'percentage'){
      chartSalary *= (1 + salaryIncrease);
    }
  }
  
  createLineChart('epf_chart', chartLabels, [
    { label: 'EPF Balance', data: balanceData },
    { label: 'Total Contributions', data: contributionData }
  ], 'EPF Growth Over Time');
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
  
  // Get historical inflation data
  const currentYear = new Date().getFullYear();
  const recentInflation = getRecentTrends(10);
  const avgInflation10yr = inflationPeriods["Last 10 years"];
  const avgInflation20yr = inflationPeriods["Last 20 years"];
  
  document.getElementById('inflation_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtPct(real*100)}</span><span class="l">Real Return (approx)</span></div>
      <div><span class="v">${fmtMoney(pv_today)}</span><span class="l">Future Value in Today's Money (1 year)</span></div>
      <div><span class="v">${fmtPct(avgInflation10yr)}</span><span class="l">Avg India Inflation (Last 10 years)</span></div>
      <div><span class="v">${fmtPct(avgInflation20yr)}</span><span class="l">Avg India Inflation (Last 20 years)</span></div>
    </div>
    
    <div class="inflation-periods" style="margin-top: 16px; padding: 12px; background: #0e1628; border: 1px solid #243454; border-radius: 12px;">
      <h4 style="margin: 0 0 8px; color: #e8f0ff;">Historical India Inflation Averages</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; font-size: 12px;">
        <div><span style="color: #a8b6d8;">1960-1970:</span> <strong>${fmtPct(inflationPeriods["1960-1970"])}</strong></div>
        <div><span style="color: #a8b6d8;">1970-1980:</span> <strong>${fmtPct(inflationPeriods["1970-1980"])}</strong></div>
        <div><span style="color: #a8b6d8;">1980-1990:</span> <strong>${fmtPct(inflationPeriods["1980-1990"])}</strong></div>
        <div><span style="color: #a8b6d8;">1990-2000:</span> <strong>${fmtPct(inflationPeriods["1990-2000"])}</strong></div>
        <div><span style="color: #a8b6d8;">2000-2010:</span> <strong>${fmtPct(inflationPeriods["2000-2010"])}</strong></div>
        <div><span style="color: #a8b6d8;">2010-2020:</span> <strong>${fmtPct(inflationPeriods["2010-2020"])}</strong></div>
        <div><span style="color: #a8b6d8;">2020-2024:</span> <strong>${fmtPct(inflationPeriods["2020-2024"])}</strong></div>
        <div><span style="color: #a8b6d8;">Overall:</span> <strong>${fmtPct(inflationPeriods["Overall (1960-2024)"])}</strong></div>
      </div>
    </div>`;
  
  // Build recent inflation table
  const recentRows = [];
  for (const [year, rate] of Object.entries(recentInflation)) {
    recentRows.push([year, fmtPct(rate), fmtMoney(100000 / Math.pow(1 + rate/100, currentYear - parseInt(year)))]);
  }
  
  const mainTable = buildTable(["Nominal %","Inflation %","Real %","FV in Today's ₹ (1y)"], 
    [[fmtPct(nom*100), fmtPct(inf*100), fmtPct(real*100), fmtMoney(pv_today)]]);
  
  const historicalTable = buildTable(["Year","Inflation Rate","₹1 Lakh Today's Value"], recentRows.reverse());
  
  document.getElementById('inflation_schedule').innerHTML = `
    <div style="margin-bottom: 16px;">
      <h4 style="margin: 0 0 8px; color: #e8f0ff;">Current Calculation</h4>
      ${mainTable}
    </div>
    <div>
      <h4 style="margin: 0 0 8px; color: #e8f0ff;">Recent India Inflation History (Last 10 Years)</h4>
      ${historicalTable}
    </div>`;
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
  
  // Generate chart
  const chartContainer = document.getElementById('goal_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const balanceData = [];
  const investedData = [];
  
  let balance = 0;
  let totalInvested = 0;
  
  for(let y = 1; y <= Math.round(years); y++){
    const monthsInYear = Math.min(12, n - (y-1)*12);
    
    for(let m = 1; m <= monthsInYear; m++){
      const before = balance;
      balance = balance * (1 + r) + sipRounded;
      totalInvested += sipRounded;
    }
    
    chartLabels.push(`Year ${y}`);
    balanceData.push(balance);
    investedData.push(totalInvested);
  }
  
  createLineChart('goal_chart', chartLabels, [
    { label: 'Goal Progress', data: balanceData },
    { label: 'Total Invested', data: investedData }
  ], 'Goal SIP Progress Over Time');
}

function toggleTheme(){ 
  const isLight=document.body.classList.toggle('light'); 
  try{localStorage.setItem('theme', isLight?'light':'dark');}catch(e){} 
  
  // Update all existing charts with new theme colors
  updateChartsForTheme();
}

function updateChartsForTheme() {
  const colors = getThemeColors();
  
  // Update all existing chart instances
  Object.keys(chartInstances).forEach(chartId => {
    const chart = chartInstances[chartId];
    if (chart) {
      // Update chart colors
      chart.options.plugins.title.color = colors.text;
      chart.options.plugins.legend.labels.color = colors.text;
      chart.options.scales.x.ticks.color = colors.text;
      chart.options.scales.x.grid.color = colors.grid;
      chart.options.scales.y.ticks.color = colors.text;
      chart.options.scales.y.grid.color = colors.grid;
      
      // Update dataset colors
      chart.data.datasets.forEach((dataset, index) => {
        if (chart.config.type === 'bar') {
          dataset.backgroundColor = index === 0 ? colors.primary + '80' : colors.secondary + '80';
          dataset.borderColor = index === 0 ? colors.primary : colors.secondary;
        } else {
          dataset.borderColor = index === 0 ? colors.primary : colors.secondary;
          dataset.backgroundColor = index === 0 ? colors.primary + '20' : colors.secondary + '20';
        }
      });
      
      // Update the chart
      chart.update();
    }
  });
}

// ===== Super SIP =====
function calcSuperSIP(){
  const startingSIP = clampNum(document.getElementById('supersip_amount').value);
  const stepup = clampNum(document.getElementById('supersip_stepup').value)/100;
  const annual = clampNum(document.getElementById('supersip_rate').value)/100;
  const years = Math.max(1, parseInt(document.getElementById('supersip_years').value||"1",10));
  
  const r = Math.pow(1 + annual, 1/12) - 1; // monthly rate
  const n = years * 12; // total months
  
  // Step-up SIP calculation
  let stepupBalance = 0;
  let stepupInvested = 0;
  let currentSIP = startingSIP;
  let stepupRows = [];
  
  for(let y = 1; y <= years; y++){
    let yearStartBalance = stepupBalance;
    let yearInvestment = 0;
    
    // Calculate monthly for this year
    for(let m = 1; m <= 12; m++){
      const before = stepupBalance;
      stepupBalance = stepupBalance * (1 + r) + currentSIP;
      const interest = before * r;
      yearInvestment += currentSIP;
      stepupInvested += currentSIP;
    }
    
    stepupRows.push([
      y, 
      fmtMoney(currentSIP), 
      fmtMoney(yearInvestment), 
      fmtMoney(stepupBalance - yearStartBalance - yearInvestment), 
      fmtMoney(stepupBalance)
    ]);
    
    // Increase SIP for next year
    currentSIP = currentSIP * (1 + stepup);
  }
  
  // Fixed SIP calculation (using starting amount for entire period)
  let fixedBalance = 0;
  let fixedInvested = startingSIP * n;
  let fixedRows = [];
  
  for(let y = 1; y <= years; y++){
    let yearStartBalance = fixedBalance;
    let yearInvestment = startingSIP * 12;
    
    // Calculate monthly for this year
    for(let m = 1; m <= 12; m++){
      const before = fixedBalance;
      fixedBalance = fixedBalance * (1 + r) + startingSIP;
      const interest = before * r;
    }
    
    fixedRows.push([
      y, 
      fmtMoney(startingSIP), 
      fmtMoney(yearInvestment), 
      fmtMoney(fixedBalance - yearStartBalance - yearInvestment), 
      fmtMoney(fixedBalance)
    ]);
  }
  
  const stepupGains = stepupBalance - stepupInvested;
  const fixedGains = fixedBalance - fixedInvested;
  const advantage = stepupBalance - fixedBalance;
  const advantagePct = ((stepupBalance / fixedBalance) - 1) * 100;
  
  document.getElementById('supersip_result').innerHTML = `
    <div class="comparison-grid">
      <div class="comparison-section">
        <h3>📈 Step-up SIP (${fmtPct(stepup*100)} yearly increase)</h3>
        <div class="kpi">
          <div><span class="v">${fmtMoney(stepupInvested)}</span><span class="l">Total Invested</span></div>
          <div><span class="v">${fmtMoney(stepupBalance)}</span><span class="l">Final Value</span></div>
          <div><span class="v">${fmtMoney(stepupGains)}</span><span class="l">Total Gains</span></div>
        </div>
      </div>
      
      <div class="comparison-section">
        <h3>📊 Fixed SIP (₹${fmtMoney(startingSIP).replace('₹ ', '')} throughout)</h3>
        <div class="kpi">
          <div><span class="v">${fmtMoney(fixedInvested)}</span><span class="l">Total Invested</span></div>
          <div><span class="v">${fmtMoney(fixedBalance)}</span><span class="l">Final Value</span></div>
          <div><span class="v">${fmtMoney(fixedGains)}</span><span class="l">Total Gains</span></div>
        </div>
      </div>
      
      <div class="comparison-advantage">
        <h3>🚀 Step-up Advantage</h3>
        <div class="kpi">
          <div><span class="v">${fmtMoney(advantage)}</span><span class="l">Extra Corpus</span></div>
          <div><span class="v">${fmtPct(advantagePct)}</span><span class="l">% Better</span></div>
          <div><span class="v">${fmtMoney(stepupInvested - fixedInvested)}</span><span class="l">Extra Investment</span></div>
        </div>
      </div>
    </div>`;
  
  // Combined schedule showing both approaches
  const headers = ["Year", "Step-up SIP", "Step-up Investment", "Step-up Interest", "Step-up Balance", "Fixed SIP", "Fixed Investment", "Fixed Interest", "Fixed Balance"];
  let combinedRows = [];
  
  for(let i = 0; i < years; i++){
    combinedRows.push([
      stepupRows[i][0], // Year
      stepupRows[i][1], // Step-up SIP
      stepupRows[i][2], // Step-up Investment
      stepupRows[i][3], // Step-up Interest
      stepupRows[i][4], // Step-up Balance
      fixedRows[i][1], // Fixed SIP
      fixedRows[i][2], // Fixed Investment
      fixedRows[i][3], // Fixed Interest
      fixedRows[i][4]  // Fixed Balance
    ]);
  }
  
  document.getElementById('supersip_schedule').innerHTML = buildTable(headers, combinedRows);
  
  // Generate chart
  const chartContainer = document.getElementById('supersip_chart_container');
  chartContainer.style.display = 'block';
  
  const chartLabels = [];
  const stepupData = [];
  const fixedData = [];
  
  for(let i = 0; i < years; i++){
    chartLabels.push(`Year ${i + 1}`);
    // Extract numeric values from formatted strings
    const stepupBalance = parseFloat(stepupRows[i][4].replace(/[₹,\s]/g, ''));
    const fixedBalance = parseFloat(fixedRows[i][4].replace(/[₹,\s]/g, ''));
    stepupData.push(stepupBalance);
    fixedData.push(fixedBalance);
  }
  
  createLineChart('supersip_chart', chartLabels, [
    { label: 'Step-up SIP Value', data: stepupData },
    { label: 'Fixed SIP Value', data: fixedData }
  ], 'Step-up SIP vs Fixed SIP Comparison');
}

// ===== Chart Functions =====
let chartInstances = {};

function destroyChart(chartId) {
  if (chartInstances[chartId]) {
    chartInstances[chartId].destroy();
    delete chartInstances[chartId];
  }
}

function getThemeColors() {
  const isLight = document.body.classList.contains('light');
  return {
    primary: isLight ? '#0d6efd' : '#5b9df9',
    secondary: isLight ? '#dc3545' : '#ff6b6b',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    background: isLight ? '#ffffff' : '#121a2b',
    text: isLight ? '#0d1b2a' : '#e8f0ff',
    grid: isLight ? '#ced4da' : '#22304d'
  };
}

function createBarChart(canvasId, labels, datasets, title) {
  const colors = getThemeColors();
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  destroyChart(canvasId);
  
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: index === 0 ? colors.primary + '80' : colors.secondary + '80',
        borderColor: index === 0 ? colors.primary : colors.secondary,
        borderWidth: 2,
        borderRadius: 4
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          color: colors.text,
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          labels: { color: colors.text }
        }
      },
      scales: {
        x: {
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        },
        y: {
          ticks: { 
            color: colors.text,
            callback: function(value) {
              return '₹' + (value / 100000).toFixed(1) + 'L';
            }
          },
          grid: { color: colors.grid }
        }
      }
    }
  });
}

function createLineChart(canvasId, labels, datasets, title) {
  const colors = getThemeColors();
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  destroyChart(canvasId);
  
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: index === 0 ? colors.primary : colors.secondary,
        backgroundColor: index === 0 ? colors.primary + '20' : colors.secondary + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          color: colors.text,
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          labels: { color: colors.text }
        }
      },
      scales: {
        x: {
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        },
        y: {
          ticks: { 
            color: colors.text,
            callback: function(value) {
              return '₹' + (value / 100000).toFixed(1) + 'L';
            }
          },
          grid: { color: colors.grid }
        }
      }
    }
  });
}

// ===== Loan Prepayment =====
function calcPrepayment(){
  const P = clampNum(document.getElementById('prepay_principal').value);
  const r = clampNum(document.getElementById('prepay_rate').value)/100/12;
  const years = clampNum(document.getElementById('prepay_tenure').value);
  const prepayAmount = clampNum(document.getElementById('prepay_amount').value);
  const prepayAfter = Math.max(1, parseInt(document.getElementById('prepay_after').value||"1",10));
  const prepayFrequency = document.getElementById('prepay_frequency').value;
  const prepayType = document.getElementById('prepay_type').value;
  
  const n = Math.round(years*12);
  let EMI;
  if(r===0){ EMI = P/n; } else {
    EMI = P * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
  }
  
  // Calculate without prepayment
  let totalInterestNormal = EMI * n - P;
  
  // Calculate with prepayment
  let balance = P;
  let totalInterestWithPrepay = 0;
  let totalPrepaymentsMade = 0;
  let newEMI = EMI;
  let rows = [];
  
  for(let m = 1; m <= n; m++){
    const interest = balance * r;
    let principal = Math.min(newEMI - interest, balance);
    let currentPrepayment = 0;
    
    // Apply prepayment logic
    let shouldPrepay = false;
    if(prepayFrequency === 'one_time' && m === prepayAfter){
      shouldPrepay = true;
    } else if(prepayFrequency === 'annual' && m >= prepayAfter && (m - prepayAfter) % 12 === 0){
      shouldPrepay = true;
    }
    
    if(shouldPrepay && prepayAmount > 0 && balance > 0){
      currentPrepayment = Math.min(prepayAmount, balance);
      balance = Math.max(0, balance - currentPrepayment);
      totalPrepaymentsMade += currentPrepayment;
      
      if(prepayType === 'reduce_emi' && balance > 0){
        // Recalculate EMI for remaining months
        const remainingMonthsLeft = n - m;
        if(remainingMonthsLeft > 0){
          newEMI = balance * r * Math.pow(1+r, remainingMonthsLeft) / (Math.pow(1+r, remainingMonthsLeft) - 1);
        }
      }
    } else {
      balance = Math.max(0, balance - principal);
    }
    
    totalInterestWithPrepay += interest;
    
    rows.push([
      m, 
      fmtMoney(newEMI), 
      fmtMoney(principal), 
      fmtMoney(interest), 
      currentPrepayment > 0 ? fmtMoney(currentPrepayment) : "₹ 0", 
      fmtMoney(balance)
    ]);
    
    if(balance <= 0) break;
  }
  
  const interestSaved = totalInterestNormal - totalInterestWithPrepay;
  const timeSaved = n - rows.length;
  const totalSavings = interestSaved - totalPrepaymentsMade;
  
  document.getElementById('prepay_result').innerHTML = `
    <div class="kpi">
      <div><span class="v">${fmtMoney(EMI)}</span><span class="l">Original Monthly EMI</span></div>
      <div><span class="v">${fmtMoney(interestSaved)}</span><span class="l">Interest Saved</span></div>
      <div><span class="v">${timeSaved} months</span><span class="l">Time Saved</span></div>
      <div><span class="v">${fmtMoney(totalPrepaymentsMade)}</span><span class="l">Total Prepayments Made</span></div>
      <div><span class="v">${fmtMoney(totalInterestWithPrepay)}</span><span class="l">Interest With Prepayment</span></div>
      <div><span class="v">${prepayFrequency === 'annual' ? 'Annual' : 'One-time'}</span><span class="l">Prepayment Type</span></div>
    </div>`;
  
  document.getElementById('prepay_schedule').innerHTML = buildTable(
    ["Month","EMI","Principal","Interest","Prepayment","Balance"], 
    rows // Show all months
  );
  
  // Generate chart
  const chartContainer = document.getElementById('prepay_chart_container');
  chartContainer.style.display = 'block';
  
  createBarChart('prepay_chart', 
    ['Without Prepayment', 'With Prepayment'], 
    [{ label: 'Total Interest', data: [totalInterestNormal, totalInterestWithPrepay] }], 
    'Loan Prepayment Impact'
  );
}

// ===== Credit Card EMI =====
function calcCreditCard(){
  const amount = clampNum(document.getElementById('cc_amount').value);
  const ccRate = clampNum(document.getElementById('cc_rate').value)/100/12;
  const tenure = Math.max(1, parseInt(document.getElementById('cc_tenure').value||"1",10));
  const altReturn = clampNum(document.getElementById('cc_alt_return').value)/100/12;
  const processingFee = clampNum(document.getElementById('cc_processing_fee').value);
  
  // EMI Option
  let emi;
  if(ccRate === 0){ emi = amount/tenure; } else {
    emi = amount * ccRate * Math.pow(1+ccRate, tenure) / (Math.pow(1+ccRate, tenure) - 1);
  }
  
  const totalEMIPayment = emi * tenure + processingFee;
  const totalInterest = totalEMIPayment - amount - processingFee;
  
  // Full Payment Option with Opportunity Cost
  const opportunityCost = amount * Math.pow(1 + altReturn, tenure) - amount;
  const totalFullPaymentCost = amount + opportunityCost;
  
  // Comparison
  const savings = totalEMIPayment - totalFullPaymentCost;
  const betterOption = savings > 0 ? "Full Payment" : "EMI";
  
  document.getElementById('cc_result').innerHTML = `
    <div class="comparison-grid">
      <div class="comparison-section">
        <h3>💳 EMI Option</h3>
        <div class="kpi">
          <div><span class="v">${fmtMoney(emi)}</span><span class="l">Monthly EMI</span></div>
          <div><span class="v">${fmtMoney(totalEMIPayment)}</span><span class="l">Total Cost</span></div>
          <div><span class="v">${fmtMoney(totalInterest)}</span><span class="l">Interest Cost</span></div>
          <div><span class="v">${fmtMoney(processingFee)}</span><span class="l">Processing Fee</span></div>
        </div>
      </div>
      
      <div class="comparison-section">
        <h3>💰 Full Payment Option</h3>
        <div class="kpi">
          <div><span class="v">${fmtMoney(amount)}</span><span class="l">Immediate Payment</span></div>
          <div><span class="v">${fmtMoney(totalFullPaymentCost)}</span><span class="l">Total Cost (with opportunity)</span></div>
          <div><span class="v">${fmtMoney(opportunityCost)}</span><span class="l">Opportunity Cost</span></div>
          <div><span class="v">₹ 0</span><span class="l">Processing Fee</span></div>
        </div>
      </div>
      
      <div class="comparison-advantage">
        <h3>🎯 Recommendation: ${betterOption}</h3>
        <div class="kpi">
          <div><span class="v">${fmtMoney(Math.abs(savings))}</span><span class="l">${savings > 0 ? 'Savings with Full Payment' : 'Extra Cost of Full Payment'}</span></div>
          <div><span class="v">${fmtPct(ccRate*12*100)}</span><span class="l">Credit Card Rate (p.a.)</span></div>
          <div><span class="v">${fmtPct(altReturn*12*100)}</span><span class="l">Alternative Investment Rate (p.a.)</span></div>
        </div>
      </div>
    </div>`;
  
  // Build schedule for EMI option
  let balance = amount;
  let rows = [];
  for(let m = 1; m <= tenure; m++){
    const interest = balance * ccRate;
    const principal = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - principal);
    rows.push([m, fmtMoney(emi), fmtMoney(principal), fmtMoney(interest), fmtMoney(balance)]);
    if(balance <= 0) break;
  }
  
  document.getElementById('cc_schedule').innerHTML = buildTable(
    ["Month","EMI","Principal","Interest","Balance"], 
    rows
  );
  
  // Generate chart
  const chartContainer = document.getElementById('cc_chart_container');
  chartContainer.style.display = 'block';
  
  createBarChart('cc_chart', 
    ['EMI Option', 'Full Payment Option'], 
    [{ label: 'Total Cost', data: [totalEMIPayment, totalFullPaymentCost] }], 
    'Credit Card Payment Options Comparison'
  );
}

// ===== Clear Functions =====
function clearFD(){
  // Reset to default values instead of clearing
  document.getElementById('fd_principal').value = '100000';
  document.getElementById('fd_rate').value = '7';
  document.getElementById('fd_years').value = '3';
  document.getElementById('fd_comp').value = '4';
  // Clear results, charts, and schedules
  document.getElementById('fd_result').innerHTML = '';
  document.getElementById('fd_schedule').innerHTML = '';
  const chartContainer = document.getElementById('fd_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('fd_chart');
}

function clearRD(){
  // Reset to default values instead of clearing
  document.getElementById('rd_monthly').value = '5000';
  document.getElementById('rd_rate').value = '7';
  document.getElementById('rd_months').value = '36';
  // Clear results, charts, and schedules
  document.getElementById('rd_result').innerHTML = '';
  document.getElementById('rd_schedule').innerHTML = '';
  const chartContainer = document.getElementById('rd_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('rd_chart');
}

function clearPPF(){
  // Reset to default values instead of clearing
  document.getElementById('ppf_yearly').value = '150000';
  document.getElementById('ppf_rate').value = '7.1';
  document.getElementById('ppf_years').value = '15';
  document.getElementById('ppf_timing').value = 'end';
  // Clear results, charts, and schedules
  document.getElementById('ppf_result').innerHTML = '';
  document.getElementById('ppf_schedule').innerHTML = '';
  const chartContainer = document.getElementById('ppf_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('ppf_chart');
}

function clearSIP(){
  // Reset to default values instead of clearing
  document.getElementById('sip_amount').value = '10000';
  document.getElementById('sip_rate').value = '12';
  document.getElementById('sip_years').value = '10';
  const timingEl = document.getElementById('sip_timing');
  if(timingEl) timingEl.value = 'end';
  // Clear results, charts, and schedules
  document.getElementById('sip_result').innerHTML = '';
  document.getElementById('sip_schedule').innerHTML = '';
  const chartContainer = document.getElementById('sip_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('sip_chart');
}

function clearLumpsum(){
  // Reset to default values instead of clearing
  document.getElementById('ls_amount').value = '200000';
  document.getElementById('ls_rate').value = '12';
  document.getElementById('ls_years').value = '10';
  // Clear results, charts, and schedules
  document.getElementById('ls_result').innerHTML = '';
  document.getElementById('ls_schedule').innerHTML = '';
  const chartContainer = document.getElementById('ls_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('ls_chart');
}

function clearSWP(){
  // Reset to default values instead of clearing
  document.getElementById('swp_corpus').value = '2000000';
  document.getElementById('swp_withdraw').value = '20000';
  document.getElementById('swp_rate').value = '10';
  document.getElementById('swp_years').value = '20';
  // Clear results, charts, and schedules
  document.getElementById('swp_result').innerHTML = '';
  document.getElementById('swp_schedule').innerHTML = '';
  const chartContainer = document.getElementById('swp_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('swp_chart');
}

function clearGoal(){
  // Reset to default values instead of clearing
  document.getElementById('goal_target').value = '10000000';
  document.getElementById('goal_rate').value = '10';
  document.getElementById('goal_years').value = '15';
  // Clear results, charts, and schedules
  document.getElementById('goal_result').innerHTML = '';
  const scheduleEl = document.getElementById('goal_schedule');
  if(scheduleEl) scheduleEl.innerHTML = '';
  const chartContainer = document.getElementById('goal_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('goal_chart');
}

function clearSuperSIP(){
  // Reset to default values instead of clearing
  document.getElementById('supersip_amount').value = '5000';
  document.getElementById('supersip_stepup').value = '5';
  document.getElementById('supersip_rate').value = '12';
  document.getElementById('supersip_years').value = '25';
  // Clear results, charts, and schedules
  document.getElementById('supersip_result').innerHTML = '';
  document.getElementById('supersip_schedule').innerHTML = '';
  const chartContainer = document.getElementById('supersip_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('supersip_chart');
}

function clearEMI(){
  // Reset to default values instead of clearing
  document.getElementById('emi_principal').value = '3000000';
  document.getElementById('emi_rate').value = '8.5';
  document.getElementById('emi_years').value = '20';
  // Clear results, charts, and schedules
  document.getElementById('emi_result').innerHTML = '';
  document.getElementById('emi_schedule').innerHTML = '';
  const chartContainer = document.getElementById('emi_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('emi_chart');
}

function clearPrepayment(){
  // Reset to default values instead of clearing
  document.getElementById('prepay_principal').value = '2500000';
  document.getElementById('prepay_rate').value = '8.5';
  document.getElementById('prepay_tenure').value = '20';
  document.getElementById('prepay_amount').value = '500000';
  document.getElementById('prepay_after').value = '12';
  document.getElementById('prepay_frequency').value = 'annual';
  document.getElementById('prepay_type').value = 'reduce_emi';
  // Clear results, charts, and schedules
  document.getElementById('prepay_result').innerHTML = '';
  document.getElementById('prepay_schedule').innerHTML = '';
  const chartContainer = document.getElementById('prepay_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('prepay_chart');
}

function clearCreditCard(){
  // Reset to default values instead of clearing
  document.getElementById('cc_amount').value = '50000';
  document.getElementById('cc_rate').value = '36';
  document.getElementById('cc_tenure').value = '12';
  document.getElementById('cc_alt_return').value = '12';
  document.getElementById('cc_processing_fee').value = '199';
  // Clear results, charts, and schedules
  document.getElementById('cc_result').innerHTML = '';
  document.getElementById('cc_schedule').innerHTML = '';
  const chartContainer = document.getElementById('cc_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('cc_chart');
}

function clearNPS(){
  // Reset to default values instead of clearing
  document.getElementById('nps_contrib').value = '100000';
  document.getElementById('nps_stepup').value = '5';
  document.getElementById('nps_return').value = '10';
  document.getElementById('nps_years').value = '30';
  document.getElementById('nps_annuity_pct').value = '40';
  document.getElementById('nps_annuity_rate').value = '6.5';
  // Clear results, charts, and schedules
  document.getElementById('nps_result').innerHTML = '';
  document.getElementById('nps_schedule').innerHTML = '';
  const chartContainer = document.getElementById('nps_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('nps_chart');
}

function clearEPF(){
  // Reset to default values instead of clearing
  document.getElementById('epf_salary').value = '50000';
  document.getElementById('epf_contribution_type').value = 'percentage';
  document.getElementById('epf_employee_pct').value = '12';
  document.getElementById('epf_employer_pct').value = '12';
  document.getElementById('epf_employee_fixed').value = '6000';
  document.getElementById('epf_employer_fixed').value = '6000';
  document.getElementById('epf_current_balance').value = '0';
  document.getElementById('epf_rate').value = '8.15';
  document.getElementById('epf_years').value = '25';
  document.getElementById('epf_salary_increase').value = '7';
  // Clear results, charts, and schedules
  document.getElementById('epf_result').innerHTML = '';
  document.getElementById('epf_schedule').innerHTML = '';
  const chartContainer = document.getElementById('epf_chart_container');
  if(chartContainer) chartContainer.style.display = 'none';
  destroyChart('epf_chart');
  // Reset the contribution type display
  toggleEPFContributionType();
}

function clearCAGR(){
  // Reset to default values instead of clearing
  document.getElementById('cagr_start').value = '100000';
  document.getElementById('cagr_end').value = '200000';
  document.getElementById('cagr_years').value = '5';
  // Clear results and schedules
  document.getElementById('cagr_result').innerHTML = '';
  document.getElementById('cagr_schedule').innerHTML = '';
}

function clearInflation(){
  // Reset to default values instead of clearing
  document.getElementById('inf_nom').value = '12';
  document.getElementById('inf_infl').value = '6';
  document.getElementById('inf_fv').value = '1000000';
  // Clear results and schedules
  document.getElementById('inflation_result').innerHTML = '';
  document.getElementById('inflation_schedule').innerHTML = '';
}

// APPLY_SAVED_THEME
window.addEventListener('DOMContentLoaded', () => {
  try{
    const saved = localStorage.getItem('theme');
    if(saved === 'light'){ document.body.classList.add('light'); }
    else { document.body.classList.remove('light'); }
  }catch(e){ /* ignore */ }
}, { once: true });
