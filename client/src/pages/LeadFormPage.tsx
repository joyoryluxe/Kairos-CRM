// // // // import React, { useState, useEffect } from "react";
// // // // import { 
// // // //   User, 
// // // //   Calendar, 
// // // //   MapPin, 
// // // //   IndianRupee, 
// // // //   Tag, 
// // // //   ArrowLeft,
// // // //   Save,
// // // //   ChevronRight,
// // // //   Clock,
// // // //   MessageSquare
// // // // } from "lucide-react";
// // // // import { useNavigate, useParams } from "react-router-dom";
// // // // import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// // // // import { createLead, getLeadById, updateLead, type LeadInput, type LeadStatus, type LeadSource, type LeadEventType } from "../api/lead";

// // // // interface FormState {
// // // //   clientName: string;
// // // //   phoneNumber: string;
// // // //   email: string;
// // // //   source: LeadSource;
// // // //   inquiryDate: string;
// // // //   eventType: LeadEventType;
// // // //   eventDate: string;
// // // //   eventLocation: string;
// // // //   budget: number;
// // // //   status: LeadStatus;
// // // //   notes: string;
// // // //   nextFollowUpDate: string;
// // // // }

// // // // const EMPTY_FORM: FormState = {
// // // //   clientName: "",
// // // //   phoneNumber: "",
// // // //   email: "",
// // // //   source: "Other",
// // // //   inquiryDate: new Date().toISOString().split('T')[0],
// // // //   eventType: "Other",
// // // //   eventDate: "",
// // // //   eventLocation: "",
// // // //   budget: 0,
// // // //   status: "New",
// // // //   notes: "",
// // // //   nextFollowUpDate: "",
// // // // };

// // // // const useIsMobile = () => {
// // // //   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

// // // //   useEffect(() => {
// // // //     const handleResize = () => {
// // // //       setIsMobile(window.innerWidth < 768);
// // // //     };
// // // //     window.addEventListener("resize", handleResize);
// // // //     return () => window.removeEventListener("resize", handleResize);
// // // //   }, []);

// // // //   return isMobile;
// // // // };

// // // // const LeadFormPage: React.FC = () => {
// // // //   const isMobile = useIsMobile();
// // // //   const { id } = useParams<{ id: string }>();
// // // //   const isEdit = Boolean(id);
// // // //   const navigate = useNavigate();
// // // //   const queryClient = useQueryClient();
// // // //   const [form, setForm] = useState<FormState>(EMPTY_FORM);

// // // //   const { data: lead, isSuccess } = useQuery({
// // // //     queryKey: ["lead", id],
// // // //     queryFn: () => getLeadById(id!),
// // // //     enabled: isEdit,
// // // //   });

// // // //   useEffect(() => {
// // // //     if (isEdit && isSuccess && lead) {
// // // //       setForm({
// // // //         clientName: lead.clientName,
// // // //         phoneNumber: lead.phoneNumber,
// // // //         email: lead.email || "",
// // // //         source: lead.source,
// // // //         inquiryDate: lead.inquiryDate ? new Date(lead.inquiryDate).toISOString().split('T')[0] : "",
// // // //         eventType: lead.eventType,
// // // //         eventDate: lead.eventDate ? new Date(lead.eventDate).toISOString().split('T')[0] : "",
// // // //         eventLocation: lead.eventLocation || "",
// // // //         budget: lead.budget || 0,
// // // //         status: lead.status,
// // // //         notes: lead.notes || "",
// // // //         nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : "",
// // // //       });
// // // //     }
// // // //   }, [isEdit, isSuccess, lead]);

// // // //   const createMutation = useMutation({
// // // //     mutationFn: createLead,
// // // //     onSuccess: () => {
// // // //       queryClient.invalidateQueries({ queryKey: ["leads"] });
// // // //       navigate("/dashboard/leads");
// // // //     },
// // // //   });

// // // //   const updateMutation = useMutation({
// // // //     mutationFn: (data: Partial<LeadInput>) => updateLead(id!, data),
// // // //     onSuccess: () => {
// // // //       queryClient.invalidateQueries({ queryKey: ["leads"] });
// // // //       queryClient.invalidateQueries({ queryKey: ["lead", id] });
// // // //       navigate("/dashboard/leads");
// // // //     },
// // // //   });

// // // //   const handleSubmit = (e: React.FormEvent) => {
// // // //     e.preventDefault();
// // // //     if (isEdit) {
// // // //       updateMutation.mutate(form);
// // // //     } else {
// // // //       createMutation.mutate(form);
// // // //     }
// // // //   };

// // // //   const isPending = createMutation.isPending || updateMutation.isPending;

// // // //   return (
// // // //     <div style={{ maxWidth: "1000px", margin: "0 auto", padding: isMobile ? "1rem" : "1.5rem" }}>
// // // //       {/* Header */}
// // // //       <div style={{ marginBottom: "2rem" }}>
// // // //         <button 
// // // //           onClick={() => navigate("/dashboard/leads")}
// // // //           style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginBottom: "1rem", padding: 0 }}
// // // //         >
// // // //           <ArrowLeft size={16} /> Back to Leads
// // // //         </button>
// // // //         <div style={{ 
// // // //           display: "flex", 
// // // //           flexDirection: isMobile ? "column" : "row",
// // // //           alignItems: isMobile ? "flex-start" : "center", 
// // // //           gap: "0.5rem", 
// // // //           fontSize: "0.85rem", 
// // // //           color: "var(--text-muted)", 
// // // //           marginBottom: "0.75rem" 
// // // //         }}>
// // // //           <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
// // // //             <span>Leads</span>
// // // //             <ChevronRight size={14} />
// // // //           </div>
// // // //           <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{isEdit ? "Edit Lead" : "New Lead"}</span>
// // // //         </div>
// // // //         <h1 style={{ fontSize: isMobile ? "1.5rem" : "1.75rem", fontWeight: 800 }}>{isEdit ? "Edit Lead Details" : "Create New Lead"}</h1>
// // // //       </div>

// // // //       <form onSubmit={handleSubmit}>
// // // //         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>

// // // //           {/* Section: Basic Info */}
// // // //           <FormSection title="Basic Information" icon={<User size={18} />}>
// // // //             <div style={{ display: "grid", gap: "1rem" }}>
// // // //               <div className="form-group">
// // // //                 <label>Client Name *</label>
// // // //                 <input 
// // // //                   type="text" 
// // // //                   required 
// // // //                   value={form.clientName} 
// // // //                   onChange={e => setForm({...form, clientName: e.target.value})}
// // // //                   placeholder="e.g. Rahul Gupta"
// // // //                 />
// // // //               </div>
// // // //               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
// // // //                 <div className="form-group">
// // // //                   <label>Phone Number *</label>
// // // //                   <input 
// // // //                     type="text" 
// // // //                     required 
// // // //                     value={form.phoneNumber} 
// // // //                     onChange={e => setForm({...form, phoneNumber: e.target.value})}
// // // //                     placeholder="+91 9876543210"
// // // //                   />
// // // //                 </div>
// // // //                 <div className="form-group">
// // // //                   <label>Email Address</label>
// // // //                   <input 
// // // //                     type="email" 
// // // //                     value={form.email} 
// // // //                     onChange={e => setForm({...form, email: e.target.value})}
// // // //                     placeholder="example@mail.com"
// // // //                   />
// // // //                 </div>
// // // //               </div>
// // // //               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
// // // //                 <div className="form-group">
// // // //                   <label>Lead Source</label>
// // // //                   <select value={form.source} onChange={e => setForm({...form, source: e.target.value as LeadSource})}>
// // // //                     <option value="Instagram">Instagram</option>
// // // //                     <option value="Website">Website</option>
// // // //                     <option value="Referral">Referral</option>
// // // //                     <option value="Ads">Ads</option>
// // // //                     <option value="Other">Other</option>
// // // //                   </select>
// // // //                 </div>
// // // //                 <div className="form-group">
// // // //                   <label>Inquiry Date</label>
// // // //                   <input 
// // // //                     type="date" 
// // // //                     value={form.inquiryDate} 
// // // //                     onChange={e => setForm({...form, inquiryDate: e.target.value})}
// // // //                   />
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           </FormSection>

// // // //           {/* Section: Event Details */}
// // // //           <FormSection title="Event Details" icon={<Calendar size={18} />}>
// // // //             <div style={{ display: "grid", gap: "1rem" }}>
// // // //               <div className="form-group">
// // // //                 <label>Event Type</label>
// // // //                 <select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value as LeadEventType})}>
// // // //                   <option value="Wedding">Wedding</option>
// // // //                   <option value="Pre-wedding">Pre-wedding</option>
// // // //                   <option value="Maternity">Maternity</option>
// // // //                   <option value="Event Shoot">Event Shoot</option>
// // // //                   <option value="Other">Other</option>
// // // //                 </select>
// // // //               </div>
// // // //               <div className="form-group">
// // // //                 <label>Event Date</label>
// // // //                 <input 
// // // //                   type="date" 
// // // //                   value={form.eventDate} 
// // // //                   onChange={e => setForm({...form, eventDate: e.target.value})}
// // // //                 />
// // // //               </div>
// // // //               <div className="form-group">
// // // //                 <label>Location</label>
// // // //                 <div style={{ position: "relative" }}>
// // // //                   <MapPin size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
// // // //                   <input 
// // // //                     type="text" 
// // // //                     value={form.eventLocation} 
// // // //                     onChange={e => setForm({...form, eventLocation: e.target.value})}
// // // //                     placeholder="City / Venue"
// // // //                     style={{ paddingLeft: "36px" }}
// // // //                   />
// // // //                 </div>
// // // //               </div>
// // // //               <div className="form-group">
// // // //                 <label>Budget Range (₹)</label>
// // // //                 <div style={{ position: "relative" }}>
// // // //                   <IndianRupee size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
// // // //                   <input 
// // // //                     type="number" 
// // // //                     value={form.budget || ""} 
// // // //                     onChange={e => setForm({...form, budget: Number(e.target.value)})}
// // // //                     placeholder="0"
// // // //                     style={{ paddingLeft: "36px" }}
// // // //                   />
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           </FormSection>

// // // //           {/* Section: Status & Follow-up */}
// // // //           <FormSection title="Status & Tracking" icon={<Tag size={18} />}>
// // // //             <div style={{ display: "grid", gap: "1rem" }}>
// // // //               <div className="form-group">
// // // //                 <label>Lead Status</label>
// // // //                 <select value={form.status} onChange={e => setForm({...form, status: e.target.value as LeadStatus})}>
// // // //                   <option value="New">New Lead</option>
// // // //                   <option value="Contacted">Contacted</option>
// // // //                   <option value="Interested">Interested</option>
// // // //                   <option value="Negotiation">Negotiation</option>
// // // //                   <option value="Booked">Booked (Won)</option>
// // // //                   <option value="Lost">Lost</option>
// // // //                 </select>
// // // //               </div>
// // // //               <div className="form-group">
// // // //                 <label>Next Follow-up Date</label>
// // // //                 <div style={{ position: "relative" }}>
// // // //                   <Clock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
// // // //                   <input 
// // // //                     type="date" 
// // // //                     value={form.nextFollowUpDate} 
// // // //                     onChange={e => setForm({...form, nextFollowUpDate: e.target.value})}
// // // //                     style={{ paddingLeft: "36px" }}
// // // //                   />
// // // //                 </div>
// // // //               </div>
// // // //               <div className="form-group">
// // // //                 <label>Notes & Requirements</label>
// // // //                 <div style={{ position: "relative" }}>
// // // //                   <MessageSquare size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
// // // //                   <textarea 
// // // //                     value={form.notes} 
// // // //                     onChange={e => setForm({...form, notes: e.target.value})}
// // // //                     placeholder="Inquiry details, special requests, history..."
// // // //                     rows={4}
// // // //                     style={{ paddingLeft: "36px", paddingTop: "10px" }}
// // // //                   />
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           </FormSection>
// // // //         </div>

// // // //         {/* Action Buttons */}
// // // //         <div style={{ 
// // // //           display: "flex", 
// // // //           flexDirection: isMobile ? "column-reverse" : "row",
// // // //           justifyContent: "flex-end", 
// // // //           gap: "1rem", 
// // // //           marginTop: "2.5rem", 
// // // //           padding: "1.5rem 0", 
// // // //           borderTop: "1px solid var(--border)" 
// // // //         }}>
// // // //           <button type="button" className="btn" onClick={() => navigate("/dashboard/leads")} style={{ width: isMobile ? "100%" : "auto" }}>
// // // //             Cancel
// // // //           </button>
// // // //           <button type="submit" className="btn btn-primary" disabled={isPending} style={{ minWidth: isMobile ? "100%" : "160px" }}>
// // // //             <Save size={18} style={{ marginRight: "0.5rem" }} />
// // // //             {isPending ? "Saving..." : isEdit ? "Update Lead" : "Create Lead"}
// // // //           </button>
// // // //         </div>
// // // //       </form>
// // // //     </div>
// // // //   );
// // // // };

// // // // const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
// // // //   return (
// // // //     <div className="card" style={{ marginBottom: 0 }}>
// // // //       <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
// // // //         <span style={{ color: "var(--color-primary)" }}>{icon}</span>
// // // //         <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{title}</h2>
// // // //       </div>
// // // //       {children}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default LeadFormPage;




















// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   User,
// // //   Calendar,
// // //   MapPin,
// // //   IndianRupee,
// // //   Tag,
// // //   ArrowLeft,
// // //   Save,
// // //   ChevronRight,
// // //   Clock,
// // //   MessageSquare
// // // } from "lucide-react";
// // // import { useNavigate, useParams } from "react-router-dom";
// // // import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// // // import { createLead, getLeadById, updateLead, type LeadInput, type LeadStatus, type LeadSource, type LeadEventType } from "../api/lead";

// // // interface FormState {
// // //   clientName: string;
// // //   phoneNumber: string;
// // //   email: string;
// // //   source: LeadSource;
// // //   inquiryDate: string;
// // //   eventType: LeadEventType;
// // //   eventDate: string;
// // //   eventLocation: string;
// // //   budget: number;
// // //   status: LeadStatus;
// // //   notes: string;
// // //   nextFollowUpDate: string;
// // // }

// // // const EMPTY_FORM: FormState = {
// // //   clientName: "",
// // //   phoneNumber: "",
// // //   email: "",
// // //   source: "Other",
// // //   inquiryDate: new Date().toISOString().split('T')[0],
// // //   eventType: "Other",
// // //   eventDate: "",
// // //   eventLocation: "",
// // //   budget: 0,
// // //   status: "New",
// // //   notes: "",
// // //   nextFollowUpDate: "",
// // // };

// // // const useIsMobile = () => {
// // //   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

// // //   useEffect(() => {
// // //     const handleResize = () => {
// // //       setIsMobile(window.innerWidth < 768);
// // //     };
// // //     window.addEventListener("resize", handleResize);
// // //     return () => window.removeEventListener("resize", handleResize);
// // //   }, []);

// // //   return isMobile;
// // // };

// // // const LeadFormPage: React.FC = () => {
// // //   const isMobile = useIsMobile();
// // //   const { id } = useParams<{ id: string }>();
// // //   const isEdit = Boolean(id);
// // //   const navigate = useNavigate();
// // //   const queryClient = useQueryClient();
// // //   const [form, setForm] = useState<FormState>(EMPTY_FORM);

// // //   const { data: lead, isSuccess } = useQuery({
// // //     queryKey: ["lead", id],
// // //     queryFn: () => getLeadById(id!),
// // //     enabled: isEdit,
// // //   });

// // //   useEffect(() => {
// // //     if (isEdit && isSuccess && lead) {
// // //       setForm({
// // //         clientName: lead.clientName,
// // //         phoneNumber: lead.phoneNumber,
// // //         email: lead.email || "",
// // //         source: lead.source,
// // //         inquiryDate: lead.inquiryDate ? new Date(lead.inquiryDate).toISOString().split('T')[0] : "",
// // //         eventType: lead.eventType,
// // //         eventDate: lead.eventDate ? new Date(lead.eventDate).toISOString().split('T')[0] : "",
// // //         eventLocation: lead.eventLocation || "",
// // //         budget: lead.budget || 0,
// // //         status: lead.status,
// // //         notes: lead.notes || "",
// // //         nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : "",
// // //       });
// // //     }
// // //   }, [isEdit, isSuccess, lead]);

// // //   const createMutation = useMutation({
// // //     mutationFn: createLead,
// // //     onSuccess: () => {
// // //       queryClient.invalidateQueries({ queryKey: ["leads"] });
// // //       navigate("/dashboard/leads");
// // //     },
// // //   });

// // //   const updateMutation = useMutation({
// // //     mutationFn: (data: Partial<LeadInput>) => updateLead(id!, data),
// // //     onSuccess: () => {
// // //       queryClient.invalidateQueries({ queryKey: ["leads"] });
// // //       queryClient.invalidateQueries({ queryKey: ["lead", id] });
// // //       navigate("/dashboard/leads");
// // //     },
// // //   });

// // //   const handleSubmit = (e: React.FormEvent) => {
// // //     e.preventDefault();
// // //     if (isEdit) {
// // //       updateMutation.mutate(form);
// // //     } else {
// // //       createMutation.mutate(form);
// // //     }
// // //   };

// // //   const isPending = createMutation.isPending || updateMutation.isPending;

// // //   return (
// // //     <div style={{ maxWidth: "1000px", margin: "0 auto", padding: isMobile ? "1rem" : "1.5rem" }}>
// // //       {/* Header */}
// // //       <div style={{ marginBottom: "2rem" }}>
// // //         <button
// // //           onClick={() => navigate("/dashboard/leads")}
// // //           style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginBottom: "1rem", padding: 0 }}
// // //         >
// // //           <ArrowLeft size={16} /> Back to Leads
// // //         </button>
// // //         <div style={{
// // //           display: "flex",
// // //           flexDirection: "row",
// // //           alignItems: "center",
// // //           gap: "0.5rem",
// // //           fontSize: "0.85rem",
// // //           color: "var(--text-muted)",
// // //           marginBottom: "0.75rem"
// // //         }}>
// // //           <span>Leads</span>
// // //           <ChevronRight size={14} />
// // //           <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{isEdit ? "Edit Lead" : "New Lead"}</span>
// // //         </div>
// // //         <h1 style={{ fontSize: isMobile ? "1.5rem" : "1.75rem", fontWeight: 800 }}>{isEdit ? "Edit Lead Details" : "Create New Lead"}</h1>
// // //       </div>

// // //       <form onSubmit={handleSubmit}>
// // //         <div style={{
// // //           display: "grid",
// // //           gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
// // //           gap: "1.5rem"
// // //         }}>

// // //           {/* Section: Basic Info */}
// // //           <FormSection title="Basic Information" icon={<User size={18} />}>
// // //             <div style={{ display: "grid", gap: "1rem" }}>
// // //               <div className="form-group">
// // //                 <label>Client Name *</label>
// // //                 <input
// // //                   type="text"
// // //                   required
// // //                   value={form.clientName}
// // //                   onChange={e => setForm({ ...form, clientName: e.target.value })}
// // //                   placeholder="e.g. Rahul Gupta"
// // //                 />
// // //               </div>
// // //               <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
// // //                 <div className="form-group">
// // //                   <label>Phone Number *</label>
// // //                   <input
// // //                     type="text"
// // //                     required
// // //                     value={form.phoneNumber}
// // //                     onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
// // //                     placeholder="+91 9876543210"
// // //                   />
// // //                 </div>
// // //                 <div className="form-group">
// // //                   <label>Email Address</label>
// // //                   <input
// // //                     type="email"
// // //                     value={form.email}
// // //                     onChange={e => setForm({ ...form, email: e.target.value })}
// // //                     placeholder="example@mail.com"
// // //                   />
// // //                 </div>
// // //               </div>
// // //               <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
// // //                 <div className="form-group">
// // //                   <label>Lead Source</label>
// // //                   <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value as LeadSource })}>
// // //                     <option value="Instagram">Instagram</option>
// // //                     <option value="Website">Website</option>
// // //                     <option value="Referral">Referral</option>
// // //                     <option value="Ads">Ads</option>
// // //                     <option value="Other">Other</option>
// // //                   </select>
// // //                 </div>
// // //                 <div className="form-group">
// // //                   <label>Inquiry Date</label>
// // //                   <input
// // //                     type="date"
// // //                     value={form.inquiryDate}
// // //                     onChange={e => setForm({ ...form, inquiryDate: e.target.value })}
// // //                   />
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </FormSection>

// // //           {/* Section: Event Details */}
// // //           <FormSection title="Event Details" icon={<Calendar size={18} />}>
// // //             <div style={{ display: "grid", gap: "1rem" }}>
// // //               <div className="form-group">
// // //                 <label>Event Type</label>
// // //                 <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value as LeadEventType })}>
// // //                   <option value="Wedding">Wedding</option>
// // //                   <option value="Pre-wedding">Pre-wedding</option>
// // //                   <option value="Maternity">Maternity</option>
// // //                   <option value="Event Shoot">Event Shoot</option>
// // //                   <option value="Other">Other</option>
// // //                 </select>
// // //               </div>
// // //               <div className="form-group">
// // //                 <label>Event Date</label>
// // //                 <input
// // //                   type="date"
// // //                   value={form.eventDate}
// // //                   onChange={e => setForm({ ...form, eventDate: e.target.value })}
// // //                 />
// // //               </div>
// // //               <div className="form-group">
// // //                 <label>Location</label>
// // //                 <div style={{ position: "relative" }}>
// // //                   <MapPin size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
// // //                   <input
// // //                     type="text"
// // //                     value={form.eventLocation}
// // //                     onChange={e => setForm({ ...form, eventLocation: e.target.value })}
// // //                     placeholder="City / Venue"
// // //                     style={{ paddingLeft: "36px" }}
// // //                   />
// // //                 </div>
// // //               </div>
// // //               <div className="form-group">
// // //                 <label>Budget Range (₹)</label>
// // //                 <div style={{ position: "relative" }}>
// // //                   <IndianRupee size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
// // //                   <input
// // //                     type="number"
// // //                     value={form.budget || ""}
// // //                     onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
// // //                     placeholder="0"
// // //                     style={{ paddingLeft: "36px" }}
// // //                   />
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </FormSection>

// // //           {/* Section: Status & Follow-up */}
// // //           <FormSection title="Status & Tracking" icon={<Tag size={18} />}>
// // //             <div style={{ display: "grid", gap: "1rem" }}>
// // //               <div className="form-group">
// // //                 <label>Lead Status</label>
// // //                 <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LeadStatus })}>
// // //                   <option value="New">New Lead</option>
// // //                   <option value="Contacted">Contacted</option>
// // //                   <option value="Interested">Interested</option>
// // //                   <option value="Negotiation">Negotiation</option>
// // //                   <option value="Booked">Booked (Won)</option>
// // //                   <option value="Lost">Lost</option>
// // //                 </select>
// // //               </div>
// // //               <div className="form-group">
// // //                 <label>Next Follow-up Date</label>
// // //                 <div style={{ position: "relative" }}>
// // //                   <Clock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
// // //                   <input
// // //                     type="date"
// // //                     value={form.nextFollowUpDate}
// // //                     onChange={e => setForm({ ...form, nextFollowUpDate: e.target.value })}
// // //                     style={{ paddingLeft: "36px" }}
// // //                   />
// // //                 </div>
// // //               </div>
// // //               <div className="form-group">
// // //                 <label>Notes & Requirements</label>
// // //                 <div style={{ position: "relative" }}>
// // //                   <MessageSquare size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
// // //                   <textarea
// // //                     value={form.notes}
// // //                     onChange={e => setForm({ ...form, notes: e.target.value })}
// // //                     placeholder="Inquiry details, special requests, history..."
// // //                     rows={4}
// // //                     style={{ paddingLeft: "36px", paddingTop: "10px" }}
// // //                   />
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </FormSection>
// // //         </div>

// // //         {/* Action Buttons */}
// // //         <div style={{
// // //           display: "flex",
// // //           flexDirection: isMobile ? "column-reverse" : "row",
// // //           justifyContent: "flex-end",
// // //           gap: "1rem",
// // //           marginTop: "2.5rem",
// // //           padding: "1.5rem 0",
// // //           borderTop: "1px solid var(--border)"
// // //         }}>
// // //           <button type="button" className="btn" onClick={() => navigate("/dashboard/leads")} style={{ width: isMobile ? "100%" : "auto" }}>
// // //             Cancel
// // //           </button>
// // //           <button type="submit" className="btn btn-primary" disabled={isPending} style={{ minWidth: isMobile ? "100%" : "160px" }}>
// // //             <Save size={18} style={{ marginRight: "0.5rem" }} />
// // //             {isPending ? "Saving..." : isEdit ? "Update Lead" : "Create Lead"}
// // //           </button>
// // //         </div>
// // //       </form>
// // //     </div>
// // //   );
// // // };

// // // const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
// // //   return (
// // //     <div className="card" style={{ marginBottom: 0 }}>
// // //       <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
// // //         <span style={{ color: "var(--color-primary)" }}>{icon}</span>
// // //         <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{title}</h2>
// // //       </div>
// // //       {children}
// // //     </div>
// // //   );
// // // };

// // // export default LeadFormPage;



















// // import React, { useState, useEffect } from "react";
// // import {
// //   User,
// //   Calendar,
// //   MapPin,
// //   IndianRupee,
// //   Tag,
// //   ArrowLeft,
// //   Save,
// //   ChevronRight,
// //   Clock,
// //   MessageSquare,
// //   Phone,
// //   Mail,
// //   Globe,
// // } from "lucide-react";
// // import { useNavigate, useParams } from "react-router-dom";
// // import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// // import {
// //   createLead,
// //   getLeadById,
// //   updateLead,
// //   type LeadInput,
// //   type LeadStatus,
// //   type LeadSource,
// //   type LeadEventType,
// // } from "../api/lead";

// // interface FormState {
// //   clientName: string;
// //   phoneNumber: string;
// //   email: string;
// //   source: LeadSource;
// //   inquiryDate: string;
// //   eventType: LeadEventType;
// //   eventDate: string;
// //   eventLocation: string;
// //   budget: number;
// //   status: LeadStatus;
// //   notes: string;
// //   nextFollowUpDate: string;
// // }

// // const EMPTY_FORM: FormState = {
// //   clientName: "",
// //   phoneNumber: "",
// //   email: "",
// //   source: "Other",
// //   inquiryDate: new Date().toISOString().split("T")[0],
// //   eventType: "Other",
// //   eventDate: "",
// //   eventLocation: "",
// //   budget: 0,
// //   status: "New",
// //   notes: "",
// //   nextFollowUpDate: "",
// // };

// // const STATUS_COLORS: Record<string, string> = {
// //   New: "#3b82f6",
// //   Contacted: "#8b5cf6",
// //   Interested: "#f59e0b",
// //   Negotiation: "#ec4899",
// //   Booked: "#10b981",
// //   Lost: "#ef4444",
// // };

// // /* ─── Styles ──────────────────────────────────────────────────────────── */
// // const STYLES = `
// //   .form-root {
// //     max-width: 1040px;
// //     margin: 0 auto;
// //     padding: 1.5rem;
// //   }

// //   /* ── Header ── */
// //   .form-back-btn {
// //     display: inline-flex;
// //     align-items: center;
// //     gap: 6px;
// //     background: none;
// //     border: none;
// //     color: var(--text-muted);
// //     cursor: pointer;
// //     font-size: 0.85rem;
// //     padding: 0;
// //     margin-bottom: 1rem;
// //     transition: color 0.15s;
// //   }
// //   .form-back-btn:hover { color: var(--text-primary); }

// //   .form-breadcrumb {
// //     display: flex;
// //     align-items: center;
// //     gap: 6px;
// //     font-size: 0.8rem;
// //     color: var(--text-muted);
// //     margin-bottom: 0.6rem;
// //   }
// //   .form-breadcrumb .current {
// //     color: var(--text-primary);
// //     font-weight: 700;
// //   }

// //   .form-title {
// //     font-size: 1.7rem;
// //     font-weight: 800;
// //     letter-spacing: -0.5px;
// //     margin: 0 0 0.25rem;
// //   }
// //   .form-subtitle {
// //     font-size: 0.85rem;
// //     color: var(--text-muted);
// //     margin: 0 0 2rem;
// //   }

// //   /* ── Status pill row ── */
// //   .status-pill-row {
// //     display: flex;
// //     flex-wrap: wrap;
// //     gap: 8px;
// //     margin-bottom: 2rem;
// //   }
// //   .status-pill {
// //     padding: 7px 16px;
// //     border-radius: 20px;
// //     font-size: 0.8rem;
// //     font-weight: 700;
// //     cursor: pointer;
// //     border: 2px solid transparent;
// //     transition: all 0.15s ease;
// //     background: var(--bg-surface-2);
// //     color: var(--text-muted);
// //   }
// //   .status-pill.active {
// //     border-color: currentColor;
// //   }
// //   .status-pill-label {
// //     font-size: 0.7rem;
// //     color: var(--text-muted);
// //     font-weight: 600;
// //     margin-bottom: 0.5rem;
// //     text-transform: uppercase;
// //     letter-spacing: 0.5px;
// //   }

// //   /* ── Grid layout ── */
// //   .form-grid {
// //     display: grid;
// //     grid-template-columns: repeat(2, 1fr);
// //     gap: 1.25rem;
// //     margin-bottom: 1.25rem;
// //   }
// //   .form-grid-3 {
// //     display: grid;
// //     grid-template-columns: repeat(3, 1fr);
// //     gap: 1rem;
// //   }
// //   .form-grid-2 {
// //     display: grid;
// //     grid-template-columns: 1fr 1fr;
// //     gap: 1rem;
// //   }
// //   .col-span-2 { grid-column: span 2; }

// //   /* ── Card section ── */
// //   .form-card {
// //     background: var(--bg-surface);
// //     border: 1px solid var(--border);
// //     border-radius: 16px;
// //     padding: 1.5rem;
// //     margin-bottom: 0;
// //   }
// //   .form-card-header {
// //     display: flex;
// //     align-items: center;
// //     gap: 10px;
// //     margin-bottom: 1.25rem;
// //     padding-bottom: 0.9rem;
// //     border-bottom: 1px solid var(--border);
// //   }
// //   .form-card-icon {
// //     width: 34px;
// //     height: 34px;
// //     border-radius: 9px;
// //     background: var(--color-primary-light);
// //     display: flex;
// //     align-items: center;
// //     justify-content: center;
// //     color: var(--color-primary);
// //     flex-shrink: 0;
// //   }
// //   .form-card-header h2 {
// //     font-size: 1rem;
// //     font-weight: 700;
// //     margin: 0;
// //   }

// //   /* ── Form fields ── */
// //   .form-field {
// //     display: flex;
// //     flex-direction: column;
// //     gap: 6px;
// //   }
// //   .form-field label {
// //     font-size: 0.78rem;
// //     font-weight: 700;
// //     color: var(--text-muted);
// //     text-transform: uppercase;
// //     letter-spacing: 0.5px;
// //   }
// //   .field-wrap {
// //     position: relative;
// //   }
// //   .field-wrap .field-icon {
// //     position: absolute;
// //     left: 12px;
// //     top: 50%;
// //     transform: translateY(-50%);
// //     color: var(--text-muted);
// //     pointer-events: none;
// //   }
// //   .field-wrap input,
// //   .field-wrap select,
// //   .field-wrap textarea {
// //     padding-left: 38px !important;
// //   }
// //   .field-wrap.textarea-wrap .field-icon {
// //     top: 14px;
// //     transform: none;
// //   }
// //   .form-field input,
// //   .form-field select,
// //   .form-field textarea {
// //     background: var(--bg-surface-2);
// //     border: 1px solid var(--border);
// //     border-radius: 10px;
// //     color: var(--text-primary);
// //     font-size: 0.875rem;
// //     padding: 11px 14px;
// //     outline: none;
// //     width: 100%;
// //     box-sizing: border-box;
// //     transition: border-color 0.15s, box-shadow 0.15s;
// //     font-family: inherit;
// //   }
// //   .form-field input:focus,
// //   .form-field select:focus,
// //   .form-field textarea:focus {
// //     border-color: var(--color-primary);
// //     box-shadow: 0 0 0 3px var(--color-primary-light);
// //   }
// //   .form-field textarea { resize: vertical; min-height: 110px; padding-top: 12px; }
// //   .form-field select { cursor: pointer; }

// //   /* ── Footer actions ── */
// //   .form-footer {
// //     display: flex;
// //     justify-content: flex-end;
// //     align-items: center;
// //     gap: 1rem;
// //     padding-top: 1.5rem;
// //     margin-top: 1rem;
// //     border-top: 1px solid var(--border);
// //     flex-wrap: wrap;
// //   }
// //   .btn-cancel {
// //     padding: 10px 24px;
// //     border-radius: 10px;
// //     font-size: 0.875rem;
// //     font-weight: 600;
// //     background: var(--bg-surface-2);
// //     border: 1px solid var(--border);
// //     color: var(--text-secondary);
// //     cursor: pointer;
// //     transition: background 0.15s;
// //   }
// //   .btn-cancel:hover { background: var(--bg-surface-3); }
// //   .btn-save {
// //     display: flex;
// //     align-items: center;
// //     gap: 8px;
// //     padding: 10px 28px;
// //     border-radius: 10px;
// //     font-size: 0.9rem;
// //     font-weight: 700;
// //     background: var(--color-primary);
// //     color: #fff;
// //     border: none;
// //     cursor: pointer;
// //     transition: opacity 0.15s, transform 0.15s;
// //     box-shadow: 0 3px 12px rgba(139,92,246,0.35);
// //     min-width: 160px;
// //     justify-content: center;
// //   }
// //   .btn-save:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
// //   .btn-save:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

// //   /* ── Responsive ── */
// //   @media (max-width: 900px) {
// //     .form-grid { grid-template-columns: 1fr; }
// //     .col-span-2 { grid-column: span 1; }
// //   }
// //   @media (max-width: 600px) {
// //     .form-root { padding: 1rem; }
// //     .form-title { font-size: 1.35rem; }
// //     .form-grid-2 { grid-template-columns: 1fr; }
// //     .form-grid-3 { grid-template-columns: 1fr 1fr; }
// //     .form-footer { flex-direction: column-reverse; }
// //     .btn-cancel, .btn-save { width: 100%; }
// //     .status-pill { padding: 6px 12px; font-size: 0.75rem; }
// //   }
// //   @media (max-width: 400px) {
// //     .form-grid-3 { grid-template-columns: 1fr; }
// //   }

// //   .custom-input-fade {
// //     animation: fadeIn 0.3s ease-out;
// //   }
// //   @keyframes fadeIn {
// //     from { opacity: 0; transform: translateY(-5px); }
// //     to { opacity: 1; transform: translateY(0); }
// //   }
// // `;

// // /* ─── Component ──────────────────────────────────────────────────────── */
// // const STANDARD_EVENT_TYPES = ["Wedding", "Pre-wedding", "Maternity", "Event Shoot"];
// // const STANDARD_SOURCES = ["Instagram", "Website", "Referral", "Ads"];

// // const LeadFormPage: React.FC = () => {
// //   const { id } = useParams<{ id: string }>();
// //   const isEdit = Boolean(id);
// //   const navigate = useNavigate();
// //   const queryClient = useQueryClient();
// //   const [form, setForm] = useState<FormState>(EMPTY_FORM);

// //   // Custom "Other" states
// //   const [isCustomEvent, setIsCustomEvent] = useState(form.eventType === "Other");
// //   const [customEventName, setCustomEventName] = useState("");
// //   const [isCustomSource, setIsCustomSource] = useState(form.source === "Other");
// //   const [customSourceName, setCustomSourceName] = useState("");

// //   const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

// //   const { data: lead, isSuccess } = useQuery({
// //     queryKey: ["lead", id],
// //     queryFn: () => getLeadById(id!),
// //     enabled: isEdit,
// //   });

// //   useEffect(() => {
// //     if (isEdit && isSuccess && lead) {
// //       const isStdEvent = STANDARD_EVENT_TYPES.includes(lead.eventType);
// //       const isStdSource = STANDARD_SOURCES.includes(lead.source);

// //       set({
// //         clientName: lead.clientName,
// //         phoneNumber: lead.phoneNumber,
// //         email: lead.email || "",
// //         source: isStdSource ? lead.source : "Other",
// //         inquiryDate: lead.inquiryDate
// //           ? new Date(lead.inquiryDate).toISOString().split("T")[0]
// //           : "",
// //         eventType: isStdEvent ? lead.eventType : "Other",
// //         eventDate: lead.eventDate
// //           ? new Date(lead.eventDate).toISOString().split("T")[0]
// //           : "",
// //         eventLocation: lead.eventLocation || "",
// //         budget: lead.budget || 0,
// //         status: lead.status,
// //         notes: lead.notes || "",
// //         nextFollowUpDate: lead.nextFollowUpDate
// //           ? new Date(lead.nextFollowUpDate).toISOString().split("T")[0]
// //           : "",
// //       });

// //       if (!isStdEvent) {
// //         setIsCustomEvent(true);
// //         setCustomEventName(lead.eventType);
// //       }
// //       if (!isStdSource) {
// //         setIsCustomSource(true);
// //         setCustomSourceName(lead.source);
// //       }
// //     }
// //   }, [isEdit, isSuccess, lead]);

// //   const createMutation = useMutation({
// //     mutationFn: createLead,
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["leads"] });
// //       navigate("/dashboard/leads");
// //     },
// //   });

// //   const updateMutation = useMutation({
// //     mutationFn: (data: Partial<LeadInput>) => updateLead(id!, data),
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["leads"] });
// //       queryClient.invalidateQueries({ queryKey: ["lead", id] });
// //       navigate("/dashboard/leads");
// //     },
// //   });

// //   const handleSubmit = (e: React.FormEvent) => {
// //     e.preventDefault();

// //     // Prepare payload with custom values if needed
// //     const payload = {
// //       ...form,
// //       eventType: isCustomEvent ? customEventName : form.eventType,
// //       source: isCustomSource ? customSourceName : form.source,
// //     };

// //     isEdit ? updateMutation.mutate(payload) : createMutation.mutate(payload);
// //   };

// //   const isPending = createMutation.isPending || updateMutation.isPending;
// //   const statuses: LeadStatus[] = ["New", "Contacted", "Interested", "Negotiation", "Booked", "Lost"];

// //   return (
// //     <>
// //       <style>{STYLES}</style>
// //       <div className="form-root">

// //         {/* ── Header ── */}
// //         <button className="form-back-btn" onClick={() => navigate("/dashboard/leads")}>
// //           <ArrowLeft size={15} /> Back to Leads
// //         </button>

// //         <div className="form-breadcrumb">
// //           <span>Leads</span>
// //           <ChevronRight size={13} />
// //           <span className="current">{isEdit ? "Edit Lead" : "New Lead"}</span>
// //         </div>

// //         <h1 className="form-title">
// //           {isEdit ? "Edit Lead Details" : "Create New Lead"}
// //         </h1>
// //         <p className="form-subtitle">
// //           {isEdit
// //             ? "Update the lead information and track progress."
// //             : "Fill in the details to add a new lead to your pipeline."}
// //         </p>

// //         <form onSubmit={handleSubmit}>

// //           {/* ── Status quick-select ── */}
// //           <div style={{ marginBottom: "1.75rem" }}>
// //             <div className="status-pill-label">Lead Status</div>
// //             <div className="status-pill-row">
// //               {statuses.map((s) => (
// //                 <button
// //                   key={s}
// //                   type="button"
// //                   className={`status-pill${form.status === s ? " active" : ""}`}
// //                   style={{
// //                     color: form.status === s ? STATUS_COLORS[s] : undefined,
// //                     borderColor: form.status === s ? STATUS_COLORS[s] : "transparent",
// //                     background:
// //                       form.status === s
// //                         ? `${STATUS_COLORS[s]}18`
// //                         : "var(--bg-surface-2)",
// //                   }}
// //                   onClick={() => set({ status: s })}
// //                 >
// //                   {s}
// //                 </button>
// //               ))}
// //             </div>
// //           </div>

// //           {/* ── Two-column grid ── */}
// //           <div className="form-grid">

// //             {/* ── Card: Basic Info ── */}
// //             <div className="form-card">
// //               <div className="form-card-header">
// //                 <div className="form-card-icon"><User size={16} /></div>
// //                 <h2>Basic Information</h2>
// //               </div>

// //               <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
// //                 <div className="form-field">
// //                   <label>Client Name *</label>
// //                   <div className="field-wrap">
// //                     <User size={14} className="field-icon" />
// //                     <input
// //                       type="text"
// //                       required
// //                       value={form.clientName}
// //                       onChange={(e) => set({ clientName: e.target.value })}
// //                       placeholder="e.g. Rahul Gupta"
// //                     />
// //                   </div>
// //                 </div>

// //                 <div className="form-grid-2">
// //                   <div className="form-field">
// //                     <label>Phone Number *</label>
// //                     <div className="field-wrap">
// //                       <Phone size={14} className="field-icon" />
// //                       <input
// //                         type="text"
// //                         required
// //                         value={form.phoneNumber}
// //                         onChange={(e) => set({ phoneNumber: e.target.value })}
// //                         placeholder="+91 9876543210"
// //                       />
// //                     </div>
// //                   </div>
// //                   <div className="form-field">
// //                     <label>Email Address</label>
// //                     <div className="field-wrap">
// //                       <Mail size={14} className="field-icon" />
// //                       <input
// //                         type="email"
// //                         value={form.email}
// //                         onChange={(e) => set({ email: e.target.value })}
// //                         placeholder="example@mail.com"
// //                       />
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="form-grid-2">
// //                 <div className="form-field">
// //                   <label>Lead Source</label>
// //                   <div className="status-pill-row" style={{ marginTop: "4px" }}>
// //                     {STANDARD_SOURCES.map((s) => (
// //                       <button
// //                         key={s}
// //                         type="button"
// //                         className={`status-pill${form.source === s && !isCustomSource ? " active" : ""}`}
// //                         style={{
// //                           color: form.source === s && !isCustomSource ? "var(--color-primary)" : undefined,
// //                           borderColor: form.source === s && !isCustomSource ? "var(--color-primary)" : "transparent",
// //                           background: form.source === s && !isCustomSource ? "var(--color-primary-light)" : "var(--bg-surface-2)",
// //                         }}
// //                         onClick={() => {
// //                           set({ source: s as LeadSource });
// //                           setIsCustomSource(false);
// //                         }}
// //                       >
// //                         {s}
// //                       </button>
// //                     ))}
// //                     <button
// //                       type="button"
// //                       className={`status-pill${isCustomSource ? " active" : ""}`}
// //                       style={{
// //                         color: isCustomSource ? "var(--color-primary)" : undefined,
// //                         borderColor: isCustomSource ? "var(--color-primary)" : "transparent",
// //                         background: isCustomSource ? "var(--color-primary-light)" : "var(--bg-surface-2)",
// //                       }}
// //                       onClick={() => {
// //                         set({ source: "Other" });
// //                         setIsCustomSource(true);
// //                       }}
// //                     >
// //                       Other
// //                     </button>
// //                   </div>
// //                 </div>
// //                   {isCustomSource && (
// //                     <div className="form-field custom-input-fade">
// //                       <label>Specify Source Name</label>
// //                       <div className="field-wrap">
// //                         <Globe size={14} className="field-icon" />
// //                         <input
// //                           type="text"
// //                           required
// //                           autoFocus
// //                           value={customSourceName}
// //                           onChange={(e) => setCustomSourceName(e.target.value)}
// //                           placeholder="e.g. Newspaper, Friend, etc."
// //                         />
// //                       </div>
// //                     </div>
// //                   )}
// //                   <div className="form-field">
// //                     <label>Inquiry Date</label>
// //                     <div className="field-wrap">
// //                       <Calendar size={14} className="field-icon" />
// //                       <input
// //                         type="date"
// //                         value={form.inquiryDate}
// //                         onChange={(e) => set({ inquiryDate: e.target.value })}
// //                       />
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* ── Card: Event Details ── */}
// //             <div className="form-card">
// //               <div className="form-card-header">
// //                 <div className="form-card-icon"><Calendar size={16} /></div>
// //                 <h2>Event Details</h2>
// //               </div>

// //               <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
// //                 <div className="form-grid-2">
// //                 <div className="form-field">
// //                   <label>Event Type</label>
// //                   <div className="status-pill-row" style={{ marginTop: "4px" }}>
// //                     {STANDARD_EVENT_TYPES.map((t) => (
// //                       <button
// //                         key={t}
// //                         type="button"
// //                         className={`status-pill${form.eventType === t && !isCustomEvent ? " active" : ""}`}
// //                         style={{
// //                           color: form.eventType === t && !isCustomEvent ? "var(--color-primary)" : undefined,
// //                           borderColor: form.eventType === t && !isCustomEvent ? "var(--color-primary)" : "transparent",
// //                           background: form.eventType === t && !isCustomEvent ? "var(--color-primary-light)" : "var(--bg-surface-2)",
// //                         }}
// //                         onClick={() => {
// //                           set({ eventType: t as LeadEventType });
// //                           setIsCustomEvent(false);
// //                         }}
// //                       >
// //                         {t}
// //                       </button>
// //                     ))}
// //                     <button
// //                       type="button"
// //                       className={`status-pill${isCustomEvent ? " active" : ""}`}
// //                       style={{
// //                         color: isCustomEvent ? "var(--color-primary)" : undefined,
// //                         borderColor: isCustomEvent ? "var(--color-primary)" : "transparent",
// //                         background: isCustomEvent ? "var(--color-primary-light)" : "var(--bg-surface-2)",
// //                       }}
// //                       onClick={() => {
// //                         set({ eventType: "Other" });
// //                         setIsCustomEvent(true);
// //                       }}
// //                     >
// //                       Other
// //                     </button>
// //                   </div>
// //                 </div>
// //                   {isCustomEvent && (
// //                     <div className="form-field custom-input-fade">
// //                       <label>Specify Event Name</label>
// //                       <div className="field-wrap">
// //                         <Tag size={14} className="field-icon" />
// //                         <input
// //                           type="text"
// //                           required
// //                           autoFocus
// //                           value={customEventName}
// //                           onChange={(e) => setCustomEventName(e.target.value)}
// //                           placeholder="e.g. Birthday, Gala, etc."
// //                         />
// //                       </div>
// //                     </div>
// //                   )}
// //                   <div className="form-field">
// //                     <label>Event Date</label>
// //                     <div className="field-wrap">
// //                       <Calendar size={14} className="field-icon" />
// //                       <input
// //                         type="date"
// //                         value={form.eventDate}
// //                         onChange={(e) => set({ eventDate: e.target.value })}
// //                       />
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="form-field">
// //                   <label>Location / Venue</label>
// //                   <div className="field-wrap">
// //                     <MapPin size={14} className="field-icon" />
// //                     <input
// //                       type="text"
// //                       value={form.eventLocation}
// //                       onChange={(e) => set({ eventLocation: e.target.value })}
// //                       placeholder="City / Venue name"
// //                     />
// //                   </div>
// //                 </div>

// //                 <div className="form-field">
// //                   <label>Budget (₹)</label>
// //                   <div className="field-wrap">
// //                     <IndianRupee size={14} className="field-icon" />
// //                     <input
// //                       type="number"
// //                       value={form.budget || ""}
// //                       onChange={(e) => set({ budget: Number(e.target.value) })}
// //                       placeholder="0"
// //                     />
// //                   </div>
// //                 </div>

// //                 <div className="form-field">
// //                   <label>Next Follow-up Date</label>
// //                   <div className="field-wrap">
// //                     <Clock size={14} className="field-icon" />
// //                     <input
// //                       type="date"
// //                       value={form.nextFollowUpDate}
// //                       onChange={(e) => set({ nextFollowUpDate: e.target.value })}
// //                     />
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* ── Card: Notes — full width ── */}
// //             <div className="form-card col-span-2">
// //               <div className="form-card-header">
// //                 <div className="form-card-icon"><MessageSquare size={16} /></div>
// //                 <h2>Notes &amp; Requirements</h2>
// //               </div>
// //               <div className="form-field">
// //                 <label>Additional Notes</label>
// //                 <div className="field-wrap textarea-wrap">
// //                   <MessageSquare size={14} className="field-icon" />
// //                   <textarea
// //                     value={form.notes}
// //                     onChange={(e) => set({ notes: e.target.value })}
// //                     placeholder="Inquiry details, special requests, follow-up history…"
// //                     rows={5}
// //                   />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* ── Footer ── */}
// //           <div className="form-footer">
// //             <button
// //               type="button"
// //               className="btn-cancel"
// //               onClick={() => navigate("/dashboard/leads")}
// //             >
// //               Cancel
// //             </button>
// //             <button type="submit" className="btn-save" disabled={isPending}>
// //               <Save size={16} />
// //               {isPending ? "Saving…" : isEdit ? "Update Lead" : "Create Lead"}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </>
// //   );
// // };

// // export default LeadFormPage;

















// import React, { useState, useEffect } from "react";
// import {
//   User,
//   Calendar,
//   MapPin,
//   IndianRupee,
//   Tag,
//   ArrowLeft,
//   Save,
//   ChevronRight,
//   Clock,
//   MessageSquare,
//   Phone,
//   Mail,
//   Globe,
// } from "lucide-react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   createLead,
//   getLeadById,
//   updateLead,
//   type LeadInput,
//   type LeadStatus,
//   type LeadSource,
//   type LeadEventType,
// } from "../api/lead";

// interface FormState {
//   clientName: string;
//   phoneNumber: string;
//   email: string;
//   source: LeadSource;
//   inquiryDate: string;
//   eventType: LeadEventType;
//   eventDate: string;
//   eventLocation: string;
//   budget: number;
//   status: LeadStatus;
//   notes: string;
//   nextFollowUpDate: string;
// }

// const EMPTY_FORM: FormState = {
//   clientName: "",
//   phoneNumber: "",
//   email: "",
//   source: "Other",
//   inquiryDate: new Date().toISOString().split("T")[0],
//   eventType: "Other",
//   eventDate: "",
//   eventLocation: "",
//   budget: 0,
//   status: "New",
//   notes: "",
//   nextFollowUpDate: "",
// };

// /* ─── Styles ──────────────────────────────────────────────────────────── */
// const STYLES = `
//   .form-root {
//     max-width: 1040px;
//     margin: 0 auto;
//     padding: 1.5rem;
//   }

//   /* ── Header ── */
//   .form-back-btn {
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//     background: none;
//     border: none;
//     color: var(--text-muted);
//     cursor: pointer;
//     font-size: 0.85rem;
//     padding: 0;
//     margin-bottom: 1rem;
//     transition: color 0.15s;
//   }
//   .form-back-btn:hover { color: var(--text-primary); }

//   .form-breadcrumb {
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     font-size: 0.8rem;
//     color: var(--text-muted);
//     margin-bottom: 0.6rem;
//   }
//   .form-breadcrumb .current {
//     color: var(--text-primary);
//     font-weight: 700;
//   }

//   .form-title {
//     font-size: 1.7rem;
//     font-weight: 800;
//     letter-spacing: -0.5px;
//     margin: 0 0 0.25rem;
//   }
//   .form-subtitle {
//     font-size: 0.85rem;
//     color: var(--text-muted);
//     margin: 0 0 2rem;
//   }

//   /* ── Grid layout ── */
//   .form-grid {
//     display: grid;
//     grid-template-columns: repeat(2, 1fr);
//     gap: 1.25rem;
//     margin-bottom: 1.25rem;
//   }
//   .form-grid-2 {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 1rem;
//   }
//   .col-span-2 { grid-column: span 2; }

//   /* ── Card section ── */
//   .form-card {
//     background: var(--bg-surface);
//     border: 1px solid var(--border);
//     border-radius: 16px;
//     padding: 1.5rem;
//     margin-bottom: 0;
//   }
//   .form-card-header {
//     display: flex;
//     align-items: center;
//     gap: 10px;
//     margin-bottom: 1.25rem;
//     padding-bottom: 0.9rem;
//     border-bottom: 1px solid var(--border);
//   }
//   .form-card-icon {
//     width: 34px;
//     height: 34px;
//     border-radius: 9px;
//     background: var(--color-primary-light);
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     color: var(--color-primary);
//     flex-shrink: 0;
//   }
//   .form-card-header h2 {
//     font-size: 1rem;
//     font-weight: 700;
//     margin: 0;
//   }

//   /* ── Form fields ── */
//   .form-field {
//     display: flex;
//     flex-direction: column;
//     gap: 6px;
//   }
//   .form-field label {
//     font-size: 0.78rem;
//     font-weight: 700;
//     color: var(--text-muted);
//     text-transform: uppercase;
//     letter-spacing: 0.5px;
//   }
//   .field-wrap {
//     position: relative;
//   }
//   .field-wrap .field-icon {
//     position: absolute;
//     left: 12px;
//     top: 50%;
//     transform: translateY(-50%);
//     color: var(--text-muted);
//     pointer-events: none;
//     z-index: 1;
//   }
//   .field-wrap input,
//   .field-wrap select,
//   .field-wrap textarea {
//     padding-left: 38px !important;
//   }
//   .field-wrap.textarea-wrap .field-icon {
//     top: 14px;
//     transform: none;
//   }
//   .form-field input,
//   .form-field select,
//   .form-field textarea {
//     background: var(--bg-surface-2);
//     border: 1px solid var(--border);
//     border-radius: 10px;
//     color: var(--text-primary);
//     font-size: 0.875rem;
//     padding: 11px 14px;
//     outline: none;
//     width: 100%;
//     box-sizing: border-box;
//     transition: border-color 0.15s, box-shadow 0.15s;
//     font-family: inherit;
//     appearance: none;
//     -webkit-appearance: none;
//   }
//   .form-field input:focus,
//   .form-field select:focus,
//   .form-field textarea:focus {
//     border-color: var(--color-primary);
//     box-shadow: 0 0 0 3px var(--color-primary-light);
//   }
//   .form-field textarea { resize: vertical; min-height: 110px; padding-top: 12px; }
//   .form-field select { cursor: pointer; }

//   /* Custom select arrow */
//   .select-wrap {
//     position: relative;
//   }
//   .select-wrap::after {
//     content: "";
//     position: absolute;
//     right: 14px;
//     top: 50%;
//     transform: translateY(-50%);
//     width: 0;
//     height: 0;
//     border-left: 5px solid transparent;
//     border-right: 5px solid transparent;
//     border-top: 5px solid var(--text-muted);
//     pointer-events: none;
//   }
//   .select-wrap select {
//     padding-right: 36px !important;
//   }
//   .select-wrap.has-icon select {
//     padding-left: 38px !important;
//   }
//   .select-wrap .field-icon {
//     position: absolute;
//     left: 12px;
//     top: 50%;
//     transform: translateY(-50%);
//     color: var(--text-muted);
//     pointer-events: none;
//     z-index: 1;
//   }

//   /* ── Footer actions ── */
//   .form-footer {
//     display: flex;
//     justify-content: flex-end;
//     align-items: center;
//     gap: 1rem;
//     padding-top: 1.5rem;
//     margin-top: 1rem;
//     border-top: 1px solid var(--border);
//     flex-wrap: wrap;
//   }
//   .btn-cancel {
//     padding: 10px 24px;
//     border-radius: 10px;
//     font-size: 0.875rem;
//     font-weight: 600;
//     background: var(--bg-surface-2);
//     border: 1px solid var(--border);
//     color: var(--text-secondary);
//     cursor: pointer;
//     transition: background 0.15s;
//   }
//   .btn-cancel:hover { background: var(--bg-surface-3); }
//   .btn-save {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     padding: 10px 28px;
//     border-radius: 10px;
//     font-size: 0.9rem;
//     font-weight: 700;
//     background: var(--color-primary);
//     color: #fff;
//     border: none;
//     cursor: pointer;
//     transition: opacity 0.15s, transform 0.15s;
//     box-shadow: 0 3px 12px rgba(139,92,246,0.35);
//     min-width: 160px;
//     justify-content: center;
//   }
//   .btn-save:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
//   .btn-save:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

//   /* ── Responsive ── */
//   @media (max-width: 900px) {
//     .form-grid { grid-template-columns: 1fr; }
//     .col-span-2 { grid-column: span 1; }
//   }
//   @media (max-width: 600px) {
//     .form-root { padding: 1rem; }
//     .form-title { font-size: 1.35rem; }
//     .form-grid-2 { grid-template-columns: 1fr; }
//     .form-footer { flex-direction: column-reverse; }
//     .btn-cancel, .btn-save { width: 100%; }
//   }

//   .custom-input-fade {
//     animation: fadeIn 0.25s ease-out;
//   }
//   @keyframes fadeIn {
//     from { opacity: 0; transform: translateY(-4px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
// `;

// /* ─── Constants ──────────────────────────────────────────────────────── */
// const STANDARD_EVENT_TYPES = ["Wedding", "Pre-wedding", "Maternity", "Event Shoot"];
// const STANDARD_SOURCES = ["Instagram", "Website", "Referral", "Ads"];

// /* ─── Component ──────────────────────────────────────────────────────── */
// const LeadFormPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const isEdit = Boolean(id);
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [form, setForm] = useState<FormState>(EMPTY_FORM);

//   // Custom "Other" states
//   const [isCustomEvent, setIsCustomEvent] = useState(false);
//   const [customEventName, setCustomEventName] = useState("");
//   const [isCustomSource, setIsCustomSource] = useState(false);
//   const [customSourceName, setCustomSourceName] = useState("");

//   const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

//   const { data: lead, isSuccess } = useQuery({
//     queryKey: ["lead", id],
//     queryFn: () => getLeadById(id!),
//     enabled: isEdit,
//   });

//   useEffect(() => {
//     if (isEdit && isSuccess && lead) {
//       const isStdEvent = STANDARD_EVENT_TYPES.includes(lead.eventType);
//       const isStdSource = STANDARD_SOURCES.includes(lead.source);

//       set({
//         clientName: lead.clientName,
//         phoneNumber: lead.phoneNumber,
//         email: lead.email || "",
//         source: isStdSource ? lead.source : "Other",
//         inquiryDate: lead.inquiryDate ? new Date(lead.inquiryDate).toISOString().split("T")[0] : "",
//         eventType: isStdEvent ? lead.eventType : "Other",
//         eventDate: lead.eventDate ? new Date(lead.eventDate).toISOString().split("T")[0] : "",
//         eventLocation: lead.eventLocation || "",
//         budget: lead.budget || 0,
//         status: lead.status,
//         notes: lead.notes || "",
//         nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split("T")[0] : "",
//       });

//       if (!isStdEvent) { setIsCustomEvent(true); setCustomEventName(lead.eventType); }
//       if (!isStdSource) { setIsCustomSource(true); setCustomSourceName(lead.source); }
//     }
//   }, [isEdit, isSuccess, lead]);

//   const createMutation = useMutation({
//     mutationFn: createLead,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["leads"] });
//       navigate("/dashboard/leads");
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: (data: Partial<LeadInput>) => updateLead(id!, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["leads"] });
//       queryClient.invalidateQueries({ queryKey: ["lead", id] });
//       navigate("/dashboard/leads");
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const payload = {
//       ...form,
//       eventType: isCustomEvent ? (customEventName as LeadEventType) : form.eventType,
//       source: isCustomSource ? (customSourceName as LeadSource) : form.source,
//     };
//     isEdit ? updateMutation.mutate(payload) : createMutation.mutate(payload);
//   };

//   const isPending = createMutation.isPending || updateMutation.isPending;

//   /* Handle event type select change */
//   const handleEventTypeChange = (val: string) => {
//     if (val === "Other") {
//       setIsCustomEvent(true);
//       set({ eventType: "Other" });
//     } else {
//       setIsCustomEvent(false);
//       setCustomEventName("");
//       set({ eventType: val as LeadEventType });
//     }
//   };

//   /* Handle lead source select change */
//   const handleSourceChange = (val: string) => {
//     if (val === "Other") {
//       setIsCustomSource(true);
//       set({ source: "Other" });
//     } else {
//       setIsCustomSource(false);
//       setCustomSourceName("");
//       set({ source: val as LeadSource });
//     }
//   };

//   return (
//     <>
//       <style>{STYLES}</style>
//       <div className="form-root">

//         {/* ── Header ── */}
//         <button className="form-back-btn" onClick={() => navigate("/dashboard/leads")}>
//           <ArrowLeft size={15} /> Back to Leads
//         </button>

//         <div className="form-breadcrumb">
//           <span>Leads</span>
//           <ChevronRight size={13} />
//           <span className="current">{isEdit ? "Edit Lead" : "New Lead"}</span>
//         </div>

//         <h1 className="form-title">
//           {isEdit ? "Edit Lead Details" : "Create New Lead"}
//         </h1>
//         <p className="form-subtitle">
//           {isEdit
//             ? "Update the lead information and track progress."
//             : "Fill in the details to add a new lead to your pipeline."}
//         </p>

//         <form onSubmit={handleSubmit}>
//           <div className="form-grid">

//             {/* ── Card: Basic Info ── */}
//             <div className="form-card">
//               <div className="form-card-header">
//                 <div className="form-card-icon"><User size={16} /></div>
//                 <h2>Basic Information</h2>
//               </div>

//               <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//                 {/* Client Name */}
//                 <div className="form-field">
//                   <label>Client Name *</label>
//                   <div className="field-wrap">
//                     <User size={14} className="field-icon" />
//                     <input
//                       type="text"
//                       required
//                       value={form.clientName}
//                       onChange={(e) => set({ clientName: e.target.value })}
//                       placeholder="e.g. Rahul Gupta"
//                     />
//                   </div>
//                 </div>

//                 {/* Phone + Email */}
//                 <div className="form-grid-2">
//                   <div className="form-field">
//                     <label>Phone Number *</label>
//                     <div className="field-wrap">
//                       <Phone size={14} className="field-icon" />
//                       <input
//                         type="text"
//                         required
//                         value={form.phoneNumber}
//                         onChange={(e) => set({ phoneNumber: e.target.value })}
//                         placeholder="+91 9876543210"
//                       />
//                     </div>
//                   </div>
//                   <div className="form-field">
//                     <label>Email Address</label>
//                     <div className="field-wrap">
//                       <Mail size={14} className="field-icon" />
//                       <input
//                         type="email"
//                         value={form.email}
//                         onChange={(e) => set({ email: e.target.value })}
//                         placeholder="example@mail.com"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Lead Source dropdown */}
//                 <div className="form-grid-2">
//                   <div className="form-field">
//                     <label>Lead Source</label>
//                     <div className="select-wrap has-icon">
//                       <Globe size={14} className="field-icon" />
//                       <select
//                         value={isCustomSource ? "Other" : form.source}
//                         onChange={(e) => handleSourceChange(e.target.value)}
//                       >
//                         {STANDARD_SOURCES.map((s) => (
//                           <option key={s} value={s}>{s}</option>
//                         ))}
//                         <option value="Other">Other</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Custom source name (only when "Other" selected) */}
//                   {isCustomSource ? (
//                     <div className="form-field custom-input-fade">
//                       <label>Specify Source</label>
//                       <div className="field-wrap">
//                         <Globe size={14} className="field-icon" />
//                         <input
//                           type="text"
//                           required
//                           autoFocus
//                           value={customSourceName}
//                           onChange={(e) => setCustomSourceName(e.target.value)}
//                           placeholder="e.g. Newspaper, Friend…"
//                         />
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="form-field">
//                       <label>Inquiry Date</label>
//                       <div className="field-wrap">
//                         <Calendar size={14} className="field-icon" />
//                         <input
//                           type="date"
//                           value={form.inquiryDate}
//                           onChange={(e) => set({ inquiryDate: e.target.value })}
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Show inquiry date below when custom source is visible */}
//                 {isCustomSource && (
//                   <div className="form-field">
//                     <label>Inquiry Date</label>
//                     <div className="field-wrap">
//                       <Calendar size={14} className="field-icon" />
//                       <input
//                         type="date"
//                         value={form.inquiryDate}
//                         onChange={(e) => set({ inquiryDate: e.target.value })}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* ── Card: Event Details ── */}
//             <div className="form-card">
//               <div className="form-card-header">
//                 <div className="form-card-icon"><Calendar size={16} /></div>
//                 <h2>Event Details</h2>
//               </div>

//               <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//                 {/* Event Type + Event Date */}
//                 <div className="form-grid-2">
//                   <div className="form-field">
//                     <label>Event Type</label>
//                     <div className="select-wrap has-icon">
//                       <Tag size={14} className="field-icon" />
//                       <select
//                         value={isCustomEvent ? "Other" : form.eventType}
//                         onChange={(e) => handleEventTypeChange(e.target.value)}
//                       >
//                         {STANDARD_EVENT_TYPES.map((t) => (
//                           <option key={t} value={t}>{t}</option>
//                         ))}
//                         <option value="Other">Other</option>
//                       </select>
//                     </div>
//                   </div>
//                   <div className="form-field">
//                     <label>Event Date</label>
//                     <div className="field-wrap">
//                       <Calendar size={14} className="field-icon" />
//                       <input
//                         type="date"
//                         value={form.eventDate}
//                         onChange={(e) => set({ eventDate: e.target.value })}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Custom event type name */}
//                 {isCustomEvent && (
//                   <div className="form-field custom-input-fade">
//                     <label>Specify Event Name</label>
//                     <div className="field-wrap">
//                       <Tag size={14} className="field-icon" />
//                       <input
//                         type="text"
//                         required
//                         autoFocus
//                         value={customEventName}
//                         onChange={(e) => setCustomEventName(e.target.value)}
//                         placeholder="e.g. Birthday, Gala…"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* Lead Status dropdown — moved here from top */}
//                 <div className="form-field">
//                   <label>Lead Status</label>
//                   <div className="select-wrap has-icon">
//                     <Tag size={14} className="field-icon" />
//                     <select
//                       value={form.status}
//                       onChange={(e) => set({ status: e.target.value as LeadStatus })}
//                     >
//                       <option value="New">New Lead</option>
//                       <option value="Contacted">Contacted</option>
//                       <option value="Interested">Interested</option>
//                       <option value="Negotiation">Negotiation</option>
//                       <option value="Booked">Booked (Won)</option>
//                       <option value="Lost">Lost</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Location */}
//                 <div className="form-field">
//                   <label>Location / Venue</label>
//                   <div className="field-wrap">
//                     <MapPin size={14} className="field-icon" />
//                     <input
//                       type="text"
//                       value={form.eventLocation}
//                       onChange={(e) => set({ eventLocation: e.target.value })}
//                       placeholder="City / Venue name"
//                     />
//                   </div>
//                 </div>

//                 {/* Budget + Follow-up */}
//                 <div className="form-grid-2">
//                   <div className="form-field">
//                     <label>Budget (₹)</label>
//                     <div className="field-wrap">
//                       <IndianRupee size={14} className="field-icon" />
//                       <input
//                         type="number"
//                         value={form.budget || ""}
//                         onChange={(e) => set({ budget: Number(e.target.value) })}
//                         placeholder="0"
//                       />
//                     </div>
//                   </div>
//                   <div className="form-field">
//                     <label>Next Follow-up Date</label>
//                     <div className="field-wrap">
//                       <Clock size={14} className="field-icon" />
//                       <input
//                         type="date"
//                         value={form.nextFollowUpDate}
//                         onChange={(e) => set({ nextFollowUpDate: e.target.value })}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ── Card: Notes — full width ── */}
//             <div className="form-card col-span-2">
//               <div className="form-card-header">
//                 <div className="form-card-icon"><MessageSquare size={16} /></div>
//                 <h2>Notes &amp; Requirements</h2>
//               </div>
//               <div className="form-field">
//                 <label>Additional Notes</label>
//                 <div className="field-wrap textarea-wrap">
//                   <MessageSquare size={14} className="field-icon" />
//                   <textarea
//                     value={form.notes}
//                     onChange={(e) => set({ notes: e.target.value })}
//                     placeholder="Inquiry details, special requests, follow-up history…"
//                     rows={5}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── Footer ── */}
//           <div className="form-footer">
//             <button
//               type="button"
//               className="btn-cancel"
//               onClick={() => navigate("/dashboard/leads")}
//             >
//               Cancel
//             </button>
//             <button type="submit" className="btn-save" disabled={isPending}>
//               <Save size={16} />
//               {isPending ? "Saving…" : isEdit ? "Update Lead" : "Create Lead"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// };

// export default LeadFormPage;

































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
  Phone,
  Mail,
  Globe,
  History as HistoryIcon,
  X
} from "lucide-react";
import { saveFormHistory, getFormHistory, saveFieldHistory } from "../utils/formHistory";
import AutocompleteInput from "../components/AutocompleteInput";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLead,
  getLeadById,
  updateLead,
  type LeadInput,
  type LeadStatus,
  type LeadSource,
  type LeadEventType,
} from "../api/lead";

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
  nextFollowUpDate: string;
}

const EMPTY_FORM: FormState = {
  clientName: "",
  phoneNumber: "",
  email: "",
  source: "Instagram",       // start on a real value so onChange fires when "Other" is picked
  inquiryDate: new Date().toISOString().split("T")[0],
  eventType: "Wedding",      // start on a real value so onChange fires when "Other" is picked
  eventDate: "",
  eventLocation: "",
  budget: 0,
  status: "New",
  notes: "",
  nextFollowUpDate: "",
};

/* ─── Styles ──────────────────────────────────────────────────────────── */
const STYLES = `
  .form-root {
    max-width: 1040px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  /* ── Header ── */
  .form-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0;
    margin-bottom: 1rem;
    transition: color 0.15s;
  }
  .form-back-btn:hover { color: var(--text-primary); }

  .form-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: 0.6rem;
  }
  .form-breadcrumb .current {
    color: var(--text-primary);
    font-weight: 700;
  }

  .form-title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin: 0 0 0.25rem;
  }
  .form-subtitle {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0 0 2rem;
  }

  /* ── Grid layout ── */
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }
  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .col-span-2 { grid-column: span 2; }

  /* ── Card section ── */
  .form-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 0;
  }
  .form-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1.25rem;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid var(--border);
  }
  .form-card-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: var(--color-primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    flex-shrink: 0;
  }
  .form-card-header h2 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
  }

  /* ── Form fields ── */
  .form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-field label {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .field-wrap {
    position: relative;
  }
  .field-wrap .field-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    z-index: 1;
  }
  .field-wrap input,
  .field-wrap select,
  .field-wrap textarea {
    padding-left: 38px !important;
  }
  .field-wrap.textarea-wrap .field-icon {
    top: 14px;
    transform: none;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    background: var(--bg-surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-primary);
    font-size: 0.875rem;
    padding: 11px 14px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: inherit;
    appearance: none;
    -webkit-appearance: none;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }
  .form-field textarea { resize: vertical; min-height: 110px; padding-top: 12px; }
  .form-field select { cursor: pointer; }

  /* Custom select arrow */
  .select-wrap {
    position: relative;
  }
  .select-wrap::after {
    content: "";
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid var(--text-muted);
    pointer-events: none;
  }
  .select-wrap select {
    padding-right: 36px !important;
  }
  .select-wrap.has-icon select {
    padding-left: 38px !important;
  }
  .select-wrap .field-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    z-index: 1;
  }

  /* ── Footer actions ── */
  .form-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    padding-top: 1.5rem;
    margin-top: 1rem;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .btn-cancel {
    padding: 10px 24px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    background: var(--bg-surface-2);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-cancel:hover { background: var(--bg-surface-3); }
  .btn-save {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 28px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    background: var(--color-primary);
    color: #fff;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
    box-shadow: 0 3px 12px rgba(139,92,246,0.35);
    min-width: 160px;
    justify-content: center;
  }
  .btn-save:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-save:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .form-grid { grid-template-columns: 1fr; }
    .col-span-2 { grid-column: span 1; }
  }
  @media (max-width: 600px) {
    .form-root { padding: 1rem; }
    .form-title { font-size: 1.35rem; }
    .form-grid-2 { grid-template-columns: 1fr; }
    .form-footer { flex-direction: column-reverse; }
    .btn-cancel, .btn-save { width: 100%; }
  }

  .custom-input-fade {
    animation: fadeIn 0.25s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── Constants ──────────────────────────────────────────────────────── */
const STANDARD_EVENT_TYPES = ["Wedding", "Pre-wedding", "Maternity", "Event Shoot"];
const STANDARD_SOURCES = ["Instagram", "Linkdin", "Referral", "Ads"];

/* ─── Component ──────────────────────────────────────────────────────── */
const LeadFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Custom "Other" states
  const [isCustomEvent, setIsCustomEvent] = useState(false);
  const [customEventName, setCustomEventName] = useState("");
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [customSourceName, setCustomSourceName] = useState("");

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const { data: lead, isSuccess } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && isSuccess && lead) {
      const isStdEvent = STANDARD_EVENT_TYPES.includes(lead.eventType);
      const isStdSource = STANDARD_SOURCES.includes(lead.source);

      set({
        clientName: lead.clientName,
        phoneNumber: lead.phoneNumber,
        email: lead.email || "",
        source: isStdSource ? lead.source : "Other",
        inquiryDate: lead.inquiryDate ? new Date(lead.inquiryDate).toISOString().split("T")[0] : "",
        eventType: isStdEvent ? lead.eventType : "Other",
        eventDate: lead.eventDate ? new Date(lead.eventDate).toISOString().split("T")[0] : "",
        eventLocation: lead.eventLocation || "",
        budget: lead.budget || 0,
        status: lead.status,
        notes: lead.notes || "",
        nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split("T")[0] : "",
      });

      if (!isStdEvent) { setIsCustomEvent(true); setCustomEventName(lead.eventType); }
      if (!isStdSource) { setIsCustomSource(true); setCustomSourceName(lead.source); }
    }
  }, [isEdit, isSuccess, lead]);

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      // Save to history
      const historyData = {
        clientName: form.clientName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        source: isCustomSource ? customSourceName : form.source,
        eventType: isCustomEvent ? customEventName : form.eventType,
        eventLocation: form.eventLocation,
        budget: form.budget,
      };
      saveFormHistory("lead", historyData);

      // Save individual fields history
      saveFieldHistory("lead", "clientName", form.clientName);
      saveFieldHistory("lead", "phoneNumber", form.phoneNumber);
      saveFieldHistory("lead", "email", form.email);
      saveFieldHistory("lead", "source", historyData.source);
      saveFieldHistory("lead", "eventType", historyData.eventType);

      queryClient.invalidateQueries({ queryKey: ["leads"] });
      navigate("/dashboard/leads");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<LeadInput>) => updateLead(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      navigate("/dashboard/leads");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Strip empty/placeholder items from array if any (none in Leads yet, but good for future)
    
    const payload = {
      ...form,
      eventType: isCustomEvent ? (customEventName as LeadEventType) : form.eventType,
      source: isCustomSource ? (customSourceName as LeadSource) : form.source,
    };
    isEdit ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const [backupState, setBackupState] = useState<FormState | null>(null);

  const handleLoadHistory = () => {
    const history = getFormHistory("lead");
    if (history) {
      setBackupState({ ...form });
      set({
        clientName: history.clientName,
        phoneNumber: history.phoneNumber,
        email: history.email,
        eventLocation: history.eventLocation,
        budget: history.budget,
      });

      // Handle source
      const isStdSource = STANDARD_SOURCES.includes(history.source);
      if (isStdSource) {
        set({ source: history.source as LeadSource });
        setIsCustomSource(false);
        setCustomSourceName("");
      } else {
        set({ source: "Other" });
        setIsCustomSource(true);
        setCustomSourceName(history.source);
      }

      // Handle event type
      const isStdEvent = STANDARD_EVENT_TYPES.includes(history.eventType);
      if (isStdEvent) {
        set({ eventType: history.eventType as LeadEventType });
        setIsCustomEvent(false);
        setCustomEventName("");
      } else {
        set({ eventType: "Other" });
        setIsCustomEvent(true);
        setCustomEventName(history.eventType);
      }
    }
  };

  const handleUndoHistory = () => {
    if (backupState) {
      setForm(backupState);
      setBackupState(null);
    }
  };

  const hasHistory = !isEdit && !!getFormHistory("lead");

  /* Handle event type select change */
  const handleEventTypeChange = (val: string) => {
    if (val === "Other") {
      setIsCustomEvent(true);
      set({ eventType: "Other" });
    } else {
      setIsCustomEvent(false);
      setCustomEventName("");
      set({ eventType: val as LeadEventType });
    }
  };

  /* Handle lead source select change */
  const handleSourceChange = (val: string) => {
    if (val === "Other") {
      setIsCustomSource(true);
      set({ source: "Other" });
    } else {
      setIsCustomSource(false);
      setCustomSourceName("");
      set({ source: val as LeadSource });
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="form-root">

        {/* ── Header ── */}
        <button className="form-back-btn" onClick={() => navigate("/dashboard/leads")}>
          <ArrowLeft size={15} /> Back to Leads
        </button>

        <div className="form-breadcrumb">
          <span>Leads</span>
          <ChevronRight size={13} />
          <span className="current">{isEdit ? "Edit Lead" : "New Lead"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
          <div>
            <h1 className="form-title">
              {isEdit ? "Edit Lead Details" : "Create New Lead"}
            </h1>
            <p className="form-subtitle" style={{ marginBottom: 0 }}>
              {isEdit
                ? "Update the lead information and track progress."
                : "Fill in the details to add a new lead to your pipeline."}
            </p>
          </div>
          {hasHistory && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {backupState && (
                <button
                  type="button"
                  onClick={handleUndoHistory}
                  className="btn-cancel"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    borderColor: "var(--color-danger-light)",
                    color: "var(--color-danger)",
                    fontWeight: 700,
                    padding: "8px 16px",
                    height: "fit-content"
                  }}
                  title="Restore before fill"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={handleLoadHistory}
                className="btn-cancel"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  padding: "8px 16px",
                  height: "fit-content"
                }}
              >
                <HistoryIcon size={16} />
                Fill from Last Submission
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* ── Card: Basic Info ── */}
            <div className="form-card">
              <div className="form-card-header">
                <div className="form-card-icon"><User size={16} /></div>
                <h2>Basic Information</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Client Name */}
                <div className="form-field">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label>Client Name *</label>
                  </div>
                  <div className="field-wrap">
                    <User size={14} className="field-icon" style={{ zIndex: 10 }} />
                    <AutocompleteInput 
                      model="lead" 
                      field="clientName" 
                      required 
                      value={form.clientName} 
                      onChange={(v: string) => set({ clientName: v })} 
                      placeholder="e.g. Rahul Gupta" 
                      style={{ width: "100%" }}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label>Phone Number *</label>
                    </div>
                    <div className="field-wrap">
                      <Phone size={14} className="field-icon" style={{ zIndex: 10 }} />
                      <AutocompleteInput 
                        model="lead" 
                        field="phoneNumber" 
                        required 
                        value={form.phoneNumber} 
                        onChange={(v: string) => set({ phoneNumber: v })} 
                        placeholder="+91 9876543210" 
                        style={{ width: "100%" }}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label>Email Address</label>
                    </div>
                    <div className="field-wrap">
                      <Mail size={14} className="field-icon" style={{ zIndex: 10 }} />
                      <AutocompleteInput 
                        model="lead" 
                        field="email" 
                        value={form.email || ""} 
                        onChange={(v: string) => set({ email: v })} 
                        placeholder="example@mail.com" 
                        style={{ width: "100%" }}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Lead Source dropdown */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Lead Source</label>
                    <div className="select-wrap has-icon">
                      <Globe size={14} className="field-icon" />
                      <select
                        value={isCustomSource ? "Other" : form.source}
                        onChange={(e) => handleSourceChange(e.target.value)}
                      >
                        {STANDARD_SOURCES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/* Inline custom input appears right below the dropdown */}
                    {isCustomSource && (
                      <div className="field-wrap custom-input-fade" style={{ marginTop: "8px" }}>
                        <Globe size={14} className="field-icon" style={{ zIndex: 10 }} />
                        <AutocompleteInput 
                          model="lead" 
                          field="source" 
                          required 
                          value={customSourceName} 
                          onChange={(v: string) => setCustomSourceName(v)} 
                          placeholder="e.g. Newspaper, Friend…" 
                          style={{ width: "100%" }}
                          className="pl-9"
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-field">
                    <label>Inquiry Date</label>
                    <div className="field-wrap">
                      <Calendar size={14} className="field-icon" />
                      <input
                        type="date"
                        value={form.inquiryDate}
                        onChange={(e) => set({ inquiryDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card: Event Details ── */}
            <div className="form-card">
              <div className="form-card-header">
                <div className="form-card-icon"><Calendar size={16} /></div>
                <h2>Event Details</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Event Type + Event Date */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Event Type</label>
                    <div className="select-wrap has-icon">
                      <Tag size={14} className="field-icon" />
                      <select
                        value={isCustomEvent ? "Other" : form.eventType}
                        onChange={(e) => handleEventTypeChange(e.target.value)}
                      >
                        {STANDARD_EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/* Inline custom input appears right below the dropdown */}
                    {isCustomEvent && (
                      <div className="field-wrap custom-input-fade" style={{ marginTop: "8px" }}>
                        <Tag size={14} className="field-icon" style={{ zIndex: 10 }} />
                        <AutocompleteInput 
                          model="lead" 
                          field="eventType" 
                          required 
                          value={customEventName} 
                          onChange={(v: string) => setCustomEventName(v)} 
                          placeholder="e.g. Birthday, Gala…" 
                          style={{ width: "100%" }}
                          className="pl-9"
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>Event Date</label>
                    <div className="field-wrap">
                      <Calendar size={14} className="field-icon" />
                      <input
                        type="date"
                        value={form.eventDate}
                        onChange={(e) => set({ eventDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Lead Status dropdown — moved here from top */}
                <div className="form-field">
                  <label>Lead Status</label>
                  <div className="select-wrap has-icon">
                    <Tag size={14} className="field-icon" />
                    <select
                      value={form.status}
                      onChange={(e) => set({ status: e.target.value as LeadStatus })}
                    >
                      <option value="New">New Lead</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Interested">Interested</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Booked">Booked (Won)</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="form-field">
                  <label>Location / Venue</label>
                  <div className="field-wrap">
                    <MapPin size={14} className="field-icon" style={{ zIndex: 10 }} />
                    <AutocompleteInput 
                      model="lead" 
                      field="eventLocation" 
                      value={form.eventLocation || ""} 
                      onChange={(v: string) => set({ eventLocation: v })} 
                      placeholder="City / Venue name" 
                      style={{ width: "100%" }}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Budget + Follow-up */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Budget (₹)</label>
                    <div className="field-wrap">
                      <IndianRupee size={14} className="field-icon" />
                      <input
                        type="number"
                        value={form.budget || ""}
                        onChange={(e) => set({ budget: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Next Follow-up Date</label>
                    <div className="field-wrap">
                      <Clock size={14} className="field-icon" />
                      <input
                        type="date"
                        value={form.nextFollowUpDate}
                        onChange={(e) => set({ nextFollowUpDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card: Notes — full width ── */}
            <div className="form-card col-span-2">
              <div className="form-card-header">
                <div className="form-card-icon"><MessageSquare size={16} /></div>
                <h2>Notes &amp; Requirements</h2>
              </div>
              <div className="form-field">
                <label>Additional Notes</label>
                <div className="field-wrap textarea-wrap">
                  <MessageSquare size={14} className="field-icon" />
                  <textarea
                    value={form.notes}
                    onChange={(e) => set({ notes: e.target.value })}
                    placeholder="Inquiry details, special requests, follow-up history…"
                    rows={5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="form-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/dashboard/leads")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isPending}>
              <Save size={16} />
              {isPending ? "Saving…" : isEdit ? "Update Lead" : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LeadFormPage;