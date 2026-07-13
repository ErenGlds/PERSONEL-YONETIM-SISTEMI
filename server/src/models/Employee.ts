import mangoose, { Document, Schema, Types } from "mongoose";

export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  department: Types.ObjectId;
  position: string;
  salary: number;
  hireDate: Date;
  status: "active" | "inactive";
}

const employeeSchema = new Schema<IEmployee>(
  {
    firstName: {
      type: String,
      required: [true, "İsim zorunludur/Name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Soyisim zorunludur/Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "E-posta zorunludur/Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Departman zorunludur/Department is required"],
    },
    position: {
      type: String,
      required: [true, "Pozisyon zorunludur/Position is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Maaş zorunludur/Salary is required"],
      min: [0, "Maaş negatif olamaz/Salary cannot be negative"],
    },
    hireDate: {
      type: Date,
      required: [true, "İşe başlama tarihi zorunludur/Hire date is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export const Employee = mangoose.model<IEmployee>("Employee", employeeSchema);
