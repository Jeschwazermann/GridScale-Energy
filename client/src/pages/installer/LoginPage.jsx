import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sun, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/installer/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn({ email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* ── Left panel — brand ── */}
      <div
        className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #065f46 100%)",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Decorative orbs */}
        <div className="absolute top-20 right-16 w-64 h-64 bg-teal-300 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-24 left-8 w-48 h-48 bg-emerald-300 rounded-full opacity-10 blur-2xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Sun size={18} className="text-white" strokeWidth={2} />
            </div>
            <span className="font-display font-bold text-white text-xl tracking-tight">
              GridScale Africa
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-3">
              Installer Dashboard
            </p>
            <h1 className="font-display font-bold text-white text-4xl leading-tight">
              Sell solar faster.
              <br />
              <span className="text-teal-300">Close more deals.</span>
            </h1>
          </div>
          <p className="text-teal-100 text-base leading-relaxed max-w-sm">
            Run energy assessments, size systems, generate professional
            quotations, and track your pipeline — all in one place.
          </p>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              "Appliance-level energy assessments",
              "Accurate solar system sizing",
              "Branded PDF quotations",
              "Customer pipeline management",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-teal-100"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-teal-400/60 text-xs">
            © {new Date().getFullYear()} GridScale Africa
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-14 bg-white">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 md:hidden">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Sun size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-gray-900 text-lg">
            GridScale Africa
          </span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to your installer account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white font-semibold font-display py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{" "}
            <Link
              to="/installer/signup"
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
