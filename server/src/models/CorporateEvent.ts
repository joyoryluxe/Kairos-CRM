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

export interface ICorporateEvent extends Document {
  clientName: string;
  phoneNumber: string;
  email?: string;
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
  packagePrice: number;
  total: number;
  extrasTotal: number;
  advance: number;
  balance: number;
  expenses: number;
  profit: number;
  extras: IExtra[];
  payments: IPayment[];
  notes?: string;
  referenceByName?: string;
  googleCalendarEventId?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

// ─── Sub-Schemas ──────────────────────────────────────────────────────────────
const ExtraSchema = new Schema<IExtra>(
  {
    description: { type: String, default: '' },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const CorporateEventSchema = new Schema<ICorporateEvent>(
  {
    clientName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    eventName: { type: String, trim: true },
    eventDateAndTime: { type: Date },
    deliveryDeadline: { type: Date },
    package: { type: String, trim: true },
    packagePrice: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0 },
    extrasTotal: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    expenses: { type: Number, default: 0, min: 0 },
    profit: { type: Number, default: 0 },
    extras: { type: [ExtraSchema], default: [] },
    payments: { type: [PaymentSchema], default: [] },
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
CorporateEventSchema.pre('save', async function (next) {
  // 1. If a package is selected but price is 0, auto-fill its base price from DB
  if (this.package && (this.packagePrice === 0 || this.isModified('package'))) {
    const pkg = await Package.findOne({ name: this.package, category: 'Corporate', isActive: true });
    if (pkg) {
      this.packagePrice = pkg.price;
    }
  }

  // 2. Calculate extrasTotal
  this.extrasTotal = this.extras.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  // 3. Assume total is packagePrice + extrasTotal
  this.total = this.packagePrice + this.extrasTotal;

  // 4. Calculate advance (sum of payments)
  this.advance = this.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // 5. Calculate balance
  this.balance = this.total - this.advance;

  // 6. Calculate profit
  this.profit = this.total - (this.expenses || 0);

  next();
});

// ─── Also run calculations on findByIdAndUpdate ────────────────────────────────
CorporateEventSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (!update) return next();

  const packageName = update.package ?? update['$set']?.package;
  let packagePrice = update.packagePrice ?? update['$set']?.packagePrice ?? 0;
  
  // If package is changed but price is not set, look it up
  if (packageName && packagePrice === 0) {
    const pkg = await Package.findOne({ name: packageName, category: 'Corporate', isActive: true });
    if (pkg) {
      packagePrice = pkg.price;
    }
  }

  const extras = update.extras ?? update['$set']?.extras ?? [];
  const payments = update.payments ?? update['$set']?.payments ?? [];
  
  const extrasTotal = extras.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
  const advance = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  
  const total = packagePrice + extrasTotal;
  const balance = total - advance;
  
  const expenses = update.expenses ?? update['$set']?.expenses ?? 0;
  const profit = total - expenses;
  
  this.setUpdate({
    ...update,
    $set: {
      ...(update['$set'] || {}),
      packagePrice,
      extrasTotal,
      advance,
      total,
      balance,
      profit
    },
  });

  next();
});

export default mongoose.model<ICorporateEvent>('CorporateEvent', CorporateEventSchema);
