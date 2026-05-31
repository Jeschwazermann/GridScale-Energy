export const generatorCost = (energy, fuelPrice, efficiency) => {
  const costPerKWh = fuelPrice / efficiency;
  // Only charge for the hours grid is NOT available (off-grid hours)
  const fuelCost = energy.offGridKWh * costPerKWh;
  const maintenanceOverhead = fuelCost * 0.1; // 10% for servicing, oil changes, repairs
  const annualCost = fuelCost + maintenanceOverhead;

  return {
    costPerKWh: costPerKWh * 1.1, // effective rate including maintenance
    annualCost,
    monthlyCost: annualCost / 12,
    offGridKWh: energy.offGridKWh,
  };
};
