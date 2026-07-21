import { Response } from "express";
import { Employee } from "../models/Employee";
import { Department } from "../models/Department";
import { AuthRequest } from "../middleware/authMIDDLEware";
import { computeAvailability } from "../utils/availability";

export const getEmployees = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { search, department } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (department) filter.department = department;

    const total = await Employee.countDocuments(filter);

    const employees = await Employee.find(filter)
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const withAvailability = await Promise.all(
      employees.map(async (emp) => ({
        ...emp.toObject(),
        availability: await computeAvailability(emp),
      })),
    );

    res.status(200).json({
      data: withAvailability,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};
export const createEmployee = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      salary,
      hireDate,
      workDays,
      workStart,
      workEnd,
    } = req.body;

    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      res
        .status(400)
        .json({ message: "Geçersiz departman / Invalid Department" });
      return;
    }

    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) {
      res.status(400).json({
        message: "Bu e-posta ile kayıtlı çalışan var / Email already in use",
      });
      return;
    }

    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      salary,
      hireDate,
      workDays,
      workStart,
      workEnd,
    });

    const populated = await employee.populate("department", "name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server Error", error });
  }
};

export const updateEmployee = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.body.department) {
      const departmentExists = await Department.findById(req.body.department);
      if (!departmentExists) {
        res
          .status(400)
          .json({ message: "Geçersiz departman / Invalid Department" });
        return;
      }
    }

    const employee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("department", "name");

    if (!employee) {
      res
        .status(404)
        .json({ message: "Çalışan bulunamadı / Employee not found " });
      return;
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server Error", error });
  }
};

export const deleteEmployee = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      res
        .status(404)
        .json({ message: "Çalışan bulunamadı / Employee not found" });
      return;
    }

    res.status(200).json({ message: "Çalışan silindi / Employee deleted" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server Error", error });
  }
};
