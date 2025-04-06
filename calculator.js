const GST = 5;
const STAMP_DUTY = 6.6;
const REGISTRATION = 30000;
const MONTHS_IN_YEAR = 12;

document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll("input[type='number'], input[type='text']");

  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.select();
    });
  });
});

function updateProjectName() {
  const projectName = document.getElementById("projectName").value;
  document.getElementById("projectTitle").innerText = projectName || "Project Name";
}

function calculate() {
  const sba = parseFloat(document.getElementById("sba").value) || 0;
  const rate = parseFloat(document.getElementById("rate").value) || 0;
  const infraCharges = parseFloat(document.getElementById("infraCharges").value) || 0;
  const clubHouse = parseFloat(document.getElementById("clubHouse").value) || 0;
  const parking = parseFloat(document.getElementById("parking").value) || 0;
  const corpusFund = parseFloat(document.getElementById("corpusFund").value) || 0;
  const extraCost = parseFloat(document.getElementById("extraCost").value) || 0;
  const legalCharges = parseFloat(document.getElementById("legalCharges").value) || 0;
  const floorNumber = parseFloat(document.getElementById("floorNumber").value) || 0;
  const floorRise = parseFloat(document.getElementById("floorRise").value) || 0;
  const maintenanceCharge = parseFloat(document.getElementById("maintenanceCharge").value) || 0;
  const maintenanceYears = parseFloat(document.getElementById("maintenanceYears").value) || 0;

  const flatCost = sba * rate;
  const floorRiseCharges = floorNumber * floorRise * sba;
  const gst = (GST / 100) * (flatCost);
  const totalCost = flatCost + infraCharges + clubHouse + parking + corpusFund + gst;
  const stampDutyCost = (STAMP_DUTY / 100) * totalCost + REGISTRATION;
  const maintenance = sba * maintenanceCharge * maintenanceYears * MONTHS_IN_YEAR;
  const actualCost = totalCost + stampDutyCost + maintenance + floorRiseCharges + extraCost + legalCharges;
  const downPayment = (20 / 100) * totalCost;
  const ownContribution = stampDutyCost + maintenance + floorRiseCharges + extraCost + legalCharges;

  document.getElementById("tableSBA").innerText = Math.round(sba).toLocaleString("en-IN");
  document.getElementById("tableRate").innerText = Math.round(rate).toLocaleString("en-IN");
  document.getElementById("flatCost").innerText = Math.round(flatCost).toLocaleString("en-IN");
  document.getElementById("gst").innerText = Math.round(gst).toLocaleString("en-IN");
  document.getElementById("totalCost").innerText = Math.round(totalCost).toLocaleString("en-IN");
  document.getElementById("maintenance").innerText = Math.round(maintenance).toLocaleString("en-IN");
  document.getElementById("floorRiseCharges").innerText = Math.round(floorRiseCharges).toLocaleString("en-IN");
  document.getElementById("stampDutyCost").innerText = Math.round(stampDutyCost).toLocaleString("en-IN");
  document.getElementById("actualCost").innerText = Math.round(actualCost).toLocaleString("en-IN");
  document.getElementById("downPayment").innerText = Math.round(downPayment).toLocaleString("en-IN");
  document.getElementById("ownContribution").innerText = Math.round(ownContribution).toLocaleString("en-IN");

  // Loan calculation
  const loanInterest = parseFloat(document.getElementById("loanInterest").value) || 8.65;
  const loanTenure = parseFloat(document.getElementById("loanTenure").value) || 20;
  const loanAmount = (80 / 100) * totalCost;

  const monthlyInterestRate = loanInterest / 100 / MONTHS_IN_YEAR;
  const numberOfPayments = loanTenure * MONTHS_IN_YEAR;

  const emi = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments) /
              (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  const totalPayment = emi * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  document.getElementById("loanAmount").innerText = Math.round(loanAmount).toLocaleString("en-IN");
  document.getElementById("emi").innerText = Math.round(emi).toLocaleString("en-IN");
  document.getElementById("totalInterest").innerText = Math.round(totalInterest).toLocaleString("en-IN");
  document.getElementById("totalPayment").innerText = Math.round(totalPayment).toLocaleString("en-IN");

  // Tax Benefit Calculation
  const annualPrincipal = Math.min(loanAmount / loanTenure, 150000); // Max 1.5L under 80C
  const annualInterest = Math.min(totalInterest / loanTenure, 200000); // Max 2L under 24b

  const annualTaxSaving = annualPrincipal + annualInterest;
  const totalTaxSaving = (annualTaxSaving * loanTenure) * 0.3; // 30% tax bracket

  document.getElementById("taxPrincipal").innerText = Math.round(annualPrincipal).toLocaleString("en-IN");
  document.getElementById("taxInterest").innerText = Math.round(annualInterest).toLocaleString("en-IN");
  document.getElementById("annualTaxSaving").innerText = Math.round(annualTaxSaving).toLocaleString("en-IN");
  document.getElementById("totalTaxSaving").innerText = Math.round(totalTaxSaving).toLocaleString("en-IN");

  // Store these values globally for surplus recalculation
  window._loanAmount = loanAmount;
  window._emi = emi;
  window._monthlyInterestRate = monthlyInterestRate;
  window._numberOfPayments = numberOfPayments;

  generateAmortizationSchedule(loanAmount, emi, monthlyInterestRate, numberOfPayments);
}

function printTable() {
  const tableContent = document.getElementById("resultTable").outerHTML;
  const newWin = window.open("", "", "width=800,height=600");
  newWin.document.write("<html><head><title>Print</title>");
  newWin.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">');
  newWin.document.write("</head><body><div class='container mt-4'>" + tableContent + "</div></body></html>");
  newWin.document.close();
  newWin.print();
}

function generateAmortizationSchedule(principal, emi, rate, months) {
  const tableBody = document.querySelector("#amortizationTable tbody");
  tableBody.innerHTML = "";
  let currentBalance = principal;
  let currentDate = new Date();
  let yearTotalPrincipal = 0;
  let yearTotalInterest = 0;
  
  for (let i = 0; i < months; i++) {
    // --- New: Retrieve surplus value from a global object if available ---
    let surplusDeposit = 0;
    if (window.surplusValues && window.surplusValues[i] !== undefined) {
      surplusDeposit = parseFloat(window.surplusValues[i]) || 0;
    }
    
    const interestPayment = currentBalance * rate;
    const principalPayment = emi - interestPayment;

    // If principal payment is 0 and interest becomes negative, stop generating further rows.
    if (principalPayment <= 0 && interestPayment < 0) {
      break;
    }

    currentBalance -= principalPayment;
    // Adjust the balance based on surplus deposit/withdrawal
    currentBalance -= surplusDeposit;
    
    yearTotalPrincipal += principalPayment;
    yearTotalInterest += interestPayment;
    
    const monthStr = currentDate.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    let yearlyTotalsCell = "";
    if (currentDate.getMonth() === 2 || i === months - 1) { // Financial year ends in March (month index 2)
      yearlyTotalsCell = Math.round(yearTotalPrincipal).toLocaleString('en-IN') + " / " +
                         Math.round(yearTotalInterest).toLocaleString('en-IN');
      yearTotalPrincipal = 0;
      yearTotalInterest = 0;
    } else {
      yearlyTotalsCell = Math.round(yearTotalPrincipal).toLocaleString('en-IN') + " / " +
                         Math.round(yearTotalInterest).toLocaleString('en-IN');
    }
    
    // Use stored surplus value or default to 0 in the input field
    const surplusValue = (window.surplusValues && window.surplusValues[i] !== undefined)
                          ? window.surplusValues[i] : 0;

    // Highlight the row if it's March (month index 2) using Bootstrap's table-info class
    const rowClass = (currentDate.getMonth() === 2) ? "table-info" : "";
    
    const row = `<tr class="${rowClass}">
      <td>${monthStr}</td>
      <td>${Math.round(principalPayment).toLocaleString('en-IN')}</td>
      <td>${Math.round(interestPayment).toLocaleString('en-IN')}</td>
      <td>${Math.round(currentBalance > 0 ? currentBalance : 0).toLocaleString('en-IN')}</td>
      <td>${yearlyTotalsCell}</td>
      <td><input type="number" id="surplus_${i}" value="${surplusValue}" class="form-control form-control-sm" style="width:100px;" onchange="recalculateAmortization()" /></td>
    </tr>`;
    
    tableBody.insertAdjacentHTML('beforeend', row);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
}

function recalculateAmortization() {
  // Save existing surplus values
  window.surplusValues = {};
  document.querySelectorAll('[id^="surplus_"]').forEach(input => {
    const idx = input.id.split('_')[1];
    window.surplusValues[idx] = input.value;
  });
  generateAmortizationSchedule(window._loanAmount, window._emi, window._monthlyInterestRate, window._numberOfPayments);
}




// Run initial calculation on page load
window.onload = calculate;
