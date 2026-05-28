import { Scroll, Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getTermsConditionById,
  saveTermsCondition,
} from "@/api/termsConditions";

const STANDARD_CATEGORIES = ["Maternity", "Influencer", "Corporate", "General", "Edits"];

const isMobile = () => window.innerWidth <= 768;

// ─── Premium Section Component ──────────────────────────────────────────
function Section({ title, icon, children, description }: { title: string; icon: React.ReactNode; children: React.ReactNode; description?: string }) {
  const mobile = isMobile();
  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.5)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "1.25rem",
      padding: mobile ? "1.25rem" : "2rem",
      marginBottom: "2rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: mobile ? "0.75rem" : "1rem", marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--color-primary)", flexShrink: 0 }}>{icon}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: mobile ? "0.95rem" : "1.1rem", fontWeight: 800, color: "#f8fafc" }}>{title}</h3>
          {description && <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#94a3b8",
  marginBottom: "0.5rem",
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const inputCls = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "0.75rem",
  color: "#f8fafc",
  fontSize: "0.95rem",
  outline: "none",
  fontWeight: 600,
  transition: "all 0.2s",
  boxSizing: "border-box" as const,
};

export default function TermsConditionFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mobile = isMobile();

  const [selectedCategory, setSelectedCategory] = useState<string>("General");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [termsList, setTermsList] = useState<string[]>([""]);

  // Fetch record if editing
  const { data: existingData, isLoading } = useQuery({
    queryKey: ["terms-conditions", id],
    queryFn: () => getTermsConditionById(id!),
    enabled: !!id,
  });

  // Populate form with existing data when fetched
  useEffect(() => {
    if (existingData) {
      const cat = existingData.category;
      const isCustom = !STANDARD_CATEGORIES.includes(cat);
      setIsCustomCategory(isCustom);
      if (isCustom) {
        setCustomCategoryName(cat);
        setSelectedCategory("Custom");
      } else {
        setSelectedCategory(cat);
        setCustomCategoryName("");
      }
      setTermsList(existingData.terms && existingData.terms.length > 0 ? existingData.terms : [""]);
    }
  }, [existingData]);

  const saveMutation = useMutation({
    mutationFn: saveTermsCondition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms-conditions"] });
      navigate("/dashboard/terms-conditions");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const finalCategory = isCustomCategory ? customCategoryName.trim() : selectedCategory;
    if (!finalCategory) {
      alert("Please specify a category.");
      return;
    }

    const cleanTerms = termsList.map(t => t.trim()).filter(Boolean);

    saveMutation.mutate({
      category: finalCategory,
      terms: cleanTerms,
    });
  };

  const addRow = () => {
    setTermsList(prev => [...prev, ""]);
  };

  const removeRow = (index: number) => {
    setTermsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleTermChange = (index: number, value: string) => {
    setTermsList(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleCategorySelectChange = (val: string) => {
    if (val === "Custom") {
      setIsCustomCategory(true);
      setCustomCategoryName("");
    } else {
      setIsCustomCategory(false);
      setSelectedCategory(val);
    }
  };

  const isSaving = saveMutation.isPending;

  if (id && isLoading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem", textAlign: "center", color: "#64748b", fontWeight: 700 }}>
        Loading Clause Configuration...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: mobile ? "0.75rem" : "1rem" }}>
      {/* ── Header ── */}
      <header style={{ marginBottom: mobile ? "1.5rem" : "2.5rem" }}>
        <button
          onClick={() => navigate("/dashboard/terms-conditions")}
          style={{
            background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.5rem",
            fontWeight: 700, padding: 0, marginBottom: "1rem",
            fontSize: mobile ? "0.82rem" : "0.9rem",
          }}
        >
          <ArrowLeft size={16} />
          Back to List
        </button>

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
            <h1 style={{
              fontSize: mobile ? "1.35rem" : "2.25rem",
              fontWeight: 900, color: "#f8fafc",
              letterSpacing: "-0.03em", margin: 0, lineHeight: 1.2,
            }}>
              {id ? "Edit Terms & Conditions" : "New Terms & Conditions"}
            </h1>
            <p style={{ color: "#94a3b8", marginTop: "0.25rem", fontSize: mobile ? "0.78rem" : "1.05rem", fontWeight: 500, margin: "0.2rem 0 0" }}>
              {id ? "Update clauses for the selected category." : "Define category-wise clauses."}
            </p>
          </div>
        </div>
      </header>

      {/* ── Form Card ── */}
      <Section title="Configure Terms" icon={<Scroll size={mobile ? 17 : 20} />}>
        <form onSubmit={handleSubmit}>
          {/* Category Dropdown */}
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
            gap: mobile ? "0.75rem" : "1.5rem",
            marginBottom: "1.5rem",
          }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                style={{ ...inputCls}}
                value={isCustomCategory ? "Custom" : selectedCategory}
                onChange={e => handleCategorySelectChange(e.target.value)}
                disabled={!!id}
              >
                {STANDARD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="Custom">Custom Category...</option>
              </select>
            </div>

            {isCustomCategory && (
              <div className="animate-fade-up">
                <label style={labelStyle}>Custom Category Name</label>
                <input
                  required
                  style={{ ...inputCls, background: "rgba(15, 23, 42, 0.2)" }}
                  value={customCategoryName}
                  onChange={e => setCustomCategoryName(e.target.value)}
                  placeholder="e.g. Booking Deposit"
                  disabled={!!id}
                />
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
            <label style={{ ...labelStyle, fontSize: mobile ? "0.82rem" : "0.9rem", color: "#f8fafc", marginBottom: "1rem" }}>
              Terms & Conditions Clauses
            </label>

            {termsList.length === 0 ? (
              <div style={{
                padding: mobile ? "1.5rem" : "2rem", textAlign: "center", color: "#64748b",
                border: "1px dashed rgba(255,255,255,0.05)",
                borderRadius: "0.75rem", marginBottom: "1.5rem",
                fontSize: mobile ? "0.85rem" : "0.95rem",
              }}>
                No clauses added. Click "+ Add Term Row" below to define a new clause.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: mobile ? "0.6rem" : "0.75rem", marginBottom: "1.5rem" }}>
                {termsList.map((term, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: mobile ? "0.5rem" : "1rem" }}>
                    <div style={{
                      minWidth: mobile ? "22px" : "28px",
                      fontWeight: 700, color: "var(--color-primary)",
                      fontSize: mobile ? "0.9rem" : "1.05rem",
                      textAlign: "right", flexShrink: 0,
                    }}>
                      {index + 1}.
                    </div>
                    <input
                      required
                      style={{ ...inputCls, background: "rgba(15, 23, 42, 0.2)", fontSize: mobile ? "0.88rem" : "0.95rem", padding: mobile ? "0.6rem 0.8rem" : "0.75rem 1rem" }}
                      value={term}
                      onChange={e => handleTermChange(index, e.target.value)}
                      placeholder="Enter term clause details..."
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      style={{
                        background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                        padding: "0.4rem", display: "flex", alignItems: "center", flexShrink: 0,
                      }}
                      title="Remove row"
                    >
                      <Trash2 size={mobile ? 16 : 18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div style={{
            display: "flex",
            flexDirection: mobile ? "column" : "row",
            justifyContent: mobile ? "flex-start" : "space-between",
            alignItems: mobile ? "stretch" : "center",
            gap: mobile ? "0.75rem" : "1rem",
            marginTop: "1rem",
          }}>
            <button
              type="button"
              onClick={addRow}
              style={{
                padding: mobile ? "0.65rem 1rem" : "0.6rem 1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px dashed rgba(255,255,255,0.15)",
                background: "transparent",
                color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                fontSize: mobile ? "0.85rem" : "0.9rem",
                order: mobile ? 2 : 1,
              }}
            >
              <Plus size={mobile ? 15 : 18} />
              Add Term Row
            </button>

            <div style={{
              display: "flex",
              gap: mobile ? "0.5rem" : "1rem",
              flexDirection: mobile ? "column" : "row",
              order: mobile ? 1 : 2,
            }}>
              <button
                type="button"
                onClick={() => navigate("/dashboard/terms-conditions")}
                style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8", fontWeight: 700, cursor: "pointer",
                  padding: mobile ? "0.65rem 1rem" : "0.85rem 1.5rem",
                  borderRadius: "10px",
                  fontSize: mobile ? "0.85rem" : "0.9rem",
                  textAlign: "center",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                style={{
                  background: "var(--color-primary)", color: "white",
                  padding: mobile ? "0.75rem 1.25rem" : "0.85rem 2.5rem",
                  borderRadius: "12px", fontWeight: 800, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
                  boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.4)",
                  fontSize: mobile ? "0.88rem" : "0.95rem",
                }}
              >
                <Save size={mobile ? 15 : 18} />
                {isSaving ? "Saving..." : "Save Terms"}
              </button>
            </div>
          </div>
        </form>
      </Section>
    </div>
  );
}
