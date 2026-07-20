import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  message: string;
  link?: string;
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
