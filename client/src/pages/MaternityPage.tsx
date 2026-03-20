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
import { FormEvent, useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMaternity,
  deleteMaternity,
  getMaternities,
  updateMaternity,
  type Maternity,
  type MaternityInput,
} from "@/api/maternity";

// Shared currency formatter for this page
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "â€”";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
};

// ----------------------------------------------------------------------
// Types (should match your updated api/maternity)
// ----------------------------------------------------------------------
// Local form state interface
interface MaternityFormState {
  clientName: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shootDateAndTime?: string;
  deliveryDeadline?: string;
  birthDate?: string;
  babyName?: string;
  package?: string;
  extras: Array<{ description: string; amount: number }>;
  expenses: number;
  payments: Array<{ amount: number; date: string; note?: string }>;
  notes?: string;
  status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

// Package definitions (should match backend)
const MATERNITY_PACKAGES: Record<string, number> = {
  'Basic': 5000,
  'Standard': 9000,
  'Premium': 15000,
  'Deluxe': 22000,
};

// ----------------------------------------------------------------------
// Modal Component
// ----------------------------------------------------------------------
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          maxWidth: 900,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function MaternityPage() {
  const queryClient = useQueryClient();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Maternity | null>(null);

  // Form state
  const [form, setForm] = useState<MaternityFormState>({
    clientName: "",
    phoneNumber: "",
    address: { street: "", city: "", state: "", zipCode: "" },
    shootDateAndTime: "",
    deliveryDeadline: "",
    birthDate: "",
    babyName: "",
    package: "",
    extras: [],
    expenses: 0,
    payments: [],
    notes: "",
    status: "Pending",
  });

  // Filter state
  const [filters, setFilters] = useState({
    clientName: "",
    phoneNumber: "",
    babyName: "",
    birthDate: "",
    shootDateAndTime: "",
    deliveryDeadline: "",
  });

  // Fetch data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["maternity"],
    queryFn: getMaternities,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMaternity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MaternityInput> }) =>
      updateMaternity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMaternity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maternity"] });
    },
  });

  // Open modal for new record
  const openModalForNew = () => {
    setEditing(null);
    setForm({
      clientName: "",
      phoneNumber: "",
      address: { street: "", city: "", state: "", zipCode: "" },
      shootDateAndTime: "",
      deliveryDeadline: "",
      birthDate: "",
      babyName: "",
      package: "",
      extras: [],
      expenses: 0,
      payments: [],
      notes: "",
      status: "Pending",
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const openModalForEdit = (m: Maternity) => {
    setEditing(m);
    setForm({
      clientName: m.clientName,
      phoneNumber: m.phoneNumber,
      address: m.address ?? { street: "", city: "", state: "", zipCode: "" },
      shootDateAndTime: m.shootDateAndTime ?? "",
      deliveryDeadline: m.deliveryDeadline ?? "",
      birthDate: m.birthDate ?? "",
      babyName: m.babyName ?? "",
      package: m.package ?? "",
      extras: m.extras ?? [],
      expenses: m.expenses ?? 0,
      payments: m.payments ?? [],
      notes: m.notes ?? "",
      status: m.status ?? 'Pending',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  // Submit handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({
        id: editing._id,
        payload: form,
      });
    } else {
      createMutation.mutate(form as any);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      clientName: "",
      phoneNumber: "",
      babyName: "",
      birthDate: "",
      shootDateAndTime: "",
      deliveryDeadline: "",
    });
  };

  // Filter data
  const filteredData = data?.filter((item: Maternity) => {
    const matchClient = item.clientName.toLowerCase().includes(filters.clientName.toLowerCase());
    const matchPhone = item.phoneNumber.toLowerCase().includes(filters.phoneNumber.toLowerCase());
    const matchBaby = (item.babyName ?? "").toLowerCase().includes(filters.babyName.toLowerCase());
    const matchBirth = (item.birthDate ?? "").toLowerCase().includes(filters.birthDate.toLowerCase());
    const matchShoot = (item.shootDateAndTime ?? "").toLowerCase().includes(filters.shootDateAndTime.toLowerCase());
    const matchDeadline = (item.deliveryDeadline ?? "").toLowerCase().includes(filters.deliveryDeadline.toLowerCase());
    return matchClient && matchPhone && matchBaby && matchBirth && matchShoot && matchDeadline;
  });

  // Calculate summary totals
  const summary = {
    totalRecords: data?.length ?? 0,
    totalRevenue: data?.reduce((sum, m) => sum + (m.total ?? 0), 0) ?? 0,
    totalReceived: data?.reduce((sum, m) => sum + (m.advance ?? 0), 0) ?? 0,
    totalDue: data?.reduce((sum, m) => sum + (m.balance ?? 0), 0) ?? 0,
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
        <button className="btn btn-primary" onClick={openModalForNew} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={20} /> Add Record
        </button>
      </header>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.25rem", background: "var(--bg-surface-2)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Total Records</div>
          <div style={{ fontSize: "2rem", fontWeight: 600 }}>{summary.totalRecords}</div>
        </div>
        <div className="card" style={{ padding: "1.25rem", background: "var(--bg-surface-2)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Total Revenue</div>
          <div style={{ fontSize: "2rem", fontWeight: 600 }}>{formatCurrency(summary.totalRevenue)}</div>
        </div>
        <div className="card" style={{ padding: "1.25rem", background: "var(--bg-surface-2)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Received</div>
          <div style={{ fontSize: "2rem", fontWeight: 600 }}>{formatCurrency(summary.totalReceived)}</div>
        </div>
        <div className="card" style={{ padding: "1.25rem", background: "var(--bg-surface-2)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Due</div>
          <div style={{ fontSize: "2rem", fontWeight: 600 }}>{formatCurrency(summary.totalDue)}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "1.5rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <Search size={20} color="var(--text-muted)" />
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Filters</h2>
          {Object.values(filters).some((v) => v !== "") && (
            <button type="button" onClick={clearFilters} className="btn" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <X size={16} /> Clear all
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Client name</label>
            <input placeholder="Filter by client" value={filters.clientName} onChange={(e) => setFilters((f) => ({ ...f, clientName: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Phone</label>
            <input placeholder="Filter by phone" value={filters.phoneNumber} onChange={(e) => setFilters((f) => ({ ...f, phoneNumber: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Baby name</label>
            <input placeholder="Filter by baby" value={filters.babyName} onChange={(e) => setFilters((f) => ({ ...f, babyName: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Birth date</label>
            <input type="date" value={filters.birthDate} onChange={(e) => setFilters((f) => ({ ...f, birthDate: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Shoot date/time</label>
            <input type="datetime-local" value={filters.shootDateAndTime} onChange={(e) => setFilters((f) => ({ ...f, shootDateAndTime: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Delivery Deadline</label>
            <input type="date" value={filters.deliveryDeadline} onChange={(e) => setFilters((f) => ({ ...f, deliveryDeadline: e.target.value }))} style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="card" style={{ padding: "1.5rem", backgroundColor: "var(--bg-surface-2)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ color: "var(--text-secondary)" }}>
            {isLoading ? "Loading records..." : (
              <>
                <strong>{filteredData?.length ?? 0}</strong> {filteredData?.length === 1 ? "record" : "records"} shown
                {isFetching && !isLoading && " (refreshing...)"}
              </>
            )}
          </div>
          <button className="btn" onClick={() => refetch()} disabled={isLoading || isFetching}>Refresh</button>
        </div>

        {isError ? (
          <div style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--color-danger-light)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
            <p style={{ fontWeight: 600, color: "var(--color-danger)" }}>Failed to load records</p>
            <p style={{ color: "var(--text-muted)" }}>{(error as Error)?.message ?? "Unknown error"}</p>
          </div>
        ) : isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Fetching maternity dataâ€¦</div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {filteredData?.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-muted)" }}>
                No records match your filters.
              </div>
            ) : (
              filteredData?.map((m: Maternity) => (
                <RecordCard
                  key={m._id}
                  record={m}
                  onEdit={() => openModalForEdit(m)}
                  onDelete={() => deleteMutation.mutate(m._id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editing ? "Edit Record" : "Add New Record"}>
        <Form
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isPending={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error || updateMutation.error}
          isEditing={Boolean(editing)}
        />
      </Modal>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
        {/* Contact & Address */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <Phone size={16} /> <span>{record.phoneNumber}</span>
          </div>
          {record.address && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-muted)" }}>
              <MapPin size={16} style={{ marginTop: 2 }} />
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
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Baby size={16} color="var(--text-muted)" />
            <span style={{ fontWeight: 500 }}>{record.babyName ? `Baby: ${record.babyName}` : "Baby name not set"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <Calendar size={16} /> <span>Born: {record.birthDate ? new Date(record.birthDate).toLocaleDateString() : "â€”"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <Calendar size={16} /> <span>Shoot: {record.shootDateAndTime ? new Date(record.shootDateAndTime).toLocaleString() : "â€”"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-warning)" }}>
            <Calendar size={16} /> <span>Deadline: {record.deliveryDeadline ? new Date(record.deliveryDeadline).toLocaleDateString() : "Not set"}</span>
          </div>
        </div>

        {/* Package & Financial Summary */}
        <div>
          {record.package && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
              <Package size={16} /> <span>Package: {record.package} ({formatCurrency(record.packagePrice)})</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem", marginTop: "0.25rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Expenses:</span> <span style={{ fontWeight: 500 }}>{formatCurrency(record.expenses)}</span>
            <span style={{ color: "var(--text-muted)" }}>Advance:</span> <span style={{ fontWeight: 500 }}>{formatCurrency(record.advance)}</span>
            <span style={{ color: "var(--text-muted)" }}>Total:</span> <span style={{ fontWeight: 500 }}>{formatCurrency(record.total)}</span>
            <span style={{ color: "var(--text-muted)" }}>Balance:</span> <span style={{ fontWeight: 500, color: (record.balance || 0) > 0 ? "var(--color-danger)" : "inherit" }}>{formatCurrency(record.balance)}</span>
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
                        <span>{new Date(p.date).toLocaleDateString()}</span>
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
              ðŸ“ {record.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Form Component (inside Modal)
// ----------------------------------------------------------------------
function Form({
  form,
  setForm,
  onSubmit,
  onCancel,
  isPending,
  error,
  isEditing,
}: {
  form: MaternityFormState;
  setForm: React.Dispatch<React.SetStateAction<MaternityFormState>>;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  error: unknown;
  isEditing: boolean;
}) {
  // Handlers for dynamic arrays
  const addExtra = () => {
    setForm(f => ({ ...f, extras: [...f.extras, { description: "", amount: 0 }] }));
  };
  const updateExtra = (index: number, field: "description" | "amount", value: string | number) => {
    setForm(f => {
      const newExtras = [...f.extras];
      newExtras[index] = { ...newExtras[index], [field]: value };
      return { ...f, extras: newExtras };
    });
  };
  const removeExtra = (index: number) => {
    setForm(f => ({ ...f, extras: f.extras.filter((_, i) => i !== index) }));
  };

  const addPayment = () => {
    setForm(f => ({ ...f, payments: [...f.payments, { amount: 0, date: new Date().toISOString().split('T')[0], note: "" }] }));
  };
  const updatePayment = (index: number, field: "amount" | "date" | "note", value: string | number) => {
    setForm(f => {
      const newPayments = [...f.payments];
      newPayments[index] = { ...newPayments[index], [field]: value };
      return { ...f, payments: newPayments };
    });
  };
  const removePayment = (index: number) => {
    setForm(f => ({ ...f, payments: f.payments.filter((_, i) => i !== index) }));
  };

  // Calculate derived values for preview
  const packagePrice = form.package && MATERNITY_PACKAGES[form.package] ? MATERNITY_PACKAGES[form.package] : 0;
  const extrasTotal = form.extras.reduce((sum, e) => sum + (e.amount || 0), 0);
  const total = packagePrice + extrasTotal;
  const advance = form.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = total - advance;

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Client Info */}
      <section>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Client Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Client name <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <input required value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="e.g. Jane Smith" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Phone <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <input required value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="(555) 123-4567" style={{ width: "100%" }} />
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Address</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div><label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Street</label><input value={form.address.street} onChange={e => setForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))} placeholder="Street" style={{ width: "100%" }} /></div>
          <div><label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>City</label><input value={form.address.city} onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} placeholder="City" style={{ width: "100%" }} /></div>
          <div><label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>State</label><input value={form.address.state} onChange={e => setForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))} placeholder="State" style={{ width: "100%" }} /></div>
          <div><label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Zip Code</label><input value={form.address.zipCode} onChange={e => setForm(f => ({ ...f, address: { ...f.address, zipCode: e.target.value } }))} placeholder="Zip Code" style={{ width: "100%" }} /></div>
        </div>
      </section>

      {/* Baby & Shoot */}
      <section>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Baby & Shoot Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div><label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Baby name</label><input value={form.babyName} onChange={e => setForm(f => ({ ...f, babyName: e.target.value }))} placeholder="e.g. Olivia" style={{ width: "100%" }} /></div>
          <div><label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Birth date</label><input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} style={{ width: "100%" }} /></div>
          <div><label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Shoot date & time</label><input type="datetime-local" value={form.shootDateAndTime} onChange={e => setForm(f => ({ ...f, shootDateAndTime: e.target.value }))} style={{ width: "100%" }} /></div>
          <div><label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Delivery Deadline</label><input type="date" value={form.deliveryDeadline} onChange={e => setForm(f => ({ ...f, deliveryDeadline: e.target.value }))} style={{ width: "100%" }} /></div>
          <div>
            <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Package</label>
            <select value={form.package} onChange={e => setForm(f => ({ ...f, package: e.target.value }))} style={{ width: "100%" }}>
              <option value="">Select package</option>
              {Object.keys(MATERNITY_PACKAGES).map(pkg => (
                <option key={pkg} value={pkg}>{pkg} (â‚¹{MATERNITY_PACKAGES[pkg]})</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Extras */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Extras</h3>
          <button type="button" className="btn" onClick={addExtra} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Plus size={16} /> Add Extra</button>
        </div>
        {form.extras.map((extra, index) => (
          <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
            <input placeholder="Description" value={extra.description} onChange={e => updateExtra(index, 'description', e.target.value)} style={{ flex: 2 }} />
            <input type="number" placeholder="Amount" value={extra.amount} onChange={e => updateExtra(index, 'amount', e.target.valueAsNumber || 0)} style={{ flex: 1 }} />
            <button type="button" onClick={() => removeExtra(index)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)" }}><X size={18} /></button>
          </div>
        ))}
        {form.extras.length > 0 && (
          <div style={{ textAlign: "right", fontWeight: 500, marginTop: "0.5rem" }}>Extras Total: {formatCurrency(extrasTotal)}</div>
        )}
      </section>

      {/* Payments */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Payments</h3>
          <button type="button" className="btn" onClick={addPayment} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Plus size={16} /> Add Payment</button>
        </div>
        {form.payments.map((payment, index) => (
          <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <input type="number" placeholder="Amount" value={payment.amount} onChange={e => updatePayment(index, 'amount', e.target.valueAsNumber || 0)} style={{ width: 120 }} />
            <input type="date" value={payment.date} onChange={e => updatePayment(index, 'date', e.target.value)} style={{ width: 140 }} />
            <input placeholder="Note (optional)" value={payment.note} onChange={e => updatePayment(index, 'note', e.target.value)} style={{ flex: 1 }} />
            <button type="button" onClick={() => removePayment(index)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)" }}><X size={18} /></button>
          </div>
        ))}
        {form.payments.length > 0 && (
          <div style={{ textAlign: "right", fontWeight: 500, marginTop: "0.5rem" }}>Total Advance: {formatCurrency(advance)}</div>
        )}
      </section>

      {/* Expenses & Notes */}
      <section>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Other</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Expenses (â‚¹)</label>
            <input type="number" min="0" value={form.expenses} onChange={e => setForm(f => ({ ...f, expenses: e.target.valueAsNumber || 0 }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Notes</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes" style={{ width: "100%" }} />
          </div>
        </div>
      </section>

      {/* Calculated Totals Preview */}
      <div style={{ background: "var(--bg-surface-3)", padding: "1rem", borderRadius: "var(--radius-md)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
        <div><span style={{ color: "var(--text-muted)" }}>Package Price:</span> {formatCurrency(packagePrice)}</div>
        <div><span style={{ color: "var(--text-muted)" }}>Extras Total:</span> {formatCurrency(extrasTotal)}</div>
        <div><span style={{ color: "var(--text-muted)" }}>Total:</span> {formatCurrency(total)}</div>
        <div><span style={{ color: "var(--text-muted)" }}>Advance:</span> {formatCurrency(advance)}</div>
        <div><span style={{ color: "var(--text-muted)" }}>Balance:</span> <span style={{ color: balance > 0 ? "var(--color-danger)" : "inherit" }}>{formatCurrency(balance)}</span></div>
      </div>

      {/* Status (optional) */}
      <div>
        <label style={{ fontSize: "0.9rem", marginBottom: 4, fontWeight: 500 }}>Status (optional, backend may autoâ€‘set)</label>
        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} style={{ width: "100%" }}>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error */}
      {!!error && (
        <div style={{ fontSize: "0.9rem", color: "var(--color-danger)" }}>
          {(error as Error)?.message || "Failed to save record"}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isEditing ? "Update" : "Add"} Record
        </button>
      </div>
    </form>
  );
}
