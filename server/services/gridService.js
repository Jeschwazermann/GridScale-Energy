export const gridCost = (energy, tariff) => {
  // Only charge for the hours grid is actually available
  const annualCost = energy.gridKWh * tariff;

  return {
    annualCost,
    monthlyCost: annualCost / 12,
    gridKWh: energy.gridKWh,
  };
};
