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
  Sparkles,
  Layers,
  Clock,
  History as HistoryIcon,
  X
} from "lucide-react";
import { saveFormHistory, getFormHistory, saveFieldHistory } from "../utils/formHistory";
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

const PremiumSection: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, icon, children }) => (
  <div className="glass-section">
    <div className="section-header">
      <div className="section-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
    </div>
    <div className="section-content">
      {children}
    </div>
  </div>
);

const EditFormPage: React.FC = () => {
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
        receivedDate: edit.receivedDate ? new Date(edit.receivedDate).toISOString().split('T')[0] : "",
        deadline: edit.deadline ? new Date(edit.deadline).toISOString().split('T')[0] : "",
        notes: edit.notes || "",
        photoClipCount: edit.photoClipCount || 0,
      });
    }
  }, [isEdit, isSuccess, edit]);

  const createMutation = useMutation({
    mutationFn: createEdit,
    onSuccess: () => {
      // Save to history
      const historyData = {
        title: form.title,
        clientName: form.clientName,
        type: form.type,
        priority: form.priority,
      };
      saveFormHistory("edit", historyData);

      // Save individual fields history
      saveFieldHistory("edit", "title", form.title);
      saveFieldHistory("edit", "clientName", form.clientName);
      saveFieldHistory("edit", "type", form.type);

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
    
    // Ensure numeric fields are numbers (though they should be already)
    const payload = { ...form };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const [backupState, setBackupState] = useState<EditInput | null>(null);

  const handleLoadHistory = () => {
    const history = getFormHistory("edit");
    if (history) {
      setBackupState({ ...form });
      setForm((f) => ({
        ...f,
        ...history,
      }));
    }
  };

  const handleUndoHistory = () => {
    if (backupState) {
      setForm(backupState);
      setBackupState(null);
    }
  };

  const hasHistory = !isEdit && !!getFormHistory("edit");

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
    <div className="form-page-container">
      {/* Dynamic Background Elements */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      <div className="form-content">
        {/* Navigation & Breadcrumbs */}
        <div className="form-header">
           <button onClick={() => navigate("/dashboard/edits")} className="btn-back-premium">
            <ArrowLeft size={18} />
            <span>Back to Tasks</span>
          </button>

          <div className="breadcrumb-premium">
            <span>Library</span>
            <ChevronRight size={14} />
            <span>Edits</span>
            <ChevronRight size={14} />
            <span className="current">{isEdit ? "Refine Task" : "New Creation"}</span>
          </div>

          <div className="title-row">
            <div className="title-icon">
              {isEdit ? <Layers size={24} /> : <Sparkles size={24} />}
            </div>
            <div>
                <h1>{isEdit ? "Refine Edit Task" : "Create New Task"}</h1>
                <p>Define the parameters for your post-production workflow.</p>
              </div>
            </div>

            {hasHistory && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                {backupState && (
                  <button
                    type="button"
                    onClick={handleUndoHistory}
                    className="btn-back-premium"
                    style={{
                      borderColor: "var(--color-danger-glow)",
                      color: "var(--color-danger)",
                      backgroundColor: "var(--bg-surface-3)",
                    }}
                    title="Restore before fill"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLoadHistory}
                  className="btn-back-premium"
                  style={{
                    borderColor: "var(--color-primary-glow)",
                    color: "var(--color-primary)",
                    backgroundColor: "var(--bg-surface-3)",
                  }}
                >
                  <HistoryIcon size={18} />
                  <span>Fill from Last Submission</span>
                </button>
              </div>
            )}
          </div>

        <form onSubmit={handleSubmit} className="premium-form">
          {/* Section: Basic Metadata */}
          <PremiumSection 
            title="Identity & Ownership" 
            subtitle="Core identification for the edit project"
            icon={<User size={20} />}
          >
            <div className="form-grid">
              <div className="form-group-premium grow">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label style={{ marginBottom: 0 }}>Project Title</label>
                </div>
                <AutocompleteInput 
                  model="edit" 
                  field="title" 
                  required 
                  value={form.title} 
                  onChange={(v: string) => setForm(f => ({ ...f, title: v }))} 
                  placeholder="e.g. Grand Finale Reel" 
                />
              </div>
              <div className="form-group-premium grow">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label style={{ marginBottom: 0 }}>Client Name</label>
                </div>
                <AutocompleteInput 
                  model="edit" 
                  field="clientName" 
                  required 
                  value={form.clientName} 
                  onChange={(v: string) => setForm(f => ({ ...f, clientName: v }))} 
                  onSelectFullRecord={handleSelectFullRecord}
                  placeholder="Assigned client" 
                />
              </div>
            </div>
          </PremiumSection>

          {/* Section: Categorization & Priority */}
          <PremiumSection 
            title="Classification" 
            subtitle="Categorize and prioritize the workload"
            icon={<Tag size={20} />}
          >
            <div className="form-grid row-3">
              <div className="form-group-premium">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label style={{ marginBottom: 0 }}>Edit Category</label>
                </div>
                <AutocompleteInput 
                  model="edit" 
                  field="type" 
                  required 
                  value={form.type} 
                  onChange={(v: string) => setForm(f => ({ ...f, type: v }))} 
                  placeholder="e.g. Reel, Album, VFX" 
                />
              </div>
              <div className="form-group-premium">
                <label>Execution Status</label>
                <div className="select-premium">
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as EditStatus})}>
                    <option value="Pending">Pending Review</option>
                    <option value="In Progress">Active Execution</option>
                    <option value="Done">Completed</option>
                    <option value="Delivered">Successfully Delivered</option>
                  </select>
                </div>
              </div>
              <div className="form-group-premium">
                <label>Urgency Level</label>
                <div className="select-premium">
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as EditPriority})}>
                    <option value="Low">Standard (Low)</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">Urgent (High)</option>
                  </select>
                </div>
              </div>
            </div>
          </PremiumSection>

          {/* Section: Timeline & Quantification */}
          <PremiumSection 
            title="Timeline & Assets" 
            subtitle="Set expectations and asset volume"
            icon={<Calendar size={20} />}
          >
            <div className="form-grid row-3">
              <div className="form-group-premium">
                <label>Assets Received</label>
                <input required type="date" value={form.receivedDate} onChange={e => setForm({...form, receivedDate: e.target.value})} />
              </div>
              <div className="form-group-premium">
                <label>Commitment Deadline</label>
                <input required type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
              </div>
              <div className="form-group-premium">
                <label>Quantity of Items</label>
                <div className="input-with-icon">
                  <Hash size={16} />
                  <input 
                    required 
                    type="number" 
                    min="0"
                    value={form.photoClipCount}
                    onChange={e => setForm({...form, photoClipCount: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>
          </PremiumSection>

          {/* Section: Narrative Notes */}
          <PremiumSection 
            title="Strategic Notes" 
            subtitle="Detailed instructions and client vision"
            icon={<MessageSquare size={20} />}
          >
            <div className="form-group-premium full">
              <textarea 
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                placeholder="Elaborate on specific requirements, transitions, or corrections..."
                rows={5}
              />
            </div>
          </PremiumSection>

          {/* Actions Bar */}
          <div className="actions-bar-premium">
            <button type="button" className="btn-cancel-premium" onClick={() => navigate("/dashboard/edits")}>Dismiss Changes</button>
            <button type="submit" className="btn-save-premium" disabled={isPending}>
              {isPending ? <Clock size={18} className="spin" /> : <Save size={18} />}
              <span>{isPending ? "Syncing..." : isEdit ? "Update Project" : "Initialize Project"}</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-page-container {
          min-height: 100vh;
          position: relative;
          background: var(--bg-page);
          overflow-x: hidden;
        }
        .bg-glow {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(140px);
          z-index: 0;
          opacity: 0.15;
          pointer-events: none;
        }
        .bg-glow-1 { top: -200px; right: -200px; background: var(--color-primary); }
        .bg-glow-2 { bottom: -200px; left: -200px; background: #7c3aed; }

        .form-content {
          position: relative;
          z-index: 1;
          max-width: 1000px;
          margin: 0 auto;
          padding: 2.5rem 2rem 5rem;
          animation: formFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes formFadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-header { margin-bottom: 3.5rem; }
        
        .btn-back-premium {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 0.6rem 1.2rem;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
        }
        .btn-back-premium:hover {
          color: var(--text-primary);
          border-color: var(--text-muted);
          background: var(--bg-surface-2);
        }

        .breadcrumb-premium {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }
        .breadcrumb-premium .current { color: var(--color-primary); }

        .title-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .title-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%);
          color: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 24px rgba(124, 58, 237, 0.3);
        }
        .title-row h1 {
          font-size: 2.5rem;
          font-weight: 950;
          letter-spacing: -0.05em;
          margin: 0;
        }
        .title-row p {
          margin: 4px 0 0;
          color: var(--text-muted);
          font-size: 1.1rem;
          font-weight: 500;
        }

        .glass-section {
          background: var(--bg-surface-2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 15px 40px rgba(0,0,0,0.03);
          transition: transform 0.3s ease;
        }
        .glass-section:hover { transform: scale(1.005); }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .section-icon {
          width: 44px;
          height: 44px;
          background: var(--bg-surface-3);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          border: 1px solid var(--border);
        }
        .section-header h3 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .section-subtitle {
          margin: 4px 0 0;
          font-size: 0.95rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .form-grid.row-3 { grid-template-columns: 1fr 1fr 1fr; }

        .form-group-premium label {
          display: block;
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
          color: var(--text-muted);
        }
        .form-group-premium input, 
        .form-group-premium textarea, 
        .form-group-premium select {
          width: 100%;
          background: var(--bg-page);
          border: 2px solid var(--border);
          padding: 1rem 1.25rem;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          color-scheme: dark;
        }
        .form-group-premium select option {
          background: var(--bg-surface-2);
          color: var(--text-primary);
        }
        .form-group-premium input:focus, 
        .form-group-premium textarea:focus,
        .form-group-premium select:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 5px var(--color-primary-glow);
        }

        .input-with-icon { position: relative; }
        .input-with-icon svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-with-icon input { padding-left: 38px; }

        .actions-bar-premium {
          display: flex;
          justify-content: flex-end;
          gap: 1.5rem;
          padding: 3rem 0;
          border-top: 2px solid var(--border);
        }

        .btn-cancel-premium {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: color 0.3s;
        }
        .btn-cancel-premium:hover { color: var(--color-danger); }

        .btn-save-premium {
          background: linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%);
          color: white;
          padding: 1.1rem 2.5rem;
          border-radius: 20px;
          font-weight: 850;
          border: none;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 15px 35px rgba(124, 58, 237, 0.4);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .btn-save-premium:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 50px rgba(124, 58, 237, 0.5);
        }
        .btn-save-premium:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .form-grid, .form-grid.row-3 { grid-template-columns: 1fr; }
          .glass-section { padding: 1.5rem; }
          .title-row h1 { font-size: 2rem; }
          .btn-save-premium { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default EditFormPage;
