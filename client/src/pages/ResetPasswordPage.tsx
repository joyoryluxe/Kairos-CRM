import { useState, FormEvent } from "react";
import api from "../api/axios";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
      localStorage.setItem("kairos_token", data.token);
      navigate("/dashboard/maternity");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "2rem", backgroundColor: "var(--bg-page)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "3rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Reset Password</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {error && (
            <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", backgroundColor: "hsla(0,78%,62%,0.15)", color: "var(--color-danger)", fontSize: "0.9rem", border: "1px solid rgba(255, 100, 100, 0.2)" }}>
              {error}
            </div>
          )}
          
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>New Password <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "normal" }}>(min 8 chars)</span></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: "46px", justifyContent: "center", marginTop: "0.5rem", fontSize: "1rem" }} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          <Link to="/login" style={{ fontWeight: 500 }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
