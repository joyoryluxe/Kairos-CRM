import mongoose, { Document, Schema } from 'mongoose';

// ─── Package Definitions ───────────────────────────────────────────────────────
export const INFLUENCER_PACKAGES: Record<string, number> = {
  'Basic Collab': 3000,
  'Standard Reel': 7500,
  'Premium Campaign': 15000,
  'Brand Ambassador': 30000,
};

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface IExtra {
  description: string;
  amount: number;
}

export interface IPayment {
  amount: number;
  date: Date;
  note?: string;
}

export interface IInfluencer extends Document {
  clientName: string;
  phoneNumber: string;
  instaId?: string;
  referredBy?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shootName?: string;
  shootDateAndTime?: Date;
  deliveryDeadline?: Date;
  
  package?: string;
  packagePrice: number;
  
  extras: IExtra[];
  extrasTotal: number;
  
  expenses: number;
  
  payments: IPayment[];
  advance: number;
  total: number;
  balance: number;
  
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  googleCalendarEventId?: string;
  notes?: string;
}

// ─── Schema ────────────────────────────────────────────────────────────────────
const ExtraSchema = new Schema<IExtra>(
  {
    description: { type: String, required: true },
    amount:      { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true, min: 0 },
    date:   { type: Date, default: Date.now },
    note:   { type: String },
  },
  { _id: false }
);

const InfluencerSchema = new Schema<IInfluencer>(
  {
    clientName:  { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    instaId:     { type: String, trim: true },
    referredBy:  { type: String, trim: true },
    address: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    shootName:        { type: String, trim: true },
    shootDateAndTime: { type: Date },
    deliveryDeadline: { type: Date },
    
    package:      { type: String, enum: Object.keys(INFLUENCER_PACKAGES) },
    packagePrice: { type: Number, default: 0, min: 0 },
    
    extras:      { type: [ExtraSchema], default: [] },
    extrasTotal: { type: Number, default: 0, min: 0 },
    
    expenses: { type: Number, default: 0, min: 0 },
    
    payments: { type: [PaymentSchema], default: [] },
    advance:  { type: Number, default: 0, min: 0 },
    total:    { type: Number, default: 0, min: 0 },
    balance:  { type: Number, default: 0 },
    
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    googleCalendarEventId: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// ─── Auto-Calculate Before Save ────────────────────────────────────────────────
InfluencerSchema.pre('save', function (next) {
  if (this.package && INFLUENCER_PACKAGES[this.package] !== undefined) {
    this.packagePrice = INFLUENCER_PACKAGES[this.package];
  }
  this.extrasTotal = this.extras.reduce((sum, e) => sum + e.amount, 0);
  this.total = this.packagePrice + this.extrasTotal;
  this.advance = this.payments.reduce((sum, p) => sum + p.amount, 0);
  this.balance = this.total - this.advance;
  
  if (this.status !== 'Cancelled' && this.status !== 'Completed') {
    if (this.advance === 0) {
      this.status = 'Pending';
    } else if (this.balance <= 0) {
      this.status = 'Completed';
    } else {
      this.status = 'Confirmed';
    }
  }
  next();
});

// ─── Also run calculations on findByIdAndUpdate ────────────────────────────────
InfluencerSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (!update) return next();

  const packageName  = update.package      ?? update['$set']?.package;
  const extras       = update.extras       ?? update['$set']?.extras       ?? [];
  const payments     = update.payments     ?? update['$set']?.payments     ?? [];

  let packagePrice = 0;
  if (packageName && INFLUENCER_PACKAGES[packageName] !== undefined) {
    packagePrice = INFLUENCER_PACKAGES[packageName];
  } else {
    packagePrice = update.packagePrice ?? update['$set']?.packagePrice ?? 0;
  }

  const extrasTotal = extras.reduce((sum: number, e: IExtra) => sum + e.amount, 0);
  const total       = packagePrice + extrasTotal;
  const advance     = payments.reduce((sum: number, p: IPayment) => sum + p.amount, 0);
  const balance     = total - advance;

  this.setUpdate({
    ...update,
    $set: {
      ...(update['$set'] || {}),
      packagePrice,
      extrasTotal,
      total,
      advance,
      balance,
    },
  });

  next();
});

export default mongoose.model<IInfluencer>('Influencer', InfluencerSchema);
