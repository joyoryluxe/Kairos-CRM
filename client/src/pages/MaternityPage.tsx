// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// import {
//   getMaternities,
//   deleteMaternity,
//   type Maternity,
// } from "@/api/maternity";
// import {
//   CheckCircle2,
//   Plus,
//   Search,
//   ChevronDown,
//   ChevronUp,
//   Phone,
//   MapPin,
//   Baby,
//   Package,
//   Edit,
//   Trash2,
//   TrendingUp,
//   CreditCard,
//   AlertCircle,
//   Clock,
//   Flag,
// } from "lucide-react";
// import StatCard from "@/components/StatCard";

// // ─── helpers ────────────────────────────────────────────────────────────────

// const formatCurrency = (value: number | undefined) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     minimumFractionDigits: 0,
//   }).format(value || 0);

// const formatDate = (iso: string | undefined) => {
//   if (!iso) return "N/A";
//   return new Date(iso).toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatDateTime = (iso: string | undefined) => {
//   if (!iso) return "N/A";
//   return new Date(iso).toLocaleString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// function useIsMobile() {
//   const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
//   const [isTablet, setIsTablet] = useState(() => window.innerWidth < 1024);
//   useState(() => {
//     const handler = () => {
//       setIsMobile(window.innerWidth < 768);
//       setIsTablet(window.innerWidth < 1024);
//     };
//     window.addEventListener("resize", handler);
//     return () => window.removeEventListener("resize", handler);
//   });
//   return { isMobile, isTablet };
// }

// // ─── loader ──────────────────────────────────────────────────────────────────

// function Loader({ message }: { message?: string }) {
//   return (
//     <div style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
//       <div className="animate-spin" style={{ width: "40px", height: "40px", border: "3px solid var(--bg-surface-3)", borderTopColor: "var(--color-primary)", borderRadius: "50%" }} />
//       <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{message || "Loading..."}</p>
//     </div>
//   );
// }

// // ─── main page ───────────────────────────────────────────────────────────────

// export default function MaternityPage() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const { isMobile, isTablet } = useIsMobile();
//   const [showAdvanced, setShowAdvanced] = useState(false);

//   const [filters, setFilters] = useState({
//     clientName: "",
//     phoneNumber: "",
//     babyName: "",
//     status: "",
//     paymentStatus: "",
//     shootDateFrom: "",
//     shootDateTo: "",
//     birthDate: "",
//     city: "",
//     referredBy: "",
//     deliveryDeadlineFrom: "",
//     deliveryDeadlineTo: "",
//     notes: "",
//   });

//   const { data: results, isLoading, isError, error, refetch, isFetching } = useQuery({
//     queryKey: ["maternities", filters],
//     queryFn: () => getMaternities(filters),
//   });

//   const deleteMutation = useMutation({
//     mutationFn: deleteMaternity,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["maternities"] });
//     },
//   });

//   const clearFilters = () => {
//     setFilters({
//       clientName: "",
//       phoneNumber: "",
//       babyName: "",
//       status: "",
//       paymentStatus: "",
//       shootDateFrom: "",
//       shootDateTo: "",
//       birthDate: "",
//       city: "",
//       referredBy: "",
//       deliveryDeadlineFrom: "",
//       deliveryDeadlineTo: "",
//       notes: "",
//     });
//   };

//   const records = results?.data || [];
//   const apiSummary = results?.summary || {};

//   const summary = {
//     totalRecords: apiSummary.total || 0,
//     totalRevenue: apiSummary.totalRevenue || 0,
//     totalReceived: apiSummary.totalReceived || 0,
//     totalDue: apiSummary.totalDue || 0,
//     totalExpenses: apiSummary.totalExpenses || 0,
//     totalProfit: apiSummary.totalProfit || 0
//   };

//   return (
//     <div className="maternity-page animate-fade-up">
//       {/* Header */}
//       <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
//         <div>
//           <h1 style={{ fontSize: isMobile ? "2rem" : "2.5rem", fontWeight: 700, margin: "0 0 0.5rem 0", background: "linear-gradient(to right, #f472b6, #db2777)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//             Maternity Leads
//           </h1>
//           <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Management & tracking for maternity shoots.</p>
//         </div>
//         <button className="btn btn-primary" onClick={() => navigate("/dashboard/maternity/new")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(244, 114, 182, 0.3)" }}>
//           <Plus size={20} /> New Record
//         </button>
//       </header>

//       {/* Stats Grid */}
//       <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(6, 1fr)", gap: "1.25rem", marginBottom: "2.5rem" }}>
//         <StatCard
//           title="Total Records"
//           value={summary.totalRecords}
//           icon={<Package size={24} />}
//           color="var(--color-primary)"
//           description="Total entries"
//         />
//         <StatCard
//           title="Total Revenue"
//           value={formatCurrency(summary.totalRevenue)}
//           icon={<TrendingUp size={24} />}
//           color="#f472b6"
//           description="Gross value"
//         />
//         <StatCard
//           title="Received"
//           value={formatCurrency(summary.totalReceived)}
//           icon={<CheckCircle2 size={24} />}
//           color="#34d399"
//           description="Collected"
//         />
//         <StatCard
//           title="Total Due"
//           value={formatCurrency(summary.totalDue)}
//           icon={<AlertCircle size={24} />}
//           color="#f87171"
//           description="Pending"
//         />
//         <StatCard
//           title="Total Expenses"
//           value={formatCurrency(summary.totalExpenses)}
//           icon={<CreditCard size={24} />}
//           color="#fbbf24"
//           description="Costs"
//         />
//         <StatCard
//           title="Estimated Profit"
//           value={formatCurrency(summary.totalProfit)}
//           icon={<TrendingUp size={24} />}
//           color="#60a5fa"
//           description="Net profit"
//         />
//       </div>

//       {/* Filters */}
//       <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
//           <Search size={20} color="var(--color-primary)" />
//           <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Advanced Search</h2>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
//           <div>
//             <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Client Name</label>
//             <input placeholder="Search name..." value={filters.clientName} onChange={(e) => setFilters(f => ({ ...f, clientName: e.target.value }))} style={{ width: "100%" }} />
//           </div>
//           <div>
//             <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Phone Number</label>
//             <input placeholder="Search phone..." value={filters.phoneNumber} onChange={(e) => setFilters(f => ({ ...f, phoneNumber: e.target.value }))} style={{ width: "100%" }} />
//           </div>
//           <div>
//             <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Shoot Date From</label>
//             <input type="date" value={filters.shootDateFrom} onChange={(e) => setFilters(f => ({ ...f, shootDateFrom: e.target.value }))} style={{ width: "100%" }} />
//           </div>
//           <div>
//             <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Shoot Date To</label>
//             <input type="date" value={filters.shootDateTo} onChange={(e) => setFilters(f => ({ ...f, shootDateTo: e.target.value }))} style={{ width: "100%" }} />
//           </div>
//           <div style={{ display: "flex", alignItems: "flex-end" }}>
//             <button onClick={() => setShowAdvanced(!showAdvanced)} className="btn" style={{ width: "100%", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "var(--bg-surface-3)" }}>
//               {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               {showAdvanced ? "Basic Filters" : "More Filters"}
//             </button>
//           </div>
//         </div>

//         {showAdvanced && (
//           <div className="animate-fade-in" style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
//             <div>
//               <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Baby Name</label>
//               <input placeholder="Search baby..." value={filters.babyName} onChange={(e) => setFilters(f => ({ ...f, babyName: e.target.value }))} style={{ width: "100%" }} />
//             </div>
//             <div>
//               <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Status</label>
//               <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }}>
//                 <option value="">All Statuses</option>
//                 <option value="Pending">Pending</option>
//                 <option value="Confirmed">Confirmed</option>
//                 <option value="Completed">Completed</option>
//                 <option value="Cancelled">Cancelled</option>
//               </select>
//             </div>
//             <div>
//               <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Payment Status</label>
//               <select value={filters.paymentStatus} onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }}>
//                 <option value="">All Payments</option>
//                 <option value="pending">Due Balance</option>
//                 <option value="paid">Fully Paid</option>
//               </select>
//             </div>
//             <div>
//               <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>City</label>
//               <input placeholder="City" value={filters.city} onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))} style={{ width: "100%" }} />
//             </div>
//             <div style={{ gridColumn: "1 / -1" }}>
//               <button className="btn-ghost" onClick={clearFilters} style={{ fontSize: "0.8rem", color: "var(--color-danger)" }}>Clear All Filters</button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Results */}
//       <div className="records-list">
//         {isLoading || isFetching ? (
//           <Loader message="Fetching maternity records..." />
//         ) : isError ? (
//           <div style={{ padding: "3rem", textAlign: "center", background: "rgba(239,68,68,0.05)", borderRadius: "12px", border: "1px dashed var(--color-danger)" }}>
//             <p style={{ color: "var(--color-danger)", fontWeight: 600 }}>Error loading records</p>
//             <p style={{ color: "var(--text-muted)" }}>{error instanceof Error ? error.message : "Network error"}</p>
//             <button className="btn btn-primary" onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</button>
//           </div>
//         ) : records.length === 0 ? (
//           <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "16px" }}>
//             <Baby size={48} color="var(--text-muted)" style={{ marginBottom: "1rem", opacity: 0.5 }} />
//             <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>No maternity records found.</p>
//             <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: "0.5rem" }}>Reset filters</button>
//           </div>
//         ) : (
//           <div style={{ display: "grid", gap: "1.25rem" }}>
//             {records.map((record: Maternity) => (
//               <RecordCard
//                 key={record._id}
//                 record={record}
//                 onEdit={() => navigate(`/dashboard/maternity/${record._id}/edit`)}
//                 onDelete={() => { if (confirm("Permanently delete this record?")) deleteMutation.mutate(record._id); }}
//                 isDeleting={deleteMutation.isPending}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function RecordCard({ record, onEdit, onDelete, isDeleting }: { record: Maternity; onEdit: () => void; onDelete: () => void; isDeleting: boolean }) {
//   const [showExtras, setShowExtras] = useState(false);
//   const [showPayments, setShowPayments] = useState(false);

//   return (
//     <div
//       style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", transition: "all 0.2s" }}
//       className="record-card-hover"
//     >
//       {/* Card Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//           <div style={{ background: "var(--color-primary-glow)", padding: "0.5rem", borderRadius: "10px" }}>
//             <Baby size={22} color="var(--color-primary)" />
//           </div>
//           <div>
//             <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}>{record.clientName}</h3>
//             <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
//               <span style={{
//                 padding: "0.2rem 0.75rem",
//                 borderRadius: "999px",
//                 fontSize: "0.7rem",
//                 fontWeight: 700,
//                 background: record.status === 'Completed' ? 'var(--color-success-light)' : record.status === 'Confirmed' ? 'var(--color-warning-light)' : record.status === 'Cancelled' ? 'var(--color-danger-light)' : 'var(--bg-surface-3)',
//                 color: record.status === 'Completed' ? 'var(--color-success)' : record.status === 'Confirmed' ? 'var(--color-warning)' : record.status === 'Cancelled' ? 'var(--color-danger)' : 'var(--text-secondary)'
//               }}>
//                 {record.status}
//               </span>
//               <span style={{
//                 padding: "0.2rem 0.75rem",
//                 borderRadius: "999px",
//                 fontSize: "0.7rem",
//                 fontWeight: 700,
//                 background: (record.balance || 0) > 0 ? "#ffedd5" : "#f0fdf4",
//                 color: (record.balance || 0) > 0 ? "#ea580c" : "#16a34a"
//               }}>
//                 {(record.balance || 0) > 0 ? `Due: ${formatCurrency(record.balance)}` : "Paid"}
//               </span>
//             </div>
//           </div>
//         </div>
//         <div style={{ display: "flex", gap: "0.5rem" }}>
//           <button type="button" className="btn" onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Edit size={16} /> Edit</button>
//           <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isDeleting} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Trash2 size={16} /> Delete</button>
//         </div>
//       </div>

//       {/* Main Grid */}
//       <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
//         {/* Contact info */}
//         <div>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
//             <Phone size={14} /> {record.phoneNumber}
//           </div>
//           <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
//             <MapPin size={14} style={{ marginTop: "3px" }} />
//             <span>{record.address?.street ? `${record.address.street}, ${record.address.city}` : "No address"}</span>
//           </div>
//         </div>

//         {/* Details info */}
//         <div style={{ fontSize: "0.9rem" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem", color: "var(--text-secondary)" }}>
//             <Baby size={14} /> <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{record.babyName || "Baby Name Pending"}</span>
//             {record.birthDate && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>• Born: {formatDate(record.birthDate)}</span>}
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem", color: "var(--text-secondary)" }}>
//             <Clock size={14} /> <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>Shoot: {formatDateTime(record.shootDateAndTime)}</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: record.deliveryDeadline && new Date(record.deliveryDeadline) < new Date() ? "var(--color-danger)" : "var(--text-muted)" }}>
//             <Flag size={14} /> <span>Deadline: {formatDate(record.deliveryDeadline)}</span>
//           </div>
//         </div>

//         {/* Financial Overview Box */}
//         <div style={{
//           padding: "1rem",
//           background: "var(--bg-surface-3)",
//           borderRadius: "var(--radius-md)",
//           fontSize: "0.85rem"
//         }}>
//           {record.package && (
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
//               <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Package size={13} /> {record.package}</span>
//               <span style={{ fontWeight: 600 }}>{formatCurrency(record.packagePrice)}</span>
//             </div>
//           )}
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
//             <span style={{ color: "var(--text-muted)" }}>Total:</span>
//             <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{formatCurrency(record.total)}</span>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
//             <span style={{ color: "var(--text-muted)" }}>Paid:</span>
//             <span style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatCurrency(record.advance)}</span>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
//             <span style={{ fontWeight: 600 }}>Balance:</span>
//             <span style={{ fontWeight: 800, color: (record.balance || 0) > 0 ? "var(--color-danger)" : "var(--color-success)" }}>{formatCurrency(record.balance)}</span>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem", paddingTop: "0.25rem", borderTop: "1px dashed var(--border)" }}>
//             <span style={{ color: "var(--text-muted)" }}>Profit:</span>
//             <span style={{ fontWeight: 700, color: "#10b981" }}>{formatCurrency(record.profit ?? ((record.total || 0) - (record.expenses || 0)))}</span>
//           </div>
//         </div>
//       </div>

//       {/* Expanded Sections */}
//       {((record.extras?.length ?? 0) > 0 || (record.payments?.length ?? 0) > 0 || record.notes) && (
//         <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
//           {(record.extras?.length ?? 0) > 0 && (
//             <div>
//               <button
//                 onClick={() => setShowExtras(!showExtras)}
//                 style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.85rem", padding: 0 }}
//               >
//                 {showExtras ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Extras ({record.extras?.length})
//               </button>
//               {showExtras && (
//                 <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
//                   {(record.extras || []).map((e: any, idx: number) => (
//                     <div key={idx} style={{ display: "flex", justifyContent: "space-between", width: "220px" }}>
//                       <span>{e.description}</span>
//                       <span>{formatCurrency(e.amount)}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {(record.payments?.length ?? 0) > 0 && (
//             <div>
//               <button
//                 onClick={() => setShowPayments(!showPayments)}
//                 style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.85rem", padding: 0 }}
//               >
//                 {showPayments ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Payments ({record.payments?.length})
//               </button>
//               {showPayments && (
//                 <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
//                   {(record.payments || []).map((p: any, idx: number) => (
//                     <div key={idx} style={{ marginBottom: "0.25rem", width: "220px" }}>
//                       <div style={{ display: "flex", justifyContent: "space-between" }}>
//                         <span>{formatCurrency(p.amount)}</span>
//                         <span>{formatDate(p.date)}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {record.notes && (
//             <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "400px", fontStyle: "italic" }}>
//               <span style={{ fontWeight: 600, fontStyle: "normal" }}>Notes:</span> {record.notes}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }














import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getMaternities,
  deleteMaternity,
  type Maternity,
} from "@/api/maternity";
import {
  CheckCircle2,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  Baby,
  Package,
  Edit,
  Trash2,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Clock,
  Flag,
} from "lucide-react";
import StatCard from "@/components/StatCard";

// ─── helpers ────────────────────────────────────────────────────────────────

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

const formatDateTime = (iso: string | undefined) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth < 1024);
  useState(() => {
    const handler = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  });
  return { isMobile, isTablet };
}

// ─── loader ──────────────────────────────────────────────────────────────────

function Loader({ message }: { message?: string }) {
  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div className="animate-spin" style={{ width: "40px", height: "40px", border: "3px solid var(--bg-surface-3)", borderTopColor: "var(--color-primary)", borderRadius: "50%" }} />
      <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{message || "Loading..."}</p>
    </div>
  );
}

// ─── WhatsApp SVG Icon ────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Build WhatsApp message ───────────────────────────────────────────────────
function buildWhatsAppMessage(record: Maternity): string {
  const addressParts = [
    record.address?.street,
    record.address?.city,
    record.address?.state,
    record.address?.zipCode,
  ].filter(Boolean).join(", ");

  const lines = [
    `🍼 *Maternity Shoot Brief*`,
    ``,
    `👤 *Client:* ${record.clientName}`,
    `📞 *Phone:* ${record.phoneNumber}`,
    addressParts ? `📍 *Address:* ${addressParts}` : null,
    ``,
    record.babyName ? `👶 *Baby Name:* ${record.babyName}` : null,
    record.birthDate ? `🎂 *Birth Date:* ${formatDate(record.birthDate)}` : null,
    `📅 *Shoot Date:* ${formatDateTime(record.shootDateAndTime)}`,
    record.deliveryDeadline ? `⏰ *Deadline:* ${formatDate(record.deliveryDeadline)}` : null,
    record.package ? `📦 *Package:* ${record.package}` : null,
    `🔖 *Status:* ${record.status}`,
    ``,
    `💰 *Total:* ${formatCurrency(record.total)}`,
    `✅ *Advance Paid:* ${formatCurrency(record.advance)}`,
    `⚠️ *Balance Due:* ${formatCurrency(record.balance)}`,
  ].filter((l) => l !== null).join("\n");

  return lines;
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function MaternityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isMobile, isTablet } = useIsMobile();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    clientName: "",
    phoneNumber: "",
    babyName: "",
    status: "",
    paymentStatus: "",
    shootDateFrom: "",
    shootDateTo: "",
    birthDate: "",
    city: "",
    referredBy: "",
    deliveryDeadlineFrom: "",
    deliveryDeadlineTo: "",
    notes: "",
  });

  const { data: results, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["maternities", filters],
    queryFn: () => getMaternities(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaternity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternities"] });
    },
  });

  const clearFilters = () => {
    setFilters({
      clientName: "",
      phoneNumber: "",
      babyName: "",
      status: "",
      paymentStatus: "",
      shootDateFrom: "",
      shootDateTo: "",
      birthDate: "",
      city: "",
      referredBy: "",
      deliveryDeadlineFrom: "",
      deliveryDeadlineTo: "",
      notes: "",
    });
  };

  const records = results?.data || [];
  const apiSummary = results?.summary || {};

  const summary = {
    totalRecords: apiSummary.total || 0,
    totalRevenue: apiSummary.totalRevenue || 0,
    totalReceived: apiSummary.totalReceived || 0,
    totalDue: apiSummary.totalDue || 0,
    totalExpenses: apiSummary.totalExpenses || 0,
    totalProfit: apiSummary.totalProfit || 0
  };

  return (
    <div className="maternity-page animate-fade-up">
      {/* Header */}
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: isMobile ? "2rem" : "2.5rem", fontWeight: 700, margin: "0 0 0.5rem 0", background: "linear-gradient(to right, #f472b6, #db2777)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Maternity Leads
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Management & tracking for maternity shoots.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard/maternity/new")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(244, 114, 182, 0.3)" }}>
          <Plus size={20} /> New Record
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(6, 1fr)", gap: "1.25rem", marginBottom: "2.5rem" }}>
        <StatCard title="Total Records" value={summary.totalRecords} icon={<Package size={24} />} color="var(--color-primary)" description="Total entries" />
        <StatCard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} icon={<TrendingUp size={24} />} color="#f472b6" description="Gross value" />
        <StatCard title="Received" value={formatCurrency(summary.totalReceived)} icon={<CheckCircle2 size={24} />} color="#34d399" description="Collected" />
        <StatCard title="Total Due" value={formatCurrency(summary.totalDue)} icon={<AlertCircle size={24} />} color="#f87171" description="Pending" />
        <StatCard title="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={<CreditCard size={24} />} color="#fbbf24" description="Costs" />
        <StatCard title="Estimated Profit" value={formatCurrency(summary.totalProfit)} icon={<TrendingUp size={24} />} color="#60a5fa" description="Net profit" />
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Search size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Advanced Search</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Client Name</label>
            <input placeholder="Search name..." value={filters.clientName} onChange={(e) => setFilters(f => ({ ...f, clientName: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Phone Number</label>
            <input placeholder="Search phone..." value={filters.phoneNumber} onChange={(e) => setFilters(f => ({ ...f, phoneNumber: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Shoot Date From</label>
            <input type="date" value={filters.shootDateFrom} onChange={(e) => setFilters(f => ({ ...f, shootDateFrom: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Shoot Date To</label>
            <input type="date" value={filters.shootDateTo} onChange={(e) => setFilters(f => ({ ...f, shootDateTo: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="btn" style={{ width: "100%", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "var(--bg-surface-3)" }}>
              {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {showAdvanced ? "Basic Filters" : "More Filters"}
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="animate-fade-in" style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Baby Name</label>
              <input placeholder="Search baby..." value={filters.babyName} onChange={(e) => setFilters(f => ({ ...f, babyName: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Status</label>
              <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Payment Status</label>
              <select value={filters.paymentStatus} onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }}>
                <option value="">All Payments</option>
                <option value="pending">Due Balance</option>
                <option value="paid">Fully Paid</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>City</label>
              <input placeholder="City" value={filters.city} onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button className="btn-ghost" onClick={clearFilters} style={{ fontSize: "0.8rem", color: "var(--color-danger)" }}>Clear All Filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="records-list">
        {isLoading || isFetching ? (
          <Loader message="Fetching maternity records..." />
        ) : isError ? (
          <div style={{ padding: "3rem", textAlign: "center", background: "rgba(239,68,68,0.05)", borderRadius: "12px", border: "1px dashed var(--color-danger)" }}>
            <p style={{ color: "var(--color-danger)", fontWeight: 600 }}>Error loading records</p>
            <p style={{ color: "var(--text-muted)" }}>{error instanceof Error ? error.message : "Network error"}</p>
            <button className="btn btn-primary" onClick={() => refetch()} style={{ marginTop: "1rem" }}>Retry</button>
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "16px" }}>
            <Baby size={48} color="var(--text-muted)" style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>No maternity records found.</p>
            <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: "0.5rem" }}>Reset filters</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {records.map((record: Maternity) => (
              <RecordCard
                key={record._id}
                record={record}
                onEdit={() => navigate(`/dashboard/maternity/${record._id}/edit`)}
                onDelete={() => { if (confirm("Permanently delete this record?")) deleteMutation.mutate(record._id); }}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Record Card ──────────────────────────────────────────────────────────────
function RecordCard({ record, onEdit, onDelete, isDeleting }: { record: Maternity; onEdit: () => void; onDelete: () => void; isDeleting: boolean }) {
  const [showExtras, setShowExtras] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage(record))}`;

  // Check if address has meaningful content
  const hasAddress = record.address && (record.address.street || record.address.city);

  return (
    <div
      style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", transition: "all 0.2s" }}
      className="record-card-hover"
    >
      {/* Card Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "var(--color-primary-glow)", padding: "0.5rem", borderRadius: "10px" }}>
            <Baby size={22} color="var(--color-primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}>{record.clientName}</h3>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <span style={{
                padding: "0.2rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.7rem",
                fontWeight: 700,
                background: record.status === 'Completed' ? 'var(--color-success-light)' : record.status === 'Confirmed' ? 'var(--color-warning-light)' : record.status === 'Cancelled' ? 'var(--color-danger-light)' : 'var(--bg-surface-3)',
                color: record.status === 'Completed' ? 'var(--color-success)' : record.status === 'Confirmed' ? 'var(--color-warning)' : record.status === 'Cancelled' ? 'var(--color-danger)' : 'var(--text-secondary)'
              }}>
                {record.status}
              </span>
              <span style={{
                padding: "0.2rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.7rem",
                fontWeight: 700,
                background: (record.balance || 0) > 0 ? "#ffedd5" : "#f0fdf4",
                color: (record.balance || 0) > 0 ? "#ea580c" : "#16a34a"
              }}>
                {(record.balance || 0) > 0 ? `Due: ${formatCurrency(record.balance)}` : "Paid"}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn" onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Edit size={16} /> Edit</button>
          <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isDeleting} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {/* Contact info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <Phone size={14} /> {record.phoneNumber}
          </div>

          {/* ── Address + WhatsApp button side by side ── */}
          {hasAddress ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <MapPin size={14} style={{ marginTop: "3px", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>
                {record.address?.street ? `${record.address.street}, ${record.address.city}` : record.address?.city || ""}
              </span>
              {/* WhatsApp share button */}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                title="Share shoot details on WhatsApp"
                onClick={(e) => e.stopPropagation()}
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "#25D36620",
                  color: "#25D366",
                  border: "1px solid #25D36640",
                  cursor: "pointer",
                  transition: "background 0.15s, transform 0.15s",
                  textDecoration: "none",
                  marginTop: 1,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#25D36635";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#25D36620";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
                }}
              >
                <WhatsAppIcon size={15} />
              </a>
            </div>
          ) : (
            /* Fallback: no address — show pill button */
            <div style={{ marginTop: "0.35rem" }}>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                title="Share shoot details on WhatsApp"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "#25D36620",
                  color: "#25D366",
                  border: "1px solid #25D36640",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  textDecoration: "none",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                <WhatsAppIcon size={13} /> Share on WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Details info */}
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem", color: "var(--text-secondary)" }}>
            <Baby size={14} /> <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{record.babyName || "Baby Name Pending"}</span>
            {record.birthDate && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>• Born: {formatDate(record.birthDate)}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem", color: "var(--text-secondary)" }}>
            <Clock size={14} /> <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>Shoot: {formatDateTime(record.shootDateAndTime)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: record.deliveryDeadline && new Date(record.deliveryDeadline) < new Date() ? "var(--color-danger)" : "var(--text-muted)" }}>
            <Flag size={14} /> <span>Deadline: {formatDate(record.deliveryDeadline)}</span>
          </div>
        </div>

        {/* Financial Overview Box */}
        <div style={{ padding: "1rem", background: "var(--bg-surface-3)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
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
            <span style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatCurrency(record.advance)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 600 }}>Balance:</span>
            <span style={{ fontWeight: 800, color: (record.balance || 0) > 0 ? "var(--color-danger)" : "var(--color-success)" }}>{formatCurrency(record.balance)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem", paddingTop: "0.25rem", borderTop: "1px dashed var(--border)" }}>
            <span style={{ color: "var(--text-muted)" }}>Profit:</span>
            <span style={{ fontWeight: 700, color: "#10b981" }}>{formatCurrency(record.profit ?? ((record.total || 0) - (record.expenses || 0)))}</span>
          </div>
        </div>
      </div>

      {/* Expanded Sections */}
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
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", width: "220px" }}>
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
                    <div key={idx} style={{ marginBottom: "0.25rem", width: "220px" }}>
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