/**
 * Step 3: Grid hours, peak period, generator baseline.
 * This is the behavioural context that wraps the appliance load data.
 
 */

const PEAK_PERIODS = [
  { id: "morning", label: "Morning", hint: "6 am – 10 am" },
  { id: "daytime", label: "Daytime", hint: "9 am – 5 pm" },
  { id: "evening", label: "Evening", hint: "6 pm – 11 pm" },
  {
    id: "continuous",
    label: "Continuous",
    hint: "24 h flat load (cold rooms, clinics)",
  },
];

export function StepUsage({ usage, onChange, onBack, onNext }) {
  const update = (field, value) => onChange({ ...usage, [field]: value });

  const valid =
    usage.gridHoursWeekday !== "" &&
    usage.gridHoursWeekend !== "" &&
    Number(usage.gridHoursWeekday) >= 0 &&
    Number(usage.gridHoursWeekend) >= 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="pt-1">
        <h2 className="text-[17px] font-medium text-(--text-primary) mb-1 tracking-[-0.01em]">
          Usage pattern
        </h2>
        <p className="text-[13px] text-(--text-secondary) leading-normal">
          This tells the sizing engine <em>when</em> the load happens — not just
          how much. Grid hours determine how much battery storage is needed
          between solar generation windows.
        </p>
      </div>

      {/* Grid hours */}
      <fieldset className="border-[0.5px] border-(--border) rounded-[10px] py-3.5 px-4 m-0">
        <legend className="text-xs font-medium text-(--text-primary) px-1.5 tracking-[0.01em]">
          Grid availability
        </legend>
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
          <div className="flex flex-col gap-1.25">
            <label
              className="text-xs text-(--text-secondary)"
              htmlFor="grid-wkday"
            >
              Grid hours — weekday
            </label>
            <div className="flex items-center relative">
              <input
                id="grid-wkday"
                type="number"
                className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 px-1.5 text-(--text-primary) transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2) font-(--font-mono,ui-monospace,monospace) text-xs text-right w-15"
                value={usage.gridHoursWeekday}
                min={0}
                max={24}
                step={1}
                onChange={(e) => update("gridHoursWeekday", e.target.value)}
              />
              <span className="text-xs text-(--text-muted) ml-1.5 shrink-0 font-(--font-mono,ui-monospace,monospace)">
                h/day
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.25">
            <label
              className="text-xs text-(--text-secondary)"
              htmlFor="grid-wkend"
            >
              Grid hours — weekend
            </label>
            <div className="flex items-center relative">
              <input
                id="grid-wkend"
                type="number"
                className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 px-1.5 text-(--text-primary) transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2) font-(--font-mono,ui-monospace,monospace) text-xs text-right w-15"
                value={usage.gridHoursWeekend}
                min={0}
                max={24}
                step={1}
                onChange={(e) => update("gridHoursWeekend", e.target.value)}
              />
              <span className="text-xs text-(--text-muted) ml-1.5 shrink-0 font-(--font-mono,ui-monospace,monospace)">
                h/day
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.25 justify-center pt-1">
            <label className="text-xs text-(--text-secondary)">
              Weekend pattern
            </label>
            <label className="flex items-center gap-1.75 text-[13px] text-(--text-secondary) cursor-pointer">
              <input
                type="checkbox"
                className="accent-amber-500 w-3.5 h-3.5 shrink-0"
                checked={usage.isWeekendDifferent}
                onChange={(e) => update("isWeekendDifferent", e.target.checked)}
              />
              Weekend is different from weekday
            </label>
          </div>
        </div>
      </fieldset>

      {/* Peak period */}
      <fieldset className="border-[0.5px] border-(--border) rounded-[10px] py-3.5 px-4 m-0">
        <legend className="text-xs font-medium text-(--text-primary) px-1.5 tracking-[0.01em]">
          When does load peak?
        </legend>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 mb-2">
          {PEAK_PERIODS.map((p) => {
            const isSelected = usage.peakPeriod === p.id;
            return (
              <button
                key={p.id}
                className={`flex flex-col gap-0.75 py-2.5 px-3 bg-(--surface-1) border-[0.5px] rounded-lg cursor-pointer text-left transition-[border-color,background-color] duration-120 ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/5"
                    : "border-(--border) hover:border-(--border-strong)"
                }`}
                onClick={() => update("peakPeriod", p.id)}
                aria-pressed={isSelected}
              >
                <span
                  className={`text-[13px] font-medium ${isSelected ? "text-amber-700" : "text-(--text-primary)"}`}
                >
                  {p.label}
                </span>
                <span className="text-[11px] text-(--text-muted)">
                  {p.hint}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-(--text-muted) mt-2 leading-normal">
          The engine uses this to set minimum battery capacity for the off-grid
          overnight window.
        </p>
      </fieldset>

      {/* Generator baseline */}
      <fieldset className="border-[0.5px] border-(--border) rounded-[10px] py-3.5 px-4 m-0">
        <legend className="text-xs font-medium text-(--text-primary) px-1.5 tracking-[0.01em]">
          Generator baseline{" "}
          <span className="font-normal text-(--text-muted)">(optional)</span>
        </legend>
        <p className="text-xs text-(--text-secondary) mb-3 leading-normal">
          What is this customer currently spending on fuel? This makes the
          savings comparison real.
        </p>
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
          <div className="flex flex-col gap-1.25">
            <label
              className="text-xs text-(--text-secondary)"
              htmlFor="gen-hours"
            >
              Generator hours/day
            </label>
            <div className="flex items-center relative">
              <input
                id="gen-hours"
                type="number"
                className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 px-1.5 text-(--text-primary) transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2) font-(--font-mono,ui-monospace,monospace) text-xs text-right w-15"
                value={usage.generatorHoursDay}
                min={0}
                max={24}
                step={0.5}
                placeholder="e.g. 8"
                onChange={(e) => update("generatorHoursDay", e.target.value)}
              />
              <span className="text-xs text-(--text-muted) ml-1.5 shrink-0 font-(--font-mono,ui-monospace,monospace)">
                h
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.25">
            <label
              className="text-xs text-(--text-secondary)"
              htmlFor="gen-litres"
            >
              Fuel per month
            </label>
            <div className="flex items-center relative">
              <input
                id="gen-litres"
                type="number"
                className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 px-1.5 text-(--text-primary) transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2) font-(--font-mono,ui-monospace,monospace) text-xs text-right w-15"
                value={usage.generatorFuelLitres}
                min={0}
                step={1}
                placeholder="e.g. 120"
                onChange={(e) => update("generatorFuelLitres", e.target.value)}
              />
              <span className="text-xs text-(--text-muted) ml-1.5 shrink-0 font-(--font-mono,ui-monospace,monospace)">
                L
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.25">
            <label
              className="text-xs text-(--text-secondary)"
              htmlFor="gen-spend"
            >
              Monthly fuel spend
            </label>
            <div className="flex items-center relative">
              <span className="absolute left-2 text-[13px] text-(--text-muted) pointer-events-none">
                ₦
              </span>
              <input
                id="gen-spend"
                type="number"
                className="bg-(--surface-1,transparent) border-[0.5px] border-transparent rounded-[5px] py-1 pr-1.5 pl-5.5 text-(--text-primary) transition-colors duration-120 focus:outline-none focus:border-amber-500 focus:bg-(--surface-2) font-(--font-mono,ui-monospace,monospace) text-xs text-right w-15"
                value={usage.generatorFuelSpend}
                min={0}
                step={500}
                placeholder="e.g. 45000"
                onChange={(e) => update("generatorFuelSpend", e.target.value)}
              />
            </div>
            <p className="text-[11px] text-(--text-muted) mt-0.75">
              Enter litres or spend — both is fine
            </p>
          </div>
        </div>
      </fieldset>

      {/* Notes */}
      <div className="flex flex-col gap-1.25">
        <label
          className="text-xs text-(--text-secondary)"
          htmlFor="usage-notes"
        >
          Notes
        </label>
        <textarea
          id="usage-notes"
          className="w-full bg-(--surface-2) border-[0.5px] border-(--border) rounded-lg py-2 px-2.5 text-[13px] text-(--text-primary) resize-y font-[inherit] leading-normal transition-colors duration-120 focus:outline-none focus:border-amber-500"
          rows={2}
          placeholder="e.g. Borehole pump runs 6 am–8 am daily, cold room added 2024"
          value={usage.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

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
          disabled={!valid}
        >
          Preview profile
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
