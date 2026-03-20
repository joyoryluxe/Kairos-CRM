import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "@/api/dashboard";
import { getGoogleAuthUrl, syncAllRecords } from "@/api/googleAuth";
import { getMe } from "@/api/auth";
import { TrendingUp, CreditCard, AlertCircle, Calendar, BarChart3, Baby, Megaphone, Building2, CheckCircle2, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function DashboardOverviewPage() {
  const [searchParams] = useSearchParams();
  const googleConnected = searchParams.get("googleConnected");

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

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

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading Dashboard Stats...</div>;
  if (isError) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-danger)" }}>Error: {(error as Error).message}</div>;
  if (!data) return null;

  const { globalTotals, categorySplit, notifications } = data;

  return (
    <div className="animate-fade-up">
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 0.5rem 0", background: "linear-gradient(to right, var(--color-primary), var(--color-accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CRM Overview
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              Unified metrics and financial health across all operational modules.
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            {isConnected ? (
              <>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "10px", 
                  background: "rgba(74, 222, 128, 0.1)", color: "var(--color-success)", border: "1px solid rgba(74, 222, 128, 0.2)", fontSize: "0.9rem", fontWeight: 600 
                }}>
                  <CheckCircle2 size={18} />
                  Google Calendar: Connected
                </div>
                <button 
                  onClick={handleSyncAll}
                  disabled={syncing}
                  className="button-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "10px", background: "var(--bg-surface-3)" }}
                >
                  <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Syncing..." : "Sync All Records"}
                </button>
              </>
            ) : (
              <button 
                onClick={handleConnectGoogle}
                className="button-primary"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem", 
                  padding: "0.75rem 1.25rem", 
                  borderRadius: "10px", 
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                <Calendar size={18} />
                Connect Google Calendar
              </button>
            )}
          </div>
        </div>

        {(googleConnected || searchParams.get("googleError") || syncMessage) && (
          <div style={{ 
            marginTop: "1.5rem", 
            padding: "1rem", 
            background: searchParams.get("googleError") ? "rgba(239, 68, 68, 0.1)" : "rgba(74, 222, 128, 0.1)", 
            color: searchParams.get("googleError") ? "var(--color-danger)" : "var(--color-success)", 
            borderRadius: "10px", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem",
            border: searchParams.get("googleError") ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(74, 222, 128, 0.2)"
          }}>
            {searchParams.get("googleError") ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>
              {searchParams.get("googleError") 
                ? `Connection failed: ${searchParams.get("googleError")}. Please check your Google Console "Test users" list.`
                : (syncMessage || "Google Calendar connected successfully! Your shoots will now be synced.")
              }
            </span>
          </div>
        )}
      </header>

      {/* Global Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(globalTotals.totalRevenue)} 
          icon={<TrendingUp size={24} />} 
          color="var(--color-primary)" 
          description="Gross contract value across all modules"
        />
        <StatCard 
          title="Total Received" 
          value={formatCurrency(globalTotals.totalAdvance)} 
          icon={<CreditCard size={24} />} 
          color="var(--color-success)" 
          description="Payments collected to date"
        />
        <StatCard 
          title="Total Outstanding" 
          value={formatCurrency(globalTotals.totalBalance)} 
          icon={<AlertCircle size={24} />} 
          color="var(--color-warning)" 
          description="Pending balance from active clients"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        {/* Category Breakdown */}
        <section className="card" style={{ padding: "2rem", background: "var(--bg-surface-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
            <BarChart3 size={24} color="var(--color-primary)" />
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Revenue Breakdown</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {categorySplit.map((cat) => (
              <div key={cat.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                  <span style={{ fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {formatCurrency(cat.revenue)} 
                    {globalTotals.totalRevenue > 0 ? ` (${(cat.revenue / globalTotals.totalRevenue * 100).toFixed(1)}%)` : " (0%)"}
                  </span>
                </div>
                <div style={{ height: "8px", background: "var(--bg-surface-3)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${globalTotals.totalRevenue > 0 ? (cat.revenue / globalTotals.totalRevenue * 100) : 0}%`, 
                    background: cat.revenue > 0 ? cat.color : "var(--bg-surface-3)", 
                    borderRadius: "4px" 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Priority Reminders */}
        <section className="card" style={{ padding: "2rem", background: "var(--bg-surface-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
            <Calendar size={24} color="var(--color-warning)" />
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Upcoming Deadlines</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                No urgent deadlines found.
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: "50%", 
                    background: notif.priority === 'Critical' ? 'var(--color-danger-glow)' : notif.priority === 'Moderate' ? 'var(--color-warning-glow)' : 'var(--bg-surface-3)', 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: notif.priority === 'Critical' ? 'var(--color-danger)' : notif.priority === 'Moderate' ? 'var(--color-warning)' : 'var(--text-muted)'
                  }}>
                    {notif.type === 'Maternity' ? <Baby size={20} /> : notif.type === 'Influencer' ? <Megaphone size={20} /> : <Building2 size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{notif.clientName}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{notif.type} â€¢ {new Date(notif.deadline).toLocaleDateString()}</div>
                  </div>
                  <div style={{ 
                    fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.5rem", borderRadius: "4px", 
                    background: notif.priority === 'Critical' ? 'var(--color-danger)' : notif.priority === 'Moderate' ? 'var(--color-warning)' : 'var(--bg-surface-3)',
                    color: notif.priority === 'Critical' || notif.priority === 'Moderate' ? '#fff' : 'var(--text-secondary)'
                  }}>
                    {notif.daysRemaining <= 0 ? 'OVERDUE' : `${notif.daysRemaining}d left`}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Google Calendar Section */}
      <section className="card animate-fade-up" style={{ padding: "1.5rem", background: "var(--bg-surface-2)", marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Calendar size={24} color="var(--color-primary)" />
          <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 600 }}>Google Calendar View</h2>
          {isConnected && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "auto" }}>Live Sync Active</span>}
        </div>
        
        <div style={{ 
          width: "100%", 
          height: "600px", 
          borderRadius: "12px", 
          overflow: "hidden", 
          border: "1px solid var(--border)",
          background: "#fff" 
        }}>
          <iframe 
            src="https://calendar.google.com/calendar/u/0/embed?src=primary&ctz=Asia/Kolkata&mode=WEEK&showPrint=0&showTabs=0&showCalendars=0" 
            style={{ border: 0, width: "100%", height: "100%" }} 
            frameBorder="0" 
            scrolling="no"
          ></iframe>
        </div>
        <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Tip: You must be logged into your Google account in this browser to see your personal events.
        </p>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, color, description }: { title: string; value: string; icon: React.ReactNode; color: string; description: string }) {
  return (
    <div className="card" style={{ padding: "1.5rem", background: "var(--bg-surface-2)", transition: "transform 0.2s", cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div style={{ padding: "0.75rem", borderRadius: "12px", background: `${color}15`, color: color }}>
          {icon}
        </div>
        <TrendingUp size={16} color="var(--color-success)" />
      </div>
      <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{title}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{description}</div>
    </div>
  );
}
