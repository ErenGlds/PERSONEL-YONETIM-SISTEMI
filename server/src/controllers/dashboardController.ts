import { Response } from "express";
import { Employee } from "../models/Employee";
import { Department } from "../models/Department";
import { Leave } from "../models/Leave";
import { Holiday } from "../models/Holiday";
import { computeAvailability } from "../utils/availability";
import { AuthRequest } from "../middleware/authMIDDLEware";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const [
      totalEmployees,
      totalDepartments,
      pendingLeaves,
      approvedLeaves,
      upcomingHolidays,
      employeesByDepartment,
      allEmployees,
    ] = await Promise.all([
      Employee.countDocuments(),
      Department.countDocuments(),
      Leave.countDocuments({ status: "pending" }),
      Leave.countDocuments({ status: "approved" }),
      Holiday.countDocuments({ date: { $gte: new Date() } }),
      Employee.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: "$department" },
        { $project: { _id: 0, name: "$department.name", count: 1 } },
      ]),
      Employee.find(),
    ]);

    const availabilityCounts = {
      available: 0,
      "on-break": 0,
      "on-leave": 0,
      "off-hours": 0,
    };

    await Promise.all(
      allEmployees.map(async (emp) => {
        const status = await computeAvailability(emp);
        availabilityCounts[status]++;
      }),
    );

    res.status(200).json({
      totalEmployees,
      totalDepartments,
      pendingLeaves,
      approvedLeaves,
      upcomingHolidays,
      availableNow: availabilityCounts.available,
      onLeaveNow: availabilityCounts["on-leave"],
      availabilityCounts,
      employeesByDepartment,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};
