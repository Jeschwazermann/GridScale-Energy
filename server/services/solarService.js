export const solarCost = (energy, capex, lifespan) => {
  const annualizedCost = capex / lifespan;

  const costPerKWh = annualizedCost / energy.annualKWh;

  return {
    annualCost: annualizedCost,
    monthlyCost: annualizedCost / 12,
    costPerKWh,
  };
};
