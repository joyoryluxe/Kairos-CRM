import mongoose, { Document, Schema } from 'mongoose';
import Package from './Package';

export type EditType = string;
export type EditStatus = 'Pending' | 'In Progress' | 'Done' | 'Delivered';
export type EditPriority = 'Low' | 'Medium' | 'High';

export interface IExtra {
  description: string;
  amount: number;
}

export interface IPayment {
  amount: number;
  date: Date;
  note?: string;
}

export interface IEdit extends Document {
  title: string;
  type: EditType;
  clientName: string;
  status: EditStatus;
  priority: EditPriority;
  receivedDate: Date;
  deadline: Date;
  notes?: string;
  photoClipCount: number;
  
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

  googleCalendarEventId?: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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

const EditSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Done', 'Delivered'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    receivedDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    notes: { type: String, default: '' },
    photoClipCount: { type: Number, required: true, default: 0 },

    package: { type: String, trim: true },
    packagePrice: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0 },
    extrasTotal: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    expenses: { type: Number, default: 0, min: 0 },
    expenseNote: { type: String, default: '' },
    profit: { type: Number, default: 0 },
    extras: { type: [ExtraSchema], default: [] },
    payments: { type: [PaymentSchema], default: [] },

    googleCalendarEventId: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for faster lookups
EditSchema.index({ user: 1, status: 1 });
EditSchema.index({ user: 1, deadline: 1 });

// ─── Auto-Calculate Before Save ────────────────────────────────────────────────
EditSchema.pre<IEdit>('save', async function (next) {
  if (this.package && (this.packagePrice === 0 || this.isModified('package'))) {
    const pkg = await Package.findOne({ name: this.package, category: 'Edits', isActive: true });
    if (pkg) {
      this.packagePrice = pkg.price;
    }
  }

  this.extrasTotal = (this.extras || []).reduce((sum: number, e: IExtra) => sum + (e.amount || 0), 0);
  this.total = (this.packagePrice || 0) + this.extrasTotal;
  this.advance = (this.payments || []).reduce((sum: number, p: IPayment) => sum + (p.amount || 0), 0);
  this.balance = this.total - this.advance;
  this.profit = this.total - (this.expenses || 0);

  next();
});

// ─── Also run calculations on findByIdAndUpdate ────────────────────────────────
EditSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (!update) return next();

  const packageName = update.package ?? update['$set']?.package;
  let packagePrice = update.packagePrice ?? update['$set']?.packagePrice ?? 0;
  
  if (packageName && packagePrice === 0) {
    const pkg = await Package.findOne({ name: packageName, category: 'Edits', isActive: true });
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

export default mongoose.model<IEdit>('Edit', EditSchema);
