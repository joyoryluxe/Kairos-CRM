// import React, { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { 
//   Plus, 
//   Search, 
//   Filter, 
//   LayoutGrid, 
//   List as ListIcon, 
//   MoreVertical, 
//   Phone, 
//   MessageCircle, 
//   Calendar,
//   IndianRupee,
//   Clock,
//   ArrowRight,
// } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { getLeads, updateLead, type Lead, type LeadStatus } from "../api/lead";
// import { format } from "date-fns";

// const useIsMobile = () => {
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return { isMobile };
// };

// const STATUS_COLUMNS: LeadStatus[] = ["New", "Contacted", "Interested", "Negotiation", "Booked", "Lost"];

// const LeadsPage: React.FC = () => {
//   const { isMobile } = useIsMobile();
//   const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("All");

//   const queryClient = useQueryClient();
//   const navigate = useNavigate();

//   const { data: leads = [], isLoading } = useQuery({
//     queryKey: ["leads"],
//     queryFn: () => getLeads(),
//   });

//   const updateStatusMutation = useMutation({
//     mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateLead(id, { status }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["leads"] });
//     },
//   });

//   const filteredLeads = leads.filter(lead => {
//     const matchesSearch = lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                          (lead.phoneNumber && lead.phoneNumber.includes(searchTerm));
//     const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const getLeadsByStatus = (status: LeadStatus) => {
//     return filteredLeads.filter(lead => lead.status === status);
//   };

//   if (isLoading) {
//     return (
//       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
//         <div className="loader"></div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: isMobile ? "1rem" : "1.5rem" }}>
//       {/* Header */}
//       <div style={{ 
//         display: "flex", 
//         flexDirection: isMobile ? "column" : "row",
//         justifyContent: "space-between", 
//         alignItems: isMobile ? "flex-start" : "center", 
//         marginBottom: "2rem",
//         gap: "1rem"
//       }}>
//         <div>
//           <h1 style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Lead Pipeline</h1>
//           <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Manage potential clients & track conversions</p>
//         </div>
//         <div style={{ display: "flex", gap: "0.75rem", width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end" }}>
//           <div className="btn-group" style={{ background: "var(--bg-surface-2)", padding: "0.25rem", borderRadius: "8px" }}>
//             <button 
//               className={`btn btn-sm ${viewMode === "kanban" ? "btn-primary" : ""}`}
//               onClick={() => setViewMode("kanban")}
//               style={{ border: "none", padding: isMobile ? "0.4rem 0.6rem" : "0.5rem 1rem" }}
//             >
//               <LayoutGrid size={16} style={{ marginRight: isMobile ? "0" : "0.5rem" }} /> {!isMobile && "Kanban"}
//             </button>
//             <button 
//               className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : ""}`}
//               onClick={() => setViewMode("list")}
//               style={{ border: "none", padding: isMobile ? "0.4rem 0.6rem" : "0.5rem 1rem" }}
//             >
//               <ListIcon size={16} style={{ marginRight: isMobile ? "0" : "0.5rem" }} /> {!isMobile && "List"}
//             </button>
//           </div>
//           <Link to="/dashboard/leads/new" className="btn btn-primary" style={{ flex: isMobile ? 1 : "initial", textAlign: "center", justifyContent: "center" }}>
//             <Plus size={18} style={{ marginRight: "0.5rem" }} /> Add Lead
//           </Link>
//         </div>
//       </div>

//       {/* Filters */}
//       <div style={{ 
//         display: "flex", 
//         flexDirection: isMobile ? "column" : "row",
//         gap: "1rem", 
//         marginBottom: "2rem", 
//         padding: "1rem", 
//         background: "var(--bg-surface-2)", 
//         borderRadius: "12px" 
//       }}>
//         <div style={{ position: "relative", flex: 2 }}>
//           <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
//           <input 
//             type="text" 
//             placeholder="Search leads..." 
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{ paddingLeft: "40px", width: "100%" }}
//           />
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
//           <Filter size={18} color="var(--text-muted)" />
//           <select 
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             style={{ width: "100%" }}
//           >
//             <option value="All">All Statuses</option>
//             {STATUS_COLUMNS.map(status => (
//               <option key={status} value={status}>{status}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {viewMode === "kanban" ? (
//         /* Kanban View */
//         <div style={{ 
//           display: "flex", 
//           gap: "1rem", 
//           overflowX: "auto", 
//           paddingBottom: "1.5rem",
//           minHeight: "calc(100vh - 350px)",
//           scrollSnapType: isMobile ? "x mandatory" : "none",
//           WebkitOverflowScrolling: "touch"
//         }}>
//           {STATUS_COLUMNS.map(status => {
//             const statusLeads = getLeadsByStatus(status);
//             return (
//               <div key={status} style={{ 
//                 minWidth: isMobile ? "calc(100vw - 3rem)" : "300px", 
//                 maxWidth: isMobile ? "calc(100vw - 3rem)" : "350px",
//                 flex: 1, 
//                 background: "var(--bg-surface-1)", 
//                 borderRadius: "12px",
//                 display: "flex",
//                 flexDirection: "column",
//                 scrollSnapAlign: "center",
//                 boxShadow: "var(--shadow-sm)",
//                 border: "1px solid var(--border)"
//               }}>
//                 <div style={{ 
//                   padding: "1rem", 
//                   display: "flex", 
//                   justifyContent: "space-between", 
//                   alignItems: "center",
//                   borderBottom: `3px solid ${getStatusColor(status)}`
//                 }}>
//                   <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{status}</h3>
//                   <span style={{ 
//                     background: "var(--bg-surface-3)", 
//                     padding: "2px 8px", 
//                     borderRadius: "12px", 
//                     fontSize: "0.8rem" 
//                   }}>{statusLeads.length}</span>
//                 </div>

//                 <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
//                   {statusLeads.map(lead => (
//                     <LeadCard key={lead._id} lead={lead} onStatusChange={(newStatus) => updateStatusMutation.mutate({ id: lead._id, status: newStatus })} />
//                   ))}
//                   {statusLeads.length === 0 && (
//                     <div style={{ 
//                       textAlign: "center", 
//                       padding: "2rem", 
//                       color: "var(--text-muted)", 
//                       fontSize: "0.9rem",
//                       border: "2px dashed var(--border)",
//                       borderRadius: "8px"
//                     }}>
//                       No leads
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         /* List View */
//         <div className="card" style={{ padding: 0, overflowX: "auto" }}>
//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ textAlign: "left", background: "var(--bg-surface-2)", borderBottom: "1px solid var(--border)" }}>
//                 <th style={{ padding: "1rem" }}>Lead</th>
//                 <th style={{ padding: "1rem" }}>Status</th>
//                 <th style={{ padding: "1rem" }}>Inquiry Info</th>
//                 <th style={{ padding: "1rem" }}>Budget</th>
//                 <th style={{ padding: "1rem" }}>Next Follow-up</th>
//                 <th style={{ padding: "1rem" }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredLeads.map(lead => (
//                 <tr key={lead._id} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => navigate(`/dashboard/leads/${lead._id}/edit`)}>
//                   <td style={{ padding: "1rem" }}>
//                     <div style={{ fontWeight: 600 }}>{lead.clientName}</div>
//                     <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{lead.phoneNumber}</div>
//                   </td>
//                   <td style={{ padding: "1rem" }}>
//                     <span style={{ 
//                       padding: "4px 10px", 
//                       borderRadius: "20px", 
//                       fontSize: "0.8rem", 
//                       fontWeight: 600,
//                       background: `${getStatusColor(lead.status)}20`,
//                       color: getStatusColor(lead.status)
//                     }}>
//                       {lead.status}
//                     </span>
//                   </td>
//                   <td style={{ padding: "1rem" }}>
//                     <div style={{ fontSize: "0.9rem" }}>{lead.eventType}</div>
//                     <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Source: {lead.source}</div>
//                   </td>
//                   <td style={{ padding: "1rem" }}>
//                     {lead.budget ? `₹${lead.budget.toLocaleString()}` : "—"}
//                   </td>
//                   <td style={{ padding: "1rem" }}>
//                     {lead.nextFollowUpDate ? (
//                       <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
//                         <Clock size={14} color="var(--color-primary)" />
//                         {format(new Date(lead.nextFollowUpDate), "MMM dd, yyyy")}
//                       </div>
//                     ) : "—"}
//                   </td>
//                   <td style={{ padding: "1rem" }} onClick={e => e.stopPropagation()}>
//                     <div style={{ display: "flex", gap: "0.5rem" }}>
//                       <a href={`tel:${lead.phoneNumber}`} className="btn btn-icon btn-sm" title="Call">
//                         <Phone size={14} />
//                       </a>
//                       <a href={`https://wa.me/${lead.phoneNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-sm" title="WhatsApp">
//                         <MessageCircle size={14} />
//                       </a>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//               {filteredLeads.length === 0 && (
//                 <tr>
//                   <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
//                     No leads found matching your criteria.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// const LeadCard: React.FC<{ lead: Lead; onStatusChange: (status: LeadStatus) => void }> = ({ lead, onStatusChange }) => {
//   const navigate = useNavigate();

//   return (
//     <div 
//       className="card" 
//       style={{ 
//         padding: "1rem", 
//         marginBottom: 0, 
//         cursor: "pointer",
//         borderLeft: `4px solid ${getStatusColor(lead.status)}`,
//         transition: "transform 0.1s, box-shadow 0.1s",
//       }}
//       onClick={() => navigate(`/dashboard/leads/${lead._id}/edit`)}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.transform = "translateY(-2px)";
//         e.currentTarget.style.boxShadow = "var(--shadow-lg)";
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.transform = "translateY(0)";
//         e.currentTarget.style.boxShadow = "var(--shadow-sm)";
//       }}
//     >
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
//         <div>
//           <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "2px" }}>{lead.clientName}</div>
//           <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
//             <span style={{ background: "var(--bg-surface-3)", padding: "1px 6px", borderRadius: "4px", fontSize: "0.7rem" }}>
//               {lead.source}
//             </span>
//           </div>
//         </div>
//         <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
//           <select 
//             value={lead.status} 
//             onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
//             style={{ 
//               opacity: 0, 
//               position: "absolute", 
//               inset: 0, 
//               cursor: "pointer",
//               width: "100%" 
//             }}
//           >
//             {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
//           </select>
//           <button className="btn btn-icon btn-sm">
//             <MoreVertical size={14} />
//           </button>
//         </div>
//       </div>

//       <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
//         <div style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)" }}>
//           <Calendar size={12} /> {lead.eventType}
//         </div>
//         {lead.budget && (
//           <div style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--color-success)", fontWeight: 600 }}>
//             <IndianRupee size={12} /> {lead.budget.toLocaleString()}
//           </div>
//         )}
//       </div>

//       {lead.nextFollowUpDate && (
//         <div style={{ 
//           fontSize: "0.75rem", 
//           display: "flex", 
//           alignItems: "center", 
//           gap: "6px", 
//           color: "var(--color-primary)",
//           background: "var(--color-primary-light)",
//           padding: "4px 8px",
//           borderRadius: "6px",
//           marginBottom: "1rem"
//         }}>
//           <Clock size={12} /> Follow-up: {format(new Date(lead.nextFollowUpDate), "MMM dd")}
//         </div>
//       )}

//       <div style={{ 
//         display: "flex", 
//         justifyContent: "space-between", 
//         alignItems: "center",
//         paddingTop: "0.75rem",
//         borderTop: "1px solid var(--border)"
//       }} onClick={e => e.stopPropagation()}>
//         <div style={{ display: "flex", gap: "0.5rem" }}>
//           <a href={`tel:${lead.phoneNumber}`} className="btn btn-icon btn-sm" style={{ width: "32px", height: "32px" }}>
//             <Phone size={14} />
//           </a>
//           <a href={`https://wa.me/${lead.phoneNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-sm" style={{ width: "32px", height: "32px" }}>
//             <MessageCircle size={14} />
//           </a>
//         </div>
//         <button className="btn btn-sm" onClick={() => navigate(`/dashboard/leads/${lead._id}/edit`)} style={{ padding: "4px 8px", fontSize: "0.75rem" }}>
//           Details <ArrowRight size={12} style={{ marginLeft: "4px" }} />
//         </button>
//       </div>
//     </div>
//   );
// };

// const getStatusColor = (status: LeadStatus): string => {
//   switch (status) {
//     case "New": return "#3b82f6"; // Blue
//     case "Contacted": return "#8b5cf6"; // Purple
//     case "Interested": return "#f59e0b"; // Amber
//     case "Negotiation": return "#ec4899"; // Pink
//     case "Booked": return "#10b981"; // Green
//     case "Lost": return "#ef4444"; // Red
//     default: return "#6b7280"; // Gray
//   }
// };

// export default LeadsPage;
























import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  Phone,
  MessageCircle,
  Calendar,
  IndianRupee,
  Clock,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getLeads, updateLead, type Lead, type LeadStatus } from "../api/lead";
import { format } from "date-fns";

const STATUS_COLUMNS: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Negotiation",
  "Booked",
  "Lost",
];

const getStatusColor = (status: LeadStatus): string => {
  const colors: Record<string, string> = {
    New: "#3b82f6",
    Contacted: "#8b5cf6",
    Interested: "#f59e0b",
    Negotiation: "#ec4899",
    Booked: "#10b981",
    Lost: "#ef4444",
  };
  return colors[status] ?? "#6b7280";
};

/* ─── Injected styles ────────────────────────────────────────────────── */
const STYLES = `
  .leads-root {
    padding: 1.25rem 1.5rem;
    min-height: 100vh;
  }

  /* ── Header ── */
  .leads-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .leads-header-title h1 {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin: 0 0 0.2rem;
    line-height: 1.2;
  }
  .leads-header-title p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0;
  }
  .leads-header-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-shrink: 0;
  }

  /* ── View toggle ── */
  .view-toggle {
    display: flex;
    background: var(--bg-surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 3px;
    gap: 2px;
  }
  .view-toggle button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border: none;
    border-radius: 7px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    color: var(--text-muted);
    transition: all 0.18s ease;
    white-space: nowrap;
  }
  .view-toggle button.active {
    background: var(--color-primary);
    color: #fff;
    box-shadow: 0 2px 8px rgba(139,92,246,0.35);
  }

  /* ── Add Lead button ── */
  .btn-add-lead {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 700;
    background: var(--color-primary);
    color: #fff;
    border: none;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.15s, transform 0.15s;
    box-shadow: 0 3px 12px rgba(139,92,246,0.35);
  }
  .btn-add-lead:hover { opacity: 0.88; transform: translateY(-1px); }

  /* ── Filter bar ── */
  .leads-filter-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
  }
  .search-wrap {
    position: relative;
    flex: 1;
    min-width: 180px;
  }
  .search-wrap svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }
  .search-wrap input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    background: var(--bg-surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-primary);
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .search-wrap input:focus { border-color: var(--color-primary); }
  .filter-select-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px 14px;
    min-width: 160px;
  }
  .filter-select-wrap select {
    border: none;
    background: var(--bg-surface-2);
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 600;
    outline: none;
    cursor: pointer;
    min-width: 120px;
  }
  .filter-select-wrap select option {
    background: var(--bg-surface-2);
    color: var(--text-primary);
  }

  /* ── Stats strip ── */
  .leads-stats {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
  }
  .stat-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--bg-surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 0.8rem;
  }
  .stat-chip .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .stat-chip .label { color: var(--text-muted); }
  .stat-chip .count { font-weight: 700; margin-left: 2px; }

  /* ── Kanban ── */
  .kanban-board {
    display: flex;
    gap: 1.25rem;
    padding-bottom: 2rem;
    min-height: calc(100vh - 340px);
    transition: all 0.3s ease;
  }

  /* Desktop View: Fit all 6 columns if space allows */
  @media (min-width: 1200px) {
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.85rem;
      overflow-x: hidden;
    }
    .kanban-col {
      min-width: 0; /* Allow shrinking */
      max-width: none;
    }
  }

  /* Large Desktop / Ultra-wide: Fixed widths but no scroll */
  @media (min-width: 1600px) {
    .kanban-board {
      gap: 1.25rem;
    }
  }

  /* Tablet/Small Laptop: 2 or 3 column grid or wrap */
  @media (min-width: 769px) and (max-width: 1199px) {
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      overflow-x: hidden;
    }
  }

  /* Mobile: Vertical list as requested */
  @media (max-width: 768px) {
    .kanban-board {
      flex-direction: column;
      overflow-x: hidden;
      padding-bottom: 1rem;
    }
    .kanban-col {
      width: 100%;
      min-width: 100%;
      max-width: 100%;
      margin-bottom: 1rem;
    }
  }

  .kanban-col {
    background: var(--bg-surface-1);
    border-radius: 16px;
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s ease;
  }
  .kanban-col:hover {
    box-shadow: var(--shadow-md);
  }

  .kanban-col-header {
    padding: 14px 16px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .kanban-col-header h3 {
    font-size: 0.9rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.2px;
  }
  .kanban-col-header .badge {
    background: var(--bg-surface-3);
    border: 1px solid var(--border);
    padding: 2px 9px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
  }
  .kanban-col-stripe {
    height: 3px;
    margin: 0 0 0;
  }
  .kanban-col-body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    overflow-y: auto;
    max-height: 68vh;
    scrollbar-width: thin;
  }
  .kanban-empty {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--text-muted);
    font-size: 0.82rem;
    border: 2px dashed var(--border);
    border-radius: 10px;
  }

  /* ── Lead Card ── */
  .lead-card {
    background: var(--bg-surface-2);
    border-radius: 12px;
    border: 1px solid var(--border);
    padding: 14px;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    position: relative;
    overflow: hidden;
  }
  .lead-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
  }
  .lead-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    border-color: var(--color-primary);
  }
  .lead-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }
  .lead-card-name {
    font-weight: 700;
    font-size: 0.95rem;
    margin-bottom: 3px;
    line-height: 1.3;
  }
  .lead-card-source {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 600;
    background: var(--bg-surface-3);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1px 6px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .lead-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
  }
  .lead-meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.78rem;
    color: var(--text-secondary);
  }
  .lead-budget {
    color: #10b981 !important;
    font-weight: 700;
  }
  .lead-followup {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--color-primary);
    background: var(--color-primary-light);
    padding: 5px 9px;
    border-radius: 7px;
    margin-bottom: 12px;
    font-weight: 600;
  }
  .lead-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }
  .lead-card-actions {
    display: flex;
    gap: 6px;
  }
  .icon-btn {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface-3);
    border: 1px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
  }
  .icon-btn:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
  .details-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 7px;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--bg-surface-3);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .details-btn:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

  /* ── Status quick-change overlay ── */
  .status-overlay-btn {
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface-3);
    border: 1px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    flex-shrink: 0;
  }
  .status-overlay-btn select {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    font-size: 1rem;
    background: var(--bg-surface-2);
  }
  .status-overlay-btn select option {
    background: var(--bg-surface-2);
    color: var(--text-primary);
  }

  /* ── List view ── */
  .leads-table-wrap {
    background: var(--bg-surface-1);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    overflow-x: auto;
  }
  .leads-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 700px;
  }
  .leads-table thead tr {
    background: var(--bg-surface-2);
    border-bottom: 1px solid var(--border);
  }
  .leads-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    white-space: nowrap;
  }
  .leads-table tbody tr {
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.12s;
  }
  .leads-table tbody tr:hover { background: var(--bg-surface-2); }
  .leads-table tbody tr:last-child { border-bottom: none; }
  .leads-table td { padding: 14px 16px; vertical-align: middle; }
  .tbl-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 2px; }
  .tbl-phone { font-size: 0.8rem; color: var(--text-muted); }
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
  }
  .status-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .tbl-event { font-size: 0.875rem; margin-bottom: 2px; }
  .tbl-source { font-size: 0.78rem; color: var(--text-muted); }
  .tbl-budget { font-size: 0.9rem; font-weight: 700; color: #10b981; }
  .tbl-followup { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; }
  .tbl-actions { display: flex; gap: 6px; }

  /* ── Loader ── */
  .leads-loader {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    gap: 1rem;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .leads-root { padding: 1rem; }
    .leads-header-title h1 { font-size: 1.4rem; }
    .view-toggle button span { display: none; }
    .view-toggle button { padding: 7px 10px; }
    .leads-stats { gap: 0.5rem; overflow-x: auto; padding-bottom: 5px; width: 100%; }
    .stat-chip { padding: 6px 10px; font-size: 0.75rem; flex-shrink: 0; }
  }

  @media (max-width: 480px) {
    .leads-root { padding: 0.75rem; }
    .btn-add-lead span { display: none; }
    .btn-add-lead { padding: 8px 12px; }
    .leads-header { flex-direction: column; align-items: stretch; }
    .leads-header-actions { justify-content: space-between; }
  }
`;

/* ─── Main component ─────────────────────────────────────────────────── */
const LeadsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => getLeads(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateLead(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phoneNumber && lead.phoneNumber.includes(searchTerm));
    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getLeadsByStatus = (status: LeadStatus) =>
    filteredLeads.filter((lead) => lead.status === status);

  if (isLoading) {
    return (
      <div className="leads-loader">
        <div className="loader" />
        <span>Loading leads…</span>
      </div>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="leads-root">

        {/* ── Header ── */}
        <div className="leads-header">
          <div className="leads-header-title">
            <h1>Lead Pipeline</h1>
            <p>Manage potential clients &amp; track conversions</p>
          </div>
          <div className="leads-header-actions">
            <div className="view-toggle">
              <button
                className={viewMode === "kanban" ? "active" : ""}
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid size={15} />
                <span>Kanban</span>
              </button>
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                <ListIcon size={15} />
                <span>List</span>
              </button>
            </div>
            <Link to="/dashboard/leads/new" className="btn-add-lead">
              <Plus size={16} />
              <span>Add Lead</span>
            </Link>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="leads-stats">
          {STATUS_COLUMNS.map((s) => {
            const count = leads.filter((l) => l.status === s).length;
            return (
              <div className="stat-chip" key={s}>
                <span className="dot" style={{ background: getStatusColor(s) }} />
                <span className="label">{s}</span>
                <span className="count">{count}</span>
              </div>
            );
          })}
        </div>

        {/* ── Filter bar ── */}
        <div className="leads-filter-bar">
          <div className="search-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select-wrap">
            <SlidersHorizontal size={15} color="var(--text-muted)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {STATUS_COLUMNS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Views ── */}
        {viewMode === "kanban" ? (
          <div className="kanban-board">
            {STATUS_COLUMNS.map((status) => {
              const colLeads = getLeadsByStatus(status);
              const color = getStatusColor(status);
              return (
                <div className="kanban-col" key={status}>
                  <div className="kanban-col-header">
                    <h3>{status}</h3>
                    <span className="badge">{colLeads.length}</span>
                  </div>
                  <div
                    className="kanban-col-stripe"
                    style={{ background: color }}
                  />
                  <div className="kanban-col-body">
                    {colLeads.length === 0 ? (
                      <div className="kanban-empty">No leads here</div>
                    ) : (
                      colLeads.map((lead) => (
                        <LeadCard
                          key={lead._id}
                          lead={lead}
                          onStatusChange={(ns) =>
                            updateStatusMutation.mutate({ id: lead._id, status: ns })
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="leads-table-wrap">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Event</th>
                  <th>Budget</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      No leads match your search.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => navigate(`/dashboard/leads/${lead._id}/edit`)}
                    >
                      <td>
                        <div className="tbl-name">{lead.clientName}</div>
                        <div className="tbl-phone">{lead.phoneNumber}</div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background: `${getStatusColor(lead.status)}18`,
                            color: getStatusColor(lead.status),
                          }}
                        >
                          <span
                            className="status-badge-dot"
                            style={{ background: getStatusColor(lead.status) }}
                          />
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        <div className="tbl-event">{lead.eventType}</div>
                        <div className="tbl-source">via {lead.source}</div>
                      </td>
                      <td>
                        {lead.budget ? (
                          <span className="tbl-budget">
                            ₹{lead.budget.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td>
                        {lead.nextFollowUpDate ? (
                          <div className="tbl-followup">
                            <Clock size={13} color="var(--color-primary)" />
                            {format(new Date(lead.nextFollowUpDate), "MMM dd, yyyy")}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="tbl-actions">
                          <a href={`tel:${lead.phoneNumber}`} className="icon-btn" title="Call">
                            <Phone size={14} />
                          </a>
                          <a
                            href={`https://wa.me/${lead.phoneNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn"
                            title="WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

/* ─── Lead Card ──────────────────────────────────────────────────────── */
const LeadCard: React.FC<{
  lead: Lead;
  onStatusChange: (status: LeadStatus) => void;
}> = ({ lead, onStatusChange }) => {
  const navigate = useNavigate();
  const color = getStatusColor(lead.status);

  return (
    <div
      className="lead-card"
      style={{ borderLeftColor: color }}
      onClick={() => navigate(`/dashboard/leads/${lead._id}/edit`)}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          background: color,
          borderRadius: "3px 0 0 3px",
        }}
      />

      {/* Top row */}
      <div className="lead-card-top" style={{ paddingLeft: "4px" }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
          <div className="lead-card-name">{lead.clientName}</div>
          <span className="lead-card-source">{lead.source}</span>
        </div>
        <div
          className="status-overlay-btn"
          onClick={(e) => e.stopPropagation()}
          title="Change status"
        >
          <MoreVertical size={13} />
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
          >
            {STATUS_COLUMNS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meta */}
      <div className="lead-card-meta" style={{ paddingLeft: "4px" }}>
        <span className="lead-meta-item">
          <Calendar size={11} />
          {lead.eventType}
        </span>
        {lead.budget ? (
          <span className="lead-meta-item lead-budget">
            <IndianRupee size={11} />
            {lead.budget.toLocaleString()}
          </span>
        ) : null}
      </div>

      {/* Follow-up */}
      {lead.nextFollowUpDate && (
        <div className="lead-followup">
          <Clock size={11} />
          Follow-up: {format(new Date(lead.nextFollowUpDate), "MMM dd, yyyy")}
        </div>
      )}

      {/* Footer */}
      <div className="lead-card-footer" onClick={(e) => e.stopPropagation()}>
        <div className="lead-card-actions">
          <a href={`tel:${lead.phoneNumber}`} className="icon-btn" title="Call">
            <Phone size={13} />
          </a>
          <a
            href={`https://wa.me/${lead.phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            title="WhatsApp"
          >
            <MessageCircle size={13} />
          </a>
        </div>
        <button
          className="details-btn"
          onClick={() => navigate(`/dashboard/leads/${lead._id}/edit`)}
        >
          Details
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};

export default LeadsPage;