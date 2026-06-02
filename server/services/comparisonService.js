export const compareCosts = (
  grid,
  generator,
  solar,
  capex,
  lifespan,
  energy,
) => {
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

  /* ── Current reality: what the user actually pays today ─────────
     When both sources are present this is the honest combined spend.
     Solar replaces both — so this is the correct savings denominator. */
  const currentReality =
    grid && generator ? grid.annualCost + generator.annualCost : null;

  /* ── Savings and payback ─────────────────────────────────────────
     Rule:
       Both sources toggled  → compare solar vs combined reality
       Grid only             → compare solar vs grid
       Generator only        → compare solar vs generator
     This ensures payback reflects what solar actually replaces.   */
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
    // How much would CAPEX need to be for solar to break even?
    const baseline =
      currentReality ?? grid?.annualCost ?? generator?.annualCost ?? 0;
    const impliedLifespan = lifespan ?? 20;
    breakEvenCapex = Math.round(baseline * impliedLifespan);
  }

  /* ── savingsVsReality (for display when both sources toggled) ─── */
  const savingsVsReality =
    currentReality != null ? currentReality - solar.annualCost : null;

  /* ── Payback exceeds lifespan ────────────────────────────────── */
  const paybackExceedsLifespan =
    paybackYears != null && lifespan != null && paybackYears > lifespan;

  /* ── Solar status diagnostic ─────────────────────────────────────
     Drives visual treatment in ResultCard — colour, CTA, messaging.

     Priority order:
       1. paybackExceedsLifespan  — mathematically will never break even
       2. savingsPerYear <= 0     — solar is more expensive than baseline
       3. low usage               — load too small for any system to make sense
       4. viable                  — solar makes financial sense               */
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
    // Is it a sizing issue or a usage issue?
    const baselineCostPerKWh = grid
      ? grid.annualCost / (energy?.annualKWh || 1)
      : (generator?.costPerKWh ?? 0);

    const costRatio =
      baselineCostPerKWh > 0 ? solar.costPerKWh / baselineCostPerKWh : 0;

    if (costRatio > 2) {
      solarStatus = "oversized";
      solarInsight =
        "Your solar system appears oversized for your current load. " +
        "A smaller, less expensive system would be far more cost-effective. " +
        `${breakEvenCapex ? `A system around ₦${breakEvenCapex.toLocaleString("en-NG")} would be a better fit.` : ""}`;
    } else if (energy?.annualKWh != null && energy.annualKWh < 800) {
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
              `would break even within ${lifespan ?? 20} years at your current usage.`
            : "Try adjusting your CAPEX, lifespan, or reviewing your appliance inputs."
        }`;
    }
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
  };
};
