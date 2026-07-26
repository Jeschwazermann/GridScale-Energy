import { describe, expect, it } from "vitest";
import {
  genHoursLabel,
  gridHoursLabel,
  suggestCapex,
} from "./assessmentHelpers.js";

describe("assessment helpers", () => {
  it("suggests a rounded CAPEX for a valid annual load", () => {
    expect(suggestCapex(0)).toBeNull();
    expect(suggestCapex(-100)).toBeNull();
    expect(suggestCapex(3_650)).toBe(6_500_000);
  });

  it("describes grid availability at its boundaries", () => {
    expect(gridHoursLabel(0)).toContain("No grid supply");
    expect(gridHoursLabel(24)).toContain("Full 24hr grid supply");
    expect(gridHoursLabel(8)).toBe("8hrs of NEPA per day");
  });

  it("describes generator coverage and rejects impossible schedules", () => {
    expect(genHoursLabel(12, 12)).toContain("No downtime");
    expect(genHoursLabel(4, 16)).toContain("4hrs unpowered");
    expect(genHoursLabel(12, 16)).toBeNull();
  });
});
