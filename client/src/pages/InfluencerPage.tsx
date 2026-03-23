import {
  Megaphone, Phone, Calendar, User, MapPin, Package, Search, X, Plus, Edit, Trash2,
  ChevronDown, ChevronUp, Instagram, Clock,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  deleteInfluencer,
  getInfluencers,
  type Influencer,
} from "@/api/influencer";

// ─── Currency formatter ────────────────────────────────────────────────────────
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(value);
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function InfluencerPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Filters
  const [filters, setFilters] = useState({ clientName: "", phoneNumber: "", shootDateAndTime: "" });

  // Fetch
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["influencer"],
    queryFn: getInfluencers,
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInfluencer(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["influencer"] }); },
  });

  const clearFilters = () => setFilters({ clientName: "", phoneNumber: "", shootDateAndTime: "" });

  // Filter data
  const filteredData = data?.filter((item: Influencer) => {
    const matchClient = item.clientName.toLowerCase().includes(filters.clientName.toLowerCase());
    const matchPhone = item.phoneNumber.toLowerCase().includes(filters.phoneNumber.toLowerCase());
    const matchShoot = (item.shootDateAndTime ?? "").toLowerCase().includes(filters.shootDateAndTime.toLowerCase());
    return matchClient && matchPhone && matchShoot;
  });

  // Summary totals
  const summary = {
    totalRecords: data?.length ?? 0,
    totalRevenue: data?.reduce((sum: number, i: Influencer) => sum + (i.total ?? 0), 0) ?? 0,
    totalReceived: data?.reduce((sum: number, i: Influencer) => sum + (i.advance ?? 0), 0) ?? 0,
    totalDue: data?.reduce((sum: number, i: Influencer) => sum + (i.balance ?? 0), 0) ?? 0,
  };

  return (
    <div className="animate-fade-up" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem" }}>
      {/* Header */}
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
              <Megaphone size={28} />
            </div>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>Influencer</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Manage influencer campaigns, packages, and payments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard/influencer/new")} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={20} /> Add Influencer
        </button>
      </header>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Records", value: summary.totalRecords },
          { label: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
          { label: "Received", value: formatCurrency(summary.totalReceived) },
          { label: "Due", value: formatCurrency(summary.totalDue) },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: "1rem", background: "var(--bg-surface-2)" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ padding: "1.25rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <Search size={18} color="var(--text-muted)" />
          <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Filters</h2>
          {Object.values(filters).some((v) => v !== "") && (
            <button type="button" onClick={clearFilters} className="btn-ghost" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem" }}>Influencer Name</label>
            <input placeholder="Search name..." value={filters.clientName} onChange={(e) => setFilters((f) => ({ ...f, clientName: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem" }}>Phone</label>
            <input placeholder="Search phone..." value={filters.phoneNumber} onChange={(e) => setFilters((f) => ({ ...f, phoneNumber: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem" }}>Shoot Date</label>
            <input type="datetime-local" value={filters.shootDateAndTime} onChange={(e) => setFilters((f) => ({ ...f, shootDateAndTime: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="card" style={{ padding: "1.5rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ color: "var(--text-secondary)" }}>
            {isLoading ? "Loading..." : (
              <><strong>{filteredData?.length ?? 0}</strong> {filteredData?.length === 1 ? "record" : "records"} shown
                {isFetching && !isLoading && " (refreshing...)"}
              </>
            )}
          </div>
          <button className="btn" onClick={() => refetch()} disabled={isLoading || isFetching}>Refresh</button>
        </div>

        {isError ? (
          <div style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--color-danger-light)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
            <p style={{ fontWeight: 600, color: "var(--color-danger)" }}>Failed to load records</p>
            <p style={{ color: "var(--text-muted)" }}>{(error as Error)?.message ?? "Unknown error"}</p>
          </div>
        ) : isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Fetching influencer data…</div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {filteredData?.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-muted)" }}>
                No records match your filters.
              </div>
            ) : (
              filteredData?.map((inf: Influencer) => (
                <RecordCard
                  key={inf._id}
                  record={inf}
                  onEdit={() => navigate(`/dashboard/influencer/${inf._id}/edit`)}
                  onDelete={() => deleteMutation.mutate(inf._id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Record Card ───────────────────────────────────────────────────────────────
function RecordCard({ record, onEdit, onDelete, isDeleting }: { record: Influencer; onEdit: () => void; onDelete: () => void; isDeleting: boolean }) {
  const [showExtras, setShowExtras] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  return (
    <div
      style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", transition: "box-shadow 0.2s", boxShadow: "var(--shadow-xs)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-xs)")}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "var(--color-primary-glow)", padding: "0.4rem", borderRadius: "50%" }}>
            <User size={20} color="var(--color-primary)" />
          </div>
          <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 600 }}>{record.clientName}</h3>
          <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: record.status === "Completed" ? "var(--color-success-light)" : record.status === "Confirmed" ? "var(--color-warning-light)" : "var(--bg-surface-3)" }}>
            {record.status ?? "Pending"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn" onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Edit size={16} /> Edit</button>
          <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isDeleting} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            <Phone size={14} /> <span>{record.phoneNumber}</span>
          </div>
          {record.instaId && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              <Instagram size={14} /> <span>@{record.instaId}</span>
            </div>
          )}
          {record.address && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              <MapPin size={14} style={{ marginTop: 2 }} />
              <div>
                {record.address.street && <div>{record.address.street}</div>}
                {(record.address.city || record.address.state || record.address.zipCode) && (
                  <div>{[record.address.city, record.address.state, record.address.zipCode].filter(Boolean).join(", ")}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: "0.9rem" }}>
          {record.shootName && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Megaphone size={14} color="var(--text-muted)" />
              <span style={{ fontWeight: 500 }}>{record.shootName}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <Calendar size={14} /> <span>Shoot: {record.shootDateAndTime ? new Date(record.shootDateAndTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "—"}</span>
          </div>
          {record.deliveryDeadline && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
              <Clock size={14} /> <span>Due: {new Date(record.deliveryDeadline).toLocaleDateString()}</span>
            </div>
          )}
          {record.package && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
              <Package size={14} color="var(--color-primary)" />
              <span style={{ fontWeight: 500, color: "var(--color-primary)" }}>{record.package}</span>
            </div>
          )}
        </div>

        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Total</span>
            <strong>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(record.total ?? 0)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Advance</span>
            <span style={{ color: "hsl(142,71%,45%)" }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(record.advance ?? 0)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Balance</span>
            <span style={{ color: (record.balance ?? 0) > 0 ? "var(--color-danger)" : "inherit", fontWeight: 600 }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(record.balance ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Extras */}
      {(record.extras ?? []).length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <button type="button" onClick={() => setShowExtras((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", color: "var(--text-secondary)", padding: "0.25rem 0" }}>
            {showExtras ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Extras ({record.extras?.length})
          </button>
          {showExtras && (
            <div style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
              {(record.extras ?? []).map((e: any, idx: number) => (
                <div key={idx} style={{ fontSize: "0.9rem", display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span>{e.description}</span>
                  <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(e.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments */}
      {(record.payments ?? []).length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <button type="button" onClick={() => setShowPayments((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", color: "var(--text-secondary)", padding: "0.25rem 0" }}>
            {showPayments ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Payments ({record.payments?.length})
          </button>
          {showPayments && (
            <div style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
              {(record.payments ?? []).map((p: any, idx: number) => (
                <div key={idx} style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(p.amount)}</span>
                    <span>{new Date(p.date).toLocaleDateString()}</span>
                  </div>
                  {p.note && <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{p.note}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {record.notes && (
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic", marginTop: "1rem" }}>{record.notes}</div>
      )}
    </div>
  );
}
