import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

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
      .single();

    if (!error && data) setProfile(data);
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
      value={{ user, profile, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
