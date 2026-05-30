export const generatorCost = (energy, fuelPrice, efficiency) => {
  const costPerKWh = fuelPrice / efficiency;
  const fuelCost = energy.annualKWh * costPerKWh;
  const maintenanceOverhead = fuelCost * 0.1; // 10% for servicing, oil changes, repairs
  const annualCost = fuelCost + maintenanceOverhead;

  return {
    costPerKWh: costPerKWh * 1.1, // effective rate including maintenance
    annualCost,
    monthlyCost: annualCost / 12,
  };
};
