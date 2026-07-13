import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader,
  Save,
  Trash2,
  Download,
  Calendar,
  Hash,
  Plus,
  Zap,
  Sun,
  BatteryCharging,
  Wrench,
  Check,
} from "lucide-react";
import InstallerLayout from "../../layouts/installer";
import { useAuth } from "../../contexts/useAuth";
import { supabase } from "../../lib/supabase";
import { createQuotation, updateQuotation } from "../../services/installerApi";

const VAT_RATE = 0.075;

const CATALOGUE = [
  {
    category: "Inverters",
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    activeBg: "bg-blue-100",
    items: [
      { description: "1kVA Inverter" },
      { description: "2kVA Inverter" },
      { description: "3kVA Inverter" },
      { description: "5kVA Inverter" },
      { description: "7.5kVA Inverter" },
      { description: "10kVA Inverter" },
      { description: "15kVA Inverter" },
    ],
  },
  {
    category: "Solar Panels",
    icon: Sun,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    activeBg: "bg-amber-100",
    items: [
      { description: "200Wp Solar Panel" },
      { description: "300Wp Solar Panel" },
      { description: "400Wp Solar Panel" },
      { description: "500Wp Solar Panel" },
      { description: "550Wp Solar Panel" },
    ],
  },
  {
    category: "Batteries",
    icon: BatteryCharging,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    activeBg: "bg-teal-100",
    items: [
      { description: "100Ah/12V Lithium (LiFePO4) Battery" },
      { description: "100Ah/24V Lithium (LiFePO4) Battery" },
      { description: "100Ah/48V Lithium (LiFePO4) Battery" },
      { description: "200Ah/48V Lithium (LiFePO4) Battery" },
      { description: "100Ah Tubular Battery" },
      { description: "200Ah Tubular Battery" },
    ],
  },
  {
    category: "Extras & Labour",
    icon: Wrench,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-100",
    activeBg: "bg-gray-200",
    items: [
      { description: "Installation & Labour" },
      { description: "DC Cables & Connectors" },
      { description: "AC Distribution Board" },
      { description: "Mounting Structure (Roof)" },
      { description: "Mounting Structure (Ground)" },
      { description: "Surge Protection Device" },
      { description: "Cable Management & Conduit" },
      { description: "System Commissioning & Testing" },
      { description: "Extended Warranty Package" },
    ],
  },
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

const fmtNaira = (v) =>
  v != null
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(v)
    : "₦0";

const emptyItem = (description = "") => ({
  id: Date.now() + Math.random(),
  description,
  quantity: 1,
  unitPrice: 0,
});

/* ─── CurrencyInput — fully controlled, no local state ──────── */
function CurrencyInput({ value, onChange }) {
  const handleChange = (e) => {
    const stripped = e.target.value.replace(/[^0-9]/g, "");
    onChange(stripped === "" ? 0 : parseFloat(stripped));
  };

  const display = value === 0 ? "" : Number(value).toLocaleString("en-NG");

  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-gray-400 text-sm font-medium select-none pointer-events-none">
        ₦
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder="0"
        className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
      />
    </div>
  );
}

/* ─── ComponentCatalogue ─────────────────────────────────────── */
function ComponentCatalogue({ lineItems, onAdd, onAddCustom }) {
  return (
    <div className="space-y-5">
      {CATALOGUE.map(
        ({ category, icon: Icon, color, bg, border, activeBg, items }) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center`}
              >
                <Icon size={13} className={color} strokeWidth={2} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                {category}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {items.map(({ description }) => {
                const existingCount = lineItems.filter(
                  (i) => i.description === description,
                ).length;
                const isAdded = existingCount > 0;

                return (
                  <button
                    key={description}
                    onClick={() => onAdd(description)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold
                      transition-all duration-150
                      ${
                        isAdded
                          ? `${activeBg} ${border} ${color}`
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    {isAdded ? (
                      <Check size={11} strokeWidth={2.5} />
                    ) : (
                      <Plus size={11} strokeWidth={2.5} />
                    )}
                    {description}
                    {isAdded && existingCount > 1 && (
                      <span className="ml-0.5 font-bold">×{existingCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ),
      )}

      <div>
        <button
          onClick={onAddCustom}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
        >
          <Plus size={11} strokeWidth={2.5} />
          Custom item
        </button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
const QuotationBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quotation, setQuotation] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [validityDate, setValidityDate] = useState("");
  const [savingQuote, setSavingQuote] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);

  /* ── Depends on user?.id not user — same fix as CustomerDetail.
     Token refreshes create a new user object reference but the same
     user.id string, so using user?.id prevents spurious re-fetches
     every time Supabase rotates the JWT on tab focus. ── */
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

      const sorted = (data.assessments ?? []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      setCustomer(data);
      setAssessments(sorted);
      setSelectedIdx(0);

      const existingQuote = data.quotations?.[0];
      if (existingQuote) {
        setQuotation(existingQuote);
        setLineItems(
          existingQuote.line_items?.length ? existingQuote.line_items : [],
        );
        setNotes(existingQuote.notes ?? "");
        setValidityDate(existingQuote.validity_date ?? "");
      } else {
        setQuotation(null);
        setLineItems([]);
        setNotes("");
        setValidityDate("");
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, id]); // ← was [user, id]

  const selectedAssessment = assessments[selectedIdx] ?? null;

  const handleCatalogueAdd = (description) =>
    setLineItems((prev) => [...prev, emptyItem(description)]);

  const handleAddCustom = () => setLineItems((prev) => [...prev, emptyItem()]);

  const removeLineItem = (itemId) =>
    setLineItems((prev) => prev.filter((i) => i.id !== itemId));

  const updateLineItem = (itemId, field, value) =>
    setLineItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
    );

  const subtotal = useMemo(
    () =>
      lineItems.reduce(
        (sum, i) =>
          sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),
        0,
      ),
    [lineItems],
  );

  const vat = subtotal * VAT_RATE;
  const totalCost = subtotal + vat;

  const quoteRef = quotation?.id
    ? `GSA-${String(quotation.id).slice(0, 8).toUpperCase()}`
    : "DRAFT";

  const itemIcon = (description) => {
    const d = description.toLowerCase();
    if (d.includes("inverter") || d.includes("ups"))
      return { Icon: Zap, color: "text-blue-400", bg: "bg-blue-50" };
    if (
      d.includes("panel") ||
      d.includes("solar") ||
      d.includes("wp") ||
      d.includes("pv")
    )
      return { Icon: Sun, color: "text-amber-400", bg: "bg-amber-50" };
    if (d.includes("battery") || d.includes("batt") || d.includes("ah"))
      return {
        Icon: BatteryCharging,
        color: "text-teal-500",
        bg: "bg-teal-50",
      };
    return { Icon: Wrench, color: "text-gray-400", bg: "bg-gray-100" };
  };

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
      let saved;
      if (quotation?.id) {
        const { data } = await updateQuotation(quotation.id, payload);
        saved = data;
      } else {
        const { data } = await createQuotation(payload);
        saved = data;
      }
      setQuotation(saved);
      setQuoteSaved(true);
      setTimeout(() => setQuoteSaved(false), 3000);
    } catch {
      // lightweight for now
    } finally {
      setSavingQuote(false);
    }
  };

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
          <button
            onClick={() => navigate(`/installer/customers/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium mt-4"
          >
            <ArrowLeft size={15} /> Back to customer
          </button>
        </div>
      </InstallerLayout>
    );
  }

  return (
    <InstallerLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <button
          onClick={() => navigate(`/installer/customers/${customer.id}`)}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-teal-600 font-medium transition-colors"
        >
          <ArrowLeft size={15} /> Back to customer
        </button>

        {/* ── Document header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                Quotation Builder
              </p>
              <h1 className="font-display font-bold text-xl text-gray-900">
                {customer.name}
              </h1>
              {customer.address && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {customer.address}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    quotation?.id
                      ? "bg-teal-100 text-teal-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {quotation?.id ? "Saved" : "Draft"}
                </span>
                {quoteSaved && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-teal-600">
                    <CheckCircle size={13} /> Saved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                <Hash size={11} />
                {quoteRef}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={11} />
                {fmtDate(new Date())}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main builder ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Based on
              </p>
              {assessments.length > 0 ? (
                <select
                  value={selectedIdx}
                  onChange={(e) => setSelectedIdx(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {assessments.map((a, i) => (
                    <option key={a.id} value={i}>
                      Assessment {assessments.length - i} —{" "}
                      {fmtDate(a.created_at)}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-500">
                  No assessments available.
                </p>
              )}
            </div>
          </div>

          {!selectedAssessment ? (
            <div className="mx-6 my-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
              <FileText size={32} className="mx-auto mb-3 text-gray-300" />
              <p>Run an assessment to enable the quotation builder.</p>
            </div>
          ) : (
            <div>
              {/* Section 1: Catalogue */}
              <div className="px-6 pt-6 pb-6 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">
                  System Components
                </p>
                <p className="text-xs text-gray-400 mb-5">
                  Select components to add them to the quote. Tap again to add
                  another unit.
                </p>
                <ComponentCatalogue
                  lineItems={lineItems}
                  onAdd={handleCatalogueAdd}
                  onAddCustom={handleAddCustom}
                />
              </div>

              {/* Section 2: Line items */}
              {lineItems.length > 0 && (
                <div className="px-6 pt-5 pb-2 border-b border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
                    Quote Items — Enter Prices
                  </p>

                  <div className="hidden md:grid grid-cols-[auto_3fr_80px_160px_140px_36px] gap-3 mb-2 px-1">
                    {[
                      { label: "" },
                      { label: "Description", align: "left" },
                      { label: "Qty", align: "center" },
                      { label: "Unit Price", align: "right" },
                      { label: "Total", align: "right" },
                      { label: "" },
                    ].map(({ label, align }, i) => (
                      <span
                        key={i}
                        className={`text-xs font-semibold text-gray-400 uppercase tracking-wide ${align ? `text-${align}` : ""}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-1.5 mb-4">
                    {lineItems.map((item, idx) => {
                      const rowTotal =
                        (parseFloat(item.quantity) || 0) *
                        (parseFloat(item.unitPrice) || 0);
                      const { Icon, color, bg } = itemIcon(item.description);
                      const isEven = idx % 2 === 0;

                      return (
                        <div
                          key={item.id}
                          className={`grid grid-cols-1 md:grid-cols-[auto_3fr_80px_160px_140px_36px] gap-2 items-center rounded-xl px-1 py-1.5 ${
                            isEven ? "bg-gray-50/60" : "bg-white"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg ${bg} items-center justify-center shrink-0 hidden md:flex`}
                          >
                            <Icon
                              size={14}
                              className={color}
                              strokeWidth={1.8}
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="Component description"
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
                          />

                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
                          />

                          <CurrencyInput
                            value={item.unitPrice}
                            onChange={(val) =>
                              updateLineItem(item.id, "unitPrice", val)
                            }
                          />

                          <div className="flex items-center justify-end px-2">
                            <span
                              className={`text-sm font-bold tabular-nums ${
                                rowTotal > 0 ? "text-gray-800" : "text-gray-300"
                              }`}
                            >
                              {rowTotal > 0 ? fmtNaira(rowTotal) : "—"}
                            </span>
                          </div>

                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Pricing Breakdown */}
              <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/50">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
                  Pricing Breakdown
                </p>
                <div className="max-w-sm ml-auto space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">
                      {fmtNaira(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      VAT{" "}
                      <span className="text-xs text-gray-400">
                        ({(VAT_RATE * 100).toFixed(1)}%)
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">
                      {fmtNaira(vat)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Total
                      </span>
                      <span
                        className="font-display font-extrabold text-gray-900 tabular-nums"
                        style={{ fontSize: "1.75rem", lineHeight: 1 }}
                      >
                        {fmtNaira(totalCost)}
                      </span>
                    </div>
                    {subtotal > 0 && (
                      <p className="text-xs text-gray-400 text-right mt-1.5">
                        Includes VAT of {fmtNaira(vat)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Payment & Validity */}
              <div className="border-b border-gray-100 px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
                  Payment &amp; Validity
                </p>
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
                    {validityDate && (
                      <p className="text-xs text-teal-600 mt-1.5 font-medium">
                        Offer valid until {fmtDate(validityDate)}
                      </p>
                    )}
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
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 flex items-center gap-3">
                <button
                  onClick={saveQuotation}
                  disabled={savingQuote || lineItems.length === 0}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  {savingQuote ? (
                    <Loader size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {quotation?.id ? "Update Quotation" : "Save Quotation"}
                </button>

                <button
                  disabled
                  className="inline-flex items-center gap-2 border border-gray-200 text-gray-400 font-semibold text-sm px-5 py-2.5 rounded-xl cursor-not-allowed bg-white"
                  title="Coming soon"
                >
                  <Download size={15} />
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </InstallerLayout>
  );
};

export default QuotationBuilderPage;
