import { useReveal } from "../hooks/useReveal";

const testimonials = [
  {
    quote:
      "I was spending ₦210,000 a month on diesel. SolarSave showed me my payback was under 7 years. I got the system installed 3 months ago — already seeing the difference.",
    name: "Emeka Okonkwo",
    role: "Business Owner, Enugu",
    initials: "EO",
    color: "bg-teal-600",
  },
  {
    quote:
      "As someone who advises SME clients on energy costs, this tool is exactly what I needed. Clean, accurate, and it speaks the language of Nigerian energy pricing.",
    name: "Fatima Abdullahi",
    role: "Financial Consultant, Abuja",
    initials: "FA",
    color: "bg-emerald-600",
  },
  {
    quote:
      "I used to argue with my landlord about the gen bill. Now I have data. SolarSave gave me a breakdown I could actually print and show him.",
    name: "Tunde Adesanya",
    role: "Tenant, Lagos",
    initials: "TA",
    color: "bg-teal-800",
  },
];

export default function Testimonials() {
  const ref = useReveal();

  return (
    <section id="testimonials" className="py-24 px-6 bg-gray-50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 reveal">
            Real people. Real savings.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, initials, color }, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-6 reveal"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array(5).fill(null).map((_, s) => (
                  <svg key={s} className="w-4 h-4 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed flex-1">"{quote}"</p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                  <span className="text-white text-xs font-bold font-display">{initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
