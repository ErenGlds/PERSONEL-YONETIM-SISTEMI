import { Response } from "express";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { Employee } from "../models/Employee";
import { Notification } from "../models/Notification";
import { sendEmail } from "../utils/sendEmail";
import { AuthRequest } from "../middleware/authMIDDLEware";

export const getTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const filter =
      req.user?.role === "admin" ? {} : { assignedTo: req.user?.userId };

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")
      .sort({ dueDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body;

    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      res.status(400).json({ message: "Geçersiz çalışan / Invalid employee" });
      return;
    }

    const assignee = await User.findOne({ email: employee.email });
    if (!assignee) {
      res.status(400).json({
        message:
          "Bu çalışanın sistem hesabı yok / This employee has no user account",
      });
      return;
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignee._id,
      dueDate,
      priority,
      createdBy: req.user?.userId,
    });

    await Notification.create({
      recipient: assignee._id,
      message: `Size yeni görev atandı / New task assigned: ${title}`,
      link: "/tasks",
    });

    sendEmail(
      assignee.email,
      `Yeni Görev / New Task: ${title} - Hitit CS`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #a26534; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Hitit CS</h2>
        </div>
        <div style="border: 1px solid #e2cdb0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <p>Merhaba <strong>${assignee.name}</strong>,</p>
          <p>Size yeni bir görev atandı: <strong>${title}</strong></p>
          <p>Son tarih / Due: <strong>${new Date(dueDate).toLocaleDateString("tr-TR")}</strong></p>
        </div>
      </div>
      `,
    );

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: "Görev bulunamadı / Task not found" });
      return;
    }

    const isAssignee = String(task.assignedTo) === req.user?.userId;

    if (!isAssignee) {
      res.status(403).json({
        message:
          "Sadece görevin atandığı kişi durumu değiştirebilir / Only the assignee can update status",
      });
      return;
    }

    // Atanan kişi yalnızca durumu değiştirebilir
    req.body = { status: req.body.status };

    const wasNotDone = task.status !== "done";

    const updated = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name");

    if (updated && wasNotDone && updated.status === "done") {
      const admins = await User.find({ role: "admin" });
      await Notification.insertMany(
        admins.map((a) => ({
          recipient: a._id,
          message: `Görev tamamlandı / Task completed: ${updated.title}`,
          link: "/tasks",
        })),
      );
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      res.status(404).json({ message: "Görev bulunamadı / Task not found" });
      return;
    }

    res.status(200).json({ message: "Görev silindi / Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};
