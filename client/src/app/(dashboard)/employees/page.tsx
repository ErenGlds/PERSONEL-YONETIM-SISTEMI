"use client";

import { useEffect, useState } from "react";
import { apiFetch, isAdmin } from "@/lib/api";
import { Employee, Department, Paginated } from "@/types";
import Modal from "@/components/modal";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import { useToast } from "@/components/ToastProvider";

const weekDayOptions = [
  { value: 1, label: "Pzt" },
  { value: 2, label: "Sal" },
  { value: 3, label: "Çar" },
  { value: 4, label: "Per" },
  { value: 5, label: "Cum" },
  { value: 6, label: "Cmt" },
  { value: 0, label: "Paz" },
];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  salary: "",
  hireDate: "",
  workDays: [1, 2, 3, 4, 5] as number[],
  workStart: "09:00",
  workEnd: "18:00",
};

export default function EmployeesPage() {
  const admin = isAdmin();
  const { showToast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterDept) params.set("department", filterDept);
    params.set("page", String(page));
    params.set("limit", "10");

    Promise.all([
      apiFetch<Paginated<Employee>>(`/employees?${params.toString()}`),
      apiFetch<Department[]>("/departments"),
    ])
      .then(([empRes, depts]) => {
        setEmployees(empRes.data);
        setTotalPages(empRes.pagination.totalPages);
        setDepartments(depts);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Hata"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterDept, page]);

  type FormChangeEvent = React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement
  >;

  const handleChange = (e: FormChangeEvent) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleWorkDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter((d) => d !== day)
        : [...prev.workDays, day],
    }));
  };

  const openModal = (emp: Employee | null = null) => {
    setEditing(emp);
    setForm(
      emp
        ? {
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: emp.phone ?? "",
            department: emp.department._id,
            position: emp.position,
            salary: String(emp.salary),
            hireDate: emp.hireDate.slice(0, 10),
            workDays: emp.workDays ?? [1, 2, 3, 4, 5],
            workStart: emp.workStart ?? "09:00",
            workEnd: emp.workEnd ?? "18:00",
          }
        : emptyForm,
    );
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = { ...form, salary: Number(form.salary) };
    try {
      if (editing) {
        await apiFetch(`/employees/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/employees", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      fetchData();
      showToast(
        editing
          ? "Çalışan güncellendi / Employee updated"
          : "Çalışan eklendi / Employee created",
        "success",
      );
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Kaydedilemedi / Save failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`${emp.firstName} ${emp.lastName} silinsin mi? / Delete?`))
      return;
    try {
      await apiFetch(`/employees/${emp._id}`, { method: "DELETE" });
      fetchData();
      showToast("Çalışan silindi / Employee deleted", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Silinemedi / Delete failed",
        "error",
      );
    }
  };

  const inputCls =
    "w-full rounded-lg border border-bronze-200 px-3 py-2 focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300 dark:border-clay-700 dark:bg-clay-900 dark:text-bronze-100";

  if (loading)
    return (
      <p className="text-clay-700 dark:text-bronze-200">
        Yükleniyor... / Loading...
      </p>
    );
  if (error)
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        {error}
      </div>
    );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-clay-800 dark:text-bronze-100">
          Çalışanlar / Employees
        </h1>
        {admin && (
          <button
            onClick={() => openModal()}
            className="rounded-lg bg-bronze-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-bronze-700 dark:bg-bronze-500 dark:hover:bg-bronze-600"
          >
            + Yeni Çalışan / New Employee
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Ara (ad, e-posta)... / Search..."
          className="w-64 rounded-lg border border-bronze-200 px-3 py-2 text-sm focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300 dark:border-clay-700 dark:bg-clay-900 dark:text-bronze-100 dark:placeholder:text-bronze-200/40"
        />
        <select
          value={filterDept}
          onChange={(e) => {
            setFilterDept(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-bronze-200 px-3 py-2 text-sm focus:outline-none dark:border-clay-700 dark:bg-clay-900 dark:text-bronze-100"
        >
          <option value="">Tüm Departmanlar / All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-bronze-200 bg-white shadow-sm dark:border-clay-800 dark:bg-clay-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-bronze-100 text-clay-800 dark:bg-clay-800 dark:text-bronze-100">
            <tr>
              <th className="px-4 py-3 font-semibold">Ad Soyad / Name</th>
              <th className="px-4 py-3 font-semibold">E-posta / Email</th>
              <th className="px-4 py-3 font-semibold">
                Departman / Department
              </th>
              <th className="px-4 py-3 font-semibold">Pozisyon / Position</th>
              <th className="px-4 py-3 font-semibold">Durum / Availability</th>
              {admin && (
                <th className="px-4 py-3 text-right font-semibold">
                  İşlemler / Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={admin ? 6 : 5}
                  className="px-4 py-8 text-center text-clay-700/60 dark:text-bronze-200/50"
                >
                  Sonuç bulunamadı. / No results. 👥
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-t border-bronze-100 hover:bg-bronze-50 dark:border-clay-800 dark:hover:bg-clay-800"
                >
                  <td className="px-4 py-3 font-medium text-clay-800 dark:text-bronze-100">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80 dark:text-bronze-200/70">
                    {emp.email}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80 dark:text-bronze-200/70">
                    {emp.department?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80 dark:text-bronze-200/70">
                    {emp.position}
                  </td>
                  <td className="px-4 py-3">
                    <AvailabilityBadge availability={emp.availability} />
                  </td>
                  {admin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openModal(emp)}
                        className="mr-3 text-bronze-700 hover:underline dark:text-bronze-400"
                      >
                        Düzenle / Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp)}
                        className="text-red-600 hover:underline dark:text-red-400"
                      >
                        Sil / Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-bronze-200 bg-white px-3 py-1.5 transition hover:bg-bronze-50 disabled:opacity-40 dark:border-clay-700 dark:bg-clay-900 dark:text-bronze-200 dark:hover:bg-clay-800"
        >
          ← Önceki / Prev
        </button>
        <span className="text-clay-700 dark:text-bronze-200">
          Sayfa / Page {page} / {totalPages || 1}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="rounded-lg border border-bronze-200 bg-white px-3 py-1.5 transition hover:bg-bronze-50 disabled:opacity-40 dark:border-clay-700 dark:bg-clay-900 dark:text-bronze-200 dark:hover:bg-clay-800"
        >
          Sonraki / Next →
        </button>
      </div>

      <Modal
        open={modalOpen}
        title={
          editing
            ? "Çalışanı Düzenle / Edit Employee"
            : "Yeni Çalışan / New Employee"
        }
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
                Ad / First Name *
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
                Soyad / Last Name *
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
              E-posta / Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
              Telefon / Phone
            </label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9+\s]/g, "");
                setForm({ ...form, phone: cleaned });
              }}
              placeholder="05XX XXX XX XX"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
              Departman / Department *
            </label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Seçiniz... / Select...</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
                Pozisyon / Position *
              </label>
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
                Maaş / Salary *
              </label>
              <input
                type="number"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                required
                min={0}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
              İşe Giriş / Hire Date *
            </label>
            <input
              type="date"
              name="hireDate"
              value={form.hireDate}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-clay-700 dark:text-bronze-200">
              Çalışma Günleri / Work Days *
            </label>
            <div className="flex flex-wrap gap-2">
              {weekDayOptions.map((wd) => (
                <button
                  key={wd.value}
                  type="button"
                  onClick={() => toggleWorkDay(wd.value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                    form.workDays.includes(wd.value)
                      ? "border-bronze-600 bg-bronze-600 text-white dark:border-bronze-500 dark:bg-bronze-500"
                      : "border-bronze-200 text-clay-700 hover:bg-bronze-50 dark:border-clay-700 dark:text-bronze-200 dark:hover:bg-clay-700"
                  }`}
                >
                  {wd.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
                Başlangıç / Start *
              </label>
              <input
                type="time"
                name="workStart"
                value={form.workStart}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700 dark:text-bronze-200">
                Bitiş / End *
              </label>
              <input
                type="time"
                name="workEnd"
                value={form.workEnd}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
          </div>
          <p className="text-xs text-clay-700/50 dark:text-bronze-200/40">
            🍽️ Öğle arası 12:00–13:00 otomatik uygulanır. / Lunch break
            12:00–13:00 is automatic.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-bronze-600 py-2.5 font-medium text-white transition hover:bg-bronze-700 disabled:opacity-50 dark:bg-bronze-500 dark:hover:bg-bronze-600"
          >
            {saving ? "Kaydediliyor... / Saving..." : "Kaydet / Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
