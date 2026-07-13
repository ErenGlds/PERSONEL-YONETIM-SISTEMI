import { Response } from "express";
import { Department } from "../models/Department";
import { AuthRequest } from "../middleware/authMIDDLEware";

export const getDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server Error", error });
  }
};

export const createDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const existing = await Department.findOne({ name });
    if (existing) {
      res
        .status(400)
        .json({ message: "Departman zaten var / Department already exists" });
      return;
    }
    const department = await Department.create({ name, description });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server Error", error });
  }
};

export const updateDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const department = await Department.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true },
    );
    if (!department) {
      res
        .status(404)
        .json({ message: "Departman bulunamadı / Department not found" });
      return;
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server Error", error });
  }
};

export const deleteDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      res
        .status(404)
        .json({ message: "Departman bulunamadı / Department not found" });
      return;
    }
    res.status(200).json({ message: "Departman silindi / Department deleted" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server Error", error });
  }
};
