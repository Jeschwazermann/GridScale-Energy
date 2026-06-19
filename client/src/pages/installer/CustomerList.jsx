import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, MapPin, ArrowRight, AlertCircle } from "lucide-react";
import InstallerLayout from "../../layouts/installer";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

/* ─── Status config ──────────────────────────────────────────── */
const STATUSES = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "quoted", label: "Quoted" },
  { value: "follow_up", label: "Follow Up" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const STATUS_STYLES = {
  new: "bg-gray-100 text-gray-600",
  quoted: "bg-blue-50 text-blue-600",
  follow_up: "bg-amber-50 text-amber-700",
  converted: "bg-teal-50 text-teal-700",
  lost: "bg-red-50 text-red-500",
};

const getStatusStyle = (status) => STATUS_STYLES[status] ?? STATUS_STYLES.new;

/* ─── Formatters ─────────────────────────────────────────────── */
const fmtShort = (v) => {
  if (!v || v <= 0) return null;
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
  return `₦${Math.round(v)}`;
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

/* ─── Skeleton row ───────────────────────────────────────────── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
    <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-36" />
      <div className="h-2.5 bg-gray-100 rounded w-24" />
    </div>
    <div className="h-5 bg-gray-100 rounded-full w-16" />
    <div className="h-3 bg-gray-100 rounded w-16" />
    <div className="h-3 bg-gray-100 rounded w-20" />
    <div className="w-4 h-4 bg-gray-100 rounded" />
  </div>
);

export default function CustomerList() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  /* ── Load customers ── */
  const loadCustomers = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("customers")
      .select("*, assessments(result, created_at)")
      .eq("installer_id", user.id)
      .order("created_at", { ascending: false });

    if (err) setError(err.message);
    else setCustomers(data ?? []);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    // call loadCustomers asynchronously to avoid synchronous setState within effect
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadCustomers();
    })();
    return () => {
      mounted = false;
    };
  }, [loadCustomers]);

  /* ── Update status ── */
  const updateStatus = async (customerId, newStatus) => {
    setUpdatingId(customerId);

    await supabase
      .from("customers")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId)
      .eq("installer_id", user.id);

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status: newStatus } : c)),
    );

    setUpdatingId(null);
  };

  /* ── Derived filtered list ── */
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesStatus = statusTab === "all" || c.status === statusTab;

      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.state?.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [customers, search, statusTab]);

  /* ── Status counts ── */
  const statusCounts = useMemo(() => {
    return customers.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
  }, [customers]);

  return (
    <InstallerLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-bold text-2xl text-gray-900">Customers</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {customers.length} total
            </p>
          </div>

          <Link
            to="/installer/new-assessment"
            className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-3 rounded-xl"
          >
            <Plus size={16} />
            New Assessment
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border shadow-sm">
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 py-2 border rounded-xl"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto mt-3">
              {STATUSES.map(({ value, label }) => {
                const count =
                  value === "all" ? customers.length : statusCounts[value] || 0;

                const active = statusTab === value;

                return (
                  <button
                    key={value}
                    onClick={() => setStatusTab(value)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl ${
                      active ? "bg-teal-50 text-teal-700" : "text-gray-400"
                    }`}
                  >
                    {label} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t" />

          {/* Table */}
          {loading ? (
            <div>
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              No customers found
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((customer) => {
                const latest = customer.assessments?.[0];
                const savings = latest?.result?.comparison?.savingsPerYear;

                return (
                  <div
                    key={customer.id}
                    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-3 px-6 py-4"
                  >
                    {/* Name */}
                    <div className="font-semibold">{customer.name}</div>

                    {/* Location */}
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {customer.state}
                    </div>

                    {/* Status */}
                    <div>
                      <select
                        value={customer.status ?? "new"}
                        onChange={(e) =>
                          updateStatus(customer.id, e.target.value)
                        }
                        disabled={updatingId === customer.id}
                        className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(
                          customer.status,
                        )}`}
                      >
                        {STATUSES.filter((s) => s.value !== "all").map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Savings */}
                    <div className="text-sm font-bold text-teal-700">
                      {fmtShort(savings) || "—"}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-gray-400">
                      {fmtDate(customer.created_at)}
                    </div>

                    {/* Link */}
                    <Link
                      to={`/installer/customers/${customer.id}`}
                      className="text-gray-400"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </InstallerLayout>
  );
}
