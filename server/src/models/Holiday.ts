import mongoose, { Document, Schema } from "mongoose";

export interface IHoliday extends Document {
  name: string;
  date: Date;
  description?: string;
}
const holidaySchema = new Schema<IHoliday>(
  {
    name: {
      type: String,
      required: [true, "Tatil adı zorunludur/Holiday name is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Tarih zorunludur/Date is required"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export const Holiday = mongoose.model<IHoliday>("Holiday", holidaySchema);
