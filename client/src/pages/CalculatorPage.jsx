import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  BarChart3,
  Search,
  Sun,
  Zap,
  Fuel,
} from "lucide-react";
import ResultCard from "../components/ResultCard";
import { calculate } from "../components/services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ─── Appliance Library ──────────────────────────────────────── */
const APPLIANCE_LIBRARY = [
  { name: "LED Bulb", power: 9, category: "Lighting" },
  { name: "Fluorescent Tube (2ft)", power: 20, category: "Lighting" },
  { name: "Fluorescent Tube (4ft)", power: 36, category: "Lighting" },
  { name: "Security Light (Outdoor)", power: 30, category: "Lighting" },
  { name: "Ceiling Fan", power: 75, category: "Cooling" },
  { name: "Standing Fan", power: 60, category: "Cooling" },
  { name: "Table Fan", power: 40, category: "Cooling" },
  { name: "AC Unit (1HP)", power: 750, category: "Cooling" },
  { name: "AC Unit (1.5HP)", power: 1100, category: "Cooling" },
  { name: "AC Unit (2HP)", power: 1500, category: "Cooling" },
  { name: "Refrigerator (Small)", power: 100, category: "Kitchen" },
  {
    name: "Refrigerator (Large / Double Door)",
    power: 200,
    category: "Kitchen",
  },
  { name: "Deep Freezer", power: 150, category: "Kitchen" },
  { name: "Microwave", power: 1200, category: "Kitchen" },
  { name: "Electric Kettle", power: 1500, category: "Kitchen" },
  { name: "Blender", power: 400, category: "Kitchen" },
  { name: "Rice Cooker", power: 700, category: "Kitchen" },
  { name: "Electric Cooker (per plate)", power: 1000, category: "Kitchen" },
  { name: "Water Dispenser", power: 500, category: "Kitchen" },
  { name: "Toaster", power: 800, category: "Kitchen" },
  { name: 'LED TV (32")', power: 50, category: "Entertainment" },
  { name: 'LED TV (43")', power: 80, category: "Entertainment" },
  { name: 'LED TV (55")', power: 120, category: "Entertainment" },
  { name: "DSTV Decoder", power: 30, category: "Entertainment" },
  { name: "Sound System / Subwoofer", power: 200, category: "Entertainment" },
  { name: "DVD / Media Player", power: 25, category: "Entertainment" },
  { name: "Laptop", power: 65, category: "Office" },
  { name: "Desktop Computer", power: 200, category: "Office" },
  { name: 'Monitor (24")', power: 30, category: "Office" },
  { name: "WiFi Router", power: 15, category: "Office" },
  { name: "Phone Charger", power: 10, category: "Office" },
  { name: "Printer", power: 400, category: "Office" },
  { name: "Photocopier", power: 1200, category: "Office" },
  { name: "CCTV System (4 cameras)", power: 40, category: "Office" },
  { name: "Water Pump (0.5HP)", power: 370, category: "Utilities" },
  { name: "Water Pump (1HP)", power: 750, category: "Utilities" },
  { name: "Borehole Pump", power: 1500, category: "Utilities" },
  { name: "Electric Iron", power: 1000, category: "Utilities" },
  { name: "Washing Machine", power: 500, category: "Utilities" },
];

const CATEGORY_ICONS = {
  Lighting: "💡",
  Cooling: "❄️",
  Kitchen: "🍳",
  Entertainment: "📺",
  Office: "💻",
  Utilities: "🔧",
};

/* ─── Generator efficiency presets ──────────────────────────── */
const GEN_EFFICIENCY_OPTIONS = [
  { label: "Small gen (Tiger / Keke, 1–2kVA) — ~1.8 kWh/L", value: "1.8" },
  { label: "Medium gen (2.5–5kVA) — ~2.5 kWh/L", value: "2.5" },
  { label: "Large diesel gen (7.5kVA+) — ~3.5 kWh/L", value: "3.5" },
];

/* ─── Smart CAPEX suggestion ─────────────────────────────────── */
const suggestCapex = (annualKWh) => {
  if (!annualKWh || annualKWh <= 0) return null;
  const dailyWh = (annualKWh * 1000) / 365;
  const peakSunHours = 5;
  const safetyFactor = 1.3;
  const systemWatts = (dailyWh / peakSunHours) * safetyFactor;
  return Math.round((systemWatts * 2500) / 100_000) * 100_000;
};

/* ─── Shared styles ──────────────────────────────────────────── */
const inp =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

/* ─── Toggle ─────────────────────────────────────────────────── */
function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-teal-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─── SectionCard ────────────────────────────────────────────── */
const SectionCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  toggle,
  enabled,
  onToggle,
  children,
}) => (
  <div
    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
      enabled === false ? "border-gray-100 opacity-60" : "border-gray-100"
    }`}
  >
    <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-50">
      <div
        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
      >
        <Icon size={18} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1">
        <h2 className="font-display font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {toggle && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 font-medium">
            {enabled ? "Included" : "Not included"}
          </span>
          <Toggle enabled={enabled} onToggle={onToggle} />
        </div>
      )}
    </div>
    {enabled !== false && <div className="px-6 py-6">{children}</div>}
    {enabled === false && (
      <div className="px-6 py-4">
        <p className="text-xs text-gray-400">
          Toggle on to include this source in the comparison.
        </p>
      </div>
    )}
  </div>
);

/* ─── Field ──────────────────────────────────────────────────── */
const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

/* ─── ApplianceRow ───────────────────────────────────────────── */
function ApplianceRow({ appliance, index, onChange, onRemove, isOnly }) {
  const [query, setQuery] = useState(appliance.name);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered =
    query.trim().length > 0
      ? APPLIANCE_LIBRARY.filter((a) =>
          a.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 8)
      : [];

  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectAppliance = (item) => {
    setQuery(item.name);
    setOpen(false);
    onChange(index, { target: { name: "name", value: item.name } });
    onChange(index, { target: { name: "power", value: String(item.power) } });
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    onChange(index, { target: { name: "name", value: e.target.value } });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 items-start md:items-center bg-gray-50 md:bg-transparent rounded-xl md:rounded-none p-3 md:p-0">
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search appliance…"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => {
              if (query.trim()) setOpen(true);
            }}
            className={`${inp} pl-9`}
          />
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {filtered.map((item) => (
              <button
                key={item.name}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectAppliance(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-teal-50 flex justify-between items-center group transition-colors"
              >
                <span className="text-sm text-gray-800 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[item.category]}</span>
                  {item.name}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-teal-600 transition-colors shrink-0 ml-2">
                  {item.power}W
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="number"
        name="power"
        placeholder="Watts"
        value={appliance.power}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <input
        type="number"
        name="hours"
        placeholder="Hrs/day"
        value={appliance.hours}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <input
        type="number"
        name="days"
        placeholder="Days/yr"
        value={appliance.days}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <input
        type="number"
        name="units"
        placeholder="Units"
        value={appliance.units}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />

      <button
        onClick={() => onRemove(index)}
        disabled={isOnly}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-20 transition-all self-center"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
const emptyAppliance = { name: "", power: "", hours: "", days: "", units: "1" };

export default function CalculatorPage() {
  const [appliances, setAppliances] = useState([{ ...emptyAppliance }]);
  const [includeGrid, setIncludeGrid] = useState(false);
  const [includeGenerator, setIncludeGenerator] = useState(false);
  const [settings, setSettings] = useState({
    gridTariff: "",
    fuelPrice: "",
    efficiency: "",
    capex: "",
    lifespan: "",
  });
  const [capexSuggestion, setCapexSuggestion] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* Recompute CAPEX suggestion whenever appliances change */
  useEffect(() => {
    const annualKWh = appliances.reduce((sum, a) => {
      const power = parseFloat(a.power) || 0;
      const hours = parseFloat(a.hours) || 0;
      const days = parseFloat(a.days) || 0;
      const units = parseFloat(a.units) || 1;
      return sum + (power * hours * days * units) / 1000;
    }, 0);
    setCapexSuggestion(suggestCapex(annualKWh));
  }, [appliances]);

  const applyCapexSuggestion = () => {
    if (capexSuggestion)
      setSettings((prev) => ({ ...prev, capex: String(capexSuggestion) }));
  };

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

    // Require at least one comparison source
    if (!includeGrid && !includeGenerator)
      return setError(
        "Toggle on at least one comparison source — Grid or Generator.",
      );

    if (appliances.length === 0) return setError("Add at least one appliance.");

    const incomplete = appliances.some(
      (a) => !a.power || !a.hours || !a.days || !a.units,
    );
    if (incomplete)
      return setError(
        "Please complete all fields for each appliance — Power, Hrs/Day, Days/Year, and Units.",
      );

    if (includeGrid && !settings.gridTariff)
      return setError(
        "Enter your grid tariff (₦/kWh) to include grid in the comparison.",
      );

    if (includeGenerator && (!settings.fuelPrice || !settings.efficiency))
      return setError(
        "Enter fuel price and select a generator size to include generator in the comparison.",
      );

    if (!settings.capex || !settings.lifespan)
      return setError(
        "Enter the solar system CAPEX and lifespan to complete the calculation.",
      );

    setLoading(true);
    try {
      const payload = {
        appliances: appliances.map((a) => ({
          power: parseFloat(a.power),
          hours: parseFloat(a.hours),
          days: parseFloat(a.days),
          units: parseFloat(a.units),
        })),
        capex: parseFloat(settings.capex),
        lifespan: parseFloat(settings.lifespan),
        ...(includeGrid && { gridTariff: parseFloat(settings.gridTariff) }),
        ...(includeGenerator && {
          fuelPrice: parseFloat(settings.fuelPrice),
          efficiency: parseFloat(settings.efficiency),
        }),
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
            Add your appliances, toggle on the energy sources you currently use,
            and see how solar compares.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Appliances */}
        <SectionCard
          icon={Zap}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-500"
          title="Appliances"
          subtitle="Search for each device — wattage fills in automatically"
        >
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 mb-3">
            {[
              "Appliance",
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
              <ApplianceRow
                key={index}
                appliance={appliance}
                index={index}
                onChange={handleApplianceChange}
                onRemove={removeAppliance}
                isOnly={appliances.length === 1}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={addAppliance}
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              <Plus size={16} /> Add Another Appliance
            </button>
            <p className="text-xs text-gray-400 max-w-xs">
              💡 Can't find your appliance? Type a name and enter the wattage
              manually — it's usually printed on a label at the back of the
              device.
            </p>
          </div>
        </SectionCard>

        {/* Comparison sources label */}
        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            Comparison Sources
          </p>
          <p className="text-sm text-gray-500">
            Toggle on the energy sources you currently rely on. Solar is always
            included.
          </p>
        </div>

        {/* Grid */}
        <SectionCard
          icon={Zap}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          title="Grid"
          subtitle="Compare solar against your utility electricity tariff"
          toggle
          enabled={includeGrid}
          onToggle={() => setIncludeGrid((v) => !v)}
        >
          <Field
            label="Tariff — cost per kWh (₦)"
            hint="Check your NERC band on your utility bill. Typical rates: Band A ≈ ₦209 · Band B ≈ ₦109 · Band D ≈ ₦68."
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

        {/* Generator */}
        <SectionCard
          icon={Fuel}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          title="Generator"
          subtitle="Compare solar against your generator running costs"
          toggle
          enabled={includeGenerator}
          onToggle={() => setIncludeGenerator((v) => !v)}
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
              label="Generator Size"
              hint="Not sure? Pick the closest match — efficiency is estimated for you."
            >
              <select
                name="efficiency"
                value={settings.efficiency}
                onChange={handleSettingsChange}
                className={inp}
              >
                <option value="" disabled>
                  Select generator size…
                </option>
                {GEN_EFFICIENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* Solar — always on */}
        <SectionCard
          icon={Sun}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          title="Solar"
          subtitle="Always included — this is what we're comparing against"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="System CAPEX (₦)"
              hint={
                capexSuggestion
                  ? `Based on your appliances, a suitable system costs roughly ₦${capexSuggestion.toLocaleString("en-NG")}.`
                  : "Total quote from your installer — panels, inverter, battery, and installation."
              }
            >
              <div className="relative">
                <input
                  type="number"
                  name="capex"
                  placeholder="e.g. 3500000"
                  value={settings.capex}
                  onChange={handleSettingsChange}
                  className={inp}
                />
                {capexSuggestion && !settings.capex && (
                  <button
                    onClick={applyCapexSuggestion}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Use ₦{(capexSuggestion / 1_000_000).toFixed(1)}M estimate
                  </button>
                )}
              </div>
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
            <ResultCard
              result={result}
              lifespan={parseFloat(settings.lifespan)}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
