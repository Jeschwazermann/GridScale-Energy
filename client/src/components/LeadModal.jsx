import { useState } from "react";
import {
  X,
  Phone,
  Mail,
  MapPin,
  User,
  CheckCircle,
  Loader,
} from "lucide-react";
import axios from "axios";
import { NIGERIA_STATES, NIGERIA_LGAS } from "../constants/nigerianData";
import { trackEvent } from "../lib/analytics";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const inp =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

function formatCompactNaira(value) {
  if (value == null || Number.isNaN(value)) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

export default function LeadModal({
  onClose,
  calculatorResult,
  calculatorInputs,
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    state: "",
    lga: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "state" ? { lga: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.phone.trim() || !form.state) {
      setError("Name, phone number, and state are required.");
      return;
    }

    setLoading(true);

    // console.log("Submitting lead with inputs:", {
    //   hasResult: !!calculatorResult,
    //   hasInputs: !!calculatorInputs,
    //   inputKeys: calculatorInputs ? Object.keys(calculatorInputs) : null,
    //   appliances: calculatorInputs?.appliances?.length ?? 0,
    // });

    try {
      await api.post("/api/leads", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        state: form.state || null,
        address: form.address.trim() || null,
        LGA: form.lga || null,
        calculatorResult: calculatorResult ?? null,
        calculatorInputs: calculatorInputs ?? null,
      });

      trackEvent("lead_submitted", {
        state: form.state || null,
        has_address: Boolean(form.address.trim()),
        savings_per_year: calculatorResult?.comparison?.savingsPerYear ?? null,
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-teal-600 px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-white text-lg">
              Get connected with a solar installer
            </h2>
            <p className="text-teal-200 text-xs mt-1">
              A verified GridScale Africa installer will contact you about your
              assessment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white transition-colors shrink-0 ml-4 mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-teal-600" />
            </div>
            <h3 className="font-display font-bold text-xl text-gray-900 mb-2">
              ⚡ You're one step closer to reliable power
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-3">
              Your request has been sent to a verified solar installer. They'll
              contact <strong className="text-gray-700">{form.name}</strong> on{" "}
              <strong className="text-gray-700">{form.phone}</strong> shortly.
            </p>
            <div className="flex flex-col items-center gap-1 mb-6 text-xs text-gray-400">
              <span>
                ✔ Free consultation &nbsp;·&nbsp; ✔ No obligation &nbsp;·&nbsp;
                ✔ No spam
              </span>
              <span className="text-teal-500 font-medium">
                💡 No pressure. Just clear, honest recommendations.
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
            >
              Got it
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {/* Name */}
            <div>
              <label className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 items-center gap-1.5">
                <User size={11} className="text-gray-400" /> Full Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Emeka Okonkwo"
                value={form.name}
                onChange={handleChange}
                required
                className={inp}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 items-center gap-1.5">
                <Phone size={11} className="text-gray-400" /> Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 08012345678"
                value={form.phone}
                onChange={handleChange}
                required
                className={inp}
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 items-center gap-1.5">
                <Mail size={11} className="text-gray-400" /> Email{" "}
                <span className="text-gray-300 font-normal normal-case tracking-normal">
                  (optional)
                </span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange}
                className={inp}
              />
            </div>

            {/* State */}
            <div>
              <label className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 items-center gap-1.5">
                <MapPin size={11} className="text-gray-400" /> State{" "}
                <span className="text-gray-300 font-normal normal-case tracking-normal">
                  (required for installer matching)
                </span>
              </label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className={`${inp} appearance-none`}
              >
                <option value="">Select your state…</option>
                {NIGERIA_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {/* LGA */}
            <div>
              <label className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 items-center gap-1.5">
                <MapPin size={11} className="text-gray-400" /> LGA{" "}
                <span className="text-gray-300 font-normal normal-case tracking-normal">
                  (optional)
                </span>
              </label>
              <select
                name="lga"
                value={form.lga}
                onChange={handleChange}
                disabled={!form.state}
                className={`${inp} appearance-none disabled:bg-gray-50 disabled:text-gray-300`}
              >
                <option value="">
                  {form.state ? "Select LGA…" : "Select a state first"}
                </option>
                {(NIGERIA_LGAS[form.state] ?? []).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 items-center gap-1.5">
                <MapPin size={11} className="text-gray-400" /> Address / Nearest
                Landmark{" "}
                <span className="text-gray-300 font-normal normal-case tracking-normal">
                  (optional — helps size your system more accurately)
                </span>
              </label>
              <input
                type="text"
                name="address"
                placeholder="e.g. 12 Admiralty Way, Lekki Phase 1"
                value={form.address}
                onChange={handleChange}
                className={inp}
              />
            </div>

            {/* Savings snapshot — shown if available */}
            {calculatorResult?.comparison?.savingsPerYear > 0 && (
              <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-sm text-teal-700">
                ☀️ Your assessment shows potential savings of{" "}
                <strong>
                  ₦
                  {formatCompactNaira(
                    calculatorResult.comparison.savingsPerYear,
                  )}
                  /yr
                </strong>{" "}
                — this will be shared with the installer automatically.
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold font-display py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" /> Submitting…
                </>
              ) : (
                "Connect Me with an Installer"
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Your details are only shared with verified GridScale Africa
              installers.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
