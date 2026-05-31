import { useState, useEffect } from "react";
import {
  Sun,
  Zap,
  Fuel,
  TrendingDown,
  Clock,
  Wallet,
  Award,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

/* ─── Formatters ─────────────────────────────────────────────── */
const fmt = (v) =>
  v != null
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(v)
    : "—";

const fmtShort = (v) => {
  if (v == null) return "—";
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
  return `₦${Math.round(v)}`;
};

const fmtKwh = (v) =>
  v != null ? v.toLocaleString("en-NG", { maximumFractionDigits: 1 }) : "—";

/* ─── Solar insight for zero savings only (negative handled by DiagnosticCard) */
const getSolarInsight = (savingsPerYear, paybackMessage) => {
  if (paybackMessage && savingsPerYear === 0) return paybackMessage;
  return null;
};

/* ─── Metric Card ────────────────────────────────────────────── */
const MetricCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
  highlight,
}) => (
  <div
    className={`rounded-2xl p-5 flex flex-col gap-2 border ${highlight ? "bg-teal-600 border-teal-500" : "bg-white border-gray-100"}`}
  >
    <div
      className={`w-9 h-9 rounded-xl ${highlight ? "bg-teal-500" : iconBg} flex items-center justify-center`}
    >
      <Icon
        size={16}
        className={highlight ? "text-white" : iconColor}
        strokeWidth={1.8}
      />
    </div>
    <p
      className={`text-xs font-semibold uppercase tracking-widest mt-1 ${highlight ? "text-teal-200" : "text-gray-400"}`}
    >
      {label}
    </p>
    <p
      className={`font-display font-extrabold text-2xl leading-none ${highlight ? "text-white" : "text-gray-900"}`}
    >
      {value}
    </p>
    {sub && (
      <p className={`text-xs ${highlight ? "text-teal-200" : "text-gray-400"}`}>
        {sub}
      </p>
    )}
  </div>
);

/* ─── ResultCard ─────────────────────────────────────────────── */
export default function ResultCard({ result, lifespan }) {
  const { energy, grid, generator, solar, comparison } = result;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const lifespanYears = lifespan || 25;

  // When both grid and generator are present, the honest primary comparison
  // is solar vs the combined spend (what the user actually pays today)
  const hasBothSources = !!(grid && generator);
  const primarySavings = hasBothSources
    ? (comparison.savingsVsReality ?? comparison.savingsPerYear)
    : comparison.savingsPerYear;
  const primarySavingsPositive = primarySavings > 0;
  const lifetimePrimarySavings = primarySavingsPositive
    ? primarySavings * lifespanYears
    : 0;

  /* Sources — only what the backend returned */
  const allSources = [
    grid && {
      icon: Zap,
      label: "Grid",
      monthly: grid.monthlyCost,
      annual: grid.annualCost,
      barColor: "from-yellow-400 to-yellow-300",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      detail:
        grid.gridKWh != null
          ? `${energy.gridHoursPerDay}hrs/day · ${fmtKwh(grid.gridKWh)} kWh/yr`
          : "Utility tariff",
    },
    generator && {
      icon: Fuel,
      label: "Generator",
      monthly: generator.monthlyCost,
      annual: generator.annualCost,
      barColor: "from-orange-500 to-orange-300",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      detail:
        generator.offGridKWh != null
          ? `${24 - energy.gridHoursPerDay}hrs/day · ${fmtKwh(generator.offGridKWh)} kWh/yr · ${fmt(generator.costPerKWh)}/kWh`
          : `${fmt(generator.costPerKWh)}/kWh (incl. maintenance)`,
    },
    // Combined "current reality" row — only when both sources are present
    hasBothSources &&
      comparison.currentReality != null && {
        icon: Zap,
        label: "Grid + Generator",
        monthly: comparison.currentReality / 12,
        annual: comparison.currentReality,
        barColor: "from-red-400 to-orange-400",
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        detail: "Your actual combined spend today",
        isReality: true,
      },
    {
      icon: Sun,
      label: "Solar",
      monthly: solar.monthlyCost,
      annual: solar.annualCost,
      barColor: "from-teal-600 to-teal-400",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      detail: `${fmt(solar.costPerKWh)}/kWh · covers full 24hrs`,
    },
  ].filter(Boolean);

  const maxCost = Math.max(...allSources.map((s) => s.annual));
  const cheapestCost = Math.min(...allSources.map((s) => s.annual));

  /* Headline multiplier */
  const mostExpensive = allSources.reduce((a, b) =>
    a.annual > b.annual ? a : b,
  );
  const multiplier =
    solar.annualCost > 0
      ? (mostExpensive.annual / solar.annualCost).toFixed(1)
      : null;
  const showHeadline =
    multiplier &&
    parseFloat(multiplier) > 1.1 &&
    mostExpensive.label !== "Solar";

  /* Payback */
  const paybackYears = comparison.paybackYears;
  const paybackPct = paybackYears
    ? Math.min((paybackYears / lifespanYears) * 100, 100)
    : null;

  const solarInsight = getSolarInsight(
    comparison.savingsPerYear,
    comparison.paybackMessage,
  );

  const comparisonLabel = hasBothSources
    ? "grid + generator"
    : grid
      ? "grid"
      : "generator";

  return (
    <div className="space-y-4 mt-2">
      {/* ── ZONE 1: HERO SAVINGS ── */}
      <div
        className={`rounded-2xl overflow-hidden ${primarySavingsPositive ? "bg-gray-950" : "bg-slate-800"}`}
      >
        {/* Top label bar */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Solar Savings Summary
          </p>
          <span className="text-xs font-semibold bg-teal-900 text-teal-400 px-3 py-1 rounded-full">
            vs {comparisonLabel}
          </span>
        </div>

        {/* Hero number */}
        <div className="px-6 py-6 text-center">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Annual Savings
          </p>
          <p
            className="font-display font-extrabold leading-none mb-3"
            style={{
              fontSize: "clamp(3rem, 10vw, 5rem)",
              ...(primarySavingsPositive
                ? {
                    background:
                      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 50%, #0f766e 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }
                : { color: "#64748b" }),
            }}
          >
            {fmtShort(Math.abs(primarySavings))}
          </p>
          <p
            className={`text-sm max-w-xs mx-auto leading-relaxed ${primarySavingsPositive ? "text-gray-400" : "text-slate-400"}`}
          >
            {primarySavingsPositive
              ? `saved every year by switching from ${comparisonLabel} to solar`
              : solarInsight || "solar does not reduce costs at current usage"}
          </p>
          {/* Secondary line: when both sources exist, also show grid-only savings */}
          {hasBothSources &&
            primarySavingsPositive &&
            comparison.savingsPerYear !== primarySavings && (
              <p className="text-xs text-gray-600 mt-2">
                (₦{fmtShort(comparison.savingsPerYear)}/yr vs grid alone ·{" "}
                {fmtShort(
                  (comparison.savingsVsReality ?? 0) -
                    comparison.savingsPerYear,
                )}{" "}
                more from replacing generator)
              </p>
            )}
        </div>

        {/* Energy consumption strip */}
        <div className="grid grid-cols-2 divide-x divide-white/5 border-t border-white/5">
          <div className="px-6 py-4 text-center">
            <p className="text-gray-600 text-xs mb-1">Monthly Usage</p>
            <p className="font-display font-bold text-white text-lg">
              {fmtKwh(energy.monthlyKWh)}{" "}
              <span className="text-sm font-normal text-gray-500">kWh</span>
            </p>
          </div>
          <div className="px-6 py-4 text-center">
            <p className="text-gray-600 text-xs mb-1">Annual Usage</p>
            <p className="font-display font-bold text-white text-lg">
              {fmtKwh(energy.annualKWh)}{" "}
              <span className="text-sm font-normal text-gray-500">kWh</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── ZONE 2: SNAPSHOT METRICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Payback Period"
          value={paybackYears ? `${paybackYears.toFixed(1)} yrs` : "—"}
          sub={paybackYears ? "to break even on solar" : "not applicable"}
        />
        <MetricCard
          icon={Wallet}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          label="Lifetime Savings"
          value={
            lifetimePrimarySavings > 0 ? fmtShort(lifetimePrimarySavings) : "—"
          }
          sub={`over ${lifespanYears} yrs vs ${comparisonLabel}`}
          highlight={lifetimePrimarySavings > 0}
        />
        <MetricCard
          icon={TrendingDown}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          label="Solar Cost/kWh"
          value={`₦${solar.costPerKWh != null ? Math.round(solar.costPerKWh) : "—"}`}
          sub="annualised · covers full 24hrs"
        />
      </div>

      {/* ── ZONE 3: COST COMPARISON BARS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            📊 Cost Comparison
          </p>
          {showHeadline && (
            <p className="font-display font-bold text-xl text-gray-900">
              Solar is <span className="text-teal-600">{multiplier}×</span>{" "}
              cheaper than your {mostExpensive.label.toLowerCase()}
            </p>
          )}
        </div>

        <div className="px-6 pb-6 pt-3 space-y-5">
          {allSources.map(
            ({
              icon: Icon,
              label,
              monthly,
              annual,
              barColor,
              iconBg,
              iconColor,
              detail,
              isReality,
            }) => {
              const best = !isReality && label === comparison.cheapestSource;
              const pct = maxCost > 0 ? (annual / maxCost) * 100 : 0;
              const pctDiff =
                !best && !isReality && cheapestCost > 0
                  ? Math.round(((annual - cheapestCost) / cheapestCost) * 100)
                  : null;

              return (
                <div
                  key={label}
                  className={isReality ? "border-t border-gray-100 pt-5" : ""}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
                      >
                        <Icon size={13} className={iconColor} />
                      </div>
                      <span
                        className={`text-sm font-semibold ${isReality ? "text-gray-500" : "text-gray-800"}`}
                      >
                        {label}
                      </span>
                      {isReality && (
                        <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                          Current reality
                        </span>
                      )}
                      {best && (
                        <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                          Cheapest
                        </span>
                      )}
                      {pctDiff !== null && pctDiff > 0 && (
                        <span className="text-xs bg-orange-50 text-orange-500 font-semibold px-2 py-0.5 rounded-full">
                          +{pctDiff}%
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-display font-bold text-sm ${best ? "text-teal-700" : isReality ? "text-gray-500" : "text-gray-700"}`}
                      >
                        {fmtShort(monthly)}/mo
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {fmtShort(annual)}/yr
                      </span>
                    </div>
                  </div>

                  {/* Gradient bar */}
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out ${isReality ? "opacity-40" : ""}`}
                      style={{ width: animated ? `${pct}%` : "0%" }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{detail}</p>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* ── ZONE 4: PAYBACK TIMELINE ── */}
      {primarySavingsPositive && paybackYears && paybackPct !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            ⏳ Payback Timeline
          </p>

          {/* Floating labels */}
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Year 0</span>
            <span className="font-semibold text-gray-600">
              Break-even: Yr {paybackYears.toFixed(1)}
            </span>
            <span>Year {lifespanYears}</span>
          </div>

          {/* Gradient progress bar */}
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            {/* Paying back zone */}
            <div
              className="absolute inset-y-0 left-0 rounded-l-full bg-gradient-to-r from-gray-300 to-gray-400 transition-all duration-700 ease-out"
              style={{ width: animated ? `${paybackPct}%` : "0%" }}
            />
            {/* Pure savings zone — fills the rest */}
            <div
              className="absolute inset-y-0 rounded-r-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-700 ease-out"
              style={{
                left: animated ? `${paybackPct}%` : "100%",
                right: 0,
              }}
            />
            {/* Break-even marker */}
            <div
              className="absolute inset-y-0 w-0.5 bg-white z-10 transition-all duration-700 ease-out"
              style={{ left: animated ? `${paybackPct}%` : "0%" }}
            />
          </div>

          {/* Zone labels */}
          <div className="flex justify-between mt-2">
            <span className="text-xs font-semibold text-gray-400">
              ← Paying back ({paybackYears.toFixed(1)} yrs)
            </span>
            <span className="text-xs font-semibold text-teal-600">
              Pure savings ({(lifespanYears - paybackYears).toFixed(1)} yrs) →
            </span>
          </div>
        </div>
      )}

      {/* Insight when savings are zero */}
      {!primarySavingsPositive && solarInsight && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-5">
          <p className="text-sm text-amber-700 leading-relaxed">
            💡 {solarInsight}
          </p>
        </div>
      )}

      {/* ── DIAGNOSTIC CARD: when solar is more expensive than comparison source ── */}
      {comparison.savingsPerYear < 0 &&
        (!hasBothSources || (comparison.savingsVsReality ?? 0) < 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-4 px-6 py-5 border-b border-amber-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle
                  size={18}
                  className="text-amber-600"
                  strokeWidth={1.8}
                />
              </div>
              <div>
                <p className="font-display font-bold text-amber-900 text-base">
                  Solar is more expensive than{" "}
                  {comparison.comparedAgainst ?? "your current source"} at this
                  usage level
                </p>
                <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                  Your annualised solar cost exceeds what you'd pay on{" "}
                  {(comparison.comparedAgainst ?? "grid").toLowerCase()}. This
                  usually means the system is oversized for your current load,
                  or your load entry is incomplete.
                </p>
              </div>
            </div>

            {/* Numbers breakdown */}
            <div className="grid grid-cols-2 divide-x divide-amber-100 border-b border-amber-100">
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                  Solar annualised cost
                </p>
                <p className="font-display font-bold text-amber-900 text-xl">
                  {fmtShort(solar.annualCost)}
                  <span className="text-sm font-normal text-amber-600">
                    /yr
                  </span>
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  ₦{Math.round(solar.costPerKWh)}/kWh
                </p>
              </div>
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                  {comparison.comparedAgainst ?? "Grid"} annual cost
                </p>
                <p className="font-display font-bold text-amber-900 text-xl">
                  {fmtShort(
                    comparison.comparedAgainst === "Generator"
                      ? generator?.annualCost
                      : grid?.annualCost,
                  )}
                  <span className="text-sm font-normal text-amber-600">
                    /yr
                  </span>
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  currently cheaper by{" "}
                  {fmtShort(Math.abs(comparison.savingsPerYear))}/yr
                </p>
              </div>
            </div>

            {/* What to do */}
            <div className="px-6 py-5 space-y-3">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                What you can do
              </p>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <ArrowRight
                    size={14}
                    className="text-amber-500 mt-0.5 shrink-0"
                  />
                  <span>
                    <strong>Add more appliances</strong> — if you left out
                    devices like AC, pumps, or office equipment, your real load
                    is higher and solar becomes more competitive.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight
                    size={14}
                    className="text-amber-500 mt-0.5 shrink-0"
                  />
                  <span>
                    <strong>Reduce the system CAPEX</strong> — a smaller,
                    cheaper system sized to your actual load will have a better
                    cost-per-kWh.
                    {comparison.breakEvenCapex != null && (
                      <span className="block mt-1 font-semibold text-amber-900">
                        At your current load, a system costing up to{" "}
                        {fmtShort(comparison.breakEvenCapex)} would break even
                        with{" "}
                        {(comparison.comparedAgainst ?? "grid").toLowerCase()}.
                      </span>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight
                    size={14}
                    className="text-amber-500 mt-0.5 shrink-0"
                  />
                  <span>
                    <strong>Check your grid tariff</strong> — if you're on a
                    higher NERC band (Band A ≈ ₦209/kWh), solar becomes
                    significantly more attractive.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

      {/* ── ZONE 5: FINAL CTA ── */}
      <div className="bg-teal-600 rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shrink-0">
            <Award size={22} className="text-white" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-tight">
              {comparison.cheapestSource === "Solar"
                ? `Go Solar — save ${fmtShort(primarySavings)}/yr`
                : `${comparison.cheapestSource} is your best option right now`}
            </p>
            <p className="text-teal-200 text-sm mt-0.5">
              {comparison.cheapestSource === "Solar"
                ? "Best option based on your usage and inputs"
                : "Solar may become viable as your energy load grows"}
            </p>
          </div>
        </div>
        <button className="shrink-0 bg-white text-teal-700 font-bold text-sm px-5 py-3 rounded-xl hover:bg-teal-50 transition-colors whitespace-nowrap shadow-sm">
          Get Solar Quote →
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          ℹ️ These are indicative estimates to support decision-making, not
          guaranteed prices or savings. Generator costs include a 10% overhead
          for maintenance, oil changes, and servicing.
          {energy.gridHoursPerDay < 24 && (
            <>
              {" "}
              Grid costs cover only the {energy.gridHoursPerDay}hrs/day of grid
              supply entered; generator costs cover the remaining{" "}
              {24 - energy.gridHoursPerDay}hrs. Solar covers the full 24hrs.
            </>
          )}{" "}
          Grid tariffs, fuel prices, and solar costs vary by location, supplier,
          and market conditions.
        </p>
      </div>
    </div>
  );
}
