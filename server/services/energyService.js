export const calculateEnergy = (appliances, gridHoursPerDay = 24) => {
  let annualKWh = 0;

  appliances.forEach((item) => {
    const kWh = (item.power * item.hours * item.days * item.units) / 1000;
    annualKWh += kWh;
  });

  // Split load between grid-available hours and off-grid hours.
  // Only meaningful when both grid and generator are in use — caller
  // passes gridHoursPerDay=24 when only one source is toggled (no split needed).
  const gridFraction = Math.min(Math.max(gridHoursPerDay, 0), 24) / 24;
  const offGridFraction = 1 - gridFraction;

  return {
    annualKWh,
    monthlyKWh: annualKWh / 12,
    gridKWh: annualKWh * gridFraction,
    offGridKWh: annualKWh * offGridFraction,
    gridHoursPerDay,
  };
};
