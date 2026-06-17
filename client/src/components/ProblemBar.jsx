import { useReveal } from "../hooks/useReveal";

const stats = [
  {
    value: "₦4.8T",
    label: "Spent annually on generator fuel across Nigeria",
    sub: "National Bureau of Statistics, 2023",
  },
  {
    value: "45%",
    label: "Of businesses cite power as their #1 operating cost",
    sub: "World Bank Enterprise Survey",
  },
  {
    value: "4hrs",
    label: "Average daily grid supply in most Nigerian cities",
    sub: "Nigerian Electricity Regulatory Commission",
  },
  {
    value: "22×",
    label: "Solar can be up to 22× cheaper per kWh than generator",
    sub: "GridScale internal estimates",
  },
];

export default function ProblemBar() {
  const ref = useReveal();

  return (
    <section className="bg-gray-950 py-20 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <p className="text-teal-400 text-xs font-bold uppercase tracking-widest text-center mb-3">
          The Energy Problem
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-16 reveal">
          Nigeria's energy crisis is a financial crisis.
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-gray-950 px-6 py-8 flex flex-col gap-3 reveal"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <p className="stat-value font-display text-4xl font-extrabold">
                {s.value}
              </p>
              <p className="text-gray-300 text-sm leading-snug">{s.label}</p>
              <p className="text-gray-600 text-xs">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
