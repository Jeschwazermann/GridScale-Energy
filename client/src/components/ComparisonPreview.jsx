import { Sun, Zap, Fuel, CheckCircle } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const sources = [
  {
    icon: Zap,
    label: "Grid",
    monthly: "₦42,500",
    annual: "₦510,000",
    detail: "Tariff-based · Unreliable supply",
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    best: false,
  },
  {
    icon: Fuel,
    label: "Generator",
    monthly: "₦185,000",
    annual: "₦2,220,000",
    detail: "₦480/kWh · Fuel price risk",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    best: false,
  },
  {
    icon: Sun,
    label: "Solar",
    monthly: "₦13,750",
    annual: "₦165,000",
    detail: "₦22/kWh · Payback in 8.3 years",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    best: true,
  },
];

export default function ComparisonPreview() {
  const ref = useReveal();

  return (
    <section className="py-24 px-6 bg-white overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left copy */}
          <div>
            <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mb-3">
              Sample Output
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6 reveal">
              See the answer clearly.
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 reveal">
              For a home spending <strong className="text-gray-800">₦185,000/month</strong> on
              generator fuel, switching to solar cuts that to{" "}
              <strong className="text-teal-600">₦13,750/month</strong> — a saving of over{" "}
              <strong className="text-gray-800">₦2 million per year.</strong>
            </p>
            <ul className="space-y-3">
              {[
                "Costs shown monthly and annually",
                "Cheapest option highlighted automatically",
                "Solar payback period calculated from your capex",
                "Annual savings vs grid displayed prominently",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <CheckCircle size={16} className="text-teal-500 mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — mock result card */}
          <div className="reveal">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
                Cost Comparison · Sample Output
              </p>
              <div className="space-y-3">
                {sources.map(({ icon: Icon, label, monthly, annual, detail, iconBg, iconColor, best }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      best
                        ? "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-200"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${best ? "bg-teal-500" : iconBg}`}>
                        <Icon size={16} className={best ? "text-white" : iconColor} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold font-display text-sm ${best ? "text-white" : "text-gray-800"}`}>
                            {label}
                          </p>
                          {best && (
                            <span className="text-xs bg-teal-400/30 text-teal-100 px-2 py-0.5 rounded-full font-medium">
                              Cheapest
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${best ? "text-teal-200" : "text-gray-400"}`}>{detail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-display font-bold text-base ${best ? "text-white" : "text-gray-800"}`}>
                        {monthly}
                      </p>
                      <p className={`text-xs ${best ? "text-teal-200" : "text-gray-400"}`}>{annual}/yr</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verdict strip */}
              <div className="mt-4 bg-teal-50 rounded-xl p-4 border border-teal-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Annual savings vs Grid</span>
                  <span className="font-display font-bold text-teal-700 text-lg">₦345,000</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600 font-medium">Solar payback period</span>
                  <span className="font-semibold text-gray-800 text-sm">8.3 years</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
