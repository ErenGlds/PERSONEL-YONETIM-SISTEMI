import { Leave } from "../models/Leave";
import { IEmployee } from "../models/Employee";
import { Types } from "mongoose";

export type Availability = "on-leave" | "on-break" | "available" | "off-hours";

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const computeAvailability = async (
  employee: IEmployee,
): Promise<Availability> => {
  const now = new Date();

  const activeLeave = await Leave.findOne({
    employee: employee._id as Types.ObjectId,
    status: "approved",
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (activeLeave) return "on-leave";

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (nowMinutes >= 720 && nowMinutes < 780) return "on-break";

  const today = now.getDay();
  const isWorkDay = employee.workDays.includes(today);
  const withinHours =
    nowMinutes >= timeToMinutes(employee.workStart) &&
    nowMinutes < timeToMinutes(employee.workEnd);

  if (isWorkDay && withinHours) return "available";

  return "off-hours";
};
