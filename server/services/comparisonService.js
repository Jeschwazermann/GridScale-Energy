export const compareCosts = (grid, generator, solar, capex) => {
  // Build list of only the sources that were calculated
  const sources = [];
  if (grid) sources.push({ label: "Grid", annualCost: grid.annualCost });
  if (generator)
    sources.push({ label: "Generator", annualCost: generator.annualCost });
  sources.push({ label: "Solar", annualCost: solar.annualCost });

  // Cheapest across available sources
  const cheapest = sources.reduce((a, b) =>
    a.annualCost < b.annualCost ? a : b,
  );
  const cheapestSource = cheapest.label;

  // Payback: solar vs grid only (most meaningful investment comparison)
  let savingsPerYear = null;
  let paybackYears = null;
  let paybackMessage = null;

  if (grid) {
    savingsPerYear = grid.annualCost - solar.annualCost;

    if (savingsPerYear > 0) {
      paybackYears = capex / savingsPerYear;
    } else if (savingsPerYear === 0) {
      paybackMessage =
        "Solar costs the same as grid at your current usage level.";
    } else {
      paybackMessage =
        "Solar does not offset grid costs at current usage — your load may be too low for the system size entered.";
    }
  } else if (generator) {
    // Fall back to solar vs generator when grid isn't included
    savingsPerYear = generator.annualCost - solar.annualCost;

    if (savingsPerYear > 0) {
      paybackYears = capex / savingsPerYear;
    } else if (savingsPerYear === 0) {
      paybackMessage =
        "Solar costs the same as your generator at current usage.";
    } else {
      paybackMessage =
        "Solar does not offset generator costs at current usage — your load may be too low for the system size entered.";
    }
  }

  return {
    cheapestSource,
    savingsPerYear,
    paybackYears,
    paybackMessage,
  };
};
