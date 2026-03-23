import { Package } from "lucide-react";
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
  Maternity: "hsl(330, 70%, 55%)",
  Influencer: "hsl(260, 70%, 60%)",
  Corporate: "hsl(210, 70%, 55%)",
  General: "hsl(160, 60%, 45%)",
};

const EMPTY_FORM: PackageInput = {
  name: "",
  category: "General",
  price: 0,
  description: "",
  isActive: true,
};

export default function PackagesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PackageCategory | "All">("All");
  const [form, setForm] = useState<PackageInput>(EMPTY_FORM);
  const [editing, setEditing] = useState<PackageType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
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
      setDeleteConfirm(null);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing._id, payload: form });
    } else {
      createMutation.mutate(form);
    }
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
    <div className="animate-fade-up">
      {/* ─── Header ───────────────────────────────────────────── */}
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
            <Package size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Packages</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0.25rem 0 0 0" }}>
              Create and manage service packages for all modules.
            </p>
          </div>
        </div>
      </header>

      {/* ─── Add/Edit Form ────────────────────────────────────────────── */}
      <div className="card" style={{ padding: "1.5rem", backgroundColor: "var(--bg-surface-2)", marginBottom: "1.5rem" }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>{editing ? "✏️ Edit Package" : "➕ New Package"}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            {/* Package Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                Package Name <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Gold, Premium, Basic"
                style={{ width: "100%" }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                Category <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as PackageCategory }))}
                style={{ width: "100%" }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                Price (₹) <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                placeholder="e.g. 5000"
                style={{ width: "100%" }}
              />
            </div>

            {/* Active Toggle */}
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.15rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500 }}>
                <div
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  style={{
                    width: 42, height: 24, borderRadius: 12,
                    background: form.isActive ? "var(--color-primary)" : "var(--border)",
                    position: "relative", cursor: "pointer", transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3, left: form.isActive ? 21 : 3,
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }} />
                </div>
                <span>{form.isActive ? "Active" : "Inactive"}</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.25rem" }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this package includes…"
              rows={2}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            {editing && (
              <button type="button" className="btn" onClick={resetForm}>Cancel</button>
            )}
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editing ? "Update Package" : "Add Package"}
            </button>
          </div>
        </form>

        {(createMutation.isError || updateMutation.isError) && (
          <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--color-danger)", padding: "0.75rem", background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius-md)" }}>
            {(createMutation.error as Error | null)?.message || (updateMutation.error as Error | null)?.message || "Failed to save package"}
          </div>
        )}
      </div>

      {/* ─── Package List ───────────────────────────────────────────── */}
      <div className="card" style={{ padding: "1.25rem", backgroundColor: "var(--bg-surface-2)" }}>

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {(["All", ...CATEGORIES] as (PackageCategory | "All")[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.35rem 0.9rem",
                borderRadius: "999px",
                border: "1px solid",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                borderColor: activeTab === tab ? (tab === "All" ? "var(--color-primary)" : CATEGORY_COLORS[tab as PackageCategory]) : "var(--border)",
                color: activeTab === tab ? (tab === "All" ? "var(--color-primary)" : CATEGORY_COLORS[tab as PackageCategory]) : "var(--text-muted)",
                background: activeTab === tab
                  ? (tab === "All" ? "var(--color-primary-glow)" : `${CATEGORY_COLORS[tab as PackageCategory]}18`)
                  : "transparent",
              }}
            >
              {tab}
              {tab !== "All" && (
                <span style={{ marginLeft: "0.4rem", opacity: 0.75 }}>
                  ({(data ?? []).filter(p => p.category === tab).length})
                </span>
              )}
              {tab === "All" && (
                <span style={{ marginLeft: "0.4rem", opacity: 0.75 }}>({data?.length ?? 0})</span>
              )}
            </button>
          ))}

          <button className="btn" style={{ marginLeft: "auto" }} onClick={() => refetch()} disabled={isLoading || isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {isError ? (
          <div style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Failed to load packages</div>
            <div style={{ color: "var(--text-muted)" }}>{(error as Error)?.message ?? "Unknown error"}</div>
          </div>
        ) : isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading packages…</div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Package size={40} strokeWidth={1.2} style={{ marginBottom: "1rem", opacity: 0.4 }} />
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>No packages yet</div>
            <div style={{ fontSize: "0.85rem" }}>Use the form above to create your first package.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {filteredData.map((pkg) => (
              <div
                key={pkg._id}
                style={{
                  padding: "1rem 1.25rem",
                  border: `1px solid ${editing?._id === pkg._id ? "var(--color-primary)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ flex: 1, minWidth: "160px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{pkg.name}</span>
                      <span style={{
                        fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: `${CATEGORY_COLORS[pkg.category]}20`,
                        color: CATEGORY_COLORS[pkg.category],
                        border: `1px solid ${CATEGORY_COLORS[pkg.category]}40`,
                      }}>{pkg.category}</span>
                      {!pkg.isActive && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "0.1rem 0.4rem", borderRadius: "999px", background: "var(--color-danger-glow)", color: "var(--color-danger)", border: "1px solid rgba(239,68,68,0.2)" }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--color-primary)", marginBottom: "0.2rem" }}>
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </div>
                    {pkg.description && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{pkg.description}</div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {/* Active Toggle */}
                    <button
                      type="button"
                      title={pkg.isActive ? "Deactivate" : "Activate"}
                      onClick={() => updateMutation.mutate({ id: pkg._id, payload: { isActive: !pkg.isActive } })}
                      style={{
                        width: 38, height: 22, borderRadius: 11, border: "none",
                        background: pkg.isActive ? "var(--color-primary)" : "var(--border)",
                        position: "relative", cursor: "pointer", transition: "background 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{
                        position: "absolute", top: 2, left: pkg.isActive ? 18 : 2,
                        width: 18, height: 18, borderRadius: "50%", background: "#fff",
                        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }} />
                    </button>

                    <button type="button" className="btn" onClick={() => startEdit(pkg)}>Edit</button>

                    {deleteConfirm === pkg._id ? (
                      <>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sure?</span>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => deleteMutation.mutate(pkg._id)}
                          disabled={deleteMutation.isPending}
                        >Yes</button>
                        <button type="button" className="btn" onClick={() => setDeleteConfirm(null)}>No</button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => setDeleteConfirm(pkg._id)}
                      >Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
