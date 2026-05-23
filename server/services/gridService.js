export const gridCost = (energy, tariff) => {
  const annualCost = energy.annualKWh * tariff;

  return {
    annualCost,
    monthlyCost: annualCost / 12,
  };
};
