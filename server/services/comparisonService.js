/*/**
 * Compare costs between grid, generator, and solar
 *
 * @param {Object} grid - Grid cost object from gridCost()
 * @param {Object} generator - Generator cost object from generatorCost()
 * @param {Object} solar - Solar cost object from solarCost()
 * @param {number} capex - Total solar CAPEX in ₦
 * @param {number} lifespan - System lifespan in years (default: 25)
 * @param {Object} energy - Energy object from calculateEnergy()
 * @param {Object} options
 * @param {number} options.oversizeThreshold - Ratio threshold for oversized flag (default: 2.5)
 * @param {number} options.lowUsageThreshold - Annual kWh threshold for low usage (default: 800)
 * @returns {Object} Comparison results
 */

export const compareCosts = (
  grid,
  generator,
  solar,
  capex,
  lifespan = 25,
  energy,
  options = {},
) => {
  const { oversizeThreshold = 2.5, lowUsageThreshold = 800 } = options;

  /* ── Build source list ───────────────────────────────────────── */
  const sources = [];
  if (grid) sources.push({ label: "Grid", annualCost: grid.annualCost });
  if (generator)
    sources.push({ label: "Generator", annualCost: generator.annualCost });
  sources.push({ label: "Solar", annualCost: solar.annualCost });

  /* ── Cheapest source ─────────────────────────────────────────── */
  const cheapest = sources.reduce((a, b) =>
    a.annualCost < b.annualCost ? a : b,
  );
  const cheapestSource = cheapest.label;

  /* ── Current reality: what the user actually pays today ────── */
  const currentReality =
    grid && generator ? grid.annualCost + generator.annualCost : null;

  /* ── Savings and payback ────────────────────────────────────── */
  let savingsPerYear = null;
  let paybackYears = null;
  let comparedAgainst = null;
  let breakEvenCapex = null;

  if (grid && generator) {
    comparedAgainst = "Grid + Generator";
    savingsPerYear = currentReality - solar.annualCost;
  } else if (grid) {
    comparedAgainst = "Grid";
    savingsPerYear = grid.annualCost - solar.annualCost;
  } else if (generator) {
    comparedAgainst = "Generator";
    savingsPerYear = generator.annualCost - solar.annualCost;
  }

  if (savingsPerYear > 0) {
    paybackYears = capex / savingsPerYear;
  } else if (savingsPerYear <= 0) {
    const baseline =
      currentReality ?? grid?.annualCost ?? generator?.annualCost ?? 0;
    const impliedLifespan = lifespan ?? 25;
    breakEvenCapex = Math.round(baseline * impliedLifespan);
  }

  /* ── savingsVsReality (for display when both sources toggled) ─ */
  const savingsVsReality =
    currentReality != null ? currentReality - solar.annualCost : null;

  /* ── Payback exceeds lifespan ────────────────────────────────── */
  const paybackExceedsLifespan =
    paybackYears != null && lifespan != null && paybackYears > lifespan;

  /* ── Solar status diagnostic ────────────────────────────────── */
  let solarStatus = "viable";
  let solarInsight = null;

  if (paybackExceedsLifespan) {
    solarStatus = "unviable";
    solarInsight =
      `Solar takes an estimated ${Math.round(paybackYears)} years to pay back ` +
      `but your system lifespan is ${lifespan} years — it will not break even ` +
      `within its own lifetime at current inputs. ` +
      `Try a lower CAPEX${
        breakEvenCapex
          ? ` (a system around ₦${breakEvenCapex.toLocaleString("en-NG")} ` +
            `would break even within ${lifespan} years)`
          : ""
      } or a longer lifespan.`;
  } else if (savingsPerYear !== null && savingsPerYear <= 0) {
    // Determine if it's a sizing issue or usage issue
    const baselineCostPerKWh = grid
      ? grid.annualCost / (energy?.annualKWh || 1)
      : (generator?.costPerKWh ?? 0);

    const costRatio =
      baselineCostPerKWh > 0 ? solar.costPerKWh / baselineCostPerKWh : 0;

    if (costRatio > oversizeThreshold) {
      solarStatus = "oversized";
      solarInsight =
        "Your solar system appears oversized for your current load. " +
        "A smaller, less expensive system would be far more cost-effective. " +
        `${breakEvenCapex ? `A system around ₦${breakEvenCapex.toLocaleString("en-NG")} would be a better fit.` : ""}`;
    } else if (
      energy?.annualKWh != null &&
      energy.annualKWh < lowUsageThreshold
    ) {
      solarStatus = "low_usage";
      solarInsight =
        "Your total energy consumption is quite low. Solar becomes cost-effective " +
        "at higher usage levels — consider whether you have added all your appliances.";
    } else {
      solarStatus = "unviable";
      solarInsight =
        "Solar does not offset your current energy costs at these inputs. " +
        `${
          breakEvenCapex
            ? `A system costing around ₦${breakEvenCapex.toLocaleString("en-NG")} ` +
              `would break even within ${lifespan ?? 25} years at your current usage.`
            : "Try adjusting your CAPEX, lifespan, or reviewing your appliance inputs."
        }`;
    }
  }

  /* ── Additional financial metrics ───────────────────────────── */
  let npv = null;
  let irr = null;
  // let lcoe = null;

  if (savingsPerYear > 0 && capex > 0) {
    // Simple NPV at 15% discount rate
    const discountRate = 0.15;
    let npvValue = -capex;
    for (let year = 1; year <= lifespan; year++) {
      npvValue += savingsPerYear / Math.pow(1 + discountRate, year);
    }
    npv = npvValue;

    // Simple LCOE
    // lcoe = solar.annualCost / (energy?.annualKWh || 1);
  }

  return {
    cheapestSource,
    savingsPerYear,
    savingsVsReality,
    currentReality,
    comparedAgainst,
    paybackYears,
    paybackExceedsLifespan,
    breakEvenCapex,
    solarStatus,
    solarInsight,
    // Additional financial metrics
    npv,
    irr, // Placeholder for IRR calculation
    //lcoe,
  };
};
