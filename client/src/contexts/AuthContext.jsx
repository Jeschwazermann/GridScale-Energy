import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch installer profile from DB ──
     If no row exists yet (email confirmation was ON during signup so
     the insert was skipped), create it now from auth metadata that
     was stored at signup time. At this point the session is active
     so auth.uid() matches and RLS allows the write.              */
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("installers")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) return;

    if (data) {
      setProfile(data);
      return;
    }

    /* No profile row yet — create from auth metadata */
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const meta = user?.user_metadata ?? {};

    if (meta.company_name || meta.contact_name) {
      const { data: newProfile, error: insertError } = await supabase
        .from("installers")
        .upsert(
          {
            id: userId,
            email: user.email,
            company_name: meta.company_name ?? null,
            contact_name: meta.contact_name ?? null,
          },
          { onConflict: "id" },
        )
        .select()
        .single();

      if (!insertError && newProfile) setProfile(newProfile);
    }
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
    /* Store company/contact in auth metadata so fetchProfile can
       create the installers row on first login if email confirmation
       is ON (session is null at signup time, RLS would block insert) */
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          contact_name: contactName,
        },
      },
    });
    if (error) throw error;

    /* Only insert profile immediately if session is active —
       meaning email confirmation is OFF. If confirmation is ON,
       data.session is null and fetchProfile handles it on first login. */
    if (data.user && data.session) {
      const { error: profileError } = await supabase.from("installers").upsert(
        {
          id: data.user.id,
          email,
          company_name: companyName,
          contact_name: contactName,
        },
        { onConflict: "id" },
      );
      if (profileError) throw profileError;

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
