/**
 * StepReview.jsx
 * Step 4: Review everything before saving.
 * Shows the load curve at full size, key stats, and critical loads.
 */

import { MiniLoadCurve } from "./MiniLoadCurve.jsx";

const TYPE_LABELS = {
  residential: "Residential",
  sme_office: "SME — Office",
  sme_retail: "SME — Retail",
  cold_room: "Cold Room",
  clinic: "Clinic",
  worship_centre: "Worship Centre",
};

const PEAK_LABELS = {
  morning: "Morning (6 am–10 am)",
  daytime: "Daytime (9 am–5 pm)",
  evening: "Evening (6 pm–11 pm)",
  continuous: "Continuous (24 h)",
};

export function StepReview({
  profileType,
  appliances,
  usage,
  loadCurve,
  summary,
  saving,
  isEdit,
  onBack,
  onSave,
  onCancel,
}) {
  const peakHour = loadCurve.indexOf(Math.max(...loadCurve));

  return (
    <div className="flex flex-col gap-5">
      <div className="pt-1">
        <h2 className="text-[17px] font-medium text-(--text-primary) mb-1 tracking-[-0.01em]">
          Review profile
        </h2>
        <p className="text-[13px] text-(--text-secondary) leading-normal">
          This profile will be saved and available to pre-fill new assessments
          for this customer.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
        <div className="flex flex-col gap-0.5 py-3 px-3.5 bg-(--surface-2) border-[0.5px] border-(--border) rounded-[10px]">
          <span className="text-[22px] font-medium text-(--text-primary) tracking-[-0.03em] leading-none">
            {summary.totalWeekday}
          </span>
          <span className="text-[11px] text-(--text-muted) font-(--font-mono,ui-monospace,monospace) mt-px">
            kWh
          </span>
          <span className="text-[11px] text-(--text-muted) uppercase tracking-wide mt-1">
            Daily load (weekday)
          </span>
        </div>
        <div className="flex flex-col gap-0.5 py-3 px-3.5 bg-(--surface-2) border-[0.5px] border-(--border) rounded-[10px]">
          <span className="text-[22px] font-medium text-(--text-primary) tracking-[-0.03em] leading-none">
            {summary.totalWeekend}
          </span>
          <span className="text-[11px] text-(--text-muted) font-(--font-mono,ui-monospace,monospace) mt-px">
            kWh
          </span>
          <span className="text-[11px] text-(--text-muted) uppercase tracking-wide mt-1">
            Daily load (weekend)
          </span>
        </div>
        <div className="flex flex-col gap-0.5 py-3 px-3.5 bg-(--surface-2) border-[0.5px] border-(--border) rounded-[10px]">
          <span className="text-[22px] font-(--font-mono,ui-monospace,monospace) text-(--text-primary) tracking-[-0.03em] leading-none">
            {summary.peakW.toLocaleString()}
          </span>
          <span className="text-[11px] text-(--text-muted) font-(--font-mono,ui-monospace,monospace) mt-px">
            W
          </span>
          <span className="text-[11px] text-(--text-muted) uppercase tracking-wide mt-1">
            Peak demand
          </span>
        </div>
        <div className="flex flex-col gap-0.5 py-3 px-3.5 bg-(--surface-2) border-[0.5px] border-(--border) rounded-[10px]">
          <span className="text-[22px] font-(--font-mono,ui-monospace,monospace) text-(--text-primary) tracking-[-0.03em] leading-none">
            {summary.criticalW.toLocaleString()}
          </span>
          <span className="text-[11px] text-(--text-muted) font-(--font-mono,ui-monospace,monospace) mt-px">
            W
          </span>
          <span className="text-[11px] text-(--text-muted) uppercase tracking-wide mt-1">
            Critical load
          </span>
        </div>
      </div>

      {/* Full-size load curve */}
      <div className="bg-(--surface-2) border-[0.5px] border-(--border) rounded-[10px] py-3.5 px-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-(--text-secondary) uppercase tracking-wider">
            24-hour load profile
          </span>
          <span className="text-xs text-amber-700 font-(--font-mono,ui-monospace,monospace)">
            Peak at {peakHour}:00 — {loadCurve[peakHour]?.toFixed(2)} kWh
          </span>
        </div>
        <MiniLoadCurve curve={loadCurve} height={80} showLabels highlightPeak />
      </div>

      {/* Profile metadata */}
      <div className="bg-(--surface-2) border-[0.5px] border-(--border) rounded-[10px] overflow-hidden">
        <div className="flex items-baseline gap-3 py-2.25 px-3.5 border-b-[0.5px] border-(--border) text-[13px] last:border-b-0">
          <span className="min-w-30 sm:min-w-45 shrink-0 text-(--text-muted) text-xs">
            Customer type
          </span>
          <span className="text-(--text-primary)">
            {TYPE_LABELS[profileType] ?? profileType}
          </span>
        </div>
        <div className="flex items-baseline gap-3 py-2.25 px-3.5 border-b-[0.5px] border-(--border) text-[13px] last:border-b-0">
          <span className="min-w-30 sm:min-w-45 shrink-0 text-(--text-muted) text-xs">
            Grid (weekday / weekend)
          </span>
          <span className="text-(--text-primary)">
            {usage.gridHoursWeekday} h / {usage.gridHoursWeekend} h per day
          </span>
        </div>
        <div className="flex items-baseline gap-3 py-2.25 px-3.5 border-b-[0.5px] border-(--border) text-[13px] last:border-b-0">
          <span className="min-w-30 sm:min-w-45 shrink-0 text-(--text-muted) text-xs">
            Peak period
          </span>
          <span className="text-(--text-primary)">
            {PEAK_LABELS[usage.peakPeriod] ?? usage.peakPeriod}
          </span>
        </div>
        {usage.generatorFuelSpend && (
          <div className="flex items-baseline gap-3 py-2.25 px-3.5 border-b-[0.5px] border-(--border) text-[13px] last:border-b-0">
            <span className="min-w-30 sm:min-w-45 shrink-0 text-(--text-muted) text-xs">
              Monthly fuel spend
            </span>
            <span className="text-(--text-primary)">
              ₦{Number(usage.generatorFuelSpend).toLocaleString()}
            </span>
          </div>
        )}
        {usage.generatorHoursDay && (
          <div className="flex items-baseline gap-3 py-2.25 px-3.5 border-b-[0.5px] border-(--border) text-[13px] last:border-b-0">
            <span className="min-w-30 sm:min-w-45 shrink-0 text-(--text-muted) text-xs">
              Generator hours/day
            </span>
            <span className="text-(--text-primary)">
              {usage.generatorHoursDay} h
            </span>
          </div>
        )}
        {usage.notes && (
          <div className="flex items-baseline gap-3 py-2.25 px-3.5 border-b-[0.5px] border-(--border) text-[13px] last:border-b-0">
            <span className="min-w-30 sm:min-w-45 shrink-0 text-(--text-muted) text-xs">
              Notes
            </span>
            <span className="text-(--text-primary)">{usage.notes}</span>
          </div>
        )}
      </div>

      {/* Critical loads */}
      {summary.criticalItems.length > 0 && (
        <div className="py-3 px-4 bg-amber-500/5 border-[0.5px] border-amber-500/25 rounded-[10px]">
          <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wider block mb-2">
            Critical loads
          </span>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {summary.criticalItems.map((name) => (
              <span
                key={name}
                className="text-xs py-0.75 px-2.5 bg-amber-500/12 border-[0.5px] border-amber-500/35 rounded text-amber-800"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="text-xs text-(--text-secondary) leading-normal">
            These must remain powered during grid and generator outages. Battery
            sizing will ensure {summary.criticalW.toLocaleString()} W minimum
            overnight capacity.
          </p>
        </div>
      )}

      {/* Appliance count */}
      <p className="text-xs text-(--text-muted)">
        {appliances.length} appliance{appliances.length !== 1 ? "s" : ""}{" "}
        captured
        {appliances.length > 0 &&
          ` · ${appliances.filter((a) => a.is_critical).length} critical`}
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2 pt-2 border-t-[0.5px] border-(--border)">
        <button
          className="flex items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto py-2 px-3 bg-transparent text-(--text-secondary) border-[0.5px] border-(--border) rounded-lg text-[13px] cursor-pointer transition-colors duration-120 enabled:hover:border-(--border-strong) enabled:hover:text-(--text-primary) disabled:opacity-45 disabled:cursor-not-allowed"
          onClick={onBack}
          disabled={saving}
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
          Edit
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            className="flex items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto py-2 px-3 bg-transparent text-(--text-secondary) border-[0.5px] border-(--border) rounded-lg text-[13px] cursor-pointer transition-colors duration-120 enabled:hover:border-(--border-strong) enabled:hover:text-(--text-primary) disabled:opacity-45 disabled:cursor-not-allowed"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="flex items-center sm:justify-start gap-1.75 w-full sm:w-auto py-2 px-4 bg-amber-500 text-black rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-120 enabled:hover:bg-amber-600 disabled:opacity-45 disabled:cursor-not-allowed min-w-35 justify-center!"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="inline-block w-3.25 h-3.25 rounded-full border-2 border-transparent border-t-current animate-[spin_0.65s_linear_infinite] motion-reduce:animate-none motion-reduce:border-current"
                  aria-hidden
                />
                Saving…
              </>
            ) : (
              <>
                {isEdit ? "Update profile" : "Save profile"}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 7l3.5 3.5L12 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
