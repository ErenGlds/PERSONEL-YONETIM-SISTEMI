import { Response } from "express";
import { Notification } from "../models/Notification";
import { AuthRequest } from "../middleware/authMIDDLEware";

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const notifications = await Notification.find({
      recipient: req.user?.userId,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user?.userId,
      read: false,
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    await Notification.updateMany(
      { recipient: req.user?.userId, read: false },
      { $set: { read: true } },
    );
    res.status(200).json({ message: "Bildirimler okundu / Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};
export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user?.userId,
    });

    if (!notification) {
      res
        .status(404)
        .json({ message: "Bildirim bulunamadı / Notification not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Bildirim silindi / Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};

export const clearAllNotifications = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    await Notification.deleteMany({ recipient: req.user?.userId });
    res
      .status(200)
      .json({
        message: "Tüm bildirimler temizlendi / All notifications cleared",
      });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};
