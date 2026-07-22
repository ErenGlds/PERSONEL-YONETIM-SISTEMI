import { Employee } from "../models/Employee";
import { Leave } from "../models/Leave";
import { Task } from "../models/Task";
import { Holiday } from "../models/Holiday";
import { Department } from "../models/Department";
import { computeAvailability } from "./availability";

const availabilityText: Record<string, string> = {
  available: "Müsait",
  "on-break": "Öğle arasında",
  "on-leave": "İzinde",
  "off-hours": "Çalışma saatleri dışında",
};

const leaveTypeText: Record<string, string> = {
  annual: "Yıllık izin",
  sick: "Hastalık izni",
  unpaid: "Ücretsiz izin",
  maternity: "Doğum izni",
};

const statusText: Record<string, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  todo: "Yapılacak",
  "in-progress": "Devam ediyor",
  done: "Tamamlandı",
};

const priorityText: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

const formatDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("tr-TR");

export const buildContext = async (isAdmin: boolean): Promise<string> => {
  const [employees, departments, leaves, tasks, holidays] = await Promise.all([
    Employee.find().populate("department", "name"),
    Department.find(),
    Leave.find()
      .populate("employee", "firstName lastName")
      .sort({ startDate: -1 })
      .limit(30),
    Task.find().populate("assignedTo", "name").sort({ dueDate: 1 }).limit(30),
    Holiday.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(10),
  ]);

  const employeeLines = await Promise.all(
    employees.map(async (emp) => {
      const availability = await computeAvailability(emp);
      const dept =
        (emp.department as unknown as { name?: string })?.name ?? "-";
      const salaryPart = isAdmin ? ` | Maaş: ${emp.salary} TL` : "";
      const days = emp.workDays
        .map((d) => ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][d])
        .join(",");
      return `- ${emp.firstName} ${emp.lastName} | Departman: ${dept} | Pozisyon: ${emp.position} | Durum: ${availabilityText[availability]} | Mesai: ${days} ${emp.workStart}-${emp.workEnd} | E-posta: ${emp.email}${salaryPart}`;
    }),
  );

  const leaveLines = leaves.map((lv) => {
    const emp = lv.employee as unknown as {
      firstName?: string;
      lastName?: string;
    };
    return `- ${emp?.firstName ?? "?"} ${emp?.lastName ?? ""} | ${leaveTypeText[lv.leaveType]} | ${formatDate(lv.startDate)} - ${formatDate(lv.endDate)} (${lv.totalDays} gün) | ${statusText[lv.status]}`;
  });

  const taskLines = tasks.map((t) => {
    const assignee =
      (t.assignedTo as unknown as { name?: string })?.name ?? "?";
    return `- "${t.title}" | Atanan: ${assignee} | Öncelik: ${priorityText[t.priority]} | Durum: ${statusText[t.status]} | Son tarih: ${formatDate(t.dueDate)}${t.description ? ` | Açıklama: ${t.description}` : ""}`;
  });

  const holidayLines = holidays.map(
    (h) => `- ${h.name} | ${formatDate(h.date)}`,
  );

  const now = new Date();

  return `
=== GÜNCEL SİSTEM VERİSİ ===
Şu anki tarih ve saat: ${now.toLocaleString("tr-TR")}

DEPARTMANLAR (${departments.length}):
${departments.map((d) => `- ${d.name}${d.description ? `: ${d.description}` : ""}`).join("\n") || "- Kayıt yok"}

ÇALIŞANLAR (${employees.length}):
${employeeLines.join("\n") || "- Kayıt yok"}

İZİNLER (son 30 kayıt):
${leaveLines.join("\n") || "- Kayıt yok"}

GÖREVLER (son 30 kayıt):
${taskLines.join("\n") || "- Kayıt yok"}

YAKLAŞAN TATİLLER:
${holidayLines.join("\n") || "- Kayıt yok"}
=== VERİ SONU ===
`.trim();
};
