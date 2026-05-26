import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getInvoices, deleteInvoice, type Invoice } from "@/api/invoice";
import {
  Plus,
  Search,
  Receipt,
  Trash2,
  Edit,
  TrendingUp,
  FileSpreadsheet,
  Phone,
  Download
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Loader from "@/components/Loader";
import { exportToExcel } from "@/utils/exportToExcel";

const formatCurrency = (value: number | undefined) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (iso: string | undefined) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    clientName: "",
    invoiceNumber: "",
    clientPhone: "",
    dateFrom: "",
    dateTo: "",
  });

  const { data: results, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => getInvoices(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const clearFilters = () => {
    setFilters({
      clientName: "",
      invoiceNumber: "",
      clientPhone: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const records = results?.data || [];
  const summary = results?.summary || { totalCount: 0, totalRevenue: 0 };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this invoice?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    if (records.length === 0) {
      alert("No invoices available to export.");
      return;
    }
    const exportData = records.map((invoice: Invoice) => ({
      "Invoice Number": invoice.invoiceNumber,
      "Client Name": invoice.clientName,
      "Client Phone": invoice.clientPhone || "-",
      "Client Email": invoice.clientEmail || "-",
      "Issued Date": invoice.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString("en-IN") : "-",
      "Items Count": invoice.items?.length || 0,
      "Total Amount": invoice.totalAmount || 0,
      "Bank Account": invoice.paymentDetails?.bankAccount || "-",
      "UPI ID": invoice.paymentDetails?.upi || "-",
      "Notes": invoice.notes || "-",
    }));

    const summaryData = {
      "Total Invoices": summary.totalCount,
      "Total Revenue": summary.totalRevenue,
    };

    exportToExcel(exportData, "Invoice_Registry", summaryData);
  };

  return (
    <div className="invoices-page animate-fade-up">
      {/* Header */}
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 0.5rem 0", background: "linear-gradient(to right, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Invoice Registry
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Management and billing log for Kairos clients.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn" onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "12px", background: "var(--bg-surface-3)", border: "1px solid var(--border)" }}>
            <Download size={20} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard/invoices/new")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)" }}>
            <Plus size={20} /> Create Invoice
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        <StatCard
          title="Total Invoices"
          value={summary.totalCount}
          icon={<Receipt size={24} />}
          color="var(--color-primary)"
          description="Invoices issued"
        />
        <StatCard
          title="Total Billed"
          value={formatCurrency(summary.totalRevenue)}
          icon={<TrendingUp size={24} />}
          color="#34d399"
          description="Gross invoiced revenue"
        />
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Search size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Filter Registry</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Client Name</label>
            <input placeholder="Search client name..." value={filters.clientName} onChange={(e) => setFilters(f => ({ ...f, clientName: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Invoice No.</label>
            <input placeholder="e.g. KS-001" value={filters.invoiceNumber} onChange={(e) => setFilters(f => ({ ...f, invoiceNumber: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Phone Number</label>
            <input placeholder="Search phone..." value={filters.clientPhone} onChange={(e) => setFilters(f => ({ ...f, clientPhone: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Issued From</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Issued To</label>
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))} style={{ width: "100%" }} />
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <button className="btn btn-ghost" onClick={clearFilters} style={{ fontSize: "0.8rem", color: "var(--color-danger)", padding: "0.4rem 0.8rem" }}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <div className="invoices-list">
        {isLoading ? (
          <Loader message="Gathering invoices..." />
        ) : isError ? (
          <div style={{ padding: "3rem", textAlign: "center", background: "rgba(239,68,68,0.05)", borderRadius: "12px", border: "1px dashed var(--color-danger)" }}>
            <p style={{ color: "var(--color-danger)", fontWeight: 600 }}>Failed to fetch invoices</p>
            <p style={{ color: "var(--text-muted)" }}>{error instanceof Error ? error.message : "Network error"}</p>
            <button className="btn btn-primary" onClick={() => refetch()} style={{ marginTop: "1rem" }}>Try Again</button>
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "16px" }}>
            <Receipt size={48} color="var(--text-muted)" style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>No invoice records found.</p>
            <button className="btn btn-ghost" onClick={clearFilters} style={{ marginTop: "0.5rem" }}>Reset search</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {records.map((invoice: Invoice) => (
              <div
                key={invoice._id}
                style={{
                  padding: "1.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  transition: "border-color var(--transition)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-strong)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ background: "var(--color-primary-glow)", padding: "0.5rem", borderRadius: "10px" }}>
                      <Receipt size={22} color="var(--color-primary)" />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)" }}>{invoice.invoiceNumber}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>•</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{formatDate(invoice.issuedDate)}</span>
                      </div>
                      <h3 style={{ fontSize: "1.25rem", margin: "0.2rem 0 0 0", fontWeight: 700 }}>{invoice.clientName}</h3>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => navigate(`/dashboard/invoices/${invoice._id}/edit?preview=true`)} style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-primary)", padding: "0.5rem 1rem", borderRadius: "8px" }}>
                      <Download size={16} /> Download
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => navigate(`/dashboard/invoices/${invoice._id}/edit`)} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1rem", borderRadius: "8px" }}>
                      <Edit size={16} /> Edit
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => handleDelete(invoice._id)} style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-danger)", borderColor: "rgba(239, 68, 68, 0.2)", padding: "0.5rem 1rem", borderRadius: "8px" }}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    {invoice.clientPhone && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        <Phone size={14} /> {invoice.clientPhone}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      <FileSpreadsheet size={14} /> {invoice.items?.length || 0} item(s)
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Invoiced</div>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#f8fafc" }}>{formatCurrency(invoice.totalAmount)}</div>
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
