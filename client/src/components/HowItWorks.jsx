import { Lightbulb, SlidersHorizontal, TrendingDown } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const steps = [
  {
    icon: Lightbulb,
    step: "01",
    title: "List Your Appliances",
    body:
      "Enter every device you use — TV, fridge, AC, pumps — with their wattage, daily hours, and number of units. SolarSave handles the maths.",
    color: "bg-amber-50",
    iconColor: "text-amber-500",
    border: "border-amber-100",
  },
  {
    icon: SlidersHorizontal,
    step: "02",
    title: "Set Your Energy Inputs",
    body:
      "Tell us your grid tariff, current fuel price, generator efficiency, and what a solar installation would cost. We accept the real numbers from your bills.",
    color: "bg-teal-50",
    iconColor: "text-teal-600",
    border: "border-teal-100",
  },
  {
    icon: TrendingDown,
    step: "03",
    title: "Get Your Cost Breakdown",
    body:
      "Instantly see annual and monthly costs for grid, generator, and solar — plus your payback period and how much you'd save switching to solar.",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
  },
];

export default function HowItWorks() {
  const ref = useReveal();

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 reveal">
            Three steps to clarity.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto reveal">
            No energy expertise needed. Just your bills and 60 seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, step, title, body, color, iconColor, border }, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border ${border} ${color} p-8 reveal`}
              style={{ transitionDelay: `${i * 130}ms` }}
            >
              <span className="font-display font-extrabold text-7xl text-gray-100 absolute top-4 right-6 select-none leading-none">
                {step}
              </span>
              <div className={`w-12 h-12 rounded-xl ${color} border ${border} flex items-center justify-center mb-6`}>
                <Icon size={22} className={iconColor} strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Connector line — desktop only */}
        <div className="hidden md:flex items-center justify-center mt-12 gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-teal-200" />
          <span className="text-xs text-gray-400 font-medium px-4">Results in under 60 seconds</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-teal-200" />
        </div>
      </div>
    </section>
  );
}
