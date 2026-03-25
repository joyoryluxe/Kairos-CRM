import {
  Building2, Phone, Calendar, Package, Plus, X,
  ArrowLeft, Save, ChevronRight, Clock,
} from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCorporateEvent,
  getCorporateEventById,
  updateCorporateEvent,
  type CorporateEventInput,
} from "@/api/corporateEvents";
import { getActivePackages, type Package as PackageType } from "@/api/packages";

// ─── Section Card ──────────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-surface-2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "1.5rem", marginBottom: "1.25rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
        <span style={{ color: "var(--color-primary)" }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" };
const inputCls = { width: "100%" };

const formatCurrency = (v?: number) =>
  v == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);

interface FormState extends CorporateEventInput {
  notes?: string;
  extras?: Array<{ description: string; amount: number }>;
  payments?: Array<{ amount: number; date: string; note?: string }>;
  expenses?: number;
  packagePrice: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

const EMPTY: FormState = {
  clientName: "",
  phoneNumber: "",
  eventName: "",
  eventDateAndTime: "",
  deliveryDeadline: "",
  package: "",
  notes: "",
  extras: [],
  payments: [],
  expenses: 0,
  packagePrice: 0,
  status: "Pending",
};

export default function CorporateFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [isCustomPackage, setIsCustomPackage] = useState(false);

  // Dynamic packages
  const { data: packages = [] } = useQuery<PackageType[]>({
    queryKey: ["packages", "Corporate"],
    queryFn: () => getActivePackages("Corporate"),
  });

  // Load existing record for edit
  const { data: existingRecord, isSuccess } = useQuery({
    queryKey: ["corporate-events", id],
    queryFn: () => getCorporateEventById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && isSuccess && existingRecord && !loaded) {
      const m = existingRecord;
      setForm({
        clientName: m.clientName,
        phoneNumber: m.phoneNumber,
        eventName: m.eventName ?? "",
        eventDateAndTime: m.eventDateAndTime ? new Date(m.eventDateAndTime).toISOString().slice(0, 16) : "",
        deliveryDeadline: m.deliveryDeadline ? new Date(m.deliveryDeadline).toISOString().slice(0, 10) : "",
        package: m.package ?? "",
        packagePrice: m.packagePrice ?? 0,
        notes: m.notes ?? "",
        extras: Array.isArray(m.extras) ? m.extras : [],
        payments: Array.isArray(m.payments) ? m.payments.map((p: any) => ({ ...p, date: p.date ? new Date(p.date).toISOString().slice(0, 10) : "" })) : [],
        expenses: m.expenses ?? 0,
        status: m.status ?? "Pending",
      });
      // If the package is not in the list (and not empty), it's custom
      if (m.package && !packages.some(p => p.name === m.package)) {
        setIsCustomPackage(true);
      }
      setLoaded(true);
    }
  }, [isEdit, isSuccess, existingRecord, loaded, packages]);



  const createMutation = useMutation({
    mutationFn: createCorporateEvent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["corporate-events"] }); navigate("/dashboard/corporate"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ payload }: { payload: Partial<CorporateEventInput> }) => updateCorporateEvent(id!, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["corporate-events"] }); navigate("/dashboard/corporate"); },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...form,
      eventDateAndTime: form.eventDateAndTime || null,
      deliveryDeadline: form.deliveryDeadline || null,
      total,
      advance: paid,
      balance,
    };
    if (isEdit) updateMutation.mutate({ payload });
    else createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutError = createMutation.error || updateMutation.error;

  // Extras
  const extras = Array.isArray(form.extras) ? form.extras : [];
  const addExtra = () => setForm((f) => ({ ...f, extras: [...(f.extras ?? []), { description: "", amount: 0 }] }));
  const removeExtra = (i: number) => setForm((f) => ({ ...f, extras: (f.extras ?? []).filter((_, j) => j !== i) }));
  const updateExtra = (i: number, k: "description" | "amount", v: string | number) =>
    setForm((f) => { const a = [...(f.extras ?? [])]; a[i] = { ...a[i], [k]: v }; return { ...f, extras: a }; });

  // Payments
  const payments = Array.isArray(form.payments) ? form.payments : [];
  const addPayment = () => setForm((f) => ({ ...f, payments: [...(f.payments ?? []), { amount: 0, date: new Date().toISOString().split("T")[0], note: "" }] }));
  const removePayment = (i: number) => setForm((f) => ({ ...f, payments: (f.payments ?? []).filter((_, j) => j !== i) }));
  const updatePayment = (i: number, k: "amount" | "date" | "note", v: string | number) =>
    setForm((f) => { const a = [...(f.payments ?? [])]; a[i] = { ...a[i], [k]: v }; return { ...f, payments: a }; });

  // Totals
  const extrasTotal = extras.reduce((s, e) => s + (e.amount || 0), 0);
  const total = (form.packagePrice || 0) + extrasTotal;
  const paid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const balance = total - paid;

  return (
    <div className="animate-fade-up" style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem 3rem" }}>
      {isPending && <Loader fullPage message="Saving corporate event..." />}
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <button type="button" onClick={() => navigate("/dashboard/corporate")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: 0, marginBottom: "1rem" }}>
          <ArrowLeft size={16} /> Back to Corporate
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          <span>Corporate & Events</span><ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{isEdit ? "Edit Event" : "New Event"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
            <Building2 size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              {isEdit ? "Edit Corporate Event" : "Add Corporate Event"}
            </h1>
            <p style={{ margin: "0.2rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>B2B Contracts & Large Events</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ─── Client Info ─────────────────────────────────────────── */}
        <Section title="Client Information" icon={<Phone size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Company / Client Name <span style={{ color: "var(--color-danger)" }}>*</span></label>
              <input required value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} placeholder="e.g. Tata Corp Ltd" style={inputCls} />
            </div>
            <div>
              <label style={labelStyle}>Phone <span style={{ color: "var(--color-danger)" }}>*</span></label>
              <input required value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} placeholder="+91 98765 43210" style={inputCls} />
            </div>
          </div>
        </Section>

        {/* ─── Event Details ────────────────────────────────────────── */}
        <Section title="Event Details" icon={<Calendar size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Event Name</label>
              <input value={form.eventName} onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))} placeholder="e.g. Annual Gala 2026" style={inputCls} />
            </div>
            <div>
              <label style={labelStyle}>Event Date & Time</label>
              <input type="datetime-local" value={form.eventDateAndTime} onChange={(e) => setForm((f) => ({ ...f, eventDateAndTime: e.target.value }))} style={inputCls} />
            </div>
            <div>
              <label style={labelStyle}>Delivery Deadline</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-warning)" }}><Clock size={15} /></span>
                <input type="date" value={form.deliveryDeadline} onChange={(e) => setForm((f) => ({ ...f, deliveryDeadline: e.target.value }))} style={{ ...inputCls, paddingLeft: "2.25rem" }} />
              </div>
            </div>
          </div>
        </Section>

        {/* ─── Package ─────────────────────────────────────────────── */}
        <Section title="Package" icon={<Package size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>{isCustomPackage ? "Custom Package Name" : "Select Package"}</label>
              {isCustomPackage ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input required value={form.package} onChange={(e) => setForm((f) => ({ ...f, package: e.target.value }))} placeholder="e.g. Special Deal" style={inputCls} />
                  <button type="button" onClick={() => { setIsCustomPackage(false); setForm(f => ({ ...f, package: "" })); }} className="btn-ghost" style={{ padding: "0.5rem", color: "var(--color-primary)" }} title="Back to list"><X size={18} /></button>
                </div>
              ) : (
                <select value={form.package ?? ""} onChange={(e) => {
                  const val = e.target.value;
                  if (val === "___custom___") {
                    setIsCustomPackage(true);
                    setForm(f => ({ ...f, package: "", packagePrice: 0 }));
                  } else {
                    const pkg = packages.find(p => p.name === val);
                    setForm((f) => ({ ...f, package: val, packagePrice: pkg?.price ?? 0 }));
                  }
                }} style={inputCls}>
                  <option value="">— No package —</option>
                  {packages.map((p) => (
                    <option key={p._id} value={p.name}>{p.name} (₹{p.price.toLocaleString("en-IN")})</option>
                  ))}
                  <option value="___custom___">+ Custom Package</option>
                </select>
              )}
            </div>
            <div>
              <label style={labelStyle}>Package Price {isCustomPackage ? "(editable)" : "(auto)"}</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  readOnly={!isCustomPackage}
                  value={form.packagePrice || ""}
                  onChange={(e) => setForm(f => ({ ...f, packagePrice: e.target.valueAsNumber || 0 }))}
                  placeholder="0"
                  style={{ 
                    ...inputCls, 
                    paddingLeft: "1.75rem",
                    background: isCustomPackage ? "var(--bg-surface)" : "var(--bg-surface-3)", 
                    cursor: isCustomPackage ? "text" : "not-allowed", 
                    color: "var(--color-primary)", 
                    fontWeight: 700 
                  }} 
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} style={inputCls}>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Section>

        {/* ─── Extras ───────────────────────────────────────────────── */}
        <Section title="Extras & Add-ons" icon={<Plus size={18} />}>
          {extras.map((extra, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <input value={extra.description} onChange={(e) => updateExtra(i, "description", e.target.value)} placeholder="Extra service description" style={{ flex: "2 1 200px" }} />
              <div style={{ position: "relative", flex: "1 1 120px" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                <input type="number" value={extra.amount} onChange={(e) => updateExtra(i, "amount", e.target.valueAsNumber || 0)} placeholder="0" style={{ width: "100%", paddingLeft: "1.75rem" }} />
              </div>
              <button type="button" onClick={() => removeExtra(i)} style={{ background: "var(--color-danger-glow)", border: "none", borderRadius: "var(--radius-md)", padding: "0.5rem", cursor: "pointer", color: "var(--color-danger)", lineHeight: 0 }}><X size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={addExtra} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "var(--color-primary-glow)", border: "1px dashed var(--color-primary)", color: "var(--color-primary)", borderRadius: "var(--radius-md)", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
            <Plus size={16} /> Add Extra
          </button>
          {extras.length > 0 && (
            <div style={{ marginTop: "0.75rem", textAlign: "right", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Extras Total: <strong>{formatCurrency(extrasTotal)}</strong>
            </div>
          )}
        </Section>

        {/* ─── Payments ─────────────────────────────────────────────── */}
        <Section title="Payments" icon={<Calendar size={18} />}>
          {payments.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "0 0 130px" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                <input type="number" value={p.amount} onChange={(e) => updatePayment(i, "amount", e.target.valueAsNumber || 0)} style={{ width: "100%", paddingLeft: "1.75rem" }} />
              </div>
              <input type="date" value={p.date} onChange={(e) => updatePayment(i, "date", e.target.value)} style={{ flex: "0 0 150px" }} />
              <input value={p.note} onChange={(e) => updatePayment(i, "note", e.target.value)} placeholder="Note (optional)" style={{ flex: "1 1 150px" }} />
              <button type="button" onClick={() => removePayment(i)} style={{ background: "var(--color-danger-glow)", border: "none", borderRadius: "var(--radius-md)", padding: "0.5rem", cursor: "pointer", color: "var(--color-danger)", lineHeight: 0 }}><X size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={addPayment} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "var(--color-primary-glow)", border: "1px dashed var(--color-primary)", color: "var(--color-primary)", borderRadius: "var(--radius-md)", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
            <Plus size={16} /> Add Payment
          </button>
          {payments.length > 0 && (
            <div style={{ marginTop: "0.75rem", textAlign: "right", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Total Advance: <strong>{formatCurrency(paid)}</strong>
            </div>
          )}
        </Section>

        {/* ─── Expenses & Notes ──────────────────────────────────────── */}
        <Section title="Expenses & Notes" icon={<Building2 size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Shoot Expenses (₹)</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  min="0"
                  value={form.expenses || ""}
                  onChange={(e) => setForm((f) => ({ ...f, expenses: e.target.valueAsNumber || 0 }))}
                  placeholder="0"
                  style={{ ...inputCls, paddingLeft: "1.75rem" }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Contract terms, special requirements, notes…" rows={2} style={{ width: "100%", resize: "vertical" }} />
            </div>
          </div>
        </Section>

        {/* ─── Financial Summary ────────────────────────────────────── */}
        <div style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "1.5rem", background: "var(--bg-surface-2)" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: "0.9rem" }}>Financial Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
            {[
              { label: "Package", value: formatCurrency(form.packagePrice || 0), color: "var(--color-primary)" },
              { label: "Extras", value: formatCurrency(extrasTotal), color: "var(--text-primary)" },
              { label: "Total", value: formatCurrency(total), color: "var(--color-primary)", bold: true },
              { label: "Expenses", value: formatCurrency(form.expenses), color: "var(--color-danger)" },
              { label: "Profit", value: formatCurrency(total - (form.expenses || 0)), color: "#10b981", bold: true },
              { label: "Paid", value: formatCurrency(paid), color: "hsl(142,71%,45%)" },
              { label: "Balance Due", value: formatCurrency(balance), color: balance > 0 ? "var(--color-danger)" : "hsl(142,71%,45%)", bold: true },
            ].map(({ label, value, color, bold }) => (
              <div key={label} style={{ padding: "1rem 1.5rem", borderRight: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                <div style={{ fontSize: "1.2rem", fontWeight: bold ? 800 : 600, color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {mutError && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-md)", color: "var(--color-danger)", fontSize: "0.9rem" }}>
            {(mutError as Error)?.message || "Failed to save record"}
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={() => navigate("/dashboard/corporate")}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isPending} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", minWidth: 160 }}>
            <Save size={16} />
            {isPending ? "Saving…" : isEdit ? "Update Event" : "Save Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
