import {
  Building2, Phone, Calendar, Plus, Edit, Trash2,
  Search, X, ChevronDown, ChevronUp, MapPin, Package,
  TrendingUp, CreditCard, AlertCircle, CheckCircle2
} from "lucide-react";
import { useState } from "react";
import Loader from "../components/Loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  deleteCorporateEvent,
  getCorporateEvents,
  type CorporateEvent,
} from "@/api/corporateEvents";
import StatCard from "@/components/StatCard";

// Shared currency formatter
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day} - ${month} - ${year}`;
};

const formatDateTime = (dateStr?: string | Date) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const time = d.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${day} - ${month} - ${year}, ${time}`;
};

export default function CorporatePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    clientName: "",
    phoneNumber: "",
    eventName: "",
    city: "",
    notes: "",
    eventDateFrom: "",
    eventDateTo: "",
    deliveryDeadlineFrom: "",
    deliveryDeadlineTo: "",
    status: "",
    package: "",
    paymentStatus: "",
  });

  // Fetch data with server-side filtering
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["corporate-events", filters],
    queryFn: () => getCorporateEvents(filters),
  });

  const data = response?.data || [];
  const apiSummary = response?.summary || {};

  const summary = {
    totalRecords: apiSummary.total || 0,
    totalRevenue: apiSummary.totalRevenue || 0,
    totalReceived: apiSummary.totalReceived || 0,
    totalDue: apiSummary.totalDue || 0,
    totalExpenses: apiSummary.totalExpenses || 0,
    totalProfit: apiSummary.totalProfit || 0
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCorporateEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-events"] });
    },
  });

  // Clear filters
  const clearFilters = () => {
    setFilters({
      clientName: "",
      phoneNumber: "",
      eventName: "",
      city: "",
      notes: "",
      eventDateFrom: "",
      eventDateTo: "",
      deliveryDeadlineFrom: "",
      deliveryDeadlineTo: "",
      status: "",
      package: "",
      paymentStatus: "",
    });
  };

  // Summary calculations now consolidated at the top

  return (
    <div className="animate-fade-up" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem" }}>
      {/* Header */}
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
              <Building2 size={28} />
            </div>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>Corporate & Events</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            B2B client management, contract tracking, and event coordination.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard/corporate/new")} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={20} /> Add Event
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid-responsive" style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: "1.5rem",
        marginBottom: "2.5rem"
      }}>
        <StatCard
          title="Total Records"
          value={summary.totalRecords}
          icon={<Package size={24} />}
          color="var(--color-primary)"
          description="Total entries"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={<TrendingUp size={24} />}
          color="#f472b6"
          description="Gross value"
        />
        <StatCard
          title="Received"
          value={formatCurrency(summary.totalReceived)}
          icon={<CheckCircle2 size={24} />}
          color="#34d399"
          description="Collected"
        />
        <StatCard
          title="Total Due"
          value={formatCurrency(summary.totalDue)}
          icon={<AlertCircle size={24} />}
          color="#f87171"
          description="Pending"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={<CreditCard size={24} />}
          color="#fbbf24"
          description="Costs"
        />
        <StatCard
          title="Estimated Profit"
          value={formatCurrency(summary.totalProfit)}
          icon={<TrendingUp size={24} />}
          color="#60a5fa"
          description="Net profit"
        />
      </div>

      {/* Filters Section */}
      <div style={{
        padding: "1.5rem",
        backgroundColor: "var(--bg-surface-2)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "1.5rem",
        border: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Search size={20} color="var(--text-muted)" />
          <h2 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 700 }}>Filters</h2>
          {Object.values(filters).some((v) => v !== "") && (
            <button
              type="button"
              onClick={clearFilters}
              className="btn-ghost"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "var(--color-danger)" }}
            >
              <X size={16} /> Clear All
            </button>
          )}
        </div>

        {/* Basic Filters */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.25rem",
          alignItems: "end"
        }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Client Name</label>
            <input
              placeholder="Search by name..."
              value={filters.clientName}
              onChange={(e) => setFilters(f => ({ ...f, clientName: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Phone Number</label>
            <input
              placeholder="Search by phone..."
              value={filters.phoneNumber}
              onChange={(e) => setFilters(f => ({ ...f, phoneNumber: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Event Date From</label>
            <input
              type="date"
              value={filters.eventDateFrom}
              onChange={(e) => setFilters(f => ({ ...f, eventDateFrom: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Event Date To</label>
            <input
              type="date"
              value={filters.eventDateTo}
              onChange={(e) => setFilters(f => ({ ...f, eventDateTo: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.8rem", marginBottom: "0.5rem", visibility: "hidden" }}>Placeholder</div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                whiteSpace: "nowrap",
                height: "42px",
                backgroundColor: "var(--bg-surface-3)",
                border: "1px solid var(--border)",
              }}
            >
              {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {showAdvanced ? "Hide Filters" : "Show All Filters"}
            </button>
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showAdvanced && (
          <div style={{
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
            animation: "fadeDown 0.2s ease-out"
          }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                style={{ width: "100%" }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value }))}
                style={{ width: "100%" }}
              >
                <option value="">All Payments</option>
                <option value="pending">Pending Balance</option>
                <option value="paid">Fully Paid</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>City</label>
              <input
                placeholder="Search city..."
                value={filters.city}
                onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Event Name</label>
              <input
                placeholder="Search event title..."
                value={filters.eventName}
                onChange={(e) => setFilters(f => ({ ...f, eventName: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Deadline From</label>
              <input
                type="date"
                value={filters.deliveryDeadlineFrom}
                onChange={(e) => setFilters(f => ({ ...f, deliveryDeadlineFrom: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Deadline To</label>
              <input
                type="date"
                value={filters.deliveryDeadlineTo}
                onChange={(e) => setFilters(f => ({ ...f, deliveryDeadlineTo: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Notes Search</label>
              <input
                placeholder="Search in notes, terms, or conditions..."
                value={filters.notes}
                onChange={(e) => setFilters(f => ({ ...f, notes: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Records List Area */}
      <div className="card" style={{ padding: "1.5rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ color: "var(--text-secondary)" }}>
            {isLoading ? "Fetching data..." : (
              <>
                <strong>{data.length}</strong> {data.length === 1 ? "record" : "records"} shown
                {isFetching && !isLoading && " (updating...)"}
              </>
            )}
          </div>
          <button className="btn" onClick={() => { clearFilters(); refetch(); }} disabled={isLoading || isFetching}>Refresh</button>
        </div>

        {isError ? (
          <div style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--color-danger-light)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
            <p style={{ fontWeight: 600, color: "var(--color-danger)" }}>Failed to load records</p>
            <p style={{ color: "var(--text-muted)" }}>{(error as Error)?.message ?? "Unknown error"}</p>
          </div>
        ) : isLoading || isFetching ? (
          <Loader message={isLoading ? "Loading corporate events..." : "Updating filters..."} />
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {data.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-muted)" }}>
                No records match your filters.
              </div>
            ) : (
              data.map((eItem: CorporateEvent) => (
                <RecordCard
                  key={eItem._id}
                  record={eItem}
                  onEdit={() => navigate(`/dashboard/corporate/${eItem._id}/edit`)}
                  onDelete={() => deleteMutation.mutate(eItem._id)}
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

// ----------------------------------------------------------------------
// Record Card Component
// ----------------------------------------------------------------------
function RecordCard({ record, onEdit, onDelete, isDeleting }: { record: CorporateEvent; onEdit: () => void; onDelete: () => void; isDeleting: boolean }) {
  const [showExtras, setShowExtras] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  return (
    <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", transition: "all 0.2s" }}
      className="record-card-hover"
    >
      {/* Card Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "var(--color-primary-glow)", padding: "0.4rem", borderRadius: "var(--radius-md)" }}>
            <Building2 size={20} color="var(--color-primary)" />
          </div>
          <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 700 }}>{record.clientName}</h3>
          <span style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            background: record.status === 'Completed' ? 'var(--color-success-light)' : record.status === 'Confirmed' ? 'var(--color-warning-light)' : 'var(--bg-surface-3)',
            color: record.status === 'Completed' ? 'var(--color-success)' : record.status === 'Confirmed' ? 'var(--color-warning)' : 'var(--text-secondary)'
          }}>
            {record.status}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn" onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Edit size={16} /> Edit</button>
          <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isDeleting} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {/* Contact Info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            <Phone size={14} /> <span>{record.phoneNumber}</span>
          </div>
          {record.address && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
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

        {/* Event Details */}
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)" }}>{record.eventName || "Untitled Event"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <Calendar size={14} /> <span>Date: {formatDateTime(record.eventDateAndTime)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: (record.deliveryDeadline && new Date(record.deliveryDeadline) < new Date()) ? "var(--color-danger)" : "var(--text-muted)" }}>
            <Calendar size={14} /> <span>Deadline: {formatDate(record.deliveryDeadline)}</span>
          </div>
        </div>

        {/* Financial Overview */}
        <div style={{
          padding: "1rem",
          background: "var(--bg-surface-3)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.85rem"
        }}>
          {record.package && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Package size={13} /> {record.package}</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(record.packagePrice)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Total:</span>
            <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{formatCurrency(record.total)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Paid:</span>
            <span style={{ fontWeight: 600, color: "hsl(142,71%,45%)" }}>{formatCurrency(record.advance)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 600 }}>Balance:</span>
            <span style={{ fontWeight: 800, color: (record.balance || 0) > 0 ? "var(--color-danger)" : "hsl(142,71%,45%)" }}>{formatCurrency(record.balance)}</span>
          </div>
        </div>
      </div>

      {/* Expanded Sections (Extras / Payments / Notes) */}
      {((record.extras?.length ?? 0) > 0 || (record.payments?.length ?? 0) > 0 || record.notes) && (
        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {(record.extras?.length ?? 0) > 0 && (
            <div>
              <button onClick={() => setShowExtras(!showExtras)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.85rem", padding: 0 }}>
                {showExtras ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Extras ({record.extras?.length})
              </button>
              {showExtras && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {(record.extras || []).map((e: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", width: "200px" }}>
                      <span>{e.description}</span>
                      <span>{formatCurrency(e.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(record.payments?.length ?? 0) > 0 && (
            <div>
              <button onClick={() => setShowPayments(!showPayments)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.85rem", padding: 0 }}>
                {showPayments ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Payments ({record.payments?.length})
              </button>
              {showPayments && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {(record.payments || []).map((p: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: "0.25rem", width: "200px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{formatCurrency(p.amount)}</span>
                        <span>{formatDate(p.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {record.notes && (
            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "400px", fontStyle: "italic" }}>
              <span style={{ fontWeight: 600, fontStyle: "normal" }}>Notes:</span> {record.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
