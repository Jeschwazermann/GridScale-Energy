import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    confirmPw: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* Password strength indicator */
  const pwStrength = (() => {
    const p = form.password;
    if (p.length === 0) return null;
    if (p.length < 6)
      return { label: "Too short", color: "bg-red-400", width: "25%" };
    if (p.length < 8)
      return { label: "Weak", color: "bg-orange-400", width: "50%" };
    if (!/[0-9]/.test(p) || !/[A-Z]/.test(p))
      return { label: "Fair", color: "bg-yellow-400", width: "75%" };
    return { label: "Strong", color: "bg-teal-500", width: "100%" };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPw)
      return setError("Passwords do not match.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const { data } = await signUp({
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        contactName: form.contactName,
      });
      setSuccess(true);
      /* Only auto-navigate if a session is immediately active,
         meaning email confirmation is disabled in Supabase.
         If confirmation is on, data.session is null and we show
         the "check your email" screen instead. */
      if (data?.session) {
        setTimeout(() => navigate("/installer/dashboard"), 1500);
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
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
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
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
              Join as an Installer
            </p>
            <h1 className="font-display font-bold text-white text-4xl leading-tight">
              Your solar business,
              <br />
              <span className="text-teal-300">supercharged.</span>
            </h1>
          </div>
          <p className="text-teal-100 text-base leading-relaxed max-w-sm">
            Create your installer account and start running professional energy
            assessments for your customers today.
          </p>

          {/* What you get */}
          <div className="space-y-3">
            {[
              { label: "Free to get started", sub: "No credit card required" },
              {
                label: "Unlimited assessments",
                sub: "Run as many as you need",
              },
              {
                label: "Professional PDF proposals",
                sub: "Branded with your company",
              },
              {
                label: "Customer lead pipeline",
                sub: "From GridScale Africa users",
              },
            ].map(({ label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <CheckCircle
                  size={15}
                  className="text-teal-400 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-teal-300">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-teal-400/60 text-xs">
            © {new Date().getFullYear()} GridScale Africa
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-14 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 md:hidden">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Sun size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-gray-900 text-lg">
            GridScale Africa
          </span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          {/* Success state */}
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-teal-600" />
              </div>
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                We sent a confirmation link to{" "}
                <strong className="text-gray-700">{form.email}</strong>. Click
                it to activate your account then come back to sign in.
              </p>
              <Link
                to="/installer/login"
                className="inline-block mt-6 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                Go to Login →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-2">
                  Create your account
                </h2>
                <p className="text-gray-500 text-sm">
                  Set up your installer profile — takes under a minute.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="e.g. SunPower Nigeria Ltd"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                </div>

                {/* Contact name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    placeholder="e.g. Emeka Okonkwo"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Work Email
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
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
                  {/* Strength bar */}
                  {pwStrength && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`}
                          style={{ width: pwStrength.width }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {pwStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPw"
                    value={form.confirmPw}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    required
                    className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                      form.confirmPw && form.confirmPw !== form.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                  />
                  {form.confirmPw && form.confirmPw !== form.password && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords don't match
                    </p>
                  )}
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
                  className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white font-semibold font-display py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By creating an account you agree to GridScale Africa's terms
                  of service and privacy policy.
                </p>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link
                  to="/installer/login"
                  className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
