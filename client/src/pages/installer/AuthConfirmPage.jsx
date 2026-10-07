import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

/* Landing page for the confirmation link in the signup email:
   https://gridscaleafrica.com/auth/confirm?token_hash=...&type=email

   Keeping the link on our own domain (instead of *.supabase.co) makes the
   email look consistent to spam filters, and because the token is only
   consumed when this page runs JavaScript, email link scanners (Outlook
   Safe Links etc.) can't "use up" the link before the person clicks it. */
export default function AuthConfirmPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [verifyError, setVerifyError] = useState(null);

  const token_hash = params.get("token_hash");
  const type = params.get("type") || "email";

  // Derived during render, so no setState is needed inside the effect.
  const error = !token_hash
    ? "This confirmation link is missing its token."
    : verifyError;

  // React StrictMode runs effects twice in dev. The token is single-use,
  // so a second verifyOtp call would fail. Guard against it.
  const started = useRef(false);

  useEffect(() => {
    if (!token_hash || started.current) return;
    started.current = true;

    supabase.auth.verifyOtp({ type, token_hash }).then(({ error }) => {
      if (error) {
        setVerifyError(
          error.message?.toLowerCase().includes("expired")
            ? "This confirmation link has expired."
            : "This confirmation link is invalid or has already been used.",
        );
        return;
      }
      // Session is now active; AuthContext will create the installer
      // profile from the signup metadata on the SIGNED_IN event.
      navigate("/installer/dashboard", { replace: true });
    });
  }, [token_hash, type, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {error ? (
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-gray-900">{error}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue. If your account isn't confirmed yet, sign up
            again to get a new link.
          </p>
          <Link
            to="/installer/login"
            className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700"
          >
            Go to sign in
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Confirming your email…
          </p>
        </div>
      )}
    </div>
  );
}
