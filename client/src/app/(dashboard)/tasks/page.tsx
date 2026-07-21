"use client";

import { useEffect, useState } from "react";
import { apiFetch, isAdmin } from "@/lib/api";
import { Task, Employee, Holiday } from "@/types";
import Modal from "@/components/modal";
import TaskCalendar from "@/components/TaskCalendar";

const priorityLabels: Record<Task["priority"], string> = {
  low: "Düşük / low",
  medium: "Orta / medium",
  high: "Yüksek / high",
};

const priorityStyles: Record<Task["priority"], string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const statusLabels: Record<Task["status"], string> = {
  todo: "Yapılacak / todo",
  "in-progress": "Devam ediyor / in-progress",
  done: "Tamamlandı / done",
};

const statusStyles: Record<Task["status"], string> = {
  todo: "bg-gray-100 text-gray-600",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const emptyForm = {
  title: "",
  description: "",
  assignedTo: "",
  dueDate: "",
  priority: "medium",
};

export default function TasksPage() {
  const admin = isAdmin();

  const currentUserId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}").id
      : "";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchTasks = () => {
    apiFetch<Task[]>("/tasks")
      .then((data) => {
        setTasks(data);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Hata"))
      .finally(() => setLoading(false));
  };

  const fetchHolidays = () => {
    apiFetch<Holiday[]>("/holidays")
      .then((data) => setHolidays(data))
      .catch(() => {});
  };

  const fetchEmployees = () => {
    if (!admin) return;
    apiFetch<{ data: Employee[] }>("/employees?limit=1000")
      .then((res) => setEmployees(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchTasks();
    fetchHolidays();
    fetchEmployees();
  }, []);

  type FormChangeEvent = React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;

  const handleChange = (e: FormChangeEvent) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setModalOpen(false);
      setForm(emptyForm);
      fetchTasks();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Kaydedilemedi / Save failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task: Task, status: Task["status"]) => {
    try {
      await apiFetch(`/tasks/${task._id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchTasks();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Güncellenemedi / Update failed",
      );
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`"${task.title}" silinsin mi? / Delete?`)) return;
    try {
      await apiFetch(`/tasks/${task._id}`, { method: "DELETE" });
      fetchTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silinemedi / Delete failed");
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR");

  const inputCls =
    "w-full rounded-lg border border-bronze-200 px-3 py-2 focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300";

  if (loading)
    return <p className="text-clay-700">Yükleniyor... / Loading...</p>;
  if (error)
    return <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-clay-800">Görevler / Tasks</h1>
        {admin && (
          <button
            onClick={() => {
              setForm(emptyForm);
              setFormError("");
              setModalOpen(true);
            }}
            className="rounded-lg bg-bronze-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-bronze-700"
          >
            + Yeni Görev / New Task
          </button>
        )}
      </div>

      <TaskCalendar tasks={tasks} holidays={holidays} />

      <div className="overflow-x-auto rounded-xl border border-bronze-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-bronze-100 text-clay-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Başlık / Title</th>
              <th className="px-4 py-3 font-semibold">Atanan / Assignee</th>
              <th className="px-4 py-3 font-semibold">Son Tarih / Due</th>
              <th className="px-4 py-3 font-semibold">Öncelik / Priority</th>
              <th className="px-4 py-3 font-semibold">Durum / Status</th>
              <th className="px-4 py-3 text-right font-semibold">
                İşlemler / Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-clay-700/60"
                >
                  Görev yok. / No tasks yet. 📋
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <>
                  <tr
                    key={task._id}
                    className="border-t border-bronze-100 hover:bg-bronze-50"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          setExpandedId(
                            expandedId === task._id ? null : task._id,
                          )
                        }
                        className="flex items-center gap-1 font-medium text-clay-800 hover:text-bronze-700"
                      >
                        <span className="text-xs text-clay-700/50">
                          {expandedId === task._id ? "▼" : "▶"}
                        </span>
                        {task.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-clay-700/80">
                      {task.assignedTo?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-clay-700/80">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}
                      >
                        {priorityLabels[task.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        disabled={task.assignedTo?._id !== currentUserId}
                        onChange={(e) =>
                          handleStatusChange(
                            task,
                            e.target.value as Task["status"],
                          )
                        }
                        className={`rounded-full border-none px-2.5 py-0.5 text-xs font-medium ${statusStyles[task.status]} disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {admin ? (
                        <button
                          onClick={() => handleDelete(task)}
                          className="text-red-600 hover:underline"
                        >
                          Sil / Delete
                        </button>
                      ) : (
                        <span className="text-clay-700/40">—</span>
                      )}
                    </td>
                  </tr>
                  {expandedId === task._id && (
                    <tr key={task._id + "-desc"} className="bg-bronze-50/40">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="rounded-lg bg-white p-3 text-sm text-clay-700/90 shadow-sm">
                          <p className="mb-1 font-semibold text-clay-800">
                            Açıklama / Description
                          </p>
                          {task.description ? (
                            <p>{task.description}</p>
                          ) : (
                            <p className="text-clay-700/50">
                              Açıklama girilmemiş. / No description.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title="Yeni Görev / New Task"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Başlık / Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Açıklama / Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Ata / Assign to *
            </label>
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Seçiniz... / Select...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700">
                Son Tarih / Due *
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700">
                Öncelik / Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputCls}
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-bronze-600 py-2.5 font-medium text-white transition hover:bg-bronze-700 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor... / Saving..." : "Kaydet / Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
