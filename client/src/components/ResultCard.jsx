const ResultCard = ({ result }) => {
  const { energy, grid, generator, solar, comparison } = result;

  const fmt = (val) =>
    val != null
      ? val.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : "—";

  const sources = [
    {
      label: "Grid",
      monthly: grid.monthlyCost,
      annual: grid.annualCost,
      extra: `Tariff-based`,
    },
    {
      label: "Generator",
      monthly: generator.monthlyCost,
      annual: generator.annualCost,
      extra: `₦${fmt(generator.costPerKWh)}/kWh`,
    },
    {
      label: "Solar",
      monthly: solar.monthlyCost,
      annual: solar.annualCost,
      extra: `₦${fmt(solar.costPerKWh)}/kWh`,
    },
  ];

  return (
    <div className="space-y-5 mt-2">
      {/* Energy Consumption */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-teal-600 px-5 py-4">
          <h2 className="text-white font-semibold font-display">
            ⚡ Energy Consumption
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          <Row label="Monthly Usage" value={`${fmt(energy.monthlyKWh)} kWh`} />
          <Row label="Annual Usage" value={`${fmt(energy.annualKWh)} kWh`} />
        </div>
      </div>

      {/* Cost Comparison */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-teal-600 px-5 py-4">
          <h2 className="text-white font-semibold font-display">
            📊 Cost Comparison
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {sources.map((s) => (
            <div
              key={s.label}
              className="px-5 py-4 flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {s.label}
                  {s.label === comparison.cheapestSource && (
                    <span className="text-xs bg-teal-50 text-teal-600 font-semibold px-2 py-0.5 rounded-full">
                      Cheapest
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{s.extra}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-teal-700">
                  ₦{fmt(s.monthly)}/mo
                </p>
                <p className="text-xs text-gray-400">₦{fmt(s.annual)}/yr</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solar Verdict */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-teal-600 px-5 py-4">
          <h2 className="text-white font-semibold font-display">
            ☀️ Solar Verdict
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          <Row
            label="Annual Savings vs Grid"
            value={`₦${fmt(comparison.savingsPerYear)}`}
            highlight={comparison.savingsPerYear > 0}
          />
          <Row
            label="Payback Period"
            value={
              comparison.paybackYears
                ? `${fmt(comparison.paybackYears)} years`
                : "N/A"
            }
          />
          <Row label="Recommended Source" value={comparison.cheapestSource} />
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center px-5 py-4">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span
      className={`text-sm font-semibold ${highlight ? "text-teal-600" : "text-gray-800"}`}
    >
      {value}
    </span>
  </div>
);

export default ResultCard;
