import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export function useInstallerStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [newLeads, setNewLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [
        customersRes,
        assessmentsRes,
        quotationsRes,
        leadsCountRes,
        recentCustomersRes,
        newLeadsRes,
      ] = await Promise.all([
        supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("installer_id", user.id),

        supabase
          .from("assessments")
          .select("result")
          .eq("installer_id", user.id),

        supabase
          .from("quotations")
          .select("id", { count: "exact", head: true })
          .eq("installer_id", user.id)
          .in("status", ["sent", "accepted"]),

        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .is("claimed_by", null),

        supabase
          .from("customers")
          .select("*, assessments(result, created_at)")
          .eq("installer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("leads")
          .select("*")
          .is("claimed_by", null)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const totalSavings = (assessmentsRes.data ?? []).reduce((sum, a) => {
        const savings = a.result?.comparison?.savingsPerYear ?? 0;
        return sum + (savings > 0 ? savings : 0);
      }, 0);

      setStats({
        totalCustomers: customersRes.count ?? 0,
        totalSavings,
        quotationsSent: quotationsRes.count ?? 0,
        newLeadsCount: leadsCountRes.count ?? 0,
      });

      setRecentCustomers(recentCustomersRes.data ?? []);
      setNewLeads(newLeadsRes.data ?? []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!isMounted) return;
      await fetchAll();
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [fetchAll]);

  return {
    stats,
    recentCustomers,
    newLeads,
    loading,
    error,
    refetch: fetchAll,
  };
}
