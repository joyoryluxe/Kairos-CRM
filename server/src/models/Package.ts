import mongoose, { Document, Schema } from 'mongoose';

export type PackageCategory = 'Maternity' | 'Influencer' | 'Corporate' | 'General';

export interface IPackage extends Document {
  name: string;
  category: PackageCategory;
  price: number;
  description?: string;
  isActive: boolean;
}

const PackageSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Maternity', 'Influencer', 'Corporate', 'General'],
      required: true,
      default: 'General',
    },
    price: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPackage>('Package', PackageSchema);
