import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sun, Zap, Fuel } from "lucide-react";

export default function Hero() {
  const headingRef = useRef(null);

  useEffect(() => {
    const el = headingRef.current;
    if (el) {
      setTimeout(() => el.classList.add("visible"), 100);
    }
  }, []);

  return (
    <section
      className="hero-mesh min-h-screen flex flex-col justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/hero-solar.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      {/* Teal gradient overlay — sits on top of photo at ~80% opacity */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,20,30,0.88) 0%, rgba(15,118,110,0.80) 60%, rgba(6,95,70,0.75) 100%)",
        }}
      />

      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating orb */}
      <div className="absolute top-24 right-16 w-72 h-72 bg-teal-400 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 left-8 w-48 h-48 bg-emerald-300 rounded-full opacity-10 blur-2xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-teal-200 text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-teal-300 rounded-full animate-pulse" />
              Built for the Nigerian Energy Reality
            </div>

            <h1
              ref={headingRef}
              className="font-display text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6 reveal underline-teal"
            >
              Stop Guessing.
              <br />
              <span className="text-teal-300">Start Saving.</span>
            </h1>

            <p className="text-teal-100 text-lg leading-relaxed mb-10 max-w-md">
              Grid. Generator. Solar. Our Cost Calculator calculates exactly
              what each energy source costs you — and tells you which one makes
              financial sense for your home or business.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-teal-900 font-bold px-7 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-teal-400/40 hover:-translate-y-0.5"
              >
                Calculate My Savings
                <ArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-medium px-7 py-4 rounded-xl transition-all duration-200 hover:bg-white/10"
              >
                See How It Works
              </a>
            </div>

            {/* Trust line */}
            <p className="text-teal-300/70 text-xs mt-8 font-medium tracking-wide uppercase">
              Free to use · No signup required · Results in 60 seconds
            </p>
          </div>

          {/* Right — Visual */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              {/* Central sun */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="sun-pulse absolute inset-0 rounded-full" />
                <div className="relative z-10 w-28 h-28 bg-teal-400 rounded-full flex items-center justify-center shadow-2xl shadow-teal-400/40">
                  <Sun size={52} className="text-white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Orbiting energy cards */}
              <div className="absolute -top-12 -right-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-yellow-300" />
                  <span className="text-xs text-teal-200">Grid</span>
                </div>
                <p className="font-display font-bold text-xl">₦68/kWh</p>
              </div>

              <div className="absolute -bottom-10 -left-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Fuel size={14} className="text-orange-300" />
                  <span className="text-xs text-teal-200">Generator</span>
                </div>
                <p className="font-display font-bold text-xl">₦480/kWh</p>
              </div>

              <div className="absolute -bottom-4 -right-28 bg-teal-400/20 backdrop-blur-md border border-teal-300/40 rounded-2xl px-5 py-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Sun size={14} className="text-teal-300" />
                  <span className="text-xs text-teal-200">Solar</span>
                </div>
                <p className="font-display font-bold text-xl text-teal-300">
                  ₦22/kWh
                </p>
                <p className="text-xs text-teal-400 mt-0.5">✓ Cheapest</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 80L48 69.3C96 58.7 192 37.3 288 32C384 26.7 480 37.3 576 48C672 58.7 768 69.3 864 64C960 58.7 1056 37.3 1152 32C1248 26.7 1344 37.3 1392 42.7L1440 48V80H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
