import { useState } from "react";
import { X, Sun, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

/* Nigerian states list */
const NG_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

/* ── LeadModal ──────────────────────────────────────────────────────────────
   Props:
   - isOpen: boolean
   - onClose: () => void
   - calculatorResult: object  (the full result object from the calculator)
   - savingsSummary: string    (e.g. "₦240K/yr")
────────────────────────────────────────────────────────────────────────── */
export default function LeadModal({
  isOpen,
  onClose,
  calculatorResult,
  savingsSummary,
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    state: "",
    lga: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          state: form.state || undefined,
          lga: form.lga.trim() || undefined,
          calculatorResult: calculatorResult || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Something went wrong. Please try again.",
        );
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  const handleClose = () => {
    // Reset state on close so the modal is clean next time
    setForm({ name: "", phone: "", email: "", state: "", lga: "" });
    setStatus("idle");
    setErrorMsg("");
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Panel */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* ── Success state ── */}
        {status === "success" ? (
          <div className="px-8 py-10 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle
                size={32}
                className="text-teal-600"
                strokeWidth={1.8}
              />
            </div>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
              Request sent!
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              A solar installer in your area will be in touch shortly. Keep your
              phone handy.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="bg-teal-600 px-6 py-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shrink-0">
                  <Sun size={20} className="text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-white text-lg leading-tight">
                    Get your solar quote
                  </h2>
                  {savingsSummary && (
                    <p className="text-teal-200 text-xs mt-0.5">
                      Based on your results — save {savingsSummary}/yr
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-teal-300 hover:text-white transition-colors mt-0.5 shrink-0"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed -mt-1">
                A verified installer will contact you with a personalised
                quotation — no commitment required.
              </p>

              {/* Name */}
              <div>
                <label
                  className="block text-xs font-semibold text-gray-600 mb-1.5"
                  htmlFor="lead-name"
                >
                  Full name <span className="text-red-400">*</span>
                </label>
                <input
                  id="lead-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Emeka Okafor"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  className="block text-xs font-semibold text-gray-600 mb-1.5"
                  htmlFor="lead-phone"
                >
                  Phone number <span className="text-red-400">*</span>
                </label>
                <input
                  id="lead-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="e.g. 08012345678"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-xs font-semibold text-gray-600 mb-1.5"
                  htmlFor="lead-email"
                >
                  Email{" "}
                  <span className="text-gray-300 font-normal">(optional)</span>
                </label>
                <input
                  id="lead-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>

              {/* State + LGA row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                    htmlFor="lead-state"
                  >
                    State
                  </label>
                  <select
                    id="lead-state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Select state</option>
                    {NG_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                    htmlFor="lead-lga"
                  >
                    LGA / Area
                  </label>
                  <input
                    id="lead-lga"
                    name="lga"
                    type="text"
                    placeholder="e.g. Lekki"
                    value={form.lga}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Error message */}
              {status === "error" && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle
                    size={16}
                    className="text-red-500 shrink-0 mt-0.5"
                    strokeWidth={1.8}
                  />
                  <p className="text-sm text-red-700">{errorMsg}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Request my free quote →"
                )}
              </button>

              <p className="text-center text-xs text-gray-300">
                Your details are only shared with verified installers.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
