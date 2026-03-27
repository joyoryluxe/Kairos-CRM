import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationLog extends Document {
  recordId: mongoose.Types.ObjectId;
  modelName: string;
  type: string;
  sentAt: Date;
  meta?: {
    year?: number;
    dateKey?: string; // YYYY-MM-DD
  };
}

const NotificationLogSchema: Schema = new Schema(
  {
    recordId: { type: Schema.Types.ObjectId, required: true },
    modelName: { type: String, required: true },
    type: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    meta: {
      year: { type: Number },
      dateKey: { type: String },
    },
  },
  { timestamps: true }
);

// Index for fast lookups
NotificationLogSchema.index({ recordId: 1, type: 1, 'meta.dateKey': 1 });
NotificationLogSchema.index({ recordId: 1, type: 1, 'meta.year': 1 });

export default mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);
