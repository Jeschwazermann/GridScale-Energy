import { useState, useEffect } from "react";
import { Plus, UserPlus, ChevronDown } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/useAuth";
import { inp } from "./assessmentHelpers";
import { NIGERIAN_STATES } from "../../../constants/nigerianData";

/* ─── CustomerSelector ───────────────────────────────────────────
   Owns all customer-related state: the list fetch, the dropdown,
   and the inline create-customer form. Calls onSelect(id) whenever
   the active customer changes so the parent can update its own state.
──────────────────────────────────────────────────────────────── */
export default function CustomerSelector({ selectedId, onSelect }) {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);

  /* ── Fetch customer list ── */
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("customers")
        .select("id, name, state")
        .eq("installer_id", user.id)
        .order("name");

      if (cancelled) return;
      setCustomers(data ?? []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /* ── Create customer inline ── */
  const handleCreate = async () => {
    if (!name.trim() || !phone.trim() || !state) return;
    setCreating(true);

    const { data, error } = await supabase
      .from("customers")
      .insert({
        installer_id: user.id,
        name: name.trim(),
        phone: phone.trim(),
        state: state || null,
        address: address.trim() || null,
        status: "new",
      })
      .select()
      .single();

    if (!error && data) {
      setCustomers((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      onSelect(data.id);
      setShowNew(false);
      setName("");
      setPhone("");
      setState("");
      setAddress("");
    }

    setCreating(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-50">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <UserPlus size={18} className="text-teal-600" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="font-display font-bold text-gray-900">Customer</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Select an existing customer or create a new one
          </p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Dropdown */}
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => {
              onSelect(e.target.value);
              setShowNew(false);
            }}
            disabled={loading}
            className={`${inp} appearance-none pr-10`}
          >
            <option value="">
              {loading ? "Loading customers…" : "Select a customer…"}
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.state ? ` — ${c.state}` : ""}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Toggle new customer form */}
        <button
          onClick={() => setShowNew((v) => !v)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <Plus size={15} />
          {showNew ? "Cancel" : "Create new customer"}
        </button>

        {/* Inline create form */}
        {showNew && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emeka Okonkwo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inp}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={`${inp} appearance-none`}
                >
                  <option value="">Select state…</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Street address or landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inp}
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim() || !phone.trim() || !state}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            >
              {creating ? "Creating…" : "Save Customer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
