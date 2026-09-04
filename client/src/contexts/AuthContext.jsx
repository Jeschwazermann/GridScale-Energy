// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";
// import { AuthContext } from "./AuthContext.js";

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* ── Fetch installer profile from DB ──
//      If no row exists yet (email confirmation was ON during signup so
//      the insert was skipped), create it now from auth metadata that
//      was stored at signup time. At this point the session is active
//      so auth.uid() matches and RLS allows the write.              */
//   const fetchProfile = async (userId) => {
//     const { data, error } = await supabase
//       .from("installers")
//       .select("*")
//       .eq("id", userId)
//       .maybeSingle();

//     if (error) return;

//     if (data) {
//       setProfile(data);
//       return;
//     }

//     /* No profile row yet — create from auth metadata */
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     const meta = user?.user_metadata ?? {};

//     if (meta.company_name || meta.contact_name) {
//       const { data: newProfile, error: insertError } = await supabase
//         .from("installers")
//         .upsert(
//           {
//             id: userId,
//             email: user.email,
//             company_name: meta.company_name ?? null,
//             contact_name: meta.contact_name ?? null,
//           },
//           { onConflict: "id" },
//         )
//         .select()
//         .single();

//       if (!insertError && newProfile) setProfile(newProfile);
//     }
//   };

//   /* ── Refresh profile manually (e.g. after settings save) ── */
//   const refreshProfile = async () => {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();
//     if (session?.user) await fetchProfile(session.user.id);
//   };

//   /* ── Listen to auth state changes ──
//      Only fetch the profile on events where the user identity actually
//      changes — SIGNED_IN and INITIAL_SESSION. TOKEN_REFRESHED fires
//      every time Supabase silently rotates the JWT (on tab focus, on
//      expiry) but the installer's profile data hasn't changed, so
//      hitting /installers again is wasteful and causes cascading
//      re-renders in any component that depends on `user`. */
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//       if (session?.user) fetchProfile(session.user.id);
//       setLoading(false);
//     });

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (event, session) => {
//       // Only act on real auth events, not TOKEN_REFRESHED or reconnects
//       if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
//         setUser(session?.user ?? null);
//         if (session?.user) await fetchProfile(session.user.id);
//       } else if (event === "SIGNED_OUT") {
//         setUser(null);
//         setProfile(null);
//       }
//       // TOKEN_REFRESHED, USER_UPDATED etc. — do nothing, avoids spurious re-fetches
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   /* ── Sign up ── */
//   const signUp = async ({ email, password, companyName, contactName }) => {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           company_name: companyName,
//           contact_name: contactName,
//         },
//       },
//     });
//     if (error) throw error;

//     if (data.user && data.session) {
//       const { error: profileError } = await supabase.from("installers").upsert(
//         {
//           id: data.user.id,
//           email,
//           company_name: companyName,
//           contact_name: contactName,
//         },
//         { onConflict: "id" },
//       );
//       if (profileError) throw profileError;

//       await fetchProfile(data.user.id);
//     }

//     return data;
//   };

//   /* ── Sign in ── */
//   const signIn = async ({ email, password }) => {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     if (error) throw error;
//     return data;
//   };

//   /* ── Sign out ── */
//   const signOut = async () => {
//     const { error } = await supabase.auth.signOut();
//     if (error) throw error;
//     setProfile(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         profile,
//         loading,
//         signUp,
//         signIn,
//         signOut,
//         refreshProfile,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keeps track of the authenticated user's ID without causing renders.
  const userIdRef = useRef(null);

  /* ── Fetch installer profile from DB ── */
  const fetchProfile = async (userId) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("installers")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching installer profile:", error);
      return;
    }

    if (data) {
      setProfile(data);
      return;
    }

    /* No profile row yet — create from auth metadata */
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const meta = authUser?.user_metadata ?? {};

    if (meta.company_name || meta.contact_name) {
      const { data: newProfile, error: insertError } = await supabase
        .from("installers")
        .upsert(
          {
            id: userId,
            email: authUser?.email ?? null,
            company_name: meta.company_name ?? null,
            contact_name: meta.contact_name ?? null,
          },
          { onConflict: "id" },
        )
        .select()
        .single();

      if (insertError) {
        console.error("Error creating installer profile:", insertError);
        return;
      }

      if (newProfile) {
        setProfile(newProfile);
      }
    }
  };

  /* ── Refresh profile manually ── */
  const refreshProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  /* ── Auth initialization + listener ── */
  useEffect(() => {
    let mounted = true;

    /*
     * Handles a newly authenticated user.
     *
     * Important:
     * Supabase can emit SIGNED_IN again when an existing session
     * is re-established/refocused. We only update React state when
     * the actual user ID changes.
     */
    const handleSession = (session, shouldFetchProfile = false) => {
      if (!mounted) return;

      const newUser = session?.user ?? null;
      const newUserId = newUser?.id ?? null;

      // Same user — don't replace the user object.
      // This prevents components depending on `user` from
      // unnecessarily re-running their effects.
      if (userIdRef.current === newUserId) {
        return;
      }

      userIdRef.current = newUserId;

      setUser(newUser);

      if (newUserId && shouldFetchProfile) {
        fetchProfile(newUserId);
      }

      if (!newUserId) {
        setProfile(null);
      }
    };

    /*
     * Subscribe first so we don't miss INITIAL_SESSION.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AUTH EVENT:", event);

      if (event === "INITIAL_SESSION") {
        handleSession(session, true);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN") {
        /*
         * SIGNED_IN can happen when the existing session is
         * re-established, including when returning to a tab.
         *
         * handleSession() ignores it if it's the same user.
         */
        handleSession(session, true);
        return;
      }

      if (event === "SIGNED_OUT") {
        userIdRef.current = null;

        setUser(null);
        setProfile(null);
        setLoading(false);

        return;
      }

      /*
       * TOKEN_REFRESHED:
       *
       * Do nothing.
       *
       * The user's identity has not changed, so there's no reason
       * to refetch the installer profile or update React's user state.
       */
      if (event === "TOKEN_REFRESHED") {
        return;
      }

      /*
       * USER_UPDATED:
       *
       * The authenticated user itself changed. We update the user
       * object, but don't need to treat this as a new login.
       */
      if (event === "USER_UPDATED" && session?.user) {
        setUser(session.user);
        return;
      }
    });

    /*
     * Fallback initial session check.
     *
     * This is useful if INITIAL_SESSION was already emitted before
     * the listener was ready.
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      const sessionUserId = session?.user?.id ?? null;

      /*
       * Only initialize here if the auth listener hasn't already
       * initialized the same user.
       */
      if (userIdRef.current === null) {
        userIdRef.current = sessionUserId;

        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ── Sign up ── */
  const signUp = async ({ email, password, companyName, contactName }) => {
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

    userIdRef.current = null;

    setUser(null);
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
