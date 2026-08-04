/**
 * FinancingPanel.jsx
 * GridScale Africa
 *
 * Financing calculator panel for the QuotationBuilder.
 * Shows an optional monthly repayment figure alongside the lump sum total.
 * This is a presentation tool — GridScale is not the lender.
 *
 * Props:
 *   quoteTotalNaira  {number}   required — final quote total including VAT
 *   initialTerms     {object}   optional — pre-populate from quotation.financing_terms
 *   onChange         {fn}       called with financing terms object (or null) on change
 */

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RATE_OPTIONS = [
  { label: "18%", rate: 0.18 },
  { label: "20%", rate: 0.2 },
  { label: "22%", rate: 0.22 },
  { label: "Custom", rate: null },
];

const TERM_OPTIONS = [
  { label: "1yr", months: 12 },
  { label: "2yr", months: 24 },
  { label: "3yr", months: 36 },
  { label: "5yr", months: 60 },
  { label: "7yr", months: 84 },
  { label: "10yr", months: 120 },
];

const DP_TICKS = [0, 10, 20, 30, 50];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtNaira = (n) =>
  n != null ? `₦${Math.round(n).toLocaleString()}` : "—";

// Timer lives at module scope — avoids touching React refs during render.
// Safe because only one FinancingPanel mounts at a time.
let _loanPreviewTimer = null;

// ---------------------------------------------------------------------------
// SegmentedControl
// ---------------------------------------------------------------------------

function SegmentedControl({ options, selectedIdx, onSelect }) {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`flex-1 text-[11px] py-1.5 transition-all border-0 ${
            i < options.length - 1 ? "border-r border-gray-200" : ""
          } ${
            selectedIdx === i
              ? "bg-gray-900 text-white font-medium"
              : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FinancingPanel
// ---------------------------------------------------------------------------

export function FinancingPanel({
  quoteTotalNaira,
  initialTerms = null,
  onChange,
}) {
  const defaultRateIdx = 2; // 22%
  const defaultTermIdx = 3; // 5yr

  const [open, setOpen] = useState(!!initialTerms);
  const [rateIdx, setRateIdx] = useState(() => {
    if (!initialTerms) return defaultRateIdx;
    const match = RATE_OPTIONS.findIndex(
      (o) => o.rate === initialTerms.annualRate,
    );
    return match >= 0 ? match : 3; // Custom
  });
  const [customRate, setCustomRate] = useState(
    initialTerms?.annualRate
      ? String(Math.round(initialTerms.annualRate * 100))
      : "22",
  );
  const [termIdx, setTermIdx] = useState(() => {
    if (!initialTerms) return defaultTermIdx;
    const match = TERM_OPTIONS.findIndex(
      (o) => o.months === initialTerms.termMonths,
    );
    return match >= 0 ? match : defaultTermIdx;
  });
  const [dp, setDp] = useState(initialTerms?.downPayment ?? 0);

  const [schedule, setSchedule] = useState(initialTerms ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIdRef = useRef(0);

  // Derived values
  const rate =
    RATE_OPTIONS[rateIdx].rate ?? (parseFloat(customRate) / 100 || 0.22);
  const termMonths = TERM_OPTIONS[termIdx].months;
  const dpPct = quoteTotalNaira ? Math.round((dp / quoteTotalNaira) * 100) : 0;
  const isCustom = RATE_OPTIONS[rateIdx].rate === null;

  // ---------------------------------------------------------------------------
  // Fetch from API
  // Debounced via module-level timer so rapid input changes don't hammer
  // the endpoint. fetchIdRef cancels stale in-flight requests.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!open || !quoteTotalNaira) return;

    // Clear any pending debounce from a previous keystroke
    clearTimeout(_loanPreviewTimer);

    _loanPreviewTimer = setTimeout(async () => {
      if (!quoteTotalNaira || quoteTotalNaira <= 0 || dp >= quoteTotalNaira)
        return;

      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/cashflow/loan-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            capexNaira: quoteTotalNaira,
            annualRate: rate,
            termMonths,
            downPayment: dp,
          }),
        });

        if (fetchId !== fetchIdRef.current) return;
        if (!res.ok) throw new Error("Could not compute repayment");

        const { schedule: s } = await res.json();
        if (fetchId !== fetchIdRef.current) return;

        const terms = {
          ...s,
          annualRate: rate,
          termMonths,
          computedAt: new Date().toISOString(),
        };
        setSchedule(terms);
        onChange?.(terms);
      } catch (err) {
        if (fetchId === fetchIdRef.current) {
          setError(err.message);
          setSchedule(null);
          onChange?.(null);
        }
      } finally {
        if (fetchId === fetchIdRef.current) setLoading(false);
      }
    }, 400);

    return () => clearTimeout(_loanPreviewTimer);
  }, [open, quoteTotalNaira, rate, termMonths, dp]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleRateSelect = (idx) => {
    setRateIdx(idx);
    if (RATE_OPTIONS[idx].rate !== null) {
      setCustomRate(String(Math.round(RATE_OPTIONS[idx].rate * 100)));
    }
  };

  const handleCustomRate = (val) => {
    setCustomRate(val);
    // rate will be derived on next render via the `rate` computed above
  };

  const handleDpSlider = (val) => {
    setDp(Math.min(Number(val), quoteTotalNaira - 1));
  };

  const handleDpManual = (val) => {
    const n = parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;
    setDp(Math.min(n, quoteTotalNaira - 1));
  };

  const handleDpTick = (pct) => {
    setDp(Math.round((quoteTotalNaira * pct) / 100));
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const yrs = termMonths / 12;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (!next) {
            setSchedule(null);
            onChange?.(null);
          }
        }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full shrink-0 transition-colors ${open ? "bg-teal-500" : "bg-gray-300"}`}
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Monthly repayment
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {open && schedule && !loading ? (
                <span className="text-teal-700 font-mono font-medium">
                  {fmtNaira(schedule.monthlyRepayment)}/month · {yrs}yr ·{" "}
                  {Math.round(rate * 100)}% p.a.
                </span>
              ) : (
                "Show customer a financing alternative to the lump sum"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {open && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                setSchedule(null);
                onChange?.(null);
              }}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.stopPropagation(),
                setOpen(false),
                setSchedule(null),
                onChange?.(null))
              }
              className="text-[11px] text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              Remove
            </span>
          )}
          {open ? (
            <ChevronUp size={15} className="text-gray-400" />
          ) : (
            <ChevronDown size={15} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* ── Body ── */}
      {open && (
        <div className="border-t border-gray-100 p-5">
          {/* Hero — the number that matters */}
          <div className="flex border border-gray-100 rounded-xl overflow-hidden mb-5">
            <div className="flex-1 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Monthly repayment
              </p>
              {loading ? (
                <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-medium font-mono text-gray-900 tracking-tight leading-none">
                  {fmtNaira(schedule?.monthlyRepayment)}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                over {yrs} year{yrs > 1 ? "s" : ""} · {Math.round(rate * 100)}%
                p.a.
              </p>
            </div>

            <div className="w-px bg-gray-100" />

            <div className="flex flex-col justify-between px-4 py-4 bg-gray-50 min-w-35">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                  Total repayable
                </p>
                <p className="text-sm font-medium font-mono text-gray-800">
                  {loading ? "—" : fmtNaira(schedule?.totalRepayable)}
                </p>
              </div>
              <div className="h-px bg-gray-200 my-3" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                  Interest cost
                </p>
                <p className="text-sm font-medium font-mono text-amber-700">
                  {loading ? "—" : fmtNaira(schedule?.totalInterest)}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Rate */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-20 shrink-0">
                Interest rate
              </span>
              <div className="flex-1">
                <SegmentedControl
                  options={RATE_OPTIONS}
                  selectedIdx={rateIdx}
                  onSelect={handleRateSelect}
                />
              </div>
              {isCustom && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    step={0.5}
                    value={customRate}
                    onChange={(e) => handleCustomRate(e.target.value)}
                    className="w-14 text-right text-[13px] font-mono border border-gray-200 rounded-lg px-2 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    autoFocus
                  />
                  <span className="text-xs text-gray-400">%/yr</span>
                </div>
              )}
            </div>
            shrink-0
            {/* Term */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-20 shrink-0">Term</span>
              <div className="flex-1">
                <SegmentedControl
                  options={TERM_OPTIONS}
                  selectedIdx={termIdx}
                  onSelect={setTermIdx}
                  shrink-0
                />
              </div>
            </div>
            {/* Down payment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 w-20 shrink-0">
                  Down payment
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">
                    {dpPct}%
                  </span>
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs text-gray-400">₦</span>
                    <input
                      type="text"
                      value={dp.toLocaleString()}
                      onChange={(e) => handleDpManual(e.target.value)}
                      className="w-24 text-[13px] font-mono text-gray-800 bg-transparent border-none outline-none"
                    />
                  </div>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(0, (quoteTotalNaira ?? 0) - 1)}
                step={50_000}
                value={dp}
                onChange={(e) => handleDpSlider(e.target.value)}
                className="w-full accent-teal-600"
                aria-label="Down payment"
              />

              <div className="flex justify-between mt-1.5">
                {DP_TICKS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleDpTick(pct)}
                    className={`text-[10px] transition-colors ${
                      dpPct === pct
                        ? "text-teal-600 font-medium"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-1.5 mt-4 pt-4 border-t border-gray-100">
            <Info size={12} className="text-gray-300 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Indicative only. Final terms depend on the lender the customer
              chooses — LAPO (18%), Bank of Industry (20%), commercial banks
              (22%+).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
