import mongoose, { Document, Schema } from 'mongoose';
import Package from './Package';

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
  email?: string;
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
  profit: number;

  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  googleCalendarEventId?: string;
  notes?: string;
}

// ─── Schema ────────────────────────────────────────────────────────────────────
const ExtraSchema = new Schema<IExtra>(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const InfluencerSchema = new Schema<IInfluencer>(
  {
    clientName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    instaId: { type: String, trim: true },
    referredBy: { type: String, trim: true },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    shootName: { type: String, trim: true },
    shootDateAndTime: { type: Date },
    deliveryDeadline: { type: Date },

    // ── Package & Pricing
    package: { type: String, trim: true },
    packagePrice: { type: Number, default: 0, min: 0 },

    extras: { type: [ExtraSchema], default: [] },
    extrasTotal: { type: Number, default: 0, min: 0 },

    expenses: { type: Number, default: 0, min: 0 },

    payments: { type: [PaymentSchema], default: [] },
    advance: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    balance: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },

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
InfluencerSchema.pre('save', async function (next) {
  // 1. If a package is selected but price is 0, auto-fill its base price from DB
  if (this.package && (this.packagePrice === 0 || this.isModified('package'))) {
    const pkg = await Package.findOne({ name: this.package, category: 'Influencer', isActive: true });
    if (pkg) {
      this.packagePrice = pkg.price;
    }
  }

  this.extrasTotal = this.extras.reduce((sum, e) => sum + e.amount, 0);
  this.total = this.packagePrice + this.extrasTotal;
  this.advance = this.payments.reduce((sum, p) => sum + p.amount, 0);
  this.balance = this.total - this.advance;
  this.profit = this.total - (this.expenses || 0);

  next();
});

// ─── Also run calculations on findOneAndUpdate ────────────────────────────────
InfluencerSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (!update) return next();

  const packageName = update.package ?? update['$set']?.package;
  let packagePrice = update.packagePrice ?? update['$set']?.packagePrice ?? 0;

  // Resolve packagePrice: prefer explicitly sent value, fall back to DB lookup
  if (packageName && packagePrice === 0) {
    const pkg = await Package.findOne({ name: packageName, category: 'Influencer', isActive: true });
    if (pkg) {
      packagePrice = pkg.price;
    }
  }

  const extras = update.extras ?? update['$set']?.extras ?? [];
  const payments = update.payments ?? update['$set']?.payments ?? [];

  const extrasTotal = extras.reduce((sum: number, e: IExtra) => sum + e.amount, 0);
  const total = packagePrice + extrasTotal;
  const advance = payments.reduce((sum: number, p: IPayment) => sum + p.amount, 0);
  const balance = total - advance;

  const expenses = update.expenses ?? update['$set']?.expenses ?? 0;
  const profit = total - expenses;

  this.setUpdate({
    ...update,
    $set: {
      ...(update['$set'] || {}),
      packagePrice,
      extrasTotal,
      total,
      advance,
      balance,
      profit
    },
  });

  next();
});

export default mongoose.model<IInfluencer>('Influencer', InfluencerSchema);