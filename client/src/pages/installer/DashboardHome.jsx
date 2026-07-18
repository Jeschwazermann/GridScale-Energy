import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  FileText,
  Inbox,
  Plus,
  ArrowRight,
  MapPin,
  AlertCircle,
} from "lucide-react";
import InstallerLayout from "../../layouts/installer";
import { useInstallerStats } from "../../hooks/useInstallerStats";
import { useAuth } from "../../contexts/useAuth";
import { claimLead } from "../../services/installerApi";

/* ─── Formatters ─────────────────────────────────────────────── */
const fmtShort = (v) => {
  if (v == null) return "—";
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
  return `₦${Math.round(v)}`;
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
      })
    : "—";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const today = new Date().toLocaleDateString("en-NG", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/* ─── Status badge ───────────────────────────────────────────── */
const STATUS_STYLES = {
  new: "bg-gray-100 text-gray-600",
  quoted: "bg-blue-50 text-blue-600",
  follow_up: "bg-amber-50 text-amber-600",
  converted: "bg-teal-50 text-teal-700",
  lost: "bg-red-50 text-red-500",
};

const StatusBadge = ({ status }) => (
  <span
    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
      STATUS_STYLES[status] ?? STATUS_STYLES.new
    }`}
  >
    {status?.replace("_", " ") ?? "new"}
  </span>
);

/* ─── Stat card ──────────────────────────────────────────────── */
const StatCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  highlight,
}) => (
  <div
    className={`rounded-2xl p-5 border flex flex-col gap-3 ${
      highlight ? "bg-teal-600 border-teal-500" : "bg-white border-gray-100"
    }`}
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        highlight ? "bg-teal-500" : iconBg
      }`}
    >
      <Icon
        size={18}
        className={highlight ? "text-white" : iconColor}
        strokeWidth={1.8}
      />
    </div>
    <div>
      <p
        className={`text-xs font-semibold uppercase tracking-widest mb-1 ${
          highlight ? "text-teal-200" : "text-gray-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-display font-extrabold text-2xl leading-none ${
          highlight ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-xs mt-1 ${highlight ? "text-teal-200" : "text-gray-400"}`}
        >
          {sub}
        </p>
      )}
    </div>
  </div>
);

/* ─── DashboardHome ──────────────────────────────────────────── */
export default function DashboardHome() {
  const { profile } = useAuth();
  const { stats, recentCustomers, newLeads, loading, error, refetch } =
    useInstallerStats();

  const [claimingId, setClaimingId] = useState(null);

  const handleClaimLead = async (leadId) => {
    if (claimingId) return;
    setClaimingId(leadId);
    try {
      await claimLead(leadId);
    } catch {
      /* 409 = already claimed by someone else — fall through to refetch */
    } finally {
      setClaimingId(null);
      refetch();
    }
  };

  return (
    <InstallerLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">
              {greeting()}, {profile?.contact_name?.split(" ")[0] ?? "there"}.
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {profile?.company_name && `${profile.company_name} · `}
              {today}
            </p>
          </div>
          <Link
            to="/installer/new-assessment"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold font-display text-sm px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md shrink-0"
          >
            <Plus size={16} />
            New Assessment
          </Link>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ── Stat Cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
                  <div className="h-7 bg-gray-100 rounded w-16" />
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              label="Total Customers"
              value={stats?.totalCustomers ?? 0}
              sub="assessed so far"
            />
            <StatCard
              icon={Briefcase}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              label="Active Pipeline"
              value={stats?.activePipeline ?? 0}
              sub="quoted or in follow-up"
              highlight
            />
            <StatCard
              icon={FileText}
              iconBg="bg-purple-50"
              iconColor="text-purple-500"
              label="Quotations Sent"
              value={stats?.quotationsSent ?? 0}
              sub="sent or accepted"
            />
            <StatCard
              icon={Inbox}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              label="New Leads"
              value={stats?.newLeadsCount ?? 0}
              sub="waiting to be claimed"
            />
          </div>
        )}

        {/* ── Two Column Grid ── */}
        <div className="grid md:grid-cols-5 gap-6">
          {/* Recent Customers — 3/5 width */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="font-display font-bold text-gray-900">
                Recent Customers
              </h2>
              <Link
                to="/installer/customers"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="divide-y divide-gray-50">
                {Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="px-6 py-4 flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-9 h-9 bg-gray-100 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-32" />
                        <div className="h-2.5 bg-gray-100 rounded w-20" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : recentCustomers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-400">
                  No customers yet
                </p>
                <Link
                  to="/installer/new-assessment"
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold mt-1 inline-block"
                >
                  Run your first assessment →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentCustomers.map((customer) => {
                  /* Get savings from most recent assessment */
                  const latestAssessment = customer.assessments?.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                  )[0];
                  const savings =
                    latestAssessment?.results?.comparison?.savingsPerYear;

                  return (
                    <Link
                      key={customer.id}
                      to={`/installer/customers/${customer.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-teal-700 text-sm font-bold font-display">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-teal-700 transition-colors">
                          {customer.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {customer.state && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-400">
                              <MapPin size={10} />
                              {customer.state}
                            </span>
                          )}
                          <StatusBadge status={customer.status} />
                        </div>
                      </div>

                      {/* Savings + date */}
                      <div className="text-right shrink-0">
                        {savings > 0 ? (
                          <p className="text-sm font-bold text-teal-700 font-display">
                            {fmtShort(savings)}/yr
                          </p>
                        ) : (
                          <p className="text-xs text-gray-300">No assessment</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fmtDate(customer.created_at)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* New Leads — 2/5 width */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-gray-900">
                  New Leads
                </h2>
                {(stats?.newLeadsCount ?? 0) > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {stats.newLeadsCount}
                  </span>
                )}
              </div>
              <Link
                to="/installer/leads"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="divide-y divide-gray-50">
                {Array(3)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="px-6 py-4 animate-pulse space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-28" />
                      <div className="h-2.5 bg-gray-100 rounded w-20" />
                      <div className="h-6 bg-gray-100 rounded-lg w-16 mt-2" />
                    </div>
                  ))}
              </div>
            ) : newLeads.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Inbox size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-400">
                  No new leads yet
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-45 mx-auto">
                  Leads come from users who click "Get Solar Quote" on the
                  calculator
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {newLeads.map((lead) => {
                  const savings =
                    lead.calculator_result?.comparison?.savingsPerYear;
                  return (
                    <div key={lead.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {lead.name}
                          </p>
                          <p className="text-xs text-gray-400">{lead.phone}</p>
                          {lead.state && (
                            <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                              <MapPin size={10} />
                              {lead.state}
                            </p>
                          )}
                          {savings > 0 && (
                            <p className="text-xs font-semibold text-teal-600 mt-1">
                              {fmtShort(savings)}/yr potential savings
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {fmtDate(lead.created_at)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleClaimLead(lead.id)}
                        disabled={claimingId === lead.id}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {claimingId === lead.id ? "Claiming…" : "Claim Lead →"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: "Run New Assessment",
              sub: "Evaluate a customer's energy costs",
              to: "/installer/new-assessment",
              cta: "Start",
              color: "border-teal-100 hover:border-teal-200 hover:bg-teal-50",
            },
            {
              title: "View All Customers",
              sub: "Manage your full customer list",
              to: "/installer/customers",
              cta: "Open",
              color: "border-gray-100 hover:border-gray-200 hover:bg-gray-50",
            },
            {
              title: "Update Your Profile",
              sub: "Add logo and company details for proposals",
              to: "/installer/settings",
              cta: "Go to Settings",
              color: "border-gray-100 hover:border-gray-200 hover:bg-gray-50",
            },
          ].map(({ title, sub, to, cta, color }) => (
            <Link
              key={to}
              to={to}
              className={`bg-white rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all duration-150 group ${color}`}
            >
              <div>
                <p className="font-display font-bold text-gray-900 text-sm">
                  {title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <span className="text-xs font-semibold text-teal-600 group-hover:text-teal-700 shrink-0 flex items-center gap-1">
                {cta} <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </InstallerLayout>
  );
}
