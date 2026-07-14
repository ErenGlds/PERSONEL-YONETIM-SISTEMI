import { Response } from "express";
import { Leave } from "../models/Leave";
import { Employee } from "../models/Employee";
import { AuthRequest } from "../middleware/authMIDDLEware";

const calculateDays = (start: Date, end: Date): number => {
  const msPerDay = 86400000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
};

export const getLeaves = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "firstName lastName")
      .sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server Error", error });
  }
};

export const createLeave = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { employee, leaveType, startDate, endDate, reason } = req.body;

    const employeeExists = await Employee.findById(employee);
    if (!employeeExists) {
      res.status(400).json({ message: "Geçersiz çalışan/Invalid employee" });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      res
        .status(400)
        .json({
          message:
            "Bitiş tarihi başlangıçtan önce olamaz/ End date can't be before star date",
        });
      return;
    }

    const totalDays = calculateDays(start, end);

    const leave = await Leave.create({
      employee,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
    });

    const populated = await leave.populate("employee", "firstName lastName");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server Error", error });
  }
};

export const updateLeave = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        res
          .status(400)
          .json({
            message:
              "Bitiş tarihi başlangıçtan önce olamaz/ End date can't be before star date",
          });
        return;
      }

      req.body.totalDays = calculateDays(start, end);
    }

    const leave = await Leave.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("employee", "firstName lastName");

    if (!leave) {
      res
        .status(404)
        .json({ message: "İzin kaydı bulunamadı/Couldn't find leave request" });
      return;
    }

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server error", error });
  }
};

export const deleteLeave = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const leave = await Leave.findByIdAndDelete(id);

    if (!leave) {
      res
        .status(404)
        .json({
          message:
            "İzin kaydı bulunamadıİzin kaydı bulunamadı/Couldn't find leave request",
        });
      return;
    }

    res
      .status(200)
      .json({ message: "İzin kaydı silindi/Leave record deleted" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server error", error });
  }
};
