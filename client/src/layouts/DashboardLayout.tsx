import { useNavigate, Outlet, NavLink, useLocation } from "react-router-dom";
import { Baby, Megaphone, Building2, LogOut, LayoutDashboard, Bell, BellRing, UserCircle, Menu, X as CloseIcon, Package } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "@/api/dashboard";
import { getMe } from "@/api/auth";
import GlobalReminderModal from "@/components/GlobalReminderModal";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview,
    refetchInterval: 60000,
  });

  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: getMe,
    retry: 1,
  });

  const user = authData?.user;

  const notifications = dashboardData?.notifications || [];
  const criticalCount = notifications.filter((n: any) => ['Expired', 'Critical'].includes(n.priority)).length;
  const hasAlerts = notifications.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (window.innerWidth <= 768 && sidebarRef.current && !sidebarRef.current.contains(e.target as Node) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("kairos_token");
    navigate("/login");
  };

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard", exact: true },
    { name: "Maternity / Newborn", icon: Baby, path: "/dashboard/maternity" },
    { name: "Influencer", icon: Megaphone, path: "/dashboard/influencer" },
    { name: "Corporate / Events", icon: Building2, path: "/dashboard/corporate" },
    { name: "Packages", icon: Package, path: "/dashboard/packages" },
  ];

  return (
    <div className="layout-wrapper">
      {isSidebarOpen && <div 
        className="mobile-only" 
        style={{ 
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 95, backdropFilter: "blur(2px)" 
        }} 
        onClick={() => setIsSidebarOpen(false)}
      />}

      <aside 
        ref={sidebarRef}
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", paddingLeft: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "6px",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, color: "#fff", fontSize: "1rem",
              boxShadow: "var(--shadow-primary)",
            }}>K</div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
              KAIROS
            </span>
          </div>
          <button 
            className="mobile-only"
            onClick={() => setIsSidebarOpen(false)}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <CloseIcon size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.75rem", marginBottom: "0.5rem" }}>
            Modules
          </div>
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path) && location.pathname !== "/dashboard";
            
            return (
              <NavLink 
                key={item.path} 
                to={item.path}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.75rem 1rem", borderRadius: "var(--radius-md)",
                  color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--color-primary-glow)" : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all var(--transition)",
                  textDecoration: "none"
                }}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
          <button 
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem", width: "100%",
              padding: "0.75rem 1rem", borderRadius: "var(--radius-md)",
              color: "var(--text-muted)", backgroundColor: "transparent", border: "none",
              fontWeight: 500, cursor: "pointer", fontSize: "0.95rem", textAlign: "left",
              transition: "color var(--transition)"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <button 
            className="mobile-only"
            onClick={() => setIsSidebarOpen(true)}
            style={{ 
              background: "none", border: "none", color: "var(--text-primary)", 
              cursor: "pointer", marginRight: "auto", padding: "0.5rem" 
            }}
          >
            <Menu size={24} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ position: "relative" }} ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{ 
                  background: "none", border: "none", cursor: "pointer", padding: "0.5rem", borderRadius: "50%",
                  color: hasAlerts ? "var(--color-primary)" : "var(--text-muted)",
                  transition: "background 0.2s",
                  position: "relative"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-surface-2)"}
                onMouseOut={(e) => e.currentTarget.style.background = "none"}
              >
                {criticalCount > 0 ? <BellRing size={22} className="animate-pulse" /> : <Bell size={22} />}
                {hasAlerts && (
                  <span style={{ 
                    position: "absolute", top: 4, right: 4, 
                    background: criticalCount > 0 ? "var(--color-danger)" : "var(--color-primary)", 
                    color: "#fff", fontSize: "10px", fontWeight: 700, 
                    minWidth: "16px", height: "16px", borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 0 2px var(--bg-surface)"
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: "0.5rem",
                  width: window.innerWidth < 400 ? "calc(100vw - 2rem)" : "350px", 
                  maxHeight: "450px", overflowY: "auto",
                  background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)",
                  padding: "1rem", zIndex: 110
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                    <h4 style={{ margin: 0 }}>Notifications</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{notifications.length} alerts</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      No pending deadlines
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {notifications.map((n: any) => (
                        <div key={n.id} style={{ 
                          padding: "0.75rem", borderRadius: "var(--radius-md)", 
                          background: n.priority === 'Expired' || n.priority === 'Critical' ? 'var(--color-danger-glow)' : n.priority === 'High' || n.priority === 'Moderate' ? 'var(--color-warning-glow)' : 'var(--bg-surface-2)',
                          border: "1px solid var(--border)", cursor: "pointer"
                        }}
                        onClick={() => {
                          setIsNotifOpen(false);
                          navigate(`/dashboard/${n.type.toLowerCase().replace(' ', '-')}`);
                        }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: n.priority === 'Expired' ? 'var(--color-danger)' : 'inherit' }}>
                              {n.clientName} {n.priority === 'Expired' && '(Expired)'}
                            </span>
                            <span style={{ 
                              fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.35rem", borderRadius: "4px",
                              background: n.priority === 'Expired' || n.priority === 'Critical' ? 'var(--color-danger)' : n.priority === 'High' ? 'var(--color-warning)' : 'var(--bg-surface-3)',
                              color: n.priority === 'Expired' || n.priority === 'Critical' || n.priority === 'High' ? '#fff' : 'var(--text-secondary)'
                            }}>
                              {n.priority === 'Expired' ? 'Expired' : n.daysRemaining === 0 ? 'Today' : `${n.daysRemaining}d`}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            {n.type} at {new Date(n.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderLeft: "1px solid var(--border)", paddingLeft: "1.5rem" }}>
              <div className="desktop-only" style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user?.name || "Loading..."}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                  Admin
                </div>
              </div>
              <NavLink 
                to="/dashboard/profile"
                title="View Profile"
                style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.color = "var(--color-primary)"}
                onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <UserCircle size={32} />
              </NavLink>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
      
      {/* Global Animated Reminder Modal */}
      <GlobalReminderModal notifications={notifications} />
    </div>
  );
}
