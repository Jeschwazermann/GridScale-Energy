/**
 * StepReview.jsx
 * Step 4: Review everything before saving.
 * Shows the load curve at full size, key stats, and critical loads.
 */

import { MiniLoadCurve } from './MiniLoadCurve.jsx';

const TYPE_LABELS = {
  residential:    'Residential',
  sme_office:     'SME — Office',
  sme_retail:     'SME — Retail',
  cold_room:      'Cold Room',
  clinic:         'Clinic',
  worship_centre: 'Worship Centre',
};

const PEAK_LABELS = {
  morning:    'Morning (6 am–10 am)',
  daytime:    'Daytime (9 am–5 pm)',
  evening:    'Evening (6 pm–11 pm)',
  continuous: 'Continuous (24 h)',
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
    <div className="pb-step">
      <div className="pb-step-header">
        <h2 className="pb-step-title">Review profile</h2>
        <p className="pb-step-subtitle">
          This profile will be saved and available to pre-fill new assessments for this customer.
        </p>
      </div>

      {/* Summary stats */}
      <div className="pb-review-stats">
        <div className="pb-stat-card">
          <span className="pb-stat-val">{summary.totalWeekday}</span>
          <span className="pb-stat-unit">kWh</span>
          <span className="pb-stat-lbl">Daily load (weekday)</span>
        </div>
        <div className="pb-stat-card">
          <span className="pb-stat-val">{summary.totalWeekend}</span>
          <span className="pb-stat-unit">kWh</span>
          <span className="pb-stat-lbl">Daily load (weekend)</span>
        </div>
        <div className="pb-stat-card">
          <span className="pb-stat-val">{summary.peakW.toLocaleString()}</span>
          <span className="pb-stat-unit">W</span>
          <span className="pb-stat-lbl">Peak demand</span>
        </div>
        <div className="pb-stat-card">
          <span className="pb-stat-val">{summary.criticalW.toLocaleString()}</span>
          <span className="pb-stat-unit">W</span>
          <span className="pb-stat-lbl">Critical load</span>
        </div>
      </div>

      {/* Full-size load curve */}
      <div className="pb-review-curve">
        <div className="pb-review-curve-header">
          <span className="pb-review-curve-title">24-hour load profile</span>
          <span className="pb-review-curve-peak">
            Peak at {peakHour}:00 — {loadCurve[peakHour]?.toFixed(2)} kWh
          </span>
        </div>
        <MiniLoadCurve curve={loadCurve} height={80} showLabels highlightPeak />
      </div>

      {/* Profile metadata */}
      <div className="pb-review-meta">
        <div className="pb-meta-row">
          <span className="pb-meta-key">Customer type</span>
          <span className="pb-meta-val">{TYPE_LABELS[profileType] ?? profileType}</span>
        </div>
        <div className="pb-meta-row">
          <span className="pb-meta-key">Grid (weekday / weekend)</span>
          <span className="pb-meta-val">{usage.gridHoursWeekday} h / {usage.gridHoursWeekend} h per day</span>
        </div>
        <div className="pb-meta-row">
          <span className="pb-meta-key">Peak period</span>
          <span className="pb-meta-val">{PEAK_LABELS[usage.peakPeriod] ?? usage.peakPeriod}</span>
        </div>
        {usage.generatorFuelSpend && (
          <div className="pb-meta-row">
            <span className="pb-meta-key">Monthly fuel spend</span>
            <span className="pb-meta-val">₦{Number(usage.generatorFuelSpend).toLocaleString()}</span>
          </div>
        )}
        {usage.generatorHoursDay && (
          <div className="pb-meta-row">
            <span className="pb-meta-key">Generator hours/day</span>
            <span className="pb-meta-val">{usage.generatorHoursDay} h</span>
          </div>
        )}
        {usage.notes && (
          <div className="pb-meta-row">
            <span className="pb-meta-key">Notes</span>
            <span className="pb-meta-val">{usage.notes}</span>
          </div>
        )}
      </div>

      {/* Critical loads */}
      {summary.criticalItems.length > 0 && (
        <div className="pb-review-critical">
          <span className="pb-critical-label">Critical loads</span>
          <div className="pb-critical-badges">
            {summary.criticalItems.map(name => (
              <span key={name} className="pb-critical-badge">{name}</span>
            ))}
          </div>
          <p className="pb-critical-note">
            These must remain powered during grid and generator outages.
            Battery sizing will ensure {summary.criticalW.toLocaleString()} W minimum overnight capacity.
          </p>
        </div>
      )}

      {/* Appliance count */}
      <p className="pb-review-count">
        {appliances.length} appliance{appliances.length !== 1 ? 's' : ''} captured
        {appliances.length > 0 && ` · ${appliances.filter(a => a.is_critical).length} critical`}
      </p>

      <div className="pb-actions pb-actions-review">
        <button className="pb-btn-ghost" onClick={onBack} disabled={saving}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit
        </button>

        <div className="pb-actions-right">
          <button className="pb-btn-ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button
            className="pb-btn-primary pb-btn-save"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="pb-spinner-sm" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                {isEdit ? 'Update profile' : 'Save profile'}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
