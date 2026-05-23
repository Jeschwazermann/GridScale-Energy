export const generatorCost = (energy, fuelPrice, efficiency) => {
  const costPerKWh = fuelPrice / efficiency;

  const annualCost = energy.annualKWh * costPerKWh;

  return {
    costPerKWh,
    annualCost,
    monthlyCost: annualCost / 12,
  };
};
