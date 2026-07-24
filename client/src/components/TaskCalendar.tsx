"use client";

import { useState } from "react";
import { Task, Holiday } from "@/types";

const priorityDot: Record<Task["priority"], string> = {
  low: "bg-green-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function TaskCalendar({
  tasks,
  holidays,
}: {
  tasks: Task[];
  holidays: Holiday[];
}) {
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const tasksForDay = (day: number) =>
    tasks.filter((t) => {
      const due = new Date(t.dueDate);
      return (
        due.getFullYear() === year &&
        due.getMonth() === month &&
        due.getDate() === day
      );
    });

  const holidaysForDay = (day: number) =>
    holidays.filter((h) => {
      const d = new Date(h.date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });

  const monthName = current.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
    <div className="rounded-xl border border-bronze-200 bg-white p-4 shadow-sm dark:border-clay-800 dark:bg-clay-900">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrent(new Date(year, month - 1, 1))}
          className="rounded-lg border border-bronze-200 px-3 py-1 text-sm hover:bg-bronze-50 dark:border-clay-700 dark:text-bronze-200 dark:hover:bg-clay-800"
        >
          ← Önceki / Prev
        </button>
        <h3 className="text-lg font-semibold capitalize text-clay-800 dark:text-bronze-100">
          {monthName}
        </h3>
        <button
          onClick={() => setCurrent(new Date(year, month + 1, 1))}
          className="rounded-lg border border-bronze-200 px-3 py-1 text-sm hover:bg-bronze-50 dark:border-clay-700 dark:text-bronze-200 dark:hover:bg-clay-800"
        >
          Sonraki / Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((wd) => (
          <div
            key={wd}
            className="py-2 text-center text-xs font-semibold text-clay-700/60 dark:text-bronze-200/60"
          >
            {wd}
          </div>
        ))}

        {cells.map((day, i) => (
          <div
            key={i}
            className={`min-h-24 rounded-lg border p-1 ${
              day === null
                ? "border-transparent"
                : isToday(day)
                  ? "border-bronze-500 bg-bronze-50 dark:bg-clay-800"
                  : "border-bronze-100 dark:border-clay-800"
            }`}
          >
            {day !== null && (
              <>
                <div className="mb-1 text-xs font-medium text-clay-700/70 dark:text-bronze-200/60">
                  {day}
                </div>
                <div className="space-y-0.5">
                  {holidaysForDay(day).map((h) => (
                    <div
                      key={h._id}
                      className="truncate rounded bg-purple-100 px-1 py-0.5 text-[10px] text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      title={h.name}
                    >
                      🎉 {h.name}
                    </div>
                  ))}
                  {tasksForDay(day)
                    .slice(0, 3)
                    .map((t) => (
                      <div
                        key={t._id}
                        className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] ${
                          t.status === "done"
                            ? "bg-gray-100 text-gray-400 line-through dark:bg-clay-800 dark:text-bronze-200/40"
                            : "bg-bronze-100/60 text-clay-800 dark:bg-bronze-900/40 dark:text-bronze-100"
                        }`}
                        title={
                          t.description
                            ? `${t.title} — ${t.description}`
                            : t.title
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[t.priority]}`}
                        />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                  {tasksForDay(day).length > 3 && (
                    <div className="text-[10px] text-clay-700/50 dark:text-bronze-200/40">
                      +{tasksForDay(day).length - 3} daha
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-clay-700/70 dark:text-bronze-200/60">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" /> Düşük / low
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Orta / medium
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Yüksek / high
        </span>
        <span className="flex items-center gap-1">
          <span className="rounded bg-purple-100 px-1 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            🎉
          </span>{" "}
          Tatil / Holiday
        </span>
      </div>
    </div>
  );
}
