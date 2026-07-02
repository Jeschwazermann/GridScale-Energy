import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
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

export default function App() {
  return (
    <AuthProvider>
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
