export function renderQuotationHtml(data) {
  const {
    quoteRef,
    customer,
    installer,
    lineItems,
    totals,
    cashflow,
    consumption,
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; padding: 40px; color: #1a1a1a; }
    h1 { color: #d97706; }
    .label { color: #6b7280; font-size: 12px; margin-top: 16px; }
    pre { background: #f3f4f6; padding: 12px; font-size: 11px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>GridScale Africa — ${quoteRef}</h1>

  <p class="label">Customer</p>
  <p>${customer.name} | ${customer.phone ?? ""} | ${customer.state ?? ""}</p>

  <p class="label">Installer</p>
  <p>${installer.company_name} | ${installer.address ?? ""}</p>

  <p class="label">Line Items (${lineItems.length})</p>
  <pre>${JSON.stringify(lineItems, null, 2)}</pre>

  <p class="label">Totals</p>
  <pre>${JSON.stringify(totals, null, 2)}</pre>

  <p class="label">Cashflow Summary</p>
  <pre>${JSON.stringify(cashflow?.summary ?? cashflow, null, 2)}</pre>

  <p class="label">Consumption Snapshot</p>
  <pre>${JSON.stringify(consumption, null, 2)}</pre>

  <p style="margin-top:40px; color:#6b7280; font-size:11px;">
    Step 2 data fetch confirmed ✓ — full template in Step 3
  </p>
</body>
</html>`;
}
