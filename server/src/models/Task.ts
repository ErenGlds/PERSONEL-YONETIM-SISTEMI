import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  assignedTo: Types.ObjectId;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  createdBy: Types.ObjectId;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Görev başlığı zorunludur / Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Atanan kişi zorunludur / Assignee is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Bitiş tarihi zorunludur / Due date is required"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Task = mongoose.model<ITask>("Task", taskSchema);
