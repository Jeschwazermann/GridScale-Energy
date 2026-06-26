import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  UserPlus,
  CheckCircle,
  Clock,
} from "lucide-react";
import InstallerLayout from "../../layouts/installer";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import { claimLead, convertLead } from "../../services/installerApi";

/* ─── Status tabs ────────────────────────────────────────────── */
const TABS = [
  { value: "new", label: "New Leads", color: "text-amber-600" },
  { value: "claimed", label: "Claimed", color: "text-blue-600" },
  { value: "converted", label: "Converted", color: "text-teal-600" },
  { value: "lost", label: "Lost", color: "text-gray-400" },
];

const STATUS_STYLES = {
  new: "bg-amber-50 text-amber-700",
  claimed: "bg-blue-50 text-blue-700",
  converted: "bg-teal-50 text-teal-700",
  lost: "bg-gray-100 text-gray-500",
};

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

const timeAgo = (d) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

/* ─── Skeleton card ──────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-gray-100 rounded w-32" />
        <div className="h-2.5 bg-gray-100 rounded w-24" />
      </div>
    </div>
    <div className="h-2.5 bg-gray-100 rounded w-40" />
    <div className="h-8 bg-gray-100 rounded-xl w-28" />
  </div>
);

/* ─── LeadsPage ──────────────────────────────────────────────── */
export default function LeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("new");
  const [actionId, setActionId] = useState(null); // id of lead being actioned

  // Bumped to force a re-fetch from explicit user actions (e.g. a failed
  // claim) without calling back into a function the effect owns.
  const [refreshTick, setRefreshTick] = useState(0);

  // Tracks the in-flight fetch's "owner" so a resolving request can check
  // whether it's still the most recent one before touching state.
  const fetchIdRef = useRef(0);

  /* ── Load leads: fires on mount, on user change, and on explicit refresh ── */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchId = ++fetchIdRef.current;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("leads")
        .select("*")
        .or(`claimed_by.is.null,claimed_by.eq.${user.id}`)
        .order("created_at", { ascending: false });

      // Bail if a newer fetch has started, or we've unmounted, since this
      // result is now stale and would otherwise win a last-write-wins race.
      if (cancelled || fetchId !== fetchIdRef.current) return;

      if (err) setError(err.message);
      else setLeads(data ?? []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, refreshTick]);

  /* ── Claim a lead ── */
  const handleClaim = async (leadId) => {
    setActionId(leadId);
    try {
      await claimLead(leadId);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, claimed_by: user.id, status: "claimed" }
            : l,
        ),
      );
      setActiveTab("claimed");
    } catch {
      // Re-sync via the effect (current `user`, no stale closure) instead
      // of calling a standalone loadLeads() that could close over a
      // since-changed user.
      setRefreshTick((t) => t + 1);
    } finally {
      setActionId(null);
    }
  };

  /* ── Convert lead → create customer + mark converted ── */
  const handleConvert = async (lead) => {
    setActionId(lead.id);
    try {
      /* Create a customer record from the lead */
      const { data: customer, error: custErr } = await supabase
        .from("customers")
        .insert({
          installer_id: user.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email ?? null,
          state: lead.state ?? null,
          lga: lead.lga ?? null,
          status: "new",
          notes: "Created from calculator lead",
        })
        .select()
        .single();

      if (custErr) throw custErr;

      /* Mark lead as converted */
      await convertLead(lead.id);

      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: "converted" } : l)),
      );

      /* Navigate to the new customer to run a full assessment */
      navigate(`/installer/customers/${customer.id}`);
    } catch (err) {
      setError(err.message || "Failed to convert lead.");
      // The customer row may have been created even if convertLead failed
      // afterward — re-sync from the server so the list reflects reality
      // instead of leaving stale local state.
      setRefreshTick((t) => t + 1);
    } finally {
      setActionId(null);
    }
  };

  /* ── Filter ── */
  const filtered = leads.filter((l) => {
    if (activeTab === "new") return l.status === "new" && !l.claimed_by;
    if (activeTab === "claimed")
      return l.status === "claimed" && l.claimed_by === user.id;
    if (activeTab === "converted") return l.status === "converted";
    if (activeTab === "lost") return l.status === "lost";
    return true;
  });

  const countForTab = (tab) => {
    if (tab === "new")
      return leads.filter((l) => l.status === "new" && !l.claimed_by).length;
    if (tab === "claimed")
      return leads.filter(
        (l) => l.status === "claimed" && l.claimed_by === user.id,
      ).length;
    if (tab === "converted")
      return leads.filter((l) => l.status === "converted").length;
    if (tab === "lost") return leads.filter((l) => l.status === "lost").length;
    return 0;
  };

  return (
    <InstallerLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Page Header ── */}
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            Leads
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Consumers who clicked "Get Solar Quote" on the calculator
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ── How leads work ── */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl px-6 py-4 flex items-start gap-3">
          <Inbox size={16} className="text-teal-600 shrink-0 mt-0.5" />
          <p className="text-sm text-teal-700 leading-relaxed">
            New leads appear when someone uses the free calculator and clicks{" "}
            <strong>"Get Solar Quote"</strong>. Unclaimed leads are visible to
            all installers — claim one to lock it in as yours.
          </p>
        </div>

        {/* ── Status tabs ── */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
          {TABS.map(({ value, label, color }) => {
            const count = countForTab(value);
            const active = activeTab === value;
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-teal-600 text-white shadow-sm"
                    : `text-gray-400 hover:text-gray-600 hover:bg-gray-50`
                }`}
              >
                {label}
                {count > 0 && (
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      active
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Lead cards ── */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
            <Inbox size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400">
              {activeTab === "new"
                ? "No new leads right now"
                : `No ${activeTab} leads`}
            </p>
            {activeTab === "new" && (
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Leads appear when people use the public calculator and request a
                quote. Share your GridScale Africa link to generate more leads.
              </p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((lead) => {
              const savings =
                lead.calculator_result?.comparison?.savingsPerYear;
              const savingsLabel = fmtShort(savings);
              const isClaimed = lead.claimed_by === user.id;
              const isActioning = actionId === lead.id;

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-amber-700 text-sm font-bold font-display">
                          {lead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {lead.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {lead.phone && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Phone size={10} />
                              {lead.phone}
                            </span>
                          )}
                          {lead.email && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Mail size={10} />
                              {lead.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Status badge */}
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 capitalize ${
                        STATUS_STYLES[lead.status] ?? STATUS_STYLES.new
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    {lead.state && (
                      <p className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={11} className="text-gray-300" />
                        {lead.state}
                        {lead.lga ? `, ${lead.lga}` : ""}
                      </p>
                    )}
                    {savingsLabel && (
                      <p className="text-xs font-semibold text-teal-600">
                        ☀️ {savingsLabel}/yr potential savings from calculator
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock size={11} />
                      {timeAgo(lead.created_at)} · {fmtDate(lead.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {lead.status === "new" && !lead.claimed_by && (
                      <button
                        onClick={() => handleClaim(lead.id)}
                        disabled={isActioning}
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        {isActioning ? (
                          "Claiming…"
                        ) : (
                          <>
                            <UserPlus size={13} /> Claim Lead
                          </>
                        )}
                      </button>
                    )}
                    {lead.status === "claimed" && isClaimed && (
                      <button
                        onClick={() => handleConvert(lead)}
                        disabled={isActioning}
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        {isActioning ? (
                          "Converting…"
                        ) : (
                          <>
                            <CheckCircle size={13} /> Convert to Customer
                          </>
                        )}
                      </button>
                    )}
                    {lead.status === "converted" && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                        <CheckCircle size={13} /> Converted to customer
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </InstallerLayout>
  );
}
