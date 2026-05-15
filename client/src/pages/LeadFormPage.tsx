import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  MapPin,
  IndianRupee,
  Tag,
  ArrowLeft,
  Save,
  ChevronRight,
  Clock,
  MessageSquare,
  History as HistoryIcon
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLead, getLeadById, updateLead, type LeadInput, type LeadStatus, type LeadSource, type LeadEventType } from "../api/lead";
import { saveFormHistory, getFormHistory } from "../utils/formHistory";
import AutocompleteInput from "../components/AutocompleteInput";
import Loader from "../components/Loader";

// ─── Helpers ─────────────────────────────────────────────────────────────
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
  .form-grid-2-1 {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  .form-submit-row {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
  @media (max-width: 768px) {
    .form-grid-2, .form-grid-3, .form-grid-2-1 {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .form-grid-2-1 {
      margin-top: 1rem;
    }
    .form-submit-row {
      flex-direction: column-reverse;
      gap: 0.75rem;
    }
    .form-submit-row button {
      width: 100%;
      justify-content: center;
    }
  }
`;

interface FormState {
  clientName: string;
  phoneNumber: string;
  email: string;
  source: LeadSource;
  inquiryDate: string;
  eventType: LeadEventType;
  eventDate: string;
  eventLocation: string;
  budget: number;
  status: LeadStatus;
  notes: string;
}

const EMPTY_FORM: FormState = {
  clientName: "",
  phoneNumber: "",
  email: "",
  source: "Instagram",
  inquiryDate: new Date().toISOString().split('T')[0],
  eventType: "Maternity",
  eventDate: "",
  eventLocation: "",
  budget: 0,
  status: "New",
  notes: "",
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

const inputCls = {
  width: "100%",
  padding: "0.75rem 1rem",
  // background: "rgba(15, 23, 42, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "0.75rem",
  color: "#f8fafc",
  fontSize: "0.95rem",
  outline: "none",
  transition: "all 0.2s ease"
};

const labelStyle: React.CSSProperties = { fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "0.5rem", display: "block" };

export default function LeadFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: lead, isSuccess, isLoading: isFetching } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && isSuccess && lead) {
      setForm({
        clientName: lead.clientName,
        phoneNumber: lead.phoneNumber,
        email: lead.email || "",
        source: lead.source,
        inquiryDate: toLocalDateString(lead.inquiryDate),
        eventType: lead.eventType,
        eventDate: toLocalDateString(lead.eventDate),
        eventLocation: lead.eventLocation || "",
        budget: lead.budget || 0,
        status: lead.status,
        notes: lead.notes || "",
      });
    }
  }, [isEdit, isSuccess, lead]);

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      saveFormHistory("lead", { clientName: form.clientName, phoneNumber: form.phoneNumber, email: form.email });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      navigate("/dashboard/leads");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: LeadInput) => updateLead(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      navigate("/dashboard/leads");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      inquiryDate: form.inquiryDate ? new Date(form.inquiryDate).toISOString() : undefined,
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : undefined,
    } as LeadInput;
    isEdit ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleLoadHistory = () => {
    const history = getFormHistory("lead");
    if (history) {
      setForm((f) => ({ ...f, ...history }));
    }
  };

  const handleSelectFullRecord = (record: any) => {
    setForm((prev) => ({
      ...prev,
      phoneNumber: record.phoneNumber || prev.phoneNumber,
      email: record.email || prev.email,
      source: record.source || prev.source,
    }));
  };

  if (isEdit && isFetching) return <Loader fullPage message="Retrieving lead details..." />;

  return (
    <>
    <style>{FORM_STYLES}</style>
    <div className="animate-fade-up" style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1rem 3rem" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: "2rem" }}>
        <button onClick={() => navigate("/dashboard/leads")} style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", fontSize: "0.85rem", padding: 0, marginBottom: "1rem"
        }}>
          <ArrowLeft size={16} /> Back to Leads
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem", fontWeight: 600 }}>
          <span>Pipeline</span>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)" }}>{isEdit ? "Update Potential" : "New Discovery"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
            <Tag size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              {isEdit ? "Refine Lead Profile" : "Capture New Lead"}
            </h1>
            <p style={{ margin: "0.2rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Inquiry Management & Tracking
            </p>
          </div>
        </div>
      </div>

      {!isEdit && !!getFormHistory("lead") && (
        <button onClick={handleLoadHistory} style={{
          marginBottom: "2.5rem", width: "100%", padding: "1.25rem", borderRadius: "1.25rem",
          background: "rgba(16, 185, 129, 0.08)", border: "1px dashed rgba(16, 185, 129, 0.3)",
          color: "#10b981", fontWeight: 800, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", gap: "1rem"
        }}>
          <HistoryIcon size={20} />
          Restore Configuration from Last Session
        </button>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Section title="Discovery Source" icon={<User size={22} />} description="Who is the prospect and how did they find us?">
            <div className="form-grid-2">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Prospect Name</label>
                <AutocompleteInput
                  model="lead" field="clientName" required
                  value={form.clientName}
                  onChange={(v: string) => setForm(f => ({ ...f, clientName: v }))}
                  onSelectFullRecord={handleSelectFullRecord}
                  placeholder="Full name"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Contact Info</label>
                <AutocompleteInput
                  model="lead" field="phoneNumber" required
                  value={form.phoneNumber}
                  onChange={(v: string) => setForm(f => ({ ...f, phoneNumber: v }))}
                  placeholder="+91 Phone number"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Email Address</label>
                <input style={inputCls} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Origin Source</label>
                <select style={inputCls} value={form.source} onChange={e => setForm({ ...form, source: e.target.value as LeadSource })}>
                  <option value="Instagram">Instagram</option>
                  <option value="Google">Google Search</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Referral">Direct Referral</option>
                  <option value="Other">Other Channel</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Event Potential" icon={<Calendar size={22} />} description="What are they looking for?">
            <div className="form-grid-3">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Event Category</label>
                <select style={inputCls} value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value as LeadEventType })}>
                  <option value="Maternity">Maternity</option>
                  <option value="Influencer">Influencer</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Other">Custom/Other</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Target Date</label>
                <input style={{ ...inputCls, colorScheme: "dark" }} type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Inquiry Date</label>
                <input style={{ ...inputCls, colorScheme: "dark" }} type="date" value={form.inquiryDate} onChange={e => setForm({ ...form, inquiryDate: e.target.value })} />
              </div>
            </div>
            <div className="form-grid-2-1">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Expected Venue / Location</label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input style={{ ...inputCls, paddingLeft: "2.5rem" }} value={form.eventLocation} onChange={e => setForm({ ...form, eventLocation: e.target.value })} placeholder="City or Studio name" />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>Est. Budget (₹)</label>
                <div style={{ position: "relative" }}>
                  <IndianRupee size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input style={{ ...inputCls, paddingLeft: "2.5rem" }} type="number" value={form.budget} onChange={e => setForm({ ...form, budget: parseInt(e.target.value) || 0 })} placeholder="0" />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Pipeline Status" icon={<Clock size={22} />} description="Current state of the discussion">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={labelStyle}>Current Stage</label>
              <select style={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LeadStatus })}>
                <option value="New">🆕 New Inquiry</option>
                <option value="Contacted">📞 Initial Contact Made</option>
                <option value="In Discussion">💬 Active Discussion</option>
                <option value="Converted">✅ Converted to Client</option>
                <option value="Lost">❌ Opportunity Lost</option>
              </select>
            </div>
          </Section>
        </div>

        <Section title="Discovery Notes" icon={<MessageSquare size={22} />} description="Specific requirements or conversation history">
          <textarea
            style={{ ...inputCls, minHeight: "150px", resize: "vertical" }}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Elaborate on requirements, package discussed, or next steps..."
          />
        </Section>

        <div className="form-submit-row">
          <button type="button" className="btn" onClick={() => navigate("/dashboard/leads")} style={{ padding: "0.75rem 2rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.05)", color: "#94a3b8", fontWeight: 700, border: "none", cursor: "pointer" }}>Discard</button>
          <button type="submit" disabled={isPending} style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, #0d9488 100%)", color: "white",
            padding: "0.75rem 3rem", borderRadius: "0.75rem", fontWeight: 800, border: "none",
            display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer",
            boxShadow: "0 10px 15px -3px rgba(13, 148, 136, 0.3)"
          }}>
            <Save size={18} />
            {isPending ? "Syncing..." : isEdit ? "Update Potential" : "Register Lead"}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
