import React from "react";
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
  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: "1.5rem",
        background: "var(--bg-surface-2)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
        e.currentTarget.style.borderColor = `${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {/* Decorative background pulse */}
      <div style={{
        position: "absolute",
        top: "-20px",
        right: "-20px",
        width: "80px",
        height: "80px",
        background: `${color}08`,
        borderRadius: "50%",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              padding: "0.6rem",
              borderRadius: "10px",
              background: `${color}15`,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          <TrendingUp size={14} color="var(--color-success)" style={{ opacity: 0.6 }} />
        </div>
        
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.025em",
              marginBottom: "0.5rem",
            }}
          >
            {title}
          </div>
          <div style={{ 
            fontSize: "1.5rem", 
            fontWeight: 800, 
            color: "var(--text-primary)",
            marginBottom: "0.25rem",
            letterSpacing: "-0.01em"
          }}>
            {value}
          </div>
        </div>
      </div>

      <div style={{ 
        fontSize: "0.75rem", 
        color: "var(--text-secondary)", 
        marginTop: "1rem",
        paddingTop: "0.75rem",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontWeight: 500
      }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
        {description}
      </div>
    </div>
  );
};

export default StatCard;
