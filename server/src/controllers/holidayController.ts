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

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
}

export const importPublicHolidays = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/TR`,
    );

    if (!response.ok) {
      res.status(502).json({
        message: "Dış API'ye ulaşılamadı / External API unavailable",
      });
      return;
    }

    const publicHolidays = (await response.json()) as NagerHoliday[];

    let added = 0;
    for (const ph of publicHolidays) {
      const exists = await Holiday.findOne({ date: new Date(ph.date) });
      if (!exists) {
        await Holiday.create({
          name: `${ph.localName} / ${ph.name}`,
          date: ph.date,
          description: "Resmi tatil (Nager.Date) / Public holiday",
        });
        added++;
      }
    }

    res.status(200).json({
      message: `${added} tatil eklendi, ${publicHolidays.length - added} zaten mevcuttu / ${added} added, ${publicHolidays.length - added} already existed`,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası / Server error", error });
  }
};
