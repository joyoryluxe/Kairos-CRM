import { Package, Save, Plus, Trash2, Edit2, RotateCcw } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPackage,
  deletePackage,
  getPackages,
  updatePackage,
  type Package as PackageType,
  type PackageCategory,
  type PackageInput,
} from "@/api/packages";

const CATEGORIES: PackageCategory[] = ["Maternity", "Influencer", "Corporate", "General"];

const CATEGORY_COLORS: Record<PackageCategory, string> = {
  Maternity: "#ec4899",
  Influencer: "#8b5cf6",
  Corporate: "#3b82f6",
  General: "#10b981",
};

const EMPTY_FORM: PackageInput = {
  name: "",
  category: "General",
  price: 0,
  description: "",
  isActive: true,
};

// ─── Premium Section Component ──────────────────────────────────────────
function Section({ title, icon, children, description }: { title: string; icon: React.ReactNode; children: React.ReactNode; description?: string }) {
  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.5)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "1.25rem",
      padding: "2rem",
      marginBottom: "2rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--color-primary)" }}>{icon}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#f8fafc" }}>{title}</h3>
          {description && <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>{description}</p>}
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
  // background: "rgba(15, 23, 42, 0.4)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "0.75rem",
  color: "#f8fafc",
  fontSize: "0.95rem",
  outline: "none",
  fontWeight: 600,
  transition: "all 0.2s"
};

export default function PackagesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PackageCategory | "All">("All");
  const [form, setForm] = useState<PackageInput>(EMPTY_FORM);
  const [editing, setEditing] = useState<PackageType | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["packages"],
    queryFn: () => getPackages(),
  });

  const createMutation = useMutation({
    mutationFn: createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PackageInput> }) =>
      updatePackage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setEditing(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing._id, payload: form });
    else createMutation.mutate(form);
  };

  const startEdit = (pkg: PackageType) => {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      category: pkg.category,
      price: pkg.price,
      description: pkg.description ?? "",
      isActive: pkg.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const filteredData = (data ?? []).filter(
    (p) => activeTab === "All" || p.category === activeTab
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
      {/* ── Header ── */}
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ 
            width: "56px", height: "56px", background: "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)",
            borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white",
            boxShadow: "0 10px 20px rgba(124, 58, 237, 0.3)"
          }}>
            <Package size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.04em", margin: 0 }}>
              Service Inventory
            </h1>
            <p style={{ color: "#94a3b8", marginTop: "0.25rem", fontSize: "1.05rem", fontWeight: 500 }}>
              Configure and manage standardized service offerings.
            </p>
          </div>
        </div>
      </header>

      {/* ── Form Section ── */}
      <Section title={editing ? "Modify Service" : "Define New Service"} icon={editing ? <Edit2 size={20} /> : <Plus size={20} />}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={labelStyle}>Package Name</label>
              <input required style={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Cinematic" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as PackageCategory }))}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price (₹)</label>
              <input required type="number" min={0} style={inputCls} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1.5rem" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 700 }}>AVAILABLE</label>
              <div 
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, background: form.isActive ? "#10b981" : "rgba(255,255,255,0.1)",
                  position: "relative", cursor: "pointer", transition: "0.2s"
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: form.isActive ? 23 : 3,
                  width: 18, height: 18, borderRadius: "50%", background: "white", transition: "0.2s"
                }} />
              </div>
            </div>
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <label style={labelStyle}>Service Inclusion Details</label>
            <textarea style={{ ...inputCls, minHeight: "80px" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="List items, durations, or special deliverables..." />
          </div>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            {editing && <button type="button" onClick={resetForm} style={{ background: "transparent", border: "none", color: "#94a3b8", fontWeight: 700, cursor: "pointer" }}>Cancel</button>}
            <button type="submit" disabled={isSubmitting} style={{ 
              background: "var(--color-primary)", color: "white", padding: "0.85rem 2.5rem", 
              borderRadius: "12px", fontWeight: 800, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.4)"
            }}>
              <Save size={18} />
              {isSubmitting ? "Syncing..." : editing ? "Update Strategy" : "Initialize Service"}
            </button>
          </div>
        </form>
      </Section>

      {/* ── List Section ── */}
      <Section title="Active Inventory" icon={<Package size={20} />}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {["All", ...CATEGORIES].map((tab: any) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.5rem 1.25rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)",
                fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", transition: "0.2s",
                background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent",
                color: activeTab === tab ? "white" : "#64748b"
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ["packages"] })} style={{ marginLeft: "auto", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
            <RotateCcw size={18} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Retreiving Inventory...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {filteredData.map(pkg => (
              <div key={pkg._id} style={{ 
                padding: "1.5rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.02)", 
                border: `1px solid ${editing?._id === pkg._id ? "var(--color-primary)" : "rgba(255,255,255,0.05)"}`,
                transition: "0.2s"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                   <span style={{ 
                     padding: "0.3rem 0.75rem", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 900, 
                     background: `${CATEGORY_COLORS[pkg.category]}15`, color: CATEGORY_COLORS[pkg.category]
                   }}>{pkg.category.toUpperCase()}</span>
                   <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => startEdit(pkg)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><Edit2 size={16} /></button>
                      <button onClick={() => { if(confirm("Delete this package?")) deleteMutation.mutate(pkg._id) }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={16} /></button>
                   </div>
                </div>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: 850, color: "#f8fafc" }}>{pkg.name}</h4>
                <div style={{ fontSize: "1.5rem", fontWeight: 950, color: "var(--color-primary)", marginBottom: "1rem" }}>
                  ₹{pkg.price.toLocaleString("en-IN")}
                </div>
                <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.5, margin: 0, minHeight: "3em" }}>{pkg.description || "No inclusion details provided."}</p>
                
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: pkg.isActive ? "#10b981" : "#ef4444" }}>
                    {pkg.isActive ? "● ONLINE" : "○ OFFLINE"}
                  </span>
                  <div 
                    onClick={() => updateMutation.mutate({ id: pkg._id, payload: { isActive: !pkg.isActive } })}
                    style={{
                      width: 36, height: 20, borderRadius: 10, background: pkg.isActive ? "#10b981" : "rgba(255,255,255,0.1)",
                      position: "relative", cursor: "pointer", transition: "0.2s"
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 2, left: pkg.isActive ? 18 : 2,
                      width: 16, height: 16, borderRadius: "50%", background: "white", transition: "0.2s"
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
