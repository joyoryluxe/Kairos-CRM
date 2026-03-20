import { useState, FormEvent } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password.trim().length === 0) {
      setError("Password is required.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("kairos_token", data.token);
      navigate("/dashboard/maternity");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "2rem", backgroundColor: "var(--bg-page)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "3rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Sign In</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Welcome back to KAIROS CRM
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {error && (
            <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", backgroundColor: "hsla(0,78%,62%,0.15)", color: "var(--color-danger)", fontSize: "0.9rem", border: "1px solid rgba(255, 100, 100, 0.2)" }}>
              {error}
            </div>
          )}
          
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" required />
          </div>
          
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>Forgot password?</Link>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: "46px", justifyContent: "center", marginTop: "0.5rem", fontSize: "1rem" }} disabled={loading}>
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Don't have an account? <Link to="/signup" style={{ fontWeight: 500 }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
