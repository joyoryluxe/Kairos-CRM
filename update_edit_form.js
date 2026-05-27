const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'EditFormPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update imports
content = content.replace(
  /} from "lucide-react";/,
  `  Package,
  Plus,
  X,
  Building2
} from "lucide-react";`
);

content = content.replace(
  /import Loader from "..\/components\/Loader";/,
  `import { getActivePackages, type Package as PackageType } from "../api/packages";
import Loader from "../components/Loader";

const formatCurrency = (v?: number) =>
  v == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);`
);

// 2. Update EMPTY_FORM
content = content.replace(
  /photoClipCount: 0,\n};/,
  `photoClipCount: 0,
  package: "",
  packagePrice: 0,
  extras: [],
  payments: [],
  expenses: 0,
};`
);

// 3. Update EditFormPage state and query
content = content.replace(
  /const \[form, setForm\] = useState<EditInput>\(EMPTY_FORM\);/,
  `const [form, setForm] = useState<EditInput>(EMPTY_FORM);
  const [isCustomPackage, setIsCustomPackage] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { data: packages = [] } = useQuery<PackageType[]>({
    queryKey: ["packages", "Edits"],
    queryFn: () => getActivePackages("Edits"),
  });`
);

// 4. Update useEffect
content = content.replace(
  /if \(isEdit && isSuccess && edit\) {[^}]*}[^}]*}/,
  `if (isEdit && isSuccess && edit && !loaded) {
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
        package: edit.package ?? "",
        packagePrice: edit.packagePrice ?? 0,
        extras: Array.isArray(edit.extras) ? edit.extras : [],
        payments: Array.isArray(edit.payments) ? edit.payments.map((p: any) => ({ ...p, date: toLocalDateString(p.date) })) : [],
        expenses: edit.expenses ?? 0,
      });
      if (edit.package && !packages.some(p => p.name === edit.package)) {
        setIsCustomPackage(true);
      }
      setLoaded(true);
    }`
);
content = content.replace(/\[isEdit, isSuccess, edit\]\);/, `[isEdit, isSuccess, edit, loaded, packages]);`);

// 5. Update handleSubmit and add helpers
content = content.replace(
  /const handleSubmit = \(e: React.FormEvent\) => {[^}]*};\n\n  const isPending = createMutation.isPending \|\| updateMutation.isPending;/,
  `// Extras
  const extras = Array.isArray(form.extras) ? form.extras : [];
  const addExtra = () => setForm((f) => ({ ...f, extras: [...(f.extras ?? []), { description: "", amount: 0 }] }));
  const removeExtra = (i: number) => setForm((f) => ({ ...f, extras: (f.extras ?? []).filter((_, j) => j !== i) }));
  const updateExtra = (i: number, k: "description" | "amount", v: string | number) =>
    setForm((f) => { const a = [...(f.extras ?? [])]; a[i] = { ...a[i], [k]: v } as any; return { ...f, extras: a }; });

  // Payments
  const payments = Array.isArray(form.payments) ? form.payments : [];
  const addPayment = () => setForm((f) => ({ ...f, payments: [...(f.payments ?? []), { amount: 0, date: new Date().toISOString().split("T")[0], note: "" }] }));
  const removePayment = (i: number) => setForm((f) => ({ ...f, payments: (f.payments ?? []).filter((_, j) => j !== i) }));
  const updatePayment = (i: number, k: "amount" | "date" | "note", v: string | number) =>
    setForm((f) => { const a = [...(f.payments ?? [])]; a[i] = { ...a[i], [k]: v } as any; return { ...f, payments: a }; });

  // Totals
  const extrasTotal = extras.reduce((s, e) => s + (e.amount || 0), 0);
  const total = (form.packagePrice || 0) + extrasTotal;
  const paid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const balance = total - paid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanExtras = (form.extras || []).filter(ex => ex.description.trim() !== "" || ex.amount > 0);
    const cleanPayments = (form.payments || []).filter(p => p.amount > 0);
    const payload = {
      ...form,
      extras: cleanExtras,
      payments: cleanPayments.map(p => ({ ...p, date: p.date ? new Date(p.date).toISOString() : undefined })),
      receivedDate: form.receivedDate ? new Date(form.receivedDate).toISOString() : undefined,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      total,
      advance: paid,
      balance,
    } as any;
    isEdit ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;`
);


// 6. Insert new UI sections before Strategic Notes
content = content.replace(
  /<\/Section>\n          <\/div>\n\n          <Section title="Strategic Notes"/,
  `<\/Section>
          </div>

        {/* ─── Package ─────────────────────────────────────────────── */}
        <Section title="Package" icon={<Package size={18} />}>
          <div className="form-grid-2">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={labelStyle}>{isCustomPackage ? "Custom Package Name" : "Select Package"}</label>
              {isCustomPackage ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <AutocompleteInput 
                    model="edit" 
                    field="package" 
                    required 
                    value={form.package || ""} 
                    onChange={(v: string) => setForm(f => ({ ...f, package: v }))} 
                    placeholder="e.g. Special Deal" 
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => { setIsCustomPackage(false); setForm(f => ({ ...f, package: "" })); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ef4444" }} title="Back to list"><X size={20} /></button>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={labelStyle}>Package Price {isCustomPackage ? "(editable)" : "(auto)"}</label>
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
                    paddingLeft: "2rem",
                    background: isCustomPackage ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.3)", 
                    cursor: isCustomPackage ? "text" : "not-allowed", 
                    color: "var(--color-primary)", 
                    fontWeight: 700,
                  }} 
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ─── Extras ───────────────────────────────────────────────── */}
        <Section title="Extras & Add-ons" icon={<Plus size={18} />}>
          {extras.map((extra, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <input value={extra.description} onChange={(e) => updateExtra(i, "description", e.target.value)} placeholder="Extra service description" style={{ ...inputCls, flex: "2 1 200px" }} />
              <div style={{ position: "relative", flex: "1 1 120px" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                <input type="number" value={extra.amount} onChange={(e) => updateExtra(i, "amount", e.target.valueAsNumber || 0)} placeholder="0" style={{ ...inputCls, paddingLeft: "1.75rem" }} />
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
                <input type="number" value={p.amount} onChange={(e) => updatePayment(i, "amount", e.target.valueAsNumber || 0)} style={{ ...inputCls, paddingLeft: "1.75rem" }} />
              </div>
              <input type="date" value={p.date} onChange={(e) => updatePayment(i, "date", e.target.value)} style={{ ...inputCls, flex: "0 0 150px", colorScheme: "dark" }} />
              <input value={p.note || ""} onChange={(e) => updatePayment(i, "note", e.target.value)} placeholder="Note (optional)" style={{ ...inputCls, flex: "1 1 150px" }} />
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

        {/* ─── Expenses ──────────────────────────────────────── */}
        <Section title="Expenses" icon={<Building2 size={18} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
            <label style={labelStyle}>Editing/Production Expenses (₹)</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: 600 }}>₹</span>
              <input
                type="number"
                min="0"
                value={form.expenses || ""}
                onChange={(e) => setForm((f) => ({ ...f, expenses: e.target.valueAsNumber || 0 }))}
                placeholder="0"
                style={{ ...inputCls, paddingLeft: "2rem" }}
              />
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
              { label: "Expenses", value: formatCurrency(form.expenses || 0), color: "#f43f5e", sub: "Direct costs" },
              { label: "Estimated Profit", value: formatCurrency(total - (form.expenses || 0)), color: "#10b981", bold: true, sub: "Net earnings" },
            ].map(({ label, value, color, bold, sub }) => (
              <div key={label} style={{ padding: "1rem 1.25rem", borderRight: "1px solid rgba(255, 255, 255, 0.05)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", boxSizing: "border-box" }}>
                <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.4rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: "1.25rem", fontWeight: bold ? 900 : 700, color, marginBottom: "0.2rem" }}>{value}</div>
                <div style={{ fontSize: "0.7rem", color: "#475569" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

          <Section title="Strategic Notes"`
);


fs.writeFileSync(filePath, content);
console.log('Done replacing in EditFormPage.tsx');
