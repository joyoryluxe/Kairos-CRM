import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
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
  Flag,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

import StatCard from "@/components/StatCard";
import {
  getStudioExpenses,
  createStudioExpense,
  updateStudioExpense,
  deleteStudioExpense,
  type StudioExpense
} from "@/api/studioExpenses";

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

// ─── Section Card Component ────────────────────────────────────────────────
function DashboardSection({ title, icon, children, action }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  const { isMobile } = useIsMobile();
  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.5)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: isMobile ? "1rem" : "1.5rem",
      padding: isMobile ? "1.25rem" : "1.75rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      height: "100%",
      boxSizing: "border-box",
      width: "100%",
      maxWidth: isMobile ? "calc(100vw - 2.5rem)" : "100%",
      minWidth: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
          <div style={{ color: "var(--color-primary)", flexShrink: 0 }}>{icon}</div>
          <h2 style={{ fontSize: isMobile ? "1.05rem" : "1.1rem", fontWeight: 800, margin: 0, color: "#f8fafc", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h2>
        </div>
        {action && <div style={{ display: "flex", flexShrink: 0 }}>{action}</div>}
      </div>
      <div style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Birth Date Reminders ───────────────────────────────────────────────────

function BirthDateReminderCard({ reminder }: { reminder: any }) {
  const navigate = useNavigate();
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
    <div
      onClick={() => reminder?.id && navigate(`/dashboard/maternity/${reminder.id}/edit`)}
      style={{
        background: info.bg,
        border: `1px solid ${info.border}`,
        borderRadius: "1rem",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        animation: info.pulse ? "pulse-red 2s infinite" : "none",
        transition: "all 0.3s ease",
        cursor: "pointer"
      }}
    >
      <div style={{
        width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center", color: info.color
      }}>
        <Baby size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: "1rem", color: "#f8fafc" }}>{reminder.clientName}</div>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: info.color, textTransform: "uppercase", letterSpacing: "0.02em" }}>{info.text}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>Due Date</div>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f8fafc" }}>{formatDateOnly(reminder.dueDate)}</div>
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
        background: "rgba(15, 23, 42, 0.8)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(30, 41, 59, 0.95)",
          borderRadius: "2rem",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "440px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: event.backgroundColor }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: event.backgroundColor, boxShadow: `0 0 12px ${event.backgroundColor}` }} />
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.02em" }}>{event.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#94a3b8", padding: "0.5rem", borderRadius: "50%", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
          <span style={{
            padding: "0.5rem 1rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase",
            background: event.isDeadline ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)",
            color: event.isDeadline ? "#ef4444" : "#3b82f6",
            border: `1px solid ${event.isDeadline ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)"}`
          }}>
            {event.isDeadline ? "Deadline" : "Shoot Event"}
          </span>
          <span style={{
            padding: "0.5rem 1rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 700,
            background: "rgba(255,255,255,0.05)", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.1)"
          }}>
            {event.type}
          </span>
        </div>

        <div style={{
          background: "rgba(15, 23, 42, 0.4)", borderRadius: "1.5rem", padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem"
        }}>
          <Calendar size={24} color="var(--color-primary)" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.2rem" }}>Scheduled Date</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f8fafc" }}>{event.isDeadline ? formatDateOnly(event.start) : formatDate(event.start)}</div>
          </div>
        </div>

        {event.status && (
          <div style={{ padding: "1rem 1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)", fontSize: "0.9rem" }}>
            <span style={{ color: "#94a3b8", fontWeight: 600 }}>STATUS:</span>
            <span style={{ color: "#f8fafc", fontWeight: 800, marginLeft: "0.75rem" }}>{event.status}</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function DashboardOverviewPage() {
  const { isMobile } = useIsMobile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const navigateToForm = useCallback((type: string, recordId: string) => {
    if (!recordId || !type) return;
    const t = type.toLowerCase();
    if (t === 'maternity') navigate(`/dashboard/maternity/${recordId}/edit`);
    else if (t === 'influencer') navigate(`/dashboard/influencer/${recordId}/edit`);
    else if (t === 'corporate') navigate(`/dashboard/corporate/${recordId}/edit`);
    else if (t === 'lead' || t === 'leads') navigate(`/dashboard/leads/${recordId}/edit`);
    else if (t === 'edit' || t === 'edits') navigate(`/dashboard/edits/${recordId}/edit`);
  }, [navigate]);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'shoots' | 'deadlines'>('shoots');

  // Parse Google Calendar feedback parameters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("googleConnected");
    const errorMsg = params.get("googleError");

    if (connected) {
      setSyncResult({
        success: true,
        message: "Google Calendar linked successfully! Background sync is active.",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setSyncResult(null), 7000);
    } else if (errorMsg) {
      setSyncResult({
        success: false,
        message: errorMsg,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setSyncResult(null), 8000);
    }
  }, []);

  // Studio Expense State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<StudioExpense | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "Other",
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
    setExpenseForm({ amount: 0, date: new Date().toISOString().split('T')[0], category: "Other", notes: "" });
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: StudioExpense) => {
    setEditingExpense(expense);
    setExpenseForm({ amount: expense.amount, date: new Date(expense.date).toISOString().split('T')[0], category: expense.category || "Other", notes: expense.notes || "" });
    setIsExpenseModalOpen(true);
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncAllRecords();
      // Invalidate queries so newly synced calendar items load immediately
      await queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });

      setSyncResult({
        success: true,
        message: res?.message || "Successfully synced records with Google Calendar!",
      });

      setTimeout(() => {
        setSyncResult((prev) => (prev?.message.includes("Successfully") ? null : prev));
      }, 6000);
    } catch (err: any) {
      console.error("Sync failed", err);
      setSyncResult({
        success: false,
        message: err?.response?.data?.message || err?.message || "Failed to sync records with Google Calendar.",
      });
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
    if (ep && ep.recordId && ep.type) {
      navigateToForm(ep.type, ep.recordId);
    } else {
      // Fallback if recordId is missing for any reason
      setSelectedEvent({
        title: info.event.title,
        start: info.event.startStr,
        type: ep?.type || "Event",
        status: ep?.status || "",
        isDeadline: !!ep?.isDeadline,
        backgroundColor: info.event.backgroundColor,
      });
    }
  }, [navigateToForm]);

  const renderEventContent = useCallback((info: any) => {
    const { isDeadline, type } = info.event.extendedProps;
    const icon = isDeadline ? "🚩" : type === "Maternity" ? "🤱" : type === "Influencer" ? "📣" : "🏢";
    const backgroundColor = info.event.backgroundColor || "#94a3b8";
    const eventBg = isDeadline ? "rgba(239, 68, 68, 0.25)" : `${backgroundColor}${Math.round(0.25 * 255).toString(16).padStart(2, '0')}`;

    return (
      <div style={{
        display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", padding: "4px 8px", borderRadius: "6px",
        background: eventBg, backdropFilter: "blur(4px)", borderLeft: `3px solid ${backgroundColor}`, fontSize: "0.75rem",
        fontWeight: 800, height: "100%", width: "100%", color: "#f8fafc", boxSizing: "border-box"
      }}>
        <span style={{ fontSize: "12px", flexShrink: 0 }}>{icon}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{info.event.title}</span>
      </div>
    );
  }, []);

  if (isLoading) return <div style={{ padding: "10rem 2rem", textAlign: "center", color: "#94a3b8", fontSize: "1.2rem", fontWeight: 700 }}>Preparing Dashboard...</div>;
  if (isError) return <div style={{ padding: "10rem 2rem", textAlign: "center", color: "#ef4444" }}>Error: {(error as Error).message}</div>;
  if (!data) return null;

  const {
    globalTotals, categorySplit, calendarEvents, upcomingShoots = [],
    upcomingDeadlines = [], recentlyCompleted = [], leadStats = { booked: 0 },
    birthDateReminders = []
  } = data;
  const isConnected = userData?.user?.googleCalendarConnected;

  return (
    <div style={{ padding: isMobile ? "0.25rem" : "0.5rem", animation: "fade-up 0.5s ease-out", width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>

      {/* ── Premium Floating Feedback Banner ── */}
      {syncResult && (
        <div style={{
          position: "fixed",
          top: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2500,
          background: syncResult.success
            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))"
            : "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
          backdropFilter: "blur(12px)",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "1rem",
          boxShadow: syncResult.success
            ? "0 20px 40px -15px rgba(16, 185, 129, 0.5)"
            : "0 20px 40px -15px rgba(239, 68, 68, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          animation: "slide-down-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          maxWidth: "90vw",
          width: "max-content",
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            {syncResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.01em" }}>
            {syncResult.message}
          </div>
          <button
            onClick={() => setSyncResult(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.8)",
              cursor: "pointer",
              padding: "0.25rem",
              marginLeft: "0.5rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ marginBottom: isMobile ? "2rem" : "3rem", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.25rem", textAlign: isMobile ? "center" : "left", width: "100%", boxSizing: "border-box" }}>
          <div style={{ flex: "1 1 min(100%, 400px)", minWidth: 0 }}>
            <h1 style={{
              fontSize: isMobile ? "1.75rem" : "3rem", fontWeight: 950, margin: 0,
              background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-0.05em",
              wordBreak: "break-word"
            }}>
              Executive Overview
            </h1>
            <p style={{ color: "#64748b", fontSize: isMobile ? "0.95rem" : "1.1rem", fontWeight: 500, marginTop: "0.25rem" }}>Unified intelligence across all studio modules.</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-end", gap: "0.75rem", flex: "1 1 auto" }}>
            {isConnected ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", width: isMobile ? "100%" : "auto" }}>
                <div style={{
                  flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
                  padding: "0.75rem 1.25rem", borderRadius: "14px", background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "0.9rem", fontWeight: 800, boxSizing: "border-box", whiteSpace: "nowrap"
                }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> <span>G-Calendar Linked</span>
                </div>
                <button onClick={handleSyncAll} disabled={syncing} style={{
                  flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
                  padding: "0.75rem 1.25rem", borderRadius: "14px",
                  background: syncing ? "var(--color-primary)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${syncing ? "var(--color-primary)" : "rgba(255,255,255,0.08)"}`,
                  color: "#f8fafc",
                  cursor: syncing ? "wait" : "pointer",
                  fontWeight: 700,
                  boxSizing: "border-box",
                  whiteSpace: "nowrap",
                  animation: syncing ? "pulse-glow-sync 1.5s infinite" : "none",
                  transition: "all 0.3s ease",
                }}>
                  <RefreshCw size={18} className={syncing ? "animate-custom-spin" : ""} style={{ flexShrink: 0 }} />
                  <span>{syncing ? "Syncing..." : "Sync Now"}</span>
                </button>
              </div>
            ) : (
              <button onClick={handleConnectGoogle} style={{
                flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "0.85rem 1.75rem",
                borderRadius: "14px", background: "var(--color-primary)", color: "white", border: "none",
                fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.4)", width: isMobile ? "100%" : "auto", boxSizing: "border-box", whiteSpace: "nowrap"
              }}>
                <Calendar size={20} style={{ flexShrink: 0 }} /> Link Google Calendar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Stat Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)",
        gap: isMobile ? "0.75rem" : "1rem",
        marginBottom: "3rem",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <StatCard title="Gross Revenue" value={formatCurrency(globalTotals.totalRevenue)} icon={<TrendingUp size={20} />} color="var(--color-primary)" description="Total contracts" />
        <StatCard title="Collected" value={formatCurrency(globalTotals.totalAdvance)} icon={<CreditCard size={20} />} color="#10b981" description="Liquid capital" />
        <StatCard title="Outstanding" value={formatCurrency(globalTotals.totalBalance)} icon={<AlertCircle size={20} />} color="#f59e0b" description="Pending collection" />
        <StatCard title="Net Expenses" value={formatCurrency(globalTotals.totalExpenses)} icon={<CreditCard size={20} />} color="#ef4444" description="Burn rate" />
        <StatCard title="Total Profit" value={formatCurrency(globalTotals.totalProfit)} icon={<BarChart3 size={20} />} color="#8b5cf6" description="Net performance" />
        <StatCard title="Lead Conversion" value={leadStats.booked} icon={<Megaphone size={20} />} color="#3b82f6" description="Booked entities" />
      </div>

      {/* ── Mid Row: Revenue & Reminders ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
        gap: "2rem",
        marginBottom: "3rem",
        width: "100%",
        boxSizing: "border-box"
      }}>

        <DashboardSection title="Revenue Distribution" icon={<BarChart3 size={22} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", boxSizing: "border-box" }}>
            {categorySplit.map((cat: any) => (
              <div key={cat.name} style={{ width: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                    <span style={{ color: "#f8fafc", fontWeight: 800 }}>{formatCurrency(cat.revenue)}</span>
                    <span style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600 }}>({globalTotals.totalRevenue > 0 ? Math.round((cat.revenue / globalTotals.totalRevenue) * 100) : 0}%)</span>
                  </div>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", width: "100%" }}>
                  <div style={{
                    height: "100%", width: `${globalTotals.totalRevenue > 0 ? (cat.revenue / globalTotals.totalRevenue) * 100 : 0}%`,
                    background: cat.color, borderRadius: "4px", transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
                    boxShadow: `0 0 10px ${cat.color}44`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Upcoming Queue"
          icon={<Calendar size={22} />}
          action={
            <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={() => setActiveTab('shoots')} style={{
                padding: "0.4rem 0.8rem", fontSize: "0.75rem", fontWeight: 800, borderRadius: "8px", border: "none", cursor: "pointer",
                background: activeTab === 'shoots' ? "var(--color-primary)" : "transparent",
                color: activeTab === 'shoots' ? "white" : "#64748b", transition: "0.2s"
              }}>SHOOTS</button>
              <button onClick={() => setActiveTab('deadlines')} style={{
                padding: "0.4rem 0.8rem", fontSize: "0.75rem", fontWeight: 800, borderRadius: "8px", border: "none", cursor: "pointer",
                background: activeTab === 'deadlines' ? "#ef4444" : "transparent",
                color: activeTab === 'deadlines' ? "white" : "#64748b", transition: "0.2s"
              }}>DEADLINES</button>
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "400px", overflowY: "auto", paddingRight: "0.5rem", width: "100%", boxSizing: "border-box" }} className="custom-scrollbar">
            {(activeTab === 'shoots' ? upcomingShoots : upcomingDeadlines).slice(0, 10).map((item: any) => (
              <div key={item.id} onClick={() => navigateToForm(item.type, item.id)} style={{
                display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem",
                background: "rgba(255,255,255,0.02)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.05)",
                transition: "transform 0.2s", cursor: "pointer", width: "100%", boxSizing: "border-box", minWidth: 0
              }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(6px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "12px", background: activeTab === 'shoots' ? "rgba(99, 102, 241, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: activeTab === 'shoots' ? "#818cf8" : "#f87171", flexShrink: 0
                }}>
                  {activeTab === 'shoots' ? (item.type === 'Maternity' ? <Baby size={22} /> : item.type === 'Influencer' ? <Megaphone size={22} /> : <Building2 size={22} />) : <Flag size={22} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.clientName}</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.type} · {new Date(item.date).toLocaleDateString("en-IN")}</div>
                </div>
                <div style={{
                  fontSize: "0.75rem", fontWeight: 900, padding: "0.4rem 0.6rem", borderRadius: "8px",
                  background: item.daysRemaining <= 1 ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.05)",
                  color: item.daysRemaining <= 1 ? "#ef4444" : "#94a3b8", border: `1px solid ${item.daysRemaining <= 1 ? "rgba(239, 68, 68, 0.3)" : "rgba(255,255,255,0.1)"}`,
                  flexShrink: 0
                }}>
                  {item.daysRemaining === 0 ? "TODAY" : `${item.daysRemaining}D LEFT`}
                </div>
              </div>
            ))}
            {(activeTab === 'shoots' ? upcomingShoots : upcomingDeadlines).length === 0 && (
              <div style={{ padding: "3rem 1rem", textAlign: "center", background: "rgba(255,255,255,0.01)", borderRadius: "1.25rem", border: "1px dashed rgba(255,255,255,0.05)", color: "#64748b" }}>
                Queue is empty for the next 30 days.
              </div>
            )}
          </div>
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
          `}</style>
        </DashboardSection>
      </div>

      {/* ── Birth Date Reminders (Maternity Specific) ── */}
      {birthDateReminders.length > 0 && (
        <div style={{ width: "100%", boxSizing: "border-box", marginBottom: "3rem" }}>
          <DashboardSection title="Critical Birth Reminders" icon={<AlertCircle size={22} color="#ef4444" />} >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "1rem", width: "100%", boxSizing: "border-box" }}>
              {birthDateReminders.map((rem: any) => (
                <BirthDateReminderCard key={rem.id} reminder={rem} />
              ))}
            </div>
          </DashboardSection>
        </div>
      )}

      {/* ── Recently Completed ── */}
      <div style={{ marginBottom: "3rem", width: "100%", boxSizing: "border-box" }}>
        <DashboardSection title="Recent Accomplishments" icon={<CheckCircle2 size={22} color="#10b981" />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "1.25rem", width: "100%", boxSizing: "border-box" }}>
            {recentlyCompleted.slice(0, 6).map((item: any) => (
              <div key={item.id} onClick={() => navigateToForm(item.type, item.id)} style={{
                display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.25rem",
                background: "rgba(16, 185, 129, 0.03)", borderRadius: "1.5rem", border: "1px solid rgba(16, 185, 129, 0.1)",
                width: "100%", boxSizing: "border-box", minWidth: 0, cursor: "pointer"
              }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", flexShrink: 0 }}>
                  <CheckCircle2 size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.clientName}</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.type} · {formatCurrency(item.total)}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 950, color: item.paymentStatus === 'Done' ? "#10b981" : "#ef4444", textTransform: "uppercase" }}>
                    {item.paymentStatus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      {/* ── Calendar ── */}
      <div style={{ marginBottom: "3rem", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <DashboardSection title="Global Schedule" icon={<Calendar size={22} />}>
          <div style={{ borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(15, 23, 42, 0.3)", width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "auto" }} className="calendar-container custom-scrollbar">
            <div style={{ minWidth: "700px", width: "100%", boxSizing: "border-box" }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                timeZone="Asia/Kolkata"
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: isMobile ? "" : "dayGridMonth,timeGridWeek,timeGridDay"
                }}
                events={calendarEvents || []}
                eventContent={renderEventContent}
                eventClick={handleEventClick}
                height="auto"
                contentHeight={650}
                dayMaxEvents={3}
              />
            </div>
          </div>
          <style>{`
            .calendar-container .fc { --fc-border-color: rgba(255,255,255,0.05); --fc-today-bg-color: rgba(255,255,255,0.03); width: 100% !important; max-width: 100% !important; }
            .calendar-container .fc-header-toolbar { padding: 1.25rem; margin-bottom: 0 !important; background: rgba(255,255,255,0.02); display: flex; flex-wrap: wrap; gap: 0.5rem; }
            .calendar-container .fc-toolbar-title { font-size: 1.15rem !important; font-weight: 800; color: #f8fafc; }
            .calendar-container .fc-button { background: rgba(15, 23, 42, 0.6) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #f8fafc !important; font-weight: 700 !important; text-transform: uppercase !important; font-size: 0.75rem !important; padding: 0.4rem 0.8rem !important; }
            .calendar-container .fc-button-active { background: var(--color-primary) !important; border-color: var(--color-primary) !important; }
            .calendar-container .fc-col-header-cell { padding: 0.75rem 0 !important; background: rgba(15, 23, 42, 0.2); }
            .calendar-container .fc-col-header-cell-cushion { color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
            .calendar-container .fc-daygrid-day-number { color: #94a3b8; font-weight: 700; padding: 8px !important; font-size: 0.8rem; }
            .calendar-container .fc-day-today .fc-daygrid-day-number { color: var(--color-primary); font-weight: 900; }
            .calendar-container .fc-scrollgrid, .calendar-container .fc-scrollgrid-sync-table { border: none !important; width: 100% !important; table-layout: fixed !important; }
            .calendar-container .fc-daygrid-event-harness { max-width: 100% !important; overflow: hidden !important; }
            .calendar-container .fc-event { max-width: 100% !important; overflow: hidden !important; }
            .calendar-container .fc-event-main { overflow: hidden !important; width: 100% !important; }
            .calendar-container .fc-daygrid-day-frame { overflow: hidden !important; }
          `}</style>
        </DashboardSection>
      </div>

      {/* ── Studio Expenses ── */}
      <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <DashboardSection
          title="Studio Ledger"
          icon={<CreditCard size={22} color="#ef4444" />}
          action={
            <button onClick={() => { resetExpenseForm(); setIsExpenseModalOpen(true); }} style={{
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.25rem",
              borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.2)", fontWeight: 800, cursor: "pointer", flexShrink: 0
            }}>
              <Plus size={16} /> New Entry
            </button>
          }
        >
          <div style={{ overflowX: "auto", background: "rgba(15, 23, 42, 0.2)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.05)", width: "100%", maxWidth: "100%", boxSizing: "border-box" }} className="custom-scrollbar">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "550px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "left" }}>
                  <th style={{ padding: "1.25rem", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Date</th>
                  <th style={{ padding: "1.25rem", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Category</th>
                  <th style={{ padding: "1.25rem", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Amount</th>
                  <th style={{ padding: "1.25rem", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Notes</th>
                  <th style={{ padding: "1.25rem", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expensesData?.map((expense: StudioExpense) => (
                  <tr key={expense._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "1.25rem", color: "#f8fafc", fontWeight: 600 }}>{new Date(expense.date).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "1.25rem" }}>
                      <span style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {expense.category}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem", fontWeight: 800, color: "#ef4444", whiteSpace: "nowrap" }}>{formatCurrency(expense.amount)}</td>
                    <td style={{ padding: "1.25rem", color: "#64748b", fontSize: "0.9rem" }}>{expense.notes || "—"}</td>
                    <td style={{ padding: "1.25rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                        <button onClick={() => handleEditExpense(expense)} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer" }}><Pencil size={18} /></button>
                        <button onClick={() => { if (confirm("Delete this entry?")) deleteExpenseMutation.mutate(expense._id!); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      </div>


      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.8)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(12px)" }}>
          <div style={{ background: "rgba(30, 41, 59, 0.95)", borderRadius: "2rem", padding: "2.5rem", width: "100%", maxWidth: "450px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <h3 style={{ margin: "0 0 2rem 0", fontSize: "1.5rem", fontWeight: 900, color: "#f8fafc" }}>{editingExpense ? "Modify Entry" : "New Ledger Entry"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase" }}>Amount (INR)</label>
                <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15, 23, 42, 0.3)", color: "white", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase" }}>Effective Date</label>
                <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15, 23, 42, 0.3)", color: "white", outline: "none", colorScheme: "dark" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase" }}>Category</label>
                <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15, 23, 42, 0.3)", color: "white", outline: "none" }}>
                  <option value="Rent">Rent</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Staff">Staff</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase" }}>Memo</label>
                <textarea value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15, 23, 42, 0.3)", color: "white", outline: "none", minHeight: "100px" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button onClick={() => setIsExpenseModalOpen(false)} style={{ flex: 1, padding: "1rem", borderRadius: "14px", border: "none", background: "rgba(255,255,255,0.05)", color: "#94a3b8", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                <button
                  onClick={() => editingExpense ? updateExpenseMutation.mutate({ id: editingExpense._id!, data: expenseForm }) : createExpenseMutation.mutate(expenseForm)}
                  disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
                  style={{ flex: 1, padding: "1rem", borderRadius: "14px", border: "none", background: "var(--color-primary)", color: "white", fontWeight: 900, cursor: "pointer" }}
                >
                  {editingExpense ? "Update" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Override default FullCalendar event background/border so custom containers render properly */
        .fc-event, .fc-daygrid-event {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .fc-daygrid-block-event .fc-event-main {
          padding: 0 !important;
        }
        .fc-daygrid-event-harness {
          margin-bottom: 4px !important;
        }

        /* Customize FullCalendar Popover for '+X more' events to act as a beautifully centered overlay */
        .fc-popover {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 90% !important;
          max-width: 320px !important;
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 1.5rem !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
          overflow: hidden !important;
          z-index: 9999 !important;
        }
        .fc-popover-header {
          background: rgba(255, 255, 255, 0.03) !important;
          padding: 1rem 1.25rem !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }
        .fc-popover-title {
          color: #f8fafc !important;
          font-weight: 900 !important;
          font-size: 0.95rem !important;
          letter-spacing: 0.03em !important;
          text-transform: uppercase !important;
        }
        .fc-popover-close {
          color: #94a3b8 !important;
          cursor: pointer !important;
          opacity: 1 !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border-radius: 50% !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 1rem !important;
          transition: all 0.2s ease !important;
        }
        .fc-popover-close:hover {
          color: #f8fafc !important;
          background: rgba(255, 255, 255, 0.1) !important;
          transform: scale(1.05);
        }
        .fc-popover-body {
          padding: 1rem !important;
          background: transparent !important;
          max-height: 240px !important;
          overflow-y: auto !important;
        }
        .fc-popover-body .fc-event {
          margin-bottom: 0.5rem !important;
        }
        .fc-daygrid-more-link {
          color: var(--color-primary) !important;
          font-weight: 800 !important;
          font-size: 0.75rem !important;
          margin-left: 6px !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          background: rgba(99, 102, 241, 0.1) !important;
          transition: all 0.2s ease !important;
        }
        .fc-daygrid-more-link:hover {
          background: rgba(99, 102, 241, 0.2) !important;
        }

        /* Existing Overrides */
        .fc-theme-standard td, .fc-theme-standard th { border-color: rgba(255,255,255,0.05) !important; }
        .fc-col-header-cell { padding: 12px 0 !important; background: rgba(255,255,255,0.02) !important; }
        .fc-col-header-cell-cushion { color: #64748b !important; text-decoration: none !important; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; }
        .fc-button-primary { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.08) !important; color: #f8fafc !important; font-size: 0.8rem !important; font-weight: 800 !important; border-radius: 10px !important; padding: 8px 16px !important; transition: all 0.2s ease !important; }
        .fc-button-primary:hover { background: rgba(255,255,255,0.08) !important; transform: translateY(-1px); }
        .fc-button-active { background: var(--color-primary) !important; color: #fff !important; border-color: var(--color-primary) !important; }
        .fc-day-today { background: rgba(99, 102, 241, 0.05) !important; }
        .fc-daygrid-day-number { font-size: 0.85rem; font-weight: 800; color: #94a3b8; padding: 12px !important; text-decoration: none !important; }
        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 900 !important; color: #f8fafc !important; letter-spacing: -0.02em !important; }
        .fc-scrollgrid { border: none !important; }
        
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes custom-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slide-down-fade {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        @keyframes pulse-glow-sync {
          0%, 100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 25px rgba(139, 92, 246, 0.7); }
        }

        .animate-custom-spin {
          animation: custom-spin 1s linear infinite;
        }

        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      ` }} />
    </div>
  );
}