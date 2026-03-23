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
        <div style={{ 
          display: "flex", 
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          justifyContent: "space-between", 
          alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
          gap: "1.5rem"
        }}>
          <div>
            <h1 style={{ 
              fontSize: window.innerWidth < 768 ? "2rem" : "2.5rem", 
              fontWeight: 700, 
              margin: "0 0 0.5rem 0", 
              background: "linear-gradient(to right, var(--color-primary), var(--color-accent))", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}>
              CRM Overview
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
              Unified metrics across all modules.
            </p>
          </div>
          <div style={{ 
            display: "flex", 
            gap: "0.75rem",
            flexWrap: "wrap",
            width: window.innerWidth < 768 ? '100%' : 'auto'
          }}>
            {isConnected ? (
              <>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", borderRadius: "10px", 
                  background: "rgba(74, 222, 128, 0.1)", color: "var(--color-success)", border: "1px solid rgba(74, 222, 128, 0.2)", fontSize: "0.85rem", fontWeight: 600,
                  flex: window.innerWidth < 480 ? '1' : 'none', justifyContent: 'center'
                }}>
                  <CheckCircle2 size={16} />
                  <span className="desktop-only text-nowrap">Google Calendar: Connected</span>
                  <span className="mobile-only">Connected</span>
                </div>
                <button 
                  onClick={handleSyncAll}
                  disabled={syncing}
                  className="btn-ghost"
                  style={{ 
                    display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", borderRadius: "10px",
                    flex: window.innerWidth < 480 ? '1' : 'none', justifyContent: 'center'
                  }}
                >
                  <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                  <span>{syncing ? "Syncing..." : "Sync"}</span>
                </button>
              </>
            ) : (
              <button 
                onClick={handleConnectGoogle}
                className="btn-primary"
                style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "10px",
                  width: window.innerWidth < 768 ? '100%' : 'auto', justifyContent: 'center'
                }}
              >
                <Calendar size={18} />
                Connect Google
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
            border: searchParams.get("googleError") ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(74, 222, 128, 0.2)",
            fontSize: "0.9rem"
          }}>
            {searchParams.get("googleError") ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>
              {searchParams.get("googleError") 
                ? `Connection failed: ${searchParams.get("googleError")}`
                : (syncMessage || "Google Calendar connected!")
              }
            </span>
          </div>
        )}
      </header>

      {/* Global Stats Grid */}
      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
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

      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {/* Category Breakdown */}
        <section className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <BarChart3 size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Revenue Breakdown</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {categorySplit.map((cat) => (
              <div key={cat.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  <span style={{ fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {formatCurrency(cat.revenue)} 
                    {globalTotals.totalRevenue > 0 ? ` (${(cat.revenue / globalTotals.totalRevenue * 100).toFixed(0)}%)` : ""}
                  </span>
                </div>
                <div style={{ height: "6px", background: "var(--bg-surface-3)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${globalTotals.totalRevenue > 0 ? (cat.revenue / globalTotals.totalRevenue * 100) : 0}%`, 
                    background: cat.revenue > 0 ? cat.color : "var(--bg-surface-3)", 
                    borderRadius: "3px" 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Priority Reminders */}
        <section className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Calendar size={20} color="var(--color-warning)" />
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Upcoming</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", fontSize: "0.9rem" }}>
                No urgent deadlines.
              </div>
            ) : (
              notifications.slice(0, 5).map((notif: any) => (
                <div key={notif.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: "50%", 
                    background: notif.priority === 'Expired' || notif.priority === 'Critical' ? 'var(--color-danger-glow)' : notif.priority === 'High' || notif.priority === 'Moderate' ? 'var(--color-warning-glow)' : 'var(--bg-surface-3)', 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: notif.priority === 'Expired' || notif.priority === 'Critical' ? 'var(--color-danger)' : notif.priority === 'High' || notif.priority === 'Moderate' ? 'var(--color-warning)' : 'var(--text-muted)'
                  }}>
                    {notif.type === 'Maternity' ? <Baby size={16} /> : notif.type === 'Influencer' ? <Megaphone size={16} /> : <Building2 size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: notif.priority === 'Expired' ? 'var(--color-danger)' : 'inherit' }}>
                      {notif.clientName} {notif.priority === 'Expired' && '(Expired)'}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{notif.type} at {new Date(notif.deadline).toLocaleDateString()}</div>
                  </div>
                  <div style={{ 
                    fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", 
                    background: notif.priority === 'Expired' || notif.priority === 'Critical' ? 'var(--color-danger)' : notif.priority === 'High' ? 'var(--color-warning)' : 'var(--bg-surface-3)',
                    color: notif.priority === 'Expired' || notif.priority === 'Critical' || notif.priority === 'High' ? '#fff' : 'var(--text-secondary)'
                  }}>
                    {notif.priority === 'Expired' ? 'Expired' : notif.daysRemaining === 0 ? 'Today' : `${notif.daysRemaining}d`}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Google Calendar Section */}
      {/* <section className="card animate-fade-up" style={{ padding: "1.25rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <Calendar size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 600 }}>Google Calendar</h2>
          {isConnected && <span className="desktop-only" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "auto" }}>Live Sync Active</span>}
        </div>
        
        <div style={{ 
          width: "100%", 
          height: window.innerWidth < 768 ? "400px" : "600px", 
          borderRadius: "8px", 
          overflow: "hidden", 
          border: "1px solid var(--border)",
          background: "#fff" 
        }}>
          <iframe 
            src={`https://calendar.google.com/calendar/u/0/embed?src=primary&ctz=Asia/Kolkata&mode=${window.innerWidth < 768 ? 'AGENDA' : 'WEEK'}&showPrint=0&showTabs=0&showCalendars=0`} 
            style={{ border: 0, width: "100%", height: "100%" }} 
            frameBorder="0" 
            scrolling="no"
          ></iframe>
        </div>
        <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Tip: Log in to Google to see your events.
        </p>
      </section> */}
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
