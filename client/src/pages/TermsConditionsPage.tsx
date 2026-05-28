import { Scroll, Plus, Trash2, Edit2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteTermsCondition,
  getTermsConditions,
  type TermsCondition,
} from "@/api/termsConditions";

const CATEGORY_COLORS: Record<string, string> = {
  Maternity: "#ec4899",
  Influencer: "#8b5cf6",
  Corporate: "#3b82f6",
  General: "#10b981",
  Edits: "#f59e0b",
};

const isMobile = () => window.innerWidth <= 768;

// ─── Premium Section Component ──────────────────────────────────────────
function Section({ title, icon, children, description, extraAction }: { title: string; icon: React.ReactNode; children: React.ReactNode; description?: string; extraAction?: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.5)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "1.25rem",
      padding: isMobile() ? "1.25rem" : "2rem",
      marginBottom: "2rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile() ? "0.75rem" : "1rem" }}>
          <div style={{ color: "var(--color-primary)", flexShrink: 0 }}>{icon}</div>
          <div>
            <h3 style={{ margin: 0, fontSize: isMobile() ? "0.95rem" : "1.1rem", fontWeight: 800, color: "#f8fafc" }}>{title}</h3>
            {description && <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>{description}</p>}
          </div>
        </div>
        {extraAction && <div>{extraAction}</div>}
      </div>
      {children}
    </div>
  );
}

export default function TermsConditionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mobile = isMobile();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["terms-conditions"],
    queryFn: () => getTermsConditions(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTermsCondition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms-conditions"] });
    },
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: mobile ? "0.75rem" : "1rem" }}>
      {/* ── Header ── */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: mobile ? "flex-start" : "center",
        marginBottom: mobile ? "1.5rem" : "2.5rem",
        flexWrap: "wrap",
        gap: mobile ? "1rem" : "1.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: mobile ? "0.9rem" : "1.25rem" }}>
          <div style={{
            width: mobile ? "44px" : "56px",
            height: mobile ? "44px" : "56px",
            background: "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)",
            borderRadius: mobile ? "12px" : "16px",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white",
            boxShadow: "0 10px 20px rgba(124, 58, 237, 0.3)",
            flexShrink: 0,
          }}>
            <Scroll size={mobile ? 20 : 28} />
          </div>
          <div>
            <h1 style={{ fontSize: mobile ? "1.4rem" : "2.25rem", fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.04em", margin: 0, lineHeight: 1.2 }}>
              Terms & Conditions
            </h1>
            <p style={{ color: "#94a3b8", marginTop: "0.25rem", fontSize: mobile ? "0.8rem" : "1.05rem", fontWeight: 500, margin: "0.2rem 0 0" }}>
              {mobile ? "Manage client clauses & terms." : "Manage clauses, agreements, and terms for client invoices and bookings."}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/terms-conditions/new")}
          style={{
            background: "var(--color-primary)", color: "white",
            padding: mobile ? "0.65rem 1.25rem" : "0.85rem 2rem",
            borderRadius: "12px", fontWeight: 800, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.5rem",
            boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.4)",
            transition: "all 0.2s",
            fontSize: mobile ? "0.82rem" : "0.95rem",
            width: mobile ? "100%" : "auto",
            justifyContent: "center",
          }}
        >
          <Plus size={mobile ? 15 : 18} />
          Add Terms
        </button>
      </header>

      {/* ── Saved Inventory Section ── */}
      <Section
        title="Saved Terms Inventory"
        icon={<Scroll size={mobile ? 17 : 20} />}
        description="A list of terms defined for each client category."
        extraAction={
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["terms-conditions"] })}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
            title="Refresh list"
          >
            <RotateCcw size={18} className={isFetching ? "animate-spin" : ""} />
          </button>
        }
      >
        {isLoading ? (
          <div style={{ padding: mobile ? "2rem" : "4rem", textAlign: "center", color: "#64748b", fontWeight: 700 }}>
            Retrieving Saved Terms...
          </div>
        ) : !data || data.length === 0 ? (
          <div style={{
            padding: mobile ? "2rem 1rem" : "4rem", textAlign: "center", color: "#64748b",
            border: "1px dashed rgba(255,255,255,0.05)",
            borderRadius: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem"
          }}>
            <span style={{ fontWeight: 700, fontSize: mobile ? "0.88rem" : "1rem" }}>No terms configured yet. Let's create your first list of terms!</span>
            <button
              onClick={() => navigate("/dashboard/terms-conditions/new")}
              style={{
                background: "var(--color-primary)", color: "white", padding: "0.75rem 1.5rem",
                borderRadius: "8px", fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.5rem"
              }}
            >
              <Plus size={16} />
              Configure Terms
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))",
            gap: mobile ? "1rem" : "1.5rem",
          }}>
            {data.map((item: TermsCondition) => {
              const themeColor = CATEGORY_COLORS[item.category] || "var(--color-accent)";
              return (
                <div
                  key={item._id}
                  style={{
                    padding: mobile ? "1.2rem" : "1.75rem",
                    borderRadius: "1.25rem",
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid rgba(255,255,255,0.05)`,
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    minHeight: mobile ? "auto" : "220px",
                    transition: "all 0.2s",
                  }}
                  className="card"
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <span style={{
                        padding: "0.3rem 0.75rem", borderRadius: "8px",
                        fontSize: "0.7rem", fontWeight: 900,
                        background: `${themeColor}15`, color: themeColor,
                      }}>
                        {item.category.toUpperCase()}
                      </span>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() => navigate(`/dashboard/terms-conditions/${item._id}/edit`)}
                          style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem" }}
                          title="Edit terms"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete all terms for ${item.category}?`)) deleteMutation.mutate(item._id) }}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem" }}
                          title="Delete terms"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: mobile ? "0.5rem" : "0.75rem" }}>
                      {item.terms.slice(0, mobile ? 3 : 4).map((term, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.5rem", fontSize: mobile ? "0.82rem" : "0.9rem", color: "#94a3b8", lineHeight: "1.4" }}>
                          <span style={{ fontWeight: 700, color: "var(--color-primary)", flexShrink: 0 }}>{i + 1}.</span>
                          <span style={{
                            overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                          }}>
                            {term}
                          </span>
                        </div>
                      ))}
                      {item.terms.length > (mobile ? 3 : 4) && (
                        <div style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 700, paddingLeft: "1rem", marginTop: "0.25rem" }}>
                          + {item.terms.length - (mobile ? 3 : 4)} more clauses...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
