// import mongoose, { Document, Schema } from 'mongoose';

// export interface IMaternity extends Document {
//   clientName: string;
//   address: {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//   };
//   phoneNumber: string;
//   birthDate?: Date;
//   babyName?: string;
//   package?: string;
//   expenses?: number;
//   advance?: number;
//   total?: number;
//   extras?: number;
//   shootDateAndTime?: Date;
// }

// const MaternitySchema: Schema = new Schema(
//   {
//     clientName: { type: String, required: true },
//     address: {
//       street: { type: String, default: '' },
//       city: { type: String, default: '' },
//       state: { type: String, default: '' },
//       zipCode: { type: String, default: '' },
//     },
//     phoneNumber: { type: String, required: true },
//     birthDate: { type: Date },
//     babyName: { type: String },
//     package: { type: String },
//     expenses: { type: Number, default: 0 },
//     advance: { type: Number, default: 0 },
//     total: { type: Number, default: 0 },
//     extras: { type: Number, default: 0 },
//     shootDateAndTime: { type: Date },
//   },
//   { timestamps: true }
// );

// export default mongoose.model<IMaternity>('Maternity', MaternitySchema);























import mongoose, { Document, Schema } from 'mongoose';
import Package from './Package';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface IExtra {
  description: string; // e.g. "Extra printed album", "Drone shots"
  amount: number;
}

export interface IPayment {
  amount: number;
  date: Date;
  note?: string;       // e.g. "UPI", "Cash", "Bank transfer"
}

export interface IMaternity extends Document {
  // ── Client Info
  clientName: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // ── Shoot Info
  shootDateAndTime?: Date;
  deliveryDeadline?: Date;
  birthDate?: Date;
  babyName?: string;

  // ── Package & Pricing
  package?: string;           // Name of the package from the Package collection
  packagePrice: number;       // Auto-filled or manually provided

  // ── Extras (itemized)
  extras: IExtra[];           // Array of extra items with descriptions
  extrasTotal: number;        // Auto-calculated: sum of all extras

  // ── Expenses (your costs, e.g. travel, props)
  expenses: number;           // Your out-of-pocket costs (optional, for your records)

  // ── Payment Tracking
  payments: IPayment[];       // Every payment the client makes
  advance: number;            // Auto-calculated: sum of all payments
  total: number;              // Auto-calculated: packagePrice + extrasTotal
  balance: number;            // Auto-calculated: total - advance (amount still due)

  // ── Status
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

const MaternitySchema = new Schema<IMaternity>(
  {
    // ── Client Info
    clientName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },

    // ── Shoot Info
    shootDateAndTime: { type: Date },
    deliveryDeadline: { type: Date },
    birthDate: { type: Date },
    babyName: { type: String, trim: true },

    // ── Package & Pricing
    package: { type: String, trim: true },
    packagePrice: { type: Number, default: 0, min: 0 },

    // ── Extras (itemized)
    extras: { type: [ExtraSchema], default: [] },
    extrasTotal: { type: Number, default: 0, min: 0 },

    // ── Expenses
    expenses: { type: Number, default: 0, min: 0 },

    // ── Payment Tracking
    payments: { type: [PaymentSchema], default: [] },
    advance: { type: Number, default: 0, min: 0 },  // sum of payments
    total: { type: Number, default: 0, min: 0 },  // packagePrice + extrasTotal
    balance: { type: Number, default: 0 },           // total - advance (can be negative = overpaid)

    // ── Status
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

// This runs every time a record is saved or updated.
// You never manually set total/advance/balance — they're always derived.
MaternitySchema.pre('save', async function (next) {
  // 1. If a package is selected but price is 0, auto-fill its base price from DB
  if (this.package && (this.packagePrice === 0 || this.isModified('package'))) {
    const pkg = await Package.findOne({ name: this.package, category: 'Maternity', isActive: true });
    if (pkg) {
      this.packagePrice = pkg.price;
    }
  }

  // 2. Sum all extras
  this.extrasTotal = this.extras.reduce((sum, e) => sum + e.amount, 0);

  // 3. Total = package base + extras (expenses are YOUR cost, not client's bill)
  this.total = this.packagePrice + this.extrasTotal;

  // 4. Advance = sum of all payments received
  this.advance = this.payments.reduce((sum, p) => sum + p.amount, 0);

  // 5. Balance = what client still owes (negative = overpaid)
  this.balance = this.total - this.advance;

  next();
});

// This middleware handles the update path (not just save)
MaternitySchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (!update) return next();

  // Pull the update fields to recalculate
  const packageName = update.package ?? update['$set']?.package;
  let packagePrice = update.packagePrice ?? update['$set']?.packagePrice ?? 0;

  // If package is changed but price is not set, look it up
  if (packageName && packagePrice === 0) {
    const pkg = await Package.findOne({ name: packageName, category: 'Maternity', isActive: true });
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
  
  // Inject calculated fields into the update
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

export default mongoose.model<IMaternity>('Maternity', MaternitySchema);