/* ─── Standard Nigerian inverter sizes (kVA) ────────────────── */
const INVERTER_SIZES = [1, 2, 3, 5, 7.5, 10, 15, 20];

/*  Standard panel wattage (Wp) */
const PANEL_WP = 400;

/* ─── Battery: LiFePO4 100Ah @ 48V = 4.8kWh per unit ───────── */
const BATTERY_KWH_PER_UNIT = 4.8;
const BATTERY_DOD = 0.8; // depth of discharge

/* ─── CAPEX ranges (₦) by daily kWh bracket ─────────────────── */
const CAPEX_TIERS = [
  { maxDailyKWh: 5, min: 800_000, max: 1_500_000, label: "Basic" },
  { maxDailyKWh: 10, min: 1_800_000, max: 3_500_000, label: "Standard" },
  { maxDailyKWh: 20, min: 4_000_000, max: 8_000_000, label: "Comfort" },
  { maxDailyKWh: 40, min: 8_000_000, max: 20_000_000, label: "Heavy" },
  { maxDailyKWh: Infinity, min: 20_000_000, max: null, label: "Commercial" },
];

const PEAK_SUN_HOURS = 5; // Nigerian average
const SAFETY_FACTOR = 1.25; // headroom for inverter sizing
const PANEL_LOSS = 1.3; // temperature + wiring + mismatch losses

export const sizeSystem = (effectiveDailyKWh) => {
  if (!effectiveDailyKWh || effectiveDailyKWh <= 0) {
    throw new Error("Valid effectiveDailyKWh is required for system sizing.");
  }

  /* ── Inverter ──────────────────────────────────────────────── */
  // Peak load estimate: assume load spread over 8hrs average
  const peakLoadKw = (effectiveDailyKWh / 8) * SAFETY_FACTOR;
  const inverterKva = INVERTER_SIZES.find((s) => s >= peakLoadKw) ?? 20;

  /* ── Solar panels ──────────────────────────────────────────── */
  const panelKwpNeeded = (effectiveDailyKWh / PEAK_SUN_HOURS) * PANEL_LOSS;
  const panelCount = Math.ceil((panelKwpNeeded * 1000) / PANEL_WP);
  const totalKwp = (panelCount * PANEL_WP) / 1000;

  /* ── Battery bank ──────────────────────────────────────────── */
  // One day of autonomy
  const batteryKwhNeeded = effectiveDailyKWh / BATTERY_DOD;
  const batteryUnits = Math.ceil(batteryKwhNeeded / BATTERY_KWH_PER_UNIT);
  const totalBatteryKwh = batteryUnits * BATTERY_KWH_PER_UNIT;

  /* ── CAPEX range ───────────────────────────────────────────── */
  const tier = CAPEX_TIERS.find((t) => effectiveDailyKWh <= t.maxDailyKWh);

  return {
    effectiveDailyKWh,
    inverter: {
      sizeKva: inverterKva,
      label: `${inverterKva}kVA inverter`,
    },
    panels: {
      count: panelCount,
      unitWp: PANEL_WP,
      totalKwp: parseFloat(totalKwp.toFixed(2)),
      label: `${panelCount} × ${PANEL_WP}Wp panels (${totalKwp.toFixed(1)}kWp total)`,
    },
    battery: {
      units: batteryUnits,
      kwhPerUnit: BATTERY_KWH_PER_UNIT,
      totalKwh: parseFloat(totalBatteryKwh.toFixed(1)),
      label: `${batteryUnits} × LiFePO4 100Ah/48V battery (${totalBatteryKwh.toFixed(1)}kWh total)`,
    },
    capex: {
      tier: tier.label,
      min: tier.min,
      max: tier.max,
      midpoint: tier.max ? Math.round((tier.min + tier.max) / 2) : tier.min,
    },
  };
};
