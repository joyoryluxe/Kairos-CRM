import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  price: number | string;
  priceType?: 'flat' | 'percentage';
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
  discount: number;
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
    price: { type: Schema.Types.Mixed, required: true, default: '' },
    priceType: { type: String, enum: ['flat', 'percentage'], default: 'flat' },
    total: { type: Number, required: true, default: 0 },
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
    discount: { type: Number, min: 0, max: 100, default: 0 },
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
  // 1. Calculate individual item totals with percentage and negative support
  let runningSubtotal = 0;
  this.items.forEach(item => {
    const qty = item.quantity || 0;
    const priceNum = parseFloat(String(item.price || '0')) || 0;
    const type = (item as any).priceType || 'flat';
    
    let resolvedPrice = 0;
    if (type === 'percentage') {
      resolvedPrice = (runningSubtotal * priceNum) / 100;
    } else {
      resolvedPrice = priceNum;
    }
    
    item.total = qty * resolvedPrice;
    runningSubtotal += item.total;
  });

  // 2. Calculate subTotal and totalAmount
  this.subTotal = runningSubtotal;
  const discountPercent = this.discount || 0;
  this.totalAmount = this.subTotal - (this.subTotal * discountPercent) / 100;

  next();
});

// Pre findOneAndUpdate hook to calculate items totals and subTotal
InvoiceSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (!update) return next();

  let items = update.items ?? update['$set']?.items;
  if (items) {
    let runningSubtotal = 0;
    items.forEach((item: any) => {
      const qty = item.quantity || 0;
      const priceNum = parseFloat(String(item.price || '0')) || 0;
      const type = item.priceType || 'flat';
      
      let resolvedPrice = 0;
      if (type === 'percentage') {
        resolvedPrice = (runningSubtotal * priceNum) / 100;
      } else {
        resolvedPrice = priceNum;
      }
      
      item.total = qty * resolvedPrice;
      runningSubtotal += item.total;
    });
    const subTotal = runningSubtotal;
    const discount = update.discount !== undefined ? update.discount : (update['$set']?.discount !== undefined ? update['$set']?.discount : 0);
    const totalAmount = subTotal - (subTotal * discount) / 100;

    this.setUpdate({
      ...update,
      $set: {
        ...(update['$set'] || {}),
        items,
        subTotal,
        discount,
        totalAmount
      }
    });
  }

  next();
});

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
