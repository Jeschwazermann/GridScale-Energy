import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Inbox,
  Settings,
  Menu,
  X,
} from "lucide-react";
import Sidebar from "../components/installer/Sidebar";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/useAuth";

/* ── Mobile bottom tabs ── */
const TABS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/installer/dashboard" },
  { label: "Customers", icon: Users, path: "/installer/customers" },
  { label: "Assess", icon: ClipboardList, path: "/installer/new-assessment" },
  { label: "Leads", icon: Inbox, path: "/installer/leads" },
  { label: "Settings", icon: Settings, path: "/installer/settings" },
];

export default function InstallerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leadsCount, setLeadsCount] = useState(0);

  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  /* ── Fetch leads count (simple + safe) ── */
  useState(() => {
    if (!user) return;

    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .is("claimed_by", null)
      .then(({ count }) => setLeadsCount(count ?? 0));
  }, [user, location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex md:w-60 md:fixed md:inset-y-0">
        <Sidebar leadsCount={leadsCount} />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-60 bg-white h-full shadow-xl">
            <Sidebar
              leadsCount={leadsCount}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>

          {/* Close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-white"
          >
            <X size={22} />
          </button>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top Bar (mobile only) */}
        <div className="md:hidden sticky top-0 z-30 bg-teal-900 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu size={22} />
          </button>

          <p className="font-bold text-white flex-1">GridScale Africa</p>
        </div>

        {/* Page Content */}
        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8">
          {children}
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex z-40">
          {TABS.map(({ label, icon: Icon, path }) => {
            const active = isActive(path);
            const isLeads = label === "Leads";

            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex-1 flex flex-col items-center py-2.5 relative ${
                  active ? "text-teal-600" : "text-gray-400"
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {isLeads && leadsCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-amber-400 text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {leadsCount > 9 ? "9+" : leadsCount}
                    </span>
                  )}
                </div>

                <span className="text-[10px]">{label}</span>

                {active && (
                  <div className="absolute top-0 w-6 h-0.5 bg-teal-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
