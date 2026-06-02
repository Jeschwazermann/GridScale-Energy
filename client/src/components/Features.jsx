import {
  BarChart3,
  Shield,
  Globe,
  Zap,
  RefreshCw,
  Download,
} from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const features = [
  {
    id: "comparison",
    icon: BarChart3,
    title: "Direct cost comparison",
    body: "Grid, generator, and solar costs side-by-side so you can see the cheapest option right away.",
  },
  {
    id: "payback",
    icon: Shield,
    title: "Vendor-ready payback",
    body: "Payback is based on your actual capex and savings, not estimates you can’t use in real negotiations.",
  },
  {
    id: "precision",
    icon: Zap,
    title: "Device-level accuracy",
    body: "Enter each appliance and its usage, so the result reflects what you actually consume, not a broad guess.",
  },
  {
    id: "local",
    icon: Globe,
    title: "Nigeria pricing built in",
    body: "The calculator starts with Nigerian grid tariffs, diesel costs, and generator efficiency ranges that match the market.",
  },
  {
    id: "realtime",
    icon: RefreshCw,
    title: "Instant scenario testing",
    body: "Change one number and the comparison updates immediately. Test fuel, tariff, or load shifts without waiting.",
  },
  {
    id: "access",
    icon: Download,
    title: "No signup required",
    body: "Open the calculator, enter your bills, and leave with usable results — no email, no subscription.",
  },
];

function FeatureCard({ icon: Icon, title, body }) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-500">{body}</p>
    </article>
  );
}

export default function Features() {
  const ref = useReveal();

  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="bg-slate-50 py-24 px-6"
      ref={ref}
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-teal-600 text-xs font-bold uppercase tracking-[0.35em] mb-3">
            Features
          </p>
          <h2
            id="features-title"
            className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4 reveal"
          >
            Compare energy options with confidence.
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-500 reveal">
            A fast calculator that turns your actual utility and fuel costs into
            a clear, actionable comparison for grid, generator, and solar.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
