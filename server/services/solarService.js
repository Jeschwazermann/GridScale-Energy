export const solarCost = (energy, capex, lifespan) => {
  const annualizedCost = capex / lifespan;

  // Use effectiveAnnualKWh — the system is sized and priced for this load
  // (raw kWh + diversity buffer + efficiency losses).
  // Using raw annualKWh here would overstate the cost per kWh because
  // the denominator would be smaller than what the system actually delivers.
  const costPerKWh = annualizedCost / energy.effectiveAnnualKWh;

  return {
    annualCost: annualizedCost,
    monthlyCost: annualizedCost / 12,
    costPerKWh,
  };
};
