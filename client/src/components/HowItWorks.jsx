import { Lightbulb, SlidersHorizontal, TrendingDown } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const steps = [
  {
    step: "01",
    title: "List your appliances",
    description:
      "Add every device you run — lights, fridge, pump, AC, TV — with wattage, daily runtime, and quantity. This gives your energy profile real accuracy.",
    icon: Lightbulb,
    theme: {
      border: "border-amber-100",
      bg: "bg-amber-50",
      icon: "text-amber-600",
    },
  },
  {
    step: "02",
    title: "Enter your energy costs",
    description:
      "Share your grid tariff, fuel price, generator efficiency, and solar installation budget. Use the numbers from your bills for a true comparison.",
    icon: SlidersHorizontal,
    theme: {
      border: "border-teal-100",
      bg: "bg-teal-50",
      icon: "text-teal-600",
    },
  },
  {
    step: "03",
    title: "See savings instantly",
    description:
      "Compare monthly and annual costs for grid, generator, and solar — plus payback time and expected savings in a single view.",
    icon: TrendingDown,
    theme: {
      border: "border-emerald-100",
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
    },
  },
];

function StepCard({ step, title, description, icon: Icon, theme }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border ${theme.border} ${theme.bg} p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] reveal`}
      aria-labelledby={`how-it-works-step-${step}`}
    >
      <span className="pointer-events-none absolute right-6 top-4 text-7xl font-display font-black leading-none text-slate-100 opacity-90 select-none">
        {step}
      </span>

      <div
        className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl border ${theme.border} ${theme.bg}`}
      >
        <Icon size={22} className={theme.icon} strokeWidth={1.8} />
      </div>

      <h3
        id={`how-it-works-step-${step}`}
        className="font-display text-xl font-bold text-slate-900 mb-3"
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
    </article>
  );
}

export default function HowItWorks() {
  const ref = useReveal();

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="bg-white py-24 px-6"
      ref={ref}
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-teal-600 text-xs font-bold uppercase tracking-[0.35em] mb-3">
            How it works
          </p>
          <h2
            id="how-it-works-title"
            className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4 reveal"
          >
            From bill details to solar clarity in three steps.
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-500 reveal">
            No jargon, no guesswork — just the exact bill inputs you already
            have, turned into a clear energy comparison.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((stepData) => (
            <StepCard key={stepData.step} {...stepData} />
          ))}
        </div>

        <div className="hidden md:flex items-center justify-center gap-2 mt-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
          <span className="text-xs text-slate-400 font-medium px-4">
            Results in under 60 seconds
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-teal-200 to-transparent" />
        </div>
      </div>
    </section>
  );
}
