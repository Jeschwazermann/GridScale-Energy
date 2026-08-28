/**
 * StepAppliances.jsx — Step 2 matching the mockup:
 * 4 stat cards with icons, appliance icon per row, two-panel add controls,
 * dropdown quick-add with "Browse full catalogue" footer.
 */

import { useState, useId } from "react";
import { MiniLoadCurve } from "./MiniLoadCurve.jsx";

// ---------------------------------------------------------------------------
// Appliance icon map — SVG icons keyed by keyword match
// ---------------------------------------------------------------------------
function ApplianceIcon({ name }) {
  const n = (name || "").toLowerCase();

  if (
    n.includes("fridge") ||
    n.includes("refrigerator") ||
    n.includes("freezer")
  )
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="3"
          y="1.5"
          width="10"
          height="13"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path d="M3 6h10" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M6 9v2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  if (
    n.includes("light") ||
    n.includes("led") ||
    n.includes("lamp") ||
    n.includes("bulb")
  )
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2a4 4 0 00-2 7.46V11h4V9.46A4 4 0 008 2z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M6 13h4M7 15h2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  if (n.includes("fan"))
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M8 6.5C8 4.5 9 2 11 2s2 2 0 3.5L8 6.5zM9.5 8C11.5 8 14 9 14 11s-2 2-3.5 0L9.5 8zM8 9.5C8 11.5 7 14 5 14s-2-2 0-3.5L8 9.5zM6.5 8C4.5 8 2 7 2 5s2-2 3.5 0L6.5 8z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (n.includes("tv") || n.includes("television"))
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="3"
          width="12"
          height="8"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M5 13h6M8 11v2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  if (n.includes("phone") || n.includes("charger"))
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="4.5"
          y="1"
          width="7"
          height="12"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M7 13.5h2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  if (n.includes("washing") || n.includes("washer"))
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="2"
          width="12"
          height="12"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M4 4.5h.5M6 4.5h.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  if (n.includes("air") || n.includes("ac") || n.includes("conditioner"))
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="4"
          width="12"
          height="5"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M5 9l-1.5 3M8 9v3M11 9l1.5 3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M5 6h6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  if (n.includes("pump") || n.includes("borehole"))
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2v7M5 6l3 3 3-3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 11h10a1 1 0 010 2H3a1 1 0 010-2z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    );
  if (n.includes("router") || n.includes("wifi") || n.includes("modem"))
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="3"
          y="9"
          width="10"
          height="5"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M5 7a4.24 4.24 0 016 0M3 5a7.07 7.07 0 0110 0"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="11" cy="11.5" r=".75" fill="currentColor" />
      </svg>
    );
  if (n.includes("printer"))
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="3"
          y="6"
          width="10"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M5 6V3h6v3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M5 10h6M5 12h4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  if (
    n.includes("laptop") ||
    n.includes("computer") ||
    n.includes("desktop") ||
    n.includes("pc")
  )
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="3"
          width="12"
          height="8"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M1 13h14"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  if (n.includes("security") || n.includes("cctv"))
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  // Generic plug
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M5 2v4M11 2v4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M3 6h10v2a5 5 0 01-10 0V6z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M8 12v2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Quick-add catalogue
// ---------------------------------------------------------------------------
const QUICK_ADD = [
  {
    appliance_name: "Air conditioner (1HP)",
    watts: 750,
    hours_weekday: 8,
    hours_weekend: 8,
    is_critical: false,
    load_factor: 0.7,
    active_hours: null,
  },
  {
    appliance_name: "Air conditioner (1.5HP)",
    watts: 1100,
    hours_weekday: 8,
    hours_weekend: 8,
    is_critical: false,
    load_factor: 0.7,
    active_hours: null,
  },
  {
    appliance_name: "Borehole pump (0.5HP)",
    watts: 373,
    hours_weekday: 2,
    hours_weekend: 2,
    is_critical: false,
    load_factor: 1.0,
    active_hours: "[6,7]",
  },
  {
    appliance_name: "Chest freezer",
    watts: 200,
    hours_weekday: 24,
    hours_weekend: 24,
    is_critical: true,
    load_factor: 0.6,
    active_hours: null,
  },
  {
    appliance_name: "Electric iron",
    watts: 1000,
    hours_weekday: 1,
    hours_weekend: 2,
    is_critical: false,
    load_factor: 1.0,
    active_hours: null,
  },
  {
    appliance_name: "Microwave",
    watts: 900,
    hours_weekday: 0.5,
    hours_weekend: 1,
    is_critical: false,
    load_factor: 1.0,
    active_hours: null,
  },
  {
    appliance_name: "Security lights",
    watts: 20,
    hours_weekday: 12,
    hours_weekend: 12,
    is_critical: false,
    load_factor: 1.0,
    active_hours: "[18,19,20,21,22,23,0,1,2,3,4,5]",
  },
  {
    appliance_name: "CCTV system",
    watts: 30,
    hours_weekday: 24,
    hours_weekend: 24,
    is_critical: false,
    load_factor: 1.0,
    active_hours: null,
  },
  {
    appliance_name: "Water dispenser",
    watts: 500,
    hours_weekday: 8,
    hours_weekend: 4,
    is_critical: false,
    load_factor: 0.5,
    active_hours: null,
  },
];

// ---------------------------------------------------------------------------
// Shared input styles
// ---------------------------------------------------------------------------
const numCls =
  "w-full text-center bg-transparent border-0 outline-none text-[13px] text-[var(--text-primary,#111)] tabular-nums py-0 focus:text-amber-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";
const txtCls =
  "w-full bg-transparent border-0 outline-none text-[13px] text-[var(--text-primary,#111)] focus:text-amber-700 placeholder:text-[var(--text-muted,#9ca3af)]";

// ---------------------------------------------------------------------------
// ApplianceRow
// ---------------------------------------------------------------------------
function ApplianceRow({ appliance, index, onChange, onRemove }) {
  const id = useId();
  const upd = (f, v) => onChange(index, { ...appliance, [f]: v });

  const dailyKwh = (
    (appliance.quantity *
      appliance.watts *
      (appliance.load_factor ?? 1) *
      appliance.hours_weekday) /
    1000
  ).toFixed(2);

  return (
    <tr className="group border-b border-[var(--border,#f3f4f6)] last:border-0 hover:bg-[var(--surface-2,#fafafa)] transition-colors duration-100">
      {/* Icon + name */}
      <td className="py-3 pl-4 pr-2 min-w-[160px]">
        <div className="flex items-center gap-2.5">
          <span className="shrink-0 text-[var(--text-muted,#9ca3af)] w-4 h-4">
            <ApplianceIcon name={appliance.appliance_name} />
          </span>
          <input
            id={`${id}-name`}
            type="text"
            className={txtCls}
            value={appliance.appliance_name}
            onChange={(e) => upd("appliance_name", e.target.value)}
            placeholder="Appliance name"
            aria-label="Appliance name"
          />
        </div>
      </td>

      {/* Qty */}
      <td className="py-3 px-2 w-14">
        <input
          type="number"
          className={numCls}
          value={appliance.quantity}
          min={1}
          max={99}
          onChange={(e) =>
            upd("quantity", Math.max(1, parseInt(e.target.value) || 1))
          }
          aria-label="Quantity"
        />
      </td>

      {/* Watts */}
      <td className="py-3 px-2 w-20">
        <input
          type="number"
          className={numCls}
          value={appliance.watts}
          min={0}
          step={5}
          onChange={(e) => upd("watts", parseFloat(e.target.value) || 0)}
          aria-label="Watts"
        />
      </td>

      {/* Hrs/wkday */}
      <td className="py-3 px-2 w-20">
        <input
          type="number"
          className={numCls}
          value={appliance.hours_weekday}
          min={0}
          max={24}
          step={0.5}
          onChange={(e) =>
            upd("hours_weekday", Math.min(24, parseFloat(e.target.value) || 0))
          }
          aria-label="Hours per weekday"
        />
      </td>

      {/* Hrs/wkend */}
      <td className="py-3 px-2 w-20">
        <input
          type="number"
          className={numCls}
          value={appliance.hours_weekend}
          min={0}
          max={24}
          step={0.5}
          onChange={(e) =>
            upd("hours_weekend", Math.min(24, parseFloat(e.target.value) || 0))
          }
          aria-label="Hours per weekend"
        />
      </td>

      {/* Daily kWh */}
      <td className="py-3 px-2 w-28 text-right pr-4">
        <span className="text-[13px] font-semibold tabular-nums text-emerald-600">
          {dailyKwh}
        </span>
        <span className="text-[11px] text-[var(--text-muted,#9ca3af)] ml-0.5">
          kWh
        </span>
      </td>

      {/* Critical toggle */}
      <td className="py-3 px-2 w-12 text-center">
        <button
          className="w-full flex items-center justify-center"
          onClick={() => upd("is_critical", !appliance.is_critical)}
          aria-pressed={appliance.is_critical}
          aria-label={
            appliance.is_critical
              ? "Critical — click to unmark"
              : "Mark as critical"
          }
          title={appliance.is_critical ? "Critical load" : "Not critical"}
        >
          {appliance.is_critical ? (
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_0_2.5px_theme(colors.amber.500/25%)] block" />
          ) : (
            <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-[var(--border-strong,#d1d5db)] block opacity-40 group-hover:opacity-70 transition-opacity" />
          )}
        </button>
      </td>

      {/* Remove */}
      <td className="py-3 pr-3 w-10 text-center">
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-[var(--text-muted,#9ca3af)] hover:text-red-500 p-0.5"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${appliance.appliance_name}`}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 3l8 8M11 3L3 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// StepAppliances
// ---------------------------------------------------------------------------
export function StepAppliances({
  appliances,
  loadCurve,
  onChange,
  onBack,
  onNext,
}) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleChange = (i, u) => {
    const n = [...appliances];
    n[i] = u;
    onChange(n);
  };
  const handleRemove = (i) => onChange(appliances.filter((_, j) => j !== i));
  const handleAddBlank = () =>
    onChange([
      ...appliances,
      {
        appliance_name: "",
        quantity: 1,
        watts: 0,
        hours_weekday: 0,
        hours_weekend: 0,
        is_critical: false,
        load_factor: 1.0,
        active_hours: null,
        sort_order: appliances.length,
      },
    ]);

  const handleQuickAdd = (t) => {
    onChange([
      ...appliances,
      {
        ...t,
        active_hours: t.active_hours
          ? typeof t.active_hours === "string"
            ? JSON.parse(t.active_hours)
            : t.active_hours
          : null,
        quantity: 1,
        sort_order: appliances.length,
      },
    ]);
    setShowQuickAdd(false);
  };

  const totalKwh = appliances.reduce(
    (a, x) =>
      a +
      (x.quantity * x.watts * (x.load_factor ?? 1) * x.hours_weekday) / 1000,
    0,
  );
  const peakW = appliances.reduce((a, x) => a + x.quantity * x.watts, 0);
  const critCount = appliances.filter((x) => x.is_critical).length;

  // Active hours summary from loadCurve
  const activeWindows = (() => {
    if (!loadCurve || loadCurve.length !== 24) return "—";
    const active = loadCurve
      .map((v, h) => (v > 0 ? h : null))
      .filter((h) => h !== null);
    if (!active.length) return "None";
    const windows = [];
    let start = active[0],
      prev = active[0];
    for (let i = 1; i <= active.length; i++) {
      const h = active[i];
      if (h === prev + 1) {
        prev = h;
        continue;
      }
      windows.push(start === prev ? `${start}h` : `${start}h–${prev}h`);
      start = prev = h;
    }
    return windows.join(", ");
  })();

  // Stat cards config
  const stats = [
    {
      label: "kWh / weekday",
      sub: "Daily energy usage",
      value: totalKwh.toFixed(1),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#10b981" strokeWidth="1.5" />
          <path
            d="M10 6v4l2.5 2.5"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7 10h6"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity=".4"
          />
        </svg>
      ),
      iconBg: "bg-emerald-50",
    },
    {
      label: "W peak demand",
      sub: "Highest power need",
      value: peakW.toLocaleString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 14L8 8l3 4 3-6 4 5"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      iconBg: "bg-emerald-50",
    },
    {
      label: critCount === 1 ? "Critical load" : "Critical loads",
      sub: critCount > 0 ? "Needs backup power" : "No critical loads",
      value: critCount,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 3L3 17h14L10 3z"
            stroke={critCount > 0 ? "#f59e0b" : "#9ca3af"}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M10 9v4"
            stroke={critCount > 0 ? "#f59e0b" : "#9ca3af"}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle
            cx="10"
            cy="14.5"
            r=".75"
            fill={critCount > 0 ? "#f59e0b" : "#9ca3af"}
          />
        </svg>
      ),
      iconBg: critCount > 0 ? "bg-amber-50" : "bg-[var(--surface-2,#f9fafb)]",
    },
    {
      label: "24H load profile",
      sub: activeWindows,
      value: null, // renders chart instead
      icon: null,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="pt-1">
        <h2 className="text-[19px] font-bold text-[var(--text-primary,#111)] tracking-[-0.02em] mb-1">
          Appliance list
        </h2>
        <p className="text-[13px] text-[var(--text-secondary,#6b7280)]">
          Review and customise the appliances in this assessment.
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-white border border-[var(--border,#e5e7eb)] rounded-xl px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            {s.value !== null ? (
              <>
                {s.icon && (
                  <div
                    className={`shrink-0 w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center`}
                  >
                    {s.icon}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-[22px] font-bold tabular-nums text-[var(--text-primary,#111)] leading-none tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text-secondary,#6b7280)] mt-0.5 leading-tight">
                    {s.label}
                  </div>
                  <div className="text-[10.5px] text-[var(--text-muted,#9ca3af)] leading-tight mt-0.5">
                    {s.sub}
                  </div>
                </div>
              </>
            ) : (
              /* Load profile card */
              <div className="w-full min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1.5">
                  {s.label}
                </div>
                <MiniLoadCurve
                  curve={loadCurve}
                  height={40}
                  showLabels={false}
                />
                <div className="text-[10.5px] text-[var(--text-muted,#9ca3af)] mt-1.5 leading-tight truncate">
                  ⏱ {s.sub}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--border,#e5e7eb)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" aria-label="Appliance list">
            <thead>
              <tr className="bg-[var(--surface-2,#f9fafb)] border-b border-[var(--border,#e5e7eb)]">
                {[
                  { label: "Appliance", cls: "pl-4 text-left" },
                  { label: "Qty", cls: "text-center w-14" },
                  { label: "Watts", cls: "text-center w-20" },
                  { label: "Hrs / Wkday", cls: "text-center w-24" },
                  { label: "Hrs / Wkend", cls: "text-center w-24" },
                  { label: "Daily kWh", cls: "text-right pr-4 w-28" },
                  {
                    label: "Crit.",
                    cls: "text-center w-12",
                    title: "Critical load",
                  },
                  { label: "", cls: "w-10" },
                ].map(({ label, cls, title }) => (
                  <th
                    key={label}
                    className={`py-2.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted,#9ca3af)] ${cls}`}
                    title={title}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {appliances.map((a, i) => (
                <ApplianceRow
                  key={i}
                  appliance={a}
                  index={i}
                  onChange={handleChange}
                  onRemove={handleRemove}
                />
              ))}
              {appliances.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-[13px] text-[var(--text-muted,#9ca3af)]"
                  >
                    No appliances yet — add one below.
                  </td>
                </tr>
              )}
            </tbody>

            {appliances.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[var(--border,#e5e7eb)] bg-emerald-50/50">
                  <td className="py-3 pl-4 pr-2">
                    <div className="flex items-center gap-2 text-[12.5px] font-semibold text-emerald-700">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden
                      >
                        <circle
                          cx="7"
                          cy="7"
                          r="5.5"
                          stroke="#10b981"
                          strokeWidth="1.3"
                        />
                        <path
                          d="M7 4.5v3l1.5 1.5"
                          stroke="#10b981"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Total (weekday baseline)
                    </div>
                  </td>
                  <td colSpan={4} />
                  <td className="py-3 pr-4 text-right">
                    <span className="text-[14px] font-bold tabular-nums text-emerald-600">
                      {totalKwh.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted,#9ca3af)] ml-0.5">
                      kWh
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add controls — two-panel layout */}
      <div className="flex items-stretch gap-3">
        {/* Add appliance panel */}
        <button
          className="flex items-center gap-3 flex-1 px-4 py-3.5 rounded-xl border-2 border-dashed border-[var(--border,#e5e7eb)] hover:border-emerald-400 hover:bg-emerald-50/40 transition-all duration-150 text-left group"
          onClick={handleAddBlank}
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M7 2v10M2 7h10"
                stroke="#10b981"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-semibold text-[var(--text-primary,#111)]">
              Add appliance
            </p>
            <p className="text-[11px] text-[var(--text-muted,#9ca3af)]">
              Manually enter an appliance
            </p>
          </div>
        </button>

        {/* OR divider */}
        <div className="flex items-center">
          <span className="text-[11px] font-medium text-[var(--text-muted,#9ca3af)] uppercase tracking-widest">
            or
          </span>
        </div>

        {/* Quick-add catalogue panel */}
        <div className="relative flex-1">
          <button
            className={[
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150 text-left",
              showQuickAdd
                ? "border-emerald-500 bg-emerald-50 shadow-[0_0_0_3px_theme(colors.emerald.500/12%)]"
                : "border-[var(--border,#e5e7eb)] bg-white hover:border-emerald-400 hover:bg-emerald-50/30",
            ].join(" ")}
            onClick={() => setShowQuickAdd((v) => !v)}
            aria-expanded={showQuickAdd}
          >
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${showQuickAdd ? "bg-emerald-200" : "bg-emerald-100"}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="4.5"
                  height="4.5"
                  rx="1"
                  stroke="#10b981"
                  strokeWidth="1.3"
                />
                <rect
                  x="8"
                  y="1.5"
                  width="4.5"
                  height="4.5"
                  rx="1"
                  stroke="#10b981"
                  strokeWidth="1.3"
                />
                <rect
                  x="1.5"
                  y="8"
                  width="4.5"
                  height="4.5"
                  rx="1"
                  stroke="#10b981"
                  strokeWidth="1.3"
                />
                <rect
                  x="8"
                  y="8"
                  width="4.5"
                  height="4.5"
                  rx="1"
                  stroke="#10b981"
                  strokeWidth="1.3"
                />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--text-primary,#111)]">
                Quick-add catalogue
              </p>
              <p className="text-[11px] text-[var(--text-muted,#9ca3af)]">
                Choose from common appliances
              </p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={`shrink-0 text-[var(--text-muted,#9ca3af)] transition-transform ${showQuickAdd ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path
                d="M3 5l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showQuickAdd && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-20 rounded-xl border border-[var(--border,#e5e7eb)] bg-white shadow-xl shadow-black/8 overflow-hidden flex flex-col max-h-64">
              {/* Scrollable list */}
              <div className="overflow-y-auto flex-1 [scrollbar-width:thin] [scrollbar-color:theme(colors.emerald.200)_transparent]">
                {QUICK_ADD.map((item) => (
                  <button
                    key={item.appliance_name}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-2,#f9fafb)] transition-colors duration-100 border-b border-[var(--border,#f3f4f6)] last:border-b-0 text-left"
                    onClick={() => handleQuickAdd(item)}
                  >
                    <span className="text-[var(--text-muted,#9ca3af)] shrink-0 w-4 h-4">
                      <ApplianceIcon name={item.appliance_name} />
                    </span>
                    <span className="text-[13px] text-[var(--text-primary,#111)] flex-1">
                      {item.appliance_name}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted,#9ca3af)] tabular-nums whitespace-nowrap">
                      {item.watts}W · {item.hours_weekday}h/day
                    </span>
                  </button>
                ))}
              </div>

              {/* Browse full catalogue footer — always visible */}
              <div className="px-4 py-2.5 border-t border-[var(--border,#e5e7eb)] bg-[var(--surface-2,#f9fafb)] shrink-0">
                <button className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 6h8M7 3l3 3-3 3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Browse full catalogue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border,#e5e7eb)]">
        <button
          className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-[13px] font-medium text-[var(--text-secondary,#6b7280)] border border-[var(--border,#e5e7eb)] hover:border-[var(--border-strong,#d1d5db)] hover:text-[var(--text-primary,#111)] transition-all duration-120 bg-white cursor-pointer"
          onClick={onBack}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M11 7H3M6 4L3 7l3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <button
          className="flex items-center gap-2 py-2.5 px-5 bg-amber-500 text-black rounded-xl text-[13.5px] font-semibold cursor-pointer transition-all duration-120 enabled:hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          onClick={onNext}
          disabled={appliances.length === 0}
        >
          Next — Usage pattern
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 7h8M8 4l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
