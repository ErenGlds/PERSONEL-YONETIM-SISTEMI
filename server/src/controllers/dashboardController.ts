import { Response } from "express";
import { Employee } from "../models/Employee";
import { Department } from "../models/Department";
import { Leave } from "../models/Leave";
import { Holiday } from "../models/Holiday";
import { AuthRequest } from "../middleware/authMIDDLEware";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaves,
      approvedLeaves,
      upcomingHolidays,
      employeesByDepartment,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: "active" }),
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
    ]);
    res.status(200).json({
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaves,
      approvedLeaves,
      upcomingHolidays,
      employeesByDepartment,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server error", error });
  }
};
