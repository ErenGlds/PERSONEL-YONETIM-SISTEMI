import { Response } from "express";
import { Holiday } from "../models/Holiday";
import { AuthRequest } from "../middleware/authMIDDLEware";

export const getHolidays = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server Error", error });
  }
};
export const createHoliday = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, date, description } = req.body;

    const holiday = await Holiday.create({ name, date, description });
    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server error", error });
  }
};

export const updateHoliday = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!holiday) {
      res
        .status(404)
        .json({ message: "Tatil bulunamadı/Couldn't find holiday" });
      return;
    }

    res.status(200).json(holiday);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server error", error });
  }
};

export const deleteHoliday = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByIdAndDelete(id);

    if (!holiday) {
      res
        .status(404)
        .json({ message: "Tatil bulunamadı/Couldn't find holiday" });
      return;
    }

    res.status(200).json({ message: "Tatil silindi/Holiday deleted" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server error", error });
  }
};
