import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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

/* ─── Market price constants (replace with backend values later) ─── */
const RICE_BAG_PRICE = 77_000; // ₦ per 50kg bag (mid-range, Lagos market)
const FUEL_LITRE_PRICE = 1_100; // ₦ per litre (petrol)

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

/* ─── Real-world equivalent ──────────────────────────────────── */
const getRealWorldEquivalent = (monthlyAmount) => {
  if (!monthlyAmount || monthlyAmount <= 0) return null;
  const rice = Math.round(monthlyAmount / RICE_BAG_PRICE);
  const fuel = Math.round(monthlyAmount / FUEL_LITRE_PRICE);
  if (rice >= 2) return `${rice} bags of rice`;
  if (fuel >= 20) return `${fuel} litres of fuel`;
  return null;
};

/* ─── Count-up hook (dependency-free) ────────────────────────── *
 * Ramps a number from 0 to `target` once `active` flips true.
 * Rides on the same `animated` state that already drives the bars,
 * so no extra scroll/observer wiring is needed.
 */
const useCountUp = (target, active, duration = 700) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target == null || !active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let startTime = null;
    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(target * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, active, duration]);

  return active && target != null ? value : 0;
};

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
export default function ResultCard({
  result: resultProp,
  lifespan: lifespanProp,
  calculatorInputs,
  onAdjustInputs,
}) {
  const { state } = useLocation();
  // Kept available for the route-state values used by related result views.
  // eslint-disable-next-line no-unused-vars
  const { result, lifespan, suggestedCapex, currentCapex, formValues } =
    state ?? {};
  const resolvedResult = result ?? resultProp;
  const resolvedLifespan = lifespan ?? lifespanProp;
  const { energy, grid, generator, solar, comparison } = resolvedResult;
  const [animated, setAnimated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const lifespanYears = resolvedLifespan || 25;

  /* ── Destructure backend fields ── */
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

  /* Primary savings */
  const primarySavings = hasBothSources
    ? (savingsVsReality ?? comparison.savingsPerYear)
    : comparison.savingsPerYear;
  const primarySavingsPositive = primarySavings > 0;
  const lifetimePrimarySavings =
    isSolarViable && primarySavingsPositive
      ? primarySavings * lifespanYears
      : 0;

  /* Monthly figures for loss-aversion framing */
  const monthlySavings = primarySavings != null ? primarySavings / 12 : null;
  const monthlyDrain =
    currentReality != null
      ? currentReality / 12
      : (grid?.monthlyCost ?? 0) + (generator?.monthlyCost ?? 0);

  /* Count-up values — ride on the same `animated` trigger as the bars */
  const animatedDrain = useCountUp(monthlyDrain, animated);
  const animatedSavings = useCountUp(monthlySavings, animated);
  const animatedLifetimeSavings = useCountUp(
    lifetimePrimarySavings > 0 ? lifetimePrimarySavings : null,
    animated,
  );

  /* R/* Real-world equivalents — only meaningful when generator is involved */
  const showFuelEquivalent = hasBothSources || comparedAgainst === "Generator";
  const drainEquivalent = showFuelEquivalent
    ? getRealWorldEquivalent(monthlyDrain)
    : null;
  const savingsEquivalent = showFuelEquivalent
    ? getRealWorldEquivalent(monthlySavings)
    : null;

  /* Comparison label */
  const comparisonLabel = (
    comparedAgainst ??
    (hasBothSources ? "Grid + Generator" : grid ? "Grid" : "Generator")
  ).toLowerCase();

  /* Break-even calendar year */
  const paybackYears = comparison.paybackYears;
  const breakEvenYear =
    paybackYears != null
      ? new Date().getFullYear() + Math.ceil(paybackYears)
      : null;

  /* ── Source rows ── */
  const allSources = [
    grid && {
      icon: Zap,
      label: "Grid",
      monthly: grid.monthlyCost,
      annual: grid.annualCost,
      barColor: "from-gray-400 to-gray-300",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
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
      detail:
        energy.offGridKWh != null
          ? `${energy.genHoursPerDay}hrs/day · ${fmtKwh(energy.offGridKWh)} kWh/yr · ${fmt(generator.costPerKWh)}/kWh`
          : `${fmt(generator.costPerKWh)}/kWh (incl. maintenance)`,
    },
    hasBothSources &&
      currentReality != null && {
        icon: Zap,
        label: "Grid + Generator",
        monthly: currentReality / 12,
        annual: currentReality,
        barColor: "from-red-400 to-orange-400",
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        detail: "What you're actually spending every month",
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

  /* Sort for display only — biggest bar first, so "solar is visibly
     smallest" reads instantly regardless of source count. Calcs above
     (maxCost, cheapestCost, mostExpensive) stay on the unsorted list. */
  const sortedSources = [...allSources].sort((a, b) => b.annual - a.annual);

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

  /* Payback timeline */
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
    : null;

  /* Diagnostic */
  const showDiagnostic =
    (comparison.savingsPerYear != null &&
      comparison.savingsPerYear < 0 &&
      (!hasBothSources || (savingsVsReality ?? 0) < 0)) ||
    paybackExceedsLifespan;

  const isSolarBestChoice =
    isSolarViable && comparison.cheapestSource === "Solar";

  const handleAdjustInputs = () => {
    if (typeof onAdjustInputs === "function") {
      onAdjustInputs();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 mt-2">
      {/* ── ZONE 1: HERO ── */}
      <div
        className={`rounded-2xl overflow-hidden ${
          primarySavingsPositive && isSolarViable
            ? "bg-gray-950"
            : "bg-slate-800"
        }`}
      >
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Your Energy Cost Breakdown
          </p>
          <span className="text-xs font-semibold bg-teal-900 text-teal-400 px-3 py-1 rounded-full">
            vs {comparisonLabel}
          </span>
        </div>

        <div className="px-6 py-6 text-center">
          {primarySavingsPositive && isSolarViable ? (
            <>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">
                You're currently spending
              </p>
              <p
                className="font-display font-extrabold leading-none mb-1"
                style={{
                  fontSize: "clamp(3rem, 10vw, 5rem)",
                  color: "#f87171",
                }}
              >
                {fmtShort(animatedDrain)}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                every month on energy — money that's gone for good
              </p>

              {drainEquivalent && (
                <p className="text-gray-600 text-xs mb-5">
                  That's roughly{" "}
                  <span className="text-gray-400 font-semibold">
                    {drainEquivalent}
                  </span>{" "}
                  every month, just to keep the lights on.
                </p>
              )}

              <div className="border-t border-white/5 pt-5 mt-1">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">
                  Solar stops the drain — saving you
                </p>
                <p
                  className="font-display font-extrabold leading-none mb-2"
                  style={{
                    fontSize: "clamp(2.5rem, 8vw, 4rem)",
                    background:
                      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 50%, #0f766e 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {fmtShort(animatedSavings)}/mo
                </p>
                {savingsEquivalent ? (
                  <p className="text-gray-600 text-xs">
                    That's{" "}
                    <span className="text-teal-500 font-semibold">
                      {savingsEquivalent} a month
                    </span>{" "}
                    back in your pocket.
                  </p>
                ) : (
                  <p className="text-gray-600 text-xs">
                    That's{" "}
                    <span className="text-teal-500 font-semibold">
                      {fmtShort(monthlySavings)} every month
                    </span>{" "}
                    back in your pocket.
                  </p>
                )}
              </div>

              {hasBothSources &&
                primarySavingsPositive &&
                isSolarViable &&
                comparison.savingsPerYear !== primarySavings && (
                  <p className="text-xs text-gray-600 mt-3">
                    ({fmtShort(comparison.savingsPerYear)}/yr vs grid alone ·{" "}
                    {fmtShort(
                      (savingsVsReality ?? 0) - comparison.savingsPerYear,
                    )}{" "}
                    more from replacing generator)
                  </p>
                )}
            </>
          ) : (
            <>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">
                Current monthly spend
              </p>
              <p
                className="font-display font-extrabold leading-none mb-3"
                style={{
                  fontSize: "clamp(3rem, 10vw, 5rem)",
                  color: "#64748b",
                }}
              >
                {fmtShort(animatedDrain)}
              </p>
              <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                {solarInsight ||
                  "Solar isn't the cheapest option at your current usage — but small changes can flip that."}
              </p>
            </>
          )}
        </div>

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
          label="You break even in"
          warn={paybackExceedsLifespan}
          value={
            paybackExceedsLifespan
              ? "Too long"
              : paybackYears
                ? `${paybackYears.toFixed(1)} yrs`
                : "—"
          }
          sub={
            paybackExceedsLifespan
              ? `System pays back in ${Math.round(paybackYears ?? 0)} yrs — longer than its lifespan`
              : paybackYears && breakEvenYear
                ? `Then free power until ${
                    breakEvenYear + (lifespanYears - Math.ceil(paybackYears))
                  }`
                : solarStatus === "low_usage"
                  ? "Add more appliances to improve solar ROI"
                  : solarStatus === "oversized"
                    ? "A smaller system would break even faster"
                    : "not applicable"
          }
        />
        <MetricCard
          icon={Wallet}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          label="Total you keep"
          value={
            lifetimePrimarySavings > 0 ? fmtShort(animatedLifetimeSavings) : "—"
          }
          sub={
            lifetimePrimarySavings > 0
              ? `over ${lifespanYears} years — money that stays yours`
              : `over ${lifespanYears} yr system lifespan`
          }
          highlight={lifetimePrimarySavings > 0}
        />
        <MetricCard
          icon={TrendingDown}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          label="Solar cost per kWh"
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
          {sortedSources.map(
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

              const sourceEquivalent =
                label === "Generator" ? getRealWorldEquivalent(monthly) : null;

              return (
                <div key={label}>
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
                          What you pay today
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
                  {sourceEquivalent ? (
                    <p className="text-xs text-gray-400 mt-1">
                      {detail} —{" "}
                      <span className="text-orange-400 font-medium">
                        roughly {sourceEquivalent} a month in running costs
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">{detail}</p>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* ── ZONE 4: PAYBACK TIMELINE ── */}
      {showTimeline && paybackPct !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            ⏳ Your Solar Journey
          </p>
          {breakEvenYear && (
            <p className="text-sm text-gray-500 mb-5">
              System pays for itself by{" "}
              <span className="font-semibold text-gray-700">
                {breakEvenYear}
              </span>{" "}
              — everything after that is yours.
            </p>
          )}
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Today</span>
            <span className="font-semibold text-gray-600">
              Free from {breakEvenYear ?? `Yr ${paybackYears?.toFixed(1)}`}
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
              ← Paying off ({paybackYears.toFixed(1)} yrs)
            </span>
            <span className="text-xs font-semibold text-teal-600">
              Free power ({pureSavingsYears.toFixed(1)} yrs) →
            </span>
          </div>
        </div>
      )}

      {/* ── DIAGNOSTIC CARD ── */}
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
                  ? "Solar can't pay itself back at this system size — but it's closer than you think"
                  : "Solar isn't your cheapest option right now — here's what changes that"}
              </p>
              <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                {solarInsight ||
                  (paybackExceedsLifespan
                    ? `At current inputs, the system takes ${Math.round(paybackYears ?? 0)} years to break even — just beyond the ${lifespanYears}-year lifespan. A smaller system or higher load would close that gap.`
                    : "Your current energy spend isn't high enough to make solar the clear winner yet. The numbers below show exactly what would tip it in solar's favour.")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-amber-100 border-b border-amber-100">
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                Solar would cost you
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
                You're paying today
              </p>
              <p className="font-display font-bold text-amber-900 text-xl">
                {fmtShort(
                  hasBothSources && currentReality != null
                    ? currentReality
                    : comparedAgainst === "Generator"
                      ? generator?.annualCost
                      : grid?.annualCost,
                )}
                <span className="text-sm font-normal text-amber-600">/yr</span>
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {paybackExceedsLifespan
                  ? `savings exist, but payback takes ${Math.round(paybackYears ?? 0)} yrs`
                  : `solar costs ${fmtShort(Math.abs(comparison.savingsPerYear ?? 0))} more per year at this load`}
              </p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-3">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
              Three things that could flip this
            </p>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <ArrowRight
                  size={14}
                  className="text-amber-500 mt-0.5 shrink-0"
                />
                <span>
                  <strong>Add more of your real appliances</strong> — if you
                  left out AC units, pumps, or office equipment, your actual
                  load is higher and solar becomes significantly more
                  competitive.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight
                  size={14}
                  className="text-amber-500 mt-0.5 shrink-0"
                />
                <span>
                  <strong>Right-size the system</strong> — a smaller system
                  matched to your actual load has a better cost-per-kWh and a
                  shorter payback.
                  {breakEvenCapex != null && (
                    <span className="block mt-1 font-semibold text-amber-900">
                      At your current load, a system priced at{" "}
                      {fmtShort(breakEvenCapex)} or less breaks even within{" "}
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
                  <strong>Check your grid band</strong> — if you're on Band A (≈
                  ₦209/kWh), solar is already more attractive than these numbers
                  suggest. Higher tariff bands make solar viable sooner.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ── ZONE 5: FINAL CTA ── */}
      <div
        className={`rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isSolarBestChoice ? "bg-teal-600" : "bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isSolarBestChoice ? "bg-teal-500" : "bg-gray-200"
            }`}
          >
            <Award
              size={22}
              className={isSolarBestChoice ? "text-white" : "text-gray-500"}
              strokeWidth={1.8}
            />
          </div>
          <div>
            <p
              className={`font-display font-bold text-lg leading-tight ${
                isSolarBestChoice ? "text-white" : "text-gray-700"
              }`}
            >
              {isSolarBestChoice
                ? `${fmtShort(monthlySavings ?? 0)}/month is leaving your pocket unnecessarily`
                : `${comparison.cheapestSource} is your best option right now`}
            </p>
            <p
              className={`text-sm mt-0.5 ${
                isSolarBestChoice ? "text-teal-200" : "text-gray-500"
              }`}
            >
              {isSolarBestChoice
                ? "Get a free quote — a certified installer will confirm what solar actually costs for your home."
                : "Adjust your inputs or add more appliances to see how solar stacks up — or talk to an installer about a right-sized system."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
          {isSolarBestChoice ? (
            calculatorInputs !== null && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-white text-teal-700 font-bold text-sm px-5 py-3 rounded-xl hover:bg-teal-50 transition-colors whitespace-nowrap shadow-sm"
              >
                Get Free Quote →
              </button>
            )
          ) : (
            <>
              <button
                onClick={handleAdjustInputs}
                className="bg-white text-gray-700 font-bold text-sm px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Adjust Inputs
              </button>
              {calculatorInputs !== null && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gray-900 text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap shadow-sm"
                >
                  Talk to an Installer →
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <LeadModal
          onClose={() => setShowModal(false)}
          calculatorResult={result}
          calculatorInputs={calculatorInputs ?? null}
        />
      )}

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
              {energy.genHoursPerDay}hrs. Solar covers the full 24hrs.
            </>
          )}{" "}
          Grid tariffs, fuel prices, and solar costs vary by location, supplier,
          and market conditions.
        </p>
      </div>
    </div>
  );
}
