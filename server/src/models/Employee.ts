import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: Types.ObjectId;
  position: string;
  salary: number;
  hireDate: Date;
  workDays: number[];
  workStart: string;
  workEnd: string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    firstName: {
      type: String,
      required: [true, "İsim zorunludur / First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Soyisim zorunludur / Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "E-posta zorunludur / Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Departman zorunludur / Department is required"],
    },
    position: {
      type: String,
      required: [true, "Pozisyon zorunludur / Position is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Maaş zorunludur / Salary is required"],
      min: [0, "Maaş negatif olamaz / Salary cannot be negative"],
    },
    hireDate: {
      type: Date,
      required: [true, "İşe giriş tarihi zorunludur / Hire date is required"],
    },
    workDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
    },
    workStart: {
      type: String,
      default: "09:00",
    },
    workEnd: {
      type: String,
      default: "18:00",
    },
  },
  { timestamps: true },
);

export const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);
