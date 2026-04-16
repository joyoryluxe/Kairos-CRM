import { FormEvent, useState, useEffect } from "react";
import { UserCircle, Save, KeyRound } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateProfile } from "@/api/auth";
import api from "@/api/axios";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["auth-me"], queryFn: () => getMe() });
  const user = data?.user;

  const [form, setForm] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    if (user && !isEditing) setForm({ name: user.name, email: user.email });
  }, [user, isEditing]);

  const handleEditClick = () => {
    if (window.confirm("Are you sure you want to edit your profile details? Modifying your email address will change how you log in.")) {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (user) setForm({ name: user.name, email: user.email });
    setIsEditing(false);
  };

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      setIsEditing(false);
    },
  });

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    setResetMessage("");
    setResetError("");
    setResetToken("");
    try {
      const { data } = await api.post("/auth/forgotpassword", { email: user.email });
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setResetMessage("Reset link generated successfully.");
      } else {
        setResetMessage(data.message || "Password reset instructions sent to your email.");
      }
    } catch (err: any) {
      setResetError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: any = { name: form.name, email: form.email };
    updateMutation.mutate(payload);
  };

  if (isLoading) return <div style={{ padding: "2rem", color: "var(--text-muted)", textAlign: "center" }}>Loading Profile...</div>;

  return (
    <div className="animate-fade-up" style={{ maxWidth: 600, margin: "0 auto", padding: "0 1rem 3rem" }}>
      <header style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
          <UserCircle size={26} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Admin Profile</h1>
          <p style={{ margin: "0.2rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Manage your account settings</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleEditClick}
            type="button" 
            className="btn" 
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            Edit Profile
          </button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="card" style={{ padding: "1.5rem", backgroundColor: "var(--bg-surface-2)" }}>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Name {isEditing && <span style={{ color: "var(--color-danger)" }}>*</span>}</label>
            <input
              required
              readOnly={!isEditing}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{ width: "100%", backgroundColor: !isEditing ? "var(--bg-surface-3)" : "#ffffff44", color: !isEditing ? "var(--text-muted)" : "inherit", border: !isEditing ? "1px solid var(--border)" : "1px solid var(--border-hover)", cursor: !isEditing ? "not-allowed" : "text" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Email Address {isEditing && <span style={{ color: "var(--color-danger)" }}>*</span>}</label>
            <input
              required
              type="email"
              readOnly={!isEditing}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              style={{ width: "100%", backgroundColor: !isEditing ? "var(--bg-surface-3)" : "#ffffff44", color: !isEditing ? "var(--text-muted)" : "inherit", border: !isEditing ? "1px solid var(--border)" : "1px solid var(--border-hover)", cursor: !isEditing ? "not-allowed" : "text" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--text-secondary)" }}>
              Role <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(Read-only)</span>
            </label>
            <input
              readOnly
              value="Admin"
              style={{ width: "100%", backgroundColor: "var(--bg-surface-3)", color: "var(--text-muted)", cursor: "not-allowed", border: "1px solid var(--border)" }}
            />
          </div>

          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <KeyRound size={16} /> Update Password
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              To securely update your password, we'll send a reset link to your email address: <strong>{user?.email}</strong>
            </p>
            
            {resetError && (
              <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", backgroundColor: "hsla(0,78%,62%,0.15)", color: "var(--color-danger)", fontSize: "0.9rem", border: "1px solid rgba(255, 100, 100, 0.2)", marginBottom: "1rem" }}>
                {resetError}
              </div>
            )}
            {resetMessage && (
              <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", backgroundColor: "hsla(140,78%,62%,0.15)", color: "var(--color-success)", fontSize: "0.9rem", border: "1px solid rgba(100, 255, 100, 0.2)", marginBottom: "1rem" }}>
                <div style={{ marginBottom: resetToken ? "0.5rem" : 0 }}>{resetMessage}</div>
                {resetToken && (
                  <a href={`/reset-password/${resetToken}`} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "underline", wordBreak: "break-all" }}>
                    Click here to reset your password
                  </a>
                )}
              </div>
            )}

            <button 
              type="button" 
              className="btn" 
              onClick={handlePasswordReset} 
              disabled={resetLoading || !user?.email}
            >
              {resetLoading ? "Sending..." : "Send Password Reset Link"}
            </button>
          </div>
        </div>

        {updateMutation.isError && (
          <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--color-danger)", borderRadius: "var(--radius-md)", fontSize: "0.9rem" }}>
            {(updateMutation.error as any)?.response?.data?.message || updateMutation.error.message || "Failed to update profile"}
          </div>
        )}
        
        {updateMutation.isSuccess && (
          <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "var(--color-success)", borderRadius: "var(--radius-md)", fontSize: "0.9rem" }}>
            Profile updated successfully!
          </div>
        )}

        {isEditing && (
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", paddingTop: "1rem", borderTop: "1px solid var(--border)", gap: "0.75rem" }}>
            <button type="button" className="btn" onClick={handleCancelEdit} disabled={updateMutation.isPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending} style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 140, justifyContent: "center" }}>
              <Save size={16} /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
