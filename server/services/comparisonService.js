export const compareCosts = (grid, generator, solar) => {
  const cheapest = Math.min(
    grid.annualCost,
    generator.annualCost,
    solar.annualCost,
  );

  let cheapestSource = "Grid";

  if (cheapest === generator.annualCost) {
    cheapestSource = "Generator";
  } else if (cheapest === solar.annualCost) {
    cheapestSource = "Solar";
  }

  // Payback (solar vs grid)
  const savingsPerYear = grid.annualCost - solar.annualCost;

  const paybackYears =
    savingsPerYear > 0 ? (solar.annualCost * 10) / savingsPerYear : null;

  return {
    cheapestSource,
    savingsPerYear,
    paybackYears,
  };
};
