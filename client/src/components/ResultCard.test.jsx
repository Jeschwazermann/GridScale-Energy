import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ResultCard from "./ResultCard.jsx";

vi.mock("./LeadModal", () => ({
  default: () => <div data-testid="lead-modal" />,
}));

const viableResult = {
  energy: {
    dailyKWh: 12,
    annualKWh: 4_380,
    gridKWh: 4_380,
    offGridKWh: 0,
    gridHoursPerDay: 24,
    genHoursPerDay: 0,
  },
  grid: { annualCost: 438_000, monthlyCost: 36_500 },
  generator: null,
  solar: { annualCost: 100_000, monthlyCost: 8_333, costPerKWh: 23 },
  comparison: {
    cheapestSource: "Solar",
    savingsPerYear: 338_000,
    paybackYears: 5.9,
    paybackExceedsLifespan: false,
    solarStatus: "viable",
    comparedAgainst: "Grid",
  },
};

const unviableResult = {
  ...viableResult,
  solar: { annualCost: 500_000, monthlyCost: 41_667, costPerKWh: 114 },
  comparison: {
    ...viableResult.comparison,
    cheapestSource: "Grid",
    savingsPerYear: -62_000,
    paybackYears: null,
    solarStatus: "unviable",
    solarInsight: "A smaller system would be a better fit.",
  },
};

function renderResult(result) {
  return render(
    <MemoryRouter>
      <ResultCard result={result} lifespan={25} calculatorInputs={{}} />
    </MemoryRouter>,
  );
}

describe("ResultCard", () => {
  it("shows the solar recommendation and quote CTA for a viable result", () => {
    renderResult(viableResult);

    expect(
      screen.getByText(/leaving your pocket unnecessarily/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Get Free Quote →" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cheapest")).toBeInTheDocument();
    expect(screen.getByText(/Solar Journey/)).toBeInTheDocument();
  });

  it("shows the diagnostic and input-adjustment controls for an unviable result", () => {
    renderResult(unviableResult);

    expect(
      screen.getByText(
        "Solar isn't your cheapest option right now — here's what changes that",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("A smaller system would be a better fit."),
    ).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Adjust Inputs" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Talk to an Installer →" }),
    ).toBeInTheDocument();
  });
});
