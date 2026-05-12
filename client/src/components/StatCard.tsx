import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  description,
}) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div
      style={{
        padding: isMobile ? "1rem" : "1.1rem",
        background: "rgba(30, 41, 59, 0.5)",
        backdropFilter: "blur(10px)",
        borderRadius: isMobile ? "1rem" : "1.25rem",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        textAlign: isMobile ? "center" : "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 24px -5px ${color}22`;
        e.currentTarget.style.borderColor = `${color}44`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
      }}
    >
      {/* Glow background */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-10%",
        width: "60%",
        height: "60%",
        background: `radial-gradient(circle at center, ${color}11 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: isMobile ? "center" : "space-between",
            alignItems: "center",
            marginBottom: isMobile ? "0.75rem" : "1.5rem",
            gap: isMobile ? "0.5rem" : "0"
          }}
        >
          <div
            style={{
              padding: isMobile ? "0.5rem" : "0.75rem",
              borderRadius: isMobile ? "10px" : "12px",
              background: `${color}18`,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 16px -4px ${color}33`
            }}
          >
            {icon}
          </div>
          {!isMobile && <TrendingUp size={16} color="#10b981" style={{ opacity: 0.8 }} />}
        </div>
        
        <div style={{ width: "100%", minWidth: 0 }}>
          <div
            style={{
              fontSize: isMobile ? "0.7rem" : "0.75rem",
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.25rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "100%"
            }}
          >
            {title}
          </div>
          <div style={{ 
            fontSize: isMobile ? "1.2rem" : "1.35rem", 
            fontWeight: 900, 
            color: "#f8fafc",
            marginBottom: "0.25rem",
            letterSpacing: "-0.03em",
            wordBreak: "break-word",
            width: "100%"
          }}>
            {value}
          </div>
        </div>
      </div>

      <div style={{ 
        fontSize: isMobile ? "0.7rem" : "0.8rem", 
        color: "#64748b", 
        marginTop: isMobile ? "0.75rem" : "1.25rem",
        paddingTop: isMobile ? "0.6rem" : "1rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "center" : "flex-start",
        gap: "0.5rem",
        fontWeight: 600,
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden"
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{description}</span>
      </div>
    </div>
  );
};

export default StatCard;
