import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertTriangle, Baby, Megaphone, Building2,
  X, ChevronRight, Flame, Zap, Timer, ChevronLeft,
} from "lucide-react";

type Tier = "expired" | "day1" | "day3" | "day7";

function getTier(n: any): Tier {
  if (n.priority === "Expired") return "expired";
  if (n.daysRemaining <= 1 || n.priority === "Critical") return "day1";
  if (n.daysRemaining <= 3 || n.priority === "High") return "day3";
  return "day7";
}

function sortByPriority(notifs: any[]) {
  const order: Record<Tier, number> = { expired: 0, day1: 1, day3: 2, day7: 3 };
  return [...notifs].sort((a, b) => {
    const diff = order[getTier(a)] - order[getTier(b)];
    if (diff !== 0) return diff;
    return (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999);
  });
}

function getBadgeLabel(n: any): string {
  if (n.priority === "Expired") return "EXPIRED";
  if (n.daysRemaining === 0) return "TODAY";
  if (n.daysRemaining === 1) return "1 DAY LEFT";
  return `${n.daysRemaining} DAYS LEFT`;
}

// Professional color palette – muted, sophisticated
const TIER_CFG = {
  expired: {
    bg: "linear-gradient(105deg, #1e1e2a 0%, #2d2d3a 100%)",
    border: "#f43f5e",
    accent: "#f43f5e",
    soft: "#fda4af",
    Icon: AlertTriangle,
    label: "DEADLINE EXPIRED",
  },
  day1: {
    bg: "linear-gradient(105deg, #1e1e2a 0%, #2d2d3a 100%)",
    border: "#f97316",
    accent: "#f97316",
    soft: "#fed7aa",
    Icon: Flame,
    label: "DUE TOMORROW",
  },
  day3: {
    bg: "linear-gradient(105deg, #1e1e2a 0%, #2d2d3a 100%)",
    border: "#eab308",
    accent: "#eab308",
    soft: "#fef08a",
    Icon: Zap,
    label: "DUE IN 3 DAYS",
  },
  day7: {
    bg: "linear-gradient(105deg, #1e1e2a 0%, #2d2d3a 100%)",
    border: "#6366f1",
    accent: "#6366f1",
    soft: "#c7d2fe",
    Icon: Timer,
    label: "UPCOMING DEADLINE",
  },
} as const;

const STYLE_ID = "kairos-simple-reminder";
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-100%); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 1; transform: translateY(0); }
      to   { opacity: 0; transform: translateY(-100%); }
    }
    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: currentColor;
      transform-origin: left;
      transition: transform 0.05s linear;
    }
  `;
  document.head.appendChild(style);
}

function TypeIcon({ type, size = 15 }: { type: string; size?: number }) {
  if (type === "Maternity") return <Baby size={size} />;
  if (type === "Influencer") return <Megaphone size={size} />;
  return <Building2 size={size} />;
}

const DISPLAY_MS = 4500;

interface BannerProps {
  n: any;
  index: number;
  total: number;
  exiting: boolean;
  dismissing: boolean;
  onDismissAll: () => void;
  onNext: () => void;
  onPrev: () => void;
  onNavigate: () => void;
  onTimeout: () => void;
}

function Banner({ n, index, total, exiting, dismissing, onDismissAll, onNext, onPrev, onNavigate, onTimeout }: BannerProps) {
  const tier = getTier(n);
  const cfg = TIER_CFG[tier];
  const Icon = cfg.Icon;
  const [hov, setHov] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isHovering, setIsHovering] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startTimer = useCallback((elapsed: number) => {
    cancelAnimation();
    const remaining = Math.max(0, DISPLAY_MS - elapsed);
    if (remaining <= 0) {
      onTimeout();
      return;
    }
    startTimeRef.current = performance.now();
    const animate = (now: number) => {
      if (startTimeRef.current === null) return;
      const delta = now - startTimeRef.current;
      const newElapsed = elapsed + delta;
      const newProgress = Math.max(0, 100 - (newElapsed / DISPLAY_MS) * 100);
      setProgress(newProgress);
      if (newElapsed >= DISPLAY_MS) {
        cancelAnimation();
        onTimeout();
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [cancelAnimation, onTimeout]);

  const pauseTimer = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = performance.now();
      const delta = now - startTimeRef.current;
      elapsedRef.current += delta;
      cancelAnimation();
      startTimeRef.current = null;
    }
  }, [cancelAnimation]);

  const resumeTimer = useCallback(() => {
    if (elapsedRef.current < DISPLAY_MS) {
      startTimer(elapsedRef.current);
    }
  }, [startTimer]);

  useEffect(() => {
    setProgress(100);
    elapsedRef.current = 0;
    startTimer(0);
    return () => cancelAnimation();
  }, [index, startTimer, cancelAnimation]);

  useEffect(() => {
    if (isHovering) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }, [isHovering, pauseTimer, resumeTimer]);

  const animation = dismissing
    ? "slideUp 0.2s cubic-bezier(0.4, 0, 1, 1) forwards"
    : exiting
      ? "slideUp 0.2s cubic-bezier(0.4, 0, 1, 1) forwards"
      : "slideDown 0.3s cubic-bezier(0.2, 0.9, 0.4, 1) forwards";

  return (
    <div
      style={{
        background: cfg.bg,
        borderLeft: `4px solid ${cfg.border}`,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        animation,
        transition: "background 0.2s, box-shadow 0.2s",
        backgroundColor: hov ? "rgba(255, 255, 255, 0.03)" : "transparent",
        backdropFilter: "blur(0px)", // subtle if needed
      }}
      onClick={onNavigate}
      onMouseEnter={() => {
        setHov(true);
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setHov(false);
        setIsHovering(false);
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "0 1rem", height: 56, gap: "0.75rem", position: "relative", zIndex: 1 }}>
        {/* Tier icon + label */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
          <Icon size={14} color={cfg.soft} strokeWidth={2.5} />
          <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", color: cfg.soft, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {cfg.label}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />

        {/* Type icon */}
        <div style={{
          width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
          background: `${cfg.accent}18`, border: `1px solid ${cfg.accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", color: cfg.soft,
        }}>
          <TypeIcon type={n.type} size={14} />
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {n.clientName}
          </div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", marginTop: "2px", display: "flex", gap: "0.5rem" }}>
            <span>{n.type}</span>
            <span>•</span>
            <span>{new Date(n.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        {/* Badge */}
        <span style={{
          background: cfg.accent,
          color: "#fff",
          fontSize: "0.65rem",
          fontWeight: 600,
          padding: "0.25rem 0.75rem",
          borderRadius: "40px",
          flexShrink: 0,
          whiteSpace: "nowrap",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          letterSpacing: "0.02em",
        }}>
          {getBadgeLabel(n)}
        </span>

        {/* Arrow */}
        <ChevronRight size={14} style={{ color: hov ? cfg.soft : "rgba(255,255,255,0.35)", transition: "color 0.2s", flexShrink: 0 }} />

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {total > 1 && (
            <button onClick={onPrev} style={ctrlBtn}>
              <ChevronLeft size={12} />
            </button>
          )}

          {total > 1 && total <= 10 && (
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} style={{
                  width: i === index ? 14 : 5,
                  height: 4,
                  borderRadius: "2px",
                  background: i === index ? cfg.accent : "rgba(255,255,255,0.35)",
                  transition: "all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1)",
                }} />
              ))}
            </div>
          )}

          {total > 10 && (
            <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", minWidth: 30, textAlign: "center" }}>
              {index + 1}/{total}
            </span>
          )}

          {total > 1 && (
            <button onClick={onNext} style={ctrlBtn}>
              <ChevronRight size={12} />
            </button>
          )}

          <button onClick={onDismissAll} style={{ ...ctrlBtn, marginLeft: "2px" }}>
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Progress bar – using transform for better performance */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.12)" }}>
        <div
          className="progress-bar"
          style={{
            width: "100%",
            transform: `scaleX(${progress / 100})`,
            background: cfg.accent,
          }}
        />
      </div>
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "none",
  width: 24,
  height: 24,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "rgba(255,255,255,0.7)",
  transition: "all 0.15s",
  padding: 0,
  backdropFilter: "blur(4px)",
};

export default function GlobalReminderModal({ notifications }: { notifications: any[] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sorted, setSorted] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  injectStyles();

  const goTo = useCallback((dir: 1 | -1, s: any[]) => {
    setExiting(true);
    setTimeout(() => {
      setIndex(i => (i + dir + s.length) % s.length);
      setExiting(false);
    }, 200);
  }, []);

  const dismissAll = useCallback(() => {
    setDismissing(true);
    setTimeout(() => {
      setVisible(false);
      setDismissing(false);
    }, 200);
  }, []);

  const handleTimeout = useCallback(() => {
    if (sorted.length > 1) {
      goTo(1, sorted);
    } else {
      dismissAll();
    }
  }, [sorted, goTo, dismissAll]);

  const openToast = useCallback((notifs: any[]) => {
    const s = sortByPriority(notifs);
    setSorted(s);
    setIndex(0);
    setExiting(false);
    setDismissing(false);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!notifications?.length) return;
    const urgent = notifications.filter(n => ["Expired", "Critical", "High", "Moderate"].includes(n.priority));
    if (!urgent.length) return;

    if (location.pathname === "/dashboard") {
      const t = setTimeout(() => openToast(urgent), 400);
      return () => clearTimeout(t);
    }
    const check = () => {
      const last = parseInt(localStorage.getItem("kairos_last_reminder_shown") || "0", 10);
      if (Date.now() - last > 3_600_000) {
        openToast(urgent);
        localStorage.setItem("kairos_last_reminder_shown", Date.now().toString());
      }
    };
    check();
    const iv = setInterval(check, 60_000);
    return () => clearInterval(iv);
  }, [notifications, location.pathname, openToast]);

  if (!visible || !sorted.length) return null;

  const current = sorted[index];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, pointerEvents: "none" }}>
      <div style={{ pointerEvents: "all" }}>
        <Banner
          key={`${current.id}-${index}`}
          n={current}
          index={index}
          total={sorted.length}
          exiting={exiting}
          dismissing={dismissing}
          onDismissAll={dismissAll}
          onNext={() => goTo(1, sorted)}
          onPrev={() => goTo(-1, sorted)}
          onNavigate={() => {
            dismissAll();
            navigate(`/dashboard/${current.type.toLowerCase().replace(/\s+/g, "-")}`);
          }}
          onTimeout={handleTimeout}
        />
      </div>
    </div>
  );
}