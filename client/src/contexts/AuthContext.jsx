import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch installer profile from DB ── */
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("installers")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) setProfile(data);
  };

  /* ── Refresh profile manually (e.g. after settings save) ── */
  const refreshProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) await fetchProfile(session.user.id);
  };

  /* ── Listen to auth state changes ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ── Sign up ── */
  const signUp = async ({ email, password, companyName, contactName }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    /* Create installer profile row */
    if (data.user) {
      const { error: profileError } = await supabase.from("installers").insert({
        id: data.user.id,
        email,
        company_name: companyName,
        contact_name: contactName,
      });
      if (profileError) throw profileError;

      /* Fetch profile immediately after insert — don't rely on
         onAuthStateChange which may fire before the row exists */
      await fetchProfile(data.user.id);
    }

    return data;
  };

  /* ── Sign in ── */
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  /* ── Sign out ── */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
