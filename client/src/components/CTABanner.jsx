import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

export default function CTABanner() {
  const ref = useReveal();

  return (
    <section className="py-24 px-6 bg-gray-950" ref={ref}>
      <div className="max-w-4xl mx-auto text-center">
        <div
          className="relative rounded-3xl overflow-hidden px-8 py-16"
          style={{
            background: "linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #065f46 100%)",
          }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300 opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <p className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-4">
              Free · No Signup · 60 Seconds
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 reveal">
              Ready to see what you're really paying?
            </h2>
            <p className="text-teal-100 text-lg mb-10 max-w-xl mx-auto reveal">
              Enter your appliances and energy inputs. SolarSave does the rest —
              giving you a clear, honest cost comparison in under a minute.
            </p>
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-teal-900 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-teal-400/30 hover:-translate-y-0.5 text-base"
            >
              Calculate My Savings
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
