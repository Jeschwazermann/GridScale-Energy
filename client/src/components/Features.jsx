import { BarChart3, Shield, Globe, Zap, RefreshCw, Download } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const features = [
  {
    icon: BarChart3,
    title: "Side-by-Side Comparison",
    body: "Grid, generator, and solar costs displayed together so the right choice is immediately obvious.",
  },
  {
    icon: Shield,
    title: "Accurate Payback Modelling",
    body: "We calculate your solar payback period using your actual capex and real annual savings — not marketing estimates.",
  },
  {
    icon: Zap,
    title: "Appliance-Level Precision",
    body: "Input every device separately for granular consumption data. More detail = more accurate savings projections.",
  },
  {
    icon: Globe,
    title: "Nigeria-Tuned Defaults",
    body: "Pre-loaded with realistic Nigerian grid tariffs, fuel prices, and generator efficiency ranges as reference points.",
  },
  {
    icon: RefreshCw,
    title: "Instant Recalculation",
    body: "Change one input and results update immediately. Run scenarios — what if fuel hits ₦1,500/litre?",
  },
  {
    icon: Download,
    title: "No Account Needed",
    body: "Open the calculator, get your answer, leave. No email, no subscription, no friction. Just results.",
  },
];

export default function Features() {
  const ref = useReveal();

  return (
    <section id="features" className="py-24 px-6 bg-gray-50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 reveal">
            Built for real decisions.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto reveal">
            Not a vanity tool. SolarSave gives you numbers you can actually take to a vendor or a CFO.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, body }, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all duration-300 group reveal"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                <Icon size={20} className="text-teal-600" strokeWidth={1.8} />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
