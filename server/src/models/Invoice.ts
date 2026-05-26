import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  issuedDate: Date;
  items: IInvoiceItem[];
  subTotal: number;
  totalAmount: number;
  paymentDetails: {
    bankAccount: string;
    upi: string;
    ifscCode: string;
    branchName: string;
    scannerImage: string;
  };
  termsAndConditions?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, lowercase: true, trim: true },
    clientPhone: { type: String, trim: true },
    issuedDate: { type: Date, default: Date.now },
    items: { type: [InvoiceItemSchema], default: [] },
    subTotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paymentDetails: {
      bankAccount: { type: String, default: '' },
      upi: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      branchName: { type: String, default: '' },
      scannerImage: { type: String, default: 'scanner.png' },
    },
    termsAndConditions: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Pre-save hook to calculate item totals, subTotal, and totalAmount
InvoiceSchema.pre('save', function (next) {
  // 1. Calculate individual item totals
  this.items.forEach(item => {
    item.total = (item.quantity || 0) * (item.price || 0);
  });

  // 2. Calculate subTotal
  this.subTotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);

  // 3. Total amount is currently equal to subTotal
  this.totalAmount = this.subTotal;

  next();
});

// Pre findOneAndUpdate hook to calculate items totals and subTotal
InvoiceSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (!update) return next();

  let items = update.items ?? update['$set']?.items;
  if (items) {
    items.forEach((item: any) => {
      item.total = (item.quantity || 0) * (item.price || 0);
    });
    const subTotal = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    const totalAmount = subTotal;

    this.setUpdate({
      ...update,
      $set: {
        ...(update['$set'] || {}),
        items,
        subTotal,
        totalAmount
      }
    });
  }

  next();
});

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
