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
    return <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>;
  }

  if (!stats) {
    return <p className="text-clay-700">Yükleniyor/Loading...</p>;
  }

  const cards = [
    { title: "Toplam Çalışan", value: stats.totalEmployees, icon: "👥" },
    { title: "Aktif Çalışan", value: stats.activeEmployees, icon: "✅" },
    { title: "Departman", value: stats.totalDepartments, icon: "🏢" },
    { title: "Bekleyen İzin", value: stats.pendingLeaves, icon: "⏳" },
    { title: "Onaylı İzin", value: stats.approvedLeaves, icon: "📗" },
    { title: "Yaklaşan Tatil", value: stats.upcomingHolidays, icon: "🎉" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-clay-800">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-bronze-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-clay-700/70">{card.title}</p>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-bronze-700">
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-bronze-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-clay-800">
          Departmanlara Göre Çalışan Dağılımı
        </h2>

        {stats.employeesByDepartment.length === 0 ? (
          <p className="text-sm text-clay-700/60">Henüz veri yok.</p>
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
                    <span className="text-clay-800">{dept.name}</span>
                    <span className="font-medium text-bronze-700">
                      {dept.count}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-bronze-100">
                    <div
                      className="h-2.5 rounded-full bg-bronze-600 transition-all"
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
  );
}
