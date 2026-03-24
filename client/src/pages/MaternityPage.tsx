// import { Baby, Phone, Calendar, User, MapPin, Package, DollarSign, CreditCard, Calculator, Search, X, Plus, Edit, Trash2 } from "lucide-react";
// import { FormEvent, useState, useEffect, useRef } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   createMaternity,
//   deleteMaternity,
//   getMaternities,
//   updateMaternity,
//   type Maternity,
//   type MaternityInput,
// } from "@/api/maternity";

// // Extend MaternityInput to include all fields from the schema
// // (You may need to update your api/maternity types accordingly)
// interface MaternityInput extends MaternityInput {
//   address?: {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//   };
//   package?: string;
//   expenses?: number;
//   advance?: number;
//   total?: number;
//   extras?: number;
// }

// // Modal component (unchanged but with larger maxWidth)
// const Modal = ({
//   isOpen,
//   onClose,
//   title,
//   children,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   children: React.ReactNode;
// }) => {
//   const modalRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     const handleClickOutside = (e: MouseEvent) => {
//       if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
//         onClose();
//       }
//     };
//     if (isOpen) {
//       document.addEventListener("keydown", handleEscape);
//       document.addEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "hidden";
//     }
//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: "rgba(0,0,0,0.5)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 1000,
//         backdropFilter: "blur(4px)",
//       }}
//     >
//       <div
//         ref={modalRef}
//         style={{
//           background: "var(--bg-surface)",
//           borderRadius: "var(--radius-lg)",
//           padding: "2rem",
//           maxWidth: 800,
//           width: "90%",
//           maxHeight: "90vh",
//           overflowY: "auto",
//           boxShadow: "var(--shadow-xl)",
//         }}
//       >
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
//           <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{title}</h2>
//           <button
//             onClick={onClose}
//             style={{
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               padding: "0.25rem",
//               borderRadius: "var(--radius-sm)",
//             }}
//           >
//             <X size={24} />
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// };

// export default function MaternityPage() {
//   const queryClient = useQueryClient();

//   // Modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editing, setEditing] = useState<Maternity | null>(null);

//   // Form state with all fields
//   const [form, setForm] = useState<MaternityInput>({
//     clientName: "",
//     phoneNumber: "",
//     babyName: "",
//     birthDate: "",
//     shootDateAndTime: "",
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       zipCode: "",
//     },
//     package: "",
//     expenses: 0,
//     advance: 0,
//     total: 0,
//     extras: 0,
//   });

//   // Filter state
//   const [filters, setFilters] = useState({
//     clientName: "",
//     phoneNumber: "",
//     babyName: "",
//     birthDate: "",
//     shootDateAndTime: "",
//   });

//   const {
//     data,
//     isLoading,
//     isError,
//     error,
//     refetch,
//     isFetching,
//   } = useQuery({
//     queryKey: ["maternity"],
//     queryFn: getMaternities,
//   });

//   const createMutation = useMutation({
//     mutationFn: createMaternity,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["maternity"] });
//       closeModal();
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, payload }: { id: string; payload: Partial<MaternityInput> }) =>
//       updateMaternity(id, payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["maternity"] });
//       closeModal();
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: string) => deleteMaternity(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["maternity"] });
//     },
//   });

//   const openModalForNew = () => {
//     setEditing(null);
//     setForm({
//       clientName: "",
//       phoneNumber: "",
//       babyName: "",
//       birthDate: "",
//       shootDateAndTime: "",
//       address: { street: "", city: "", state: "", zipCode: "" },
//       package: "",
//       expenses: 0,
//       advance: 0,
//       total: 0,
//       extras: 0,
//     });
//     setIsModalOpen(true);
//   };

//   const openModalForEdit = (m: Maternity) => {
//     setEditing(m);
//     setForm({
//       clientName: m.clientName,
//       phoneNumber: m.phoneNumber,
//       babyName: m.babyName ?? "",
//       birthDate: m.birthDate ?? "",
//       shootDateAndTime: m.shootDateAndTime ?? "",
//       address: m.address ?? { street: "", city: "", state: "", zipCode: "" },
//       package: m.package ?? "",
//       expenses: m.expenses ?? 0,
//       advance: m.advance ?? 0,
//       total: m.total ?? 0,
//       extras: m.extras ?? 0,
//     });
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditing(null);
//   };

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     if (editing) {
//       updateMutation.mutate({
//         id: editing._id,
//         payload: form,
//       });
//     } else {
//       createMutation.mutate(form as any); // cast if needed
//     }
//   };

//   const clearFilters = () => {
//     setFilters({
//       clientName: "",
//       phoneNumber: "",
//       babyName: "",
//       birthDate: "",
//       shootDateAndTime: "",
//     });
//   };

//   // Clientâ€‘side filtering (on main fields)
//   const filteredData = data?.filter((item) => {
//     const matchClient = item.clientName
//       .toLowerCase()
//       .includes(filters.clientName.toLowerCase());
//     const matchPhone = item.phoneNumber
//       .toLowerCase()
//       .includes(filters.phoneNumber.toLowerCase());
//     const matchBaby = (item.babyName ?? "")
//       .toLowerCase()
//       .includes(filters.babyName.toLowerCase());
//     const matchBirth = (item.birthDate ?? "")
//       .toLowerCase()
//       .includes(filters.birthDate.toLowerCase());
//     const matchShoot = (item.shootDateAndTime ?? "")
//       .toLowerCase()
//       .includes(filters.shootDateAndTime.toLowerCase());
//     return matchClient && matchPhone && matchBaby && matchBirth && matchShoot;
//   });

//   // Format currency
//   const formatCurrency = (value?: number) => {
//     if (value === undefined || value === null) return "â€”";
//     return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(value);
//   };

//   return (
//     <div className="animate-fade-up" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem" }}>
//       {/* Header with Add button */}
//       <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
//         <div>
//           <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
//             <div
//               style={{
//                 padding: "0.6rem",
//                 backgroundColor: "var(--color-primary-glow)",
//                 color: "var(--color-primary)",
//                 borderRadius: "var(--radius-md)",
//               }}
//             >
//               <Baby size={28} />
//             </div>
//             <h1 style={{ fontSize: "2rem", margin: 0 }}>Maternity & Newborn</h1>
//           </div>
//           <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
//             Manage client records, addresses, packages, and finances.
//           </p>
//         </div>
//         <button className="btn btn-primary" onClick={openModalForNew} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
//           <Plus size={20} /> Add Record
//         </button>
//       </header>

//       {/* Filters Section */}
//       <div
//         style={{
//           padding: "1.5rem",
//           backgroundColor: "var(--bg-surface-2)",
//           borderRadius: "var(--radius-lg)",
//           marginBottom: "1.5rem",
//           border: "1px solid var(--border)",
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
//           <Search size={20} color="var(--text-muted)" />
//           <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Filters</h2>
//           {Object.values(filters).some((v) => v !== "") && (
//             <button
//               type="button"
//               onClick={clearFilters}
//               className="btn"
//               style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.25rem" }}
//             >
//               <X size={16} /> Clear all
//             </button>
//           )}
//         </div>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
//           <div style={{ flex: "1 1 180px" }}>
//             <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Client name</label>
//             <input
//               placeholder="Filter by client"
//               value={filters.clientName}
//               onChange={(e) => setFilters((f) => ({ ...f, clientName: e.target.value }))}
//               style={{ width: "100%" }}
//             />
//           </div>
//           <div style={{ flex: "1 1 160px" }}>
//             <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Phone</label>
//             <input
//               placeholder="Filter by phone"
//               value={filters.phoneNumber}
//               onChange={(e) => setFilters((f) => ({ ...f, phoneNumber: e.target.value }))}
//               style={{ width: "100%" }}
//             />
//           </div>
//           <div style={{ flex: "1 1 160px" }}>
//             <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Baby name</label>
//             <input
//               placeholder="Filter by baby"
//               value={filters.babyName}
//               onChange={(e) => setFilters((f) => ({ ...f, babyName: e.target.value }))}
//               style={{ width: "100%" }}
//             />
//           </div>
//           <div style={{ flex: "1 1 160px" }}>
//             <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Birth date</label>
//             <input
//               type="date"
//               value={filters.birthDate}
//               onChange={(e) => setFilters((f) => ({ ...f, birthDate: e.target.value }))}
//               style={{ width: "100%" }}
//             />
//           </div>
//           <div style={{ flex: "1 1 200px" }}>
//             <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Shoot date/time</label>
//             <input
//               type="datetime-local"
//               value={filters.shootDateAndTime}
//               onChange={(e) => setFilters((f) => ({ ...f, shootDateAndTime: e.target.value }))}
//               style={{ width: "100%" }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Records List */}
//       <div
//         className="card"
//         style={{
//           padding: "1.5rem",
//           backgroundColor: "var(--bg-surface-2)",
//           borderRadius: "var(--radius-lg)",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginBottom: "1.25rem",
//           }}
//         >
//           <div style={{ color: "var(--text-secondary)" }}>
//             {isLoading ? (
//               "Loading records..."
//             ) : (
//               <>
//                 <strong>{filteredData?.length ?? 0}</strong>{" "}
//                 {filteredData?.length === 1 ? "record" : "records"} shown
//                 {isFetching && !isLoading && " (refreshing...)"}
//               </>
//             )}
//           </div>
//           <button className="btn" onClick={() => refetch()} disabled={isLoading || isFetching}>
//             Refresh
//           </button>
//         </div>

//         {isError ? (
//           <div
//             style={{
//               padding: "2rem",
//               textAlign: "center",
//               border: "1px solid var(--color-danger-light)",
//               borderRadius: "var(--radius-md)",
//               background: "var(--bg-surface)",
//             }}
//           >
//             <p style={{ fontWeight: 600, color: "var(--color-danger)" }}>Failed to load records</p>
//             <p style={{ color: "var(--text-muted)" }}>{(error as Error)?.message ?? "Unknown error"}</p>
//           </div>
//         ) : isLoading ? (
//           <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
//             Fetching maternity dataâ€¦
//           </div>
//         ) : (
//           <div style={{ display: "grid", gap: "1rem" }}>
//             {filteredData?.length === 0 ? (
//               <div
//                 style={{
//                   padding: "2rem",
//                   textAlign: "center",
//                   border: "1px dashed var(--border)",
//                   borderRadius: "var(--radius-md)",
//                   color: "var(--text-muted)",
//                 }}
//               >
//                 No records match your filters.
//               </div>
//             ) : (
//               filteredData?.map((m) => (
//                 <div
//                   key={m._id}
//                   style={{
//                     padding: "1.5rem",
//                     border: "1px solid var(--border)",
//                     borderRadius: "var(--radius-md)",
//                     background: "var(--bg-surface)",
//                     transition: "box-shadow 0.2s",
//                     boxShadow: "var(--shadow-xs)",
//                   }}
//                   onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
//                   onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-xs)")}
//                 >
//                   {/* Top row: client name + actions */}
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//                       <div style={{ background: "var(--color-primary-glow)", padding: "0.4rem", borderRadius: "50%" }}>
//                         <User size={20} color="var(--color-primary)" />
//                       </div>
//                       <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 600 }}>{m.clientName}</h3>
//                     </div>
//                     <div style={{ display: "flex", gap: "0.5rem" }}>
//                       <button type="button" className="btn" onClick={() => openModalForEdit(m)} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
//                         <Edit size={16} /> Edit
//                       </button>
//                       <button
//                         type="button"
//                         className="btn btn-danger"
//                         onClick={() => deleteMutation.mutate(m._id)}
//                         disabled={deleteMutation.isPending}
//                         style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
//                       >
//                         <Trash2 size={16} /> Delete
//                       </button>
//                     </div>
//                   </div>

//                   {/* Main content grid: 3 columns */}
//                   <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
//                     {/* Column 1: Contact & Address */}
//                     <div>
//                       <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
//                         <Phone size={16} />
//                         <span>{m.phoneNumber}</span>
//                       </div>
//                       {m.address && (
//                         <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-muted)" }}>
//                           <MapPin size={16} style={{ marginTop: 2 }} />
//                           <div>
//                             {m.address.street && <div>{m.address.street}</div>}
//                             {(m.address.city || m.address.state || m.address.zipCode) && (
//                               <div>{[m.address.city, m.address.state, m.address.zipCode].filter(Boolean).join(", ")}</div>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* Column 2: Baby & Shoot */}
//                     <div>
//                       <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
//                         <Baby size={16} color="var(--text-muted)" />
//                         <span style={{ fontWeight: 500 }}>{m.babyName ? `Baby: ${m.babyName}` : "Baby name not set"}</span>
//                       </div>
//                       <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
//                         <Calendar size={16} />
//                         <span>{m.birthDate ? `Born: ${new Date(m.birthDate).toLocaleDateString()}` : "Birth date â€”"}</span>
//                       </div>
//                       <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
//                         <Calendar size={16} />
//                         <span>{m.shootDateAndTime ? `Shoot: ${new Date(m.shootDateAndTime).toLocaleString()}` : "Shoot not scheduled"}</span>
//                       </div>
//                     </div>

//                     {/* Column 3: Package & Financials */}
//                     <div>
//                       {m.package && (
//                         <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
//                           <Package size={16} />
//                           <span>Package: {m.package}</span>
//                         </div>
//                       )}
//                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem", marginTop: "0.25rem" }}>
//                         <span style={{ color: "var(--text-muted)" }}>Expenses:</span>
//                         <span style={{ fontWeight: 500 }}>{formatCurrency(m.expenses)}</span>
//                         <span style={{ color: "var(--text-muted)" }}>Advance:</span>
//                         <span style={{ fontWeight: 500 }}>{formatCurrency(m.advance)}</span>
//                         <span style={{ color: "var(--text-muted)" }}>Total:</span>
//                         <span style={{ fontWeight: 500 }}>{formatCurrency(m.total)}</span>
//                         <span style={{ color: "var(--text-muted)" }}>Extras:</span>
//                         <span style={{ fontWeight: 500 }}>{formatCurrency(m.extras)}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       </div>

//       {/* Modal for Add/Edit */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={closeModal}
//         title={editing ? "Edit Record" : "Add New Record"}
//       >
//         <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
//           {/* Client Info */}
//           <div>
//             <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Client Information</h3>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
//               <div>
//                 <label style={{ display: "block", fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>
//                   Client name <span style={{ color: "var(--color-danger)" }}>*</span>
//                 </label>
//                 <input
//                   required
//                   value={form.clientName}
//                   onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
//                   placeholder="e.g. Jane Smith"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ display: "block", fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>
//                   Phone <span style={{ color: "var(--color-danger)" }}>*</span>
//                 </label>
//                 <input
//                   required
//                   value={form.phoneNumber}
//                   onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
//                   placeholder="(555) 123-4567"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Address */}
//           <div>
//             <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Address</h3>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Street</label>
//                 <input
//                   value={form.address?.street ?? ""}
//                   onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address!, street: e.target.value } }))}
//                   placeholder="Street address"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>City</label>
//                 <input
//                   value={form.address?.city ?? ""}
//                   onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address!, city: e.target.value } }))}
//                   placeholder="City"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>State</label>
//                 <input
//                   value={form.address?.state ?? ""}
//                   onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address!, state: e.target.value } }))}
//                   placeholder="State"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Zip Code</label>
//                 <input
//                   value={form.address?.zipCode ?? ""}
//                   onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address!, zipCode: e.target.value } }))}
//                   placeholder="Zip Code"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Baby & Shoot */}
//           <div>
//             <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Baby & Shoot Details</h3>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Baby name</label>
//                 <input
//                   value={form.babyName}
//                   onChange={(e) => setForm((f) => ({ ...f, babyName: e.target.value }))}
//                   placeholder="e.g. Olivia"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Birth date</label>
//                 <input
//                   type="date"
//                   value={form.birthDate}
//                   onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Shoot date & time</label>
//                 <input
//                   type="datetime-local"
//                   value={form.shootDateAndTime}
//                   onChange={(e) => setForm((f) => ({ ...f, shootDateAndTime: e.target.value }))}
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Package</label>
//                 <input
//                   value={form.package}
//                   onChange={(e) => setForm((f) => ({ ...f, package: e.target.value }))}
//                   placeholder="e.g. Premium Gold"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Financials */}
//           <div>
//             <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Financials</h3>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Expenses (â‚¹)</label>
//                 <input
//                   type="number"
//                   min="0"
//                   step="1"
//                   value={form.expenses}
//                   onChange={(e) => setForm((f) => ({ ...f, expenses: e.target.valueAsNumber || 0 }))}
//                   placeholder="0"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Advance (â‚¹)</label>
//                 <input
//                   type="number"
//                   min="0"
//                   step="1"
//                   value={form.advance}
//                   onChange={(e) => setForm((f) => ({ ...f, advance: e.target.valueAsNumber || 0 }))}
//                   placeholder="0"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Total (â‚¹)</label>
//                 <input
//                   type="number"
//                   min="0"
//                   step="1"
//                   value={form.total}
//                   onChange={(e) => setForm((f) => ({ ...f, total: e.target.valueAsNumber || 0 }))}
//                   placeholder="0"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div>
//                 <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Extras (â‚¹)</label>
//                 <input
//                   type="number"
//                   min="0"
//                   step="1"
//                   value={form.extras}
//                   onChange={(e) => setForm((f) => ({ ...f, extras: e.target.valueAsNumber || 0 }))}
//                   placeholder="0"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Error display */}
//           {(createMutation.isError || updateMutation.isError) && (
//             <div style={{ fontSize: "0.9rem", color: "var(--color-danger)" }}>
//               {(createMutation.error as Error | null)?.message ||
//                 (updateMutation.error as Error | null)?.message ||
//                 "Failed to save record"}
//             </div>
//           )}

//           <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
//             <button type="button" className="btn" onClick={closeModal}>
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={createMutation.isPending || updateMutation.isPending}
//             >
//               {editing ? "Update" : "Add"} Record
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }











































import { Baby, Phone, Calendar, User, MapPin, Package, Search, X, Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Loader from "../components/Loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  deleteMaternity,
  getMaternities,
  type Maternity,
} from "@/api/maternity";

// Shared currency formatter for this page
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day} - ${month} - ${year}`;
};

const formatDateTime = (dateStr?: string | Date) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const time = d.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${day} - ${month} - ${year}, ${time}`;
};

// ----------------------------------------------------------------------
// Types (should match your updated api/maternity)
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function MaternityPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    clientName: "",
    phoneNumber: "",
    babyName: "",
    birthDate: "",
    referredBy: "",
    city: "",
    notes: "",
    shootDateFrom: "",
    shootDateTo: "",
    deliveryDeadlineFrom: "",
    deliveryDeadlineTo: "",
    status: "",
    package: "",
    paymentStatus: "",
  });

  // Fetch data with server-side filtering
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["maternity", filters],
    queryFn: () => getMaternities(filters),
  });

  const data = response?.data || [];
  const apiSummary = response?.summary || {};

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMaternity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity"] });
    },
  });

  // Clear filters
  const clearFilters = () => {
    setFilters({
      clientName: "",
      phoneNumber: "",
      babyName: "",
      birthDate: "",
      referredBy: "",
      city: "",
      notes: "",
      shootDateFrom: "",
      shootDateTo: "",
      deliveryDeadlineFrom: "",
      deliveryDeadlineTo: "",
      status: "",
      package: "",
      paymentStatus: "",
    });
  };

  const summary = {
    totalRecords: apiSummary.total ?? 0,
    totalRevenue: apiSummary.totalRevenue ?? 0,
    totalReceived: apiSummary.totalReceived ?? 0,
    totalDue: apiSummary.totalDue ?? 0,
  };



  return (
    <div className="animate-fade-up" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem" }}>
      {/* Header */}
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
              <Baby size={28} />
            </div>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>Maternity & Newborn</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Manage client records, packages, extras, and payments.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard/maternity/new")} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={20} /> Add Record
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1rem", background: "var(--bg-surface-2)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Records</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{summary.totalRecords}</div>
        </div>
        <div className="card" style={{ padding: "1rem", background: "var(--bg-surface-2)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Revenue</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{formatCurrency(summary.totalRevenue)}</div>
        </div>
        <div className="card" style={{ padding: "1rem", background: "var(--bg-surface-2)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Received</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{formatCurrency(summary.totalReceived)}</div>
        </div>
        <div className="card" style={{ padding: "1rem", background: "var(--bg-surface-2)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Due</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{formatCurrency(summary.totalDue)}</div>
        </div>
      </div>

      {/* Filters Section */}
      <div style={{
        padding: "1.5rem",
        backgroundColor: "var(--bg-surface-2)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "1.5rem",
        border: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Search size={20} color="var(--text-muted)" />
          <h2 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 700 }}>Filters</h2>
          {Object.values(filters).some((v) => v !== "") && (
            <button
              type="button"
              onClick={clearFilters}
              className="btn-ghost"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "var(--color-danger)" }}
            >
              <X size={16} /> Clear All
            </button>
          )}
        </div>

        {/* Basic Filters: 4-column-like grid for desktop */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.25rem",
          alignItems: "end"
        }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Client Name</label>
            <input
              placeholder="Search by name..."
              value={filters.clientName}
              onChange={(e) => setFilters(f => ({ ...f, clientName: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Phone Number</label>
            <input
              placeholder="Search by phone..."
              value={filters.phoneNumber}
              onChange={(e) => setFilters(f => ({ ...f, phoneNumber: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Shoot Date From</label>
            <input
              type="date"
              value={filters.shootDateFrom}
              onChange={(e) => setFilters(f => ({ ...f, shootDateFrom: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Shoot Date To</label>
            <input
              type="date"
              value={filters.shootDateTo}
              onChange={(e) => setFilters(f => ({ ...f, shootDateTo: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.8rem", marginBottom: "0.5rem", visibility: "hidden" }}>Placeholder</div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                whiteSpace: "nowrap",
                height: "42px",
                backgroundColor: "var(--bg-surface-3)",
                border: "1px solid var(--border)",
              }}
            >
              {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {showAdvanced ? "Hide Filters" : "Show All Filters"}
            </button>
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showAdvanced && (
          <div style={{
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
            animation: "fadeDown 0.2s ease-out"
          }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Baby Name</label>
              <input
                placeholder="Search baby..."
                value={filters.babyName}
                onChange={(e) => setFilters(f => ({ ...f, babyName: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Birth Date</label>
              <input
                type="date"
                value={filters.birthDate}
                onChange={(e) => setFilters(f => ({ ...f, birthDate: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                style={{ width: "100%" }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value }))}
                style={{ width: "100%" }}
              >
                <option value="">All Payments</option>
                <option value="pending">Pending Balance</option>
                <option value="paid">Fully Paid</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>City</label>
              <input
                placeholder="Search city..."
                value={filters.city}
                onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Referred By</label>
              <input
                placeholder="Search referrer..."
                value={filters.referredBy}
                onChange={(e) => setFilters(f => ({ ...f, referredBy: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Deadline From</label>
              <input
                type="date"
                value={filters.deliveryDeadlineFrom}
                onChange={(e) => setFilters(f => ({ ...f, deliveryDeadlineFrom: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Deadline To</label>
              <input
                type="date"
                value={filters.deliveryDeadlineTo}
                onChange={(e) => setFilters(f => ({ ...f, deliveryDeadlineTo: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Notes Search</label>
              <input
                placeholder="Search in notes..."
                value={filters.notes}
                onChange={(e) => setFilters(f => ({ ...f, notes: e.target.value }))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="card" style={{ padding: "1.5rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ color: "var(--text-secondary)" }}>
            {isLoading ? "Fetching data..." : (
              <>
                <strong>{data.length}</strong> {data.length === 1 ? "record" : "records"} shown
                {isFetching && !isLoading && " (updating...)"}
              </>
            )}
          </div>
          <button className="btn" onClick={() => { clearFilters(); refetch(); }} disabled={isLoading || isFetching}>Refresh</button>
        </div>

        {isError ? (
          <div style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--color-danger-light)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
            <p style={{ fontWeight: 600, color: "var(--color-danger)" }}>Failed to load records</p>
            <p style={{ color: "var(--text-muted)" }}>{(error as Error)?.message ?? "Unknown error"}</p>
          </div>
        ) : isLoading || isFetching ? (
          <Loader message={isLoading ? "Loading records..." : "Updating filters..."} />
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {data.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-muted)" }}>
                No records match your filters.
              </div>
            ) : (
              data.map((m: Maternity) => (
                <RecordCard
                  key={m._id}
                  record={m}
                  onEdit={() => navigate(`/dashboard/maternity/${m._id}/edit`)}
                  onDelete={() => deleteMutation.mutate(m._id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}

// ----------------------------------------------------------------------
// Record Card Component
// ----------------------------------------------------------------------
function RecordCard({ record, onEdit, onDelete, isDeleting }: { record: Maternity; onEdit: () => void; onDelete: () => void; isDeleting: boolean }) {
  const [showExtras, setShowExtras] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  return (
    <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", transition: "box-shadow 0.2s", boxShadow: "var(--shadow-xs)" }}
         onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
         onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-xs)")}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "var(--color-primary-glow)", padding: "0.4rem", borderRadius: "50%" }}>
            <User size={20} color="var(--color-primary)" />
          </div>
          <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 600 }}>{record.clientName}</h3>
          <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: record.status === 'Completed' ? 'var(--color-success-light)' : record.status === 'Confirmed' ? 'var(--color-warning-light)' : 'var(--bg-surface-3)' }}>
            {record.status}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn" onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Edit size={16} /> Edit</button>
          <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isDeleting} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
        {/* Contact & Address */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            <Phone size={14} /> <span>{record.phoneNumber}</span>
          </div>
          {record.address && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              <MapPin size={14} style={{ marginTop: 2 }} />
              <div>
                {record.address.street && <div>{record.address.street}</div>}
                {(record.address.city || record.address.state || record.address.zipCode) && (
                  <div>{[record.address.city, record.address.state, record.address.zipCode].filter(Boolean).join(", ")}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Baby & Shoot */}
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Baby size={14} color="var(--text-muted)" />
            <span style={{ fontWeight: 500 }}>{record.babyName ? `Baby: ${record.babyName}` : "Baby name not set"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <Calendar size={14} /> <span>Born: {formatDate(record.birthDate)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <Calendar size={14} /> <span>Shoot: {formatDateTime(record.shootDateAndTime)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: (record.deliveryDeadline && new Date(record.deliveryDeadline) < new Date()) ? "var(--color-danger)" : "var(--text-muted)" }}>
            <Calendar size={14} /> <span>Deadline: {formatDate(record.deliveryDeadline)}</span>
          </div>
        </div>

        {/* Package & Financial Summary */}
        <div style={{ fontSize: "0.9rem" }}>
          {record.package && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
              <Package size={14} /> <span>Package: {record.package}</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem 0.75rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Total:</span> <span style={{ fontWeight: 600 }}>{formatCurrency(record.total)}</span>
            <span style={{ color: "var(--text-muted)" }}>Paid:</span> <span style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatCurrency(record.advance)}</span>
            <span style={{ color: "var(--text-muted)" }}>Balance:</span> <span style={{ fontWeight: 600, color: (record.balance || 0) > 0 ? "var(--color-danger)" : "inherit" }}>{formatCurrency(record.balance)}</span>
          </div>
        </div>
      </div>

      {/* Extras & Payments Toggles */}
      {((record.extras?.length ?? 0) > 0 || (record.payments?.length ?? 0) > 0 || record.notes) && (
        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
          {(record.extras?.length ?? 0) > 0 && (
            <div style={{ marginBottom: "0.75rem" }}>
              <button onClick={() => setShowExtras(!showExtras)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
                {showExtras ? <ChevronUp size={18} /> : <ChevronDown size={18} />} Extras ({record.extras?.length})
              </button>
              {showExtras && (
                <div style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {(record.extras || []).map((e: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                      <span>{e.description}</span>
                      <span>{formatCurrency(e.amount)}</span>
                    </div>
                  ))}
                  <div style={{ fontWeight: 500, marginTop: "0.25rem" }}>Extras Total: {formatCurrency(record.extrasTotal)}</div>
                </div>
              )}
            </div>
          )}

          {(record.payments?.length ?? 0) > 0 && (
            <div style={{ marginBottom: "0.75rem" }}>
              <button onClick={() => setShowPayments(!showPayments)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
                {showPayments ? <ChevronUp size={18} /> : <ChevronDown size={18} />} Payments ({record.payments?.length})
              </button>
              {showPayments && (
                <div style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {(record.payments || []).map((p: any, idx: number) => (
                    <div key={idx} style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{formatCurrency(p.amount)}</span>
                        <span>{formatDate(p.date)}</span>
                      </div>
                      {p.note && <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{p.note}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {record.notes && (
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
              {record.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
