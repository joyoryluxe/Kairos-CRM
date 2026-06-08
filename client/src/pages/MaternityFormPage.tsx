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
import DateTimePicker from "@/components/DateTimePicker";

// ─── Date Helpers ─────────────────────────────────────────────────────────────
const toLocalISOString = (date?: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

const toLocalDateString = (date?: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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
function Section({ title, icon, children, description }: { title: string; icon: React.ReactNode; children: React.ReactNode; description?: string }) {
  return (
    <div className="form-section-card" style={{
      background: "rgba(30, 41, 59, 0.5)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "1.25rem",
      padding: "2rem",
      marginBottom: "2rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      boxSizing: "border-box",
      width: "100%",
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
        shootDateAndTime: toLocalISOString(m.shootDateAndTime),
        deliveryDeadline: toLocalDateString(m.deliveryDeadline),
        birthDate: toLocalDateString(m.birthDate),
        babyName: m.babyName ?? "",
        package: m.package ?? "",
        packagePrice: m.packagePrice ?? 0,
        extras: Array.isArray(m.extras) ? m.extras : [],
        expenses: m.expenses ?? 0,
        payments: Array.isArray(m.payments) ? m.payments.map((p: any) => ({ ...p, date: toLocalDateString(p.date) })) : [],
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

      queryClient.invalidateQueries({ queryKey: ["maternities"] });
      navigate("/dashboard/maternity");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ payload }: { payload: Partial<MaternityInput> }) =>
      updateMaternity(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternities"] });
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
      shootDateAndTime: form.shootDateAndTime ? new Date(form.shootDateAndTime).toISOString() : undefined,
      deliveryDeadline: form.deliveryDeadline ? new Date(form.deliveryDeadline).toISOString() : undefined,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : undefined,
      extras: cleanExtras,
      payments: cleanPayments.map(p => ({ ...p, date: p.date ? new Date(p.date).toISOString() : undefined })),
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

  const handleSelectFullRecord = (record: any) => {
    setForm((prev) => ({
      ...prev,
      phoneNumber: record.phoneNumber || prev.phoneNumber,
      email: record.email || prev.email,
      address: record.address || prev.address,
      babyName: record.babyName || prev.babyName,
    }));

    setTimeout(() => {
      const confirm = window.confirm("Do you also want to fill up the package details, payments, and expenses from this client's previous record?");
      if (confirm) {
        setForm((prev) => ({
          ...prev,
          package: record.package || prev.package,
          packagePrice: record.packagePrice || prev.packagePrice,
          extras: Array.isArray(record.extras) ? record.extras : prev.extras,
          expenses: record.expenses || prev.expenses,
          payments: Array.isArray(record.payments) ? record.payments.map((p: any) => ({ ...p, date: toLocalDateString(p.date) })) : prev.payments,
          notes: record.notes || prev.notes,
        }));
        if (record.package && !packages.some(p => p.name === record.package)) {
          setIsCustomPackage(true);
        } else {
          setIsCustomPackage(false);
        }
      }
    }, 100);
  };

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

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>

        {/* ─── Client Info ───────────────────────────────────────────── */}
        <Section
          title="Client Information"
          icon={<Phone size={20} />}
          description="Essential contact details for the client"
        >
          <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Client Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <AutocompleteInput
                model="maternity"
                field="clientName"
                required
                value={form.clientName}
                onChange={(v: string) => setForm(f => ({ ...f, clientName: v }))}
                onSelectFullRecord={handleSelectFullRecord}
                placeholder="Full name"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Phone Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <AutocompleteInput
                model="maternity"
                field="phoneNumber"
                required
                value={form.phoneNumber}
                onChange={(v: string) => setForm((f) => ({ ...f, phoneNumber: v }))}
                placeholder="+91"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Email Address</label>
              <AutocompleteInput
                model="maternity"
                field="email"
                value={form.email || ""}
                onChange={(v: string) => setForm((f) => ({ ...f, email: v }))}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </Section>

        {/* ─── Address ───────────────────────────────────────────────── */}
        <Section
          title="Shoot Location"
          icon={<MapPin size={20} />}
          description="Where the photography session will take place"
        >
          <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Street / Area</label>
              <AutocompleteInput
                model="maternity"
                field="address.street"
                value={form.address.street}
                onChange={(v: string) => setForm((f) => ({ ...f, address: { ...f.address, street: v } }))}
                placeholder="e.g. 123 Studio Street"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>City</label>
              <AutocompleteInput
                model="maternity"
                field="address.city"
                value={form.address.city}
                onChange={(v: string) => setForm((f) => ({ ...f, address: { ...f.address, city: v } }))}
                placeholder="Mumbai"
              />
            </div>
          </div>
          <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>State</label>
              <AutocompleteInput
                model="maternity"
                field="address.state"
                value={form.address.state}
                onChange={(v: string) => setForm((f) => ({ ...f, address: { ...f.address, state: v } }))}
                placeholder="Maharashtra"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Zip Code</label>
              <AutocompleteInput
                model="maternity"
                field="address.zipCode"
                value={form.address.zipCode}
                onChange={(v: string) => setForm((f) => ({ ...f, address: { ...f.address, zipCode: v } }))}
                placeholder="400001"
              />
            </div>
          </div>
        </Section>

        {/* ─── Baby & Shoot ──────────────────────────────────────────── */}
        <Section
          title="Booking Details"
          icon={<Baby size={20} />}
          description="Timeline and specific shoot information"
        >
          <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Baby Name</label>
                <AutocompleteInput
                  model="maternity"
                  field="babyName"
                  value={form.babyName || ""}
                  onChange={(v: string) => setForm((f) => ({ ...f, babyName: v }))}
                  placeholder="e.g. Baby"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Birth Date</label>
                <input type="date" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} style={{ ...inputCls, padding: "0.75rem", borderRadius: "0.75rem", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#f8fafc", colorScheme: "dark" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Shoot Date & Time</label>
                <DateTimePicker value={form.shootDateAndTime || ""} onChange={(val) => setForm((f) => ({ ...f, shootDateAndTime: val }))} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Delivery Deadline</label>
                <input type="date" value={form.deliveryDeadline} onChange={(e) => setForm((f) => ({ ...f, deliveryDeadline: e.target.value }))} style={{ ...inputCls, padding: "0.75rem", borderRadius: "0.75rem", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#f8fafc", colorScheme: "dark" }} />
              </div>
            </div>
          </div>
        </Section>

        {/* ─── Package ───────────────────────────────────────────────── */}
        <Section
          title="Pricing Plan"
          icon={<Package size={20} />}
          description="Select a package or create a custom one"
        >
          <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>{isCustomPackage ? "Custom Package Name" : "Select Package"}</label>
              {isCustomPackage ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <AutocompleteInput
                    model="maternity"
                    field="package"
                    required
                    value={form.package || ""}
                    onChange={(v: string) => setForm(f => ({ ...f, package: v }))}
                    placeholder="e.g. Special Deal"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => { setIsCustomPackage(false); setForm(f => ({ ...f, package: "" })); }} className="btn-ghost" style={{ padding: "0.5rem", color: "#ef4444" }} title="Back to list"><X size={20} /></button>
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
                  style={{ ...inputCls, borderRadius: "0.75rem", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#f8fafc" }}
                >
                  <option value="">— No package —</option>
                  {packages.map((p) => (
                    <option key={p._id} value={p.name}>{p.name} (₹{p.price.toLocaleString("en-IN")})</option>
                  ))}
                  <option value="___custom___">+ Custom Package</option>
                </select>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Package Price {isCustomPackage ? "(editable)" : "(auto)"}</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  readOnly={!isCustomPackage}
                  value={form.packagePrice || ""}
                  onChange={(e) => setForm(f => ({ ...f, packagePrice: e.target.valueAsNumber || 0 }))}
                  placeholder="0"
                  style={{
                    ...inputCls,
                    padding: "0.75rem 0.75rem 0.75rem 2rem",
                    background: isCustomPackage ? "var(--bg-surface-3)" : "rgba(15, 23, 42, 0.3)",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    cursor: isCustomPackage ? "text" : "not-allowed",
                    color: "var(--color-primary)",
                    fontWeight: 700,
                    fontSize: "1.1rem"
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} style={{ ...inputCls, borderRadius: "0.75rem", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#f8fafc" }}>
                <option value="Pending">🕒 Pending</option>
                <option value="Confirmed">✅ Confirmed</option>
                <option value="Completed">✨ Completed</option>
                <option value="Cancelled">❌ Cancelled</option>
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
                  placeholder=""
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
          <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Expenses (₹)</label>
              <input type="number" min="0" value={form.expenses} onChange={(e) => setForm((f) => ({ ...f, expenses: e.target.valueAsNumber || 0 }))} style={{ ...inputCls, padding: "0.75rem", borderRadius: "0.75rem", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#f8fafc" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.02em" }}>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes for this record…" rows={2} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#f8fafc", resize: "none" }} />
            </div>
          </div>
        </Section>

        {/* ─── Financial Summary ─────────────────────────────────────── */}
        <div style={{
          borderRadius: "1.5rem",
          overflow: "hidden",
          marginBottom: "2.5rem",
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
        }}>
          <div style={{
            padding: "1.25rem 2rem",
            background: "rgba(255, 255, 255, 0.03)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem"
          }}>
            <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "0.05em", color: "#94a3b8", textTransform: "uppercase" }}>Financial Summary</span>
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Total: <strong style={{ color: "#f8fafc" }}>{formatCurrency(total)}</strong></span>
              <span style={{ color: "var(--text-muted)" }}>Balance: <strong style={{ color: balance > 0 ? "#ef4444" : "#10b981" }}>{formatCurrency(balance)}</strong></span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
            {[
              { label: "Base Package", value: formatCurrency(form.packagePrice || 0), color: "#f8fafc", sub: "Primary cost" },
              { label: "Extras", value: formatCurrency(extrasTotal), color: "#f8fafc", sub: "Add-ons total" },
              { label: "Gross Total", value: formatCurrency(total), color: "var(--color-primary)", bold: true, sub: "Before payments" },
              { label: "Amount Paid", value: formatCurrency(paid), color: "#10b981", sub: "Total collected" },
              { label: "Balance Due", value: formatCurrency(balance), color: balance > 0 ? "#ef4444" : "#10b981", bold: true, sub: "Remaining" },
              { label: "Shoot Expenses", value: formatCurrency(form.expenses || 0), color: "#f43f5e", sub: "Direct costs" },
              { label: "Estimated Profit", value: formatCurrency(profit), color: "#10b981", bold: true, sub: "Net earnings" },
            ].map(({ label, value, color, bold, sub }) => (
              <div key={label} style={{ padding: "1rem 1.25rem", borderRight: "1px solid rgba(255, 255, 255, 0.05)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", boxSizing: "border-box" }}>
                <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.4rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: "1.25rem", fontWeight: bold ? 900 : 700, color, marginBottom: "0.2rem" }}>{value}</div>
                <div style={{ fontSize: "0.7rem", color: "#475569" }}>{sub}</div>
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
