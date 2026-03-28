import React, { useState, useEffect, useRef } from "react";
import { getFieldHistory } from "@/utils/formHistory";

interface Props {
  formId: string;
  fieldName: string;
  onSelect: (value: string) => void;
  style?: React.CSSProperties;
}

export default function FieldHistoryDropdown({ formId, fieldName, onSelect, style }: Props) {
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getFieldHistory(formId, fieldName));
  }, [formId, fieldName, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (history.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: "relative",
        ...style 
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          color: "var(--color-primary)",
          fontSize: "0.75rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          opacity: 0.7,
        }}
        title="Recent entries"
      >
        History
      </button>

      {isOpen && (
        <div 
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 1000,
            width: "max-content",
            minWidth: "180px",
            backgroundColor: "#1a1a1a", // Dark background like the screenshot
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            marginTop: "4px",
            overflow: "hidden",
            animation: "fadeDown 0.2s ease-out"
          }}
        >
          <style>{`
            @keyframes fadeDown {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {history.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                color: "#eee",
                fontSize: "0.85rem",
                borderBottom: i < history.length - 1 ? "1px solid #333" : "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
