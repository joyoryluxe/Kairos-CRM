import mongoose, { Document, Schema } from 'mongoose';

export interface IStudioExpense extends Document {
  amount: number;
  date: Date;
  category: string;
  notes?: string;
}

const StudioExpenseSchema: Schema = new Schema(
  {
    amount: { type: Number, required: true, default: 0 },
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStudioExpense>('StudioExpense', StudioExpenseSchema);
