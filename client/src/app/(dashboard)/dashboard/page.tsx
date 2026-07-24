"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<DashboardStats>("/dashboard")
      .then((data) => setStats(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Veriler alınamadı"),
      );
  }, []);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-clay-700 dark:text-bronze-200">
        Yükleniyor... / Loading...
      </p>
    );
  }

  const cards = [
    {
      title: "Toplam Çalışan / Total Employees",
      value: stats.totalEmployees,
      icon: "👥",
    },
    {
      title: "Şu An Müsait / Available Now",
      value: stats.availableNow,
      icon: "🟢",
    },
    { title: "İzinde / On Leave", value: stats.onLeaveNow, icon: "🟡" },
    {
      title: "Departman / Departments",
      value: stats.totalDepartments,
      icon: "🏢",
    },
    {
      title: "Bekleyen İzin / Pending Leaves",
      value: stats.pendingLeaves,
      icon: "⏳",
    },
    {
      title: "Yaklaşan Tatil / Upcoming Holidays",
      value: stats.upcomingHolidays,
      icon: "🎉",
    },
  ];

  const availabilityItems = [
    {
      key: "available",
      label: "🟢 Müsait / Available",
      value: stats.availabilityCounts.available,
      color: "bg-green-500",
    },
    {
      key: "on-break",
      label: "🍽️ Molada / On Break",
      value: stats.availabilityCounts["on-break"],
      color: "bg-orange-500",
    },
    {
      key: "on-leave",
      label: "🟡 İzinde / On Leave",
      value: stats.availabilityCounts["on-leave"],
      color: "bg-amber-500",
    },
    {
      key: "off-hours",
      label: "⚫ Çalışma dışı / Off Hours",
      value: stats.availabilityCounts["off-hours"],
      color: "bg-gray-400",
    },
  ];

  const totalForBar =
    availabilityItems.reduce((sum, i) => sum + i.value, 0) || 1;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-clay-800 dark:text-bronze-100">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-bronze-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-clay-800 dark:bg-clay-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-clay-700/70 dark:text-bronze-200/60">
                {card.title}
              </p>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-bronze-700 dark:text-bronze-400">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-bronze-200 bg-white p-6 shadow-sm dark:border-clay-800 dark:bg-clay-900">
          <h2 className="mb-4 text-lg font-semibold text-clay-800 dark:text-bronze-100">
            Personel Müsaitlik Durumu / Staff Availability
          </h2>
          <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-bronze-100 dark:bg-clay-800">
            {availabilityItems.map((item) => (
              <div
                key={item.key}
                className={item.color}
                style={{ width: `${(item.value / totalForBar) * 100}%` }}
              />
            ))}
          </div>
          <div className="space-y-2">
            {availabilityItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-clay-800 dark:text-bronze-200">
                  {item.label}
                </span>
                <span className="font-medium text-bronze-700 dark:text-bronze-400">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-bronze-200 bg-white p-6 shadow-sm dark:border-clay-800 dark:bg-clay-900">
          <h2 className="mb-4 text-lg font-semibold text-clay-800 dark:text-bronze-100">
            Departmanlara Göre Çalışan / Employees by Department
          </h2>
          {stats.employeesByDepartment.length === 0 ? (
            <p className="text-sm text-clay-700/60 dark:text-bronze-200/50">
              Henüz veri yok. / No data yet.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.employeesByDepartment.map((dept) => {
                const max = Math.max(
                  ...stats.employeesByDepartment.map((d) => d.count),
                );
                const width = (dept.count / max) * 100;
                return (
                  <div key={dept.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-clay-800 dark:text-bronze-200">
                        {dept.name}
                      </span>
                      <span className="font-medium text-bronze-700 dark:text-bronze-400">
                        {dept.count}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-bronze-100 dark:bg-clay-800">
                      <div
                        className="h-2.5 rounded-full bg-bronze-600 dark:bg-bronze-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
