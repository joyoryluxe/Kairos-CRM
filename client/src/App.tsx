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
import LeadsPage from "./pages/LeadsPage";
import LeadFormPage from "./pages/LeadFormPage";
import EditsPage from "./pages/EditsPage";
import EditFormPage from "./pages/EditFormPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/signup" element={<SignupPage />} /> */}
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
        {/* Leads */}
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/new" element={<LeadFormPage />} />
        <Route path="leads/:id/edit" element={<LeadFormPage />} />
        {/* Edits */}
        <Route path="edits" element={<EditsPage />} />
        <Route path="edits/new" element={<EditFormPage />} />
        <Route path="edits/:id/edit" element={<EditFormPage />} />
        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
