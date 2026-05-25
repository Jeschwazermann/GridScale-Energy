import { useState, useEffect } from "react";
import { Sun, Zap, Fuel } from "lucide-react";

/* ─── Formatters ─────────────────────────────────────────────── */
const fmt = (v) =>
  v != null ? v.toLocaleString("en-NG", { maximumFractionDigits: 2 }) : "—";

const fmtShort = (v) => {
  if (v == null) return "—";
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
  return `₦${v.toFixed(0)}`;
};

/* ─── ResultCard ─────────────────────────────────────────────── */
export default function ResultCard({ result, lifespan }) {
  const { energy, grid, generator, solar, comparison } = result;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const lifespanYears = lifespan || 25;
  const lifetimeSavings =
    comparison.savingsPerYear > 0
      ? comparison.savingsPerYear * lifespanYears
      : 0;
  const maxCost = Math.max(
    grid.annualCost,
    generator.annualCost,
    solar.annualCost,
  );

  const sources = [
    {
      icon: Zap,
      label: "Grid",
      monthly: grid.monthlyCost,
      annual: grid.annualCost,
      barColor: "bg-yellow-400",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      detail: "Utility tariff",
    },
    {
      icon: Fuel,
      label: "Generator",
      monthly: generator.monthlyCost,
      annual: generator.annualCost,
      barColor: "bg-orange-400",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      detail: `₦${fmt(generator.costPerKWh)}/kWh`,
    },
    {
      icon: Sun,
      label: "Solar",
      monthly: solar.monthlyCost,
      annual: solar.annualCost,
      barColor: "bg-teal-500",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      detail: `₦${fmt(solar.costPerKWh)}/kWh`,
    },
  ];

  const mostExpensive = sources.reduce((a, b) => (a.annual > b.annual ? a : b));
  const multiplier =
    solar.annualCost > 0
      ? (mostExpensive.annual / solar.annualCost).toFixed(1)
      : null;
  const showHeadline =
    multiplier &&
    parseFloat(multiplier) > 1.1 &&
    mostExpensive.label !== "Solar";

  const paybackYears = comparison.paybackYears;
  const paybackPct = paybackYears
    ? Math.min((paybackYears / lifespanYears) * 100, 100)
    : null;

  return (
    <div className="space-y-5 mt-2">
      {/* ── Energy Consumption ── */}
      <div className="bg-teal-600 rounded-2xl p-6 text-white">
        <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-4">
          ⚡ Energy Consumption
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-teal-200 text-xs mb-1">Monthly</p>
            <p className="font-display font-bold text-3xl">
              {fmt(energy.monthlyKWh)}
            </p>
            <p className="text-teal-300 text-sm">kWh</p>
          </div>
          <div>
            <p className="text-teal-200 text-xs mb-1">Annual</p>
            <p className="font-display font-bold text-3xl">
              {fmt(energy.annualKWh)}
            </p>
            <p className="text-teal-300 text-sm">kWh</p>
          </div>
        </div>
      </div>

      {/* ── Cost Comparison Infographic ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-4">
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

        <div className="px-6 pb-6 space-y-5">
          {sources.map(
            ({
              icon: Icon,
              label,
              monthly,
              annual,
              barColor,
              iconBg,
              iconColor,
              detail,
            }) => {
              const best = label === comparison.cheapestSource;
              const pct = maxCost > 0 ? (annual / maxCost) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
                      >
                        <Icon size={13} className={iconColor} />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {label}
                      </span>
                      {best && (
                        <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                          Cheapest
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-display font-bold text-sm ${best ? "text-teal-700" : "text-gray-700"}`}
                      >
                        {fmtShort(monthly)}/mo
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {fmtShort(annual)}/yr
                      </span>
                    </div>
                  </div>
                  <div
                    className={`h-3 rounded-full ${best ? "bg-teal-50" : "bg-gray-100"} overflow-hidden`}
                  >
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
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

      {/* ── Solar Verdict Infographic ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Hero savings number */}
        <div className="bg-gray-950 px-6 py-8 text-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
            Annual Savings with Solar
          </p>
          <p
            className="font-display font-extrabold text-5xl mb-2"
            style={{
              background: "linear-gradient(90deg, #2dd4bf, #0d9488)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {fmtShort(comparison.savingsPerYear)}
          </p>
          <p className="text-gray-400 text-sm">
            {comparison.savingsPerYear > 0
              ? "saved every year by switching to solar"
              : "solar does not save money vs grid at current rates"}
          </p>
        </div>

        {/* Payback timeline */}
        {paybackYears && paybackPct !== null && (
          <div className="px-6 py-6 border-b border-gray-50">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Payback Timeline
              </p>
              <p className="text-xs text-gray-500">
                System lifespan: {lifespanYears} yrs
              </p>
            </div>

            <div className="relative h-8 bg-teal-100 rounded-full overflow-hidden">
              {/* Payback zone */}
              <div
                className="absolute inset-y-0 left-0 bg-gray-300 rounded-l-full transition-all duration-700 ease-out"
                style={{ width: animated ? `${paybackPct}%` : "0%" }}
              />
              {/* Marker */}
              <div
                className="absolute inset-y-0 w-0.5 bg-gray-700 z-10 transition-all duration-700 ease-out"
                style={{ left: animated ? `${paybackPct}%` : "0%" }}
              />
              {/* Labels */}
              <div className="absolute inset-0 flex items-center px-3">
                {paybackPct > 20 && (
                  <span
                    className="text-xs font-semibold text-gray-600 truncate"
                    style={{ width: `${paybackPct}%` }}
                  >
                    Paying back
                  </span>
                )}
                {paybackPct < 85 && (
                  <span className="text-xs font-semibold text-teal-700 pl-2">
                    Pure savings
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-2 relative">
              <span className="text-xs text-gray-400">Year 0</span>
              <span
                className="text-xs font-semibold text-gray-600 absolute"
                style={{
                  left: `${Math.min(Math.max(paybackPct - 4, 5), 80)}%`,
                }}
              >
                Yr {paybackYears.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                Year {lifespanYears}
              </span>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 divide-x divide-gray-50">
          <div className="px-6 py-5">
            <p className="text-xs text-gray-400 mb-1">Payback Period</p>
            <p className="font-display font-bold text-2xl text-gray-900">
              {paybackYears ? `${paybackYears.toFixed(1)} yrs` : "N/A"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              to break even on solar
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs text-gray-400 mb-1">Lifetime Savings</p>
            <p className="font-display font-bold text-2xl text-teal-600">
              {lifetimeSavings > 0 ? fmtShort(lifetimeSavings) : "N/A"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              over {lifespanYears} years vs grid
            </p>
          </div>
        </div>

        {/* Recommended source */}
        <div className="mx-6 mb-6 mt-1 bg-teal-600 rounded-xl px-5 py-4 flex justify-between items-center">
          <p className="text-teal-100 text-sm font-medium">
            Recommended Energy Source
          </p>
          <p className="font-display font-bold text-white text-lg">
            {comparison.cheapestSource}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          ℹ️ These are indicative estimates to support decision-making, not
          guaranteed prices or savings. Grid tariffs, fuel prices, and solar
          costs vary by location, supplier, and market conditions.
        </p>
      </div>
    </div>
  );
}
