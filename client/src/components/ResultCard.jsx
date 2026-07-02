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
import LeadModal from "./LeadModal";

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

/* ─── MetricCard ─────────────────────────────────────────────── */
const MetricCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
  highlight,
  warn,
}) => (
  <div
    className={`rounded-2xl p-5 flex flex-col gap-2 border ${
      highlight
        ? "bg-teal-600 border-teal-500"
        : warn
          ? "bg-amber-50 border-amber-100"
          : "bg-white border-gray-100"
    }`}
  >
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
        highlight ? "bg-teal-500" : warn ? "bg-amber-100" : iconBg
      }`}
    >
      <Icon
        size={16}
        className={
          highlight ? "text-white" : warn ? "text-amber-600" : iconColor
        }
        strokeWidth={1.8}
      />
    </div>
    <p
      className={`text-xs font-semibold uppercase tracking-widest mt-1 ${
        highlight ? "text-teal-200" : warn ? "text-amber-600" : "text-gray-400"
      }`}
    >
      {label}
    </p>
    <p
      className={`font-display font-extrabold text-2xl leading-none ${
        highlight ? "text-white" : warn ? "text-amber-800" : "text-gray-900"
      }`}
    >
      {value}
    </p>
    {sub && (
      <p
        className={`text-xs ${
          highlight
            ? "text-teal-200"
            : warn
              ? "text-amber-600"
              : "text-gray-400"
        }`}
      >
        {sub}
      </p>
    )}
  </div>
);

/* ─── ResultCard ─────────────────────────────────────────────── */
export default function ResultCard({ result, lifespan }) {
  const { energy, grid, generator, solar, comparison } = result;
  const [animated, setAnimated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const lifespanYears = lifespan || 25;

  /* ── Destructure new backend fields ── */
  const {
    solarStatus = "viable",
    solarInsight = null,
    paybackExceedsLifespan = false,
    breakEvenCapex = null,
    comparedAgainst = null,
    currentReality = null,
    savingsVsReality = null,
  } = comparison;

  const isSolarViable = solarStatus === "viable" && !paybackExceedsLifespan;
  const hasBothSources = !!(grid && generator);

  /* Primary savings — combined reality when both sources present */
  const primarySavings = hasBothSources
    ? (savingsVsReality ?? comparison.savingsPerYear)
    : comparison.savingsPerYear;
  const primarySavingsPositive = primarySavings > 0;
  const lifetimePrimarySavings =
    isSolarViable && primarySavingsPositive
      ? primarySavings * lifespanYears
      : 0;

  /* Comparison label — use backend value, fallback to local */
  const comparisonLabel = (
    comparedAgainst ??
    (hasBothSources ? "Grid + Generator" : grid ? "Grid" : "Generator")
  ).toLowerCase();

  /* ── Source rows ── */
  const allSources = [
    grid && {
      icon: Zap,
      label: "Grid",
      monthly: grid.monthlyCost,
      annual: grid.annualCost,
      barColor: "from-yellow-400 to-yellow-300",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      // gridKWh lives on energy, not on grid
      detail:
        energy.gridKWh != null
          ? `${energy.gridHoursPerDay}hrs/day · ${fmtKwh(energy.gridKWh)} kWh/yr`
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
      // offGridKWh lives on energy, not on generator
      detail:
        energy.offGridKWh != null
          ? `${24 - energy.gridHoursPerDay}hrs/day · ${fmtKwh(energy.offGridKWh)} kWh/yr · ${fmt(generator.costPerKWh)}/kWh`
          : `${fmt(generator.costPerKWh)}/kWh (incl. maintenance)`,
    },
    /* Combined "current reality" row — only when both sources present */
    hasBothSources &&
      currentReality != null && {
        icon: Zap,
        label: "Grid + Generator",
        monthly: currentReality / 12,
        annual: currentReality,
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

  /* Payback timeline — only render when viable and within lifespan */
  const paybackYears = comparison.paybackYears;
  const showTimeline =
    isSolarViable &&
    primarySavingsPositive &&
    paybackYears != null &&
    paybackYears <= lifespanYears;
  const paybackPct = showTimeline
    ? Math.min((paybackYears / lifespanYears) * 100, 100)
    : null;
  const pureSavingsYears = showTimeline
    ? Math.max(lifespanYears - paybackYears, 0)
    : null; // never negative

  /* Show diagnostic when solar costs more OR payback exceeds lifespan */
  const showDiagnostic =
    (comparison.savingsPerYear != null &&
      comparison.savingsPerYear < 0 &&
      (!hasBothSources || (savingsVsReality ?? 0) < 0)) ||
    paybackExceedsLifespan;

  return (
    <div className="space-y-4 mt-2">
      {/* ── ZONE 1: HERO SAVINGS ── */}
      <div
        className={`rounded-2xl overflow-hidden ${
          primarySavingsPositive && isSolarViable
            ? "bg-gray-950"
            : "bg-slate-800"
        }`}
      >
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Solar Savings Summary
          </p>
          <span className="text-xs font-semibold bg-teal-900 text-teal-400 px-3 py-1 rounded-full">
            vs {comparisonLabel}
          </span>
        </div>

        <div className="px-6 py-6 text-center">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Annual Savings
          </p>
          <p
            className="font-display font-extrabold leading-none mb-3"
            style={{
              fontSize: "clamp(3rem, 10vw, 5rem)",
              ...(primarySavingsPositive && isSolarViable
                ? {
                    background:
                      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 50%, #0f766e 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }
                : { color: "#64748b" }),
            }}
          >
            {fmtShort(Math.abs(primarySavings ?? 0))}
          </p>
          <p
            className={`text-sm max-w-xs mx-auto leading-relaxed ${
              primarySavingsPositive && isSolarViable
                ? "text-gray-400"
                : "text-slate-400"
            }`}
          >
            {primarySavingsPositive && isSolarViable
              ? `saved every year by switching from ${comparisonLabel} to solar`
              : solarInsight || "solar does not reduce costs at current inputs"}
          </p>

          {/* Secondary breakdown line when both sources present */}
          {hasBothSources &&
            primarySavingsPositive &&
            isSolarViable &&
            comparison.savingsPerYear !== primarySavings && (
              <p className="text-xs text-gray-600 mt-2">
                ({fmtShort(comparison.savingsPerYear)}/yr vs grid alone ·{" "}
                {fmtShort((savingsVsReality ?? 0) - comparison.savingsPerYear)}{" "}
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
          icon={paybackExceedsLifespan ? AlertTriangle : Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Payback Period"
          warn={paybackExceedsLifespan}
          value={
            paybackExceedsLifespan
              ? "Exceeds lifespan"
              : paybackYears
                ? `${paybackYears.toFixed(1)} yrs`
                : "—"
          }
          sub={
            paybackExceedsLifespan
              ? `${Math.round(paybackYears ?? 0)} yrs needed vs ${lifespanYears} yr system`
              : paybackYears
                ? "to break even on solar"
                : solarStatus === "low_usage"
                  ? "usage too low for solar ROI"
                  : solarStatus === "oversized"
                    ? "system oversized for load"
                    : "not applicable"
          }
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
                        className={`font-display font-bold text-sm ${
                          best
                            ? "text-teal-700"
                            : isReality
                              ? "text-gray-500"
                              : "text-gray-700"
                        }`}
                      >
                        {fmtShort(monthly)}/mo
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {fmtShort(annual)}/yr
                      </span>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-linear-to-r ${barColor} transition-all duration-700 ease-out ${isReality ? "opacity-40" : ""}`}
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

      {/* ── ZONE 4: PAYBACK TIMELINE ─────────────────────────────────
          Only renders when solar is viable AND payback is within lifespan.
          Guards against negative "pure savings" years.
      ─────────────────────────────────────────────────────────── */}
      {showTimeline && paybackPct !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            ⏳ Payback Timeline
          </p>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Year 0</span>
            <span className="font-semibold text-gray-600">
              Break-even: Yr {paybackYears.toFixed(1)}
            </span>
            <span>Year {lifespanYears}</span>
          </div>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-l-full bg-linear-to-r from-gray-300 to-gray-400 transition-all duration-700 ease-out"
              style={{ width: animated ? `${paybackPct}%` : "0%" }}
            />
            <div
              className="absolute inset-y-0 rounded-r-full bg-linear-to-r from-teal-400 to-teal-600 transition-all duration-700 ease-out"
              style={{ left: animated ? `${paybackPct}%` : "100%", right: 0 }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-white z-10 transition-all duration-700 ease-out"
              style={{ left: animated ? `${paybackPct}%` : "0%" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-semibold text-gray-400">
              ← Paying back ({paybackYears.toFixed(1)} yrs)
            </span>
            {/* pureSavingsYears is always >= 0 — guarded above */}
            <span className="text-xs font-semibold text-teal-600">
              Pure savings ({pureSavingsYears.toFixed(1)} yrs) →
            </span>
          </div>
        </div>
      )}

      {/* ── DIAGNOSTIC CARD ──────────────────────────────────────────
          Triggers when:
          - savingsPerYear < 0 (solar more expensive than baseline), OR
          - paybackExceedsLifespan (solar never pays back within its lifetime)
      ─────────────────────────────────────────────────────────── */}
      {showDiagnostic && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
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
                {paybackExceedsLifespan
                  ? `Solar will not break even within its ${lifespanYears}-year lifespan`
                  : `Solar is more expensive than ${comparison.comparedAgainst ?? "your current source"} at this usage level`}
              </p>
              <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                {solarInsight ||
                  (paybackExceedsLifespan
                    ? `The system takes an estimated ${Math.round(paybackYears ?? 0)} years to pay back but is only rated for ${lifespanYears} years.`
                    : "Your annualised solar cost exceeds what you'd pay on your current source. This usually means the system is oversized for your current load.")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-amber-100 border-b border-amber-100">
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                Solar annualised cost
              </p>
              <p className="font-display font-bold text-amber-900 text-xl">
                {fmtShort(solar.annualCost)}
                <span className="text-sm font-normal text-amber-600">/yr</span>
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                ₦{Math.round(solar.costPerKWh)}/kWh
              </p>
            </div>
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                {comparison.comparedAgainst ?? "Baseline"} annual cost
              </p>
              <p className="font-display font-bold text-amber-900 text-xl">
                {fmtShort(
                  hasBothSources && currentReality != null
                    ? currentReality
                    : comparison.comparedAgainst === "Generator"
                      ? generator?.annualCost
                      : grid?.annualCost,
                )}
                <span className="text-sm font-normal text-amber-600">/yr</span>
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {paybackExceedsLifespan
                  ? `savings exist but payback takes ${Math.round(paybackYears ?? 0)} yrs`
                  : `currently cheaper by ${fmtShort(Math.abs(comparison.savingsPerYear ?? 0))}/yr`}
              </p>
            </div>
          </div>

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
                  <strong>Add more appliances</strong> — if you left out devices
                  like AC, pumps, or office equipment, your real load is higher
                  and solar becomes more competitive.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight
                  size={14}
                  className="text-amber-500 mt-0.5 shrink-0"
                />
                <span>
                  <strong>Reduce the system CAPEX</strong> — a smaller system
                  sized to your actual load will have a better cost-per-kWh.
                  {breakEvenCapex != null && (
                    <span className="block mt-1 font-semibold text-amber-900">
                      At your current load, a system costing up to{" "}
                      {fmtShort(breakEvenCapex)} would break even within{" "}
                      {lifespanYears} years.
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

      {/* ── ZONE 5: FINAL CTA ────────────────────────────────────────
          Only recommends solar when it's actually the viable choice.
          Shows a neutral message when solar is not viable.
      ─────────────────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isSolarViable ? "bg-teal-600" : "bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isSolarViable ? "bg-teal-500" : "bg-gray-200"
            }`}
          >
            <Award
              size={22}
              className={isSolarViable ? "text-white" : "text-gray-500"}
              strokeWidth={1.8}
            />
          </div>
          <div>
            <p
              className={`font-display font-bold text-lg leading-tight ${
                isSolarViable ? "text-white" : "text-gray-700"
              }`}
            >
              {isSolarViable
                ? `Go Solar — save ${fmtShort(primarySavings)}/yr`
                : `${comparison.cheapestSource} is your best option right now`}
            </p>
            <p
              className={`text-sm mt-0.5 ${
                isSolarViable ? "text-teal-200" : "text-gray-500"
              }`}
            >
              {isSolarViable
                ? "Best option based on your usage and inputs"
                : "Adjust your inputs or add more appliances to explore solar viability"}
            </p>
          </div>
        </div>
        {isSolarViable && (
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 bg-white text-teal-700 font-bold text-sm px-5 py-3 rounded-xl hover:bg-teal-50 transition-colors whitespace-nowrap shadow-sm"
          >
            Get Solar Quote →
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          ℹ️ These are indicative estimates to support decision-making, not
          guaranteed prices or savings. Generator costs include a 10% overhead
          for maintenance, oil changes, and servicing. Energy consumption
          estimates include a 25% buffer for secondary appliances and a 20%
          allowance for system losses.
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

      {/* Lead submission modal */}
      <LeadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        calculatorResult={result}
        savingsSummary={
          primarySavingsPositive && isSolarViable
            ? fmtShort(primarySavings)
            : undefined
        }
      />
    </div>
  );
}
