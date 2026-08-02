import { useEffect, useRef, useState, useCallback } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtNaira = (n) => {
  if (Math.abs(n) >= 1_000_000_000)
    return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${Math.round(n).toLocaleString()}`;
};

// Abbreviated for axis labels (no ₦ symbol, just magnitude)
const fmtAxis = (n) => {
  if (Math.abs(n) >= 1_000_000_000)
    return `₦${(n / 1_000_000_000).toFixed(0)}B`;
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(0)}M`;
  return `₦${(n / 1_000).toFixed(0)}K`;
};

// Resolve CSS variable value for use in canvas (which can't read CSS vars)
const resolveVar = (name, fallback) => {
  if (typeof window === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return val || fallback;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SERIES_COLORS = {
  baseline: "#64748b", // slate — "the problem"
  solar: "#0d9488", // teal — "the solution"
  loan: "#f59e0b", // amber — "the financing option"
};

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub, highlight = false }) {
  return (
    <div
      className={`rounded-xl px-3 py-3 ${highlight ? "bg-teal-50 border border-teal-100" : "bg-gray-50"}`}
    >
      <p
        className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${highlight ? "text-teal-600" : "text-gray-400"}`}
      >
        {label}
      </p>
      <p
        className={`text-xl font-bold font-mono leading-none ${highlight ? "text-teal-700" : "text-gray-900"}`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-[11px] mt-1 ${highlight ? "text-teal-500" : "text-gray-400"}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

function Legend({ hasLoan }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <LegendItem color={SERIES_COLORS.baseline} label="Diesel + grid cost" />
      <LegendItem color={SERIES_COLORS.solar} label="Solar (cumulative)" />
      {hasLoan && (
        <LegendItem color={SERIES_COLORS.loan} label="Solar + loan" dashed />
      )}
    </div>
  );
}

function LegendItem({ color, label, dashed = false }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span
        style={{
          display: "inline-block",
          width: "20px",
          height: "2px",
          background: dashed ? "transparent" : color,
          borderTop: dashed ? `2px dashed ${color}` : "none",
          borderRadius: "1px",
        }}
      />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ScenarioStrip
// ---------------------------------------------------------------------------

function ScenarioStrip({ scenarios, currentCrossover }) {
  if (!scenarios || scenarios.length === 0) return null;

  const current = scenarios.find((s) => s.label === "Current");

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
        Payback period by diesel price
      </p>
      <div className="grid grid-cols-3 gap-2">
        {scenarios.map((s) => {
          const isCurrent = s.label === "Current";
          return (
            <div
              key={s.label}
              className={`rounded-xl px-3 py-2.5 text-center border ${
                isCurrent
                  ? "border-teal-200 bg-teal-50"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <p
                className={`text-[11px] mb-1 ${isCurrent ? "text-teal-600" : "text-gray-400"}`}
              >
                {s.label}
                <span className="font-mono ml-1">
                  {fmtNaira(s.dieselPrice)}/L
                </span>
              </p>
              <p
                className={`text-base font-bold font-mono ${isCurrent ? "text-teal-700" : "text-gray-700"}`}
              >
                {s.crossoverYear ?? "—"}
                <span className="text-xs font-normal ml-1">yrs</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EscalationSlider
// ---------------------------------------------------------------------------

function EscalationSlider({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 mt-3">
      <p className="text-xs text-gray-500 shrink-0">Diesel escalation</p>
      <input
        type="range"
        min={5}
        max={30}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-amber-500"
        aria-label="Diesel price escalation rate"
      />
      <span className="text-xs font-semibold font-mono text-gray-700 min-w-[36px] text-right">
        {value}%/yr
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AssumptionsPanel
// ---------------------------------------------------------------------------

function AssumptionsPanel({ meta }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d={open ? "M2 8l4-4 4 4" : "M2 4l4 4 4-4"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Assumptions
      </button>

      {open && (
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            ["Diesel price", `${fmtNaira(meta.dieselPriceUsed)}/L`],
            ["Grid tariff", `₦${meta.gridTariffUsed}/kWh`],
            [
              "Diesel escalation",
              `${(meta.dieselEscalation * 100).toFixed(0)}%/yr`,
            ],
            [
              "Grid escalation",
              `${(meta.gridEscalation * 100).toFixed(0)}%/yr`,
            ],
            ["Daily demand", `${meta.dailyKwhDemand} kWh`],
            ["Grid hrs/day", `${meta.gridHoursPerDay}h`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[11px] py-0.5">
              <span className="text-gray-400">{k}</span>
              <span className="text-gray-600 font-mono">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CashflowChart
// ---------------------------------------------------------------------------

export function CashflowChart({
  projection,
  className = "",
  showScenarios = true,
  scenarios = null,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [escalation, setEscalation] = useState(
    Math.round((projection?.meta?.dieselEscalation ?? 0.15) * 100),
  );

  const { yearly, summary, meta, financing } = projection ?? {};

  // Recompute a preview curve client-side when escalation slider moves.
  // This doesn't hit the API — it re-runs the same arithmetic locally
  // so the chart responds instantly. The frozen DB result is unaffected.
  const getChartData = useCallback(
    (dieselEscRate = escalation / 100) => {
      if (!yearly || !meta) return null;

      // Recompute cumulative costs with the new escalation rate
      const annualDiesel0 = yearly[0].annualDieselCost;
      const annualGrid0 = yearly[0].annualGridCost;
      const gridEsc = meta.gridEscalation;
      const capex = meta.capexNaira;

      let cumBase = 0;
      let cumSolar = capex;
      let cumLoan = financing ? (financing.downPayment ?? 0) : capex;

      const labels = [];
      const baseline = [];
      const solar = [];
      const loanLine = [];

      yearly.forEach((row, i) => {
        const y = i + 1;
        const annualBase =
          annualDiesel0 * Math.pow(1 + dieselEscRate, i) +
          annualGrid0 * Math.pow(1 + gridEsc, i);
        const opex =
          row.annualSolarOpex -
          (i === 0 ? 0 : (yearly[i - 1]?.annualGridCost ?? 0)) +
          annualGrid0 * Math.pow(1 + gridEsc, i);

        cumBase += annualBase;
        cumSolar += opex;

        if (financing) {
          const repayment =
            y <= Math.ceil(financing.termMonths / 12)
              ? financing.monthlyRepayment *
                Math.min(12, financing.termMonths - (y - 1) * 12)
              : 0;
          cumLoan += repayment + opex;
        }

        labels.push(`Yr ${y}`);
        baseline.push(Math.round(cumBase));
        solar.push(Math.round(cumSolar));
        if (financing) loanLine.push(Math.round(cumLoan));
      });

      return { labels, baseline, solar, loanLine: financing ? loanLine : null };
    },
    [yearly, meta, financing, escalation],
  );

  // Build / rebuild the Chart.js instance
  useEffect(() => {
    if (!canvasRef.current || !yearly) return;

    // Destroy previous instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const tickColor = resolveVar("--text-muted", "#898781");
    const tooltipBg = isDark ? "#2c2c2a" : "#ffffff";
    const tooltipBdr = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
    const tooltipTxt = isDark ? "#ffffff" : "#0b0b0b";
    const tooltipSub = isDark ? "#c3c2b7" : "#52514e";

    const d = getChartData();
    if (!d) return;

    const crossoverIdx = d.solar.findIndex((v, i) => v < d.baseline[i]);

    const datasets = [
      {
        label: "Diesel + grid",
        data: d.baseline,
        borderColor: SERIES_COLORS.baseline,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: SERIES_COLORS.baseline,
        tension: 0.25,
        fill: false,
      },
      {
        label: "Solar",
        data: d.solar,
        borderColor: SERIES_COLORS.solar,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: SERIES_COLORS.solar,
        tension: 0.25,
        // Fill the savings area between the curves (below baseline, above solar)
        fill: {
          target: 0,
          above: "rgba(13,148,136,0)",
          below: "rgba(13,148,136,0.07)",
        },
      },
    ];

    if (d.loanLine) {
      datasets.push({
        label: "Solar + loan",
        data: d.loanLine,
        borderColor: SERIES_COLORS.loan,
        borderWidth: 1.5,
        borderDash: [5, 3],
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: SERIES_COLORS.loan,
        tension: 0.25,
        fill: false,
      });
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: { labels: d.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            borderColor: tooltipBdr,
            borderWidth: 1,
            titleColor: tooltipTxt,
            bodyColor: tooltipSub,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${fmtNaira(ctx.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              maxTicksLimit: 7,
              autoSkip: true,
            },
          },
          y: {
            grid: { color: gridColor, lineWidth: 1 },
            border: { display: false },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              callback: (v) => fmtAxis(v),
            },
          },
        },
      },
    });

    // Draw the crossover annotation manually — Chart.js annotation
    // plugin isn't bundled; we draw it via afterDraw hook
    if (crossoverIdx >= 0) {
      const plugin = {
        id: "crossoverLine",
        afterDraw(chart) {
          const {
            ctx,
            chartArea: { top, bottom },
            scales: { x },
          } = chart;
          const xPos = x.getPixelForValue(crossoverIdx);

          ctx.save();
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = SERIES_COLORS.loan;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.stroke();
          ctx.restore();

          // Label
          ctx.save();
          const label = `Crossover yr ${crossoverIdx + 1}`;
          const padding = 5;
          ctx.font = "500 11px system-ui, sans-serif";
          const tw = ctx.measureText(label).width;
          const bx = xPos + 6;
          const by = top + 8;

          ctx.fillStyle = "rgba(245,158,11,0.12)";
          ctx.beginPath();
          ctx.roundRect?.(bx - padding, by - 2, tw + padding * 2, 18, 3);
          ctx.fill();

          ctx.fillStyle = "#b45309";
          ctx.fillText(label, bx, by + 11);
          ctx.restore();
        },
      };

      chartRef.current.options._crossoverIdx = crossoverIdx;
      Chart.registry.plugins.register(plugin);
      chartRef.current.update();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [projection]); // Rebuild only when projection changes, not escalation

  // Live-update chart data when escalation slider changes
  useEffect(() => {
    if (!chartRef.current) return;
    const d = getChartData(escalation / 100);
    if (!d) return;

    chartRef.current.data.labels = d.labels;
    chartRef.current.data.datasets[0].data = d.baseline;
    chartRef.current.data.datasets[1].data = d.solar;
    if (d.loanLine && chartRef.current.data.datasets[2]) {
      chartRef.current.data.datasets[2].data = d.loanLine;
    }
    chartRef.current.update("none"); // 'none' = skip animation for live updates
  }, [escalation, getChartData]);

  if (!projection) return null;

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}
    >
      {/* Header */}
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
        25-year cashflow projection
      </p>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <StatCard
          label="Payback"
          value={
            summary.simplePaybackYears
              ? `${summary.simplePaybackYears} yrs`
              : "—"
          }
          sub="Simple payback period"
          highlight
        />
        <StatCard
          label="10-yr savings"
          value={fmtNaira(summary.tenYearSavingsNaira)}
          sub="vs diesel + grid"
        />
        <StatCard
          label="25-yr savings"
          value={fmtNaira(summary.lifetimeSavingsNaira)}
          sub={`ROI ${summary.roiPercent}%`}
        />
        <StatCard
          label="Monthly saving"
          value={fmtNaira(summary.monthlyEquivalentSavingYear1)}
          sub="Year 1 equivalent"
        />
      </div>

      {/* Financing callout — show when loan was computed */}
      {financing && (
        <div className="flex items-center gap-3 mb-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          <div>
            <span className="text-xs font-semibold text-amber-800">
              Financing option:{" "}
            </span>
            <span className="text-xs text-amber-700">
              {fmtNaira(financing.monthlyRepayment)}/month over{" "}
              {Math.round(financing.termMonths / 12)} years
            </span>
          </div>
          {summary.loanCrossoverYear && (
            <span className="ml-auto text-xs text-amber-600 font-mono shrink-0">
              Crossover yr {summary.loanCrossoverYear}
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      <Legend hasLoan={!!financing} />

      {/* Chart */}
      <div
        style={{ position: "relative", width: "100%", height: "260px" }}
        className="mt-3"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Cashflow projection over 25 years. Solar costs cross below diesel and grid costs at year ${summary.crossoverYear ?? "unknown"}, saving ${fmtNaira(summary.lifetimeSavingsNaira)} over the system lifetime.`}
        >
          {`Without solar: ₦${fmtNaira(summary.currentAnnualSpend)} per year in fuel and grid costs, escalating annually. With solar: initial investment of ${fmtNaira(meta.capexNaira)}, then low maintenance costs. Crossover at year ${summary.crossoverYear}.`}
        </canvas>
      </div>

      {/* Escalation slider */}
      <EscalationSlider value={escalation} onChange={setEscalation} />

      {/* Scenario strip */}
      {showScenarios && scenarios && (
        <ScenarioStrip
          scenarios={scenarios}
          currentCrossover={summary.crossoverYear}
        />
      )}

      {/* Assumptions panel */}
      <AssumptionsPanel meta={meta} />
    </div>
  );
}
