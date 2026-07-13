import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Search, Zap } from "lucide-react";
import {
  APPLIANCE_LIBRARY,
  CATEGORY_ICONS,
  EMPTY_APPLIANCE,
  inp,
} from "./assessmentHelpers";

/* ─── SectionCard (local — only needed here and AssessmentSettings) ──
   Imported by both child components from their own copy, keeping each
   file self-contained. If you want to share it, extract to a ui/ folder. */
const SectionCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  children,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
    </div>
    <div className="px-6 py-6">{children}</div>
  </div>
);

/* ─── ApplianceRow ───────────────────────────────────────────── */
function ApplianceRow({ appliance, index, onChange, onRemove, isOnly }) {
  const [query, setQuery] = useState(appliance.name);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered =
    query.trim().length > 0
      ? APPLIANCE_LIBRARY.filter((a) =>
          a.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 8)
      : [];

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectAppliance = (item) => {
    setQuery(item.name);
    setOpen(false);
    onChange(index, { target: { name: "name", value: item.name } });
    onChange(index, { target: { name: "power", value: String(item.power) } });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 items-start md:items-center bg-gray-50 md:bg-transparent rounded-xl md:rounded-none p-3 md:p-0">
      <div className="relative" ref={ref}>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search appliance…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              onChange(index, {
                target: { name: "name", value: e.target.value },
              });
            }}
            onFocus={() => {
              if (query.trim()) setOpen(true);
            }}
            className={`${inp} pl-9`}
          />
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {filtered.map((item) => (
              <button
                key={item.name}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectAppliance(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-teal-50 flex justify-between items-center group transition-colors"
              >
                <span className="text-sm text-gray-800 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[item.category]}</span>
                  {item.name}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-teal-600 transition-colors shrink-0 ml-2">
                  {item.power}W
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        type="number"
        name="power"
        placeholder="Watts"
        min="0"
        value={appliance.power}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <input
        type="number"
        name="hours"
        placeholder="Hrs/day"
        min="0"
        max="24"
        value={appliance.hours}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <input
        type="number"
        name="days"
        placeholder="Days/yr"
        min="0"
        max="365"
        value={appliance.days}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <input
        type="number"
        name="units"
        placeholder="Units"
        min="0"
        value={appliance.units}
        onChange={(e) => onChange(index, e)}
        className={inp}
      />
      <button
        onClick={() => onRemove(index)}
        disabled={isOnly}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-20 transition-all self-center"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

/* ─── ApplianceList ──────────────────────────────────────────────
   Props:
     appliances   — array of appliance objects (owned by parent)
     onChange     — (index, event) => void
     onAdd        — () => void
     onRemove     — (index) => void
──────────────────────────────────────────────────────────────── */
export { EMPTY_APPLIANCE };

export default function ApplianceList({
  appliances,
  onChange,
  onAdd,
  onRemove,
}) {
  return (
    <SectionCard
      icon={Zap}
      iconBg="bg-yellow-50"
      iconColor="text-yellow-500"
      title="Appliances"
      subtitle="Search for each device — wattage fills in automatically"
    >
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 mb-3">
        {["Appliance", "Power (W)", "Hrs/Day", "Days/Year", "Units", ""].map(
          (h) => (
            <span
              key={h}
              className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >
              {h}
            </span>
          ),
        )}
      </div>

      <div className="space-y-2">
        {appliances.map((appliance, index) => (
          <ApplianceRow
            key={index}
            appliance={appliance}
            index={index}
            onChange={onChange}
            onRemove={onRemove}
            isOnly={appliances.length === 1}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <Plus size={16} /> Add Another Appliance
        </button>
        <p className="text-xs text-gray-400 max-w-xs">
          💡 Can't find an appliance? Type a name and enter wattage manually.
        </p>
      </div>
    </SectionCard>
  );
}
