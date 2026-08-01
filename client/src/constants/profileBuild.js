export const STEPS = [
  { id: 1, label: "Customer type" },
  { id: 2, label: "Appliances" },
  { id: 3, label: "Usage pattern" },
  { id: 4, label: "Review" },
];

export const DEFAULT_USAGE = {
  gridHoursWeekday: 6,
  gridHoursWeekend: 4,
  isWeekendDifferent: false,
  peakPeriod: "evening",
  hasCriticalLoads: false,
  generatorHoursDay: "",
  generatorFuelLitres: "",
  generatorFuelSpend: "",
  notes: "",
};
