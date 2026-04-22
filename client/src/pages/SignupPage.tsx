import { useState, FormEvent } from "react";
import logoImage from "../Kairos Logo.png";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function SignupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "sales_rep" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.name.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const { data } = await api.post("/auth/register", submitData);
      localStorage.setItem("kairos_token", data.token);
      queryClient.clear();
      navigate("/dashboard/maternity");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "1.5rem", backgroundColor: "var(--bg-page)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: "clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 4vw, 2rem)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img src={logoImage} alt="Kairos CRM Logo" style={{ maxHeight: "60px", width: "auto", marginBottom: "1rem" }} />
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Create an Account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Join KAIROS CRM workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {error && (
            <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", backgroundColor: "hsla(0,78%,62%,0.15)", color: "var(--color-danger)", fontSize: "0.9rem", border: "1px solid rgba(255, 100, 100, 0.2)" }}>
              {error}
            </div>
          )}
          
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" required />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>Email Address</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="you@company.com" required />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>Password <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "normal" }}>(min 8 chars)</span></label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>Confirm Password</label>
            <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: "46px", justifyContent: "center", marginTop: "0.5rem", fontSize: "1rem" }} disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 500 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
