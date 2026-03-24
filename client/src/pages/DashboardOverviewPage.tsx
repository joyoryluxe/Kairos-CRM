









// import { useState, useEffect, useCallback } from "react";
// import { useQuery } from "@tanstack/react-query";
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
// } from "lucide-react";
// import { useSearchParams } from "react-router-dom";
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
//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: "absolute",
//         inset: 0,
//         background: "rgba(0,0,0,0.45)",
//         zIndex: 100,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "1rem",
//         borderRadius: "12px",
//       }}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           background: "var(--bg-surface)",
//           borderRadius: "16px",
//           padding: "1.5rem",
//           width: "100%",
//           maxWidth: "380px",
//           border: "1px solid var(--border)",
//           boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
//         }}
//       >
//         {/* header */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//             marginBottom: "1rem",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "0.6rem",
//               flex: 1,
//               minWidth: 0,
//             }}
//           >
//             <div
//               style={{
//                 width: 12,
//                 height: 12,
//                 borderRadius: "50%",
//                 background: event.backgroundColor,
//                 flexShrink: 0,
//               }}
//             />
//             <span
//               style={{
//                 fontWeight: 700,
//                 fontSize: "1rem",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {event.title}
//             </span>
//           </div>
//           <button
//             onClick={onClose}
//             style={{
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               color: "var(--text-muted)",
//               padding: "0.2rem",
//               marginLeft: "0.5rem",
//               flexShrink: 0,
//             }}
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* type badge */}
//         <div
//           style={{
//             display: "flex",
//             gap: "0.5rem",
//             marginBottom: "1rem",
//             flexWrap: "wrap",
//           }}
//         >
//           <span
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: "0.3rem",
//               padding: "0.25rem 0.6rem",
//               borderRadius: "20px",
//               fontSize: "0.75rem",
//               fontWeight: 700,
//               background: event.isDeadline
//                 ? "rgba(239,68,68,0.12)"
//                 : "rgba(99,179,237,0.12)",
//               color: event.isDeadline ? "#ef4444" : "#60a5fa",
//               border: event.isDeadline
//                 ? "1px solid rgba(239,68,68,0.25)"
//                 : "1px solid rgba(99,179,237,0.25)",
//             }}
//           >
//             {event.isDeadline ? (
//               <>
//                 <Flag size={11} /> Delivery Deadline
//               </>
//             ) : (
//               <>
//                 <Clock size={11} /> Shoot / Event
//               </>
//             )}
//           </span>
//           <span
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: "0.3rem",
//               padding: "0.25rem 0.6rem",
//               borderRadius: "20px",
//               fontSize: "0.75rem",
//               fontWeight: 600,
//               background: "var(--bg-surface-2)",
//               color: "var(--text-secondary)",
//               border: "1px solid var(--border)",
//             }}
//           >
//             {event.type === "Maternity" ? (
//               <Baby size={11} />
//             ) : event.type === "Influencer" ? (
//               <Megaphone size={11} />
//             ) : (
//               <Building2 size={11} />
//             )}
//             {event.type}
//           </span>
//         </div>

//         {/* date/time */}
//         <div
//           style={{
//             padding: "0.75rem",
//             background: "var(--bg-surface-2)",
//             borderRadius: "10px",
//             fontSize: "0.85rem",
//             color: "var(--text-secondary)",
//             display: "flex",
//             alignItems: "center",
//             gap: "0.5rem",
//           }}
//         >
//           <Calendar size={14} color="var(--color-primary)" />
//           {event.isDeadline
//             ? formatDateOnly(event.start)
//             : formatDate(event.start)}
//         </div>

//         {/* status */}
//         {event.status && (
//           <div
//             style={{
//               marginTop: "0.75rem",
//               fontSize: "0.8rem",
//               color: "var(--text-muted)",
//             }}
//           >
//             Status:{" "}
//             <strong style={{ color: "var(--text-primary)" }}>
//               {event.status}
//             </strong>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── calendar legend ─────────────────────────────────────────────────────────

// function CalendarLegend() {
//   const items = [
//     {
//       label: "Maternity Shoot",
//       color: "#f472b6",
//       icon: <Baby size={11} />,
//     },
//     {
//       label: "Influencer Shoot",
//       color: "#60a5fa",
//       icon: <Megaphone size={11} />,
//     },
//     {
//       label: "Corporate Event",
//       color: "#4ade80",
//       icon: <Building2 size={11} />,
//     },
//     {
//       label: "Delivery Deadline",
//       color: "#ef4444",
//       icon: <Flag size={11} />,
//       dashed: true,
//     },
//   ];

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexWrap: "wrap",
//         gap: "0.5rem 1rem",
//         marginBottom: "1rem",
//       }}
//     >
//       {items.map((item) => (
//         <div
//           key={item.label}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "0.4rem",
//             fontSize: "0.75rem",
//             color: "var(--text-secondary)",
//           }}
//         >
//           <span
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               justifyContent: "center",
//               width: 18,
//               height: 18,
//               borderRadius: item.dashed ? "4px" : "50%",
//               background: `${item.color}22`,
//               border: item.dashed
//                 ? `2px dashed ${item.color}`
//                 : `2px solid ${item.color}`,
//               color: item.color,
//             }}
//           >
//             {item.icon}
//           </span>
//           {item.label}
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

//   const [syncing, setSyncing] = useState(false);
//   const [syncMessage, setSyncMessage] = useState("");
//   const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
//   const [visibleShoots, setVisibleShoots] = useState(3);
//   const [visibleDeadlines, setVisibleDeadlines] = useState(3);
//   const [visibleCompleted, setVisibleCompleted] = useState(3);
//   const [activeTab, setActiveTab] = useState<'shoots' | 'deadlines'>('shoots');

//   const { data: userData } = useQuery({
//     queryKey: ["user-me"],
//     queryFn: getMe,
//   });

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

//   const isConnected = userData?.user?.googleCalendarConnected;

//   const { data, isLoading, isError, error } = useQuery({
//     queryKey: ["dashboard-overview"],
//     queryFn: getDashboardOverview,
//   });

//   const handleConnectGoogle = async () => {
//     try {
//       const { url } = await getGoogleAuthUrl();
//       window.location.href = url;
//     } catch (err) {
//       console.error("Failed to get Google Auth URL", err);
//     }
//   };

//   // FullCalendar event click handler
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

//   // Custom event content — adds icon prefix based on type/deadline
//   const renderEventContent = useCallback((info: any) => {
//     const { isDeadline, type } = info.event.extendedProps;
//     const icon = isDeadline ? "🚩" : type === "Maternity" ? "🤱" : type === "Influencer" ? "📣" : "🏢";
//     return (
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "3px",
//           overflow: "hidden",
//           padding: "1px 4px",
//           fontSize: "0.78rem",
//           fontWeight: isDeadline ? 700 : 500,
//           opacity: 0.95,
//         }}
//       >
//         <span style={{ fontSize: "10px", flexShrink: 0 }}>{icon}</span>
//         <span
//           style={{
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {info.event.title}
//         </span>
//       </div>
//     );
//   }, []);

//   if (isLoading)
//     return (
//       <div
//         style={{
//           padding: "2rem",
//           textAlign: "center",
//           color: "var(--text-muted)",
//         }}
//       >
//         Loading Dashboard Stats...
//       </div>
//     );
//   if (isError)
//     return (
//       <div
//         style={{
//           padding: "2rem",
//           textAlign: "center",
//           color: "var(--color-danger)",
//         }}
//       >
//         Error: {(error as Error).message}
//       </div>
//     );
//   if (!data) return null;

//   const { globalTotals, categorySplit, calendarEvents, upcomingShoots = [], upcomingDeadlines = [] } = data;

//   return (
//     <div className="animate-fade-up">
//       {/* ── header ── */}
//       <header style={{ marginBottom: "2.5rem" }}>
//         <div
//           style={{
//             display: "flex",
//             flexDirection: isTablet ? "column" : "row",
//             justifyContent: "space-between",
//             alignItems: isTablet ? "flex-start" : "center",
//             gap: "1.5rem",
//           }}
//         >
//           <div>
//             <h1
//               style={{
//                 fontSize: isMobile ? "2rem" : "2.5rem",
//                 fontWeight: 700,
//                 margin: "0 0 0.5rem 0",
//                 background:
//                   "linear-gradient(to right, var(--color-primary), var(--color-accent))",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//               }}
//             >
//               CRM Overview
//             </h1>
//             <p
//               style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
//             >
//               Unified metrics across all modules.
//             </p>
//           </div>

//           <div
//             style={{
//               display: "flex",
//               gap: "0.75rem",
//               flexWrap: "wrap",
//               width: isTablet ? "100%" : "auto",
//             }}
//           >
//             {isConnected ? (
//               <>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "0.5rem",
//                     padding: "0.6rem 1rem",
//                     borderRadius: "10px",
//                     background: "rgba(74, 222, 128, 0.1)",
//                     color: "var(--color-success)",
//                     border: "1px solid rgba(74, 222, 128, 0.2)",
//                     fontSize: "0.85rem",
//                     fontWeight: 600,
//                     flex: isTablet ? "1" : "none",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <CheckCircle2 size={16} />
//                   <span>{isMobile ? "Connected" : "Google Calendar: Connected"}</span>
//                 </div>
//                 <button
//                   onClick={handleSyncAll}
//                   disabled={syncing}
//                   className="btn-ghost"
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "0.5rem",
//                     padding: "0.6rem 1rem",
//                     borderRadius: "10px",
//                     flex: isTablet ? "1" : "none",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <RefreshCw
//                     size={16}
//                     className={syncing ? "animate-spin" : ""}
//                   />
//                   <span>{syncing ? "Syncing..." : "Sync"}</span>
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={handleConnectGoogle}
//                 className="btn-primary"
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "0.5rem",
//                   padding: "0.75rem 1.25rem",
//                   borderRadius: "10px",
//                   width: isTablet ? "100%" : "auto",
//                   justifyContent: "center",
//                 }}
//               >
//                 <Calendar size={18} />
//                 Connect Google
//               </button>
//             )}
//           </div>
//         </div>

//         {(googleConnected ||
//           searchParams.get("googleError") ||
//           syncMessage) && (
//             <div
//               style={{
//                 marginTop: "1.5rem",
//                 padding: "1rem",
//                 background: searchParams.get("googleError")
//                   ? "rgba(239, 68, 68, 0.1)"
//                   : "rgba(74, 222, 128, 0.1)",
//                 color: searchParams.get("googleError")
//                   ? "var(--color-danger)"
//                   : "var(--color-success)",
//                 borderRadius: "10px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "0.75rem",
//                 border: searchParams.get("googleError")
//                   ? "1px solid rgba(239, 68, 68, 0.2)"
//                   : "1px solid rgba(74, 222, 128, 0.2)",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {searchParams.get("googleError") ? (
//                 <AlertCircle size={18} />
//               ) : (
//                 <CheckCircle2 size={18} />
//               )}
//               <span>
//                 {searchParams.get("googleError")
//                   ? `Connection failed: ${searchParams.get("googleError")}`
//                   : syncMessage || "Google Calendar connected!"}
//               </span>
//             </div>
//           )}
//       </header>

//       {/* ── global stats ── */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
//           gap: "1.25rem",
//           marginBottom: "2.5rem",
//         }}
//       >
//         <StatCard
//           title="Total Revenue"
//           value={formatCurrency(globalTotals.totalRevenue)}
//           icon={<TrendingUp size={24} />}
//           color="var(--color-primary)"
//           description="Gross contract value"
//         />
//         <StatCard
//           title="Total Received"
//           value={formatCurrency(globalTotals.totalAdvance)}
//           icon={<CreditCard size={24} />}
//           color="var(--color-success)"
//           description="Payments collected"
//         />
//         <StatCard
//           title="Total Outstanding"
//           value={formatCurrency(globalTotals.totalBalance)}
//           icon={<AlertCircle size={24} />}
//           color="var(--color-warning)"
//           description="Pending balances"
//         />
//       </div>

//       {/* ── breakdown + reminders ── */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
//           gap: "1.5rem",
//           marginBottom: "2.5rem",
//         }}
//       >
//         {/* Revenue breakdown */}
//         <section className="card" style={{ padding: "1.5rem" }}>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "0.75rem",
//               marginBottom: "1.5rem",
//             }}
//           >
//             <BarChart3 size={20} color="var(--color-primary)" />
//             <h2 style={{ fontSize: "1.1rem", margin: 0 }}>
//               Revenue Breakdown
//             </h2>
//           </div>
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
//           >
//             {categorySplit.map((cat: any) => (
//               <div key={cat.name}>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "0.5rem",
//                     fontSize: "0.9rem",
//                   }}
//                 >
//                   <span style={{ fontWeight: 500 }}>{cat.name}</span>
//                   <span style={{ color: "var(--text-secondary)" }}>
//                     {formatCurrency(cat.revenue)}
//                     {globalTotals.totalRevenue > 0
//                       ? ` (${(
//                         (cat.revenue / globalTotals.totalRevenue) *
//                         100
//                       ).toFixed(0)}%)`
//                       : ""}
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     height: "6px",
//                     background: "var(--bg-surface-3)",
//                     borderRadius: "3px",
//                     overflow: "hidden",
//                   }}
//                 >
//                   <div
//                     style={{
//                       height: "100%",
//                       width: `${globalTotals.totalRevenue > 0
//                           ? (cat.revenue / globalTotals.totalRevenue) * 100
//                           : 0
//                         }%`,
//                       background:
//                         cat.revenue > 0 ? cat.color : "var(--bg-surface-3)",
//                       borderRadius: "3px",
//                       transition: "width 0.6s ease",
//                     }}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Reminders section: Shoots & Deadlines */}
//         <section className="card" style={{ padding: "1.5rem" }}>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "0.75rem",
//               marginBottom: "1.25rem",
//               justifyContent: "space-between",
//               flexWrap: "wrap"
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//               <Calendar size={20} color="var(--color-warning)" />
//               <h2 style={{ fontSize: "1.1rem", margin: 0, whiteSpace: "nowrap" }}>Upcoming</h2>
//             </div>

//             {/* Segmented Toggle */}
//             <div style={{ 
//               display: "flex", 
//               background: "var(--bg-surface-3)", 
//               padding: "3px", 
//               borderRadius: "8px",
//               border: "1px solid var(--border)"
//             }}>
//               <button
//                 onClick={() => setActiveTab('shoots')}
//                 style={{
//                   padding: "0.3rem 0.6rem",
//                   fontSize: "0.75rem",
//                   fontWeight: 600,
//                   borderRadius: "6px",
//                   border: "none",
//                   cursor: "pointer",
//                   background: activeTab === 'shoots' ? "var(--bg-surface)" : "transparent",
//                   color: activeTab === 'shoots' ? "var(--color-primary)" : "var(--text-muted)",
//                   boxShadow: activeTab === 'shoots' ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
//                   transition: "all 0.2s"
//                 }}
//               >
//                 Shoots
//               </button>
//               <button
//                 onClick={() => setActiveTab('deadlines')}
//                 style={{
//                   padding: "0.3rem 0.6rem",
//                   fontSize: "0.75rem",
//                   fontWeight: 600,
//                   borderRadius: "6px",
//                   border: "none",
//                   cursor: "pointer",
//                   background: activeTab === 'deadlines' ? "var(--bg-surface)" : "transparent",
//                   color: activeTab === 'deadlines' ? "var(--color-primary)" : "var(--text-muted)",
//                   boxShadow: activeTab === 'deadlines' ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
//                   transition: "all 0.2s"
//                 }}
//               >
//                 Deadlines
//               </button>
//             </div>
//           </div>

//           <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//             {/* 1. Upcoming Shoots Part */}
//             {activeTab === 'shoots' && (
//               <div className="animate-fade-in">
//                 <div style={{ 
//                   display: "flex", 
//                   justifyContent: "space-between", 
//                   alignItems: "center",
//                   marginBottom: "0.75rem"
//                 }}>
//                   <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700, margin: 0 }}>
//                     Upcoming Shoots
//                   </h3>
//                   {upcomingShoots.length > visibleShoots && (
//                     <button 
//                       onClick={() => setVisibleShoots(prev => prev + 3)}
//                       style={{ 
//                         background: "none", border: "none", color: "var(--color-primary)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: "4px"
//                       }}
//                       onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-surface-3)")}
//                       onMouseOut={(e) => (e.currentTarget.style.background = "none")}
//                     >
//                       View More (+3)
//                     </button>
//                   )}
//                   {visibleShoots > 3 && (
//                     <button 
//                       onClick={() => setVisibleShoots(3)}
//                       style={{ 
//                         background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: "4px"
//                       }}
//                     >
//                       Show Less
//                     </button>
//                   )}
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
//                   {upcomingShoots.length === 0 ? (
//                     <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", fontSize: "0.8rem" }}>
//                       No shoots scheduled for the next 7 days.
//                     </div>
//                   ) : (
//                     upcomingShoots.slice(0, visibleShoots).map((shoot: any) => (
//                       <div key={shoot.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}>
//                         <div style={{ 
//                           width: 32, height: 32, borderRadius: "50%", background: "var(--bg-surface-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)"
//                         }}>
//                           {shoot.type === "Maternity" ? <Baby size={16} /> : shoot.type === "Influencer" ? <Megaphone size={16} /> : <Building2 size={16} />}
//                         </div>
//                         <div style={{ flex: 1, minWidth: 0 }}>
//                           <div style={{ fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                             {shoot.clientName}
//                           </div>
//                           <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
//                             {shoot.type} · {new Date(shoot.date).toLocaleDateString("en-IN")}
//                           </div>
//                         </div>
//                         <div style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--bg-surface-3)", color: "var(--text-secondary)" }}>
//                           {shoot.daysRemaining === 0 ? "Today" : `${shoot.daysRemaining}d`}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* 2. Upcoming Deadlines Part */}
//             {activeTab === 'deadlines' && (
//               <div className="animate-fade-in">
//                 <div style={{ 
//                   display: "flex", 
//                   justifyContent: "space-between", 
//                   alignItems: "center",
//                   marginBottom: "0.75rem"
//                 }}>
//                   <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700, margin: 0 }}>
//                     Upcoming Deadlines
//                   </h3>
//                   {upcomingDeadlines.length > visibleDeadlines && (
//                     <button 
//                       onClick={() => setVisibleDeadlines(prev => prev + 3)}
//                       style={{ 
//                         background: "none", border: "none", color: "var(--color-primary)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: "4px"
//                       }}
//                       onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-surface-3)")}
//                       onMouseOut={(e) => (e.currentTarget.style.background = "none")}
//                     >
//                       View More (+3)
//                     </button>
//                   )}
//                   {visibleDeadlines > 3 && (
//                     <button 
//                       onClick={() => setVisibleDeadlines(3)}
//                       style={{ 
//                         background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: "4px"
//                       }}
//                     >
//                       Show Less
//                     </button>
//                   )}
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
//                   {upcomingDeadlines.length === 0 ? (
//                     <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", fontSize: "0.8rem" }}>
//                       No deadlines for the next 7 days.
//                     </div>
//                   ) : (
//                     upcomingDeadlines.slice(0, visibleDeadlines).map((deadline: any) => (
//                       <div key={deadline.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}>
//                         <div style={{ 
//                           width: 32, height: 32, borderRadius: "50%", background: "var(--color-danger-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-danger)"
//                         }}>
//                           <Flag size={16} />
//                         </div>
//                         <div style={{ flex: 1, minWidth: 0 }}>
//                           <div style={{ fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                             {deadline.clientName}
//                           </div>
//                           <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
//                             {deadline.type} · {new Date(deadline.date).toLocaleDateString("en-IN")}
//                           </div>
//                         </div>
//                         <div style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--color-danger)", color: "#fff" }}>
//                           {deadline.daysRemaining === 0 ? "Today" : `${deadline.daysRemaining}d`}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div style={{ 
//             marginTop: "1.5rem", 
//             paddingTop: "1rem", 
//             borderTop: "1px solid var(--border)", 
//             fontSize: "0.7rem", 
//             color: "var(--text-muted)",
//             display: "flex",
//             alignItems: "center",
//             gap: "0.5rem"
//           }}>
//             <AlertCircle size={12} color="var(--color-primary)" />
//             <span>Criteria: Active (Not Completed/Cancelled) items for the next 7 days.</span>
//           </div>
//         </section>

//         {/* 3. Recently Completed / Cancelled Section */}
//         <section className="card" style={{ padding: "1.5rem" }}>
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "space-between", 
//             alignItems: "center",
//             marginBottom: "1.5rem"
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//               <CheckCircle2 size={20} color="var(--color-success)" />
//               <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Recently Completed</h2>
//             </div>
//             <div style={{ display: "flex", gap: "0.5rem" }}>
//               {data.recentlyCompleted.length > visibleCompleted && (
//                 <button 
//                   onClick={() => setVisibleCompleted(prev => prev + 3)}
//                   style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
//                 >
//                   View More (+3)
//                 </button>
//               )}
//               {visibleCompleted > 3 && (
//                 <button 
//                   onClick={() => setVisibleCompleted(3)}
//                   style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
//                 >
//                   Show Less
//                 </button>
//               )}
//             </div>
//           </div>

//           <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
//             {data.recentlyCompleted.length === 0 ? (
//               <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
//                 No items completed or cancelled this week.
//               </div>
//             ) : (
//               data.recentlyCompleted.slice(0, visibleCompleted).map((item: any) => (
//                 <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
//                   <div style={{ 
//                     width: 36, height: 36, borderRadius: "50%", 
//                     background: item.status === 'Cancelled' ? "var(--color-danger-glow)" : "var(--color-success-glow)", 
//                     display: "flex", alignItems: "center", justifyContent: "center", 
//                     color: item.status === 'Cancelled' ? "var(--color-danger)" : "var(--color-success)"
//                   }}>
//                     {item.status === 'Cancelled' ? <X size={18} /> : <CheckCircle2 size={18} />}
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ fontWeight: 600, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                       {item.clientName}
//                     </div>
//                     <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
//                       {item.type} · {new Date(item.date).toLocaleDateString("en-IN")}
//                     </div>
//                   </div>
//                   <div style={{ textAlign: "right" }}>
//                     <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
//                       {formatCurrency(item.total)}
//                     </div>
//                     <div style={{ 
//                       fontSize: "0.7rem", 
//                       fontWeight: 700, 
//                       color: item.paymentStatus === 'Done' ? "var(--color-success)" : "var(--color-warning)",
//                       textTransform: "uppercase"
//                     }}>
//                       Payment: {item.paymentStatus} {item.paymentStatus === 'Due' && `(${formatCurrency(item.balance)})`}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           <div style={{ 
//             marginTop: "1.5rem", 
//             paddingTop: "1rem", 
//             borderTop: "1px solid var(--border)", 
//             fontSize: "0.7rem", 
//             color: "var(--text-muted)",
//             display: "flex",
//             alignItems: "center",
//             gap: "0.5rem"
//           }}>
//             <AlertCircle size={12} color="var(--color-success)" />
//             <span>Items completed or cancelled in the last 7 days.</span>
//           </div>
//         </section>

//       </div>

//       {/* ── calendar ── */}
//       <section
//         className="card animate-fade-up"
//         style={{ padding: "1.25rem", marginBottom: "2.5rem", position: "relative" }}
//       >
//         {/* section header */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "0.75rem",
//             marginBottom: "1rem",
//             flexWrap: "wrap",
//           }}
//         >
//           <Calendar size={20} color="var(--color-primary)" />
//           <h2
//             style={{ fontSize: "1.1rem", margin: 0, fontWeight: 600 }}
//           >
//             Schedule &amp; Deadlines
//           </h2>
//           {isConnected && !isMobile && (
//             <span
//               style={{
//                 fontSize: "0.75rem",
//                 color: "var(--text-muted)",
//                 marginLeft: "auto",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "0.4rem",
//               }}
//             >
//               <CheckCircle2 size={14} color="var(--color-success)" />
//               Live Sync Active
//             </span>
//           )}
//         </div>

//         {/* legend */}
//         <CalendarLegend />

//         {/* calendar wrapper */}
//         <div
//           style={{
//             borderRadius: "12px",
//             overflow: "hidden",
//             border: "1px solid var(--border)",
//             background: "var(--bg-surface)",
//           }}
//         >
//           <FullCalendar
//             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//             // ── critical: IST timezone ──
//             timeZone="Asia/Kolkata"
//             // ── Mobile/Tablet views ──
//             initialView={isMobile ? "timeGridDay" : isTablet ? "timeGridWeek" : "dayGridMonth"}
//             // ── toolbar: compact on mobile ──
//             headerToolbar={
//               isMobile
//                 ? {
//                   left: "prev,next",
//                   center: "title",
//                   right: "today",
//                 }
//                 : isTablet 
//                   ? {
//                     left: "prev,next today",
//                     center: "title",
//                     right: "timeGridWeek,timeGridDay",
//                   }
//                   : {
//                     left: "prev,next today",
//                     center: "title",
//                     right: "dayGridMonth,timeGridWeek,timeGridDay",
//                   }
//             }
//             footerToolbar={
//               isMobile
//                 ? {
//                   center: "dayGridMonth,timeGridWeek,timeGridDay",
//                 }
//                 : false
//             }
//             events={calendarEvents || []}
//             eventContent={renderEventContent}
//             eventClick={handleEventClick}
//             // ── time display ──
//             eventTimeFormat={{
//               hour: "2-digit",
//               minute: "2-digit",
//               meridiem: "short",
//             }}
//             slotLabelFormat={{
//               hour: "2-digit",
//               minute: "2-digit",
//               meridiem: "short",
//             }}
//             // ── layout ──
//             height="auto"
//             contentHeight={isMobile ? 500 : 640}
//             eventDisplay="block"
//             // ── show more events cleanly ──
//             dayMaxEvents={isMobile ? 2 : 4}
//             moreLinkClick="popover"
//             // ── highlight today ──
//             nowIndicator={true}
//           />
//         </div>

//         {/* event detail modal - now relative to this section */}
//         {selectedEvent && (
//           <EventModal
//             event={selectedEvent}
//             onClose={() => setSelectedEvent(null)}
//           />
//         )}

//         {/* ── injected FullCalendar theme overrides ── */}
//         <style
//           dangerouslySetInnerHTML={{
//             __html: `
//           /* grid borders */
//           .fc-theme-standard td,
//           .fc-theme-standard th,
//           .fc-theme-standard .fc-scrollgrid {
//             border-color: var(--border) !important;
//           }

//           /* header day names */
//           .fc-col-header-cell-cushion {
//             color: var(--text-secondary) !important;
//             padding: 8px 4px !important;
//             text-decoration: none !important;
//             font-size: 0.78rem;
//             font-weight: 600;
//             text-transform: uppercase;
//             letter-spacing: 0.05em;
//           }

//           /* day numbers */
//           .fc-daygrid-day-number {
//             color: var(--text-secondary) !important;
//             text-decoration: none !important;
//             font-size: 0.85rem;
//           }
//           .fc-day-today .fc-daygrid-day-number {
//             color: var(--color-primary) !important;
//             font-weight: 700;
//           }

//           /* today highlight */
//           .fc-day-today {
//             background: rgba(99,102,241,0.04) !important;
//           }

//           /* now indicator line */
//           .fc-timegrid-now-indicator-line {
//             border-color: var(--color-danger) !important;
//             border-width: 2px !important;
//           }
//           .fc-timegrid-now-indicator-arrow {
//             border-color: var(--color-danger) !important;
//           }

//           /* toolbar buttons */
//           .fc-button-primary {
//             background-color: var(--bg-surface-2) !important;
//             border-color: var(--border) !important;
//             color: var(--text-primary) !important;
//             font-size: 0.8rem !important;
//             padding: 0.35rem 0.7rem !important;
//             border-radius: 8px !important;
//             box-shadow: none !important;
//             font-weight: 500 !important;
//           }
//           .fc-button-primary:hover {
//             background-color: var(--bg-surface-3) !important;
//           }
//           .fc-button-primary:not(:disabled):active,
//           .fc-button-primary:not(:disabled).fc-button-active {
//             background-color: var(--color-primary) !important;
//             border-color: var(--color-primary) !important;
//             color: #fff !important;
//           }
//           .fc-button-group .fc-button-primary {
//             border-radius: 0 !important;
//           }
//           .fc-button-group .fc-button-primary:first-child {
//             border-radius: 8px 0 0 8px !important;
//           }
//           .fc-button-group .fc-button-primary:last-child {
//             border-radius: 0 8px 8px 0 !important;
//           }

//           /* events */
//           .fc-event {
//             border-radius: 5px !important;
//             border: none !important;
//             cursor: pointer;
//             transition: filter 0.15s, transform 0.15s;
//           }
//           .fc-event:hover {
//             filter: brightness(1.12);
//             transform: translateY(-1px);
//           }
//           /* deadline events: dashed left border accent */
//           .fc-event[style*="#ef4444"] {
//             border-left: 3px solid rgba(255,255,255,0.5) !important;
//           }

//           /* toolbar title */
//           .fc-toolbar-title {
//             color: var(--text-primary) !important;
//             font-size: 1.1rem !important;
//             font-weight: 600 !important;
//           }

//           /* time grid labels */
//           .fc-timegrid-slot-label-cushion {
//             color: var(--text-muted) !important;
//             font-size: 0.75rem !important;
//           }

//           /* more-events popover */
//           .fc-popover {
//             background: var(--bg-surface) !important;
//             border: 1px solid var(--border) !important;
//             border-radius: 10px !important;
//             box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
//           }
//           .fc-popover-header {
//             background: var(--bg-surface-2) !important;
//             color: var(--text-primary) !important;
//             border-radius: 9px 9px 0 0 !important;
//             padding: 0.5rem 0.75rem !important;
//             font-size: 0.8rem !important;
//             font-weight: 600 !important;
//           }

//           /* mobile toolbar stacking */
//           @media (max-width: 640px) {
//             .fc-toolbar {
//               gap: 6px !important;
//             }
//             .fc-toolbar-title {
//               font-size: 0.95rem !important;
//             }
//             .fc-button-primary {
//               padding: 0.3rem 0.5rem !important;
//               font-size: 0.75rem !important;
//             }
//           }
//         `,
//           }}
//         />
//       </section>
//     </div>
//   );
// }

// // ─── stat card ───────────────────────────────────────────────────────────────

// function StatCard({
//   title,
//   value,
//   icon,
//   color,
//   description,
// }: {
//   title: string;
//   value: string;
//   icon: React.ReactNode;
//   color: string;
//   description: string;
// }) {
//   return (
//     <div
//       className="card"
//       style={{
//         padding: "1.5rem",
//         background: "var(--bg-surface-2)",
//         transition: "transform 0.2s",
//         cursor: "default",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//           marginBottom: "1rem",
//         }}
//       >
//         <div
//           style={{
//             padding: "0.75rem",
//             borderRadius: "12px",
//             background: `${color}18`,
//             color,
//           }}
//         >
//           {icon}
//         </div>
//         <TrendingUp size={16} color="var(--color-success)" />
//       </div>
//       <div
//         style={{
//           fontSize: "0.9rem",
//           color: "var(--text-muted)",
//           marginBottom: "0.25rem",
//         }}
//       >
//         {title}
//       </div>
//       <div style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
//         {value}
//       </div>
//       <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
//         {description}
//       </div>
//     </div>
//   );
// }



























import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
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
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", // Changed to fixed to cover viewport on all screens
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          borderRadius: "16px",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "380px",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: event.backgroundColor,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {event.title}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "0.2rem",
              marginLeft: "0.5rem",
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* type badge */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.25rem 0.6rem",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 700,
              background: event.isDeadline
                ? "rgba(239,68,68,0.12)"
                : "rgba(99,179,237,0.12)",
              color: event.isDeadline ? "#ef4444" : "#60a5fa",
              border: event.isDeadline
                ? "1px solid rgba(239,68,68,0.25)"
                : "1px solid rgba(99,179,237,0.25)",
            }}
          >
            {event.isDeadline ? (
              <>
                <Flag size={11} /> Delivery Deadline
              </>
            ) : (
              <>
                <Clock size={11} /> Shoot / Event
              </>
            )}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.25rem 0.6rem",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 600,
              background: "var(--bg-surface-2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {event.type === "Maternity" ? (
              <Baby size={11} />
            ) : event.type === "Influencer" ? (
              <Megaphone size={11} />
            ) : (
              <Building2 size={11} />
            )}
            {event.type}
          </span>
        </div>

        {/* date/time */}
        <div
          style={{
            padding: "0.75rem",
            background: "var(--bg-surface-2)",
            borderRadius: "10px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Calendar size={14} color="var(--color-primary)" />
          {event.isDeadline
            ? formatDateOnly(event.start)
            : formatDate(event.start)}
        </div>

        {/* status */}
        {event.status && (
          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            Status:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {event.status}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── calendar legend ─────────────────────────────────────────────────────────

function CalendarLegend() {
  const items = [
    {
      label: "Maternity Shoot",
      color: "#f472b6",
      icon: <Baby size={11} />,
    },
    {
      label: "Influencer Shoot",
      color: "#60a5fa",
      icon: <Megaphone size={11} />,
    },
    {
      label: "Corporate Event",
      color: "#4ade80",
      icon: <Building2 size={11} />,
    },
    {
      label: "Delivery Deadline",
      color: "#ef4444",
      icon: <Flag size={11} />,
      dashed: true,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem 1rem",
        marginBottom: "1rem",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: item.dashed ? "4px" : "50%",
              background: `${item.color}22`,
              border: item.dashed
                ? `2px dashed ${item.color}`
                : `2px solid ${item.color}`,
              color: item.color,
            }}
          >
            {item.icon}
          </span>
          {item.label}
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

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [visibleShoots, setVisibleShoots] = useState(3);
  const [visibleDeadlines, setVisibleDeadlines] = useState(3);
  const [visibleCompleted, setVisibleCompleted] = useState(3);
  const [activeTab, setActiveTab] = useState<'shoots' | 'deadlines'>('shoots');

  const { data: userData } = useQuery({
    queryKey: ["user-me"],
    queryFn: getMe,
  });

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const result = await syncAllRecords();
      setSyncMessage(result.message);
    } catch (err: any) {
      setSyncMessage(err.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = userData?.user?.googleCalendarConnected;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview,
  });

  const handleConnectGoogle = async () => {
    try {
      const { url } = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      console.error("Failed to get Google Auth URL", err);
    }
  };

  // FullCalendar event click handler
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

  // Custom event content — adds icon prefix based on type/deadline
  const renderEventContent = useCallback((info: any) => {
    const { isDeadline, type } = info.event.extendedProps;
    const icon = isDeadline ? "🚩" : type === "Maternity" ? "🤱" : type === "Influencer" ? "📣" : "🏢";
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          overflow: "hidden",
          padding: "1px 4px",
          fontSize: "0.78rem",
          fontWeight: isDeadline ? 700 : 500,
          opacity: 0.95,
        }}
      >
        <span style={{ fontSize: "10px", flexShrink: 0 }}>{icon}</span>
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {info.event.title}
        </span>
      </div>
    );
  }, []);

  if (isLoading)
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        Loading Dashboard Stats...
      </div>
    );
  if (isError)
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--color-danger)",
        }}
      >
        Error: {(error as Error).message}
      </div>
    );
  if (!data) return null;

  const { globalTotals, categorySplit, calendarEvents, upcomingShoots = [], upcomingDeadlines = [] } = data;

  return (
    <div className="dashboard-overview animate-fade-up">
      {/* ── header ── */}
      <header style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: isTablet ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isTablet ? "flex-start" : "center",
            gap: "1.5rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: isMobile ? "2rem" : "2.5rem",
                fontWeight: 700,
                margin: "0 0 0.5rem 0",
                background:
                  "linear-gradient(to right, var(--color-primary), var(--color-accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CRM Overview
            </h1>
            <p
              style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
            >
              Unified metrics across all modules.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              width: isTablet ? "100%" : "auto",
            }}
          >
            {isConnected ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(74, 222, 128, 0.1)",
                    color: "var(--color-success)",
                    border: "1px solid rgba(74, 222, 128, 0.2)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    flex: isTablet ? "1" : "none",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{isMobile ? "Connected" : "Google Calendar: Connected"}</span>
                </div>
                <button
                  onClick={handleSyncAll}
                  disabled={syncing}
                  className="btn-ghost"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1rem",
                    borderRadius: "10px",
                    flex: isTablet ? "1" : "none",
                    justifyContent: "center",
                  }}
                >
                  <RefreshCw
                    size={16}
                    className={syncing ? "animate-spin" : ""}
                  />
                  <span>{syncing ? "Syncing..." : "Sync"}</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectGoogle}
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "10px",
                  width: isTablet ? "100%" : "auto",
                  justifyContent: "center",
                }}
              >
                <Calendar size={18} />
                Connect Google
              </button>
            )}
          </div>
        </div>

        {(googleConnected ||
          searchParams.get("googleError") ||
          syncMessage) && (
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: searchParams.get("googleError")
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(74, 222, 128, 0.1)",
                color: searchParams.get("googleError")
                  ? "var(--color-danger)"
                  : "var(--color-success)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                border: searchParams.get("googleError")
                  ? "1px solid rgba(239, 68, 68, 0.2)"
                  : "1px solid rgba(74, 222, 128, 0.2)",
                fontSize: "0.9rem",
              }}
            >
              {searchParams.get("googleError") ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>
                {searchParams.get("googleError")
                  ? `Connection failed: ${searchParams.get("googleError")}`
                  : syncMessage || "Google Calendar connected!"}
              </span>
            </div>
          )}
      </header>

      {/* ── global stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        <StatCard
          title="Total Revenue"
          value={formatCurrency(globalTotals.totalRevenue)}
          icon={<TrendingUp size={24} />}
          color="var(--color-primary)"
          description="Gross contract value"
        />
        <StatCard
          title="Total Received"
          value={formatCurrency(globalTotals.totalAdvance)}
          icon={<CreditCard size={24} />}
          color="var(--color-success)"
          description="Payments collected"
        />
        <StatCard
          title="Total Outstanding"
          value={formatCurrency(globalTotals.totalBalance)}
          icon={<AlertCircle size={24} />}
          color="var(--color-warning)"
          description="Pending balances"
        />
      </div>

      {/* ── breakdown + reminders ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        {/* Revenue breakdown */}
        <section className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <BarChart3 size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>
              Revenue Breakdown
            </h2>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {categorySplit.map((cat: any) => (
              <div key={cat.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {formatCurrency(cat.revenue)}
                    {globalTotals.totalRevenue > 0
                      ? ` (${(
                        (cat.revenue / globalTotals.totalRevenue) *
                        100
                      ).toFixed(0)}%)`
                      : ""}
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "var(--bg-surface-3)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${globalTotals.totalRevenue > 0
                        ? (cat.revenue / globalTotals.totalRevenue) * 100
                        : 0
                        }%`,
                      background:
                        cat.revenue > 0 ? cat.color : "var(--bg-surface-3)",
                      borderRadius: "3px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reminders section: Shoots & Deadlines */}
        <section className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              justifyContent: "space-between",
              flexWrap: "wrap"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Calendar size={20} color="var(--color-warning)" />
              <h2 style={{ fontSize: "1.1rem", margin: 0, whiteSpace: "nowrap" }}>Upcoming</h2>
            </div>

            {/* Segmented Toggle */}
            <div style={{
              display: "flex",
              background: "var(--bg-surface-3)",
              padding: "3px",
              borderRadius: "8px",
              border: "1px solid var(--border)"
            }}>
              <button
                onClick={() => setActiveTab('shoots')}
                style={{
                  padding: "0.3rem 0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === 'shoots' ? "var(--bg-surface)" : "transparent",
                  color: activeTab === 'shoots' ? "var(--color-primary)" : "var(--text-muted)",
                  boxShadow: activeTab === 'shoots' ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s"
                }}
              >
                Shoots
              </button>
              <button
                onClick={() => setActiveTab('deadlines')}
                style={{
                  padding: "0.3rem 0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === 'deadlines' ? "var(--bg-surface)" : "transparent",
                  color: activeTab === 'deadlines' ? "var(--color-primary)" : "var(--text-muted)",
                  boxShadow: activeTab === 'deadlines' ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s"
                }}
              >
                Deadlines
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* 1. Upcoming Shoots Part */}
            {activeTab === 'shoots' && (
              <div className="animate-fade-in">
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem"
                }}>
                  <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700, margin: 0 }}>
                    Upcoming Shoots
                  </h3>
                  {upcomingShoots.length > visibleShoots && (
                    <button
                      onClick={() => setVisibleShoots(prev => prev + 3)}
                      style={{
                        background: "none", border: "none", color: "var(--color-primary)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: "4px"
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-surface-3)")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                    >
                      View More (+3)
                    </button>
                  )}
                  {visibleShoots > 3 && (
                    <button
                      onClick={() => setVisibleShoots(3)}
                      style={{
                        background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: "4px"
                      }}
                    >
                      Show Less
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {upcomingShoots.length === 0 ? (
                    <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", fontSize: "0.8rem" }}>
                      No shoots scheduled for the next 7 days.
                    </div>
                  ) : (
                    upcomingShoots.slice(0, visibleShoots).map((shoot: any) => (
                      <div key={shoot.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", background: "var(--bg-surface-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)"
                        }}>
                          {shoot.type === "Maternity" ? <Baby size={16} /> : shoot.type === "Influencer" ? <Megaphone size={16} /> : <Building2 size={16} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {shoot.clientName}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {shoot.type} · {new Date(shoot.date).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--bg-surface-3)", color: "var(--text-secondary)" }}>
                          {shoot.daysRemaining === 0 ? "Today" : `${shoot.daysRemaining}d`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 2. Upcoming Deadlines Part */}
            {activeTab === 'deadlines' && (
              <div className="animate-fade-in">
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem"
                }}>
                  <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700, margin: 0 }}>
                    Upcoming Deadlines
                  </h3>
                  {upcomingDeadlines.length > visibleDeadlines && (
                    <button
                      onClick={() => setVisibleDeadlines(prev => prev + 3)}
                      style={{
                        background: "none", border: "none", color: "var(--color-primary)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: "4px"
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-surface-3)")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                    >
                      View More (+3)
                    </button>
                  )}
                  {visibleDeadlines > 3 && (
                    <button
                      onClick={() => setVisibleDeadlines(3)}
                      style={{
                        background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: "4px"
                      }}
                    >
                      Show Less
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {upcomingDeadlines.length === 0 ? (
                    <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", fontSize: "0.8rem" }}>
                      No deadlines for the next 7 days.
                    </div>
                  ) : (
                    upcomingDeadlines.slice(0, visibleDeadlines).map((deadline: any) => (
                      <div key={deadline.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", background: "rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-danger)"
                        }}>
                          <Flag size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {deadline.clientName}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {deadline.type} · {new Date(deadline.date).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--color-danger)", color: "#fff" }}>
                          {deadline.daysRemaining === 0 ? "Today" : `${deadline.daysRemaining}d`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <AlertCircle size={12} color="var(--color-primary)" />
            <span>Criteria: Active (Not Completed/Cancelled) items for the next 7 days.</span>
          </div>
        </section>

        {/* 3. Recently Completed / Cancelled Section */}
        <section className="card" style={{ padding: "1.5rem" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <CheckCircle2 size={20} color="var(--color-success)" />
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Recently Completed</h2>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {data.recentlyCompleted.length > visibleCompleted && (
                <button
                  onClick={() => setVisibleCompleted(prev => prev + 3)}
                  style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                >
                  View More (+3)
                </button>
              )}
              {visibleCompleted > 3 && (
                <button
                  onClick={() => setVisibleCompleted(3)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Show Less
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {data.recentlyCompleted.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                No items completed or cancelled this week.
              </div>
            ) : (
              data.recentlyCompleted.slice(0, visibleCompleted).map((item: any) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: item.status === 'Cancelled' ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: item.status === 'Cancelled' ? "var(--color-danger)" : "var(--color-success)"
                  }}>
                    {item.status === 'Cancelled' ? <X size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.clientName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {item.type} · {new Date(item.date).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {formatCurrency(item.total)}
                    </div>
                    <div style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: item.paymentStatus === 'Done' ? "var(--color-success)" : "var(--color-warning)",
                      textTransform: "uppercase"
                    }}>
                      Payment: {item.paymentStatus} {item.paymentStatus === 'Due' && `(${formatCurrency(item.balance)})`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <AlertCircle size={12} color="var(--color-success)" />
            <span>Items completed or cancelled in the last 7 days.</span>
          </div>
        </section>

      </div>

      {/* ── calendar ── */}
      <section
        className="card animate-fade-up"
        style={{ padding: "1.25rem", marginBottom: "2.5rem", position: "relative" }}
      >
        {/* section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Calendar size={20} color="var(--color-primary)" />
          <h2
            style={{ fontSize: "1.1rem", margin: 0, fontWeight: 600 }}
          >
            Schedule &amp; Deadlines
          </h2>
          {isConnected && !isMobile && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <CheckCircle2 size={14} color="var(--color-success)" />
              Live Sync Active
            </span>
          )}
        </div>

        {/* legend */}
        <CalendarLegend />

        {/* calendar wrapper */}
        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid var(--border)",
            background: "var(--bg-surface)",
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            // ── critical: IST timezone ──
            timeZone="Asia/Kolkata"
            // ── Mobile/Tablet views ──
            initialView={isMobile ? "timeGridDay" : isTablet ? "timeGridWeek" : "dayGridMonth"}
            // ── toolbar: compact on mobile ──
            headerToolbar={
              isMobile
                ? {
                  left: "prev,next",
                  center: "title",
                  right: "today",
                }
                : isTablet
                  ? {
                    left: "prev,next today",
                    center: "title",
                    right: "timeGridWeek,timeGridDay",
                  }
                  : {
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }
            }
            footerToolbar={
              isMobile
                ? {
                  center: "dayGridMonth,timeGridWeek,timeGridDay",
                }
                : false
            }
            events={calendarEvents || []}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            // ── time display ──
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: "short",
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: "short",
            }}
            // ── layout ──
            height="auto"
            contentHeight={isMobile ? 500 : 640}
            eventDisplay="block"
            // ── show more events cleanly ──
            dayMaxEvents={isMobile ? 2 : 4}
            moreLinkClick="popover"
            // ── highlight today ──
            nowIndicator={true}
          />
        </div>

        {/* event detail modal - now relative to this section */}
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}

        {/* ── injected FullCalendar theme overrides + responsive styles ── */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          /* grid borders */
          .fc-theme-standard td,
          .fc-theme-standard th,
          .fc-theme-standard .fc-scrollgrid {
            border-color: var(--border) !important;
          }

          /* header day names */
          .fc-col-header-cell-cushion {
            color: var(--text-secondary) !important;
            padding: 8px 4px !important;
            text-decoration: none !important;
            font-size: 0.78rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          /* day numbers */
          .fc-daygrid-day-number {
            color: var(--text-secondary) !important;
            text-decoration: none !important;
            font-size: 0.85rem;
          }
          .fc-day-today .fc-daygrid-day-number {
            color: var(--color-primary) !important;
            font-weight: 700;
          }

          /* today highlight */
          .fc-day-today {
            background: rgba(99,102,241,0.04) !important;
          }

          /* now indicator line */
          .fc-timegrid-now-indicator-line {
            border-color: var(--color-danger) !important;
            border-width: 2px !important;
          }
          .fc-timegrid-now-indicator-arrow {
            border-color: var(--color-danger) !important;
          }

          /* toolbar buttons */
          .fc-button-primary {
            background-color: var(--bg-surface-2) !important;
            border-color: var(--border) !important;
            color: var(--text-primary) !important;
            font-size: 0.8rem !important;
            padding: 0.35rem 0.7rem !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            font-weight: 500 !important;
          }
          .fc-button-primary:hover {
            background-color: var(--bg-surface-3) !important;
          }
          .fc-button-primary:not(:disabled):active,
          .fc-button-primary:not(:disabled).fc-button-active {
            background-color: var(--color-primary) !important;
            border-color: var(--color-primary) !important;
            color: #fff !important;
          }
          .fc-button-group .fc-button-primary {
            border-radius: 0 !important;
          }
          .fc-button-group .fc-button-primary:first-child {
            border-radius: 8px 0 0 8px !important;
          }
          .fc-button-group .fc-button-primary:last-child {
            border-radius: 0 8px 8px 0 !important;
          }

          /* events */
          .fc-event {
            border-radius: 5px !important;
            border: none !important;
            cursor: pointer;
            transition: filter 0.15s, transform 0.15s;
          }
          .fc-event:hover {
            filter: brightness(1.12);
            transform: translateY(-1px);
          }
          /* deadline events: dashed left border accent */
          .fc-event[style*="#ef4444"] {
            border-left: 3px solid rgba(255,255,255,0.5) !important;
          }

          /* toolbar title */
          .fc-toolbar-title {
            color: var(--text-primary) !important;
            font-size: 1.1rem !important;
            font-weight: 600 !important;
          }

          /* time grid labels */
          .fc-timegrid-slot-label-cushion {
            color: var(--text-muted) !important;
            font-size: 0.75rem !important;
          }

          /* more-events popover */
          .fc-popover {
            background: var(--bg-surface) !important;
            border: 1px solid var(--border) !important;
            border-radius: 10px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          }
          .fc-popover-header {
            background: var(--bg-surface-2) !important;
            color: var(--text-primary) !important;
            border-radius: 9px 9px 0 0 !important;
            padding: 0.5rem 0.75rem !important;
            font-size: 0.8rem !important;
            font-weight: 600 !important;
          }

          /* ===== RESPONSIVE ADDITIONS ===== */
          @media (max-width: 768px) {
            .fc-toolbar {
              gap: 6px !important;
              flex-wrap: wrap !important;
            }
            .fc-toolbar-title {
              font-size: 0.95rem !important;
            }
            .fc-button-primary {
              padding: 0.3rem 0.5rem !important;
              font-size: 0.75rem !important;
            }
            .fc-col-header-cell-cushion {
              font-size: 0.7rem !important;
              padding: 4px 2px !important;
            }
            .fc-daygrid-day-number {
              font-size: 0.75rem !important;
            }
            .fc-event {
              font-size: 0.7rem !important;
            }
            .fc-timegrid-slot-label-cushion {
              font-size: 0.65rem !important;
            }
          }

          @media (max-width: 1024px) {
            .dashboard-overview .card {
              padding: 1rem !important;
            }
            .dashboard-overview h1 {
              font-size: 1.8rem !important;
            }
            .dashboard-overview h2 {
              font-size: 1rem !important;
            }
            .fc-toolbar-title {
              font-size: 1rem !important;
            }
            .fc-button-primary {
              padding: 0.3rem 0.6rem !important;
              font-size: 0.75rem !important;
            }
          }

          /* Ensure no horizontal overflow on small devices */
          @media (max-width: 640px) {
            .dashboard-overview {
              overflow-x: hidden;
            }
            .fc .fc-scrollgrid-sync-table {
              min-width: 100%;
            }
            .fc-daygrid-day-events {
              margin: 0 2px !important;
            }
          }
        `,
          }}
        />
      </section>
    </div>
  );
}

// ─── stat card ───────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon,
  color,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: "1.5rem",
        background: "var(--bg-surface-2)",
        transition: "transform 0.2s",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            padding: "0.75rem",
            borderRadius: "12px",
            background: `${color}18`,
            color,
          }}
        >
          {icon}
        </div>
        <TrendingUp size={16} color="var(--color-success)" />
      </div>
      <div
        style={{
          fontSize: "0.9rem",
          color: "var(--text-muted)",
          marginBottom: "0.25rem",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
        {description}
      </div>
    </div>
  );
}