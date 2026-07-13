import mongoose, { Document, Schema } from "mongoose";
export interface IDepartment extends Document {
  name: string;
  description: string;
}
const departmentSchema: Schema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, "Department adı zorunludur/Department name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);
export const Department = mongoose.model<IDepartment>(
  "Department",
  departmentSchema,
);
