import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  /* Show nothing while session is being determined */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  /* Not authenticated — redirect to login, preserve intended destination */
  if (!user) {
    return (
      <Navigate to="/installer/login" state={{ from: location }} replace />
    );
  }

  return children;
}
