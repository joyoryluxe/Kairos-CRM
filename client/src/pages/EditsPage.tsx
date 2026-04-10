import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  AlertCircle,
  Clock,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  ChevronUp,
  X,
  Hash,
  ArrowRight,
  Download
} from "lucide-react";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  getEdits, 
  deleteEdit, 
  type EditStatus,
  type EditPriority
} from "../api/edit";
import { exportToExcel } from "@/utils/exportToExcel";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

const EditsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Basic Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  
  // Advanced Filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [receivedDateStart, setReceivedDateStart] = useState("");
  const [receivedDateEnd, setReceivedDateEnd] = useState("");
  const [deadlineStart, setDeadlineStart] = useState("");
  const [deadlineEnd, setDeadlineEnd] = useState("");
  const [minItems, setMinItems] = useState<number | "">("");
  const [maxItems, setMaxItems] = useState<number | "">("");

  const { data: edits = [], isLoading, isError } = useQuery({
    queryKey: ["edits"],
    queryFn: () => getEdits(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEdit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edits"] });
    },
  });

  const uniqueTypes = useMemo(() => {
    const types = edits.map(e => e.type).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [edits]);

  const filteredEdits = useMemo(() => {
    return edits.filter(edit => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        edit.title.toLowerCase().includes(search) || 
        edit.clientName.toLowerCase().includes(search) ||
        (edit.notes && edit.notes.toLowerCase().includes(search));
      
      const matchesStatus = statusFilter === "All" || edit.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || edit.priority === priorityFilter;
      const matchesType = typeFilter === "All" || edit.type === typeFilter;
      
      let matchesReceived = true;
      if (receivedDateStart || receivedDateEnd) {
        const date = parseISO(edit.receivedDate);
        const start = receivedDateStart ? startOfDay(parseISO(receivedDateStart)) : new Date(0);
        const end = receivedDateEnd ? endOfDay(parseISO(receivedDateEnd)) : new Date(8640000000000000);
        matchesReceived = isWithinInterval(date, { start, end });
      }
      
      let matchesDeadline = true;
      if (deadlineStart || deadlineEnd) {
        const date = parseISO(edit.deadline);
        const start = deadlineStart ? startOfDay(parseISO(deadlineStart)) : new Date(0);
        const end = deadlineEnd ? endOfDay(parseISO(deadlineEnd)) : new Date(8640000000000000);
        matchesDeadline = isWithinInterval(date, { start, end });
      }
      
      const matchesMinItems = minItems === "" || edit.photoClipCount >= minItems;
      const matchesMaxItems = maxItems === "" || edit.photoClipCount <= maxItems;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesType && 
             matchesReceived && matchesDeadline && matchesMinItems && matchesMaxItems;
    });
  }, [edits, searchTerm, statusFilter, priorityFilter, typeFilter, receivedDateStart, receivedDateEnd, deadlineStart, deadlineEnd, minItems, maxItems]);

  const handleExport = () => {
    if (!filteredEdits || filteredEdits.length === 0) return;
    const exportData = filteredEdits.map((edit) => ({
      "Task Title": edit.title,
      "Client Name": edit.clientName,
      "Category": edit.type,
      "Status": edit.status,
      "Priority": edit.priority,
      "Items": edit.photoClipCount,
      "Received Date": edit.receivedDate ? format(new Date(edit.receivedDate), "MMM dd, yyyy") : "-",
      "Deadline": edit.deadline ? format(new Date(edit.deadline), "MMM dd, yyyy") : "-",
      "Notes": edit.notes || "-",
    }));

    const summaryData = {
      "Total Tasks Filtered": filteredEdits.length
    };

    exportToExcel(exportData, "Edit_Tasks", summaryData);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setTypeFilter("All");
    setReceivedDateStart("");
    setReceivedDateEnd("");
    setDeadlineStart("");
    setDeadlineEnd("");
    setMinItems("");
    setMaxItems("");
  };

  const statusColors: Record<EditStatus, { bg: string; text: string; border: string; glow: string }> = {
    'Pending': { bg: '#fff1f2', text: '#e11d48', border: '#fda4af', glow: 'rgba(225, 29, 72, 0.15)' },
    'In Progress': { bg: '#eff6ff', text: '#2563eb', border: '#93c5fd', glow: 'rgba(37, 99, 235, 0.15)' },
    'Done': { bg: '#f5f3ff', text: '#7c3aed', border: '#c4b5fd', glow: 'rgba(124, 58, 237, 0.15)' },
    'Delivered': { bg: '#ecfdf5', text: '#059669', border: '#6ee7b7', glow: 'rgba(5, 150, 105, 0.15)' }
  };

  const getPriorityInfo = (priority: EditPriority) => {
    switch (priority) {
      case "High": return { color: "#ef4444", label: "Urgent" };
      case "Medium": return { color: "#f59e0b", label: "Priority" };
      case "Low": return { color: "#10b981", label: "Normal" };
      default: return { color: "#6b7280", label: priority };
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(id);
    }
  };

  const renderContent = () => {
    if (filteredEdits.length === 0) {
      return (
        <div className="empty-state-premium">
          <div className="empty-icon-container">
            <Search size={40} className="empty-icon" />
          </div>
          <h3>No matching tasks found</h3>
          <p>We found zero tasks that match your current filtering criteria. Try clearing some filters or searching for something else.</p>
          <button className="btn btn-outline" onClick={resetFilters}>Clear All Filters</button>
        </div>
      );
    }

    if (viewMode === "card" || isMobile) {
      return (
        <div className="premium-grid">
          {filteredEdits.map((edit, idx) => (
            <div key={edit._id} 
              className="premium-card" 
              onClick={() => navigate(`/dashboard/edits/${edit._id}/edit`)}
              style={{ 
                animationDelay: `${idx * 0.05}s`,
                borderTop: `6px solid ${getPriorityInfo(edit.priority).color}`
              }}
            >
              <div className="card-header">
                <span className="category-tag">{edit.type}</span>
                <span className="status-dot" style={{ background: statusColors[edit.status].text, boxShadow: `0 0 10px ${statusColors[edit.status].text}80` }} />
              </div>
              
              <h3 className="card-title">{edit.title}</h3>
              <p className="card-client">{edit.clientName}</p>
              
              <div className="card-stats">
                <div className="stat">
                  <Hash size={16} /> {edit.photoClipCount} Items
                </div>
                <div className="stat">
                  <Clock size={16} /> {format(new Date(edit.deadline), "MMM dd")}
                </div>
              </div>

              <div className="card-footer">
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span className="priority-label" style={{ color: getPriorityInfo(edit.priority).color }}>
                    {getPriorityInfo(edit.priority).label}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button className="btn-circle-action danger" onClick={(e) => handleDelete(e, edit._id)}>
                    <Trash2 size={18} />
                  </button>
                  <button className="btn-circle-action">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="premium-table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Task Information</th>
              <th>Category</th>
              <th>Client</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Items</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEdits.map((edit, idx) => (
              <tr 
                key={edit._id} 
                onClick={() => navigate(`/dashboard/edits/${edit._id}/edit`)} 
                className="premium-row"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <td>
                  <div style={{ fontWeight: 800, fontSize: "1rem" }}>{edit.title}</div>
                  <div className="text-secondary-premium">
                    Created {format(new Date(edit.receivedDate), "MMM dd")}
                  </div>
                </td>
                <td><span className="category-pill">{edit.type}</span></td>
                <td style={{ fontWeight: 700 }}>{edit.clientName}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.85rem", color: getPriorityInfo(edit.priority).color }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "currentColor", boxShadow: `0 0 8px ${getPriorityInfo(edit.priority).color}80` }} />
                    {getPriorityInfo(edit.priority).label}
                  </div>
                </td>
                <td>
                  <span className="status-badge-premium" style={{ 
                    background: statusColors[edit.status].bg, 
                    color: statusColors[edit.status].text,
                    border: `1px solid ${statusColors[edit.status].border}`,
                    boxShadow: `0 4px 12px ${statusColors[edit.status].glow}`
                  }}>
                    {edit.status}
                  </span>
                </td>
                <td>
                  <div className="deadline-ui">
                    <Calendar size={14} />
                    {format(new Date(edit.deadline), "MMM dd, yyyy")}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                    <Hash size={14} />
                    {edit.photoClipCount}
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    <button className="btn-action-premium danger" onClick={(e) => handleDelete(e, edit._id)}>
                      <Trash2 size={18} />
                    </button>
                    <button className="btn-action-premium" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/edits/${edit._id}/edit`); }}>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <div className="loader-premium"></div>
    </div>
  );

  if (isError) return (
    <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--bg-surface-2)", borderRadius: "24px", margin: "2rem" }}>
      <AlertCircle size={64} color="var(--color-danger)" style={{ marginBottom: "1.5rem" }} />
      <h2 style={{ fontWeight: 800, fontSize: "1.5rem" }}>Oops! Something went wrong</h2>
      <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "1rem auto" }}>We couldn't load your edit tasks. Please check your connection and try again.</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh Page</button>
    </div>
  );

  return (
    <div style={{ padding: "1.5rem 2rem", animation: "pageFadeIn 0.5s ease-out" }}>
      {/* Header Section */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-end", 
        marginBottom: "2.5rem",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        <div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 900, letterSpacing: "-0.05em", margin: 0, color: "var(--text-primary)" }}>
            Edit <span style={{ color: "var(--color-primary)" }}>Tasks</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "6px", fontWeight: 500 }}>
            Track post-production workflow and maintain deadlines.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            className="btn-premium" 
            onClick={handleExport}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "none", color: "var(--text-primary)", border: "1px solid var(--border)", boxShadow: "none" }}
          >
            <Download size={20} /> Export
          </button>
          <button 
            className="btn-premium" 
            onClick={() => navigate("/dashboard/edits/new")}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <Plus size={20} /> Add New Task
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div style={{ 
        background: "var(--bg-surface-2)", 
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "24px",
        border: "1px solid var(--border)",
        padding: "1.25rem",
        marginBottom: "2rem",
        boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      }}>
        {/* Main Filters Row */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 3, minWidth: "280px" }}>
            <Search size={20} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Quick search: Title, client, or specific notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium"
              style={{ paddingLeft: "48px", height: "48px" }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "0.75rem", flex: 2, minWidth: "320px" }}>
            <div className="select-container">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="select-container">
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="All">All Priority</option>
                <option value="High">Urgent</option>
                <option value="Medium">Standard</option>
                <option value="Low">Normal</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button 
              className={`btn-filter ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ height: "48px", padding: "0 1.25rem" }}
            >
              <Filter size={18} />
              <span className="hide-on-mobile">{showAdvanced ? "Hide Advanced" : "Advanced"}</span>
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button 
              className="btn-icon-premium" 
              onClick={resetFilters}
              style={{ height: "48px", width: "48px" }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="view-toggle-premium">
            <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}><ListIcon size={18} /></button>
            <button className={viewMode === "card" ? "active" : ""} onClick={() => setViewMode("card")}><LayoutGrid size={18} /></button>
          </div>
        </div>

        {/* Expandable Advanced Section */}
        <div style={{ 
          maxHeight: showAdvanced ? "400px" : "0", 
          overflow: "hidden", 
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: showAdvanced ? 1 : 0,
          marginTop: showAdvanced ? "1.5rem" : 0
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
            gap: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border)"
          }}>
            <div className="filter-panel">
              <label>Edit Category</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="All">Any Category</option>
                {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="filter-panel">
              <label>Timeline (Rec. Date)</label>
              <div className="date-range-ui">
                <input type="date" value={receivedDateStart} onChange={e => setReceivedDateStart(e.target.value)} />
                <span>to</span>
                <input type="date" value={receivedDateEnd} onChange={e => setReceivedDateEnd(e.target.value)} />
              </div>
            </div>

            <div className="filter-panel">
              <label>Deadline Range</label>
              <div className="date-range-ui">
                <input type="date" value={deadlineStart} onChange={e => setDeadlineStart(e.target.value)} />
                <span>to</span>
                <input type="date" value={deadlineEnd} onChange={e => setDeadlineEnd(e.target.value)} />
              </div>
            </div>

            <div className="filter-panel">
              <label>Content Amount</label>
              <div className="range-ui">
                <Hash size={14} className="icon" />
                <input type="number" placeholder="Min" value={minItems} onChange={e => setMinItems(e.target.value === "" ? "" : parseInt(e.target.value))} />
                <span>-</span>
                <input type="number" placeholder="Max" value={maxItems} onChange={e => setMaxItems(e.target.value === "" ? "" : parseInt(e.target.value))} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderContent()}

      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rowSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes loaderRotate {
          to { transform: rotate(360deg); }
        }

        .loader-premium {
          width: 48px;
          height: 48px;
          border: 4px solid var(--border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: loaderRotate 0.8s infinite linear;
        }

        .input-premium {
          background: var(--bg-surface-1) !important;
          border: 1px solid var(--border) !important;
          border-radius: 14px !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
        }
        .input-premium:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 4px var(--color-primary-glow) !important;
        }

        .btn-premium {
          background: linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%);
          color: white;
          padding: 0.85rem 1.75rem;
          border-radius: 16px;
          font-weight: 700;
          box-shadow: 0 10px 25px rgba(124, 58, 237, 0.25);
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .btn-premium:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(124, 58, 237, 0.35);
        }

        .btn-filter {
          background: var(--bg-surface-1);
          border: 1px solid var(--border);
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-filter.active {
          background: var(--color-primary-glow);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .view-toggle-premium {
          display: flex;
          background: var(--bg-surface-1);
          padding: 4px;
          border-radius: 14px;
          border: 1px solid var(--border);
        }
        .view-toggle-premium button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .view-toggle-premium button.active {
          background: var(--color-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .filter-panel label {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
          display: block;
        }

        .date-range-ui, .range-ui {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-surface-1);
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        .date-range-ui input, .range-ui input {
          background: transparent !important;
          border: none !important;
          font-weight: 600;
          padding: 0;
          width: 100%;
          outline: none;
        }

        .premium-table-container {
          background: var(--bg-surface-2);
          border-radius: 28px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.04);
        }
        .premium-table {
          width: 100%;
          border-collapse: collapse;
        }
        .premium-table th {
          text-align: left;
          padding: 1.25rem 1.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface-3);
        }
        .premium-row {
          cursor: pointer;
          transition: all 0.2s ease;
          animation: rowSlideIn 0.4s ease-out backwards;
        }
        .premium-row:hover {
          background: var(--bg-surface-1);
        }
        .premium-row td {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .category-pill {
          background: var(--bg-surface-3);
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .status-badge-premium {
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .premium-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .premium-card {
          background: var(--bg-surface-2);
          border-radius: 24px;
          padding: 1.75rem;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: pageFadeIn 0.5s ease-out backwards;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .premium-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: var(--color-primary);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .category-tag {
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .card-title {
          font-size: 1.25rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .card-client {
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
          margin: 0;
        }
        .card-stats {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border);
        }
        .priority-label {
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .btn-circle-action {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg-surface-3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-circle-action.danger:hover {
          background: var(--color-danger);
          color: white;
          border-color: var(--color-danger);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        .premium-card:hover .btn-circle-action:not(.danger) {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
        .btn-action-premium {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-surface-3);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-action-premium.danger:hover {
          background: var(--color-danger);
          color: white;
          border-color: var(--color-danger);
        }
        .btn-action-premium:not(.danger):hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .empty-state-premium {
          text-align: center;
          padding: 6rem 2rem;
          background: var(--bg-surface-2);
          border-radius: 32px;
          border: 2px dashed var(--border);
          margin-top: 2rem;
        }
        .empty-icon-container {
          width: 100px;
          height: 100px;
          background: var(--bg-surface-3);
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .hide-on-mobile { display: none; }
          .premium-grid { grid-template-columns: 1fr; }
          .premium-table-container { display: none; }
          .form-content { padding: 1.5rem 1rem; }
          .form-header h1 { font-size: 1.75rem; }
        }
      `}</style>
    </div>
  );
};

export default EditsPage;
