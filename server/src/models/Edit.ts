import mongoose, { Document, Schema } from 'mongoose';

export type EditType = string;
export type EditStatus = 'Pending' | 'In Progress' | 'Done' | 'Delivered';
export type EditPriority = 'Low' | 'Medium' | 'High';

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
  googleCalendarEventId?: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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
    googleCalendarEventId: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for faster lookups
EditSchema.index({ user: 1, status: 1 });
EditSchema.index({ user: 1, deadline: 1 });

export default mongoose.model<IEdit>('Edit', EditSchema);
