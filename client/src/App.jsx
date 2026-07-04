import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

import LandingPage from "./pages/LandingPage";
import CalculatorPage from "./pages/CalculatorPage";
import ResultsPage from "./pages/ResultsPage";

import LoginPage from "./pages/installer/LoginPage";
import SignupPage from "./pages/installer/SignupPage";
import DashboardHome from "./pages/installer/DashboardHome";
import CustomerList from "./pages/installer/CustomerList";
import CustomerDetail from "./pages/installer/CustomerDetail";
import NewAssessment from "./pages/installer/NewAssessment";
import LeadsPage from "./pages/installer/LeadsPage";
import SettingsPage from "./pages/installer/SettingsPage";

/* Handles Supabase auth redirect errors (e.g. expired confirmation link)
   that come back as URL hash params like #error=access_denied&error_code=otp_expired */
function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation(); // eslint-disable-line no-unused-vars

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.replace("#", ""));
    const error = params.get("error");
    const errorCode = params.get("error_code");
    const errorDesc = params.get("error_description");

    if (error) {
      window.history.replaceState(null, "", window.location.pathname);

      if (errorCode === "otp_expired") {
        navigate("/installer/login", {
          state: {
            authError:
              "Your confirmation link has expired. Please sign in or request a new link.",
          },
        });
      } else {
        navigate("/installer/login", {
          state: {
            authError: errorDesc || "Authentication failed. Please try again.",
          },
        });
      }
    }
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthRedirectHandler />
      <Routes>
        {/* ── Consumer ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/calculator/results" element={<ResultsPage />} />
        {/* ── Installer auth ── */}
        <Route path="/installer/login" element={<LoginPage />} />
        <Route path="/installer/signup" element={<SignupPage />} />
        {/* ── Installer app (protected + error boundary) ── */}
        <Route
          path="/installer/dashboard"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardHome />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/installer/customers"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CustomerList />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/installer/customers/:id"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CustomerDetail />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/installer/new-assessment"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <NewAssessment />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/installer/leads"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <LeadsPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/installer/settings"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <SettingsPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
