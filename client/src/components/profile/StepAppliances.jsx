/**
 * StepAppliances.jsx
 * Step 2: Edit, add, and remove appliances.
 */

import { useState, useId } from "react";
import { MiniLoadCurve } from "./MiniLoadCurve.jsx";

const FADE_IN_KEYFRAMES =
  "@keyframes pb-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }";

// Common appliance quick-add catalogue
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

// Row component — one appliance
//
function ApplianceRow({ appliance, index, onChange, onRemove }) {
  const baseId = useId();

  const update = (field, value) => {
    onChange(index, { ...appliance, [field]: value });
  };

  const dailyKwh = (
    (appliance.quantity *
      appliance.watts *
      (appliance.load_factor ?? 1) *
      appliance.hours_weekday) /
    1000
  ).toFixed(2);

  return (
    <tr
      className={[
        "[&>td]:py-1.25 [&>td]:px-2 [&>td]:border-b-[0.5px] [&>td]:border-(--border) [&>td]:align-middle last:[&>td]:border-b-0",
        appliance.is_critical ? "bg-amber-500/3" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Appliance name */}
      <td className="min-w-40">
        <input
          id={`${baseId}-name`}
          type="text"
          className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 px-1.5 text-(--text-primary) text-[13px] w-full transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2)"
          value={appliance.appliance_name}
          onChange={(e) => update("appliance_name", e.target.value)}
          aria-label="Appliance name"
        />
      </td>

      {/* Quantity */}
      <td className="w-18 text-right">
        <input
          type="number"
          className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 px-1.5 text-(--text-primary) transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2) font-(--font-mono,ui-monospace,monospace) text-xs text-right w-15"
          value={appliance.quantity}
          min={1}
          max={99}
          onChange={(e) =>
            update("quantity", Math.max(1, parseInt(e.target.value) || 1))
          }
          aria-label="Quantity"
        />
      </td>

      {/* Watts */}
      <td className="w-18 text-right">
        <input
          type="number"
          className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 px-1.5 text-(--text-primary) transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2) font-(--font-mono,ui-monospace,monospace) text-xs text-right w-15"
          value={appliance.watts}
          min={0}
          step={5}
          onChange={(e) => update("watts", parseFloat(e.target.value) || 0)}
          aria-label="Rated watts"
        />
      </td>

      {/* Hours/weekday */}
      <td className="w-18 text-right">
        <input
          type="number"
          className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 px-1.5 text-(--text-primary) transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2) font-(--font-mono,ui-monospace,monospace) text-xs text-right w-15"
          value={appliance.hours_weekday}
          min={0}
          max={24}
          step={0.5}
          onChange={(e) =>
            update(
              "hours_weekday",
              Math.min(24, parseFloat(e.target.value) || 0),
            )
          }
          aria-label="Hours per weekday"
        />
      </td>

      {/* Hours/weekend */}
      <td className="w-18 text-right">
        <input
          type="number"
          className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 px-1.5 text-(--text-primary) transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2) font-(--font-mono,ui-monospace,monospace) text-xs text-right w-15"
          value={appliance.hours_weekend}
          min={0}
          max={24}
          step={0.5}
          onChange={(e) =>
            update(
              "hours_weekend",
              Math.min(24, parseFloat(e.target.value) || 0),
            )
          }
          aria-label="Hours per weekend day"
        />
      </td>

      {/* Daily kWh — computed, read-only */}
      <td className="w-22 text-right" aria-label={`${dailyKwh} kWh per day`}>
        <span className="font-(--font-mono,ui-monospace,monospace) text-xs text-(--text-primary)">
          {dailyKwh}
        </span>
        <span className="text-[10px] text-(--text-muted) ml-0.5">kWh</span>
      </td>

      {/* Critical toggle */}
      <td className="w-12 text-center">
        <button
          className={[
            "bg-transparent border-0 cursor-pointer text-base p-0.5 leading-none transition-colors duration-120 hover:text-amber-500",
            appliance.is_critical ? "text-amber-500" : "text-(--text-muted)",
          ].join(" ")}
          onClick={() => update("is_critical", !appliance.is_critical)}
          aria-pressed={appliance.is_critical}
          aria-label={
            appliance.is_critical
              ? "Critical load — click to remove"
              : "Mark as critical load"
          }
          title={
            appliance.is_critical
              ? "Critical — must run during outage"
              : "Not critical"
          }
        >
          {appliance.is_critical ? "●" : "○"}
        </button>
      </td>

      {/* Remove */}
      <td className="w-9 text-center">
        <button
          className="bg-transparent border-0 cursor-pointer text-(--text-muted) p-1 rounded transition-colors duration-120 flex items-center justify-center hover:text-(--text-danger,#dc2626) hover:bg-(--bg-danger,#fef2f2)"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${appliance.appliance_name}`}
        >
          <svg
            width="14"
            height="14"
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

  const handleChange = (index, updated) => {
    const next = [...appliances];
    next[index] = updated;
    onChange(next);
  };

  const handleRemove = (index) => {
    onChange(appliances.filter((_, i) => i !== index));
  };

  const handleAddBlank = () => {
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
  };

  const handleQuickAdd = (template) => {
    onChange([
      ...appliances,
      {
        ...template,
        active_hours: template.active_hours
          ? typeof template.active_hours === "string"
            ? JSON.parse(template.active_hours)
            : template.active_hours
          : null,
        quantity: 1,
        sort_order: appliances.length,
      },
    ]);
    setShowQuickAdd(false);
  };

  // Totals
  const totalKwh = appliances.reduce(
    (acc, a) =>
      acc +
      (a.quantity * a.watts * (a.load_factor ?? 1) * a.hours_weekday) / 1000,
    0,
  );
  const peakW = appliances.reduce((acc, a) => acc + a.quantity * a.watts, 0);

  return (
    <div className="flex flex-col gap-5">
      <style>{FADE_IN_KEYFRAMES}</style>

      <div className="pt-1">
        <h2 className="text-[17px] font-medium text-(--text-primary) mb-1 tracking-[-0.01em]">
          Appliances
        </h2>
        <p className="text-[13px] text-(--text-secondary) leading-normal">
          Pre-filled from the template. Adjust quantities, wattages, and daily
          hours to match this customer.
        </p>
      </div>

      {/* Signature element: live load curve */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-6 py-3.5 px-4 bg-(--surface-2) border-[0.5px] border-(--border) rounded-[10px]">
        <div className="flex flex-row sm:flex-col flex-wrap sm:flex-nowrap gap-3 sm:gap-2 shrink-0 sm:min-w-30">
          <div className="flex flex-col gap-px">
            <span className="text-lg font-(--font-mono,ui-monospace,monospace) text-(--text-primary) tracking-[-0.02em]">
              {totalKwh.toFixed(1)}
            </span>
            <span className="text-[11px] text-(--text-muted) uppercase tracking-wide">
              kWh / weekday
            </span>
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-lg font-(--font-mono,ui-monospace,monospace) text-(--text-primary) tracking-[-0.02em]">
              {peakW.toLocaleString()}
            </span>
            <span className="text-[11px] text-(--text-muted) uppercase tracking-wide">
              W peak demand
            </span>
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-lg font-(--font-mono,ui-monospace,monospace) text-(--text-primary) tracking-[-0.02em]">
              {appliances.filter((a) => a.is_critical).length}
            </span>
            <span className="text-[11px] text-(--text-muted) uppercase tracking-wide">
              critical loads
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <MiniLoadCurve curve={loadCurve} height={52} showLabels />
        </div>
      </div>

      {/* Appliance table */}
      <div className="overflow-x-auto border-[0.5px] border-(--border) rounded-[10px]">
        <table
          className="w-full border-collapse text-[13px]"
          aria-label="Appliance list"
        >
          <thead>
            <tr>
              <th className="min-w-40 text-[11px] font-normal text-(--text-muted) uppercase tracking-wide py-2 px-2.5 text-left bg-(--surface-2) border-b-[0.5px] border-(--border) whitespace-nowrap">
                Appliance
              </th>
              <th className="w-18 text-right text-[11px] font-normal text-(--text-muted) uppercase tracking-wide py-2 px-2.5 bg-(--surface-2) border-b-[0.5px] border-(--border) whitespace-nowrap">
                Qty
              </th>
              <th className="w-18 text-right text-[11px] font-normal text-(--text-muted) uppercase tracking-wide py-2 px-2.5 bg-(--surface-2) border-b-[0.5px] border-(--border) whitespace-nowrap">
                Watts
              </th>
              <th className="w-18 text-right text-[11px] font-normal text-(--text-muted) uppercase tracking-wide py-2 px-2.5 bg-(--surface-2) border-b-[0.5px] border-(--border) whitespace-nowrap">
                Hrs/wkday
              </th>
              <th className="w-18 text-right text-[11px] font-normal text-(--text-muted) uppercase tracking-wide py-2 px-2.5 bg-(--surface-2) border-b-[0.5px] border-(--border) whitespace-nowrap">
                Hrs/wkend
              </th>
              <th className="w-22 text-right text-[11px] font-normal text-(--text-muted) uppercase tracking-wide py-2 px-2.5 bg-(--surface-2) border-b-[0.5px] border-(--border) whitespace-nowrap">
                Daily kWh
              </th>
              <th
                className="w-12 text-center text-[11px] font-normal text-(--text-muted) uppercase tracking-wide py-2 px-2.5 bg-(--surface-2) border-b-[0.5px] border-(--border) whitespace-nowrap"
                title="Critical load"
              >
                Crit.
              </th>
              <th
                className="w-9 text-center text-[11px] font-normal text-(--text-muted) py-2 px-2.5 bg-(--surface-2) border-b-[0.5px] border-(--border) whitespace-nowrap"
                aria-label="Remove"
              ></th>
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
                  className="py-5! px-4! text-(--text-muted) text-[13px] text-center"
                >
                  No appliances yet — add one below.
                </td>
              </tr>
            )}
          </tbody>

          {/* Footer totals */}
          {appliances.length > 0 && (
            <tfoot>
              <tr className="[&>td]:py-1.75 [&>td]:px-2.5 [&>td]:text-xs [&>td]:text-(--text-secondary) [&>td]:bg-(--surface-2) [&>td]:border-t-[0.5px] [&>td]:border-(--border)">
                <td colSpan={5} className="font-medium text-(--text-primary)">
                  Total (weekday baseline)
                </td>
                <td className="w-22 text-right">
                  <span className="font-(--font-mono,ui-monospace,monospace) text-xs text-(--text-primary)">
                    {totalKwh.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-(--text-muted) ml-0.5">
                    kWh
                  </span>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add row controls */}
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-1.5 text-[13px] text-amber-500 bg-transparent border-0 cursor-pointer py-1 px-0 font-medium"
          onClick={handleAddBlank}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M7 2v10M2 7h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Add appliance
        </button>

        <button
          className="flex items-center gap-1.25 text-xs text-(--text-secondary) bg-(--surface-2) border-[0.5px] border-(--border) rounded-md cursor-pointer py-1 px-2.5 transition-colors duration-120 hover:border-(--border-strong)"
          onClick={() => setShowQuickAdd((v) => !v)}
          aria-expanded={showQuickAdd}
        >
          Quick-add catalogue
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d={showQuickAdd ? "M2 8l4-4 4 4" : "M2 4l4 4 4-4"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Quick-add dropdown */}
      {showQuickAdd && (
        <div
          className="bg-(--surface-2) border-[0.5px] border-(--border) rounded-[10px] overflow-hidden flex flex-col animate-[pb-fade-in_0.12s_ease] motion-reduce:animate-none"
          role="listbox"
          aria-label="Quick-add catalogue"
        >
          {QUICK_ADD.map((item) => (
            <button
              key={item.appliance_name}
              className="flex items-center justify-between py-2.5 px-3.5 bg-transparent border-0 border-b-[0.5px] border-(--border) cursor-pointer text-left gap-3 transition-colors duration-100 last:border-b-0 hover:bg-(--surface-3,rgba(0,0,0,0.04))"
              onClick={() => handleQuickAdd(item)}
              role="option"
            >
              <span className="text-[13px] text-(--text-primary)">
                {item.appliance_name}
              </span>
              <span className="text-[11px] text-(--text-muted) font-(--font-mono,ui-monospace,monospace) whitespace-nowrap">
                {item.watts}W · {item.hours_weekday}h/day
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t-[0.5px] border-(--border)">
        <button
          className="flex items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto py-2 px-3 bg-transparent text-(--text-secondary) border-[0.5px] border-(--border) rounded-lg text-[13px] cursor-pointer transition-colors duration-120 enabled:hover:border-(--border-strong) enabled:hover:text-(--text-primary) disabled:opacity-45 disabled:cursor-not-allowed"
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
          className="flex items-center justify-center sm:justify-start gap-1.75 w-full sm:w-auto py-2 px-4 bg-amber-500 text-black rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-120 enabled:hover:bg-amber-600 disabled:opacity-45 disabled:cursor-not-allowed"
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
