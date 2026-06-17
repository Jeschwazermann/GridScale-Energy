import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CalculatorPage from "./pages/CalculatorPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/calculator" element={<CalculatorPage />} />
      <Route path="/calculator/results" element={<ResultsPage />} />
    </Routes>
  );
}

// import { Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./contexts/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";

// import LandingPage from "./pages/LandingPage";
// import CalculatorPage from "./pages/CalculatorPage";
// import ResultsPage from "./pages/ResultsPage";

// import LoginPage from "./pages/installer/LoginPage";
// import SignupPage from "./pages/installer/SignupPage";
// import DashboardHome from "./pages/installer/DashboardHome";
// import CustomerList from "./pages/installer/CustomerList";
// import CustomerDetail from "./pages/installer/CustomerDetail";
// import NewAssessment from "./pages/installer/NewAssessment";
// import LeadsPage from "./pages/installer/LeadsPage";
// import SettingsPage from "./pages/installer/SettingsPage";

// export default function App() {
//   return (
//     <AuthProvider>
//       <Routes>
//         {/* ── Consumer ── */}
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/calculator" element={<CalculatorPage />} />
//         <Route path="/calculator/results" element={<ResultsPage />} />

//         {/* ── Installer auth ── */}
//         <Route path="/installer/login" element={<LoginPage />} />
//         <Route path="/installer/signup" element={<SignupPage />} />

//         {/* ── Installer app (protected) ── */}
//         <Route
//           path="/installer/dashboard"
//           element={
//             <ProtectedRoute>
//               <DashboardHome />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/installer/customers"
//           element={
//             <ProtectedRoute>
//               <CustomerList />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/installer/customers/:id"
//           element={
//             <ProtectedRoute>
//               <CustomerDetail />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/installer/new-assessment"
//           element={
//             <ProtectedRoute>
//               <NewAssessment />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/installer/leads"
//           element={
//             <ProtectedRoute>
//               <LeadsPage />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/installer/settings"
//           element={
//             <ProtectedRoute>
//               <SettingsPage />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </AuthProvider>
//   );
// }
