/* ─── assessmentHelpers.js ───────────────────────────────────────
   Shared constants and pure helpers used across the assessment
   form components. No React imports — plain JS only.
──────────────────────────────────────────────────────────────── */

/* ─── Appliance library ──────────────────────────────────────── */
export const APPLIANCE_LIBRARY = [
  { name: "LED Bulb", power: 9, category: "Lighting" },
  { name: "Fluorescent Tube (2ft)", power: 20, category: "Lighting" },
  { name: "Fluorescent Tube (4ft)", power: 36, category: "Lighting" },
  { name: "Security Light (Outdoor)", power: 30, category: "Lighting" },
  { name: "Ceiling Fan", power: 75, category: "Cooling" },
  { name: "Standing Fan", power: 60, category: "Cooling" },
  { name: "Table Fan", power: 40, category: "Cooling" },
  { name: "AC Unit (1HP)", power: 750, category: "Cooling" },
  { name: "AC Unit (1.5HP)", power: 1100, category: "Cooling" },
  { name: "AC Unit (2HP)", power: 1500, category: "Cooling" },
  { name: "Refrigerator (Small)", power: 100, category: "Kitchen" },
  {
    name: "Refrigerator (Large / Double Door)",
    power: 200,
    category: "Kitchen",
  },
  { name: "Deep Freezer", power: 150, category: "Kitchen" },
  { name: "Microwave", power: 1200, category: "Kitchen" },
  { name: "Electric Kettle", power: 1500, category: "Kitchen" },
  { name: "Blender", power: 400, category: "Kitchen" },
  { name: "Rice Cooker", power: 700, category: "Kitchen" },
  { name: "Electric Cooker (per plate)", power: 1000, category: "Kitchen" },
  { name: "Water Dispenser", power: 500, category: "Kitchen" },
  { name: "Toaster", power: 800, category: "Kitchen" },
  { name: 'LED TV (32")', power: 50, category: "Entertainment" },
  { name: 'LED TV (43")', power: 80, category: "Entertainment" },
  { name: 'LED TV (55")', power: 120, category: "Entertainment" },
  { name: "DSTV Decoder", power: 30, category: "Entertainment" },
  { name: "Sound System / Subwoofer", power: 200, category: "Entertainment" },
  { name: "DVD / Media Player", power: 25, category: "Entertainment" },
  { name: "Laptop", power: 65, category: "Office" },
  { name: "Desktop Computer", power: 200, category: "Office" },
  { name: 'Monitor (24")', power: 30, category: "Office" },
  { name: "WiFi Router", power: 15, category: "Office" },
  { name: "Phone Charger", power: 10, category: "Office" },
  { name: "Printer", power: 400, category: "Office" },
  { name: "Photocopier", power: 1200, category: "Office" },
  { name: "CCTV System (4 cameras)", power: 40, category: "Office" },
  { name: "Water Pump (0.5HP)", power: 370, category: "Utilities" },
  { name: "Water Pump (1HP)", power: 750, category: "Utilities" },
  { name: "Borehole Pump", power: 1500, category: "Utilities" },
  { name: "Electric Iron", power: 1000, category: "Utilities" },
  { name: "Washing Machine", power: 500, category: "Utilities" },
];

export const CATEGORY_ICONS = {
  Lighting: "💡",
  Cooling: "❄️",
  Kitchen: "🍳",
  Entertainment: "📺",
  Office: "💻",
  Utilities: "🔧",
};

/* ─── Generator options ──────────────────────────────────────── */
export const GEN_EFFICIENCY_OPTIONS = [
  { label: "Small gen (Tiger / Keke, 1–2kVA) — ~1.8 kWh/L", value: "1.8" },
  { label: "Medium gen (2.5–5kVA) — ~2.5 kWh/L", value: "2.5" },
  { label: "Large diesel gen (7.5kVA+) — ~3.5 kWh/L", value: "3.5" },
];

/* ─── Hour picker options ────────────────────────────────────── */
export const GRID_HOUR_OPTIONS = [0, 2, 4, 6, 8, 12, 16, 20, 24];
export const GEN_HOUR_OPTIONS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24];

/* ─── Empty appliance template ───────────────────────────────── */
export const EMPTY_APPLIANCE = {
  name: "",
  power: "",
  hours: "",
  days: "",
  units: "1",
};

/* ─── Shared input style ─────────────────────────────────────── */
export const inp =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

/* ─── Smart CAPEX suggestion ─────────────────────────────────── */
export const suggestCapex = (annualKWh) => {
  if (!annualKWh || annualKWh <= 0) return null;
  const dailyWh = (annualKWh * 1000) / 365;
  const systemWatts = (dailyWh / 5) * 1.3;
  const rounded = Math.round((systemWatts * 2500) / 100_000) * 100_000;
  return rounded > 0 ? rounded : null;
};

/* ─── Power supply contextual labels ────────────────────────── */
export const gridHoursLabel = (hrs) => {
  if (hrs === 0)
    return "No grid supply — grid cost engine will not apply load during NEPA hours";
  if (hrs === 24) return "Full 24hr grid supply — no downtime assumed";
  return `${hrs}hrs of NEPA per day`;
};

export const genHoursLabel = (genHrs, gridHrs) => {
  const combined = (gridHrs ?? 0) + genHrs;
  const unpowered = 24 - combined;
  if (unpowered < 0) return null;
  const unpoweredNote =
    unpowered > 0
      ? ` · ${unpowered}hr${unpowered !== 1 ? "s" : ""} unpowered (gen off)`
      : " · No downtime — generator covers all non-NEPA hours";
  return `${genHrs}hrs generator per day${unpoweredNote}`;
};
