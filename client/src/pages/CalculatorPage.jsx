import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sun,
  Zap,
  Fuel,
  BarChart3,
} from "lucide-react";
import { calculate } from "../components/services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ─── Shared input style ─────────────────────────────────────── */
const inp =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

/* ─── Sub-components ─────────────────────────────────────────── */
const SectionCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  children,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-50">
      <div
        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
      >
        <Icon size={18} className={iconColor} strokeWidth={1.8} />
      </div>
      <div>
        <h2 className="font-display font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-6 py-6">{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

/* ─── Result helpers ─────────────────────────────────────────── */
const fmt = (v) =>
  v != null ? v.toLocaleString("en-NG", { maximumFractionDigits: 2 }) : "—";

function ResultCard({ result }) {
  const { energy, grid, generator, solar, comparison } = result;

  const sources = [
    {
      icon: Zap,
      label: "Grid",
      monthly: grid.monthlyCost,
      annual: grid.annualCost,
      detail: "Utility tariff-based",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
    },
    {
      icon: Fuel,
      label: "Generator",
      monthly: generator.monthlyCost,
      annual: generator.annualCost,
      detail: `₦${fmt(generator.costPerKWh)}/kWh`,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      icon: Sun,
      label: "Solar",
      monthly: solar.monthlyCost,
      annual: solar.annualCost,
      detail: `₦${fmt(solar.costPerKWh)}/kWh`,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <div className="space-y-5 mt-2">
      {/* Energy summary */}
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

      {/* Cost comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="font-display font-bold text-gray-900">
            📊 Cost Comparison
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {sources.map(
            ({
              icon: Icon,
              label,
              monthly,
              annual,
              detail,
              iconBg,
              iconColor,
            }) => {
              const best = label === comparison.cheapestSource;
              return (
                <div
                  key={label}
                  className={`flex items-center justify-between px-6 py-4 transition-colors ${best ? "bg-teal-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
                    >
                      <Icon size={16} className={iconColor} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-800">
                          {label}
                        </p>
                        {best && (
                          <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                            Cheapest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{detail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-display font-bold text-base ${best ? "text-teal-700" : "text-gray-800"}`}
                    >
                      ₦{fmt(monthly)}/mo
                    </p>
                    <p className="text-xs text-gray-400">₦{fmt(annual)}/yr</p>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Solar verdict */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="font-display font-bold text-gray-900">
            ☀️ Solar Verdict
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            {
              label: "Annual Savings vs Grid",
              value: `₦${fmt(comparison.savingsPerYear)}`,
              highlight: comparison.savingsPerYear > 0,
            },
            {
              label: "Solar Payback Period",
              value: comparison.paybackYears
                ? `${fmt(comparison.paybackYears)} years`
                : "N/A — solar costs more than grid",
            },
            { label: "Recommended Source", value: comparison.cheapestSource },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className="flex justify-between items-center px-6 py-4"
            >
              <span className="text-sm text-gray-500">{label}</span>
              <span
                className={`text-sm font-bold font-display ${highlight ? "text-teal-600" : "text-gray-800"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Calculator Page ───────────────────────────────────── */
const emptyAppliance = { name: "", power: "", hours: "", days: "", units: "1" };

export default function CalculatorPage() {
  const [appliances, setAppliances] = useState([{ ...emptyAppliance }]);
  const [settings, setSettings] = useState({
    gridTariff: "",
    fuelPrice: "",
    efficiency: "",
    capex: "",
    lifespan: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApplianceChange = (index, e) => {
    const { name, value } = e.target;
    setAppliances((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    );
  };

  const addAppliance = () =>
    setAppliances((prev) => [...prev, { ...emptyAppliance }]);
  const removeAppliance = (index) =>
    setAppliances((prev) => prev.filter((_, i) => i !== index));

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (appliances.length === 0) return setError("Add at least one appliance.");
    setLoading(true);
    try {
      const payload = {
        appliances: appliances.map((a) => ({
          power: parseFloat(a.power),
          hours: parseFloat(a.hours),
          days: parseFloat(a.days),
          units: parseFloat(a.units),
        })),
        gridTariff: parseFloat(settings.gridTariff),
        fuelPrice: parseFloat(settings.fuelPrice),
        efficiency: parseFloat(settings.efficiency),
        capex: parseFloat(settings.capex),
        lifespan: parseFloat(settings.lifespan),
      };
      const res = await calculate(payload);
      setResult(res);
      setTimeout(
        () =>
          document
            .getElementById("results")
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch {
      setError("Something went wrong. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-teal-700 pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-teal-200 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Energy Cost Calculator
          </h1>
          <p className="text-teal-200">
            Fill in your appliances and energy inputs below to get a full cost
            comparison.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* ── Appliances ── */}
        <SectionCard
          icon={Zap}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-500"
          title="Appliances"
          subtitle="Add every device you want to power"
        >
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 mb-2">
            {[
              "Appliance Name",
              "Power (W)",
              "Hrs/Day",
              "Days/Year",
              "Units",
              "",
            ].map((h) => (
              <span
                key={h}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {appliances.map((appliance, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 items-center"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Fan"
                  value={appliance.name}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inp}
                />
                <input
                  type="number"
                  name="power"
                  placeholder="75"
                  value={appliance.power}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inp}
                />
                <input
                  type="number"
                  name="hours"
                  placeholder="8"
                  value={appliance.hours}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inp}
                />
                <input
                  type="number"
                  name="days"
                  placeholder="365"
                  value={appliance.days}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inp}
                />
                <input
                  type="number"
                  name="units"
                  placeholder="1"
                  value={appliance.units}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inp}
                />
                <button
                  onClick={() => removeAppliance(index)}
                  disabled={appliances.length === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-20 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addAppliance}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            <Plus size={16} /> Add Appliance
          </button>
        </SectionCard>

        {/* ── Grid ── */}
        <SectionCard
          icon={Zap}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          title="Grid"
          subtitle="Your electricity tariff from the utility provider"
        >
          <Field
            label="Tariff — cost per kWh (₦)"
            hint="Check your NERC band on your utility bill. Common rates: Band A ≈ ₦209, Band D ≈ ₦68."
          >
            <input
              type="number"
              name="gridTariff"
              placeholder="e.g. 68"
              value={settings.gridTariff}
              onChange={handleSettingsChange}
              className={inp}
            />
          </Field>
        </SectionCard>

        {/* ── Generator ── */}
        <SectionCard
          icon={Fuel}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          title="Generator"
          subtitle="Fuel cost and how efficiently your generator converts it"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Fuel Price per Litre (₦)"
              hint="Current pump price in your area."
            >
              <input
                type="number"
                name="fuelPrice"
                placeholder="e.g. 1200"
                value={settings.fuelPrice}
                onChange={handleSettingsChange}
                className={inp}
              />
            </Field>
            <Field
              label="Generator Efficiency (kWh/litre)"
              hint="Typical small gen: 1.5–2.5 kWh/L. Larger: up to 3.5."
            >
              <input
                type="number"
                name="efficiency"
                placeholder="e.g. 2.5"
                value={settings.efficiency}
                onChange={handleSettingsChange}
                className={inp}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── Solar ── */}
        <SectionCard
          icon={Sun}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          title="Solar"
          subtitle="Total installation cost and expected system lifespan"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="System CAPEX (₦)"
              hint="Total quote from your installer including panels, inverter, and battery."
            >
              <input
                type="number"
                name="capex"
                placeholder="e.g. 3500000"
                value={settings.capex}
                onChange={handleSettingsChange}
                className={inp}
              />
            </Field>
            <Field
              label="System Lifespan (years)"
              hint="Most quality solar systems are rated for 20–25 years."
            >
              <input
                type="number"
                name="lifespan"
                placeholder="e.g. 25"
                value={settings.lifespan}
                onChange={handleSettingsChange}
                className={inp}
              />
            </Field>
          </div>
        </SectionCard>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white font-bold font-display py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-teal-200 flex items-center justify-center gap-2 text-base"
        >
          <BarChart3 size={18} />
          {loading ? "Calculating…" : "Calculate My Energy Costs"}
        </button>

        {/* Results */}
        {result && (
          <div id="results">
            <ResultCard result={result} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
