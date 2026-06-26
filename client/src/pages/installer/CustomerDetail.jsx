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
  Trash2,
  AlertCircle,
  Loader,
  Save,
  CheckCircle,
} from "lucide-react";
import InstallerLayout from "../../layouts/installer";
import ResultCard from "../../components/ResultCard";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import {
  fetchSizing,
  createQuotation,
  updateQuotation,
} from "../../services/installerApi";

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
const fmtShort = (v) => {
  if (!v) return "—";
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
  return `₦${Math.round(v)}`;
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtNaira = (v) =>
  v != null
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(v)
    : "₦0";

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { id: "assessment", label: "Assessment Results", icon: ClipboardList },
  { id: "sizing", label: "System Sizing", icon: Cpu },
  { id: "quotation", label: "Quotation", icon: FileText },
];

/* ─── Empty line item ────────────────────────────────────────── */
const emptyItem = () => ({
  id: crypto.randomUUID?.() ?? Date.now(),
  description: "",
  quantity: 1,
  unitPrice: 0,
});

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

  /* Quotation */
  const [quotation, setQuotation] = useState(null);
  const [lineItems, setLineItems] = useState([emptyItem()]);
  const [savingQuote, setSavingQuote] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [notes, setNotes] = useState("");
  const [validityDate, setValidityDate] = useState("");

  /* Status update */
  const [statusUpdating, setStatusUpdating] = useState(false);

  /* Tracks whether a quotation already existed when the page loaded,
     so the sizing pre-population logic doesn't depend on a stale
     closure over `quotation` state. */
  const hasExistingQuoteRef = useRef(false);

  /* Caches sizing results per assessment id so re-opening the sizing
     tab, or re-selecting an assessment you've already viewed, doesn't
     refire a network call. A plain ref is the "useEffect-free" form
     of memoization here — no extra render, no extra effect. */
  const sizingCacheRef = useRef(new Map());

  /* Ignores a sizing response if the user has since navigated to a
     different assessment while the request was in flight. */
  const sizingRequestIdRef = useRef(null);

  /* Guards against double-fetching the same customer — e.g. React 18
     Strict Mode mounting effects twice in dev. */
  const loadedForRef = useRef(null);

  /* ── Fetch customer + assessments ──
     This is the ONLY effect tied to an external input (route `id` +
     authenticated `user`). Nothing else is allowed to be an effect
     chained off the state this one sets — sizing is fetched
     imperatively (see fetchSizingFor below), not reactively, which is
     what actually stops the cascading-render warning. */
  useEffect(() => {
    if (!user || !id) return;

    const key = `${user.id}:${id}`;
    if (loadedForRef.current === key) return;
    loadedForRef.current = key;

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

      const existingQuote = data.quotations?.[0];
      hasExistingQuoteRef.current = Boolean(existingQuote);

      if (existingQuote) {
        setQuotation(existingQuote);
        setLineItems(
          existingQuote.line_items?.length
            ? existingQuote.line_items
            : [emptyItem()],
        );
        setNotes(existingQuote.notes ?? "");
        setValidityDate(existingQuote.validity_date ?? "");
      } else {
        setQuotation(null);
        setLineItems([emptyItem()]);
        setNotes("");
        setValidityDate("");
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, id]);

  /* ── Selected assessment ── */
  const selectedAssessment = assessments[selectedIdx] ?? null;
  const assessmentResult = selectedAssessment?.results ?? null;
  const lifespan = selectedAssessment?.settings?.lifespan ?? 25;
  const effectiveDailyKWh = assessmentResult?.energy?.effectiveDailyKWh ?? null;

  /* ── Sizing fetch ──
     Imperative, not effect-driven: called directly from the tab-click
     handler and the assessment-selector handler below. This is the
     change that actually removes the cascading-render warning — there
     is no effect watching `activeTab` / `effectiveDailyKWh` / `sizing`
     together and re-deriving whether to fetch. The call site simply
     decides "I need sizing for assessment X" and asks for it. */
  const fetchSizingFor = async (assessment) => {
    if (!assessment) return;

    const kwh = assessment.results?.energy?.effectiveDailyKWh ?? null;
    if (!kwh) return;

    /* Served from cache — no network call, no loading flicker. */
    const cached = sizingCacheRef.current.get(assessment.id);
    if (cached) {
      setSizing(cached);
      setSizingError(null);
      return;
    }

    sizingRequestIdRef.current = assessment.id;
    setSizing(null);
    setSizingLoading(true);
    setSizingError(null);

    try {
      const { data } = await fetchSizing(kwh);

      /* Drop this response if the user has since moved to a
         different assessment while the request was in flight. */
      if (sizingRequestIdRef.current !== assessment.id) return;

      sizingCacheRef.current.set(assessment.id, data);
      setSizing(data);

      /* Only auto-populate line items when there was no saved
         quotation to begin with. */
      if (!hasExistingQuoteRef.current && data) {
        setLineItems([
          {
            id: 1,
            description: data.inverter.label,
            quantity: 1,
            unitPrice: 0,
          },
          { id: 2, description: data.panels.label, quantity: 1, unitPrice: 0 },
          { id: 3, description: data.battery.label, quantity: 1, unitPrice: 0 },
          {
            id: 4,
            description: "Installation & Labour",
            quantity: 1,
            unitPrice: 0,
          },
        ]);
      }
    } catch (err) {
      if (sizingRequestIdRef.current !== assessment.id) return;
      setSizingError(err.response?.data?.error || "Sizing calculation failed.");
    } finally {
      if (sizingRequestIdRef.current === assessment.id) {
        setSizingLoading(false);
      }
    }
  };

  /* ── Tab click: fetch sizing only when the user actually opens the
     sizing tab, instead of reactively watching activeTab in an effect. ── */
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "sizing" && selectedAssessment) {
      void fetchSizingFor(selectedAssessment);
    }
  };

  /* ── Switching assessment: refresh sizing only if that tab is
     already open; otherwise it'll be fetched on next tab click. ── */
  const handleSelectAssessment = (idx) => {
    setSelectedIdx(idx);
    const next = assessments[idx];
    if (activeTab === "sizing" && next) {
      void fetchSizingFor(next);
    }
  };

  /* ── Update status ── */
  const updateStatus = async (newStatus) => {
    setStatusUpdating(true);
    const previousStatus = customer.status;

    /* Optimistic update with rollback on failure */
    setCustomer((prev) => ({ ...prev, status: newStatus }));

    const { error: err } = await supabase
      .from("customers")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("installer_id", user.id);

    if (err) {
      setCustomer((prev) => ({ ...prev, status: previousStatus }));
    }

    setStatusUpdating(false);
  };

  /* ── Quotation line item helpers ── */
  const addLineItem = () => setLineItems((prev) => [...prev, emptyItem()]);
  const removeLineItem = (itemId) =>
    setLineItems((prev) => prev.filter((i) => i.id !== itemId));
  const updateLineItem = (itemId, field, value) =>
    setLineItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
    );

  const totalCost = lineItems.reduce(
    (sum, i) =>
      sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),
    0,
  );

  /* ── Save quotation ── */
  const saveQuotation = async () => {
    if (!selectedAssessment) return;
    setSavingQuote(true);
    try {
      const payload = {
        assessmentId: selectedAssessment.id,
        lineItems,
        notes,
        validityDate: validityDate || null,
      };

      const { data: saved } = quotation?.id
        ? await updateQuotation(quotation.id, payload)
        : await createQuotation(payload);

      setQuotation(saved);
      hasExistingQuoteRef.current = true;
      setQuoteSaved(true);
      setTimeout(() => setQuoteSaved(false), 3000);
    } catch (err) {
      /* silently fail for now — could add toast here */
    } finally {
      setSavingQuote(false);
    }
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
            {/* Avatar + info */}
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

            {/* Status + actions */}
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

          {/* Added date */}
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
              onClick={() => handleTabClick(id)}
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

        {/* ── Tab: Assessment Results ── */}
        {activeTab === "assessment" && (
          <div>
            {assessments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
                <ClipboardList
                  size={36}
                  className="text-gray-200 mx-auto mb-3"
                />
                <p className="text-sm font-semibold text-gray-400 mb-1">
                  No assessments yet
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Run an assessment to see energy costs and solar savings for
                  this customer.
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
                {/* Assessment selector (if multiple) */}
                {assessments.length > 1 && (
                  <div className="flex items-center gap-3 mb-4">
                    <p className="text-sm text-gray-500 font-medium shrink-0">
                      Viewing:
                    </p>
                    <select
                      value={selectedIdx}
                      onChange={(e) =>
                        handleSelectAssessment(Number(e.target.value))
                      }
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

                {/* ResultCard */}
                {assessmentResult && (
                  <ResultCard
                    result={assessmentResult}
                    lifespan={lifespan}
                    suggestedCapex={null}
                    currentCapex={selectedAssessment?.settings?.capex ?? null}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ── Tab: System Sizing ── */}
        {activeTab === "sizing" && (
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
                {/* Load summary */}
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

                {/* System specs */}
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

                {/* CAPEX range */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                    Estimated CAPEX Range
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-extrabold text-3xl text-gray-900">
                        {fmtShort(sizing.capex.min)}
                        <span className="text-gray-300 font-normal mx-2">
                          —
                        </span>
                        {fmtShort(sizing.capex.max)}
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
        )}

        {/* ── Tab: Quotation ── */}
        {activeTab === "quotation" && (
          <div className="space-y-4">
            {!selectedAssessment ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center">
                <FileText size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">
                  Run an assessment before building a quotation.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Quotation header */}
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-gray-900">
                      Quotation Builder
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      For {customer.name} · Based on assessment{" "}
                      {fmtDate(selectedAssessment.created_at)}
                    </p>
                  </div>
                  {quoteSaved && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                      <CheckCircle size={14} /> Saved
                    </span>
                  )}
                </div>

                <div className="px-6 py-6 space-y-6">
                  {/* Line items table */}
                  <div>
                    <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr_36px] gap-3 mb-2">
                      {[
                        "Description",
                        "Qty",
                        "Unit Price (₦)",
                        "Total",
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
                      {lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_36px] gap-2 items-center"
                        >
                          <input
                            type="text"
                            placeholder="e.g. 5kVA Inverter"
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                          />
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "unitPrice",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                          />
                          <p className="text-sm font-semibold text-gray-700 px-1">
                            {fmtShort(
                              (parseFloat(item.quantity) || 0) *
                                (parseFloat(item.unitPrice) || 0),
                            )}
                          </p>
                          <button
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length === 1}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-20 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addLineItem}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <Plus size={15} /> Add Line Item
                    </button>
                  </div>

                  {/* Total */}
                  <div className="bg-gray-50 rounded-xl px-5 py-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-600">Total</p>
                    <p className="font-display font-extrabold text-2xl text-gray-900">
                      {fmtNaira(totalCost)}
                    </p>
                  </div>

                  {/* Validity + notes */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Valid Until
                      </label>
                      <input
                        type="date"
                        value={validityDate}
                        onChange={(e) => setValidityDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Notes / Payment Terms
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 50% upfront, balance on installation"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={saveQuotation}
                      disabled={savingQuote}
                      className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all"
                    >
                      {savingQuote ? (
                        <Loader size={15} className="animate-spin" />
                      ) : (
                        <Save size={15} />
                      )}
                      {quotation?.id ? "Update Quotation" : "Save Quotation"}
                    </button>
                    <p className="text-xs text-gray-400">
                      PDF download coming soon
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </InstallerLayout>
  );
}
