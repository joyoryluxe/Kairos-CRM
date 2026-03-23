import mongoose, { Document, Schema } from 'mongoose';

export interface ICorporateEvent extends Document {
  clientName: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  eventName?: string;
  eventDateAndTime?: Date;
  deliveryDeadline?: Date;
  package?: string;
  total?: number;
  advance?: number;
  expenses?: number;
  extras?: Array<{ description: string; amount: number }>;
  payments?: Array<{ amount: number; date: Date; note?: string }>;
  notes?: string;
  referenceByName?: string;
  googleCalendarEventId?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

const CorporateEventSchema: Schema = new Schema(
  {
    clientName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    eventName: { type: String },
    eventDateAndTime: { type: Date },
    deliveryDeadline: { type: Date },
    package: { type: String },
    total: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    extras: [
      {
        description: { type: String, default: '' },
        amount: { type: Number, default: 0 },
      }
    ],
    payments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        note: { type: String, default: '' },
      }
    ],
    notes: { type: String, default: '' },
    referenceByName: { type: String },
    googleCalendarEventId: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// ─── Auto-Calculate Before Save ────────────────────────────────────────────────
CorporateEventSchema.pre('save', function (next) {
  const self = this as any;
  const total = self.total || 0;
  const advance = self.advance || 0;
  const balance = total - advance;

  if (self.status !== 'Cancelled' && self.status !== 'Completed') {
    if (advance === 0) {
      self.status = 'Pending';
    } else if (balance <= 0) {
      self.status = 'Completed';
    } else {
      self.status = 'Confirmed';
    }
  }
  next();
});

export default mongoose.model<ICorporateEvent>('CorporateEvent', CorporateEventSchema);
