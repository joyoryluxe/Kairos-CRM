import mongoose, { Document, Schema } from 'mongoose';

export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Negotiation' | 'Booked' | 'Lost';
export type LeadSource = 'Instagram' | 'Linkdin' | 'Referral' | 'Ads' | 'Other' | string;
export type LeadEventType = 'Wedding' | 'Pre-wedding' | 'Maternity' | 'Event Shoot' | 'Other' | string;

export interface ILead extends Document {
  // Basic Info
  clientName: string;
  phoneNumber: string;
  email?: string;
  source: LeadSource;
  inquiryDate: Date;

  // Event Details
  eventType: LeadEventType;
  eventDate?: Date;
  eventLocation?: string;
  budget?: number;

  // Status Tracking
  status: LeadStatus;
  
  // Notes & Communication
  notes: string;
  lastContactedDate?: Date;
  nextFollowUpDate?: Date;

  // Google Calendar
  googleCalendarEventId?: string;

  // Ownership
  user: mongoose.Types.ObjectId;
}

const LeadSchema: Schema = new Schema(
  {
    clientName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    source: {
      type: String,
      default: 'Other',
    },
    inquiryDate: { type: Date, default: Date.now },

    eventType: {
      type: String,
      default: 'Other',
    },
    eventDate: { type: Date },
    eventLocation: { type: String, trim: true },
    budget: { type: Number, min: 0 },

    status: {
      type: String,
      enum: ['New', 'Contacted', 'Interested', 'Negotiation', 'Booked', 'Lost'],
      default: 'New',
    },

    notes: { type: String, default: '' },
    lastContactedDate: { type: Date },
    nextFollowUpDate: { type: Date },
    googleCalendarEventId: { type: String },

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for faster lookups
LeadSchema.index({ user: 1, status: 1 });
LeadSchema.index({ phoneNumber: 1 });

export default mongoose.model<ILead>('Lead', LeadSchema);
