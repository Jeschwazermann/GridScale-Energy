/**
 * Calculate generator costs including fuel and maintenance
 *
 * @param {Object} energy - Energy object from calculateEnergy()
 * @param {number} fuelPrice - Fuel price in ₦/litre
 * @param {number} efficiency - Generator efficiency in kWh/litre
 * @param {number} maintenancePercent - Maintenance overhead as decimal (default: 0.10)
 * @returns {Object} Generator cost breakdown
 */
export const generatorCost = (energy, fuelPrice, efficiency, maintenancePercent = 0.10) => {
  const costPerKWh = fuelPrice / efficiency;

  // Only charge for the hours grid is NOT available
  const fuelCost = energy.offGridKWh * costPerKWh;
  const maintenanceOverhead = fuelCost * maintenancePercent;
  const annualCost = fuelCost + maintenanceOverhead;

  return {
    costPerKWh: costPerKWh * (1 + maintenancePercent), // effective rate including maintenance
    annualCost,
    monthlyCost: annualCost / 12,
    dailyCost: annualCost / 365,
    offGridKWh: energy.offGridKWh,
    fuelCost,
    maintenanceOverhead,
    maintenancePercent,
  };
};
