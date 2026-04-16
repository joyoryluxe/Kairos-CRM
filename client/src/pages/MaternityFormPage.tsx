import {
  Baby, Phone, Calendar, MapPin, Package, Plus,
  ArrowLeft, Save, ChevronRight,
} from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMaternity,
  getMaternityById,
  updateMaternity,
  type MaternityInput,
} from "@/api/maternity";
import { getActivePackages, type Package as PackageType } from "@/api/packages";
import { saveFormHistory, getFormHistory, saveFieldHistory } from "@/utils/formHistory";
import { History as HistoryIcon, X } from "lucide-react";
import AutocompleteInput from "@/components/AutocompleteInput";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  clientName: string;
  phoneNumber: string;
  email?: string;
  address: { street: string; city: string; state: string; zipCode: string };
  shootDateAndTime?: string;
  deliveryDeadline?: string;
  birthDate?: string;
  babyName?: string;
  package?: string;
  packagePrice: number;
  extras: Array<{ description: string; amount: number }>;
  expenses: number;
  payments: Array<{ amount: number; date: string; note?: string }>;
  notes?: string;
  status?: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

const EMPTY: FormState = {
  clientName: "",
  phoneNumber: "",
  email: "",
  address: { street: "", city: "", state: "", zipCode: "" },
  shootDateAndTime: "",
  deliveryDeadline: "",
  birthDate: "",
  babyName: "",
  package: "",
  packagePrice: 0,
  extras: [],
  expenses: 0,
  payments: [],
  notes: "",
  status: "Pending",
};

const formatCurrency = (v?: number) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);

// ─── Section Card ──────────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "1.5rem",
      marginBottom: "1.25rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
        <span style={{ color: "var(--color-primary)" }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function MaternityFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [isCustomPackage, setIsCustomPackage] = useState(false);

  // Dynamic packages
  const { data: packages = [] } = useQuery<PackageType[]>({
    queryKey: ["packages", "Maternity"],
    queryFn: () => getActivePackages("Maternity"),
  });
  const { data: existingRecord, isSuccess } = useQuery({
    queryKey: ["maternity", id],
    queryFn: () => getMaternityById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && isSuccess && existingRecord && !loaded) {
      const m = existingRecord;
      setForm({
        clientName: m.clientName,
        phoneNumber: m.phoneNumber,
        email: m.email ?? "",
        address: m.address ?? { street: "", city: "", state: "", zipCode: "" },
        shootDateAndTime: m.shootDateAndTime
          ? new Date(m.shootDateAndTime).toISOString().slice(0, 16)
          : "",
        deliveryDeadline: m.deliveryDeadline
          ? new Date(m.deliveryDeadline).toISOString().slice(0, 10)
          : "",
        birthDate: m.birthDate ? new Date(m.birthDate).toISOString().slice(0, 10) : "",
        babyName: m.babyName ?? "",
        package: m.package ?? "",
        packagePrice: m.packagePrice ?? 0,
        extras: Array.isArray(m.extras) ? m.extras : [],
        expenses: m.expenses ?? 0,
        payments: Array.isArray(m.payments) ? m.payments.map((p: any) => ({ ...p, date: p.date ? new Date(p.date).toISOString().slice(0, 10) : "" })) : [],
        notes: m.notes ?? "",
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
    mutationFn: createMaternity,
    onSuccess: () => {
      // Save to history
      const historyData = {
        clientName: form.clientName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        address: form.address,
        package: form.package,
        packagePrice: form.packagePrice,
      };
      saveFormHistory("maternity", historyData);
      
      // Save individual fields history
      saveFieldHistory("maternity", "clientName", form.clientName);
      saveFieldHistory("maternity", "phoneNumber", form.phoneNumber);
      saveFieldHistory("maternity", "email", form.email);
      saveFieldHistory("maternity", "city", form.address.city);

      queryClient.invalidateQueries({ queryKey: ["maternity"] });
      navigate("/dashboard/maternity");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ payload }: { payload: Partial<MaternityInput> }) =>
      updateMaternity(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity"] });
      navigate("/dashboard/maternity");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Sanitize arrays: remove items with empty descriptions/amounts
    const cleanExtras = (form.extras || []).filter(ex => ex.description.trim() !== "" || ex.amount > 0);
    const cleanPayments = (form.payments || []).filter(p => p.amount > 0);

    const payload: any = {
      ...form,
      extras: cleanExtras,
      payments: cleanPayments,
      total,
      advance: paid,
      balance,
    };

    if (isEdit) {
      updateMutation.mutate({ payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutError = createMutation.error || updateMutation.error;

  // Safe arrays
  const extras = Array.isArray(form.extras) ? form.extras : [];
  const payments = Array.isArray(form.payments) ? form.payments : [];

  // Extras helpers
  const addExtra = () => setForm((f) => ({ ...f, extras: [...extras, { description: "", amount: 0 }] }));
  const removeExtra = (i: number) => setForm((f) => ({ ...f, extras: extras.filter((_, idx) => idx !== i) }));
  const updateExtra = (i: number, k: "description" | "amount", v: string | number) =>
    setForm((f) => { const a = [...extras]; a[i] = { ...a[i], [k]: v }; return { ...f, extras: a }; });

  // Payments helpers
  const addPayment = () => setForm((f) => ({ ...f, payments: [...payments, { amount: 0, date: new Date().toISOString().split("T")[0], note: "" }] }));
  const removePayment = (i: number) => setForm((f) => ({ ...f, payments: payments.filter((_, idx) => idx !== i) }));
  const updatePayment = (i: number, k: "amount" | "date" | "note", v: string | number) =>
    setForm((f) => { const a = [...payments]; a[i] = { ...a[i], [k]: v }; return { ...f, payments: a }; });

  // Live totals
  const extrasTotal = extras.reduce((s, e) => s + (e.amount || 0), 0);
  const total = (form.packagePrice || 0) + extrasTotal;
  const paid = (form.payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const balance = total - paid;
  const profit = total - (form.expenses || 0);

  const [backupState, setBackupState] = useState<FormState | null>(null);

  const inputCls = { width: "100%" };

  const handleLoadHistory = () => {
    const history = getFormHistory("maternity");
    if (history) {
      setBackupState({ ...form });
      setForm((f) => ({
        ...f,
        ...history,
        address: history.address || f.address,
      }));
      if (history.package && !packages.some(p => p.name === history.package)) {
        setIsCustomPackage(true);
      } else {
        setIsCustomPackage(false);
      }
    }
  };

  const handleUndoHistory = () => {
    if (backupState) {
      setForm(backupState);
      setBackupState(null);
    }
  };

  const hasHistory = !isEdit && !!getFormHistory("maternity");

  return (
    <div className="animate-fade-up" style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem 3rem" }}>
      {isPending && <Loader fullPage message={isEdit ? "Updating record..." : "Creating record..."} />}
      {/* ─── Breadcrumb Header ─────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          type="button"
          onClick={() => navigate("/dashboard/maternity")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "0.85rem", padding: 0, marginBottom: "1rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Maternity
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          <span>Maternity / Newborn</span>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{isEdit ? "Edit Record" : "New Record"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
            <Baby size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              {isEdit ? "Edit Record" : "Add New Record"}
            </h1>
            <p style={{ margin: "0.2rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Maternity & Newborn Photography
            </p>
          </div>

          {hasHistory && (
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
              {backupState && (
                <button
                  type="button"
                  onClick={handleUndoHistory}
                  className="btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "var(--bg-surface-3)",
                    color: "var(--color-danger)",
                    border: "1px solid var(--color-danger-glow)",
                    padding: "0.5rem 1rem",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                  title="Restore before fill"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={handleLoadHistory}
                className="btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "var(--bg-surface-3)",
                  color: "var(--color-primary)",
                  border: "1px solid var(--color-primary-glow)",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <HistoryIcon size={16} />
                Fill from Last Submission
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ─── Client Info ───────────────────────────────────────────── */}
        <Section title="Client Information" icon={<Phone size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Client Name <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
              </div>
              <AutocompleteInput 
                model="maternity" 
                field="clientName" 
                required 
                value={form.clientName} 
                onChange={(v: string) => setForm(f => ({ ...f, clientName: v }))} 
                placeholder="e.g. Priya Sharma" 
              />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Phone <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
              </div>
              <AutocompleteInput 
                model="maternity" 
                field="phoneNumber" 
                required 
                value={form.phoneNumber} 
                onChange={(v: string) => setForm((f) => ({ ...f, phoneNumber: v }))} 
                placeholder="+91 98765 43210" 
              />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Email Address
                </label>
              </div>
              <AutocompleteInput 
                model="maternity" 
                field="email" 
                value={form.email || ""} 
                onChange={(v: string) => setForm((f) => ({ ...f, email: v }))} 
                placeholder="client@example.com" 
              />
            </div>
          </div>
        </Section>

        {/* ─── Address ───────────────────────────────────────────────── */}
        <Section title="Address" icon={<MapPin size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            {(["street", "city", "state", "zipCode"] as const).map((field) => (
              <div key={field}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                  {field === "zipCode" ? "Zip Code" : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <AutocompleteInput
                  model="maternity"
                  field={`address.${field}`}
                  value={form.address[field]}
                  onChange={(v: string) => setForm((f) => ({ ...f, address: { ...f.address, [field]: v } }))}
                  placeholder={field === "zipCode" ? "400001" : ""}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Baby & Shoot ──────────────────────────────────────────── */}
        <Section title="Baby & Shoot Details" icon={<Baby size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Baby Name</label>
              <AutocompleteInput 
                model="maternity" 
                field="babyName" 
                value={form.babyName || ""} 
                onChange={(v: string) => setForm((f) => ({ ...f, babyName: v }))} 
                placeholder="e.g. Aanya" 
              />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Birth Date</label>
              <input type="date" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} style={inputCls} />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Shoot Date & Time</label>
              <input type="datetime-local" value={form.shootDateAndTime} onChange={(e) => setForm((f) => ({ ...f, shootDateAndTime: e.target.value }))} style={inputCls} />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Delivery Deadline</label>
              <input type="date" value={form.deliveryDeadline} onChange={(e) => setForm((f) => ({ ...f, deliveryDeadline: e.target.value }))} style={inputCls} />
            </div>
          </div>
        </Section>

        {/* ─── Package ───────────────────────────────────────────────── */}
        <Section title="Package" icon={<Package size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>{isCustomPackage ? "Custom Package Name" : "Select Package"}</label>
              {isCustomPackage ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <AutocompleteInput 
                    model="maternity" 
                    field="package" 
                    required 
                    value={form.package || ""} 
                    onChange={(v: string) => setForm(f => ({ ...f, package: v }))} 
                    placeholder="e.g. Special Deal" 
                  />
                  <button type="button" onClick={() => { setIsCustomPackage(false); setForm(f => ({ ...f, package: "" })); }} className="btn-ghost" style={{ padding: "0.5rem", color: "var(--color-primary)" }} title="Back to list"><X size={18} /></button>
                </div>
              ) : (
                <select
                  value={form.package}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "___custom___") {
                      setIsCustomPackage(true);
                      setForm(f => ({ ...f, package: "", packagePrice: 0 }));
                    } else {
                      const pkg = packages.find(p => p.name === val);
                      setForm((f) => ({ ...f, package: val, packagePrice: pkg?.price ?? 0 }));
                    }
                  }}
                  style={inputCls}
                >
                  <option value="">— No package —</option>
                  {packages.map((p) => (
                    <option key={p._id} value={p.name}>{p.name} (₹{p.price.toLocaleString("en-IN")})</option>
                  ))}
                  <option value="___custom___">+ Custom Package</option>
                </select>
              )}
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Package Price {isCustomPackage ? "(editable)" : "(auto)"}</label>
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
              <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} style={inputCls}>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Section>

        {/* ─── Extras ────────────────────────────────────────────────── */}
        <Section title="Extras & Add-ons" icon={<Plus size={18} />}>
          {extras.map((extra, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" }}
            >
              <input
                value={extra.description}
                onChange={(e) => updateExtra(i, "description", e.target.value)}
                placeholder="Extra description"
                style={{ flex: "2 1 200px" }}
              />
              <div style={{ position: "relative", flex: "1 1 120px" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  value={extra.amount}
                  onChange={(e) => updateExtra(i, "amount", e.target.valueAsNumber || 0)}
                  placeholder="0"
                  style={{ width: "100%", paddingLeft: "1.75rem" }}
                />
              </div>
              <button type="button" onClick={() => removeExtra(i)} style={{ background: "var(--color-danger-glow)", border: "none", borderRadius: "var(--radius-md)", padding: "0.5rem", cursor: "pointer", color: "var(--color-danger)", lineHeight: 0 }}>
                <X size={16} />
              </button>
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

        {/* ─── Payments ──────────────────────────────────────────────── */}
        <Section title="Payments" icon={<Calendar size={18} />}>
          {payments.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "0 0 130px" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                <input type="number" value={p.amount} onChange={(e) => updatePayment(i, "amount", e.target.valueAsNumber || 0)} placeholder="0" style={{ width: "100%", paddingLeft: "1.75rem" }} />
              </div>
              <input type="date" value={p.date} onChange={(e) => updatePayment(i, "date", e.target.value)} style={{ flex: "0 0 150px" }} />
              <input value={p.note} onChange={(e) => updatePayment(i, "note", e.target.value)} placeholder="Note (optional)" style={{ flex: "1 1 150px" }} />
              <button type="button" onClick={() => removePayment(i)} style={{ background: "var(--color-danger-glow)", border: "none", borderRadius: "var(--radius-md)", padding: "0.5rem", cursor: "pointer", color: "var(--color-danger)", lineHeight: 0 }}>
                <X size={16} />
              </button>
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

        {/* ─── Other ─────────────────────────────────────────────────── */}
        <Section title="Expenses & Notes" icon={<MapPin size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Expenses (₹)</label>
              <input type="number" min="0" value={form.expenses} onChange={(e) => setForm((f) => ({ ...f, expenses: e.target.valueAsNumber || 0 }))} style={inputCls} />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes for this record…" rows={2} style={{ width: "100%", resize: "vertical" }} />
            </div>
          </div>
        </Section>

        {/* ─── Financial Summary ─────────────────────────────────────── */}
        <div style={{
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          marginBottom: "1.5rem",
          background: "var(--bg-surface-2)",
        }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: "0.9rem" }}>
            Financial Summary
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
            {[
              { label: "Package", value: formatCurrency(form.packagePrice || 0), color: "var(--color-primary)" },
              { label: "Extras", value: formatCurrency(extrasTotal), color: "var(--text-primary)" },
              { label: "Total", value: formatCurrency(total), color: "var(--color-primary)", bold: true },
              { label: "Paid", value: formatCurrency(paid), color: "hsl(142,71%,45%)" },
              { label: "Balance Due", value: formatCurrency(balance), color: balance > 0 ? "var(--color-danger)" : "hsl(142,71%,45%)", bold: true },
              { label: "Expenses", value: formatCurrency(form.expenses || 0), color: "var(--color-danger)" },
              { label: "Profit", value: formatCurrency(profit), color: "#10b981", bold: true },
            ].map(({ label, value, color, bold }) => (
              <div key={label} style={{ padding: "1rem 1.5rem", borderRight: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                <div style={{ fontSize: "1.2rem", fontWeight: bold ? 800 : 600, color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Error ─────────────────────────────────────────────────── */}
        {mutError && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-md)", color: "var(--color-danger)", fontSize: "0.9rem" }}>
            {(mutError as Error)?.message || "Failed to save record"}
          </div>
        )}

        {/* ─── Action Buttons ────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={() => navigate("/dashboard/maternity")}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", minWidth: 150 }}
          >
            <Save size={16} />
            {isPending ? "Saving…" : isEdit ? "Update Record" : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
