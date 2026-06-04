// import {
//   Megaphone, Phone, Calendar, User, MapPin, Package, Search, X, Plus, Edit, Trash2,
//   ChevronDown, ChevronUp, Instagram, Clock, TrendingUp, CreditCard, AlertCircle, CheckCircle2
// } from "lucide-react";
// import StatCard from "@/components/StatCard";
// import { useState } from "react";
// import Loader from "../components/Loader";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// import {
//   deleteInfluencer,
//   getInfluencers,
//   type Influencer,
// } from "@/api/influencer";
// import { getActivePackages } from "@/api/packages";

// // ─── Formatting Helpers ───────────────────────────────────────────────────────
// const formatCurrency = (value?: number) => {
//   if (value === undefined || value === null) return "—";
//   return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(value);
// };

// const formatDate = (dateStr?: string | Date) => {
//   if (!dateStr) return "—";
//   const d = new Date(dateStr);
//   if (isNaN(d.getTime())) return "—";
//   const day = String(d.getDate()).padStart(2, '0');
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   const year = d.getFullYear();
//   return `${day} - ${month} - ${year}`;
// };

// const formatDateTime = (dateStr?: string | Date) => {
//   if (!dateStr) return "—";
//   const d = new Date(dateStr);
//   if (isNaN(d.getTime())) return "—";
//   const day = String(d.getDate()).padStart(2, '0');
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   const year = d.getFullYear();
//   const time = d.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
//   return `${day} - ${month} - ${year}, ${time}`;
// };

// // ─── Main Component ────────────────────────────────────────────────────────────
// export default function InfluencerPage() {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();

//   // Filters
//   const [filters, setFilters] = useState({
//     clientName: "",
//     phoneNumber: "",
//     instaId: "",
//     status: "",
//     package: "",
//     city: "",
//     shootDateFrom: "",
//     shootDateTo: "",
//     deliveryDeadlineFrom: "",
//     deliveryDeadlineTo: "",
//     paymentStatus: "",
//     referredBy: "",
//   });
//   const [showAdvanced, setShowAdvanced] = useState(false);

//   // Fetch Packages for dropdown
//   const { data: packages } = useQuery({
//     queryKey: ["packages", "Influencer"],
//     queryFn: () => getActivePackages("Influencer"),
//   });

//   // Fetch Influencers with filters
//   const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
//     queryKey: ["influencer", filters],
//     queryFn: () => getInfluencers(filters as any),
//   });

//   // Delete
//   const deleteMutation = useMutation({
//     mutationFn: (id: string) => deleteInfluencer(id),
//     onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["influencer"] }); },
//   });

//   const clearFilters = () => setFilters({
//     clientName: "",
//     phoneNumber: "",
//     instaId: "",
//     status: "",
//     package: "",
//     city: "",
//     shootDateFrom: "",
//     shootDateTo: "",
//     deliveryDeadlineFrom: "",
//     deliveryDeadlineTo: "",
//     paymentStatus: "",
//     referredBy: "",
//   });

//   // Since we are doing server-side filtering, data.data is our list
//   const influencers = data?.data || [];
//   const filteredData = influencers; // used by the render/list logic
//   const apiSummary = data?.summary || {};

//   // Summary totals
//   const summary = {
//     totalRecords: apiSummary.total || 0,
//     totalRevenue: apiSummary.totalRevenue || 0,
//     totalReceived: apiSummary.totalReceived || 0,
//     totalDue: apiSummary.totalDue || 0,
//     totalExpenses: apiSummary.totalExpenses || 0,
//     totalProfit: apiSummary.totalProfit || 0
//   };

//   return (
//     <div className="animate-fade-up" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem" }}>
//       {/* Header */}
//       <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
//         <div>
//           <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
//             <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
//               <Megaphone size={28} />
//             </div>
//             <h1 style={{ fontSize: "2rem", margin: 0 }}>Influencer</h1>
//           </div>
//           <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Manage influencer campaigns, packages, and payments.</p>
//         </div>
//         <button className="btn btn-primary" onClick={() => navigate("/dashboard/influencer/new")} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
//           <Plus size={20} /> Add Influencer
//         </button>
//       </header>

//       {/* Summary Cards */}
//       <div className="grid-responsive" style={{
//         display: "grid",
//         gridTemplateColumns: "repeat(6, 1fr)",
//         gap: "1.5rem",
//         marginBottom: "2.5rem"
//       }}>
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
//       <div style={{ padding: "1.25rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", border: "1px solid var(--border)" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
//           <Search size={18} color="var(--text-muted)" />
//           <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Filters</h2>
//           {Object.values(filters).some((v) => v !== "") && (
//             <button type="button" onClick={clearFilters} className="btn-ghost" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "var(--color-danger)" }}>
//               <X size={14} /> Clear All
//             </button>
//           )}
//         </div>

//         {/* Basic Filters */}
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//           gap: "1.25rem",
//           alignItems: "end"
//         }}>
//           <div>
//             <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Influencer Name</label>
//             <input placeholder="Search name..." value={filters.clientName} onChange={(e) => setFilters((f) => ({ ...f, clientName: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }} />
//           </div>
//           <div>
//             <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Phone Number</label>
//             <input placeholder="Search phone..." value={filters.phoneNumber} onChange={(e) => setFilters((f) => ({ ...f, phoneNumber: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }} />
//           </div>
//           <div>
//             <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Status</label>
//             <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }}>
//               <option value="">All Statuses</option>
//               <option value="Pending">Pending</option>
//               <option value="Confirmed">Confirmed</option>
//               <option value="Completed">Completed</option>
//               <option value="Cancelled">Cancelled</option>
//             </select>
//           </div>
//           <div style={{ display: "flex", flexDirection: "column" }}>
//             <div style={{ fontSize: "0.75rem", marginBottom: "0.25rem", visibility: "hidden" }}>Placeholder</div>
//             <button
//               type="button"
//               onClick={() => setShowAdvanced(!showAdvanced)}
//               className="btn-ghost"
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "0.4rem",
//                 fontSize: "0.9rem",
//                 padding: "0.6rem 1rem",
//                 border: "1px solid var(--border)",
//                 borderRadius: "var(--radius-md)",
//                 backgroundColor: "var(--bg-surface-3)",
//                 height: "100%",
//                 minHeight: "38px"
//               }}
//             >
//               {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               {showAdvanced ? "Hide Advanced" : "Show All Filters"}
//             </button>
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         {showAdvanced && (
//           <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px dashed var(--border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
//             <div>
//               <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Instagram ID</label>
//               <input placeholder="@username" value={filters.instaId} onChange={(e) => setFilters((f) => ({ ...f, instaId: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
//             </div>
//             <div>
//               <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Package</label>
//               <select value={filters.package} onChange={(e) => setFilters((f) => ({ ...f, package: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }}>
//                 <option value="">All Packages</option>
//                 {packages?.map((pkg) => (
//                   <option key={pkg._id} value={pkg.name}>{pkg.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Payment Status</label>
//               <select value={filters.paymentStatus} onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }}>
//                 <option value="">All Payments</option>
//                 <option value="pending">Due Balance</option>
//                 <option value="paid">Fully Paid</option>
//               </select>
//             </div>
//             <div>
//               <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>City</label>
//               <input placeholder="Search city..." value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
//             </div>
//             <div>
//               <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Shoot Date (From)</label>
//               <input type="date" value={filters.shootDateFrom} onChange={(e) => setFilters((f) => ({ ...f, shootDateFrom: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
//             </div>
//             <div>
//               <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Shoot Date (To)</label>
//               <input type="date" value={filters.shootDateTo} onChange={(e) => setFilters((f) => ({ ...f, shootDateTo: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
//             </div>
//             <div>
//               <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Deadline (From)</label>
//               <input type="date" value={filters.deliveryDeadlineFrom} onChange={(e) => setFilters((f) => ({ ...f, deliveryDeadlineFrom: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
//             </div>
//             <div>
//               <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Deadline (To)</label>
//               <input type="date" value={filters.deliveryDeadlineTo} onChange={(e) => setFilters((f) => ({ ...f, deliveryDeadlineTo: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
//             </div>
//             <div>
//               <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Reference By</label>
//               <input placeholder="Search reference..." value={filters.referredBy} onChange={(e) => setFilters((f) => ({ ...f, referredBy: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Records List */}
//       <div className="card" style={{ padding: "1.5rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)" }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
//           <div style={{ color: "var(--text-secondary)" }}>
//             {isLoading ? "Fetching data..." : (
//               <><strong>{filteredData?.length ?? 0}</strong> {filteredData?.length === 1 ? "record" : "records"} shown
//                 {isFetching && !isLoading && " (updating...)"}
//               </>
//             )}
//           </div>
//           <button className="btn" onClick={() => { clearFilters(); refetch(); }} disabled={isLoading || isFetching}>Refresh</button>
//         </div>

//         {isError ? (
//           <div style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--color-danger-light)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
//             <p style={{ fontWeight: 600, color: "var(--color-danger)" }}>Failed to load records</p>
//             <p style={{ color: "var(--text-muted)" }}>{(error as Error)?.message ?? "Unknown error"}</p>
//           </div>
//         ) : isLoading || isFetching ? (
//           <Loader message={isLoading ? "Loading influencers..." : "Updating filters..."} />
//         ) : (
//           <div style={{ display: "grid", gap: "1rem" }}>
//             {filteredData?.length === 0 ? (
//               <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-muted)" }}>
//                 No records match your filters.
//               </div>
//             ) : (
//               filteredData?.map((inf: Influencer) => (
//                 <RecordCard
//                   key={inf._id}
//                   record={inf}
//                   onEdit={() => navigate(`/dashboard/influencer/${inf._id}/edit`)}
//                   onDelete={() => deleteMutation.mutate(inf._id)}
//                   isDeleting={deleteMutation.isPending}
//                 />
//               ))
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Record Card ───────────────────────────────────────────────────────────────
// function RecordCard({ record, onEdit, onDelete, isDeleting }: { record: Influencer; onEdit: () => void; onDelete: () => void; isDeleting: boolean }) {
//   const [showExtras, setShowExtras] = useState(false);
//   const [showPayments, setShowPayments] = useState(false);

//   return (
//     <div
//       style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", transition: "box-shadow 0.2s", boxShadow: "var(--shadow-xs)" }}
//       onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
//       onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-xs)")}
//     >
//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//           <div style={{ background: "var(--color-primary-glow)", padding: "0.4rem", borderRadius: "50%" }}>
//             <User size={20} color="var(--color-primary)" />
//           </div>
//           <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 600 }}>{record.clientName}</h3>
//           <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: record.status === "Completed" ? "var(--color-success-light)" : record.status === "Confirmed" ? "var(--color-warning-light)" : "var(--bg-surface-3)" }}>
//             {record.status ?? "Pending"}
//           </span>
//         </div>
//         <div style={{ display: "flex", gap: "0.5rem" }}>
//           <button type="button" className="btn" onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Edit size={16} /> Edit</button>
//           <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isDeleting} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Trash2 size={16} /> Delete</button>
//         </div>
//       </div>

//       {/* Grid */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
//         <div>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
//             <Phone size={14} /> <span>{record.phoneNumber}</span>
//           </div>
//           {record.instaId && (
//             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
//               <Instagram size={14} /> <span>@{record.instaId}</span>
//             </div>
//           )}
//           {record.address && (
//             <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
//               <MapPin size={14} style={{ marginTop: 2 }} />
//               <div>
//                 {record.address.street && <div>{record.address.street}</div>}
//                 {(record.address.city || record.address.state || record.address.zipCode) && (
//                   <div>{[record.address.city, record.address.state, record.address.zipCode].filter(Boolean).join(", ")}</div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         <div style={{ fontSize: "0.9rem" }}>
//           {record.shootName && (
//             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
//               <Megaphone size={14} color="var(--text-muted)" />
//               <span style={{ fontWeight: 500 }}>{record.shootName}</span>
//             </div>
//           )}
//           <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
//             <Calendar size={14} /> <span>Shoot: {formatDateTime(record.shootDateAndTime)}</span>
//           </div>
//           {record.deliveryDeadline && (
//             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
//               <Clock size={14} /> <span>Due: {formatDate(record.deliveryDeadline)}</span>
//             </div>
//           )}
//           {record.package && (
//             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
//               <Package size={14} color="var(--color-primary)" />
//               <span style={{ fontWeight: 500, color: "var(--color-primary)" }}>{record.package}</span>
//             </div>
//           )}
//           {record.referredBy && (
//             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", color: "var(--text-muted)" }}>
//               <User size={14} /> <span>Ref: {record.referredBy}</span>
//             </div>
//           )}
//         </div>

//         <div style={{ fontSize: "0.9rem" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
//             <span style={{ color: "var(--text-muted)" }}>Total</span>
//             <strong>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(record.total ?? 0)}</strong>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
//             <span style={{ color: "var(--text-muted)" }}>Advance</span>
//             <span style={{ color: "hsl(142,71%,45%)" }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(record.advance ?? 0)}</span>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
//             <span style={{ color: "var(--text-muted)" }}>Balance</span>
//             <span style={{ color: (record.balance ?? 0) > 0 ? "var(--color-danger)" : "inherit", fontWeight: 600 }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(record.balance ?? 0)}</span>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border)", marginTop: "0.25rem", paddingTop: "0.25rem" }}>
//             <span style={{ color: "var(--text-muted)" }}>Profit</span>
//             <span style={{ color: "#10b981", fontWeight: 700 }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(record.profit ?? ((record.total || 0) - (record.expenses || 0)))}</span>
//           </div>
//         </div>
//       </div>

//       {/* Extras */}
//       {(record.extras ?? []).length > 0 && (
//         <div style={{ marginTop: "1rem" }}>
//           <button type="button" onClick={() => setShowExtras((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", color: "var(--text-secondary)", padding: "0.25rem 0" }}>
//             {showExtras ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Extras ({record.extras?.length})
//           </button>
//           {showExtras && (
//             <div style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
//               {(record.extras ?? []).map((e: any, idx: number) => (
//                 <div key={idx} style={{ fontSize: "0.9rem", display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
//                   <span>{e.description}</span>
//                   <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(e.amount || 0)}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Payments */}
//       {(record.payments ?? []).length > 0 && (
//         <div style={{ marginTop: "0.5rem" }}>
//           <button type="button" onClick={() => setShowPayments((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", color: "var(--text-secondary)", padding: "0.25rem 0" }}>
//             {showPayments ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Payments ({record.payments?.length})
//           </button>
//           {showPayments && (
//             <div style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
//               {(record.payments ?? []).map((p: any, idx: number) => (
//                 <div key={idx} style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between" }}>
//                     <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(p.amount)}</span>
//                     <span>{formatDate(p.date)}</span>
//                   </div>
//                   {p.note && <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{p.note}</div>}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {record.notes && (
//         <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic", marginTop: "1rem" }}>{record.notes}</div>
//       )}
//     </div>
//   );
// }





























import {
  Megaphone, Phone, Calendar, User, MapPin, Package, Search, X, Plus, Edit, Trash2,
  ChevronDown, ChevronUp, Instagram, Clock, TrendingUp, CreditCard, AlertCircle, CheckCircle2, Download
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  deleteInfluencer,
  getInfluencers,
  updateInfluencer,
  type Influencer,
} from "@/api/influencer";
import { getActivePackages } from "@/api/packages";
import { exportToExcel } from "@/utils/exportToExcel";

// ─── Formatting Helpers ───────────────────────────────────────────────────────
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(value);
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

// ─── WhatsApp SVG Icon ────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Build WhatsApp message ───────────────────────────────────────────────────
function buildWhatsAppMessage(record: Influencer): string {
  const addressParts = [
    record.address?.street,
    record.address?.city,
    record.address?.state,
    record.address?.zipCode,
  ].filter(Boolean).join(", ");

  const lines = [
    `👤 *Name:* ${record.clientName}`,
    `📞 *Phone:* ${record.phoneNumber}`,
    record.email ? `📧 *Email:* ${record.email}` : null,
    addressParts ? `📍 *Address:* ${addressParts}` : null,
    record.instaId ? `📷 *Instagram:* @${record.instaId}` : null,
    record.shootName ? `🎬 *Shoot Name:* ${record.shootName}` : null,
    record.shootDateAndTime ? `🕒 *Shoot Date & Time:* ${formatDateTime(record.shootDateAndTime)}` : null,
    record.deliveryDeadline ? `⏳ *Delivery Deadline:* ${formatDate(record.deliveryDeadline)}` : null,
    record.status ? `📊 *Status:* ${record.status}` : null,
    record.package ? `📦 *Package:* ${record.package}` : null,
    record.referredBy ? `🤝 *Referred By:* ${record.referredBy}` : null,
    record.notes ? `📝 *Notes:* ${record.notes}` : null,
  ].filter((l) => l !== null).join("\n");

  return lines;
}


const formatDateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

const getDateRange = (type: string, startStr?: string, endStr?: string) => {
  const now = new Date();
  let start: Date | null = null;
  let end: Date | null = new Date();
  end.setHours(23, 59, 59, 999);

  if (type === "day") {
    start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
  } else if (type === "week") {
    start = new Date();
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else if (type === "month") {
    start = new Date();
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
  } else if (type === "quarter") {
    start = new Date();
    start.setDate(now.getDate() - 120);
    start.setHours(0, 0, 0, 0);
  } else if (type === "year") {
    start = new Date();
    start.setDate(now.getDate() - 365);
    start.setHours(0, 0, 0, 0);
  } else if (type === "custom" && startStr && endStr) {
    start = new Date(startStr);
    start.setHours(0, 0, 0, 0);
    end = new Date(endStr);
    end.setHours(23, 59, 59, 999);
  } else {
    return { startDate: "", endDate: "" };
  }

  return {
    startDate: start ? start.toISOString() : "",
    endDate: end ? end.toISOString() : "",
  };
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function InfluencerPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Filters
  // Date filter state
  const [filterType, setFilterType] = useState<string>("all");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [tempRange, setTempRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [filters, setFilters] = useState({
    clientName: "",
    phoneNumber: "",
    instaId: "",
    status: "",
    package: "",
    city: "",
    shootDateFrom: "",
    shootDateTo: "",
    deliveryDeadlineFrom: "",
    deliveryDeadlineTo: "",
    paymentStatus: "",
    referredBy: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    const { startDate, endDate } = getDateRange(filterType, customRange.start, customRange.end);
    setFilters(f => ({
      ...f,
      dateFrom: startDate,
      dateTo: endDate
    }));
  }, [filterType, customRange]);

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch Packages for dropdown
  const { data: packages } = useQuery({
    queryKey: ["packages", "Influencer"],
    queryFn: () => getActivePackages("Influencer"),
  });

  // Fetch Influencers with filters
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["influencer", filters],
    queryFn: () => getInfluencers(filters as any),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInfluencer(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["influencer"] }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Influencer> }) => updateInfluencer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencer"] });
      alert("Payment recorded and influencer record updated!");
    },
    onError: (err: any) => {
      alert("Failed to update influencer record: " + err.message);
    }
  });

  const handleQuickPay = (record: Influencer) => {
    // Real-time calculation for perfection
    const extrasTotal = (record.extras || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const total = (record.packagePrice || 0) + extrasTotal;
    const paid = (record.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const balance = total - paid;

    if (balance <= 0) return;

    const newPayment = {
      amount: balance,
      date: new Date().toISOString(),
      note: "Full Payment successfully received - Punit Desai."
    };

    const updatedPayments = [...(record.payments || []), newPayment];
    const updatedAdvance = paid + balance;
    const updatedBalance = 0;

    updateMutation.mutate({
      id: record._id,
      payload: {
        ...record, // Preserve all existing data (extras, expenses, package, etc.)
        payments: updatedPayments,
        advance: updatedAdvance,
        balance: updatedBalance,
        total: total,
        status: "Completed"
      }
    });
  };

  const handleExport = () => {
    if (!data?.data || data.data.length === 0) return;
    const exportData = data.data.map((item: Influencer) => ({
      "Client Name": item.clientName,
      "Instagram ID": item.instaId || "-",
      "Phone Number": item.phoneNumber,
      "Status": item.status,
      "Total Package": item.package || "-",
      "Total Amount": item.total || 0,
      "Advance Paid": item.advance || 0,
      "Balance Due": item.balance || 0,
      "Shoot Name": item.shootName || "-",
      "Shoot Date": item.shootDateAndTime ? new Date(item.shootDateAndTime).toLocaleString() : "-",
      "Delivery Deadline": item.deliveryDeadline ? new Date(item.deliveryDeadline).toLocaleDateString() : "-",
      "City": item.address?.city || "-",
      "Notes": item.notes || "-",
    }));

    const apiSummary = data?.summary || {};
    const summaryData = {
      "Total Records": apiSummary.total || 0,
      "Total Revenue": apiSummary.totalRevenue || 0,
      "Total Received": apiSummary.totalReceived || 0,
      "Total Due": apiSummary.totalDue || 0,
      "Total Expenses": apiSummary.totalExpenses || 0,
      "Total Profit": apiSummary.totalProfit || 0
    };

    exportToExcel(exportData, "Influencer_Leads", summaryData);
  };

  const clearFilters = () => {
    setFilterType("all");
    setCustomRange({ start: "", end: "" });
    setTempRange({ start: "", end: "" });
    setIsCustomOpen(false);
    setFilters({
      clientName: "",
      phoneNumber: "",
      instaId: "",
      status: "",
      package: "",
      city: "",
      shootDateFrom: "",
      shootDateTo: "",
      deliveryDeadlineFrom: "",
      deliveryDeadlineTo: "",
      paymentStatus: "",
      referredBy: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const influencers = data?.data || [];
  const filteredData = influencers;
  const apiSummary = data?.summary || {};

  const summary = {
    totalRecords: apiSummary.total || 0,
    totalRevenue: apiSummary.totalRevenue || 0,
    totalReceived: apiSummary.totalReceived || 0,
    totalDue: apiSummary.totalDue || 0,
    totalExpenses: apiSummary.totalExpenses || 0,
    totalProfit: apiSummary.totalProfit || 0
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
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn" onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--bg-surface-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
            <Download size={20} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard/influencer/new")} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={20} /> Add Influencer
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid-responsive" style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: "1.5rem",
        marginBottom: "2.5rem"
      }}>
        <StatCard title="Total Records" value={summary.totalRecords} icon={<Package size={24} />} color="var(--color-primary)" description="Total entries" />
        <StatCard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} icon={<TrendingUp size={24} />} color="#f472b6" description="Gross value" />
        <StatCard title="Received" value={formatCurrency(summary.totalReceived)} icon={<CheckCircle2 size={24} />} color="#34d399" description="Collected" />
        <StatCard title="Total Due" value={formatCurrency(summary.totalDue)} icon={<AlertCircle size={24} />} color="#f87171" description="Pending" />
        <StatCard title="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={<CreditCard size={24} />} color="#fbbf24" description="Costs" />
        <StatCard title="Estimated Profit" value={formatCurrency(summary.totalProfit)} icon={<TrendingUp size={24} />} color="#60a5fa" description="Net profit" />
      </div>

      {/* ── Premium Responsive Date Range Filter Bar ── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        overflow: "visible",
        position: "relative",
        zIndex: 20,
        background: "rgba(30, 41, 59, 0.4)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "1.25rem",
        padding: "0.75rem 1.25rem",
        marginBottom: "2.5rem",
        width: "100%",
        boxSizing: "border-box"
      }}>
        {/* Presets */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {["all", "day", "week", "month", "quarter"].map((preset) => {
            const labelMap: Record<string, string> = {
              all: "All Time",
              day: "Last Day",
              week: "Last Week",
              month: "Last Month",
              quarter: "Last Quarter",
            };
            const isActive = filterType === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setFilterType(preset);
                  setIsCustomOpen(false);
                }}
                style={{
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  borderRadius: "10px",
                  cursor: "pointer",
                  background: isActive ? "var(--color-primary)" : "rgba(255, 255, 255, 0.03)",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  border: isActive ? "1px solid var(--color-primary)" : "1px solid rgba(255, 255, 255, 0.05)",
                  boxShadow: isActive ? "0 4px 12px var(--color-primary-glow)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                {labelMap[preset]}
              </button>
            );
          })}
        </div>

        {/* Custom Calendar Filter Option */}
        <div
          style={{
            position: "relative",
            width: isMobile ? "100%" : "auto",
            overflow: "visible",
            zIndex: 9999,
          }}
        >
          <button
            type="button"
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.5rem 1.25rem",
              fontSize: "0.85rem",
              fontWeight: 800,
              borderRadius: "10px",
              cursor: "pointer",
              background: filterType === "custom" ? "var(--color-primary)" : "rgba(255, 255, 255, 0.03)",
              color: filterType === "custom" ? "#ffffff" : "#94a3b8",
              border: filterType === "custom" ? "1px solid var(--color-primary)" : "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: filterType === "custom" ? "0 4px 12px var(--color-primary-glow)" : "none",
              transition: "all 0.2s ease",
              width: isMobile ? "100%" : "auto"
            }}
          >
            <Calendar size={16} />
            <span>
              {filterType === "custom" && customRange.start && customRange.end 
                ? `${formatDateOnly(customRange.start)} - ${formatDateOnly(customRange.end)}` 
                : "Custom Range"}
            </span>
          </button>

          {isCustomOpen && (
            <div
              style={{
                position: "absolute",
                top: isMobile ? "calc(100% + 0.75rem)" : "calc(100% + 0.85rem)",
                right: isMobile ? "auto" : 0,
                left: isMobile ? 0 : "auto",
                zIndex: 99999,
                width: isMobile ? "100%" : "340px",
                minWidth: isMobile ? "100%" : "340px",
                maxWidth: "calc(100vw - 2rem)",
                background: "rgba(15, 23, 42, 0.98)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1.5rem",
                padding: "1.25rem",
                boxShadow: "0 25px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                overflow: "visible",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#f8fafc", textTransform: "uppercase" }}>Select Date Range</span>
                <button type="button" onClick={() => setIsCustomOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", marginBottom: "0.3rem", textTransform: "uppercase" }}>Start Date</label>
                  <input
                    type="date"
                    value={tempRange.start}
                    onChange={(e) => setTempRange({ ...tempRange, start: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(15, 23, 42, 0.4)",
                      color: "white",
                      fontSize: "0.85rem",
                      colorScheme: "dark"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", marginBottom: "0.3rem", textTransform: "uppercase" }}>End Date</label>
                  <input
                    type="date"
                    value={tempRange.end}
                    onChange={(e) => setTempRange({ ...tempRange, end: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(15, 23, 42, 0.4)",
                      color: "white",
                      fontSize: "0.85rem",
                      colorScheme: "dark"
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setTempRange({ start: "", end: "" });
                    setCustomRange({ start: "", end: "" });
                    setFilterType("all");
                    setIsCustomOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    background: "rgba(255, 255, 255, 0.03)",
                    color: "#94a3b8",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tempRange.start && tempRange.end) {
                      setCustomRange({ start: tempRange.start, end: tempRange.end });
                      setFilterType("custom");
                      setIsCustomOpen(false);
                    }
                  }}
                  disabled={!tempRange.start || !tempRange.end}
                  style={{
                    flex: 2,
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "none",
                    background: tempRange.start && tempRange.end ? "var(--color-primary)" : "rgba(255, 255, 255, 0.02)",
                    color: tempRange.start && tempRange.end ? "white" : "rgba(255,255,255,0.2)",
                    fontSize: "0.8rem",
                    fontWeight: 900,
                    cursor: tempRange.start && tempRange.end ? "pointer" : "not-allowed"
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "1.25rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <Search size={18} color="var(--text-muted)" />
          <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Filters</h2>
          {Object.values(filters).some((v) => v !== "") && (
            <button type="button" onClick={clearFilters} className="btn-ghost" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "var(--color-danger)" }}>
              <X size={14} /> Clear All
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", alignItems: "end" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Influencer Name</label>
            <input placeholder="Search name..." value={filters.clientName} onChange={(e) => setFilters((f) => ({ ...f, clientName: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Phone Number</label>
            <input placeholder="Search phone..." value={filters.phoneNumber} onChange={(e) => setFilters((f) => ({ ...f, phoneNumber: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Status</label>
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} style={{ width: "100%", padding: "0.6rem" }}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.75rem", marginBottom: "0.25rem", visibility: "hidden" }}>Placeholder</div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn-ghost"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.9rem", padding: "0.6rem 1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface-3)", height: "100%", minHeight: "38px" }}
            >
              {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {showAdvanced ? "Hide Advanced" : "Show All Filters"}
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px dashed var(--border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Instagram ID</label>
              <input placeholder="@username" value={filters.instaId} onChange={(e) => setFilters((f) => ({ ...f, instaId: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Package</label>
              <select value={filters.package} onChange={(e) => setFilters((f) => ({ ...f, package: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }}>
                <option value="">All Packages</option>
                {packages?.map((pkg) => (
                  <option key={pkg._id} value={pkg.name}>{pkg.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Payment Status</label>
              <select value={filters.paymentStatus} onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }}>
                <option value="">All Payments</option>
                <option value="pending">Due Balance</option>
                <option value="paid">Fully Paid</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>City</label>
              <input placeholder="Search city..." value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Shoot Date (From)</label>
              <input type="date" value={filters.shootDateFrom} onChange={(e) => setFilters((f) => ({ ...f, shootDateFrom: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Shoot Date (To)</label>
              <input type="date" value={filters.shootDateTo} onChange={(e) => setFilters((f) => ({ ...f, shootDateTo: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Deadline (From)</label>
              <input type="date" value={filters.deliveryDeadlineFrom} onChange={(e) => setFilters((f) => ({ ...f, deliveryDeadlineFrom: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Deadline (To)</label>
              <input type="date" value={filters.deliveryDeadlineTo} onChange={(e) => setFilters((f) => ({ ...f, deliveryDeadlineTo: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 500, display: "block", marginBottom: "0.25rem", color: "var(--text-muted)" }}>Reference By</label>
              <input placeholder="Search reference..." value={filters.referredBy} onChange={(e) => setFilters((f) => ({ ...f, referredBy: e.target.value }))} style={{ width: "100%", padding: "0.5rem" }} />
            </div>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="card" style={{ padding: "1.5rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ color: "var(--text-secondary)" }}>
            {isLoading ? "Fetching data..." : (
              <><strong>{filteredData?.length ?? 0}</strong> {filteredData?.length === 1 ? "record" : "records"} shown
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
          <Loader message={isLoading ? "Loading influencers..." : "Updating filters..."} />
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
                  onQuickPay={() => handleQuickPay(inf)}
                  isUpdating={updateMutation.isPending && updateMutation.variables?.id === inf._id}
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
function RecordCard({ record, onEdit, onDelete, isDeleting, onQuickPay, isUpdating }: {
  record: Influencer;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  onQuickPay: () => void;
  isUpdating: boolean;
}) {
  const [showExtras, setShowExtras] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  const extrasTotal = (record.extras || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const calculatedTotal = (record.packagePrice || 0) + extrasTotal;
  const calculatedPaid = (record.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const calculatedBalance = calculatedTotal - calculatedPaid;
  const calculatedProfit = calculatedTotal - (record.expenses || 0);

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage(record))}`;

  const hasAddress = record.address && (
    record.address.street?.trim() ||
    record.address.city?.trim() ||
    record.address.state?.trim() ||
    record.address.zipCode?.trim()
  );

  return (
    <div
      className="record-card"
      style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", transition: "box-shadow 0.2s", boxShadow: "var(--shadow-xs)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-xs)")}
    >
      {/* Header */}
      <div className="record-card-header">
        <div className="record-card-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
            <div style={{ background: "var(--color-primary-glow)", padding: "0.4rem", borderRadius: "50%", flexShrink: 0 }}>
              <User size={20} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.clientName}</h3>
          </div>
          <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, flexShrink: 0, background: record.status === "Completed" ? "var(--color-success-light)" : record.status === "Confirmed" ? "var(--color-warning-light)" : "var(--bg-surface-3)" }}>
            {record.status ?? "Pending"}
          </span>
        </div>
        <div className="record-card-actions">
          <button type="button" className="btn" onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Edit size={16} /> Edit</button>
          <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isDeleting} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
        {/* Contact Info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            <Phone size={14} /> <span>{record.phoneNumber}</span>
          </div>
          {record.instaId && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              <Instagram size={14} /> <span>@{record.instaId}</span>
            </div>
          )}

          {/* ── Address + WhatsApp button side by side ── */}
          {hasAddress && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                {record.address?.street && <div>{record.address?.street}</div>}
                {(record.address?.city || record.address?.state || record.address?.zipCode) && (
                  <div>{[record.address?.city, record.address?.state, record.address?.zipCode].filter(Boolean).join(", ")}</div>
                )}
              </div>
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

              {/* Quick Pay Button */}
              {calculatedBalance > 0 && (
                <button
                  type="button"
                  title="Quick Full Payment"
                  onClick={(e) => { e.stopPropagation(); onQuickPay(); }}
                  disabled={isUpdating}
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: "rgba(52, 211, 153, 0.15)",
                    color: "#10b981",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    marginTop: 1,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(52, 211, 153, 0.25)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(52, 211, 153, 0.15)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  }}
                >
                  {isUpdating ? (
                    <div className="animate-spin" style={{ width: "12px", height: "12px", border: "2px solid #10b981", borderTopColor: "transparent", borderRadius: "50%" }} />
                  ) : (
                    <CreditCard size={15} />
                  )}
                </button>
              )}
            </div>
          )}

          {/* Fallback: no address — show pill button */}
          {!hasAddress && (
            <div style={{ marginTop: "0.35rem", display: "flex", gap: "0.5rem" }}>
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

              {/* Quick Pay Button (Pill version) */}
              {calculatedBalance > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onQuickPay(); }}
                  disabled={isUpdating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(52, 211, 153, 0.15)",
                    color: "#10b981",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  {isUpdating ? (
                    <div className="animate-spin" style={{ width: "10px", height: "10px", border: "2px solid #10b981", borderTopColor: "transparent", borderRadius: "50%" }} />
                  ) : (
                    <CreditCard size={13} />
                  )}
                  Quick Pay
                </button>
              )}
            </div>
          )}
        </div>

        {/* Shoot Details */}
        <div style={{ fontSize: "0.9rem" }}>
          {record.shootName && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Megaphone size={14} color="var(--text-muted)" />
              <span style={{ fontWeight: 500 }}>{record.shootName}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <Calendar size={14} /> <span>Shoot: {formatDateTime(record.shootDateAndTime)}</span>
          </div>
          {record.deliveryDeadline && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
              <Clock size={14} /> <span>Due: {formatDate(record.deliveryDeadline)}</span>
            </div>
          )}
          {record.package && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
              <Package size={14} color="var(--color-primary)" />
              <span style={{ fontWeight: 500, color: "var(--color-primary)" }}>{record.package}</span>
            </div>
          )}
          {record.referredBy && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", color: "var(--text-muted)" }}>
              <User size={14} /> <span>Ref: {record.referredBy}</span>
            </div>
          )}
        </div>

        {/* Financials */}
        <div style={{ fontSize: "0.9rem", minWidth: "180px" }}>
          {extrasTotal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Extras</span>
              <strong>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(extrasTotal)}</strong>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Total</span>
            <strong>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(calculatedTotal)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Advance</span>
            <span style={{ color: "hsl(142,71%,45%)" }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(calculatedPaid)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Balance</span>
            <span style={{ color: calculatedBalance > 0 ? "var(--color-danger)" : "inherit", fontWeight: 600 }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(calculatedBalance)}</span>
          </div>
          {(record.expenses || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Expenses</span>
              <span style={{ color: "var(--color-danger)" }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(record.expenses || 0)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border)", marginTop: "0.25rem", paddingTop: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Profit</span>
            <span style={{ color: "#10b981", fontWeight: 700 }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(calculatedProfit)}</span>
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
                  <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(e.amount || 0)}</span>
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
                    <span>{formatDate(p.date)}</span>
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
