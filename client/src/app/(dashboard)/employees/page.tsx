"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Employee, Department } from "@/types";
import Modal from "@/components/modal";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  salary: "",
  hireDate: "",
  status: "active",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    Promise.all([
      apiFetch<Employee[]>("/employees"),
      apiFetch<Department[]>("/departments"),
    ])
      .then(([emps, depts]) => {
        setEmployees(emps);
        setDepartments(depts);
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Hata/Error"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
            status: emp.status,
          }
        : emptyForm,
    );
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (
      !confirm(`${emp.firstName} ${emp.lastName} silinsin mi/will be deleted?`)
    )
      return;
    try {
      await apiFetch(`/employees/${emp._id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Silinemedi/Failedd to delete.",
      );
    }
  };

  const inputCls =
    "w-full rounded-lg border border-bronze-200 px-3 py-2 focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300";

  if (loading) return <p className="text-clay-700">Yükleniyor/Loading...</p>;
  if (error)
    return <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-clay-800">Çalışanlar</h1>
        <button
          onClick={() => openModal()}
          className="rounded-lg bg-bronze-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-bronze-700"
        >
          + Yeni Çalışan
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-bronze-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-bronze-100 text-clay-800">
            <tr>
              <th className="px-4 py-3 font-semibold">
                Ad Soyad/Name Lastname
              </th>
              <th className="px-4 py-3 font-semibold">E-posta/E-mail</th>
              <th className="px-4 py-3 font-semibold">Departman/Department</th>
              <th className="px-4 py-3 font-semibold">Pozisyon/Position</th>
              <th className="px-4 py-3 font-semibold">Durum/Status</th>
              <th className="px-4 py-3 text-right font-semibold">
                İşlemler/Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-clay-700/60"
                >
                  Henüz çalışan yok/No employees yet.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-t border-bronze-100 hover:bg-bronze-50"
                >
                  <td className="px-4 py-3 font-medium text-clay-800">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80">{emp.email}</td>
                  <td className="px-4 py-3 text-clay-700/80">
                    {emp.department?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80">{emp.position}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        emp.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {emp.status === "active"
                        ? "Aktif/Online"
                        : "Inaktif/Offline"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openModal(emp)}
                      className="mr-3 text-bronze-700 hover:underline"
                    >
                      Düzenle/Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emp)}
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
        title={
          editing
            ? "Çalışanı Düzenle/Edit Employees"
            : "Yeni Çalışan/New employee"
        }
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700">
                Ad/Name *
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
              <label className="mb-1 block text-sm font-medium text-clay-700">
                Soyad/Last Name *
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
            <label className="mb-1 block text-sm font-medium text-clay-700">
              E-posta /E-mail*
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
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Telefon/Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Departman /Department*
            </label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Seçiniz/Select...</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700">
                Pozisyon/Position *
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
              <label className="mb-1 block text-sm font-medium text-clay-700">
                Maaş/ Salary *
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-clay-700">
                İşe Giriş /Hire*
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
              <label className="mb-1 block text-sm font-medium text-clay-700">
                Durum/Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="active">Aktif/Online</option>
                <option value="inactive">InAktif/Offline</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-bronze-600 py-2.5 font-medium text-white transition hover:bg-bronze-700 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor/Saving..." : "Kaydet/Saved"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
