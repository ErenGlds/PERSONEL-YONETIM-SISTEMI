"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Leave, Employee } from "@/types";
import Modal from "@/components/modal";

// Etiket haritaları: kod değeri → ekranda görünen (TR / EN)
const leaveTypeLabels: Record<Leave["leaveType"], string> = {
  annual: "Yıllık / annual",
  sick: "Hastalık / sick",
  unpaid: "Ücretsiz / unpaid",
  maternity: "Doğum / maternity",
};

const statusLabels: Record<Leave["status"], string> = {
  pending: "Bekliyor / pending",
  approved: "Onaylandı / approved",
  rejected: "Reddedildi / rejected",
};

const statusStyles: Record<Leave["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const emptyForm = {
  employee: "",
  leaveType: "annual",
  startDate: "",
  endDate: "",
  reason: "",
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    Promise.all([
      apiFetch<Leave[]>("/leaves"),
      apiFetch<Employee[]>("/employees"),
    ])
      .then(([lvs, emps]) => {
        setLeaves(lvs);
        setEmployees(emps);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Hata"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/leaves", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setModalOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (leave: Leave, status: Leave["status"]) => {
    try {
      await apiFetch(`/leaves/${leave._id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Güncellenemedi");
    }
  };

  const handleDelete = async (leave: Leave) => {
    if (
      !confirm(
        "Bu izin kaydı silinsin mi?/Are you sure you want to delete this leave record?",
      )
    )
      return;
    try {
      await apiFetch(`/leaves/${leave._id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silinemedi/Failed to delete");
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR");

  const inputCls =
    "w-full rounded-lg border border-bronze-200 px-3 py-2 focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300";

  if (loading) return <p className="text-clay-700">Yükleniyor...</p>;
  if (error)
    return <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-clay-800">İzinler/Leaves</h1>
        <button
          onClick={() => {
            setForm(emptyForm);
            setModalOpen(true);
          }}
          className="rounded-lg bg-bronze-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-bronze-700"
        >
          + Yeni İzin
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-bronze-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-bronze-100 text-clay-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Çalışan/Employee</th>
              <th className="px-4 py-3 font-semibold">Tür/Type</th>
              <th className="px-4 py-3 font-semibold">
                Tarih Aralığı/Date Range
              </th>
              <th className="px-4 py-3 font-semibold">Gün/Day</th>
              <th className="px-4 py-3 font-semibold">Durum/Status</th>
              <th className="px-4 py-3 text-right font-semibold">
                İşlemler/Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-clay-700/60"
                >
                  Henüz izin kaydı yok/No leave records yet
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr
                  key={leave._id}
                  className="border-t border-bronze-100 hover:bg-bronze-50"
                >
                  <td className="px-4 py-3 font-medium text-clay-800">
                    {leave.employee
                      ? `${leave.employee.firstName} ${leave.employee.lastName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80">
                    {leaveTypeLabels[leave.leaveType]}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80">
                    {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80">
                    {leave.totalDays}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[leave.status]}`}
                    >
                      {statusLabels[leave.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {leave.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(leave, "approved")}
                          className="mr-3 text-green-600 hover:underline"
                        >
                          Onayla/Accept
                        </button>
                        <button
                          onClick={() => updateStatus(leave, "rejected")}
                          className="mr-3 text-amber-600 hover:underline"
                        >
                          Reddet/Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(leave)}
                      className="text-red-600 hover:underline"
                    >
                      Sil/Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title="Yeni İzin Talebi"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Çalışan *
            </label>
            <select
              name="employee"
              value={form.employee}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Seçiniz...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700">
              İzin Türü *
            </label>
            <select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              required
              className={inputCls}
            >
              {Object.entries(leaveTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700">
                Başlangıç *
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700">
                Bitiş *
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Açıklama
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={2}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-bronze-600 py-2.5 font-medium text-white transition hover:bg-bronze-700 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
