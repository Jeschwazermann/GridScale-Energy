import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import InstallerLayout from "../../../layouts/installer";
import { useAuth } from "../../../contexts/useAuth";
import { runAssessment } from "../../../services/installerApi";
import { EMPTY_APPLIANCE, suggestCapex } from "./assessmentHelpers";
import CustomerSelector from "./CustomerSelector";
import ApplianceList from "./ApplianceList";
import AssessmentSettings from "./AssessmentSettings";

/* ─── NewAssessment ──────────────────────────────────────────────
   Coordinator: owns all form state, validation, and submission.
   Rendering is fully delegated to the three child components.
──────────────────────────────────────────────────────────────── */
export default function NewAssessment() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();

  /* ── Customer ── */
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    locationState?.customerId ?? "",
  );

  /* ── Appliances ── */
  const [appliances, setAppliances] = useState([{ ...EMPTY_APPLIANCE }]);

  /* ── Source toggles ── */
  const [includeGrid, setIncludeGrid] = useState(false);
  const [includeGenerator, setIncludeGenerator] = useState(false);

  /* ── Settings — seeded from profile on first load ── */
  const hasInitialized = useRef(false);
  const [settings, setSettings] = useState({
    gridTariff: "",
    fuelPrice: "",
    efficiency: "",
    capex: "",
    lifespan: "",
    gridHours: null,
    genHours: null,
  });

  useEffect(() => {
    if (!profile || hasInitialized.current) return;
    setSettings((prev) => ({
      ...prev,
      gridTariff:
        prev.gridTariff ||
        (profile.default_grid_tariff != null
          ? String(profile.default_grid_tariff)
          : ""),
      fuelPrice:
        prev.fuelPrice ||
        (profile.default_fuel_price != null
          ? String(profile.default_fuel_price)
          : ""),
    }));
    hasInitialized.current = true;
  }, [profile]);

  /* ── Submit state ── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ── CAPEX suggestion ── */
  const capexSuggestion = useMemo(() => {
    const annualKWh = appliances.reduce((sum, a) => {
      const p = parseFloat(a.power) || 0;
      const h = parseFloat(a.hours) || 0;
      const d = parseFloat(a.days) || 0;
      const u = parseFloat(a.units) || 1;
      return sum + (p * h * d * u) / 1000;
    }, 0);
    return suggestCapex(annualKWh);
  }, [appliances]);

  /* ── Appliance handlers ── */
  const handleApplianceChange = (index, e) => {
    const { name, value } = e.target;
    const numeric = ["power", "hours", "days", "units"];
    const sanitized =
      numeric.includes(name) && parseFloat(value) < 0 ? "0" : value;
    setAppliances((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [name]: sanitized } : item,
      ),
    );
  };

  const addAppliance = () =>
    setAppliances((prev) => [...prev, { ...EMPTY_APPLIANCE }]);

  const removeAppliance = (index) =>
    setAppliances((prev) => prev.filter((_, i) => i !== index));

  /* ── Settings handlers ── */
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // For button-picker fields (gridHours, genHours) and the CAPEX suggestion button
  const handleSettingSet = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setError(null);

    if (!selectedCustomerId)
      return setError("Select or create a customer first.");
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
        "Complete all appliance fields — Power, Hrs/Day, Days/Year, and Units.",
      );

    if (includeGrid && !settings.gridTariff)
      return setError(
        "Enter the grid tariff to include grid in the comparison.",
      );
    if (includeGenerator && (!settings.fuelPrice || !settings.efficiency))
      return setError(
        "Enter fuel price and generator size to include generator.",
      );

    if (settings.gridHours == null)
      return setError(
        "Select daily grid supply hours to split the load accurately.",
      );

    if (includeGenerator) {
      if (settings.genHours == null)
        return setError(
          "Select how many hours the customer runs their generator daily.",
        );
      const combined = settings.gridHours + settings.genHours;
      if (combined > 24)
        return setError(
          `Grid hours (${settings.gridHours}) + Generator hours (${settings.genHours}) = ${combined}hrs — exceeds 24. Please adjust.`,
        );
    }

    if (!settings.capex || !settings.lifespan)
      return setError("Enter the solar system CAPEX and lifespan.");

    setLoading(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        appliances: appliances.map((a) => ({
          power: parseFloat(a.power),
          hours: parseFloat(a.hours),
          days: parseFloat(a.days),
          units: parseFloat(a.units),
        })),
        capex: parseFloat(settings.capex),
        lifespan: parseFloat(settings.lifespan),
        gridHours: parseFloat(settings.gridHours),
        ...(includeGrid && { gridTariff: parseFloat(settings.gridTariff) }),
        ...(includeGenerator && {
          fuelPrice: parseFloat(settings.fuelPrice),
          efficiency: parseFloat(settings.efficiency),
          genHours: parseFloat(settings.genHours),
        }),
      };

      await runAssessment(payload);
      navigate(`/installer/customers/${selectedCustomerId}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Assessment failed. Please check your inputs.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstallerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            New Assessment
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Run an energy cost comparison for a customer.
          </p>
        </div>

        <CustomerSelector
          selectedId={selectedCustomerId}
          onSelect={setSelectedCustomerId}
        />

        <ApplianceList
          appliances={appliances}
          onChange={handleApplianceChange}
          onAdd={addAppliance}
          onRemove={removeAppliance}
        />

        <AssessmentSettings
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onSettingSet={handleSettingSet}
          includeGrid={includeGrid}
          includeGenerator={includeGenerator}
          onToggleGrid={() => setIncludeGrid((v) => !v)}
          onToggleGenerator={() => setIncludeGenerator((v) => !v)}
          capexSuggestion={capexSuggestion}
        />

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white font-bold font-display py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-teal-200 flex items-center justify-center gap-2 text-base"
        >
          <BarChart3 size={18} />
          {loading ? "Running Assessment…" : "Run Assessment"}
        </button>
      </div>
    </InstallerLayout>
  );
}
