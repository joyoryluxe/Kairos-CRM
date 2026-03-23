import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MaternityPage from "./pages/MaternityPage";
import MaternityFormPage from "./pages/MaternityFormPage";
import InfluencerPage from "./pages/InfluencerPage";
import InfluencerFormPage from "./pages/InfluencerFormPage";
import CorporatePage from "./pages/CorporatePage";
import CorporateFormPage from "./pages/CorporateFormPage";
import DashboardOverviewPage from "./pages/DashboardOverviewPage";
import PackagesPage from "./pages/PackagesPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverviewPage />} />
        {/* Maternity */}
        <Route path="maternity" element={<MaternityPage />} />
        <Route path="maternity/new" element={<MaternityFormPage />} />
        <Route path="maternity/:id/edit" element={<MaternityFormPage />} />
        {/* Influencer */}
        <Route path="influencer" element={<InfluencerPage />} />
        <Route path="influencer/new" element={<InfluencerFormPage />} />
        <Route path="influencer/:id/edit" element={<InfluencerFormPage />} />
        {/* Corporate */}
        <Route path="corporate" element={<CorporatePage />} />
        <Route path="corporate/new" element={<CorporateFormPage />} />
        <Route path="corporate/:id/edit" element={<CorporateFormPage />} />
        {/* Packages */}
        <Route path="packages" element={<PackagesPage />} />
        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
