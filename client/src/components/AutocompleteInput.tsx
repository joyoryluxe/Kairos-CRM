import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFieldSuggestions, getRecordByField } from "@/api/suggestion";
import { Search, Loader2 } from "lucide-react";

interface AutocompleteInputProps {
  model: string;
  field: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onSelectFullRecord?: (record: any) => void;
}

export default function AutocompleteInput({
  model,
  field,
  value,
  onChange,
  placeholder,
  required,
  style,
  className,
  onSelectFullRecord,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["suggestions", model, field, debouncedValue],
    queryFn: () => getFieldSuggestions(model, field, debouncedValue),
    enabled: isOpen && debouncedValue.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    
    if (onSelectFullRecord) {
      try {
        const record = await getRecordByField(model, field, suggestion);
        if (record) {
          onSelectFullRecord(record);
        }
      } catch (error) {
        console.error("Failed to fetch full record:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", ...style }} className={className}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          style={{ width: "100%", paddingRight: "2.5rem" }}
        />
        <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            marginTop: "0.25rem",
            boxShadow: "var(--shadow-lg)",
            maxHeight: "200px",
            overflowY: "auto",
            animation: "fade-in 0.2s ease-out",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              style={{
                padding: "0.75rem 1rem",
                cursor: "pointer",
                background: index === highlightedIndex ? "var(--bg-surface-3)" : "transparent",
                color: index === highlightedIndex ? "var(--color-primary)" : "var(--text-primary)",
                borderBottom: index < suggestions.length - 1 ? "1px solid var(--border-subtle)" : "none",
                fontSize: "0.9rem",
                transition: "background 0.15s ease",
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
