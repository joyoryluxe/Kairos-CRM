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
import { getMe } from "@/api/auth";
import { getTermsConditions } from "@/api/termsConditions";
import logoImage from "../Kairos Logo.png";
import AutocompleteInput from "@/components/AutocompleteInput";
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
  .invoice-paper input, .invoice-paper textarea, .invoice-paper select {
    background: #f8fafc;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
    width: 100%;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
  }
  .invoice-paper input:focus, .invoice-paper textarea:focus {
    border-color: #6366f1;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
  .price-input-group {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: all 0.2s;
    width: 100%;
  }
  .price-input-group:focus-within {
    border-color: #6366f1;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
  .price-input-group input {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0.6rem 0.5rem !important;
    text-align: right;
    width: 100%;
    outline: none;
  }
  .price-input-group select {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: #475569;
    font-weight: 700;
    outline: none;
    padding: 0.6rem 0.5rem !important;
    cursor: pointer;
    text-align: center;
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
      padding: 1rem;
    }
    .invoice-grid-2 {
      gap: 0.4rem;
    }

    .invoice-client-info-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
    }
    .invoice-table-header {
      display: none !important;
    }
    .invoice-table-row {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 0.75rem !important;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem !important;
      margin-bottom: 1rem !important;
      align-items: start !important;
    }
    .invoice-table-row > div:nth-child(1) {
      grid-column: span 2;
    }
    .invoice-table-row > div:nth-child(2) {
      grid-column: span 1;
    }
    .invoice-table-row > div:nth-child(3) {
      grid-column: span 1;
    }
    .invoice-table-row > div:nth-child(4) {
      grid-column: span 2;
      border-top: 1px dashed #cbd5e1;
      padding-top: 0.75rem;
      margin-top: 0.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .invoice-row-total {
      text-align: right;
      padding-right: 0;
      font-size: 1rem !important;
    }
    .mobile-label {
      display: block !important;
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
    .invoice-table-row > div:nth-child(4) .mobile-label {
      margin-bottom: 0;
    }
    .invoice-paper label {
      font-size: 0.55rem;
    }
    .invoice-paper input, .invoice-paper textarea {
      font-size: 0.75rem;
      padding: 0.4rem 0.5rem;
    }
    /* Reduce inline styled text sizes for preview mode */
    .invoice-paper div[style] {
      /* This is a bit of a hack, but without adding classes everywhere it's the safest way to ensure preview text shrinks */
    }
    .preview-shrink {
      font-size: 0.45rem !important;
      padding: 0.3rem 0.4rem !important;
    }
    .header-shrink div {
      font-size: 0.7rem !important;
    }
    .invoice-action-row {
      flex-direction: column-reverse !important;
      align-items: stretch !important;
      gap: 0.75rem !important;
    }
    .invoice-action-left {
      flex-direction: column !important;
      gap: 0.75rem !important;
      width: 100% !important;
    }
    .invoice-action-submit {
      width: 100% !important;
      padding: 0.85rem 1rem !important;
      font-size: 0.85rem !important;
    }
    .invoice-action-btn-preview, .invoice-action-btn-cancel {
      width: 100% !important;
      padding: 0.85rem 1rem !important;
      font-size: 0.85rem !important;
    }
  }

  @media print {
    @page {
      size: A4;
      margin: 12mm 10mm;
    }

    /* Remove browser-injected header/footer (URL, date, page number) */
    /* Safari/WebKit: use margin on @page to push content away from edges */
    /* All browsers: hide running headers/footers by zeroing page margin decorations */

    html {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    html,
    body {
      background: white !important;
      color: #0f172a !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      overflow: visible !important;
    }

    #root,
    .layout-wrapper,
    .main-content,
    .content-area {
      background: white !important;
      color: #0f172a !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      overflow: visible !important;
      box-sizing: border-box !important;
      display: block !important;
      float: none !important;
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
    }

    /* Hide everything that is NOT the invoice content */
    .sidebar,
    .header,
    .mobile-only,
    .no-print,
    button,
    .btn,
    a,
    header,
    nav,
    footer {
      display: none !important;
      visibility: hidden !important;
    }

    /* Invoice container — full white page, no extra padding/background */
    .invoice-paper-container {
      background: white !important;
      padding: 0 !important;
      margin: 0 !important;
      min-height: auto !important;
      color: #0f172a !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      display: block !important;
    }

    /* Invoice paper card — flat, no shadow, full width */
    .invoice-paper {
      box-shadow: none !important;
      border-radius: 0 !important;
      padding: 1.5rem 2rem !important;
      margin: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      border: none !important;
      background: white !important;
      box-sizing: border-box !important;
      display: block !important;
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
      break-inside: avoid;
      display: grid !important;
    }
    .payment-section {
      border-top: 2px dashed #cbd5e1 !important;
    }

    /* Ensure QR image prints */
    .qr-image {
      display: block !important;
      -webkit-print-color-adjust: exact !important;
    }
  }

  .invoice-action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 3rem;
    border-top: 2px solid #f1f5f9;
    padding-top: 2rem;
  }
  .invoice-action-left {
    display: flex;
    gap: 1rem;
    flex: 1;
  }
  .invoice-action-submit {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    color: white;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
    transition: all 0.3s;
    font-size: 0.95rem;
    white-space: nowrap;
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

const formatPrice = (price: string | number | undefined, priceType: string | undefined) => {
  if (price === undefined || price === null || price === "") return "";
  const priceStr = String(price).trim();
  if (priceType === "percentage") {
    return priceStr + "%";
  }
  const numeric = parseFloat(priceStr);
  if (isNaN(numeric)) return priceStr;
  return formatCurrency(numeric);
};

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
  const [discount, setDiscount] = useState<string>("");

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, price: "", priceType: "flat" }
  ]);

  const [bankAccount, setBankAccount] = useState(DEFAULT_BANK_DETAILS.bankAccount);
  const [upi, setUpi] = useState(DEFAULT_BANK_DETAILS.upi);
  const [ifscCode, setIfscCode] = useState(DEFAULT_BANK_DETAILS.ifscCode);
  const [branchName, setBranchName] = useState(DEFAULT_BANK_DETAILS.branchName);
  const [scannerImage, setScannerImage] = useState(DEFAULT_BANK_DETAILS.scannerImage);

  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);
  const [selectedTermsCategory, setSelectedTermsCategory] = useState<string>("Custom");
  const [notes, setNotes] = useState("");

  // Queries & Mutations
  const { data: invoice, isLoading: isFetching } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id!),
    enabled: isEdit,
  });

  const { data: termsConfig } = useQuery({
    queryKey: ["terms-conditions"],
    queryFn: () => getTermsConditions(),
  });

  const { data: allInvoicesResult } = useQuery({
    queryKey: ["invoices-preview"],
    queryFn: () => getInvoices(),
    enabled: !isEdit,
  });

  useQuery({
    queryKey: ["auth-me"],
    queryFn: getMe,
  });
  const studioPhone = "+91 87809 83966";
  const studioEmail = "hello@kairosstudio.in";

  useEffect(() => {
    if (isEdit && invoice) {
      setClientName(invoice.clientName);
      setClientEmail(invoice.clientEmail || "");
      setClientPhone(invoice.clientPhone || "");
      if (invoice.issuedDate) {
        setIssuedDate(new Date(invoice.issuedDate).toISOString().split("T")[0]);
      }
      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items.map(item => ({
          ...item,
          price: item.price === 0 ? "" : (item.price ?? ""),
          priceType: item.priceType || "flat"
        })));
      } else {
        setItems([{ description: "", quantity: 1, price: "", priceType: "flat" }]);
      }
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
      setDiscount(invoice.discount !== undefined ? String(invoice.discount) : "");
    }
  }, [isEdit, invoice]);

  // Reactive effect to detect if current terms match a category preset or are Custom
  useEffect(() => {
    if (termsConfig) {
      const termsStr = terms.map(t => t.trim()).filter(Boolean).join("\n");
      const matchingPreset = termsConfig.find(tc =>
        (tc.terms || []).map(t => t.trim()).filter(Boolean).join("\n") === termsStr
      );
      if (matchingPreset) {
        setSelectedTermsCategory(matchingPreset.category);
      } else {
        setSelectedTermsCategory("Custom");
      }
    }
  }, [terms, termsConfig]);

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

  // Helper to resolve raw price strings (like percentages) into numeric values
  const resolveInvoiceItems = (itemsList: InvoiceItem[]) => {
    let runningSubtotal = 0;
    return itemsList.map((item) => {
      const qty = typeof item.quantity === "number" ? item.quantity : (parseFloat(item.quantity) || 0);
      const priceNum = parseFloat(String(item.price ?? "")) || 0;
      const type = item.priceType || "flat";
      
      let resolvedPrice = 0;
      if (type === "percentage") {
        resolvedPrice = (runningSubtotal * priceNum) / 100;
      } else {
        resolvedPrice = priceNum;
      }
      
      const resolvedTotal = qty * resolvedPrice;
      runningSubtotal += resolvedTotal;
      
      return {
        ...item,
        resolvedPrice,
        resolvedTotal
      };
    });
  };

  const resolvedItems = resolveInvoiceItems(items);

  // Calculate Subtotal/Total dynamically on frontend
  const calculatedSubTotal = resolvedItems.reduce((sum, item) => {
    return sum + item.resolvedTotal;
  }, 0);
  const discountNum = parseFloat(String(discount || "")) || 0;
  const calculatedDiscountAmount = (calculatedSubTotal * discountNum) / 100;
  const calculatedTotal = calculatedSubTotal - calculatedDiscountAmount;

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
    setItems([...items, { description: "", quantity: 1, price: "", priceType: "flat" }]);
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
        let updatedValue = value;
        if (field === "quantity") {
          updatedValue = value === "" ? "" : (parseFloat(value) || 0);
        } else if (field === "price") {
          updatedValue = value;
        } else if (field === "priceType") {
          updatedValue = value;
        }
        return {
          ...item,
          [field]: updatedValue
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

  const handleSelectFullRecord = (record: any) => {
    // ── Client Info ──────────────────────────────────────────
    if (record.clientPhone) setClientPhone(record.clientPhone);
    if (record.clientEmail) setClientEmail(record.clientEmail);

    // ── Service Items ─────────────────────────────────────────
    if (Array.isArray(record.items) && record.items.length > 0) {
      setItems(record.items.map((item: any) => ({
        description: item.description || "",
        quantity: item.quantity || 1,
        price: item.price === 0 ? "" : (item.price ?? ""),
        priceType: item.priceType || "flat",
      })));
    }

    // ── Payment Details ───────────────────────────────────────
    if (record.paymentDetails) {
      if (record.paymentDetails.bankAccount) setBankAccount(record.paymentDetails.bankAccount);
      if (record.paymentDetails.upi) setUpi(record.paymentDetails.upi);
      if (record.paymentDetails.ifscCode) setIfscCode(record.paymentDetails.ifscCode);
      if (record.paymentDetails.branchName) setBranchName(record.paymentDetails.branchName);
      if (record.paymentDetails.scannerImage) setScannerImage(record.paymentDetails.scannerImage);
    }

    // ── Terms & Conditions ────────────────────────────────────
    if (record.termsAndConditions) {
      const parsedTerms = record.termsAndConditions
        .split("\n")
        .map((t: string) => t.trim())
        .filter(Boolean);
      if (parsedTerms.length > 0) setTerms(parsedTerms);
    }

    // ── Notes ─────────────────────────────────────────────────
    if (record.notes) setNotes(record.notes);
    setDiscount(record.discount !== undefined ? String(record.discount) : "");

    // NOTE: issuedDate is intentionally kept as today's date for a new invoice
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
      discount: parseFloat(String(discount || "")) || 0,
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
          <div
            className="no-print"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: window.innerWidth <= 768 ? "12px" : "16px",
              padding: window.innerWidth <= 768 ? "0.85rem" : "1rem 1.5rem",
              marginBottom: "1rem",
              maxWidth: "850px",
              margin: "0 auto 1rem auto",
              display: "flex",
              flexDirection: window.innerWidth <= 768 ? "column" : "row",
              justifyContent: "space-between",
              alignItems: window.innerWidth <= 768 ? "flex-start" : "center",
              gap: window.innerWidth <= 768 ? "0.55rem" : "1rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: window.innerWidth <= 768 ? "1.95rem" : "0.75rem",
                width: "100%"
              }}
            >              <div style={{ background: "rgba(99, 102, 241, 0.15)", padding: "0.5rem", borderRadius: "8px" }}>
                <Receipt size={20} color="var(--color-primary)" />
              </div>
              <div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: window.innerWidth <= 768 ? "0.82rem" : "0.95rem",
                      lineHeight: 1.2
                    }}
                  >
                    Invoice Client Preview
                  </div>

                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: window.innerWidth <= 768 ? "0.65rem" : "0.75rem",
                      lineHeight: 1.3,
                      marginTop: "0.2rem"
                    }}
                  >
                    This is how the client will view the invoice document.
                  </div>
                </div>
                {/* <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>This is how the client will view the invoice document.</div> */}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                width: window.innerWidth <= 768 ? "100%" : "auto",
                justifyContent: window.innerWidth <= 768 ? "space-between" : "flex-end"
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
          <div
            className="paper-header-container"
            style={{
              display: "flex",
              flexDirection: window.innerWidth <= 768 ? "row" : "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: window.innerWidth <= 768 ? "0.8rem" : "2rem",
              marginBottom: window.innerWidth <= 768 ? "1.5rem" : "3rem",
            }}
          >          <div
            className="header-shrink"
            style={{
              flex: 1,
              minWidth: 0
            }}
          >
              <img
                src={logoImage}
                alt="Kairos CRM Logo"
                style={{
                  maxHeight: window.innerWidth <= 768 ? "42px" : "60px",
                  width: "auto",
                  marginBottom: window.innerWidth <= 768 ? "0.5rem" : "1rem"
                }}
              />
              <div
                style={{
                  fontSize: window.innerWidth <= 768 ? "0.62rem" : "0.85rem",
                  color: "#64748b",
                  lineHeight: 1.5
                }}
              >                {/* <strong>KAIROS CRM Studio</strong><br /> */}
                {studioEmail}<br /><br />
                {studioPhone}
              </div>
            </div>
            <div
              className="header-shrink"
              style={{
                textAlign: "right",
                flexShrink: 0
              }}
            >              <h2 style={{ fontSize: window.innerWidth <= 768 ? "1.5rem" : "2rem", fontWeight: 800, color: "#6366f1", margin: 0, letterSpacing: "-0.02em" }}>INVOICE</h2>
              <div style={{ marginTop: "0.3rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Invoice ID: </span>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{previewInvoiceNumber}</span>
              </div>
              <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <label style={{ margin: 0 }}>Issued Date</label>
                {isPreview ? (
                  <div className="preview-shrink" style={{ padding: "0.4rem 0.4rem", fontSize: "1rem", fontWeight: 800, color: "#0f172a", textAlign: "right" }}>
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
              <FileText size={18} color="#6366f1" /> Recipient Information
            </h4>
            <div className="invoice-client-info-grid">
              <div>
                <label> CLIENT NAME</label>
                {isPreview ? (
                  <div className="preview-shrink" style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", minHeight: "38px" }}>
                    {clientName || "—"}
                  </div>
                ) : (
                  <AutocompleteInput
                    model="invoice"
                    field="clientName"
                    required
                    value={clientName}
                    onChange={(v: string) => setClientName(v)}
                    onSelectFullRecord={handleSelectFullRecord}
                    placeholder=""
                    showIcon={false}
                    inputStyle={{
                      background: "#f8fafc",
                      color: "#0f172a",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "0.6rem 0.8rem",
                      fontSize: "0.9rem",
                    }}
                  />
                )}
              </div>
              <div>
                <label>Phone Number</label>
                {isPreview ? (
                  <div className="preview-shrink" style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", color: "#475569", minHeight: "38px" }}>
                    {clientPhone || "—"}
                  </div>
                ) : (
                  <input placeholder="Client contact number..." value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                )}
              </div>
              <div>
                <label>EMAIL ADDRESS</label>
                {isPreview ? (
                  <div className="preview-shrink" style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", color: "#475569", minHeight: "38px" }}>
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
              <ScrollText size={18} color="#6366f1" /> Services & Charges
            </h4>

            {/* Table Headers */}
            <div className="invoice-table-header">
              <span>Service Details</span>
              <span style={{ textAlign: "right" }}>Quantity</span>
              <span style={{ textAlign: "right" }}>Price</span>
              <span style={{ textAlign: "right" }}>Total (₹)</span>
            </div>

            {/* Table Rows */}
            {resolvedItems.map((item, index) => (
              <div key={index} className="invoice-table-row">
                <div>
                  <span className="mobile-label">Service Details</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {!isPreview && (
                      <button type="button" onClick={() => handleRemoveItem(index)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.2rem" }} title="Remove Item">
                        <Trash2 size={16} />
                      </button>
                    )}
                    {isPreview ? (
                      <div className="preview-shrink" style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>
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
                    <div className="preview-shrink" style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", textAlign: "right", color: "#0f172a" }}>
                      {item.quantity}
                    </div>
                  ) : (
                    <input required type="number" min="1" placeholder="Qty" style={{ textAlign: "right", width: "100%", boxSizing: "border-box" }} value={item.quantity} onChange={e => handleItemChange(index, "quantity", e.target.value)} />
                  )}
                </div>
                <div>
                  <span className="mobile-label">Price</span>
                  {isPreview ? (
                    <div className="preview-shrink" style={{ padding: "0.6rem 0.8rem", fontSize: "0.95rem", textAlign: "right", color: "#0f172a" }}>
                      {formatPrice(item.price, item.priceType)}
                    </div>
                  ) : (
                    <div className="price-input-group">
                      <input
                        required
                        type="text"
                        placeholder="Price"
                        value={item.price}
                        onChange={e => handleItemChange(index, "price", e.target.value)}
                      />
                      <select
                        value={item.priceType || "flat"}
                        onChange={e => handleItemChange(index, "priceType", e.target.value)}
                      >
                        <option value="flat">₹</option>
                        <option value="percentage">%</option>
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <span className="mobile-label">Total Amount (₹)</span>
                  <div className="invoice-row-total">
                    {formatCurrency(item.resolvedTotal)}
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

            {/* Total & Discount Display */}
            <div style={{ marginTop: "2rem", borderTop: "2px solid #e2e8f0", paddingTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                
                {/* Sub Total (Only show if discount exists or we are in edit mode) */}
                {((parseFloat(discount) || 0) > 0 || !isPreview) && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.95rem", color: "#475569" }}>
                    <span style={{ fontWeight: 600 }}>Sub Total:</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{formatCurrency(calculatedSubTotal)}</span>
                  </div>
                )}

                {/* Discount (%) Field / Display */}
                {isPreview ? (
                  (parseFloat(discount) || 0) > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.95rem", color: "#475569" }}>
                      <span style={{ fontWeight: 600 }}>Discount({parseFloat(discount || "0").toFixed(2)}%):</span>
                      <span style={{ fontWeight: 400, color: "#334155", fontSize: "0.60rem" }}>(-){formatCurrency(calculatedDiscountAmount)}</span>
                    </div>
                  )
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.95rem", color: "#475569" }}>
                    <span style={{ fontWeight: 600 }}>Discount (%):</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {(parseFloat(discount) || 0) > 0 && (
                        <span style={{ fontWeight: 400, color: "#334155", fontSize: "0.60rem" }}>
                          (-{formatCurrency(calculatedDiscountAmount)})
                        </span>
                      )}
                      <div style={{ width: "120px" }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={discount}
                          onChange={e => setDiscount(e.target.value)}
                          placeholder=""
                          style={{
                            textAlign: "right",
                            padding: "0.35rem 0.5rem",
                            fontSize: "0.9rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.2rem", borderTop: (((parseFloat(discount) || 0) > 0) || !isPreview) ? "1px solid #e2e8f0" : "none", paddingTop: (((parseFloat(discount) || 0) > 0) || !isPreview) ? "0.75rem" : "0" }}>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>Total Amount:</span>
                  <span style={{ fontWeight: 800, color: "#6366f1" }}>{formatCurrency(calculatedTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="payment-section">
            <h4 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", color: "#334155" }}>
              <Landmark size={18} color="#6366f1" /> Payment Information
            </h4>
            {isPreview ? (
              <div className="invoice-grid-2" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label>Bank Account Number</label>
                    <div className="preview-shrink" style={{ padding: "0.2rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>{bankAccount || "—"}</div>
                  </div>
                  <div>
                    <label>UPI ID</label>
                    <div className="preview-shrink" style={{ padding: "0.2rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>{upi || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label>IFSC Code</label>
                    <div className="preview-shrink" style={{ padding: "0.2rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>{ifscCode || "—"}</div>
                  </div>
                  <div>
                    <label>Branch Name</label>
                    <div className="preview-shrink" style={{ padding: "0.2rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>{branchName || "—"}</div>
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
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155", display: "block" }}>Scan to Pay</span>
                {/* <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loaded from static asset: <strong>{scannerImage}</strong></span> */}
              </div>
              <img src="/scanner.jpeg" alt="Payment QR Scanner" className="qr-image" />
            </div>
          </div>

          {/* Terms and Conditions Section (Dynamic List) */}
          <div style={{ marginTop: "2.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "2rem" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", color: "#334155" }}>
              Terms & Conditions
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
                {termsConfig && termsConfig.length > 0 && (
                  <div style={{ marginBottom: "1rem", maxWidth: "320px" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem", display: "block" }}>
                      Load Preset Terms by Category
                    </label>
                    <select
                      style={{ background: "#f8fafc", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 0.75rem", fontSize: "0.85rem", width: "100%", outline: "none", cursor: "pointer" }}
                      onChange={e => {
                        const selectedCat = e.target.value;
                        setSelectedTermsCategory(selectedCat);
                        if (selectedCat !== "Custom") {
                          const found = termsConfig.find(tc => tc.category === selectedCat);
                          if (found) {
                            setTerms(found.terms || []);
                          }
                        }
                      }}
                      value={selectedTermsCategory}
                    >
                      <option value="Custom">Custom</option>
                      {termsConfig.map(tc => (
                        <option key={tc._id} value={tc.category}>
                          {tc.category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
          {/* {!isPreview && (
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
          )} */}
          {/* Action Row */}
          {!isPreview && (
            <div className="invoice-action-row">
              {/* Left Side */}
              <div className="invoice-action-left">
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setIsPreview(true)}
                    className="invoice-action-btn-preview"
                    style={{
                      background: "var(--bg-surface-3)",
                      color: "var(--text-primary)",
                      padding: "1rem 1.5rem",
                      borderRadius: "12px",
                      fontWeight: 600,
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      flex: 1,
                      minWidth: 0,
                      fontSize: "0.95rem",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <FileText size={20} />
                    <span>Preview Invoice</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/dashboard/invoices")}
                  className="invoice-action-btn-cancel"
                  style={{
                    background: "transparent",
                    border: "1px solid #e2e8f0",
                    color: "#64748b",
                    fontWeight: 700,
                    padding: "1rem 1.5rem",
                    borderRadius: "12px",
                    cursor: "pointer",
                    flex: 1,
                    minWidth: 0,
                    fontSize: "0.95rem",
                    whiteSpace: "nowrap"
                  }}
                >
                  Cancel
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="invoice-action-submit"
              >
                {isPending ? (
                  <Clock size={20} />
                ) : (
                  <Save size={20} />
                )}

                <span>
                  {isPending
                    ? "Generating..."
                    : isEdit
                      ? "Update Invoice"
                      : "Create & Issue"}
                </span>
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
