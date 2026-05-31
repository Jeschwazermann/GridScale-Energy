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

  // Current reality: what the user actually pays today (grid + generator combined)
  // This is the most honest comparison number when both sources are present
  const currentReality =
    grid && generator ? grid.annualCost + generator.annualCost : null;
  const savingsVsReality =
    currentReality != null ? currentReality - solar.annualCost : null;

  // Payback: solar vs grid when available, else vs generator
  // Uses the single-source cost (not combined) for the investment calculation
  let savingsPerYear = null;
  let paybackYears = null;
  let paybackMessage = null;
  let breakEvenCapex = null;
  let comparedAgainst = null;

  if (grid) {
    comparedAgainst = "Grid";
    // When both sources exist, compare solar against the combined reality for savings
    // but keep grid-only for payback (standard investment metric)
    savingsPerYear =
      currentReality != null
        ? currentReality - solar.annualCost
        : grid.annualCost - solar.annualCost;

    const gridOnlySavings = grid.annualCost - solar.annualCost;
    if (savingsPerYear > 0) {
      // Payback based on grid-only savings (conservative, standard metric)
      paybackYears =
        gridOnlySavings > 0 ? capex / gridOnlySavings : capex / savingsPerYear;
    } else if (savingsPerYear === 0) {
      paybackMessage =
        "Solar costs the same as your current energy spend at this usage level.";
    } else {
      const impliedLifespan = capex / solar.annualCost;
      breakEvenCapex = Math.round(
        (currentReality ?? grid.annualCost) * impliedLifespan,
      );
      paybackMessage =
        "Solar does not offset costs at current usage — your load may be too low for the system size entered.";
    }
  } else if (generator) {
    comparedAgainst = "Generator";
    savingsPerYear = generator.annualCost - solar.annualCost;

    if (savingsPerYear > 0) {
      paybackYears = capex / savingsPerYear;
    } else if (savingsPerYear === 0) {
      paybackMessage =
        "Solar costs the same as your generator at current usage.";
    } else {
      const impliedLifespan = capex / solar.annualCost;
      breakEvenCapex = Math.round(generator.annualCost * impliedLifespan);
      paybackMessage =
        "Solar does not offset generator costs at current usage — your load may be too low for the system size entered.";
    }
  }

  return {
    cheapestSource,
    savingsPerYear,
    savingsVsReality,
    currentReality,
    paybackYears,
    paybackMessage,
    breakEvenCapex,
    comparedAgainst,
  };
};
