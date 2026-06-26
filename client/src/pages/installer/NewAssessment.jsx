import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Trash2,
  BarChart3,
  Search,
  Sun,
  Zap,
  Fuel,
  Clock,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import InstallerLayout from "../../layouts/installer";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import { runAssessment } from "../../services/installerApi";

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

const GEN_EFFICIENCY_OPTIONS = [
  { label: "Small gen (Tiger / Keke, 1–2kVA) — ~1.8 kWh/L", value: "1.8" },
  { label: "Medium gen (2.5–5kVA) — ~2.5 kWh/L", value: "2.5" },
  { label: "Large diesel gen (7.5kVA+) — ~3.5 kWh/L", value: "3.5" },
];

const GRID_HOUR_OPTIONS = [0, 2, 4, 6, 8, 12, 16, 20, 24];

/* ─── Smart CAPEX suggestion ─────────────────────────────────── */
const suggestCapex = (annualKWh) => {
  if (!annualKWh || annualKWh <= 0) return null;
  const dailyWh = (annualKWh * 1000) / 365;
  const systemWatts = (dailyWh / 5) * 1.3;
  const rounded = Math.round((systemWatts * 2500) / 100_000) * 100_000;
  return rounded > 0 ? rounded : null;
};

/* ─── Grid hours label ───────────────────────────────────────── */
const gridHoursLabel = (hrs, includeGrid, includeGenerator) => {
  if (hrs === 0)
    return includeGenerator
      ? "No grid — all load falls on generator (and solar as alternative)"
      : "No grid supply selected";
  if (hrs === 24) return "Full 24hr grid supply — no generator hours assumed";
  if (includeGrid && includeGenerator)
    return `${hrs}hrs grid · ${24 - hrs}hrs generator per day`;
  if (includeGrid)
    return `${hrs}hrs of grid supply daily — appliances only run during these hours`;
  return `${24 - hrs}hrs generator per day`;
};

/* ─── Shared styles ──────────────────────────────────────────── */
const inp =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

/* ─── Sub-components ─────────────────────────────────────────── */
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
  const ref = useRef(null);

  const filtered =
    query.trim().length > 0
      ? APPLIANCE_LIBRARY.filter((a) =>
          a.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 8)
      : [];

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 items-start md:items-center bg-gray-50 md:bg-transparent rounded-xl md:rounded-none p-3 md:p-0">
      <div className="relative" ref={ref}>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search appliance…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              onChange(index, {
                target: { name: "name", value: e.target.value },
              });
            }}
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
        min="0"
        value={appliance.power}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <input
        type="number"
        name="hours"
        placeholder="Hrs/day"
        min="0"
        max="24"
        value={appliance.hours}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <input
        type="number"
        name="days"
        placeholder="Days/yr"
        min="0"
        max="365"
        value={appliance.days}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <input
        type="number"
        name="units"
        placeholder="Units"
        min="0"
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

/* ─── NewAssessment ──────────────────────────────────────────── */
const emptyAppliance = { name: "", power: "", hours: "", days: "", units: "1" };

export default function NewAssessment() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();

  /* Pre-filled from CustomerDetail "New Assessment" button */
  const prefilledCustomerId = locationState?.customerId ?? null;

  /* Customer selection */
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    prefilledCustomerId ?? "",
  );
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  /* Form state */
  const [appliances, setAppliances] = useState([{ ...emptyAppliance }]);
  const [includeGrid, setIncludeGrid] = useState(false);
  const [includeGenerator, setIncludeGenerator] = useState(false);
  const [settings, setSettings] = useState({
    gridTariff: "",
    fuelPrice: "",
    efficiency: "",
    capex: "",
    lifespan: "",
    gridHours: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const showGridHours = includeGrid || includeGenerator;

  /* ── Seed default tariff & fuel price from installer profile ──
     Only runs once when the profile first loads (or changes identity).
     Does not overwrite fields the user has already edited, because we
     only seed when the field is still at its empty initial value. */
  useEffect(() => {
    if (!profile) return;
    setSettings((prev) => ({
      ...prev,
      gridTariff:
        prev.gridTariff === "" && profile.default_grid_tariff != null
          ? String(profile.default_grid_tariff)
          : prev.gridTariff,
      fuelPrice:
        prev.fuelPrice === "" && profile.default_fuel_price != null
          ? String(profile.default_fuel_price)
          : prev.fuelPrice,
    }));
  }, [profile]);

  /* ── Load customers ──
     The fetch logic lives directly inside the effect instead of being
     a separately-declared function (`loadCustomers`) that the effect
     calls out to. In the original code the effect's dependency array
     was `[user]` but the effect body called `loadCustomers` — a
     function declared in the component body that wasn't listed as a
     dependency. It happened to be harmless here because that function
     only ever closes over `user` (already a dep) and the two stable
     setters, but it's exactly the kind of unlisted-reference pattern
     that trips `react-hooks/exhaustive-deps` and, in components where
     the called function closes over other state, silently causes
     stale-closure bugs. Inlining removes the unlisted dependency
     entirely — there's nothing left to omit from the array. A
     `cancelled` guard is added so a slow request can't set state
     after the component unmounts or `user` changes again. */
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      setCustomersLoading(true);
      const { data } = await supabase
        .from("customers")
        .select("id, name, state")
        .eq("installer_id", user.id)
        .order("name");

      if (cancelled) return;
      setCustomers(data ?? []);
      setCustomersLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /* ── Create new customer inline ── */
  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;
    setCreatingCustomer(true);
    const { data, error: err } = await supabase
      .from("customers")
      .insert({
        installer_id: user.id,
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        status: "new",
      })
      .select()
      .single();

    if (!err && data) {
      setCustomers((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSelectedCustomerId(data.id);
      setShowNewCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
    }
    setCreatingCustomer(false);
  };

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
    setAppliances((prev) => [...prev, { ...emptyAppliance }]);
  const removeAppliance = (index) =>
    setAppliances((prev) => prev.filter((_, i) => i !== index));

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
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
        {/* ── Page Header ── */}
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            New Assessment
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Run an energy cost comparison for a customer.
          </p>
        </div>

        {/* ── Customer Selector ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
              <UserPlus size={18} className="text-teal-600" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="font-display font-bold text-gray-900">Customer</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Select an existing customer or create a new one
              </p>
            </div>
          </div>
          <div className="px-6 py-6 space-y-4">
            {/* Dropdown */}
            <div className="relative">
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setShowNewCustomer(false);
                }}
                disabled={customersLoading}
                className={`${inp} appearance-none pr-10`}
              >
                <option value="">
                  {customersLoading
                    ? "Loading customers…"
                    : "Select a customer…"}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.state ? ` — ${c.state}` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* New customer toggle */}
            <button
              onClick={() => setShowNewCustomer((v) => !v)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              <Plus size={15} />
              {showNewCustomer ? "Cancel" : "Create new customer"}
            </button>

            {/* Inline new customer form */}
            {showNewCustomer && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Emeka Okonkwo"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className={inp}
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateCustomer}
                  disabled={
                    creatingCustomer ||
                    !newCustomerName.trim() ||
                    !newCustomerPhone.trim()
                  }
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                >
                  {creatingCustomer ? "Creating…" : "Save Customer"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Appliances ── */}
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
              💡 Can't find an appliance? Type a name and enter wattage
              manually.
            </p>
          </div>
        </SectionCard>

        {/* ── Comparison sources label ── */}
        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            Comparison Sources
          </p>
          <p className="text-sm text-gray-500">
            Toggle on the sources your customer currently uses. Solar is always
            included.
          </p>
        </div>

        {/* ── Grid ── */}
        <SectionCard
          icon={Zap}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          title="Grid"
          subtitle="Compare solar against the customer's utility tariff"
          toggle
          enabled={includeGrid}
          onToggle={() => setIncludeGrid((v) => !v)}
        >
          <Field
            label="Tariff — cost per kWh (₦)"
            hint="Check NERC band on the customer's bill. Band A ≈ ₦209 · Band B ≈ ₦109 · Band D ≈ ₦68."
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
          subtitle="Compare solar against the customer's generator running costs"
          toggle
          enabled={includeGenerator}
          onToggle={() => setIncludeGenerator((v) => !v)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Fuel Price per Litre (₦)"
              hint="Current pump price in the customer's area."
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
            <Field label="Generator Size" hint="Pick the closest match.">
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

        {/* ── Daily Power Supply ── */}
        {showGridHours && (
          <SectionCard
            icon={Clock}
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
            title="Daily Power Supply"
            subtitle={
              includeGrid && includeGenerator
                ? "How many hours of NEPA does the customer get? The rest is generator time."
                : includeGrid
                  ? "How many hours of NEPA does the customer get daily?"
                  : "How many hours does the customer run their generator daily?"
            }
          >
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {GRID_HOUR_OPTIONS.map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, gridHours: hrs }))
                  }
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                    settings.gridHours === hrs
                      ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  {hrs === 0 ? "None" : hrs === 24 ? "Full" : `${hrs}hrs`}
                </button>
              ))}
            </div>
            {settings.gridHours != null && (
              <div className="mt-4 flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                <Clock size={13} className="text-purple-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-purple-700 leading-snug">
                  {gridHoursLabel(
                    settings.gridHours,
                    includeGrid,
                    includeGenerator,
                  )}
                </p>
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Solar ── */}
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
                  ? `Suggested for this load: ₦${capexSuggestion.toLocaleString("en-NG")}.`
                  : "Total installed cost — panels, inverter, battery, and labour."
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
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        capex: String(capexSuggestion),
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Use ₦{(capexSuggestion / 1_000_000).toFixed(1)}M
                  </button>
                )}
              </div>
            </Field>
            <Field
              label="System Lifespan (years)"
              hint="Quality systems are rated for 20–25 years."
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
