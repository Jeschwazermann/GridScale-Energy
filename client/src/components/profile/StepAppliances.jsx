/**
 * StepAppliances.jsx
 * Step 2: Edit, add, and remove appliances.
 * The signature element: a live 24h load curve updates as the user edits.
 */

import { useState, useId } from 'react';
import { MiniLoadCurve } from './MiniLoadCurve.jsx';

// Common appliance quick-add catalogue
const QUICK_ADD = [
  { appliance_name: 'Air conditioner (1HP)', watts: 750,  hours_weekday: 8,  hours_weekend: 8,  is_critical: false, load_factor: 0.70, active_hours: null },
  { appliance_name: 'Air conditioner (1.5HP)', watts: 1100, hours_weekday: 8, hours_weekend: 8, is_critical: false, load_factor: 0.70, active_hours: null },
  { appliance_name: 'Borehole pump (0.5HP)', watts: 373,  hours_weekday: 2,  hours_weekend: 2,  is_critical: false, load_factor: 1.00, active_hours: '[6,7]' },
  { appliance_name: 'Chest freezer',         watts: 200,  hours_weekday: 24, hours_weekend: 24, is_critical: true,  load_factor: 0.60, active_hours: null },
  { appliance_name: 'Electric iron',          watts: 1000, hours_weekday: 1,  hours_weekend: 2,  is_critical: false, load_factor: 1.00, active_hours: null },
  { appliance_name: 'Microwave',              watts: 900,  hours_weekday: 0.5,hours_weekend: 1,  is_critical: false, load_factor: 1.00, active_hours: null },
  { appliance_name: 'Security lights',        watts: 20,   hours_weekday: 12, hours_weekend: 12, is_critical: false, load_factor: 1.00, active_hours: '[18,19,20,21,22,23,0,1,2,3,4,5]' },
  { appliance_name: 'CCTV system',            watts: 30,   hours_weekday: 24, hours_weekend: 24, is_critical: false, load_factor: 1.00, active_hours: null },
  { appliance_name: 'Water dispenser',        watts: 500,  hours_weekday: 8,  hours_weekend: 4,  is_critical: false, load_factor: 0.50, active_hours: null },
];

// ---------------------------------------------------------------------------
// Row component — one appliance
// ---------------------------------------------------------------------------
function ApplianceRow({ appliance, index, onChange, onRemove }) {
  const baseId = useId();

  const update = (field, value) => {
    onChange(index, { ...appliance, [field]: value });
  };

  const dailyKwh = (
    appliance.quantity *
    appliance.watts *
    (appliance.load_factor ?? 1) *
    appliance.hours_weekday / 1000
  ).toFixed(2);

  return (
    <tr className={`pb-app-row ${appliance.is_critical ? 'pb-app-critical' : ''}`}>
      {/* Appliance name */}
      <td className="pb-td-name">
        <input
          id={`${baseId}-name`}
          type="text"
          className="pb-input pb-input-name"
          value={appliance.appliance_name}
          onChange={e => update('appliance_name', e.target.value)}
          aria-label="Appliance name"
        />
      </td>

      {/* Quantity */}
      <td className="pb-td-num">
        <input
          type="number"
          className="pb-input pb-input-num"
          value={appliance.quantity}
          min={1}
          max={99}
          onChange={e => update('quantity', Math.max(1, parseInt(e.target.value) || 1))}
          aria-label="Quantity"
        />
      </td>

      {/* Watts */}
      <td className="pb-td-num">
        <input
          type="number"
          className="pb-input pb-input-num"
          value={appliance.watts}
          min={0}
          step={5}
          onChange={e => update('watts', parseFloat(e.target.value) || 0)}
          aria-label="Rated watts"
        />
      </td>

      {/* Hours/weekday */}
      <td className="pb-td-num">
        <input
          type="number"
          className="pb-input pb-input-num"
          value={appliance.hours_weekday}
          min={0}
          max={24}
          step={0.5}
          onChange={e => update('hours_weekday', Math.min(24, parseFloat(e.target.value) || 0))}
          aria-label="Hours per weekday"
        />
      </td>

      {/* Hours/weekend */}
      <td className="pb-td-num">
        <input
          type="number"
          className="pb-input pb-input-num"
          value={appliance.hours_weekend}
          min={0}
          max={24}
          step={0.5}
          onChange={e => update('hours_weekend', Math.min(24, parseFloat(e.target.value) || 0))}
          aria-label="Hours per weekend day"
        />
      </td>

      {/* Daily kWh — computed, read-only */}
      <td className="pb-td-kwh" aria-label={`${dailyKwh} kWh per day`}>
        <span className="pb-kwh-val">{dailyKwh}</span>
        <span className="pb-kwh-unit">kWh</span>
      </td>

      {/* Critical toggle */}
      <td className="pb-td-crit">
        <button
          className={`pb-crit-btn ${appliance.is_critical ? 'pb-crit-on' : ''}`}
          onClick={() => update('is_critical', !appliance.is_critical)}
          aria-pressed={appliance.is_critical}
          aria-label={appliance.is_critical ? 'Critical load — click to remove' : 'Mark as critical load'}
          title={appliance.is_critical ? 'Critical — must run during outage' : 'Not critical'}
        >
          {appliance.is_critical ? '●' : '○'}
        </button>
      </td>

      {/* Remove */}
      <td className="pb-td-rm">
        <button
          className="pb-rm-btn"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${appliance.appliance_name}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// StepAppliances
// ---------------------------------------------------------------------------
export function StepAppliances({ appliances, loadCurve, onChange, onBack, onNext }) {
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
    onChange([...appliances, {
      appliance_name: '',
      quantity:       1,
      watts:          0,
      hours_weekday:  0,
      hours_weekend:  0,
      is_critical:    false,
      load_factor:    1.0,
      active_hours:   null,
      sort_order:     appliances.length,
    }]);
  };

  const handleQuickAdd = (template) => {
    onChange([...appliances, {
      ...template,
      active_hours: template.active_hours
        ? (typeof template.active_hours === 'string'
            ? JSON.parse(template.active_hours)
            : template.active_hours)
        : null,
      quantity:    1,
      sort_order:  appliances.length,
    }]);
    setShowQuickAdd(false);
  };

  // Totals
  const totalKwh = appliances.reduce((acc, a) =>
    acc + (a.quantity * a.watts * (a.load_factor ?? 1) * a.hours_weekday / 1000), 0
  );
  const peakW = appliances.reduce((acc, a) => acc + (a.quantity * a.watts), 0);

  return (
    <div className="pb-step">
      <div className="pb-step-header">
        <h2 className="pb-step-title">Appliances</h2>
        <p className="pb-step-subtitle">
          Pre-filled from the template. Adjust quantities, wattages, and daily hours to match this customer.
        </p>
      </div>

      {/* Signature element: live load curve */}
      <div className="pb-curve-banner">
        <div className="pb-curve-meta">
          <div className="pb-curve-stat">
            <span className="pb-curve-val">{totalKwh.toFixed(1)}</span>
            <span className="pb-curve-lbl">kWh / weekday</span>
          </div>
          <div className="pb-curve-stat">
            <span className="pb-curve-val">{peakW.toLocaleString()}</span>
            <span className="pb-curve-lbl">W peak demand</span>
          </div>
          <div className="pb-curve-stat">
            <span className="pb-curve-val">{appliances.filter(a => a.is_critical).length}</span>
            <span className="pb-curve-lbl">critical loads</span>
          </div>
        </div>
        <div className="pb-curve-chart">
          <MiniLoadCurve curve={loadCurve} height={52} showLabels />
        </div>
      </div>

      {/* Appliance table */}
      <div className="pb-table-wrap">
        <table className="pb-app-table" aria-label="Appliance list">
          <thead>
            <tr>
              <th className="pb-th-name">Appliance</th>
              <th className="pb-th-num">Qty</th>
              <th className="pb-th-num">Watts</th>
              <th className="pb-th-num">Hrs/wkday</th>
              <th className="pb-th-num">Hrs/wkend</th>
              <th className="pb-th-kwh">Daily kWh</th>
              <th className="pb-th-crit" title="Critical load">Crit.</th>
              <th className="pb-th-rm" aria-label="Remove"></th>
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
                <td colSpan={8} className="pb-empty-row">
                  No appliances yet — add one below.
                </td>
              </tr>
            )}
          </tbody>

          {/* Footer totals */}
          {appliances.length > 0 && (
            <tfoot>
              <tr className="pb-tfoot-row">
                <td colSpan={5} className="pb-tfoot-label">Total (weekday baseline)</td>
                <td className="pb-td-kwh">
                  <span className="pb-kwh-val">{totalKwh.toFixed(2)}</span>
                  <span className="pb-kwh-unit">kWh</span>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add row controls */}
      <div className="pb-add-row">
        <button className="pb-add-blank" onClick={handleAddBlank}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add appliance
        </button>

        <button
          className="pb-add-quick"
          onClick={() => setShowQuickAdd(v => !v)}
          aria-expanded={showQuickAdd}
        >
          Quick-add catalogue
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d={showQuickAdd ? 'M2 8l4-4 4 4' : 'M2 4l4 4 4-4'}
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Quick-add dropdown */}
      {showQuickAdd && (
        <div className="pb-quickadd-panel" role="listbox" aria-label="Quick-add catalogue">
          {QUICK_ADD.map((item) => (
            <button
              key={item.appliance_name}
              className="pb-quickadd-item"
              onClick={() => handleQuickAdd(item)}
              role="option"
            >
              <span className="pb-qa-name">{item.appliance_name}</span>
              <span className="pb-qa-meta">{item.watts}W · {item.hours_weekday}h/day</span>
            </button>
          ))}
        </div>
      )}

      <div className="pb-actions">
        <button className="pb-btn-ghost" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button
          className="pb-btn-primary"
          onClick={onNext}
          disabled={appliances.length === 0}
        >
          Next — Usage pattern
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
