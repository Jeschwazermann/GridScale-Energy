/**
 * StepUsage.jsx
 * Step 3: Grid hours, peak period, generator baseline.
 * This is the behavioural context that wraps the appliance load data.
 */

const PEAK_PERIODS = [
  { id: 'morning',    label: 'Morning',    hint: '6 am – 10 am' },
  { id: 'daytime',    label: 'Daytime',    hint: '9 am – 5 pm'  },
  { id: 'evening',    label: 'Evening',    hint: '6 pm – 11 pm' },
  { id: 'continuous', label: 'Continuous', hint: '24 h flat load (cold rooms, clinics)' },
];

export function StepUsage({ usage, onChange, onBack, onNext }) {
  const update = (field, value) => onChange({ ...usage, [field]: value });

  const valid = (
    usage.gridHoursWeekday !== '' &&
    usage.gridHoursWeekend !== '' &&
    Number(usage.gridHoursWeekday) >= 0 &&
    Number(usage.gridHoursWeekend) >= 0
  );

  return (
    <div className="pb-step">
      <div className="pb-step-header">
        <h2 className="pb-step-title">Usage pattern</h2>
        <p className="pb-step-subtitle">
          This tells the sizing engine <em>when</em> the load happens — not just how much.
          Grid hours determine how much battery storage is needed between solar generation windows.
        </p>
      </div>

      {/* Grid hours */}
      <fieldset className="pb-fieldset">
        <legend className="pb-legend">Grid availability</legend>
        <div className="pb-field-row pb-field-row-3">
          <div className="pb-field">
            <label className="pb-label" htmlFor="grid-wkday">
              Grid hours — weekday
            </label>
            <div className="pb-input-unit-wrap">
              <input
                id="grid-wkday"
                type="number"
                className="pb-input pb-input-num"
                value={usage.gridHoursWeekday}
                min={0}
                max={24}
                step={1}
                onChange={e => update('gridHoursWeekday', e.target.value)}
              />
              <span className="pb-input-unit">h/day</span>
            </div>
          </div>

          <div className="pb-field">
            <label className="pb-label" htmlFor="grid-wkend">
              Grid hours — weekend
            </label>
            <div className="pb-input-unit-wrap">
              <input
                id="grid-wkend"
                type="number"
                className="pb-input pb-input-num"
                value={usage.gridHoursWeekend}
                min={0}
                max={24}
                step={1}
                onChange={e => update('gridHoursWeekend', e.target.value)}
              />
              <span className="pb-input-unit">h/day</span>
            </div>
          </div>

          <div className="pb-field pb-field-check">
            <label className="pb-label">Weekend pattern</label>
            <label className="pb-checkbox-label">
              <input
                type="checkbox"
                className="pb-checkbox"
                checked={usage.isWeekendDifferent}
                onChange={e => update('isWeekendDifferent', e.target.checked)}
              />
              Weekend is different from weekday
            </label>
          </div>
        </div>
      </fieldset>

      {/* Peak period */}
      <fieldset className="pb-fieldset">
        <legend className="pb-legend">When does load peak?</legend>
        <div className="pb-peak-grid">
          {PEAK_PERIODS.map(p => (
            <button
              key={p.id}
              className={`pb-peak-card ${usage.peakPeriod === p.id ? 'pb-peak-selected' : ''}`}
              onClick={() => update('peakPeriod', p.id)}
              aria-pressed={usage.peakPeriod === p.id}
            >
              <span className="pb-peak-label">{p.label}</span>
              <span className="pb-peak-hint">{p.hint}</span>
            </button>
          ))}
        </div>
        <p className="pb-field-note">
          The engine uses this to set minimum battery capacity for the off-grid overnight window.
        </p>
      </fieldset>

      {/* Generator baseline */}
      <fieldset className="pb-fieldset">
        <legend className="pb-legend">Generator baseline <span className="pb-legend-opt">(optional)</span></legend>
        <p className="pb-fieldset-desc">
          What is this customer currently spending on fuel? This makes the savings comparison real.
        </p>
        <div className="pb-field-row pb-field-row-3">
          <div className="pb-field">
            <label className="pb-label" htmlFor="gen-hours">Generator hours/day</label>
            <div className="pb-input-unit-wrap">
              <input
                id="gen-hours"
                type="number"
                className="pb-input pb-input-num"
                value={usage.generatorHoursDay}
                min={0}
                max={24}
                step={0.5}
                placeholder="e.g. 8"
                onChange={e => update('generatorHoursDay', e.target.value)}
              />
              <span className="pb-input-unit">h</span>
            </div>
          </div>

          <div className="pb-field">
            <label className="pb-label" htmlFor="gen-litres">Fuel per month</label>
            <div className="pb-input-unit-wrap">
              <input
                id="gen-litres"
                type="number"
                className="pb-input pb-input-num"
                value={usage.generatorFuelLitres}
                min={0}
                step={1}
                placeholder="e.g. 120"
                onChange={e => update('generatorFuelLitres', e.target.value)}
              />
              <span className="pb-input-unit">L</span>
            </div>
          </div>

          <div className="pb-field">
            <label className="pb-label" htmlFor="gen-spend">
              Monthly fuel spend
            </label>
            <div className="pb-input-unit-wrap">
              <span className="pb-input-prefix">₦</span>
              <input
                id="gen-spend"
                type="number"
                className="pb-input pb-input-num pb-input-prefixed"
                value={usage.generatorFuelSpend}
                min={0}
                step={500}
                placeholder="e.g. 45000"
                onChange={e => update('generatorFuelSpend', e.target.value)}
              />
            </div>
            <p className="pb-field-hint">Enter litres or spend — both is fine</p>
          </div>
        </div>
      </fieldset>

      {/* Notes */}
      <div className="pb-field">
        <label className="pb-label" htmlFor="usage-notes">Notes</label>
        <textarea
          id="usage-notes"
          className="pb-textarea"
          rows={2}
          placeholder="e.g. Borehole pump runs 6 am–8 am daily, cold room added 2024"
          value={usage.notes}
          onChange={e => update('notes', e.target.value)}
        />
      </div>

      <div className="pb-actions">
        <button className="pb-btn-ghost" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button className="pb-btn-primary" onClick={onNext} disabled={!valid}>
          Preview profile
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
