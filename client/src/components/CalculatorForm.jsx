import { useState } from "react";
import { calculate } from "./services/api";
import ResultCard from "./ResultCard";

const emptyAppliance = { name: "", power: "", hours: "", days: "", units: "1" };

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

const Section = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="bg-teal-600 px-5 py-4">
      <h2 className="text-white font-semibold font-display">{title}</h2>
      {subtitle && <p className="text-teal-100 text-xs mt-0.5">{subtitle}</p>}
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {label}
    </label>
    {children}
  </div>
);

const CalculatorForm = () => {
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
    if (appliances.length === 0) {
      setError("Add at least one appliance.");
      return;
    }
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
    } catch (err) {
      setError("Something went wrong. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pb-16">
      <div className="w-full max-w-2xl mx-auto space-y-5">
        {/* Appliances */}
        <Section
          title="🔌 Appliances"
          subtitle="List every appliance you want to power"
        >
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 mb-2">
            {["Name", "Power (W)", "Hrs/day", "Days/yr", "Units", ""].map(
              (h) => (
                <span key={h} className="text-xs font-medium text-gray-400">
                  {h}
                </span>
              ),
            )}
          </div>

          {/* Appliance Rows */}
          <div className="space-y-2">
            {appliances.map((appliance, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Fan"
                  value={appliance.name}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inputClass}
                />
                <input
                  type="number"
                  name="power"
                  placeholder="75"
                  value={appliance.power}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inputClass}
                />
                <input
                  type="number"
                  name="hours"
                  placeholder="8"
                  value={appliance.hours}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inputClass}
                />
                <input
                  type="number"
                  name="days"
                  placeholder="365"
                  value={appliance.days}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inputClass}
                />
                <input
                  type="number"
                  name="units"
                  placeholder="1"
                  value={appliance.units}
                  onChange={(e) => handleApplianceChange(index, e)}
                  className={inputClass}
                />
                <button
                  onClick={() => removeAppliance(index)}
                  disabled={appliances.length === 1}
                  className="text-gray-300 hover:text-red-400 disabled:opacity-30 transition text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addAppliance}
            className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium transition"
          >
            + Add Appliance
          </button>
        </Section>

        {/* Grid */}
        <Section
          title="⚡ Grid"
          subtitle="Your electricity tariff from the utility provider"
        >
          <Field label="Tariff (cost per kWh in your currency)">
            <input
              type="number"
              name="gridTariff"
              placeholder="e.g. 68"
              value={settings.gridTariff}
              onChange={handleSettingsChange}
              className={inputClass}
            />
          </Field>
        </Section>

        {/* Generator */}
        <Section
          title="⛽ Generator"
          subtitle="Fuel and efficiency details for your generator"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fuel Price (per litre)">
              <input
                type="number"
                name="fuelPrice"
                placeholder="e.g. 1200"
                value={settings.fuelPrice}
                onChange={handleSettingsChange}
                className={inputClass}
              />
            </Field>
            <Field label="Efficiency (kWh per litre)">
              <input
                type="number"
                name="efficiency"
                placeholder="e.g. 2.5"
                value={settings.efficiency}
                onChange={handleSettingsChange}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* Solar */}
        <Section
          title="☀️ Solar"
          subtitle="Capital cost and expected system lifespan"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="System Cost / CAPEX">
              <input
                type="number"
                name="capex"
                placeholder="e.g. 2500000"
                value={settings.capex}
                onChange={handleSettingsChange}
                className={inputClass}
              />
            </Field>
            <Field label="Lifespan (years)">
              <input
                type="number"
                name="lifespan"
                placeholder="e.g. 25"
                value={settings.lifespan}
                onChange={handleSettingsChange}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* Error */}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white font-semibold font-display py-3 rounded-xl transition duration-150"
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>

        {/* Results */}
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
};

export default CalculatorForm;
