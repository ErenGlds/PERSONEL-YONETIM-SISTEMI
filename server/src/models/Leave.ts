import mongoose, { Document, Schema, Types } from "mongoose";

export interface ILeave extends Document {
  employee: Types.ObjectId;
  leaveType: "annual" | "sick" | "unpaid" | "maternity";
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  status: "pending" | "approved" | "rejected";
}

const leaveSchema = new Schema<ILeave>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Çalışan zorunludur/Employee is required"],
    },
    leaveType: {
      type: String,
      enum: ["annual", "sick", "unpaid", "maternity"],
      required: [true, "İzin türü zorunludur/Leave type is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Başlangıç tarihi zorunludur/Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Bitiş tarihi zorunludur/End date is required"],
    },
    totalDays: {
      type: Number,
      required: true,
      min: [1, "İzin en az 1 gün olmalıdır/Leave must be at least 1 day"],
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const Leave = mongoose.model<ILeave>("Leave", leaveSchema);
