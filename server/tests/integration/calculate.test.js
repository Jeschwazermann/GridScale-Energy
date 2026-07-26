import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app.js";

const validRequest = {
  appliances: [
    { name: "Fan", power: 60, hours: 8, days: 365, units: 2 },
  ],
  gridTariff: 100,
  gridHours: 12,
  fuelPrice: 1_000,
  efficiency: 2,
  genHours: 12,
  capex: 2_000_000,
  lifespan: 25,
};

describe("POST /api/calculate", () => {
  it("returns a full calculation for valid inputs", async () => {
    const response = await request(app).post("/api/calculate").send(validRequest);

    expect(response.status).toBe(200);
    expect(response.body.energy.annualKWh).toBeCloseTo(350.4);
    expect(response.body.grid.annualCost).toBeCloseTo(17_520);
    expect(response.body.generator.annualCost).toBeCloseTo(96_360);
    expect(response.body.solar).toMatchObject({
      breakdown: { capex: 2_000_000, lifespan: 25 },
    });
    expect(response.body.comparison).toHaveProperty("solarStatus");
  });

  it("rejects a request without appliances", async () => {
    const response = await request(app)
      .post("/api/calculate")
      .send({ ...validRequest, appliances: [] });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("At least one appliance is required.");
  });

  it("rejects source hours that exceed one day", async () => {
    const response = await request(app)
      .post("/api/calculate")
      .send({ ...validRequest, gridHours: 18, genHours: 8 });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("exceeds 24");
  });

  it("rejects invalid solar CAPEX", async () => {
    const response = await request(app)
      .post("/api/calculate")
      .send({ ...validRequest, capex: 0 });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("CAPEX is required");
  });
});
