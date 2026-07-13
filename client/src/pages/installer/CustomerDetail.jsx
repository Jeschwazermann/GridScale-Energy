import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  Cpu,
  ClipboardList,
  ChevronDown,
  Plus,
  AlertCircle,
  Loader,
} from "lucide-react";
import InstallerLayout from "../../layouts/installer";
import ResultCard from "../../components/ResultCard";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import { fetchSizing } from "../../services/installerApi";

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_STYLES = {
  new: "bg-gray-100 text-gray-600",
  quoted: "bg-blue-50 text-blue-600",
  follow_up: "bg-amber-50 text-amber-700",
  converted: "bg-teal-50 text-teal-700",
  lost: "bg-red-50 text-red-500",
};

const STATUSES = [
  { value: "new", label: "New" },
  { value: "quoted", label: "Quoted" },
  { value: "follow_up", label: "Follow Up" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

/* ─── Formatters ─────────────────────────────────────────────── */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function getApplianceEmoji(name = "") {
  const n = name.toLowerCase();
  if (n.includes("tv") || n.includes("television")) return "📺";
  if (n.includes("fridge") || n.includes("refrigerator")) return "🧊";
  if (n.includes("ac") || n.includes("air con") || n.includes("aircond"))
    return "❄️";
  if (n.includes("washing") || n.includes("washer")) return "🫧";
  if (n.includes("bulb") || n.includes("light") || n.includes("lamp"))
    return "💡";
  if (n.includes("fan")) return "🌀";
  if (n.includes("freezer")) return "🧊";
  if (n.includes("microwave") || n.includes("oven")) return "📡";
  if (n.includes("pump") || n.includes("water")) return "💧";
  if (n.includes("computer") || n.includes("laptop") || n.includes("pc"))
    return "💻";
  if (n.includes("phone") || n.includes("charger")) return "🔌";
  if (n.includes("iron")) return "👕";
  return "⚡";
}

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { id: "assessment", label: "Assessment Results", icon: ClipboardList },
  { id: "sizing", label: "System Sizing", icon: Cpu },
  { id: "quotation", label: "Quotation", icon: FileText },
];

/* ─── CustomerDetail ─────────────────────────────────────────── */
export default function CustomerDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("assessment");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Sizing */
  const [sizing, setSizing] = useState(null);
  const [sizingLoading, setSizingLoading] = useState(false);
  const [sizingError, setSizingError] = useState(null);

  /* ✅ NEW: track last fetched index safely */
  const [lastSizedIdx, setLastSizedIdx] = useState(null);

  /* Status update */
  const [statusUpdating, setStatusUpdating] = useState(false);

  /* ── Fetch customer + assessments ──
     Depends on user?.id (stable string) instead of user (object
     reference). Supabase fires onAuthStateChange on every token
     refresh, which creates a new user object — causing this effect
     to re-run even though the actual user hasn't changed. Using
     user?.id means it only re-runs when the user ID itself changes
     (i.e. a real sign-in/sign-out), not on token refreshes. */
  useEffect(() => {
    if (!user?.id || !id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("customers")
        .select("*, assessments(*), quotations(*)")
        .eq("id", id)
        .eq("installer_id", user.id)
        .single();

      if (cancelled) return;

      if (err || !data) {
        setError("Customer not found.");
        setLoading(false);
        return;
      }

      setCustomer(data);

      const sorted = (data.assessments ?? []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setAssessments(sorted);
      setSelectedIdx(0);

      /* ✅ reset sizing state cleanly */
      setSizing(null);
      setSizingError(null);
      setLastSizedIdx(null);

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, id]); // ← was [user, id] — see comment above

  /* ── Selected assessment ── */
  const selectedAssessment = assessments[selectedIdx] ?? null;
  const assessmentResult =
    selectedAssessment?.result ?? selectedAssessment?.results ?? null;
  const lifespan = selectedAssessment?.settings?.lifespan ?? 25;
  const effectiveDailyKWh = assessmentResult?.energy?.effectiveDailyKWh ?? null;

  /* ── Load sizing (SAFE VERSION) ── */
  const sizingFetchIdRef = useRef(0);

  useEffect(() => {
    if (activeTab !== "sizing") return;
    if (!effectiveDailyKWh) return;

    /* ✅ prevent duplicate fetch */
    if (lastSizedIdx === selectedIdx) return;

    let cancelled = false;
    const fetchId = ++sizingFetchIdRef.current;

    (async () => {
      setSizingLoading(true);
      setSizingError(null);

      try {
        const { data } = await fetchSizing(effectiveDailyKWh);

        if (cancelled || fetchId !== sizingFetchIdRef.current) return;

        setSizing(data);

        /* ✅ update AFTER success */
        setLastSizedIdx(selectedIdx);
      } catch (err) {
        if (cancelled || fetchId !== sizingFetchIdRef.current) return;

        setSizingError(
          err?.response?.data?.error || "Sizing calculation failed.",
        );
      } finally {
        if (!cancelled && fetchId === sizingFetchIdRef.current) {
          setSizingLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedIdx, effectiveDailyKWh, lastSizedIdx]);

  /* ── Update status ── */
  const updateStatus = async (newStatus) => {
    setStatusUpdating(true);
    await supabase
      .from("customers")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("installer_id", user.id);
    setCustomer((prev) => ({ ...prev, status: newStatus }));
    setStatusUpdating(false);
  };

  /* ── Render ── */
  if (loading) {
    return (
      <InstallerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader size={24} className="text-teal-600 animate-spin" />
        </div>
      </InstallerLayout>
    );
  }

  if (error || !customer) {
    return (
      <InstallerLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">
              {error ?? "Customer not found."}
            </p>
          </div>
          <Link
            to="/installer/customers"
            className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium mt-4"
          >
            <ArrowLeft size={15} /> Back to Customers
          </Link>
        </div>
      </InstallerLayout>
    );
  }

  return (
    <InstallerLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Back ── */}
        <Link
          to="/installer/customers"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-teal-600 font-medium transition-colors"
        >
          <ArrowLeft size={15} /> Back to Customers
        </Link>

        {/* ── Customer Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-teal-700 text-xl font-bold font-display">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-gray-900">
                  {customer.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {customer.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Phone size={11} />
                      {customer.phone}
                    </span>
                  )}
                  {customer.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Mail size={11} />
                      {customer.email}
                    </span>
                  )}
                  {customer.state && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={11} />
                      {customer.state}
                      {customer.lga ? `, ${customer.lga}` : ""}
                    </span>
                  )}
                </div>
                {customer.notes && (
                  <p className="text-xs text-gray-400 mt-2 max-w-md">
                    {customer.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <select
                  value={customer.status ?? "new"}
                  disabled={statusUpdating}
                  onChange={(e) => updateStatus(e.target.value)}
                  className={`appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                    STATUS_STYLES[customer.status] ?? STATUS_STYLES.new
                  }`}
                >
                  {STATUSES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                />
              </div>

              <Link
                to="/installer/new-assessment"
                state={{ customerId: customer.id, customerName: customer.name }}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              >
                <Plus size={13} /> New Assessment
              </Link>
            </div>
          </div>

          <p className="text-xs text-gray-300 mt-4">
            Added {fmtDate(customer.created_at)}
            {assessments.length > 0 &&
              ` · ${assessments.length} assessment${assessments.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={15} strokeWidth={activeTab === id ? 2.2 : 1.8} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab panels — kept mounted with `hidden` to avoid
             unmount/remount flicker and redundant re-fetches ── */}

        {/* Assessment Results */}
        <div className={activeTab === "assessment" ? "" : "hidden"}>
          {assessments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
              <ClipboardList size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400 mb-1">
                No assessments yet
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Run an assessment to see energy costs and solar savings for this
                customer.
              </p>
              <Link
                to="/installer/new-assessment"
                state={{
                  customerId: customer.id,
                  customerName: customer.name,
                }}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
              >
                <Plus size={14} /> Run Assessment
              </Link>
            </div>
          ) : (
            <>
              {assessments.length > 1 && (
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-sm text-gray-500 font-medium shrink-0">
                    Viewing:
                  </p>
                  <select
                    value={selectedIdx}
                    onChange={(e) => {
                      setSelectedIdx(Number(e.target.value));
                      setSizing(null);
                    }}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {assessments.map((a, i) => (
                      <option key={a.id} value={i}>
                        Assessment {assessments.length - i} —{" "}
                        {fmtDate(a.created_at)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedAssessment?.settings?.source ===
                "consumer_calculator" && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 flex items-start gap-3 mb-4">
                  <span className="text-blue-500 text-base shrink-0">ℹ️</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-700">
                      From consumer calculator
                    </p>
                    <p className="text-xs text-blue-500 mt-0.5">
                      This assessment was submitted by {customer.name} using the
                      public calculator. Run a new assessment below to capture
                      full appliance-level detail.
                    </p>
                  </div>
                </div>
              )}

              {assessmentResult && (
                <ResultCard
                  result={assessmentResult}
                  lifespan={lifespan}
                  suggestedCapex={null}
                  currentCapex={selectedAssessment?.settings?.capex ?? null}
                  calculatorInputs={
                    selectedAssessment?.settings?.source ===
                    "consumer_calculator"
                      ? null
                      : undefined
                  }
                />
              )}

              {selectedAssessment?.appliances?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
                    Appliances Entered
                  </p>

                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 mb-2 px-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-300">
                      Appliance
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-300 text-right">
                      Power
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-300 text-right">
                      Daily use
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-300 text-right">
                      Units
                    </span>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {selectedAssessment.appliances.map((a, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center py-3 px-1 hover:bg-gray-50/60 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <span className="text-sm">
                              {getApplianceEmoji(a.name)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {a.name || `Appliance ${i + 1}`}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {a.power}W
                        </span>
                        <span className="text-sm text-gray-500 text-right whitespace-nowrap">
                          {a.hours} hrs
                        </span>
                        <div className="flex justify-end">
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">
                            {a.units}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {selectedAssessment.appliances.length} appliance
                      {selectedAssessment.appliances.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-gray-400">
                      Total load:{" "}
                      <span className="font-semibold text-gray-600">
                        {selectedAssessment.appliances
                          .reduce((sum, a) => sum + (a.power * a.units || 0), 0)
                          .toLocaleString()}
                        W
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* System Sizing */}
        <div className={activeTab === "sizing" ? "" : "hidden"}>
          <div className="space-y-4">
            {!effectiveDailyKWh ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center">
                <Cpu size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">
                  Run an assessment first to size the system.
                </p>
              </div>
            ) : sizingLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 flex items-center justify-center gap-3">
                <Loader size={20} className="text-teal-600 animate-spin" />
                <p className="text-sm text-gray-400">
                  Calculating system size…
                </p>
              </div>
            ) : sizingError ? (
              <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{sizingError}</p>
              </div>
            ) : sizing ? (
              <>
                <div className="bg-teal-600 rounded-2xl p-6 text-white">
                  <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-2">
                    Effective Daily Load
                  </p>
                  <p className="font-display font-extrabold text-4xl">
                    {sizing.effectiveDailyKWh.toFixed(1)}
                    <span className="text-xl font-normal text-teal-200 ml-1">
                      kWh/day
                    </span>
                  </p>
                  <p className="text-teal-200 text-xs mt-1">
                    Includes 25% diversity buffer + 20% system loss allowance
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Inverter",
                      value: `${sizing.inverter.sizeKva} kVA`,
                      sub: sizing.inverter.label,
                      icon: "⚡",
                    },
                    {
                      title: "Solar Panels",
                      value: `${sizing.panels.count} panels`,
                      sub: sizing.panels.label,
                      icon: "☀️",
                    },
                    {
                      title: "Battery Bank",
                      value: `${sizing.battery.totalKwh} kWh`,
                      sub: sizing.battery.label,
                      icon: "🔋",
                    },
                  ].map(({ title, value, sub, icon }) => (
                    <div
                      key={title}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                    >
                      <p className="text-2xl mb-3">{icon}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                        {title}
                      </p>
                      <p className="font-display font-bold text-xl text-gray-900">
                        {value}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        {sub}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                    Estimated CAPEX Range
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-extrabold text-3xl text-gray-900">
                        {sizing.capex.min >= 1_000_000
                          ? `₦${(sizing.capex.min / 1_000_000).toFixed(1)}M`
                          : `₦${(sizing.capex.min / 1_000).toFixed(0)}K`}
                        <span className="text-gray-300 font-normal mx-2">
                          —
                        </span>
                        {sizing.capex.max >= 1_000_000
                          ? `₦${(sizing.capex.max / 1_000_000).toFixed(1)}M`
                          : `₦${(sizing.capex.max / 1_000).toFixed(0)}K`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {sizing.capex.tier} system · Nigerian market pricing
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("quotation")}
                      className="text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors"
                    >
                      Build Quotation →
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Quotation */}
        <div className={activeTab === "quotation" ? "" : "hidden"}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Quotation Builder
                </p>
                <h2 className="font-display font-bold text-gray-900 text-xl">
                  Open the dedicated quotation workspace
                </h2>
                <p className="text-sm text-gray-500 mt-2 max-w-2xl">
                  Build, update, and save quotations for this customer from a
                  full-screen page with the selected assessment context.
                </p>
              </div>
              <Link
                to={`/installer/customers/${customer.id}/quotation-builder`}
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all"
              >
                <FileText size={15} /> Open Builder
              </Link>
            </div>

            {!selectedAssessment ? (
              <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-500">
                Run an assessment first to start building a quotation.
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-600">
                Current assessment: {fmtDate(selectedAssessment.created_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    </InstallerLayout>
  );
}
