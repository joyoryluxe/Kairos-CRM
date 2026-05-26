import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoiceById,
  createInvoice,
  updateInvoice,
  getInvoices,
  type InvoiceInput,
  type InvoiceItem
} from "@/api/invoice";
import logoImage from "../Kairos Logo.png";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  FileText,
  Landmark,
  QrCode,
  ScrollText,
  ChevronRight,
  Clock,
  Download,
  Receipt
} from "lucide-react";
import Loader from "@/components/Loader";

const PAPER_STYLES = `
  .invoice-paper-container {
    background: #f1f5f9;
    min-height: 100vh;
    padding: 2rem 1rem;
    color: #0f172a;
  }
  .invoice-paper {
    background: #ffffff;
    max-width: 850px;
    margin: 0 auto;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 3rem;
    font-family: 'Inter', sans-serif;
  }
  .invoice-paper h1, .invoice-paper h2, .invoice-paper h3, .invoice-paper h4 {
    color: #0f172a;
    font-family: 'Space Grotesk', sans-serif;
  }
  .invoice-paper label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.35rem;
    display: block;
  }
  .invoice-paper input, .invoice-paper textarea {
    background: #f8fafc;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
    width: 100%;
    outline: none;
    transition: all 0.2s;
  }
  .invoice-paper input:focus, .invoice-paper textarea:focus {
    border-color: #6366f1;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  .invoice-paper input[type="number"]::-webkit-inner-spin-button,
.invoice-paper input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.invoice-paper input[type="number"] {
  -moz-appearance: textfield;
}
  .invoice-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .invoice-client-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .invoice-grid-4 {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    align-items: end;
  }
  .invoice-table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
    margin-bottom: 0.75rem;
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
  }
  .invoice-table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    margin-bottom: 0.75rem;
    align-items: center;
  }
  .invoice-row-total {
    font-weight: 600;
    font-size: 0.95rem;
    text-align: right;
    padding-right: 0.5rem;
  }
  .payment-section {
    border-top: 2px dashed #e2e8f0;
    margin-top: 2.5rem;
    padding-top: 2rem;
  }
  .qr-scanner-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f8fafc;
  }
  .qr-image {
    width: 100px;
    height: 100px;
    object-fit: contain;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: white;
  }
  .mobile-label {
    display: none;
  }
  @media screen and (max-width: 768px) {
    .invoice-paper {
      padding: 1.5rem;
    }
    .invoice-grid-2 {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .invoice-client-info-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .invoice-table-header {
      display: none;
    }
    .invoice-table-row {
      grid-template-columns: 1fr;
      gap: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.25rem 1rem;
      margin-bottom: 1rem;
      background: #f8fafc;
      position: relative;
    }
    .invoice-grid-4 {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    .invoice-row-total {
      text-align: left;
      padding-top: 0.5rem;
      border-top: 1px dashed #cbd5e1;
      font-size: 1rem;
    }
    .mobile-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
  }

  @media print {
    body {
      background: white !important;
      color: #0f172a !important;
    }
    .sidebar,
    .header,
    .mobile-only,
    .no-print,
    button,
    .btn,
    a,
    header {
      display: none !important;
    }
    
    .layout-wrapper {
      display: block !important;
      background: white !important;
    }
    .main-content {
      margin-left: 0 !important;
      padding: 0 !important;
      background: white !important;
      width: 100% !important;
    }
    .content-area {
      padding: 0 !important;
      margin: 0 !important;
      background: white !important;
    }

    .invoice-paper-container {
      background: white !important;
      padding: 0 !important;
      min-height: auto !important;
      color: #0f172a !important;
    }

    .invoice-paper {
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 auto !important;
      max-width: 100% !important;
      border: none !important;
      background: white !important;
    }

    .invoice-paper h1, .invoice-paper h2, .invoice-paper h3, .invoice-paper h4 {
      color: #0f172a !important;
    }
    
    .invoice-table-header {
      border-bottom: 2px solid #0f172a !important;
      color: #0f172a !important;
      display: grid !important;
    }
    .invoice-table-row {
      border-bottom: 1px solid #cbd5e1 !important;
      page-break-inside: avoid;
      display: grid !important;
    }
    .payment-section {
      border-top: 2px dashed #cbd5e1 !important;
    }
  }
`;

const DEFAULT_TERMS = [
  "Payment is due within 7 days of invoice issued date.",
  "Please mention the Invoice Number in UPI or Bank transfer notes.",
  "Thank you for your business!"
];

const DEFAULT_BANK_DETAILS = {
  bankAccount: "3551204279",
  upi: "8780983966@kotakbank",
  ifscCode: "KKBK0002631",
  branchName: "AHMEDABAD-SOUTH BOPAL II",
  scannerImage: "scanner.jpeg"
};

const formatCurrency = (value: number | undefined) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (iso: string | undefined) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [searchParams] = useSearchParams();
  const isPreviewParam = searchParams.get("preview") === "true";
  const [isPreview, setIsPreview] = useState(isPreviewParam);

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, price: 0 }
  ]);

  const [bankAccount, setBankAccount] = useState(DEFAULT_BANK_DETAILS.bankAccount);
  const [upi, setUpi] = useState(DEFAULT_BANK_DETAILS.upi);
  const [ifscCode, setIfscCode] = useState(DEFAULT_BANK_DETAILS.ifscCode);
  const [branchName, setBranchName] = useState(DEFAULT_BANK_DETAILS.branchName);
  const [scannerImage, setScannerImage] = useState(DEFAULT_BANK_DETAILS.scannerImage);

  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);
  const [notes, setNotes] = useState("");

  // Queries & Mutations
  const { data: invoice, isLoading: isFetching } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id!),
    enabled: isEdit,
  });

  const { data: allInvoicesResult } = useQuery({
    queryKey: ["invoices-preview"],
    queryFn: () => getInvoices(),
    enabled: !isEdit,
  });

  useEffect(() => {
    if (isEdit && invoice) {
      setClientName(invoice.clientName);
      setClientEmail(invoice.clientEmail || "");
      setClientPhone(invoice.clientPhone || "");
      if (invoice.issuedDate) {
        setIssuedDate(new Date(invoice.issuedDate).toISOString().split("T")[0]);
      }
      setItems(invoice.items || [{ description: "", quantity: 1, price: 0 }]);
      if (invoice.paymentDetails) {
        setBankAccount(invoice.paymentDetails.bankAccount || "");
        setUpi(invoice.paymentDetails.upi || "");
        setIfscCode(invoice.paymentDetails.ifscCode || "");
        setBranchName(invoice.paymentDetails.branchName || "");
        setScannerImage(invoice.paymentDetails.scannerImage || "scanner.png");
      }
      if (invoice.termsAndConditions) {
        setTerms(invoice.termsAndConditions.split("\n"));
      } else {
        setTerms([]);
      }
      setNotes(invoice.notes || "");
    }
  }, [isEdit, invoice]);

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      navigate("/dashboard/invoices");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InvoiceInput) => updateInvoice(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      navigate("/dashboard/invoices");
    },
  });

  // Calculate Subtotal/Total dynamically on frontend
  const calculatedTotal = items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.price || 0);
  }, 0);

  // Generate preview of Invoice Number based on existing records
  const previewInvoiceNumber = (() => {
    if (isEdit && invoice) return invoice.invoiceNumber;
    const records = allInvoicesResult?.data || [];
    let nextNum = 1;
    if (records.length > 0) {
      const sorted = [...records].sort((a, b) => {
        const matchA = a.invoiceNumber.match(/KS-(\d+)/);
        const matchB = b.invoiceNumber.match(/KS-(\d+)/);
        const numA = matchA ? parseInt(matchA[1], 10) : 0;
        const numB = matchB ? parseInt(matchB[1], 10) : 0;
        return numB - numA;
      });
      const highest = sorted[0]?.invoiceNumber;
      const match = highest?.match(/KS-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    return `KS-${String(nextNum).padStart(3, '0')}`;
  })();

  // Item Table Mutators
  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      alert("At least one item is required in the invoice.");
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = items.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === "description" ? value : parseFloat(value) || 0
        };
      }
      return item;
    });
    setItems(updated);
  };

  // Terms and Conditions Mutators
  const handleAddTerm = () => {
    setTerms([...terms, ""]);
  };

  const handleRemoveTerm = (index: number) => {
    const updated = terms.filter((_, i) => i !== index);
    setTerms(updated);
  };

  const handleTermChange = (index: number, value: string) => {
    const updated = terms.map((t, i) => (i === index ? value : t));
    setTerms(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.some(item => !item.description.trim())) {
      alert("All item descriptions must be filled.");
      return;
    }

    // Filter out any empty terms before joining
    const filteredTerms = terms.filter(t => t.trim() !== "");

    const payload: InvoiceInput = {
      clientName,
      clientEmail: clientEmail || undefined,
      clientPhone: clientPhone || undefined,
      issuedDate: new Date(issuedDate).toISOString(),
      items,
      paymentDetails: {
        bankAccount,
        upi,
        ifscCode,
        branchName,
        scannerImage
      },
      termsAndConditions: filteredTerms.join("\n"),
      notes
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isFetching) return <Loader fullPage message="Fetching invoice parameters..." />;

  return (
    <>
      <style>{PAPER_STYLES}</style>
      <div className="invoice-paper-container">
        
        {/* Sticky Preview Banner */}
        {isPreview ? (
          <div className="no-print" style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "1rem 1.5rem",
            marginBottom: "2rem",
            maxWidth: "850px",
            margin: "0 auto 2rem auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "rgba(99, 102, 241, 0.15)", padding: "0.5rem", borderRadius: "8px" }}>
                <Receipt size={20} color="var(--color-primary)" />
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: "0.95rem" }}>Invoice Client Preview</div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>This is how the client will view the invoice document.</div>
              </div>
            </div>
<div
  style={{
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  }}
>             <button
  type="button"
  onClick={() => setIsPreview(false)}
  style={{
    background: "transparent",
    color: "#94a3b8",
    padding: window.innerWidth <= 768 ? "0.5rem 0.9rem" : "0.6rem 1.2rem",
    borderRadius: "10px",
    fontWeight: window.innerWidth <= 768 ? 500 : 600,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    fontSize: window.innerWidth <= 768 ? "0.72rem" : "0.85rem",
    transition: "all 0.2s",
    lineHeight: 1.2,
    whiteSpace: "nowrap"
  }}
>
  Back to Edit
</button>
             <button
  type="button"
  onClick={() => window.print()}
  style={{
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "white",
    padding: window.innerWidth <= 768 ? "0.5rem 1rem" : "0.6rem 1.5rem",
    borderRadius: "10px",
    fontWeight: window.innerWidth <= 768 ? 600 : 700,
    border: "none",
    cursor: "pointer",
    fontSize: window.innerWidth <= 768 ? "0.72rem" : "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
    lineHeight: 1.2,
    whiteSpace: "nowrap"
  }}
>
  <Download size={window.innerWidth <= 768 ? 13 : 16} />
  Print / Save PDF
</button>
            </div>
          </div>
        ) : (
          /* Navigation & Header (Hidden when printing/previewing) */
          <div className="no-print" style={{ maxWidth: "850px", margin: "0 auto 1.5rem auto" }}>
            <button onClick={() => navigate("/dashboard/invoices")} style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer",
              color: "#64748b", fontSize: "0.85rem", padding: 0, marginBottom: "1rem", fontWeight: 600
            }}>
              <ArrowLeft size={16} /> Back to Registry
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
              <span>Registry</span>
              <ChevronRight size={14} />
              <span style={{ color: "#0f172a" }}>{isEdit ? "Modify Billing" : "Issue Invoice"}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="invoice-paper">
          
          {/* Paper Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
            <div>
              <img src={logoImage} alt="Kairos CRM Logo" style={{ maxHeight: "60px", width: "auto", marginBottom: "1rem" }} />
              <div style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: "1.4" }}>
                <strong>KAIROS CRM Studio</strong><br />
                creative@kairosstudio.com<br />
                +91 99887 76655
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#6366f1", margin: 0, letterSpacing: "-0.02em" }}>INVOICE</h2>
              <div style={{ marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Invoice ID: </span>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{previewInvoiceNumber}</span>
              </div>
              <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>      
            <label style={{ margin: 0 }}>Issued Date</label>
                {isPreview ? (
                  <div style={{ padding: "0.4rem 0.4rem", fontSize: "1rem", fontWeight: 800, color: "#0f172a", textAlign: "right" }}>
                    {formatDate(issuedDate)}
                  </div>
                ) : (
                  <input
                    required
                    type="date"
                    value={issuedDate}
                    onChange={e => setIssuedDate(e.target.value)}
                    style={{ width: "160px", padding: "0.4rem 0.4rem", textAlign: "right" }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Client Details Section */}
          <div style={{ borderTop: "2px solid #f1f5f9", paddingTop: "2rem", marginBottom: "3.5rem" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", color: "#334155" }}>
              <FileText size={18} color="#6366f1" /> Invoice To (Client Info)
            </h4>
            <div className="invoice-client-info-grid">
              <div>
                <label>Client Name</label>
                {isPreview ? (
                  <div style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", minHeight: "38px" }}>
                    {clientName || "—"}
                  </div>
                ) : (
                  <input required placeholder="Manually write name..." value={clientName} onChange={e => setClientName(e.target.value)} />
                )}
              </div>
              <div>
                <label>Phone Number</label>
                {isPreview ? (
                  <div style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", color: "#475569", minHeight: "38px" }}>
                    {clientPhone || "—"}
                  </div>
                ) : (
                  <input placeholder="Client contact number..." value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                )}
              </div>
              <div>
                <label>Email Address</label>
                {isPreview ? (
                  <div style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", color: "#475569", minHeight: "38px" }}>
                    {clientEmail || "—"}
                  </div>
                ) : (
                  <input type="email" placeholder="client@example.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                )}
              </div>
            </div>
            {!isPreview && (
              <div style={{ marginTop: "1.5rem" }}>
                <label>Internal Booking Notes / Memo</label>
                <input placeholder="Optional internal reference..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            )}
          </div>

          {/* Interactive Items Section */}
          <div style={{ marginBottom: "3rem" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", color: "#334155" }}>
              <ScrollText size={18} color="#6366f1" /> Line Items
            </h4>

            {/* Table Headers */}
            <div className="invoice-table-header">
              <span>Item Description</span>
              <span style={{ textAlign: "right" }}>Quantity</span>
              <span style={{ textAlign: "right" }}>Price (₹)</span>
              <span style={{ textAlign: "right" }}>Total (₹)</span>
            </div>

            {/* Table Rows */}
            {items.map((item, index) => (
              <div key={index} className="invoice-table-row">
                <div>
                  <span className="mobile-label">Item Description</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {!isPreview && (
                      <button type="button" onClick={() => handleRemoveItem(index)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.2rem" }} title="Remove Item">
                        <Trash2 size={16} />
                      </button>
                    )}
                    {isPreview ? (
                      <div style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>
                        {item.description}
                      </div>
                    ) : (
                      <input required placeholder="Item description (e.g. Newborn Shoot)" value={item.description} onChange={e => handleItemChange(index, "description", e.target.value)} />
                    )}
                  </div>
                </div>
                <div>
                  <span className="mobile-label">Quantity</span>
                  {isPreview ? (
                    <div style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", textAlign: "right", color: "#0f172a" }}>
                      {item.quantity}
                    </div>
                  ) : (
                    <input required type="number" min="1" placeholder="Qty" style={{ textAlign: "right" }} value={item.quantity} onChange={e => handleItemChange(index, "quantity", e.target.value)} />
                  )}
                </div>
                <div>
                  <span className="mobile-label">Price (₹)</span>
                  {isPreview ? (
                    <div style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", textAlign: "right", color: "#0f172a" }}>
                      {formatCurrency(item.price)}
                    </div>
                  ) : (
                    <input required type="number" min="0" placeholder="Price" style={{ textAlign: "right" }} value={item.price} onChange={e => handleItemChange(index, "price", e.target.value)} />
                  )}
                </div>
                <div>
                  <span className="mobile-label">Total Amount (₹)</span>
                  <div className="invoice-row-total">
                    {formatCurrency((item.quantity || 0) * (item.price || 0))}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Item Button */}
            {!isPreview && (
              <button type="button" onClick={handleAddItem} className="btn" style={{ background: "#f1f5f9", color: "#475569", border: "1px dashed #cbd5e1", display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1rem", fontSize: "0.85rem", marginTop: "1rem" }}>
                <Plus size={16} /> Add Item Row
              </button>
            )}

            {/* Total Amount Display (No Subtotal) */}
            <div style={{ marginTop: "2rem", borderTop: "2px solid #e2e8f0", paddingTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: "250px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem" }}>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>Total Amount:</span>
                  <span style={{ fontWeight: 800, color: "#6366f1" }}>{formatCurrency(calculatedTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="payment-section">
            <h4 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", color: "#334155" }}>
              <Landmark size={18} color="#6366f1" /> Payment details (Customizable)
            </h4>
            {isPreview ? (
              <div className="invoice-grid-2" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label>Bank Account Number</label>
                    <div style={{ padding: "0.2rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>{bankAccount || "—"}</div>
                  </div>
                  <div>
                    <label>UPI ID</label>
                    <div style={{ padding: "0.2rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>{upi || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label>IFSC Code</label>
                    <div style={{ padding: "0.2rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>{ifscCode || "—"}</div>
                  </div>
                  <div>
                    <label>Branch Name</label>
                    <div style={{ padding: "0.2rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>{branchName || "—"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="invoice-grid-2" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label>Bank Account Number</label>
                    <input placeholder="Bank account number..." value={bankAccount} onChange={e => setBankAccount(e.target.value)} />
                  </div>
                  <div>
                    <label>UPI ID</label>
                    <input placeholder="UPI ID (e.g. user@upi)" value={upi} onChange={e => setUpi(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label>IFSC Code</label>
                    <input placeholder="Bank IFSC Code..." value={ifscCode} onChange={e => setIfscCode(e.target.value)} />
                  </div>
                  <div>
                    <label>Branch Name</label>
                    <input placeholder="Bank branch name..." value={branchName} onChange={e => setBranchName(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* QR Scanner Display */}
            <div className="qr-scanner-card">
              <QrCode size={36} color="#6366f1" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155", display: "block" }}>Payment QR Code Scanner</span>
                {/* <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loaded from static asset: <strong>{scannerImage}</strong></span> */}
              </div>
              <img src="/scanner.jpeg" alt="Payment QR Scanner" className="qr-image" />
            </div>
          </div>

          {/* Terms and Conditions Section (Dynamic List) */}
          <div style={{ marginTop: "2.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "2rem" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", color: "#334155" }}>
              Terms & Conditions (Customizable)
            </h4>
            {isPreview ? (
              <ol style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {terms.filter(t => t.trim() !== "").map((term, index) => (
                  <li key={index} style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.4 }}>
                    {term}
                  </li>
                ))}
              </ol>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {terms.map((term, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontWeight: 700, color: "#64748b", minWidth: "24px" }}>{index + 1}.</span>
                    <input 
                      required 
                      placeholder={`Term ${index + 1}`} 
                      value={term} 
                      onChange={e => handleTermChange(index, e.target.value)} 
                      style={{ flex: 1 }}
                    />
                    <button type="button" onClick={() => handleRemoveTerm(index)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem" }} title="Delete Term">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddTerm} className="btn" style={{ alignSelf: "flex-start", background: "#f1f5f9", color: "#475569", border: "1px dashed #cbd5e1", display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1rem", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  <Plus size={16} /> Add Term Row
                </button>
              </div>
            )}
          </div>

          {/* Action Row */}
          {!isPreview && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1.5rem", marginTop: "3rem", borderTop: "2px solid #f1f5f9", paddingTop: "2rem" }}>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  style={{
                    background: "var(--bg-surface-3)",
                    color: "var(--text-primary)",
                    padding: "1rem 2rem",
                    borderRadius: "12px",
                    fontWeight: 600,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    marginRight: "auto"
                  }}
                >
                  <FileText size={20} />
                  <span>Preview Invoice</span>
                </button>
              )}
              <button type="button" onClick={() => navigate("/dashboard/invoices")} style={{
                background: "transparent", border: "none", color: "#64748b", fontWeight: 800,
                fontSize: "1rem", cursor: "pointer", transition: "color 0.2s"
              }}>Cancel</button>

              <button type="submit" disabled={isPending} style={{
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", color: "white",
                padding: "1rem 2rem", borderRadius: "12px", fontWeight: 600, border: "none",
                display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer",
                boxShadow: "0 10px 20px rgba(99, 102, 241, 0.2)", transition: "all 0.3s"
              }}>
                {isPending ? <Clock size={20} style={{ animation: "spin 2s linear infinite" }} /> : <Save size={20} />}
                <span>{isPending ? "Generating..." : isEdit ? "Update Invoice" : "Create & Issue"}</span>
              </button>
            </div>
          )}

        </form>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
