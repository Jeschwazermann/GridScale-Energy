// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt = {
  naira: (n) =>
    n == null || n === 0
      ? "₦0"
      : "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 }),

  nairaFull: (n) =>
    n == null
      ? "—"
      : "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 }),

  num: (n, dp = 1) => (n == null ? "—" : Number(n).toFixed(dp)),

  date: (d) =>
    d
      ? new Date(d).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—",

  pct: (n) => (n == null ? "—" : Number(n).toFixed(1) + "%"),
};

// ─── Inline SVG assets ────────────────────────────────────────────────────────

const LOGO_SVG = `<svg width="36" height="36" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="240" height="240" rx="48" fill="#0F766E"/>

  <g fill="#FFFFFF">
    <path d="M120 118 L106 50 L134 50 Z"/>
    <path d="M120 118 L56 68 L76 90 Z"/>
    <path d="M120 118 L184 68 L164 90 Z"/>
    <path d="M120 118 L34 112 L66 121 Z"/>
    <path d="M120 118 L206 112 L174 121 Z"/>
  </g>

  <g stroke="#FFFFFF" stroke-width="6" stroke-linecap="round">
    <line x1="120" y1="118" x2="106" y2="192"/>
    <line x1="120" y1="118" x2="58" y2="176"/>
    <line x1="120" y1="118" x2="182" y2="176"/>
    <line x1="58" y1="176" x2="106" y2="192"/>
    <line x1="182" y1="176" x2="106" y2="192"/>
  </g>

  <g fill="#FFFFFF">
    <circle cx="120" cy="118" r="11"/>
    <circle cx="106" cy="192" r="7"/>
    <circle cx="58" cy="176" r="7"/>
    <circle cx="182" cy="176" r="7"/>
  </g>
</svg>`;

// ─── Cover Image ──────────────────────────────────────────────────────────────

const COVER_IMAGE_URL =
  "https://images.unsplash.com/flagged/photo-1566838616838-c3a720672aad?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=1800";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICON = {
  sun: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="2" stroke-linecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="5" y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
  </svg>`,

  bolt: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>`,

  battery: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="2" stroke-linecap="round">
    <rect x="1" y="6" width="18" height="12" rx="2"/>
    <line x1="23" y1="13" x2="23" y2="11"/>
    <line x1="6" y1="10" x2="6" y2="14"/>
    <line x1="10" y1="10" x2="10" y2="14"/>
  </svg>`,

  home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>`,

  clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>`,

  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="2" stroke-linecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>`,

  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#065f46" stroke-width="3" stroke-linecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,

  x: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#991b1b" stroke-width="3" stroke-linecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,

  trending: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="2" stroke-linecap="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>`,

  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>`,

  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>`,
};

// ─── SVG Chart Generator ──────────────────────────────────────────────────────

function buildCumulativeSvg(tableRows) {
  if (!tableRows || tableRows.length === 0) return "";

  const W = 480;
  const H = 140;

  const PAD = {
    top: 16,
    right: 16,
    bottom: 28,
    left: 64,
  };

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const values = tableRows.map((r) => r.cumulative);

  const minV = Math.min(...values, 0);
  const maxV = Math.max(...values, 1);

  const range = maxV - minV || 1;

  const xScale = (i) => PAD.left + (i / (tableRows.length - 1)) * chartW;

  const yScale = (v) => PAD.top + chartH - ((v - minV) / range) * chartH;

  const zeroY = yScale(0);

  const pts = tableRows.map((r, i) => [xScale(i), yScale(r.cumulative)]);

  const linePath = pts
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`,
    )
    .join(" ");

  const fillPath =
    linePath +
    ` L${pts[pts.length - 1][0].toFixed(1)},${zeroY.toFixed(1)}` +
    ` L${pts[0][0].toFixed(1)},${zeroY.toFixed(1)} Z`;

  const ticks = [minV, (minV + maxV) / 2, maxV].map((v) => ({
    v,
    y: yScale(v),

    label:
      v >= 1e6
        ? `₦${(v / 1e6).toFixed(0)}M`
        : v <= -1e6
          ? `-₦${(Math.abs(v) / 1e6).toFixed(0)}M`
          : `₦${(v / 1e3).toFixed(0)}K`,
  }));

  const xLabels = tableRows.map((r, i) => ({
    x: xScale(i),
    label: r.year,
  }));

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">

  <defs>
    <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F766E" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0F766E" stop-opacity="0.02"/>
    </linearGradient>
  </defs>

  ${ticks
    .map(
      (t) =>
        `<line
          x1="${PAD.left}"
          y1="${t.y.toFixed(1)}"
          x2="${W - PAD.right}"
          y2="${t.y.toFixed(1)}"
          stroke="#e5e7eb"
          stroke-width="1"
          stroke-dasharray="3 3"
        />`,
    )
    .join("\n")}

  <line
    x1="${PAD.left}"
    y1="${zeroY.toFixed(1)}"
    x2="${W - PAD.right}"
    y2="${zeroY.toFixed(1)}"
    stroke="#9ca3af"
    stroke-width="1"
  />

  <path
    d="${fillPath}"
    fill="url(#fillGrad)"
  />

  <path
    d="${linePath}"
    fill="none"
    stroke="#0F766E"
    stroke-width="2"
    stroke-linejoin="round"
  />

  ${pts
    .map(
      (p) =>
        `<circle
          cx="${p[0].toFixed(1)}"
          cy="${p[1].toFixed(1)}"
          r="3"
          fill="#0F766E"
        />`,
    )
    .join("\n")}

  ${ticks
    .map(
      (t) =>
        `<text
          x="${PAD.left - 5}"
          y="${(t.y + 4).toFixed(1)}"
          text-anchor="end"
          font-size="8"
          fill="#6b7280"
          font-family="Helvetica,Arial,sans-serif"
        >${t.label}</text>`,
    )
    .join("\n")}

  ${xLabels
    .map(
      (l) =>
        `<text
          x="${l.x.toFixed(1)}"
          y="${H - 4}"
          text-anchor="middle"
          font-size="8"
          fill="#6b7280"
          font-family="Helvetica,Arial,sans-serif"
        >${l.label}</text>`,
    )
    .join("\n")}

  <line
    x1="${PAD.left}"
    y1="${PAD.top}"
    x2="${PAD.left}"
    y2="${H - PAD.bottom}"
    stroke="#d1d5db"
    stroke-width="1"
  />

</svg>`;
}

// ─── Shared Header ────────────────────────────────────────────────────────────

function pageHeader({ quoteRef, createdAt, page }) {
  return `
  <div class="page-header">

    <div class="brand-block">
      ${LOGO_SVG}

      <div>
        <div class="brand-name">
          GRIDSCALE<span style="font-weight:300;"> AFRICA</span>
        </div>

        <div class="brand-sub">
          Smart energy solutions for homes and businesses.
        </div>
      </div>
    </div>

    <div class="header-meta">
      <div class="meta-label">
        Quote: <strong>${escHtml(quoteRef)}</strong>
      </div>

      <div class="meta-label">
        Page ${page}
      </div>
    </div>

  </div>`;
}

// ─── Shared Footer ────────────────────────────────────────────────────────────

function pageFooter(installer) {
  return `
  <div class="page-footer">

    <span>
      www.gridscale.africa
    </span>

    <span>
      ✉ ${escHtml(installer.email ?? "info@gridscale.africa")}
    </span>

    <span>
      📞 ${escHtml(installer.phone ?? "—")}
    </span>

  </div>`;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;

  font-family:
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif;

  font-size: 9.5pt;

  color: #1a1a1a;

  background: #fff;

  line-height: 1.45;
}


/* ── Brand Colours ─────────────────────────────────────────────────────────── */

:root {

  --teal:     #0F766E;
  --teal-lt:  #ccfbf1;
  --teal-md:  #5eead4;

  --amber:    #d97706;

  --dark:     #111827;
  --mid:      #374151;
  --muted:    #6b7280;

  --rule:     #e5e7eb;
  --stone:    #f9fafb;

  --green:    #065f46;
  --green-lt: #d1fae5;

  --red:      #991b1b;
  --red-lt:   #fee2e2;
}


/* ── Page ──────────────────────────────────────────────────────────────────── */

.page {

  width: 210mm;
  min-height: 297mm;

  padding: 0;

  page-break-after: always;

  display: flex;
  flex-direction: column;
}

.page:last-child {
  page-break-after: avoid;
}

.page-inner {
  min-height: 0;

  padding:
    12mm
    14mm
    10mm
    14mm;

  flex: 1;

  display: flex;
  flex-direction: column;
}


/* ── Header ────────────────────────────────────────────────────────────────── */

.page-header {

  display: flex;

  justify-content: space-between;
  align-items: center;

  padding:
    8px
    14mm;

  background: #fff;

  border-bottom:
    2.5pt solid
    var(--teal);

  margin-bottom: 16px;
}

.brand-block {

  display: flex;

  align-items: center;

  gap: 10px;
}

.brand-name {

  font-size: 11pt;

  font-weight: 700;

  color: var(--dark);

  letter-spacing: 0.04em;
}

.brand-sub {

  font-size: 7pt;

  color: var(--muted);

  margin-top: 1px;
}

.header-meta {

  text-align: right;
}

.meta-label {

  font-size: 8pt;

  color: var(--muted);
}

.meta-label strong {

  color: var(--teal);
}


/* ── Footer ────────────────────────────────────────────────────────────────── */

.page-footer {

  border-top:
    1px solid
    var(--rule);

  padding:
    6px
    14mm;

  display: flex;

  justify-content: space-between;

  background: #fff;
}

.page-footer span {

  font-size: 7pt;

  color: var(--muted);
}


/* ── Section Heading ───────────────────────────────────────────────────────── */

.section-heading {

  font-size: 14pt;

  font-weight: 700;

  color: var(--dark);

  border-left:
    4px solid
    var(--teal);

  padding-left: 10px;

  margin-bottom: 14px;
}

.section-label {

  font-size: 6.5pt;

  font-weight: 700;

  letter-spacing: 0.14em;

  text-transform: uppercase;

  color: var(--teal);

  margin-bottom: 8px;

  margin-top: 14px;
}


/* ── COVER PAGE ────────────────────────────────────────────────────────────── */

.cover-top {

  background: var(--dark);

  min-height: 124mm;

  padding:
    24px
    14mm
    22px;

  position: relative;

  overflow: hidden;

  display: flex;

  flex-direction: column;

  justify-content: space-between;
}


/*
  Hero photograph.

  The image is deliberately behind a dark overlay so
  the GridScale typography remains readable.
*/

.cover-top::after {

  content: '';

  position: absolute;

  inset: 0;

  background:
    linear-gradient(
      90deg,
      rgba(17,24,39,.98) 0%,
      rgba(17,24,39,.82) 42%,
      rgba(17,24,39,.28) 100%
    ),
    url(${COVER_IMAGE_URL});

  background-size: cover;

  background-position: center;

  z-index: 0;
}


/* Teal accent line */

.cover-top::before {

  content: '';

  position: absolute;

  inset:
    auto
    0
    0
    0;

  height: 5px;

  background: var(--teal);

  z-index: 3;
}

.cover-top > * {

  position: relative;

  z-index: 2;
}


/* Cover tagline */

.cover-tagline {

  font-size: 8pt;

  color: #b7c0ca;

  margin-bottom: 9px;

  letter-spacing: .02em;
}


/* Cover title */

.cover-title {

  font-size: 30pt;

  font-weight: 700;

  color: #fff;

  line-height: 1.04;

  letter-spacing: -.025em;
}

.cover-title span {

  color: var(--teal-md);
}


/* Cover subtitle */

.cover-subtitle {

  font-size: 9pt;

  color: #d1d5db;

  margin-top: 9px;
}


/* ── Cover Meta Bar ────────────────────────────────────────────────────────── */

.cover-meta-bar {

  background: var(--teal);

  color: #fff;

  padding:
    11px
    14mm;

  display: flex;

  gap: 34px;
}

.cover-meta-bar .meta-item-label {

  font-size: 6.5pt;

  opacity: .78;

  text-transform: uppercase;

  letter-spacing: .09em;
}

.cover-meta-bar .meta-item-value {

  font-size: 8.8pt;

  font-weight: 600;

  margin-top: 1px;
}


/* ── Cover Body ────────────────────────────────────────────────────────────── */

.cover-body {

  padding:
    17px
    14mm
    13px;

  display: grid;

  grid-template-columns:
    1.1fr
    .9fr;

  gap: 24px;

  flex: 1;

  align-items: stretch;
}


/* Prepared-for label */

.cover-prepared-label {

  font-size: 6.5pt;

  color: var(--muted);

  text-transform: uppercase;

  letter-spacing: .11em;

  margin-bottom: 6px;
}


/* Customer / installer information */

.cover-party {

  border-left:
    3px solid
    var(--teal);

  padding-left: 10px;

  margin-bottom: 14px;
}

.cover-party .party-role {

  font-size: 7pt;

  color: var(--muted);
}

.cover-party .party-name {

  font-size: 12pt;

  font-weight: 700;

  color: var(--dark);
}

.cover-party .party-detail {

  font-size: 8pt;

  color: var(--mid);

  margin-top: 2px;
}


/* ── Cover System Card ─────────────────────────────────────────────────────── */

.cover-system-card {

  background: var(--dark);

  border-radius: 8px;

  padding:
    17px
    18px;

  color: #fff;

  display: flex;

  flex-direction: column;

  justify-content: center;

  align-items: center;

  text-align: center;
}

.cover-system-card .sys-label {

  font-size: 6.5pt;

  color: #9ca3af;

  text-transform: uppercase;

  letter-spacing: .11em;

  margin-bottom: 5px;
}

.cover-system-card .sys-value {

  font-size: 30pt;

  font-weight: 700;

  color: var(--teal-md);

  line-height: 1;
}

.cover-system-card .sys-unit {

  font-size: 12pt;

  font-weight: 300;

  color: #fff;
}

.cover-system-card .sys-sub {

  font-size: 8pt;

  color: #9ca3af;

  margin-top: 7px;
}

.cover-system-card .sys-specs {

  margin-top: 12px;

  width: 100%;
}

.cover-system-card .spec-row {

  display: flex;

  justify-content: space-between;

  font-size: 8pt;

  padding: 4px 0;

  border-bottom:
    1px solid
    rgba(255,255,255,.08);

  color: #d1d5db;
}

.cover-system-card .spec-row:last-child {

  border-bottom: none;
}

.cover-system-card .spec-val {

  color: #fff;

  font-weight: 500;
}


/* ── Energy Flow Diagram ───────────────────────────────────────────────────── */

.flow-diagram {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 0;

  margin-bottom: 16px;

  padding: 12px;

  background: var(--stone);

  border-radius: 6px;

  border:
    1px solid
    var(--rule);
}

.flow-item {

  text-align: center;

  flex: 1;
}

.flow-item .flow-icon {

  width: 44px;

  height: 44px;

  border-radius: 50%;

  background: #fff;

  border:
    2px solid
    var(--teal);

  display: flex;

  align-items: center;

  justify-content: center;

  margin:
    0
    auto
    5px;
}

.flow-item .flow-label {

  font-size: 8pt;

  font-weight: 600;

  color: var(--dark);
}

.flow-item .flow-sub {

  font-size: 7pt;

  color: var(--muted);
}

.flow-arrow {

  color: #9ca3af;

  padding:
    0
    4px;

  margin-top: -16px;
}


/* ── System Summary ────────────────────────────────────────────────────────── */

.snap-grid {

  display: grid;

  grid-template-columns:
    repeat(5, 1fr);

  gap: 8px;

  margin-bottom: 16px;
}

.snap-card {

  background: #fff;

  border:
    1px solid
    var(--rule);

  border-radius: 5px;

  padding:
    8px
    10px;

  border-top:
    3px solid
    var(--teal);
}

.snap-card .snap-label {

  font-size: 6.5pt;

  color: var(--muted);

  margin-bottom: 3px;
}

.snap-card .snap-value {

  font-size: 11pt;

  font-weight: 700;

  color: var(--dark);
}

.snap-card .snap-sub {

  font-size: 7pt;

  color: var(--mid);

  margin-top: 1px;
}


/* ── Tables ────────────────────────────────────────────────────────────────── */

table {

  width: 100%;

  border-collapse: collapse;

  margin-bottom: 14px;

  font-size: 8.5pt;
}


/* Smaller table specifically for financial page */

.cashflow-table {

  font-size: 7.2pt;
}

.cashflow-table thead th {

  font-size: 6.2pt;

  padding:
    6px
    6px;
}

.cashflow-table tbody td {

  padding:
    5px
    6px;
}


thead tr {

  background: var(--dark);
}

thead th {

  padding:
    7px
    10px;

  color: #fff;

  font-size: 7pt;

  font-weight: 600;

  text-align: left;

  letter-spacing: 0.08em;

  text-transform: uppercase;
}

thead th.r {

  text-align: right;
}

tbody tr {

  border-bottom:
    1px solid
    var(--rule);
}

tbody tr:nth-child(even) {

  background: var(--stone);
}

tbody td {

  padding:
    6px
    10px;

  color: var(--mid);
}

tbody td.dark {

  color: var(--dark);

  font-weight: 500;
}

tbody td.r {

  text-align: right;
}

tbody td.mono {

  font-family:
    'Courier New',
    monospace;

  font-size: 8pt;
}


/* ── CAPEX Callout ─────────────────────────────────────────────────────────── */

.capex-bar {

  background: var(--dark);

  color: #fff;

  border-radius: 6px;

  padding:
    12px
    16px;

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 0;
}

.capex-bar .cap-label {

  font-size: 8.5pt;

  color: #9ca3af;
}

.capex-bar .cap-value {

  font-size: 15pt;

  font-weight: 700;

  color: var(--teal-md);
}


/* ── Pricing Page ──────────────────────────────────────────────────────────── */

.totals-wrap {

  display: flex;

  justify-content: flex-end;

  margin-bottom: 16px;
}

.totals-table {

  width: 240px;

  border-collapse: collapse;
}

.totals-table td {

  padding:
    5px
    10px;

  font-size: 9pt;
}

.totals-table td:last-child {

  text-align: right;

  font-weight: 500;
}

.totals-table .t-sub td {

  color: var(--muted);

  font-size: 8pt;
}

.totals-table .t-grand td {

  background: var(--teal);

  color: #fff;

  font-size: 11pt;

  font-weight: 700;
}

.totals-table .t-grand td:first-child {

  border-radius:
    4px
    0
    0
    4px;
}

.totals-table .t-grand td:last-child {

  border-radius:
    0
    4px
    4px
    0;
}


/* ── Two Column Blocks ─────────────────────────────────────────────────────── */

.two-col {

  display: grid;

  grid-template-columns:
    1fr
    1fr;

  gap: 14px;

  margin-bottom: 14px;
}

.info-box {

  background: var(--stone);

  border:
    1px solid
    var(--rule);

  border-radius: 5px;

  padding:
    10px
    12px;
}

.info-box h4 {

  font-size: 7.5pt;

  font-weight: 700;

  color: var(--dark);

  margin-bottom: 6px;
}

.info-box p {

  font-size: 8pt;

  color: var(--mid);

  line-height: 1.6;
}


/* ── Check Lists ───────────────────────────────────────────────────────────── */

.check-list {

  list-style: none;
}

.check-list li {

  display: flex;

  align-items: flex-start;

  gap: 6px;

  font-size: 8pt;

  color: var(--mid);

  padding:
    2px
    0;
}

.check-list li .ic {

  margin-top: 1px;

  flex-shrink: 0;
}


/* ── Financial KPI Bar ─────────────────────────────────────────────────────── */

.kpi-bar {

  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 10px;

  margin-bottom: 16px;
}

.kpi-card {

  border:
    1px solid
    var(--rule);

  border-radius: 6px;

  padding:
    10px
    12px;
}

.kpi-card.hl {

  background: var(--teal);

  border-color: var(--teal);
}

.kpi-card .kpi-icon {

  margin-bottom: 5px;
}

.kpi-card .kpi-label {

  font-size: 6.5pt;

  color: var(--muted);

  text-transform: uppercase;

  letter-spacing: 0.08em;

  margin-bottom: 3px;
}

.kpi-card.hl .kpi-label {

  color:
    rgba(
      255,
      255,
      255,
      0.7
    );
}

.kpi-card .kpi-value {

  font-size: 13pt;

  font-weight: 700;

  color: var(--dark);
}

.kpi-card.hl .kpi-value {

  color: #fff;
}

.kpi-card .kpi-sub {

  font-size: 7pt;

  color: var(--muted);

  margin-top: 2px;
}

.kpi-card.hl .kpi-sub {

  color:
    rgba(
      255,
      255,
      255,
      0.65
    );
}


/* ── Cashflow Colours ──────────────────────────────────────────────────────── */

.pos {

  color: var(--green);

  font-weight: 600;
}

.neg {

  color: var(--red);
}


/* ── Chart ─────────────────────────────────────────────────────────────────── */

.chart-wrap {

  background: var(--stone);

  border:
    1px solid
    var(--rule);

  border-radius: 6px;

  padding:
    12px
    14px;

  margin-bottom: 14px;
}

.chart-title {

  font-size: 8pt;

  font-weight: 600;

  color: var(--dark);

  margin-bottom: 8px;
}


/* ── Assumptions Notice ────────────────────────────────────────────────────── */

.notice {

  background: #fefce8;

  border-left:
    3px solid
    #ca8a04;

  border-radius:
    0
    4px
    4px
    0;

  padding:
    7px
    10px;

  font-size: 7.5pt;

  color: #713f12;

  margin-bottom: 14px;
}


/* ── Warranty ──────────────────────────────────────────────────────────────── */

.warranty-grid {

  display: grid;

  grid-template-columns:
    1fr
    1fr;

  gap: 12px;

  margin-bottom: 14px;
}

.warranty-card {

  border:
    1px solid
    var(--rule);

  border-radius: 6px;

  padding:
    10px
    12px;
}

.warranty-card .wc-head {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 6px;
}

.warranty-card .wc-title {

  font-size: 9pt;

  font-weight: 700;

  color: var(--dark);
}

.warranty-card .wc-sub {

  font-size: 8pt;

  color: var(--mid);
}

.warranty-card .wc-duration {

  display: inline-block;

  background: var(--teal-lt);

  color: var(--teal);

  font-size: 7pt;

  font-weight: 600;

  padding:
    2px
    7px;

  border-radius: 10px;

  margin-top: 4px;
}


/* ── Timeline ──────────────────────────────────────────────────────────────── */

.timeline-grid {

  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 8px;

  margin-bottom: 14px;
}

.tl-item {

  background: var(--stone);

  border-radius: 5px;

  padding:
    8px
    10px;

  border-top:
    3px solid
    var(--rule);
}

.tl-item.active {

  border-top-color:
    var(--teal);
}

.tl-item .tl-phase {

  font-size: 7pt;

  font-weight: 700;

  color: var(--dark);
}

.tl-item .tl-dur {

  font-size: 7pt;

  color: var(--muted);

  margin-top: 2px;
}


/* ── Signature ─────────────────────────────────────────────────────────────── */

.sig-grid {

  display: grid;

  grid-template-columns:
    1fr
    1fr;

  gap: 24px;

  margin-top: 16px;
}

.sig-box {

  border-top:
    1.5px solid
    var(--dark);

  padding-top: 6px;
}

.sig-box .sig-label {

  font-size: 7pt;

  color: var(--muted);
}

.sig-box .sig-name {

  font-size: 9pt;

  font-weight: 600;

  color: var(--dark);

  margin-top: 22px;
}

.sig-box .sig-date {

  font-size: 7pt;

  color: var(--muted);

  margin-top: 3px;
}


/* ── Closing Panel ─────────────────────────────────────────────────────────── */

.closing-panel {

  background: var(--dark);

  border-radius: 8px;

  padding:
    18px
    20px;

  margin-top: 14px;

  display: flex;

  justify-content: space-between;

  align-items: center;
}

.closing-panel .close-msg {

  font-size: 12pt;

  font-weight: 700;

  color: #fff;
}

.closing-panel .close-msg span {

  color: var(--teal-md);
}

.closing-panel .close-sub {

  font-size: 8pt;

  color: #9ca3af;

  margin-top: 4px;
}

.closing-panel .close-badge {

  background: var(--teal);

  color: #fff;

  font-size: 7.5pt;

  font-weight: 600;

  padding:
    6px
    14px;

  border-radius: 4px;

  text-transform: uppercase;

  letter-spacing: 0.06em;
}


/* ── Divider ───────────────────────────────────────────────────────────────── */

.divider {

  border: none;

  border-top:
    1px solid
    var(--rule);

  margin:
    12px
    0;
}

`;

// ─── Main Template ────────────────────────────────────────────────────────────

export function renderQuotationHtml(data) {
  const {
    quoteRef,
    createdAt,
    validityDate,
    paymentTerms,
    notes,
    installer,
    customer,
    lineItems,
    totals,
    cashflow,
    consumption,
  } = data;

  return `<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="utf-8">

<style>
${CSS}
</style>

</head>

<body>


<!-- ═══════════════════════════════════════════════════════════════════════════
     PAGE 1 — COVER
═══════════════════════════════════════════════════════════════════════════ -->

<div class="page">


  <!-- HERO COVER -->

  <div class="cover-top">

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
    ">

      <div>

        <!-- Brand -->

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:18px;
        ">

          ${LOGO_SVG}

          <div style="
            font-size:12pt;
            font-weight:700;
            color:#fff;
            letter-spacing:.04em;
          ">
            GRIDSCALE
            <span style="font-weight:300;">
              AFRICA
            </span>
          </div>

        </div>


        <!-- Tagline -->

        <div class="cover-tagline">
          Reliable power. Lower energy costs. A sustainable future.
        </div>


        <!-- Main title -->

        <div class="cover-title">
          SOLAR ENERGY
          <br>
          <span>PROPOSAL</span>
        </div>


        <!-- Customer/date -->

        <div class="cover-subtitle">
          Prepared for
          ${escHtml(customer.name)}
          &nbsp;·&nbsp;
          ${fmt.date(createdAt)}
        </div>

      </div>


      <!-- Quote metadata -->

      <div style="
        text-align:right;
        color:#b7c0ca;
        font-size:8pt;
      ">

        <div>
          QUOTE REFERENCE
        </div>

        <div style="
          font-size:13pt;
          font-weight:700;
          color:#5eead4;
          margin-top:2px;
        ">
          ${escHtml(quoteRef)}
        </div>


        <div style="margin-top:10px;">
          DATE
        </div>

        <div style="
          font-size:10pt;
          font-weight:600;
          color:#fff;
          margin-top:2px;
        ">
          ${fmt.date(createdAt)}
        </div>

      </div>

    </div>

  </div>


  <!-- COVER META BAR -->

  <div class="cover-meta-bar">


    <div class="meta-item">

      <div class="meta-item-label">
        Prepared for
      </div>

      <div class="meta-item-value">
        ${escHtml(customer.name)}
      </div>

    </div>


    <div class="meta-item">

      <div class="meta-item-label">
        Valid Until
      </div>

      <div class="meta-item-value">
        ${fmt.date(validityDate)}
      </div>

    </div>


    <div class="meta-item">

      <div class="meta-item-label">
        Installer
      </div>

      <div class="meta-item-value">
        ${escHtml(installer.company_name)}
      </div>

    </div>


    ${
      consumption
        ? `
    <div class="meta-item">

      <div class="meta-item-label">
        System Size
      </div>

      <div class="meta-item-value">
        ${fmt.num(consumption.systemSizeKWp, 1)}
        kWp
      </div>

    </div>
    `
        : ""
    }

  </div>


  <!-- COVER BODY -->

  <div class="cover-body">


    <!-- LEFT: CUSTOMER / INSTALLER -->

    <div>

      <div class="cover-prepared-label">
        Prepared for
      </div>


      <div
        class="cover-party"
        style="margin-bottom:16px;"
      >

        <div class="party-role">
          Customer
        </div>

        <div class="party-name">
          ${escHtml(customer.name)}
        </div>

        <div class="party-detail">
          ${escHtml(customer.email ?? "")}

          ${customer.email && customer.phone ? " · " : ""}

          ${escHtml(customer.phone ?? "")}
        </div>


        ${
          customer.address || customer.state
            ? `
        <div class="party-detail">

          ${escHtml(customer.address ?? "")}

          ${customer.state ? `, ${escHtml(customer.state)}` : ""}

          ${customer.lga ? ` (${escHtml(customer.lga)})` : ""}

        </div>
        `
            : ""
        }

      </div>


      <div class="cover-prepared-label">
        Prepared by
      </div>


      <div class="cover-party">

        <div class="party-role">
          Solar Installer
        </div>

        <div class="party-name">
          ${escHtml(installer.company_name)}
        </div>


        ${
          installer.contact_name
            ? `
        <div class="party-detail">
          ${escHtml(installer.contact_name)}
        </div>
        `
            : ""
        }


        <div class="party-detail">

          ${escHtml(installer.email ?? "")}

          ${installer.email && installer.phone ? " · " : ""}

          ${escHtml(installer.phone ?? "")}

        </div>


        ${
          installer.address
            ? `
        <div class="party-detail">
          ${escHtml(installer.address)}
        </div>
        `
            : ""
        }

      </div>

    </div>


    <!-- RIGHT: SYSTEM SUMMARY -->

    ${
      consumption
        ? `
    <div class="cover-system-card">

      <div class="sys-label">
        Proposed System Size
      </div>


      <div>

        <span class="sys-value">
          ${fmt.num(consumption.systemSizeKWp, 1)}
        </span>

        <span class="sys-unit">
          kWp
        </span>

      </div>


      <div class="sys-sub">

        ${consumption.panelCount}
        ×
        ${consumption.panelWp}Wp panels

      </div>


      <div class="sys-specs">

        <div class="spec-row">
          <span>Battery</span>

          <span class="spec-val">
            ${fmt.num(consumption.batteryKWh, 1)}
            kWh
          </span>
        </div>


        <div class="spec-row">
          <span>Inverter</span>

          <span class="spec-val">
            ${fmt.num(consumption.inverterKva, 0)}
            kVA
          </span>
        </div>


        <div class="spec-row">
          <span>Daily Demand</span>

          <span class="spec-val">
            ${fmt.num(consumption.dailyKWh, 1)}
            kWh
          </span>
        </div>


        <div class="spec-row">
          <span>Peak Sun Hrs</span>

          <span class="spec-val">
            ${fmt.num(consumption.peakSunHours, 1)}
            hrs
          </span>
        </div>

      </div>

    </div>
    `
        : `<div></div>`
    }

  </div>


  ${pageFooter(installer)}

</div>



<!-- ═══════════════════════════════════════════════════════════════════════════
     PAGE 2 — YOUR ENERGY SOLUTION
═══════════════════════════════════════════════════════════════════════════ -->

<div class="page">


  ${pageHeader({
    quoteRef,
    createdAt,
    page: "2 of 5",
  })}


  <div class="page-inner">


    <div class="section-heading">
      1. Your Energy Solution
    </div>


    <p style="
      font-size:8.5pt;
      color:var(--mid);
      margin-bottom:14px;
    ">

      This system is designed to meet your daily
      energy needs reliably and reduce your
      dependency on the grid or generator.

    </p>


    <!-- ENERGY FLOW -->

    <div class="flow-diagram">


      <!-- Solar -->

      <div class="flow-item">

        <div class="flow-icon">
          ${ICON.sun}
        </div>

        <div class="flow-label">
          Solar Array
        </div>

        <div class="flow-sub">
          Generates clean
          <br>
          energy from the sun
        </div>

      </div>


      <div class="flow-arrow">
        ${ICON.arrow}
      </div>


      <!-- Inverter -->

      <div class="flow-item">

        <div class="flow-icon">
          ${ICON.bolt}
        </div>

        <div class="flow-label">
          Inverter
        </div>

        <div class="flow-sub">
          Converts DC power
          <br>
          to AC for your home
        </div>

      </div>


      <div class="flow-arrow">
        ${ICON.arrow}
      </div>


      <!-- Battery -->

      <div class="flow-item">

        <div class="flow-icon">
          ${ICON.battery}
        </div>

        <div class="flow-label">
          Battery
        </div>

        <div class="flow-sub">
          Stores energy for
          <br>
          use anytime
        </div>

      </div>


      <div class="flow-arrow">
        ${ICON.arrow}
      </div>


      <!-- Home -->

      <div class="flow-item">

        <div class="flow-icon">
          ${ICON.home}
        </div>

        <div class="flow-label">
          Your Home
        </div>

        <div class="flow-sub">
          Powering your
          <br>
          appliances
        </div>

      </div>


    </div>


    ${
      consumption
        ? `

    <!-- SYSTEM SUMMARY -->

    <div class="section-label">
      System Summary
    </div>


    <div class="snap-grid">


      <div class="snap-card">

        <div class="snap-label">
          Solar Array
        </div>

        <div class="snap-value">
          ${fmt.num(consumption.systemSizeKWp, 1)}
          kWp
        </div>

        <div class="snap-sub">
          ${consumption.panelCount}
          ×
          ${consumption.panelWp}Wp panels
        </div>

      </div>


      <div class="snap-card">

        <div class="snap-label">
          Battery Storage
        </div>

        <div class="snap-value">
          ${fmt.num(consumption.batteryKWh, 1)}
          kWh
        </div>

        <div class="snap-sub">
          ${escHtml(
            consumption.batteryLabel || `${consumption.batteryUnits} units`,
          )}
        </div>

      </div>


      <div class="snap-card">

        <div class="snap-label">
          Inverter
        </div>

        <div class="snap-value">
          ${fmt.num(consumption.inverterKva, 0)}
          kVA
        </div>

        <div class="snap-sub">
          ${escHtml(
            consumption.inverterLabel || `${consumption.inverterKW}kW rated`,
          )}
        </div>

      </div>


      <div class="snap-card">

        <div class="snap-label">
          Daily Demand
        </div>

        <div class="snap-value">
          ${fmt.num(consumption.dailyKWh, 1)}
          kWh
        </div>

        <div class="snap-sub">
          Effective daily load
        </div>

      </div>


      <div class="snap-card">

        <div class="snap-label">
          Peak Sun Hours
        </div>

        <div class="snap-value">
          ${fmt.num(consumption.peakSunHours, 1)}
          hrs
        </div>

        <div class="snap-sub">
          Location irradiance
        </div>

      </div>


    </div>


    <!-- EQUIPMENT SPECIFICATION -->

    <div class="section-label">
      Equipment Specification
    </div>


    <table>

      <thead>

        <tr>

          <th style="width:22%">
            Component
          </th>

          <th style="width:35%">
            Specification
          </th>

          <th
            class="r"
            style="width:10%"
          >
            Qty
          </th>

          <th style="width:33%">
            Details
          </th>

        </tr>

      </thead>


      <tbody>


        <tr>

          <td class="dark">
            Solar Panels
          </td>

          <td>
            ${consumption.panelWp}Wp
            Monocrystalline
          </td>

          <td class="r">
            ${consumption.panelCount}
          </td>

          <td>
            Total
            ${fmt.num(consumption.systemSizeKWp, 1)}kWp
          </td>

        </tr>


        <tr>

          <td class="dark">
            Inverter
          </td>

          <td>
            ${escHtml(
              consumption.inverterLabel || `${consumption.inverterKva}kVA`,
            )}
          </td>

          <td class="r">
            1
          </td>

          <td>
            Hybrid Inverter
          </td>

        </tr>


        <tr>

          <td class="dark">
            Battery
          </td>

          <td>
            ${escHtml(consumption.batteryLabel || `LiFePO4`)}
          </td>

          <td class="r">
            ${consumption.batteryUnits}
          </td>

          <td>
            Total
            ${fmt.num(consumption.batteryKWh, 1)}kWh
          </td>

        </tr>


        <tr>

          <td class="dark">
            Mounting System
          </td>

          <td>
            Aluminium Roof Mount
          </td>

          <td class="r">
            1
          </td>

          <td>
            Complete Set
          </td>

        </tr>


        <tr>

          <td class="dark">
            Protection &amp; BOS
          </td>

          <td>
            DC/AC Protection,
            Cables, etc.
          </td>

          <td class="r">
            1
          </td>

          <td>
            Complete Set
          </td>

        </tr>


      </tbody>

    </table>


    <!-- CAPEX -->

    <div class="capex-bar">

      <div>

        <div class="cap-label">

          ${ICON.sun}

          &nbsp;

          Estimated System CAPEX
          (Before negotiation):

        </div>

      </div>


      <div class="cap-value">

        ${fmt.nairaFull(consumption.estimatedCapex)}

      </div>

    </div>


    `
        : `

    <div style="
      text-align:center;
      padding:32px;
      color:var(--muted);
      font-size:8.5pt;
      background:var(--stone);
      border-radius:6px;
    ">

      System specification is generated
      once an assessment is linked to
      this quotation.

    </div>

    `
    }


  </div>


  ${pageFooter(installer)}

</div>



<!-- ═══════════════════════════════════════════════════════════════════════════
     PAGE 3 — INVESTMENT SUMMARY
═══════════════════════════════════════════════════════════════════════════ -->

<div class="page">


  ${pageHeader({
    quoteRef,
    createdAt,
    page: "3 of 5",
  })}


  <div class="page-inner">


    <div class="section-heading">
      2. Investment Summary
    </div>


    <div class="section-label">
      Component &amp; Pricing Breakdown
    </div>


    ${
      lineItems.length > 0
        ? `

    <table>

      <thead>

        <tr>

          <th style="width:52%">
            Description
          </th>

          <th
            class="r"
            style="width:10%"
          >
            Qty
          </th>

          <th
            class="r"
            style="width:19%"
          >
            Unit Price (₦)
          </th>

          <th
            class="r"
            style="width:19%"
          >
            Total (₦)
          </th>

        </tr>

      </thead>


      <tbody>

        ${lineItems
          .map(
            (item) => `

        <tr>

          <td class="dark">
            ${escHtml(item.description)}
          </td>

          <td class="r">
            ${item.quantity}
          </td>

          <td class="r mono">
            ${item.unitPrice === 0 ? "—" : fmt.naira(item.unitPrice)}
          </td>

          <td
            class="r mono ${item.total > 0 ? "dark" : ""}"
          >
            ${item.total === 0 ? "—" : fmt.naira(item.total)}
          </td>

        </tr>

        `,
          )
          .join("")}

      </tbody>

    </table>


    <!-- TOTALS -->

    <div class="totals-wrap">

      <table class="totals-table">

        <tr>

          <td style="color:var(--muted);">
            Subtotal
          </td>

          <td>
            ${fmt.naira(totals.subtotal)}
          </td>

        </tr>


        <tr class="t-sub">

          <td>
            VAT (7.5%)
          </td>

          <td>
            ${fmt.naira(totals.vat)}
          </td>

        </tr>


        <tr class="t-grand">

          <td>
            GRAND TOTAL
          </td>

          <td>
            ${fmt.naira(totals.grandTotal)}
          </td>

        </tr>

      </table>

    </div>

    `
        : `

    <div style="
      text-align:center;
      padding:24px;
      color:var(--muted);
      font-size:8.5pt;
      background:var(--stone);
      border-radius:6px;
      border:1px dashed var(--rule);
      margin-bottom:14px;
    ">

      No line items have been added
      to this quotation.

    </div>

    `
    }


    <!-- PAYMENT / INCLUDED -->

    <div class="two-col">


      <div>

        <div class="section-label">
          Payment Terms
        </div>

        <div class="info-box">

          <p>

            ${
              paymentTerms
                ? escHtml(paymentTerms)
                : "To be agreed between parties."
            }

          </p>

        </div>

      </div>


      <div>

        <div class="section-label">
          What's Included
        </div>

        <div class="info-box">

          <ul class="check-list">

            <li>
              <span class="ic">
                ${ICON.check}
              </span>

              Supply and installation
              of all listed components
            </li>

            <li>
              <span class="ic">
                ${ICON.check}
              </span>

              Commissioning and
              system testing
            </li>

            <li>
              <span class="ic">
                ${ICON.check}
              </span>

              Basic user training
              on system operation
            </li>

            <li>
              <span class="ic">
                ${ICON.check}
              </span>

              As-built documentation
            </li>

          </ul>

        </div>

      </div>


    </div>


    <!-- EXCLUDED / NOTES -->

    <div class="two-col">


      <div>

        <div class="section-label">
          What's Excluded
        </div>

        <div class="info-box">

          <ul class="check-list">

            <li>

              <span class="ic">
                ${ICON.x}
              </span>

              Civil or structural works

            </li>


            <li>

              <span class="ic">
                ${ICON.x}
              </span>

              Electrical upgrades
              beyond stated scope

            </li>


            <li>

              <span class="ic">
                ${ICON.x}
              </span>

              Permits and
              regulatory filings

            </li>


            <li>

              <span class="ic">
                ${ICON.x}
              </span>

              Annual maintenance
              (quoted separately)

            </li>

          </ul>

        </div>

      </div>


      ${
        notes
          ? `

      <div>

        <div class="section-label">
          Notes
        </div>

        <div class="info-box">

          <p>
            ${escHtml(notes)}
          </p>

        </div>

      </div>

      `
          : "<div></div>"
      }


    </div>


  </div>


  ${pageFooter(installer)}

</div>



<!-- ═══════════════════════════════════════════════════════════════════════════
     PAGE 4 — VALUE & PERFORMANCE
═══════════════════════════════════════════════════════════════════════════ -->

<div class="page">


  ${pageHeader({
    quoteRef,
    createdAt,
    page: "4 of 5",
  })}


  <div class="page-inner">


    <div class="section-heading">
      3. Value &amp; Performance
    </div>


    ${
      cashflow
        ? `


    <!-- FINANCIAL KPI BAR -->

    <div class="kpi-bar">


      <!-- PAYBACK -->

      <div class="kpi-card hl">

        <div class="kpi-icon">
          ${ICON.clock}
        </div>

        <div class="kpi-label">
          Payback Period
        </div>

        <div class="kpi-value">

          ${cashflow.paybackYears ?? "—"}

          <span style="
            font-size:9pt;
            font-weight:400;
          ">
            yrs
          </span>

        </div>

        <div class="kpi-sub">
          Simple payback
        </div>

      </div>


      <!-- 10 YEAR SAVINGS -->

      <div class="kpi-card">

        <div class="kpi-icon">
          ${ICON.trending}
        </div>

        <div class="kpi-label">
          10-Year Savings
        </div>

        <div
          class="kpi-value"
          style="font-size:11pt;"
        >

          ${fmt.nairaFull(cashflow.tenYearSavings)}

        </div>

        <div class="kpi-sub">
          vs. current energy cost
        </div>

      </div>


      <!-- NPV -->

      <div class="kpi-card">

        <div class="kpi-icon">
          ${ICON.calendar}
        </div>

        <div class="kpi-label">
          Net Present Value
        </div>

        <div
          class="kpi-value"
          style="font-size:11pt;"
        >

          ${fmt.nairaFull(cashflow.npvNaira)}

        </div>

        <div class="kpi-sub">
          At project end
        </div>

      </div>


      <!-- LIFETIME -->

      <div class="kpi-card">

        <div class="kpi-icon">
          ${ICON.shield}
        </div>

        <div class="kpi-label">
          Lifetime Savings
        </div>

        <div
          class="kpi-value"
          style="font-size:11pt;"
        >

          ${fmt.nairaFull(cashflow.lifetimeSavings)}

        </div>

        <div class="kpi-sub">

          Over
          ${cashflow.lifespan}
          -year lifespan

        </div>

      </div>


    </div>


    <!-- CASHFLOW + CHART -->

    <div style="
      display:grid;
      grid-template-columns:1.1fr 1fr;
      gap:14px;
      margin-bottom:14px;
    ">


      <!-- CASHFLOW TABLE -->

      <div>

        <div class="section-label">
          Cash Flow Overview
          (First 10 Years)
        </div>


        <table class="cashflow-table">

          <thead>

            <tr>

              <th>
                Year
              </th>

              <th class="r">
                Baseline Cost (₦)
              </th>

              <th class="r">
                Solar O&amp;M (₦)
              </th>

              <th class="r">
                Annual Saving (₦)
              </th>

              <th class="r">
                Cumulative (₦)
              </th>

            </tr>

          </thead>


          <tbody>

            ${cashflow.tableRows
              .map(
                (row) => `

            <tr>

              <td class="dark">
                ${row.year}
              </td>

              <td class="r mono">
                ${fmt.naira(row.baselineCost)}
              </td>

              <td class="r mono">
                ${fmt.naira(row.solarOpex)}
              </td>

              <td
                class="r mono ${row.annualSavings >= 0 ? "pos" : "neg"}"
              >

                ${fmt.naira(row.annualSavings)}

              </td>

              <td
                class="r mono ${row.cumulative >= 0 ? "pos" : "neg"}"
              >

                ${fmt.naira(row.cumulative)}

              </td>

            </tr>

            `,
              )
              .join("")}

          </tbody>

        </table>

      </div>


      <!-- CHART -->

      <div>

        <div class="section-label">
          Cumulative Savings Over Time
        </div>


        <div class="chart-wrap">

          <div class="chart-title">
            Cumulative Savings (₦)
          </div>

          ${buildCumulativeSvg(cashflow.tableRows)}

        </div>


        <!-- ASSUMPTIONS -->

        <div class="section-label">
          Key Assumptions
        </div>


        <div class="info-box">

          <ul class="check-list">

            <li>

              <span class="ic">
                ${ICON.check}
              </span>

              12% annual grid
              tariff escalation

            </li>


            <li>

              <span class="ic">
                ${ICON.check}
              </span>

              15% Diesel price
              escalation

            </li>


            <li>

              <span class="ic">
                ${ICON.check}
              </span>

              System lifespan:
              ${cashflow.lifespan}
              Years

            </li>


            <li>

              <span class="ic">
                ${ICON.check}
              </span>

              All values in
              Nigerian Naira (₦)

            </li>

          </ul>

        </div>

      </div>


    </div>


    `
        : `

    <div style="
      text-align:center;
      padding:40px;
      color:var(--muted);
      font-size:8.5pt;
      background:var(--stone);
      border-radius:6px;
      border:1px dashed var(--rule);
    ">

      Financial projections are generated
      once a consumption assessment is
      linked to this quotation.

    </div>

    `
    }


  </div>


  ${pageFooter(installer)}

</div>



<!-- ═══════════════════════════════════════════════════════════════════════════
     PAGE 5 — TERMS, WARRANTY & ACCEPTANCE
═══════════════════════════════════════════════════════════════════════════ -->

<div class="page">


  ${pageHeader({
    quoteRef,
    createdAt,
    page: "5 of 5",
  })}


  <div class="page-inner">


    <div class="section-heading">
      4. Terms, Warranty &amp; Acceptance
    </div>


    <!-- WARRANTY -->

    <div class="section-label">
      Warranty
    </div>


    <div class="warranty-grid">


      <!-- SOLAR PANELS -->

      <div class="warranty-card">

        <div class="wc-head">

          ${ICON.sun}

          <div class="wc-title">
            Solar Panels
          </div>

        </div>

        <div class="wc-sub">
          25-year performance warranty
        </div>

        <div>
          <span class="wc-duration">
            25 Years
          </span>
        </div>

      </div>


      <!-- INVERTER -->

      <div class="warranty-card">

        <div class="wc-head">

          ${ICON.bolt}

          <div class="wc-title">
            Inverter
          </div>

        </div>

        <div class="wc-sub">
          2–5 years
          (manufacturer warranty)
        </div>

        <div>
          <span class="wc-duration">
            2–5 Years
          </span>
        </div>

      </div>


      <!-- BATTERY -->

      <div class="warranty-card">

        <div class="wc-head">

          ${ICON.battery}

          <div class="wc-title">
            Battery
          </div>

        </div>

        <div class="wc-sub">
          5–10 years
          (subject to brand)
        </div>

        <div>
          <span class="wc-duration">
            5–10 Years
          </span>
        </div>

      </div>


      <!-- WORKMANSHIP -->

      <div class="warranty-card">

        <div class="wc-head">

          ${ICON.home}

          <div class="wc-title">
            Installation Workmanship
          </div>

        </div>

        <div class="wc-sub">
          12 months from
          commissioning date
        </div>

        <div>
          <span class="wc-duration">
            12 Months
          </span>
        </div>

      </div>


    </div>


    <!-- TERMS + TIMELINE -->

    <div class="two-col">


      <!-- TERMS -->

      <div>

        <div class="section-label">
          Terms
        </div>


        <div class="info-box">

          <ul class="check-list">


            <li>

              <span class="ic">
                ${ICON.check}
              </span>

              This quotation is valid
              until ${fmt.date(validityDate)}.

            </li>


            <li>

              <span class="ic">
                ${ICON.check}
              </span>

              Prices are subject to
              change after expiry due
              to component market
              fluctuations.

            </li>


            <li>

              <span class="ic">
                ${ICON.check}
              </span>

              A site assessment and
              final survey may be
              required before
              installation.

            </li>


            <li>

              <span class="ic">
                ${ICON.check}
              </span>

              Full terms &amp;
              conditions apply.

            </li>


          </ul>

        </div>

      </div>


      <!-- PROJECT TIMELINE -->

      <div>

        <div class="section-label">
          Project Timeline
        </div>


        <div
          class="timeline-grid"
          style="
            grid-template-columns:
            1fr 1fr;
          "
        >


          <div class="tl-item active">

            <div class="tl-phase">
              Site Assessment
            </div>

            <div class="tl-dur">
              1–2 Days
            </div>

          </div>


          <div class="tl-item active">

            <div class="tl-phase">
              Design &amp; Approval
            </div>

            <div class="tl-dur">
              2–3 Days
            </div>

          </div>


          <div class="tl-item active">

            <div class="tl-phase">
              Procurement
            </div>

            <div class="tl-dur">
              3–5 Days
            </div>

          </div>


          <div class="tl-item active">

            <div class="tl-phase">
              Installation
            </div>

            <div class="tl-dur">
              5–7 Days
            </div>

          </div>


          <div class="tl-item active">

            <div class="tl-phase">
              Testing &amp; Handover
            </div>

            <div class="tl-dur">
              1 Day
            </div>

          </div>


          <div
            class="tl-item"
            style="
              border-top-color:
              var(--amber);
            "
          >

            <div
              class="tl-phase"
              style="
                color:var(--amber);
              "
            >
              Total Estimated
            </div>

            <div
              class="tl-dur"
              style="
                color:var(--amber);
                font-weight:600;
              "
            >
              2–3 Weeks
            </div>

          </div>


        </div>

      </div>


    </div>


    <hr class="divider">


    <!-- ACCEPTANCE -->

    <div class="section-label">
      Acceptance
    </div>


    <p style="
      font-size:8pt;
      color:var(--mid);
      margin-bottom:10px;
    ">

      I/We accept this proposal and
      authorise
      ${escHtml(installer.company_name)}
      to proceed.

    </p>


    <!-- SIGNATURES -->

    <div class="sig-grid">


      <!-- CUSTOMER -->

      <div class="sig-box">

        <div class="sig-label">
          Customer
        </div>

        <div class="sig-name">
          ${escHtml(customer.name)}
        </div>

        <div class="sig-date">
          Signature:
          ________________________________
        </div>

        <div
          class="sig-date"
          style="margin-top:6px;"
        >
          Date:
          ____________________________
        </div>

      </div>


      <!-- INSTALLER -->

      <div class="sig-box">

        <div class="sig-label">

          For
          ${escHtml(installer.company_name)}

        </div>

        <div class="sig-name">
          Authorised Signatory
        </div>

        <div class="sig-date">
          Signature:
          ________________________________
        </div>

        <div
          class="sig-date"
          style="margin-top:6px;"
        >
          Date:
          ____________________________
        </div>

      </div>


    </div>


    <!-- CLOSING PANEL -->

    <div class="closing-panel">


      <div>

        <div class="close-msg">

          Thank you for choosing

          <span>
            ${escHtml(installer.company_name)}.
          </span>

        </div>


        <div class="close-sub">

          We look forward to powering
          your world sustainably.

        </div>

      </div>


      <div class="close-badge">
        gridscale.africa
      </div>


    </div>


  </div>


  ${pageFooter(installer)}

</div>


</body>

</html>`;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function escHtml(str) {
  if (str == null) return "";

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
