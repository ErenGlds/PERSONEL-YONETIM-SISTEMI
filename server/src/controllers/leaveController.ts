import { Response } from "express";
import { Leave } from "../models/Leave";
import { Employee } from "../models/Employee";
import { AuthRequest } from "../middleware/authMIDDLEware";
import { Notification } from "../models/Notification";
import { sendEmail } from "../utils/sendEmail";
import { User } from "../models/User";

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
      res.status(400).json({
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

    const admins = await User.find({ role: "admin" });
    const empDoc = await Employee.findById(employee);
    await Notification.insertMany(
      admins.map((a) => ({
        recipient: a._id,
        message: `Yeni izin talebi / New leave request: ${empDoc?.firstName} ${empDoc?.lastName}`,
        link: "/leaves",
      })),
    );
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
        res.status(400).json({
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
    }).populate("employee", "firstName lastName email");

    if (!leave) {
      res.status(404).json({ message: "İzin kaydı bulunamadı" });
      return;
    }

    if (req.body.status === "approved" || req.body.status === "rejected") {
      const statusText =
        req.body.status === "approved"
          ? "onaylandı / approved"
          : "reddedildi / rejected";
      const empUser = await User.findOne({
        email: (leave.employee as unknown as { email?: string })?.email,
      });
      if (empUser) {
        await Notification.create({
          recipient: empUser._id,
          message: `İzin talebiniz ${statusText} / Your leave request was ${statusText.split(" / ")[1]}`,
          link: "/leaves",
        });

        sendEmail(
          empUser.email,
          `İzin Talebiniz ${statusText.split(" / ")[0]} - Hitit CS`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="background: #a26534; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">Hitit CS</h2>
            </div>
            <div style="border: 1px solid #e2cdb0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
              <p>Merhaba <strong>${empUser.name}</strong>,</p>
              <p>İzin talebiniz <strong>${statusText}</strong>.</p>
              <p style="color: #666; font-size: 13px;">
                Detaylar için sisteme giriş yapabilirsiniz. /
                Please log in to the system for details.
              </p>
            </div>
          </div>
          `,
        );
      }
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
      res.status(404).json({
        message: "İzin kaydı bulunamadı/Couldn't find leave request",
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
