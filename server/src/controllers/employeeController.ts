import { Response } from "express";
import { Employee } from "../models/Employee";
import { Department } from "../models/Department";
import { AuthRequest } from "../middleware/authMIDDLEware";

export const getEmployees = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const employees = await Employee.find()
      .populate("department", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server Error", error });
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
      res
        .status(400)
        .json({
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
