import mongoose, { Document, Schema } from 'mongoose';

export interface ITermsCondition extends Document {
  category: string;
  terms: string[];
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TermsConditionSchema: Schema = new Schema(
  {
    category: { type: String, required: true, trim: true },
    terms: { type: [String], default: [] },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Unique combination index to prevent duplicate entries for a category per user
TermsConditionSchema.index({ user: 1, category: 1 }, { unique: true });

export default mongoose.model<ITermsCondition>('TermsCondition', TermsConditionSchema);
