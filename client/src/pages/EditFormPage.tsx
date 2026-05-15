import React, { useState, useEffect } from "react";
import {
  User,
  Tag,
  Calendar,
  Hash,
  MessageSquare,
  ArrowLeft,
  Save,
  ChevronRight,
  Layers,
  Clock,
  History as HistoryIcon
} from "lucide-react";
import { getFormHistory } from "../utils/formHistory";
import AutocompleteInput from "../components/AutocompleteInput";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEditById,
  createEdit,
  updateEdit,
  type EditInput,
  type EditStatus,
  type EditPriority
} from "../api/edit";
import Loader from "../components/Loader";

// ─── Date Helpers ─────────────────────────────────────────────────────────────
const toLocalDateString = (date?: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const FORM_STYLES = `
  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .form-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
  }
  .form-submit-row {
    display: flex;
    justify-content: flex-end;
    gap: 2rem;
    margin-top: 1rem;
    padding: 3rem 0;
    border-top: 2px solid rgba(255,255,255,0.05);
    align-items: center;
  }
  @media (max-width: 768px) {
    .form-grid-2, .form-grid-3 {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .form-submit-row {
      flex-direction: column-reverse;
      gap: 1rem;
      padding: 1.5rem 0;
    }
    .form-submit-row button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const EMPTY_FORM: EditInput = {
  title: "",
  type: "",
  clientName: "",
  status: "Pending",
  priority: "Medium",
  receivedDate: new Date().toISOString().split('T')[0],
  deadline: "",
  notes: "",
  photoClipCount: 0,
};

// ─── Premium Components ──────────────────────────────────────────────────
function Section({ title, icon, children, description }: { title: string; icon: React.ReactNode; children: React.ReactNode; description?: string }) {
  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.5)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "1.25rem",
      padding: "2rem",
      marginBottom: "2rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{
          background: "var(--color-primary-glow)",
          color: "var(--color-primary)",
          padding: "0.6rem",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.01em", color: "#f8fafc" }}>{title}</h3>
          {description && <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "0.5rem", display: "block" };

const inputCls = { width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "0.75rem", color: "#f8fafc", fontSize: "0.95rem", outline: "none" };

export default function EditFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EditInput>(EMPTY_FORM);

  const { data: edit, isSuccess, isLoading: isFetching } = useQuery({
    queryKey: ["edit", id],
    queryFn: () => getEditById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && isSuccess && edit) {
      setForm({
        title: edit.title,
        type: edit.type,
        clientName: edit.clientName,
        status: edit.status,
        priority: edit.priority,
        receivedDate: toLocalDateString(edit.receivedDate),
        deadline: toLocalDateString(edit.deadline),
        notes: edit.notes || "",
        photoClipCount: edit.photoClipCount || 0,
      });
    }
  }, [isEdit, isSuccess, edit]);

  const createMutation = useMutation({
    mutationFn: createEdit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edits"] });
      navigate("/dashboard/edits");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditInput) => updateEdit(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edits"] });
      navigate("/dashboard/edits");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      receivedDate: form.receivedDate ? new Date(form.receivedDate).toISOString() : undefined,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
    } as EditInput;
    isEdit ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleLoadHistory = () => {
    const history = getFormHistory("edit");
    if (history) {
      setForm((f) => ({ ...f, ...history }));
    }
  };

  const handleSelectFullRecord = (record: any) => {
    setForm((prev) => ({
      ...prev,
      type: record.type || prev.type,
      status: record.status || prev.status,
      priority: record.priority || prev.priority,
      notes: record.notes || prev.notes,
    }));
  };

  if (isEdit && isFetching) return <Loader fullPage message="Retrieving task details..." />;

  return (
    <>
    <style>{FORM_STYLES}</style>
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1rem 3rem" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: "2rem" }}>
        <button onClick={() => navigate("/dashboard/edits")} style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", fontSize: "0.85rem", padding: 0, marginBottom: "1rem"
        }}>
          <ArrowLeft size={16} /> Back to Library
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem", fontWeight: 600 }}>
          <span>Library</span>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)" }}>{isEdit ? "Refine Task" : "Initialize"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
            <Layers size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              {isEdit ? "Refine Edit Task" : "Initialize New Task"}
            </h1>
            <p style={{ margin: "0.2rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Post-production Workflow
            </p>
          </div>
        </div>
      </div>

      {!isEdit && !!getFormHistory("edit") && (
        <button onClick={handleLoadHistory} style={{
          marginBottom: "2.5rem", width: "100%", padding: "1.25rem", borderRadius: "1.25rem",
          background: "rgba(124, 58, 237, 0.08)", border: "1px dashed rgba(124, 58, 237, 0.3)",
          color: "var(--color-primary)", fontWeight: 800, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", gap: "1rem"
        }}>
          <HistoryIcon size={20} />
          Restore Configuration from Last Session
        </button>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Section title="Identity & Ownership" icon={<User size={22} />} description="Core identification for the edit project">
            <div className="form-grid-2">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Project Title</label>
                <AutocompleteInput
                  model="edit" field="title" required
                  value={form.title}
                  onChange={(v: string) => setForm(f => ({ ...f, title: v }))}
                  placeholder="e.g. Grand Finale Reel"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Client Name</label>
                <AutocompleteInput
                  model="edit" field="clientName" required
                  value={form.clientName}
                  onChange={(v: string) => setForm(f => ({ ...f, clientName: v }))}
                  onSelectFullRecord={handleSelectFullRecord}
                  placeholder="Assigned client"
                />
              </div>
            </div>
          </Section>

          <Section title="Classification" icon={<Tag size={22} />} description="Categorize and prioritize the workload">
            <div className="form-grid-3">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Edit Category</label>
                <AutocompleteInput
                  model="edit" field="type" required
                  value={form.type}
                  onChange={(v: string) => setForm(f => ({ ...f, type: v }))}
                  placeholder="e.g. Reel, Album, VFX"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Execution Status</label>
                <select style={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as EditStatus })}>
                  <option value="Pending">Pending Review</option>
                  <option value="In Progress">Active Execution</option>
                  <option value="Done">Completed</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Urgency Level</label>
                <select style={inputCls} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as EditPriority })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Timeline & Assets" icon={<Calendar size={22} />} description="Set expectations and asset volume">
            <div className="form-grid-3">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Assets Received</label>
                <input required type="date" style={{ ...inputCls, colorScheme: "dark" }} value={form.receivedDate} onChange={e => setForm({ ...form, receivedDate: e.target.value })} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Commitment Deadline</label>
                <input required type="date" style={{ ...inputCls, colorScheme: "dark" }} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Quantity of Items</label>
                <div style={{ position: "relative" }}>
                  <Hash size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input
                    required type="number" min="0" style={{ ...inputCls, paddingLeft: "2.5rem" }}
                    value={form.photoClipCount}
                    onChange={e => setForm({ ...form, photoClipCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>

        <Section title="Strategic Notes" icon={<MessageSquare size={22} />} description="Detailed instructions and client vision">
          <textarea
            style={{ ...inputCls, minHeight: "180px", resize: "vertical" }}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Elaborate on specific requirements, transitions, or corrections..."
          />
        </Section>

        <div className="form-submit-row">
          <button type="button" onClick={() => navigate("/dashboard/edits")} style={{
            background: "transparent", border: "none", color: "#94a3b8", fontWeight: 800,
            fontSize: "1.1rem", cursor: "pointer", transition: "0.3s"
          }}>Dismiss Changes</button>

          <button type="submit" disabled={isPending} style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)", color: "white",
            padding: "1.25rem 2.5rem", borderRadius: "24px", fontWeight: 600, border: "none",
            display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer",
            boxShadow: "0 15px 35px rgba(124, 58, 237, 0.4)", transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}>
            {isPending ? <Clock size={22} style={{ animation: "spin 2s linear infinite" }} /> : <Save size={22} />}
            <span>{isPending ? "Syncing..." : isEdit ? "Update Project" : "Initialize Project"}</span>
          </button>
        </div>
      </form>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
    </>
  );
}
