// import { useState, useEffect, useCallback } from "react";
// import { createPortal } from "react-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getDashboardOverview } from "@/api/dashboard";
// import { getGoogleAuthUrl, syncAllRecords } from "@/api/googleAuth";
// import { getMe } from "@/api/auth";
// import {
//   TrendingUp,
//   CreditCard,
//   AlertCircle,
//   Calendar,
//   BarChart3,
//   Baby,
//   Megaphone,
//   Building2,
//   CheckCircle2,
//   RefreshCw,
//   X,
//   Clock,
//   Flag,
//   Plus,
//   Trash2,
//   Pencil,
// } from "lucide-react";
// import { useSearchParams } from "react-router-dom";
// import StatCard from "@/components/StatCard";
// import {
//   getStudioExpenses,
//   createStudioExpense,
//   updateStudioExpense,
//   deleteStudioExpense,
//   type StudioExpense
// } from "@/api/studioExpenses";

// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";

// // ─── helpers ────────────────────────────────────────────────────────────────

// const formatCurrency = (value: number) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     minimumFractionDigits: 0,
//   }).format(value);

// const formatDate = (iso: string) =>
//   new Date(iso).toLocaleString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     timeZone: "Asia/Kolkata",
//   });

// const formatDateOnly = (iso: string) =>
//   new Date(iso).toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     timeZone: "Asia/Kolkata",
//   });

// function useIsMobile() {
//   const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
//   const [isTablet, setIsTablet] = useState(() => window.innerWidth < 1024);
//   useEffect(() => {
//     const handler = () => {
//       setIsMobile(window.innerWidth < 768);
//       setIsTablet(window.innerWidth < 1024);
//     };
//     window.addEventListener("resize", handler);
//     return () => window.removeEventListener("resize", handler);
//   }, []);
//   return { isMobile, isTablet };
// }

// // ─── event detail modal ──────────────────────────────────────────────────────

// interface EventDetail {
//   title: string;
//   start: string;
//   type: string;
//   status: string;
//   isDeadline: boolean;
//   backgroundColor: string;
// }

// function EventModal({
//   event,
//   onClose,
// }: {
//   event: EventDetail;
//   onClose: () => void;
// }) {
//   return createPortal(
//     <div
//       onClick={onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(0,0,0,0.6)",
//         zIndex: 2000,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "1rem",
//         backdropFilter: "blur(8px)",
//         animation: "fadeIn 0.3s ease-out"
//       }}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           background: "var(--bg-surface)",
//           borderRadius: "24px",
//           padding: "2rem",
//           width: "100%",
//           maxWidth: "420px",
//           border: "1px solid var(--border-strong)",
//           boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
//           position: "relative",
//           overflow: "hidden",
//           animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
//         }}
//       >
//         {/* Color Accent Bar */}
//         <div style={{ position: "absolute", top: 0, left: 0, width: "6px", height: "100%", background: event.backgroundColor }} />

//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: 1, minWidth: 0 }}>
//             <div style={{ width: 14, height: 14, borderRadius: "50%", background: event.backgroundColor, boxShadow: `0 0 10px ${event.backgroundColor}66`, flexShrink: 0 }} />
//             <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
//               {event.title}
//             </span>
//           </div>
//           <button
//             onClick={onClose}
//             className="btn-ghost"
//             style={{ padding: "0.4rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
//           <span style={{
//             display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.8rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 700,
//             background: event.isDeadline ? "rgba(239,68,68,0.15)" : "rgba(99,179,237,0.15)",
//             color: event.isDeadline ? "#ff5f5f" : "#60a5fa",
//             border: `1px solid ${event.isDeadline ? "rgba(239,68,68,0.2)" : "rgba(99,179,237,0.2)"}`
//           }}>
//             {event.isDeadline ? <><Flag size={14} /> Deadline</> : <><Clock size={14} /> Shoot Event</>}
//           </span>
//           <span style={{
//             display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.8rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600,
//             background: "var(--bg-surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)"
//           }}>
//             {event.type}
//           </span>
//         </div>

//         <div style={{
//           padding: "1.25rem", background: "linear-gradient(135deg, var(--bg-surface-2), var(--bg-surface-3))",
//           borderRadius: "16px", fontSize: "0.95rem", color: "var(--text-primary)", border: "1px solid var(--border)",
//           display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem"
//         }}>
//           <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.5rem", borderRadius: "10px" }}>
//             <Calendar size={18} color="var(--color-primary)" />
//           </div>
//           <div style={{ display: "flex", flexDirection: "column" }}>
//             <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Scheduled Date</span>
//             <span style={{ fontWeight: 600 }}>{event.isDeadline ? formatDateOnly(event.start) : formatDate(event.start)}</span>
//           </div>
//         </div>

//         {event.status && (
//           <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", background: "var(--bg-surface-2)", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
//             <span style={{ color: "var(--text-muted)" }}>Current Status:</span> <strong style={{ color: "var(--text-primary)", marginLeft: "0.4rem" }}>{event.status}</strong>
//           </div>
//         )}
//       </div>
//     </div>,
//     document.body
//   );
// }

// // ─── calendar legend ─────────────────────────────────────────────────────────

// function CalendarLegend() {
//   const items = [
//     { label: "Maternity Shoot", color: "#f472b6", gradient: "linear-gradient(135deg, #f472b6, #fb7185)", icon: <Baby size={14} /> },
//     { label: "Influencer Shoot", color: "#60a5fa", gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)", icon: <Megaphone size={14} /> },
//     { label: "Corporate Event", color: "#4ade80", gradient: "linear-gradient(135deg, #4ade80, #10b981)", icon: <Building2 size={14} /> },
//     { label: "Delivery Deadline", color: "#ef4444", icon: <Flag size={14} />, dashed: true },
//   ];
//   return (
//     <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
//       {items.map((item) => (
//         <div
//           key={item.label}
//           style={{
//             display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600,
//             cursor: "default"
//           }}
//         >
//           <div style={{
//             display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%",
//             background: item.dashed ? "rgba(239, 68, 68, 0.1)" : item.gradient, border: item.dashed ? `2px dashed ${item.color}` : "none", color: item.dashed ? item.color : "#fff",
//             boxShadow: item.dashed ? "none" : `0 4px 12px ${item.color}44`
//           }}>
//             {item.icon}
//           </div>
//           <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── main page ───────────────────────────────────────────────────────────────

// export default function DashboardOverviewPage() {
//   const [searchParams] = useSearchParams();
//   const googleConnected = searchParams.get("googleConnected");
//   const { isMobile, isTablet } = useIsMobile();
//   const queryClient = useQueryClient();

//   const [syncing, setSyncing] = useState(false);
//   const [syncMessage, setSyncMessage] = useState("");
//   const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
//   const [visibleShoots, setVisibleShoots] = useState(3);
//   const [visibleDeadlines, setVisibleDeadlines] = useState(3);
//   const [visibleCompleted, setVisibleCompleted] = useState(3);
//   const [activeTab, setActiveTab] = useState<'shoots' | 'deadlines'>('shoots');

//   // Studio Expense State
//   const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
//   const [editingExpense, setEditingExpense] = useState<StudioExpense | null>(null);
//   const [expenseForm, setExpenseForm] = useState({
//     amount: 0,
//     date: new Date().toISOString().split('T')[0],
//     category: "Other",
//     notes: ""
//   });

//   const { data: userData } = useQuery({ queryKey: ["user-me"], queryFn: getMe });
//   const { data, isLoading, isError, error } = useQuery({ queryKey: ["dashboard-overview"], queryFn: getDashboardOverview });
//   const { data: expensesData } = useQuery({ queryKey: ["studio-expenses"], queryFn: getStudioExpenses });

//   const createExpenseMutation = useMutation({
//     mutationFn: createStudioExpense,
//     onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["studio-expenses"] }); setIsExpenseModalOpen(false); resetExpenseForm(); }
//   });

//   const updateExpenseMutation = useMutation({
//     mutationFn: ({ id, data }: { id: string; data: any }) => updateStudioExpense(id, data),
//     onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["studio-expenses"] }); setIsExpenseModalOpen(false); resetExpenseForm(); }
//   });

//   const deleteExpenseMutation = useMutation({
//     mutationFn: deleteStudioExpense,
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-expenses"] })
//   });

//   const resetExpenseForm = () => {
//     setExpenseForm({ amount: 0, date: new Date().toISOString().split('T')[0], category: "Other", notes: "" });
//     setEditingExpense(null);
//   };

//   const handleEditExpense = (expense: StudioExpense) => {
//     setEditingExpense(expense);
//     setExpenseForm({ amount: expense.amount, date: new Date(expense.date).toISOString().split('T')[0], category: expense.category || "Other", notes: expense.notes || "" });
//     setIsExpenseModalOpen(true);
//   };

//   const handleSyncAll = async () => {
//     setSyncing(true);
//     setSyncMessage("");
//     try {
//       const result = await syncAllRecords();
//       setSyncMessage(result.message);
//     } catch (err: any) {
//       setSyncMessage(err.response?.data?.message || "Sync failed");
//     } finally {
//       setSyncing(false);
//     }
//   };

//   const handleConnectGoogle = async () => {
//     try {
//       const { url } = await getGoogleAuthUrl();
//       window.location.href = url;
//     } catch (err) {
//       console.error("Failed to get Google Auth URL", err);
//     }
//   };

//   const handleEventClick = useCallback((info: any) => {
//     const ep = info.event.extendedProps;
//     setSelectedEvent({
//       title: info.event.title,
//       start: info.event.startStr,
//       type: ep.type,
//       status: ep.status,
//       isDeadline: !!ep.isDeadline,
//       backgroundColor: info.event.backgroundColor,
//     });
//   }, []);

//   const renderEventContent = useCallback((info: any) => {
//     const { isDeadline, type } = info.event.extendedProps;
//     const icon = isDeadline ? "🚩" : type === "Maternity" ? "🤱" : type === "Influencer" ? "📣" : "🏢";
//     const backgroundColor = info.event.backgroundColor;

//     // Use a more vibrant semi-transparent background for the event
//     const eventBg = isDeadline ? "rgba(239, 68, 68, 0.15)" : `${backgroundColor}${Math.round(0.2 * 255).toString(16).padStart(2, '0')}`;

//     return (
//       <div style={{
//         display: "flex", alignItems: "center", gap: "4px", overflow: "hidden", padding: "2px 6px", borderRadius: "4px",
//         background: isDeadline ? "rgba(239, 68, 68, 0.15)" : eventBg,
//         backdropFilter: "blur(2px)", borderLeft: `3px solid ${backgroundColor}`, fontSize: "0.75rem", fontWeight: isDeadline ? 700 : 500,
//         height: "100%", width: "100%", color: isDeadline ? "#ff5f5f" : "var(--text-primary)"
//       }}>
//         <span style={{ fontSize: "10px", flexShrink: 0, opacity: 0.9 }}>{icon}</span>
//         <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{info.event.title}</span>
//       </div>
//     );
//   }, []);

//   if (isLoading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Loading Dashboard...</div>;
//   if (isError) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-danger)" }}>Error: {(error as Error).message}</div>;
//   if (!data) return null;

//   const { globalTotals, categorySplit, calendarEvents, upcomingShoots = [], upcomingDeadlines = [], recentlyCompleted = [], leadStats = { booked: 0 } } = data;
//   const isConnected = userData?.user?.googleCalendarConnected;

//   return (
//     <div className="dashboard-overview animate-fade-up">
//       <header style={{ marginBottom: "2.5rem" }}>
//         <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: "1.5rem" }}>
//           <div>
//             <h1 style={{ fontSize: isMobile ? "1.75rem" : "2.5rem", fontWeight: 800, margin: "0 0 0.5rem 0", background: "linear-gradient(to right, var(--color-primary), var(--color-accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//               CRM Overview
//             </h1>
//             <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? "0.9rem" : "1rem" }}>Unified metrics across all modules.</p>
//           </div>

//           <div style={{ display: "flex", gap: "0.75rem", width: isMobile ? "100%" : "auto" }}>
//             {isConnected ? (
//               <div style={{ display: "flex", gap: "0.75rem", width: isMobile ? "100%" : "auto" }}>
//                 <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.6rem 1rem", borderRadius: "10px", background: "rgba(74, 222, 128, 0.1)", color: "var(--color-success)", border: "1px solid rgba(74, 222, 128, 0.2)", fontSize: "0.85rem", fontWeight: 600 }}>
//                   <CheckCircle2 size={16} /> <span>Connected</span>
//                 </div>
//                 <button onClick={handleSyncAll} disabled={syncing} className="btn-ghost" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.6rem 1rem", borderRadius: "10px" }}>
//                   <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
//                   <span>Sync</span>
//                 </button>
//               </div>
//             ) : (
//               <button onClick={handleConnectGoogle} className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "10px" }}>
//                 <Calendar size={18} /> Connect Google
//               </button>
//             )}
//           </div>
//         </div>

//         {(googleConnected || searchParams.get("googleError") || syncMessage) && (
//           <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", background: "var(--bg-surface-2)", color: searchParams.get("googleError") ? "var(--color-danger)" : "var(--color-success)", fontSize: "0.9rem", border: "1px solid var(--border)" }}>
//             {searchParams.get("googleError") ? `Error: ${searchParams.get("googleError")}` : syncMessage || "Google Calendar connected!"}
//           </div>
//         )}
//       </header>

//       {/* ── 6-column stats row ── */}
//       <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(6, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
//         <StatCard title="Total Revenue" value={formatCurrency(globalTotals.totalRevenue)} icon={<TrendingUp size={20} />} color="var(--color-primary)" description="Gross contract value" />
//         <StatCard title="Total Received" value={formatCurrency(globalTotals.totalAdvance)} icon={<CreditCard size={20} />} color="var(--color-success)" description="Payments collected" />
//         <StatCard title="Total Due" value={formatCurrency(globalTotals.totalBalance)} icon={<AlertCircle size={20} />} color="var(--color-warning)" description="Pending balances" />
//         <StatCard title="Total Expenses" value={formatCurrency(globalTotals.totalExpenses)} icon={<CreditCard size={20} />} color="var(--color-danger)" description="Records + Studio" />
//         <StatCard title="Total Profit" value={formatCurrency(globalTotals.totalProfit)} icon={<BarChart3 size={20} />} color="var(--color-accent)" description="Revenue - Expenses" />
//         <StatCard title="Booked Leads" value={leadStats.booked} icon={<Megaphone size={20} />} color="#3b82f6" description="Converted leads" />
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "repeat(2, 1fr)", gap: "2rem", marginBottom: "2.5rem" }}>
//         {/* Revenue Breakdown */}
//         <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
//             <BarChart3 size={20} color="var(--color-primary)" />
//             <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Revenue Breakdown</h2>
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
//             {categorySplit.map((cat: any) => (
//               <div key={cat.name}>
//                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
//                   <span style={{ fontWeight: 600 }}>{cat.name}</span>
//                   <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
//                     <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{formatCurrency(cat.revenue)}</span>
//                     <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>({globalTotals.totalRevenue > 0 ? Math.round((cat.revenue / globalTotals.totalRevenue) * 100) : 0}%)</span>
//                   </div>
//                 </div>
//                 <div style={{ height: "6px", background: "var(--bg-surface-3)", borderRadius: "3px", overflow: "hidden" }}>
//                   <div style={{ height: "100%", width: `${globalTotals.totalRevenue > 0 ? (cat.revenue / globalTotals.totalRevenue) * 100 : 0}%`, background: cat.color, borderRadius: "3px", transition: "width 0.6s ease" }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Reminders: Shoots & Deadlines */}
//         <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//               <Calendar size={20} color="var(--color-warning)" />
//               <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Upcoming</h2>
//             </div>
//             <div style={{ display: "flex", background: "var(--bg-surface-3)", padding: "3px", borderRadius: "8px" }}>
//               <button onClick={() => setActiveTab('shoots')} style={{ padding: "0.3rem 0.6rem", fontSize: "0.7rem", fontWeight: 700, borderRadius: "6px", border: "none", cursor: "pointer", background: activeTab === 'shoots' ? "var(--bg-surface)" : "transparent", color: activeTab === 'shoots' ? "var(--color-primary)" : "var(--text-muted)" }}>Shoots</button>
//               <button onClick={() => setActiveTab('deadlines')} style={{ padding: "0.3rem 0.6rem", fontSize: "0.7rem", fontWeight: 700, borderRadius: "6px", border: "none", cursor: "pointer", background: activeTab === 'deadlines' ? "var(--bg-surface)" : "transparent", color: activeTab === 'deadlines' ? "var(--color-primary)" : "var(--text-muted)" }}>Deadlines</button>
//             </div>
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
//             <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Upcoming {activeTab}</div>
//             {(activeTab === 'shoots' ? upcomingShoots : upcomingDeadlines).slice(0, visibleShoots).map((item: any) => (
//               <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem", background: "var(--bg-surface-2)", borderRadius: "12px", border: "1px solid var(--border)" }}>
//                 <div style={{ width: 36, height: 36, borderRadius: "25%", background: activeTab === 'shoots' ? "rgba(255,255,255,0.03)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: activeTab === 'shoots' ? "var(--text-muted)" : "var(--color-danger)" }}>
//                   {activeTab === 'shoots' ? (item.type === 'Maternity' ? <Baby size={18} /> : item.type === 'Influencer' ? <Megaphone size={18} /> : <Building2 size={18} />) : <Flag size={18} />}
//                 </div>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.clientName}</div>
//                   <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.type} · {new Date(item.date).toLocaleDateString("en-IN")}</div>
//                 </div>
//                 <div style={{ fontSize: "0.75rem", fontWeight: 800, padding: "0.25rem 0.5rem", borderRadius: "6px", background: item.daysRemaining <= 1 ? "var(--color-danger)" : "var(--bg-surface-3)", color: item.daysRemaining <= 1 ? "#fff" : "var(--text-secondary)" }}>
//                   {item.daysRemaining === 0 ? "Today" : `${item.daysRemaining}d`}
//                 </div>
//               </div>
//             ))}
//             {(activeTab === 'shoots' ? upcomingShoots : upcomingDeadlines).length === 0 && (
//               <div style={{ padding: "2rem", textAlign: "center", background: "var(--bg-surface-2)", borderRadius: "12px", border: "1px dashed var(--border)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
//                 No upcoming {activeTab} for the next 7 days.
//               </div>
//             )}
//             {(activeTab === 'shoots' ? upcomingShoots : upcomingDeadlines).length > 3 && (
//               <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.5rem" }}>
//                 <AlertCircle size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} />
//                 Criteria: Active (Not Completed/Cancelled) items for the next 7 days.
//               </div>
//             )}
//           </div>
//         </section>
//       </div>

//       {/* Recently Completed Section */}
//       <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem", marginBottom: "2.5rem" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//             <div style={{ background: "rgba(74, 222, 128, 0.1)", color: "var(--color-success)", padding: "0.4rem", borderRadius: "50%", display: "flex" }}>
//               <CheckCircle2 size={20} />
//             </div>
//             <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Recently Completed</h2>
//           </div>
//           {recentlyCompleted.length > 3 && (
//             <button className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", borderRadius: "8px", color: "var(--color-primary)" }}>
//               View More (+{recentlyCompleted.length - 3})
//             </button>
//           )}
//         </div>

//         <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
//           {recentlyCompleted.slice(0, 3).map((item: any) => (
//             <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-surface-2)", borderRadius: "16px", border: "1px solid var(--border)" }}>
//               <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-success)", border: "1px solid var(--border)" }}>
//                 <CheckCircle2 size={24} />
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                   <div>
//                     <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>{item.clientName}</div>
//                     <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.type} · {new Date(item.date).toLocaleDateString("en-IN")}</div>
//                   </div>
//                   <div style={{ textAlign: "right" }}>
//                     <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>{formatCurrency(item.total)}</div>
//                     <div style={{ fontSize: "0.7rem", fontWeight: 900, color: item.paymentStatus === 'Done' ? "var(--color-success)" : "var(--color-danger)", letterSpacing: "0.05em", marginTop: "2px" }}>
//                       PAYMENT: {item.paymentStatus}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//           {recentlyCompleted.length === 0 && (
//             <div style={{ padding: "2rem", textAlign: "center", background: "var(--bg-surface-2)", borderRadius: "12px", border: "1px dashed var(--border)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
//               No recently completed items.
//             </div>
//           )}
//         </div>
//         <div style={{ marginTop: "1.25rem", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
//           <AlertCircle size={14} color="var(--color-success)" />
//           <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Items completed or cancelled in the last 7 days.</span>
//         </div>
//       </section>

//       <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem", marginBottom: "2.5rem" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//             <Calendar size={20} color="var(--color-primary)" />
//             <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Schedule & Deadlines</h2>
//           </div>
//         </div>
//         <CalendarLegend />
//         <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
//           <FullCalendar
//             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//             timeZone="Asia/Kolkata"
//             initialView={isMobile ? "dayGridMonth" : isTablet ? "dayGridMonth" : "dayGridMonth"}
//             headerToolbar={{
//               left: "prev,next today",
//               center: "title",
//               right: isMobile ? "" : "dayGridMonth,timeGridWeek,timeGridDay"
//             }}
//             events={calendarEvents || []}
//             eventContent={renderEventContent}
//             eventClick={handleEventClick}
//             height="auto"
//             contentHeight={isMobile ? 400 : 640}
//             dayMaxEvents={isMobile ? 2 : 3}
//             nowIndicator={true}
//           />
//         </div>
//       </section>

//       {/* Studio Expenses Section */}
//       <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//             <CreditCard size={20} color="var(--color-danger)" />
//             <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Studio Expenses</h2>
//           </div>
//           <button onClick={() => { resetExpenseForm(); setIsExpenseModalOpen(true); }} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem" }}>
//             <Plus size={16} /> Add
//           </button>
//         </div>

//         {isMobile ? (
//           <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
//             {expensesData?.map((expense: StudioExpense) => (
//               <div key={expense._id} style={{ background: "var(--bg-surface-2)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
//                   <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(expense.date).toLocaleDateString("en-IN")}</span>
//                   <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", background: "var(--bg-surface-3)", fontSize: "0.75rem", fontWeight: 600 }}>{expense.category}</span>
//                 </div>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   <div style={{ fontWeight: 800, color: "var(--color-danger)", fontSize: "1.1rem" }}>{formatCurrency(expense.amount)}</div>
//                   <div style={{ display: "flex", gap: "0.5rem" }}>
//                     <button onClick={() => handleEditExpense(expense)} style={{ background: "var(--bg-surface-3)", border: "none", color: "var(--color-primary)", padding: "0.5rem", borderRadius: "8px", cursor: "pointer" }}><Pencil size={14} /></button>
//                     <button onClick={() => { if (confirm("Delete this expense?")) deleteExpenseMutation.mutate(expense._id!); }} style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "var(--color-danger)", padding: "0.5rem", borderRadius: "8px", cursor: "pointer" }}><Trash2 size={14} /></button>
//                   </div>
//                 </div>
//                 {expense.notes && <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>{expense.notes}</div>}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
//               <thead>
//                 <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
//                   <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Date</th>
//                   <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Category</th>
//                   <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Amount</th>
//                   <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Notes</th>
//                   <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {expensesData?.map((expense: StudioExpense) => (
//                   <tr key={expense._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
//                     <td style={{ padding: "1rem" }}>{new Date(expense.date).toLocaleDateString("en-IN")}</td>
//                     <td style={{ padding: "1rem" }}><span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", background: "var(--bg-surface-3)", fontSize: "0.75rem" }}>{expense.category}</span></td>
//                     <td style={{ padding: "1rem", fontWeight: 700, color: "var(--color-danger)" }}>{formatCurrency(expense.amount)}</td>
//                     <td style={{ padding: "1rem", color: "var(--text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{expense.notes}</td>
//                     <td style={{ padding: "1rem", textAlign: "right" }}>
//                       <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
//                         <button onClick={() => handleEditExpense(expense)} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer" }}><Pencil size={16} /></button>
//                         <button onClick={() => { if (confirm("Delete this expense?")) deleteExpenseMutation.mutate(expense._id!); }} style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer" }}><Trash2 size={16} /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>

//       {/* Expense Modal */}
//       {isExpenseModalOpen && (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
//           <div style={{ background: "var(--bg-surface)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "450px", border: "1px solid var(--border)" }}>
//             <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem" }}>{editingExpense ? "Edit Expense" : "Add Studio Expense"}</h3>
//             <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
//               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//                 <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Amount (INR)</label>
//                 <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface-2)" }} />
//               </div>
//               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//                 <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Date</label>
//                 <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface-2)" }} />
//               </div>
//               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//                 <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Category</label>
//                 <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface-2)" }}>
//                   <option value="Rent">Rent</option>
//                   <option value="Electricity">Electricity</option>
//                   <option value="Equipment">Equipment</option>
//                   <option value="Staff">Staff</option>
//                   <option value="Marketing">Marketing</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//                 <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Notes</label>
//                 <textarea value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface-2)", minHeight: "80px" }} />
//               </div>
//               <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
//                 <button onClick={() => setIsExpenseModalOpen(false)} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "none", cursor: "pointer" }}>Cancel</button>
//                 <button
//                   onClick={() => editingExpense ? updateExpenseMutation.mutate({ id: editingExpense._id!, data: expenseForm }) : createExpenseMutation.mutate(expenseForm)}
//                   disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
//                   className="btn-primary"
//                   style={{ flex: 1, padding: "0.75rem", borderRadius: "8px" }}
//                 >
//                   {editingExpense ? "Update" : "Save"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

//       <style dangerouslySetInnerHTML={{
//         __html: `
//         .fc-theme-standard td, .fc-theme-standard th { border-color: var(--border) !important; }
//         .fc-col-header-cell { padding: 8px 0 !important; background: var(--bg-surface-2) !important; }
//         .fc-col-header-cell-cushion { color: var(--text-secondary) !important; text-decoration: none !important; font-size: 0.7rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
//         .fc-button-primary { background: var(--bg-surface-2) !important; border: 1px solid var(--border) !important; color: var(--text-primary) !important; font-size: 0.75rem !important; font-weight: 600 !important; border-radius: 8px !important; padding: 6px 12px !important; text-transform: capitalize !important; transition: all 0.2s ease !important; }
//         .fc-button-primary:hover { background: var(--bg-surface-3) !important; border-color: var(--border-strong) !important; transform: translateY(-1px); }
//         .fc-button-active { background: var(--color-primary) !important; color: #fff !important; border-color: var(--color-primary) !important; box-shadow: 0 4px 12px var(--color-primary-glow) !important; }
//         .fc-day-today { background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.05) !important; }
//         .fc-daygrid-day-number { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); padding: 8px !important; text-decoration: none !important; }
//         .fc-daygrid-day:hover { background: rgba(255,255,255,0.02); }
//         .fc-event { border: none !important; background: transparent !important; margin: 1px 2px !important; }
//         .fc-toolbar-title { font-size: 1.1rem !important; fontWeight: 700 !important; font-family: var(--font-display) !important; }
//         .fc-scrollgrid { border-radius: 12px !important; overflow: hidden !important; border: 1px solid var(--border) !important; }

//         @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

//         @media (max-width: 768px) {
//           .fc-header-toolbar { flex-direction: column; gap: 1rem; }
//           .fc-toolbar-chunk { display: flex; justify-content: center; width: 100%; }
//         }
//       ` }} />
//     </div>
//   );
// }




















import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboardOverview } from "@/api/dashboard";
import { getGoogleAuthUrl, syncAllRecords } from "@/api/googleAuth";
import { getMe } from "@/api/auth";
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  Calendar,
  BarChart3,
  Baby,
  Megaphone,
  Building2,
  CheckCircle2,
  RefreshCw,
  X,
  Clock,
  Flag,
  Plus,
  Trash2,
  Pencil,
  Download,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import StatCard from "@/components/StatCard";
import {
  getStudioExpenses,
  createStudioExpense,
  updateStudioExpense,
  deleteStudioExpense,
  type StudioExpense
} from "@/api/studioExpenses";
import { exportToExcel } from "@/utils/exportToExcel";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

const formatDateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const handler = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return { isMobile, isTablet };
}

// ─── birth date reminders ───────────────────────────────────────────────────

function BirthDateReminderCard({ reminder }: { reminder: any }) {
  const getDisplayInfo = (days: number) => {
    const messages: Record<number, string> = {
      0: "IT'S THE BIG DAY! 🎉",
      1: "Tomorrow is the day! 🤱",
      2: "Only 2 days remaining! ⏳",
      3: "Counting down: 3 days! 👶",
      4: "Just 4 days left! 💖",
      5: "High five! 5 days to go ✋",
      6: "6 days remaining! 🎀",
      7: "Almost there! 7 days. ✨",
    };

    const text = messages[days] || `${days} days remains`;

    if (days === 0) return { text, color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", pulse: true };
    if (days === 1) return { text, color: "#f87171", bg: "rgba(248, 113, 113, 0.1)", border: "rgba(248, 113, 113, 0.3)" };
    if (days <= 3) return { text, color: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.3)" };
    return { text, color: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)", border: "rgba(96, 165, 250, 0.3)" };
  };

  const info = getDisplayInfo(reminder.daysRemaining);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem",
      background: info.bg, borderRadius: "20px", border: `2px solid ${info.border}`,
      boxShadow: reminder.daysRemaining === 0 ? "0 0 25px rgba(239, 68, 68, 0.25)" : "none",
      animation: info.pulse ? "pulse-red 1.5s infinite" : "none",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "default",
      width: "100%",
      flexWrap: "wrap", // Allow wrapping for very small screens
    }}
      className="reminder-card-hover"
    >
      <div style={{
        display: "flex", alignItems: "center", gap: "1rem", flex: "1 1 auto", minWidth: "200px"
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "16px", background: "var(--bg-surface)",
          display: "flex", alignItems: "center", justifyContent: "center", color: info.color, border: `1px solid ${info.border}`,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)", flexShrink: 0, alignSelf: "flex-start", marginTop: "0.25rem"
        }}>
          <Baby size={28} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ fontSize: "0.85rem", display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 700, minWidth: "55px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Client</span>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)", lineHeight: "1.2" }}>{reminder.clientName}</span>
          </div>
          <div style={{ fontSize: "0.85rem", display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 700, minWidth: "55px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Baby</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{reminder.babyName}</span>
          </div>
          <div style={{ fontSize: "0.85rem", display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 700, minWidth: "55px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{new Date(reminder.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
        </div>
      </div>
      <div style={{
        textAlign: "center", padding: "0.6rem 0.8rem", borderRadius: "12px",
        background: "var(--bg-surface)", border: `1px solid ${info.border}`, fontSize: "0.75rem", fontWeight: 900, color: info.color,
        minWidth: "120px", lineHeight: "1.2", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginLeft: "auto"
      }}>
        {info.text}
      </div>
    </div>
  );
}

// ─── event detail modal ──────────────────────────────────────────────────────

interface EventDetail {
  title: string;
  start: string;
  type: string;
  status: string;
  isDeadline: boolean;
  backgroundColor: string;
}

function EventModal({
  event,
  onClose,
}: {
  event: EventDetail;
  onClose: () => void;
}) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-out"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          borderRadius: "24px",
          padding: "2rem",
          width: "100%",
          maxWidth: "420px",
          border: "1px solid var(--border-strong)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          position: "relative",
          overflow: "hidden",
          animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Color Accent Bar */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "6px", height: "100%", background: event.backgroundColor }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: 1, minWidth: 0 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: event.backgroundColor, boxShadow: `0 0 10px ${event.backgroundColor}66`, flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              {event.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: "0.4rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.8rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 700,
            background: event.isDeadline ? "rgba(239,68,68,0.15)" : "rgba(99,179,237,0.15)",
            color: event.isDeadline ? "#ff5f5f" : "#60a5fa",
            border: `1px solid ${event.isDeadline ? "rgba(239,68,68,0.2)" : "rgba(99,179,237,0.2)"}`
          }}>
            {event.isDeadline ? <><Flag size={14} /> Deadline</> : <><Clock size={14} /> Shoot Event</>}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.8rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600,
            background: "var(--bg-surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)"
          }}>
            {event.type}
          </span>
        </div>

        <div style={{
          padding: "1.25rem", background: "linear-gradient(135deg, var(--bg-surface-2), var(--bg-surface-3))",
          borderRadius: "16px", fontSize: "0.95rem", color: "var(--text-primary)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem"
        }}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.5rem", borderRadius: "10px" }}>
            <Calendar size={18} color="var(--color-primary)" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Scheduled Date</span>
            <span style={{ fontWeight: 600 }}>{event.isDeadline ? formatDateOnly(event.start) : formatDate(event.start)}</span>
          </div>
        </div>

        {event.status && (
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", background: "var(--bg-surface-2)", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-muted)" }}>Current Status:</span> <strong style={{ color: "var(--text-primary)", marginLeft: "0.4rem" }}>{event.status}</strong>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── calendar legend ─────────────────────────────────────────────────────────

function CalendarLegend() {
  const items = [
    { label: "Maternity Shoot", color: "#f472b6", gradient: "linear-gradient(135deg, #f472b6, #fb7185)", icon: <Baby size={14} /> },
    { label: "Influencer Shoot", color: "#60a5fa", gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)", icon: <Megaphone size={14} /> },
    { label: "Corporate Event", color: "#4ade80", gradient: "linear-gradient(135deg, #4ade80, #10b981)", icon: <Building2 size={14} /> },
    { label: "Delivery Deadline", color: "#ef4444", icon: <Flag size={14} />, dashed: true },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600,
            cursor: "default"
          }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%",
            background: item.dashed ? "rgba(239, 68, 68, 0.1)" : item.gradient, border: item.dashed ? `2px dashed ${item.color}` : "none", color: item.dashed ? item.color : "#fff",
            boxShadow: item.dashed ? "none" : `0 4px 12px ${item.color}44`
          }}>
            {item.icon}
          </div>
          <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function DashboardOverviewPage() {
  const [searchParams] = useSearchParams();
  const googleConnected = searchParams.get("googleConnected");
  const { isMobile, isTablet } = useIsMobile();
  const queryClient = useQueryClient();

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [visibleShoots] = useState(3);
  const [activeTab, setActiveTab] = useState<'shoots' | 'deadlines'>('shoots');

  // Studio Expense State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<StudioExpense | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "",
    notes: ""
  });

  const { data: userData } = useQuery({ queryKey: ["user-me"], queryFn: getMe });
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["dashboard-overview"], queryFn: getDashboardOverview });
  const { data: expensesData } = useQuery({ queryKey: ["studio-expenses"], queryFn: getStudioExpenses });

  const createExpenseMutation = useMutation({
    mutationFn: createStudioExpense,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["studio-expenses"] }); setIsExpenseModalOpen(false); resetExpenseForm(); }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateStudioExpense(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["studio-expenses"] }); setIsExpenseModalOpen(false); resetExpenseForm(); }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteStudioExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-expenses"] })
  });

  const resetExpenseForm = () => {
    setExpenseForm({ amount: 0, date: new Date().toISOString().split('T')[0], category: "", notes: "" });
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: StudioExpense) => {
    setEditingExpense(expense);
    setExpenseForm({ amount: expense.amount, date: new Date(expense.date).toISOString().split('T')[0], category: expense.category || "", notes: expense.notes || "" });
    setIsExpenseModalOpen(true);
  };

  const handleExportExpenses = () => {
    if (!expensesData || expensesData.length === 0) return;
    const exportData = expensesData.map((expense: StudioExpense) => ({
      "Date": new Date(expense.date).toLocaleDateString("en-IN"),
      "Category": expense.category,
      "Amount": expense.amount,
      "Notes": expense.notes || "-"
    }));

    const gt = data?.globalTotals || {};
    const summaryData = {
      "Total Revenue": gt.totalRevenue || 0,
      "Total Received": gt.totalAdvance || 0,
      "Total Due": gt.totalBalance || 0,
      "Total Expenses": gt.totalExpenses || 0,
      "Total Profit": gt.totalProfit || 0
    };

    exportToExcel(exportData, "Studio_Expenses", summaryData);
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const result = await syncAllRecords();
      setSyncMessage(result.message);
    } catch (err: any) {  
      const responseData = err.response?.data;
      if (err.response?.status === 401 && responseData?.code === 'INVALID_GRANT') {
        // Token has been revoked — refresh user data so UI shows "Connect Google" again
        queryClient.invalidateQueries({ queryKey: ["user-me"] });
        setSyncMessage("⚠️ Google Calendar connection expired. Please reconnect your Google account.");
      } else {
        setSyncMessage(responseData?.message || "Sync failed. Please try again.");
      }
    } finally {
      setSyncing(false);
    }
  };


  const handleConnectGoogle = async () => {
    try {
      const { url } = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      console.error("Failed to get Google Auth URL", err);
    }
  };

  const handleEventClick = useCallback((info: any) => {
    const ep = info.event.extendedProps;
    setSelectedEvent({
      title: info.event.title,
      start: info.event.startStr,
      type: ep.type,
      status: ep.status,
      isDeadline: !!ep.isDeadline,
      backgroundColor: info.event.backgroundColor,
    });
  }, []);

  const renderEventContent = useCallback((info: any) => {
    const { isDeadline, type } = info.event.extendedProps;
    const icon = isDeadline ? "🚩" : type === "Maternity" ? "🤱" : type === "Influencer" ? "📣" : "🏢";
    const backgroundColor = info.event.backgroundColor;

    // Use a more vibrant semi-transparent background for the event
    const eventBg = isDeadline ? "rgba(239, 68, 68, 0.15)" : `${backgroundColor}${Math.round(0.2 * 255).toString(16).padStart(2, '0')}`;

    return (
      <div style={{
        display: "flex", alignItems: "center", gap: "4px", overflow: "hidden", padding: "2px 6px", borderRadius: "4px",
        background: isDeadline ? "rgba(239, 68, 68, 0.15)" : eventBg,
        backdropFilter: "blur(2px)", borderLeft: `3px solid ${backgroundColor}`, fontSize: "0.75rem", fontWeight: isDeadline ? 700 : 500,
        height: "100%", width: "100%", color: isDeadline ? "#ff5f5f" : "var(--text-primary)"
      }}>
        <span style={{ fontSize: "10px", flexShrink: 0, opacity: 0.9 }}>{icon}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{info.event.title}</span>
      </div>
    );
  }, []);

  if (isLoading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Loading Dashboard...</div>;
  if (isError) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-danger)" }}>Error: {(error as Error).message}</div>;
  if (!data) return null;

  const { globalTotals, categorySplit, calendarEvents, upcomingShoots = [], upcomingDeadlines = [], recentlyCompleted = [], leadStats = { booked: 0 }, birthDateReminders = [] } = data;
  const isConnected = userData?.user?.googleCalendarConnected;

  return (
    <div className="dashboard-overview animate-fade-up">
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "1.75rem" : "2.5rem", fontWeight: 800, margin: "0 0 0.5rem 0", background: "linear-gradient(to right, var(--color-primary), var(--color-accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CRM Overview
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? "0.9rem" : "1rem" }}>Unified metrics across all modules.</p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", width: isMobile ? "100%" : "auto" }}>
            {isConnected ? (
              <div style={{ display: "flex", gap: "0.75rem", width: isMobile ? "100%" : "auto" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.6rem 1rem", borderRadius: "10px", background: "rgba(74, 222, 128, 0.1)", color: "var(--color-success)", border: "1px solid rgba(74, 222, 128, 0.2)", fontSize: "0.85rem", fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> <span>Connected</span>
                </div>
                <button 
                  onClick={handleSyncAll} 
                  disabled={syncing} 
                  className={syncing ? "btn-syncing" : "btn-ghost"} 
                  style={{ 
                    flex: 1, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "0.5rem", 
                    padding: "0.6rem 1rem", 
                    borderRadius: "10px",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {syncing ? (
                    <>
                      <div className="button-loader-ring" />
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>Sync</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button onClick={handleConnectGoogle} className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "10px" }}>
                <Calendar size={18} /> Connect Google
              </button>
            )}
          </div>
        </div>

        {(googleConnected || searchParams.get("googleError") || syncMessage) && (
          <div style={{
            marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", background: "var(--bg-surface-2)",
            color: searchParams.get("googleError") || syncMessage?.startsWith("⚠️") ? "var(--color-danger)" : "var(--color-success)",
            fontSize: "0.9rem", border: "1px solid var(--border)"
          }}>
            {searchParams.get("googleError") ? `Error: ${searchParams.get("googleError")}` : syncMessage || "Google Calendar connected!"}
          </div>
        )}
      </header>

      {/* ── 6-column stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(6, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        <StatCard title="Total Revenue" value={formatCurrency(globalTotals.totalRevenue)} icon={<TrendingUp size={20} />} color="var(--color-primary)" description="Gross contract value" />
        <StatCard title="Total Received" value={formatCurrency(globalTotals.totalAdvance)} icon={<CreditCard size={20} />} color="var(--color-success)" description="Payments collected" />
        <StatCard title="Total Due" value={formatCurrency(globalTotals.totalBalance)} icon={<AlertCircle size={20} />} color="var(--color-warning)" description="Pending balances" />
        <StatCard title="Total Expenses" value={formatCurrency(globalTotals.totalExpenses)} icon={<CreditCard size={20} />} color="var(--color-danger)" description="Records + Studio" />
        <StatCard title="Total Profit" value={formatCurrency(globalTotals.totalProfit)} icon={<BarChart3 size={20} />} color="var(--color-accent)" description="Revenue - Expenses" />
        <StatCard title="Booked Leads" value={leadStats.booked} icon={<Megaphone size={20} />} color="#3b82f6" description="Converted leads" />
      </div>

      {/* Maternity Birth Date Reminders */}
      {birthDateReminders.length > 0 && (
        <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem", marginBottom: "2.5rem", border: "1px solid rgba(244, 114, 182, 0.2)", background: "linear-gradient(135deg, var(--bg-surface), rgba(244, 114, 182, 0.05))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(244, 114, 182, 0.15)", color: "#f472b6", padding: "0.5rem", borderRadius: "12px" }}>
              <Baby size={22} className={birthDateReminders.some(r => r.daysRemaining <= 1) ? "animate-bounce" : ""} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>Maternity Birth Date Reminders</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>Upcoming delivery celebrations and shoots.</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(280px, 100%, 360px), 1fr))", gap: "1.25rem" }}>
            {birthDateReminders.map((reminder) => (
              <BirthDateReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>
      )}

      {/* ========== Studio Expenses (moved above Revenue Breakdown) ========== */}
      <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <CreditCard size={20} color="var(--color-danger)" />
            <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Studio Expenses</h2>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handleExportExpenses} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem", border: "1px solid var(--border)" }}>
              <Download size={16} /> Export
            </button>
            <button onClick={() => { resetExpenseForm(); setIsExpenseModalOpen(true); }} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem" }}>
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {expensesData?.map((expense: StudioExpense) => (
              <div key={expense._id} style={{ background: "var(--bg-surface-2)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(expense.date).toLocaleDateString("en-IN")}</span>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", background: "var(--bg-surface-3)", fontSize: "0.75rem", fontWeight: 600 }}>{expense.category}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 800, color: "var(--color-danger)", fontSize: "1.1rem" }}>{formatCurrency(expense.amount)}</div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleEditExpense(expense)} style={{ background: "var(--bg-surface-3)", border: "none", color: "var(--color-primary)", padding: "0.5rem", borderRadius: "8px", cursor: "pointer" }}><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm("Delete this expense?")) deleteExpenseMutation.mutate(expense._id!); }} style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "var(--color-danger)", padding: "0.5rem", borderRadius: "8px", cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                </div>
                {expense.notes && <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>{expense.notes}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Category</th>
                  <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Notes</th>
                  <th style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expensesData?.map((expense: StudioExpense) => (
                  <tr key={expense._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "1rem" }}>{new Date(expense.date).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "1rem" }}><span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", background: "var(--bg-surface-3)", fontSize: "0.75rem" }}>{expense.category}</span></td>
                    <td style={{ padding: "1rem", fontWeight: 700, color: "var(--color-danger)" }}>{formatCurrency(expense.amount)}</td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{expense.notes}</td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button onClick={() => handleEditExpense(expense)} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer" }}><Pencil size={16} /></button>
                        <button onClick={() => { if (confirm("Delete this expense?")) deleteExpenseMutation.mutate(expense._id!); }} style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer" }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "repeat(2, 1fr)", gap: "2rem", marginBottom: "2.5rem" }}>
        {/* Revenue Breakdown */}
        <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <BarChart3 size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Revenue Breakdown</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {categorySplit.map((cat: any) => (
              <div key={cat.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{formatCurrency(cat.revenue)}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>({globalTotals.totalRevenue > 0 ? Math.round((cat.revenue / globalTotals.totalRevenue) * 100) : 0}%)</span>
                  </div>
                </div>
                <div style={{ height: "6px", background: "var(--bg-surface-3)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${globalTotals.totalRevenue > 0 ? (cat.revenue / globalTotals.totalRevenue) * 100 : 0}%`, background: cat.color, borderRadius: "3px", transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reminders: Shoots & Deadlines */}
        <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Calendar size={20} color="var(--color-warning)" />
              <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Upcoming</h2>
            </div>
            <div style={{ display: "flex", background: "var(--bg-surface-3)", padding: "3px", borderRadius: "8px" }}>
              <button onClick={() => setActiveTab('shoots')} style={{ padding: "0.3rem 0.6rem", fontSize: "0.7rem", fontWeight: 700, borderRadius: "6px", border: "none", cursor: "pointer", background: activeTab === 'shoots' ? "var(--bg-surface)" : "transparent", color: activeTab === 'shoots' ? "var(--color-primary)" : "var(--text-muted)" }}>Shoots</button>
              <button onClick={() => setActiveTab('deadlines')} style={{ padding: "0.3rem 0.6rem", fontSize: "0.7rem", fontWeight: 700, borderRadius: "6px", border: "none", cursor: "pointer", background: activeTab === 'deadlines' ? "var(--bg-surface)" : "transparent", color: activeTab === 'deadlines' ? "var(--color-primary)" : "var(--text-muted)" }}>Deadlines</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Upcoming {activeTab}</div>
            {(activeTab === 'shoots' ? upcomingShoots : upcomingDeadlines).slice(0, visibleShoots).map((item: any) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem", background: "var(--bg-surface-2)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "25%", background: activeTab === 'shoots' ? "rgba(255,255,255,0.03)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: activeTab === 'shoots' ? "var(--text-muted)" : "var(--color-danger)" }}>
                  {activeTab === 'shoots' ? (item.type === 'Maternity' ? <Baby size={18} /> : item.type === 'Influencer' ? <Megaphone size={18} /> : <Building2 size={18} />) : <Flag size={18} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.clientName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.type} · {new Date(item.date).toLocaleDateString("en-IN")}</div>
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, padding: "0.25rem 0.5rem", borderRadius: "6px", background: item.daysRemaining <= 1 ? "var(--color-danger)" : "var(--bg-surface-3)", color: item.daysRemaining <= 1 ? "#fff" : "var(--text-secondary)" }}>
                  {item.daysRemaining === 0 ? "Today" : `${item.daysRemaining}d`}
                </div>
              </div>
            ))}
            {(activeTab === 'shoots' ? upcomingShoots : upcomingDeadlines).length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", background: "var(--bg-surface-2)", borderRadius: "12px", border: "1px dashed var(--border)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No upcoming {activeTab} for the next 7 days.
              </div>
            )}
            {(activeTab === 'shoots' ? upcomingShoots : upcomingDeadlines).length > 3 && (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.5rem" }}>
                <AlertCircle size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                Criteria: Active (Not Completed/Cancelled) items for the next 7 days.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recently Completed Section */}
      <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "rgba(74, 222, 128, 0.1)", color: "var(--color-success)", padding: "0.4rem", borderRadius: "50%", display: "flex" }}>
              <CheckCircle2 size={20} />
            </div>
            <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Recently Completed</h2>
          </div>
          {recentlyCompleted.length > 3 && (
            <button className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", borderRadius: "8px", color: "var(--color-primary)" }}>
              View More (+{recentlyCompleted.length - 3})
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {recentlyCompleted.slice(0, 3).map((item: any) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-surface-2)", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-success)", border: "1px solid var(--border)" }}>
                <CheckCircle2 size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>{item.clientName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.type} · {new Date(item.date).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>{formatCurrency(item.total)}</div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 900, color: item.paymentStatus === 'Done' ? "var(--color-success)" : "var(--color-danger)", letterSpacing: "0.05em", marginTop: "2px" }}>
                      PAYMENT: {item.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {recentlyCompleted.length === 0 && (
            <div style={{ padding: "2rem", textAlign: "center", background: "var(--bg-surface-2)", borderRadius: "12px", border: "1px dashed var(--border)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No recently completed items.
            </div>
          )}
        </div>
        <div style={{ marginTop: "1.25rem", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <AlertCircle size={14} color="var(--color-success)" />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Items completed or cancelled in the last 7 days.</span>
        </div>
      </section>

      <section className="card" style={{ padding: isMobile ? "1.25rem" : "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Calendar size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>Schedule & Deadlines</h2>
          </div>
        </div>
        <CalendarLegend />
        <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            timeZone="Asia/Kolkata"
            initialView={isMobile ? "dayGridMonth" : isTablet ? "dayGridMonth" : "dayGridMonth"}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: isMobile ? "" : "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            events={calendarEvents || []}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            height="auto"
            contentHeight={isMobile ? 400 : 640}
            dayMaxEvents={isMobile ? 2 : 3}
            nowIndicator={true}
          />
        </div>
      </section>

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1100,
          display: "flex",
          alignItems: (isMobile || isTablet) ? "center" : "flex-start",
          justifyContent: "center",
          padding: "1rem",
          paddingTop: (isMobile || isTablet) ? "1rem" : "10vh",
          backdropFilter: "blur(4px)",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            background: "var(--bg-surface)",
            borderRadius: "16px",
            padding: "2rem",
            width: "100%",
            maxWidth: "450px",
            border: "1px solid var(--border)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem" }}>{editingExpense ? "Edit Expense" : "Add Studio Expense"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Amount (INR)</label>
                <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface-2)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Date</label>
                <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface-2)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Category</label>
                <input
                  type="text"
                  placeholder="e.g. Rent, Electricity, Equipment..."
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface-2)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Notes</label>
                <textarea value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface-2)", minHeight: "80px" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button onClick={() => setIsExpenseModalOpen(false)} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "none", cursor: "pointer" }}>Cancel</button>
                <button
                  onClick={() => editingExpense ? updateExpenseMutation.mutate({ id: editingExpense._id!, data: expenseForm }) : createExpenseMutation.mutate(expenseForm)}
                  disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
                  className="btn-primary"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "8px" }}
                >
                  {editingExpense ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      <style dangerouslySetInnerHTML={{
        __html: `
        .fc-theme-standard td, .fc-theme-standard th { border-color: var(--border) !important; }
        .fc-col-header-cell { padding: 8px 0 !important; background: var(--bg-surface-2) !important; }
        .fc-col-header-cell-cushion { color: var(--text-secondary) !important; text-decoration: none !important; font-size: 0.7rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
        .fc-button-primary { background: var(--bg-surface-2) !important; border: 1px solid var(--border) !important; color: var(--text-primary) !important; font-size: 0.75rem !important; font-weight: 600 !important; border-radius: 8px !important; padding: 6px 12px !important; text-transform: capitalize !important; transition: all 0.2s ease !important; }
        .fc-button-primary:hover { background: var(--bg-surface-3) !important; border-color: var(--border-strong) !important; transform: translateY(-1px); }
        .fc-button-active { background: var(--color-primary) !important; color: #fff !important; border-color: var(--color-primary) !important; box-shadow: 0 4px 12px var(--color-primary-glow) !important; }
        .fc-day-today { background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.05) !important; }
        .fc-daygrid-day-number { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); padding: 8px !important; text-decoration: none !important; }
        .fc-daygrid-day:hover { background: rgba(255,255,255,0.02); }
        .fc-event { border: none !important; background: transparent !important; margin: 1px 2px !important; }
        .fc-toolbar-title { font-size: 1.1rem !important; fontWeight: 700 !important; font-family: var(--font-display) !important; }
        .fc-scrollgrid { border-radius: 12px !important; overflow: hidden !important; border: 1px solid var(--border) !important; }
        
        .btn-syncing {
          background: var(--bg-surface-3) !important;
          color: var(--color-primary) !important;
          border-color: var(--color-primary) !important;
          cursor: not-allowed !important;
          position: relative;
          overflow: hidden;
        }
        .btn-syncing::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: var(--color-primary);
          animation: sync-progress 2s linear infinite;
        }
        @keyframes sync-progress {
          0% { width: 0; left: 0; }
          50% { width: 70%; left: 15%; }
          100% { width: 0; left: 100%; }
        }
        .button-loader-ring {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent);
          animation: scan 1.5s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 768px) {
          .fc-header-toolbar { flex-direction: column; gap: 1rem; }
          .fc-toolbar-chunk { display: flex; justify-content: center; width: 100%; }
        }
      ` }} />
    </div>
  );
}