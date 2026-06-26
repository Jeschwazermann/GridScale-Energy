import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sun,
  LayoutDashboard,
  Users,
  ClipboardList,
  Inbox,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/installer/dashboard" },
  { label: "Customers", icon: Users, path: "/installer/customers" },
  {
    label: "New Assessment",
    icon: ClipboardList,
    path: "/installer/new-assessment",
  },
  { label: "Leads", icon: Inbox, path: "/installer/leads" },
  { label: "Settings", icon: Settings, path: "/installer/settings" },
];

export default function Sidebar({ leadsCount = 0, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/installer/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex flex-col h-full w-60 bg-teal-900 select-none">
      {/* ── Brand ── */}
      <div className="px-5 py-6 border-b border-teal-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shrink-0">
            <Sun size={16} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">
              GridScale Africa
            </p>
            <p className="text-teal-400 text-xs">Installer Portal</p>
          </div>
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          const isLeads = label === "Leads";

          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? "bg-teal-700 text-white"
                  : "text-teal-300 hover:bg-teal-800 hover:text-white"
              }`}
            >
              <Icon
                size={17}
                strokeWidth={active ? 2.2 : 1.8}
                className={
                  active
                    ? "text-teal-300"
                    : "text-teal-400 group-hover:text-teal-300"
                }
              />
              <span className="flex-1">{label}</span>
              {/* Lead count badge */}
              {isLeads && leadsCount > 0 && (
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {leadsCount > 99 ? "99+" : leadsCount}
                </span>
              )}
              {/* Active indicator */}
              {active && (
                <ChevronRight size={14} className="text-teal-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div className="px-3 py-4 border-t border-teal-800 space-y-1">
        {/* Profile info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold font-display">
              {profile?.contact_name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {profile?.contact_name ?? "Installer"}
            </p>
            <p className="text-teal-400 text-xs truncate">
              {profile?.company_name ?? ""}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-400 hover:bg-teal-800 hover:text-white transition-all duration-150 group"
        >
          <LogOut
            size={16}
            strokeWidth={1.8}
            className="group-hover:text-teal-300"
          />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
