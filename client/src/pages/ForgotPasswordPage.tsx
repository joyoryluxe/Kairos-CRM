import { useState, FormEvent } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/auth/forgotpassword", { email });
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setMessage("Your request has been processed successfully. Please click the link below to reset your password.");
      } else {
        setMessage(data.message || "Password reset token sent.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "2rem", backgroundColor: "var(--bg-page)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "3rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Forgot Password</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {error && (
            <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", backgroundColor: "hsla(0,78%,62%,0.15)", color: "var(--color-danger)", fontSize: "0.9rem", border: "1px solid rgba(255, 100, 100, 0.2)" }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", backgroundColor: "hsla(140,78%,62%,0.15)", color: "var(--color-success)", fontSize: "0.9rem", border: "1px solid rgba(100, 255, 100, 0.2)" }}>
              <div style={{ marginBottom: resetToken ? "0.5rem" : 0 }}>{message}</div>
              {resetToken && (
                <Link to={`/reset-password/${resetToken}`} style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "underline", wordBreak: "break-all" }}>
                  Click here to reset your password
                </Link>
              )}
            </div>
          )}
          
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" required disabled={loading} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: "46px", justifyContent: "center", marginTop: "0.5rem", fontSize: "1rem" }} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Remember your password? <Link to="/login" style={{ fontWeight: 500 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
