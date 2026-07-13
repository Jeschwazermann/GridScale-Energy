import { Sun, Zap, Fuel, Clock } from "lucide-react";
import {
  GEN_EFFICIENCY_OPTIONS,
  GRID_HOUR_OPTIONS,
  GEN_HOUR_OPTIONS,
  inp,
  gridHoursLabel,
  genHoursLabel,
} from "./assessmentHelpers";

/* ─── Shared primitives ──────────────────────────────────────── */
const SectionCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  toggle,
  enabled,
  onToggle,
  children,
}) => (
  <div
    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
      enabled === false ? "border-gray-100 opacity-60" : "border-gray-100"
    }`}
  >
    <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-50">
      <div
        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
      >
        <Icon size={18} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1">
        <h2 className="font-display font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {toggle && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 font-medium">
            {enabled ? "Included" : "Not included"}
          </span>
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              enabled ? "bg-teal-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}
    </div>
    {enabled !== false && <div className="px-6 py-6">{children}</div>}
    {enabled === false && (
      <div className="px-6 py-4">
        <p className="text-xs text-gray-400">
          Toggle on to include this source in the comparison.
        </p>
      </div>
    )}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

/* ─── AssessmentSettings ─────────────────────────────────────────
   Props:
     settings         — { gridTariff, fuelPrice, efficiency, capex, lifespan, gridHours, genHours }
     onSettingsChange — (e) => void   (standard input onChange)
     onSettingSet     — (key, value) => void   (for button-picker fields)
     includeGrid      — bool
     includeGenerator — bool
     onToggleGrid     — () => void
     onToggleGenerator— () => void
     capexSuggestion  — number | null
──────────────────────────────────────────────────────────────── */
export default function AssessmentSettings({
  settings,
  onSettingsChange,
  onSettingSet,
  includeGrid,
  includeGenerator,
  onToggleGrid,
  onToggleGenerator,
  capexSuggestion,
}) {
  const showGridHours = includeGrid || includeGenerator;

  return (
    <>
      {/* ── Section label ── */}
      <div className="pt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          Comparison Sources
        </p>
        <p className="text-sm text-gray-500">
          Toggle on the sources your customer currently uses. Solar is always
          included.
        </p>
      </div>

      {/* ── Grid ── */}
      <SectionCard
        icon={Zap}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        title="Grid"
        subtitle="Compare solar against the customer's utility tariff"
        toggle
        enabled={includeGrid}
        onToggle={onToggleGrid}
      >
        <Field
          label="Tariff — cost per kWh (₦)"
          hint="Check NERC band on the customer's bill. Band A ≈ ₦209 · Band B ≈ ₦109 · Band D ≈ ₦68."
        >
          <input
            type="number"
            name="gridTariff"
            placeholder="e.g. 68"
            value={settings.gridTariff}
            onChange={onSettingsChange}
            className={inp}
          />
        </Field>
      </SectionCard>

      {/* ── Generator ── */}
      <SectionCard
        icon={Fuel}
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
        title="Generator"
        subtitle="Compare solar against the customer's generator running costs"
        toggle
        enabled={includeGenerator}
        onToggle={onToggleGenerator}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="Fuel Price per Litre (₦)"
            hint="Current pump price in the customer's area."
          >
            <input
              type="number"
              name="fuelPrice"
              placeholder="e.g. 1200"
              value={settings.fuelPrice}
              onChange={onSettingsChange}
              className={inp}
            />
          </Field>
          <Field label="Generator Size" hint="Pick the closest match.">
            <select
              name="efficiency"
              value={settings.efficiency}
              onChange={onSettingsChange}
              className={inp}
            >
              <option value="" disabled>
                Select generator size…
              </option>
              {GEN_EFFICIENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </SectionCard>

      {/* ── Daily NEPA Hours ── */}
      {showGridHours && (
        <SectionCard
          icon={Clock}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          title="Daily NEPA Supply"
          subtitle={
            includeGrid
              ? "How many hours of grid power does the customer typically get per day?"
              : "How many hours of NEPA does the customer get? Select 0 for no grid."
          }
        >
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {GRID_HOUR_OPTIONS.map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => onSettingSet("gridHours", hrs)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                  settings.gridHours === hrs
                    ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-700"
                }`}
              >
                {hrs === 0 ? "None" : hrs === 24 ? "Full" : `${hrs}hrs`}
              </button>
            ))}
          </div>
          {settings.gridHours != null && (
            <div className="mt-4 flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
              <Clock size={13} className="text-purple-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-purple-700 leading-snug">
                {gridHoursLabel(settings.gridHours)}
              </p>
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Daily Generator Hours ── */}
      {includeGenerator && (
        <SectionCard
          icon={Clock}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          title="Daily Generator Hours"
          subtitle="How many hours does the customer actually run their generator per day? Independent of NEPA hours."
        >
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {GEN_HOUR_OPTIONS.map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => onSettingSet("genHours", hrs)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                  settings.genHours === hrs
                    ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-700"
                }`}
              >
                {hrs === 24 ? "All off-grid" : `${hrs}hrs`}
              </button>
            ))}
          </div>
          {settings.genHours != null &&
            (() => {
              const combined = (settings.gridHours ?? 0) + settings.genHours;
              const isOver = combined > 24;
              const label = genHoursLabel(
                settings.genHours,
                settings.gridHours,
              );
              return (
                <>
                  {label && (
                    <div className="mt-4 flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                      <Clock
                        size={13}
                        className="text-orange-500 shrink-0 mt-0.5"
                      />
                      <p className="text-sm font-medium text-orange-700 leading-snug">
                        {label}
                      </p>
                    </div>
                  )}
                  {isOver && (
                    <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      <Clock
                        size={13}
                        className="text-red-500 shrink-0 mt-0.5"
                      />
                      <p className="text-sm font-medium text-red-600 leading-snug">
                        ⚠️ Grid ({settings.gridHours}hrs) + Generator (
                        {settings.genHours}hrs) = {combined}hrs — exceeds 24.
                        Please reduce one.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
        </SectionCard>
      )}

      {/* ── Solar ── */}
      <SectionCard
        icon={Sun}
        iconBg="bg-teal-50"
        iconColor="text-teal-600"
        title="Solar"
        subtitle="Always included — this is what we're comparing against"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="System CAPEX (₦)"
            hint={
              capexSuggestion
                ? `Suggested for this load: ₦${capexSuggestion.toLocaleString("en-NG")}.`
                : "Total installed cost — panels, inverter, battery, and labour."
            }
          >
            <div className="relative">
              <input
                type="number"
                name="capex"
                placeholder="e.g. 3500000"
                value={settings.capex}
                onChange={onSettingsChange}
                className={inp}
              />
              {capexSuggestion && !settings.capex && (
                <button
                  onClick={() => onSettingSet("capex", String(capexSuggestion))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                >
                  Use ₦{(capexSuggestion / 1_000_000).toFixed(1)}M
                </button>
              )}
            </div>
          </Field>
          <Field
            label="System Lifespan (years)"
            hint="Quality systems are rated for 20–25 years."
          >
            <input
              type="number"
              name="lifespan"
              placeholder="e.g. 25"
              value={settings.lifespan}
              onChange={onSettingsChange}
              className={inp}
            />
          </Field>
        </div>
      </SectionCard>
    </>
  );
}
