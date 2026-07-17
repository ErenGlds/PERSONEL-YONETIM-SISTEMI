"use client";

import { useEffect, useState } from "react";
import { apiFetch, isAdmin } from "@/lib/api";
import { Department } from "@/types";
import Modal from "@/components/modal";

export default function DepartmentsPage() {
  const admin = isAdmin();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchDepartments = () => {
    apiFetch<Department[]>("/departments")
      .then((data) => {
        setDepartments(data);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Hata"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openModal = (dept: Department | null = null) => {
    setEditing(dept);
    setName(dept?.name ?? "");
    setDescription(dept?.description ?? "");
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await apiFetch(`/departments/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify({ name, description }),
        });
      } else {
        await apiFetch("/departments", {
          method: "POST",
          body: JSON.stringify({ name, description }),
        });
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Kaydedilemedi / Save failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`"${dept.name}" silinsin mi? / Delete this department?`))
      return;
    try {
      await apiFetch(`/departments/${dept._id}`, { method: "DELETE" });
      fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silinemedi / Delete failed");
    }
  };

  if (loading)
    return <p className="text-clay-700">Yükleniyor... / Loading...</p>;
  if (error)
    return <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-clay-800">
          Departmanlar / Departments
        </h1>
        {admin && (
          <button
            onClick={() => openModal()}
            className="rounded-lg bg-bronze-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-bronze-700"
          >
            + Yeni Departman / New Department
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-bronze-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-bronze-100 text-clay-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Ad / Name</th>
              <th className="px-4 py-3 font-semibold">
                Açıklama / Description
              </th>
              {admin && (
                <th className="px-4 py-3 text-right font-semibold">
                  İşlemler / Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td
                  colSpan={admin ? 3 : 2}
                  className="px-4 py-8 text-center text-clay-700/60"
                >
                  Henüz departman yok. / No departments yet. 🏢
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr
                  key={dept._id}
                  className="border-t border-bronze-100 hover:bg-bronze-50"
                >
                  <td className="px-4 py-3 font-medium text-clay-800">
                    {dept.name}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80">
                    {dept.description || "—"}
                  </td>
                  {admin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openModal(dept)}
                        className="mr-3 text-bronze-700 hover:underline"
                      >
                        Düzenle / Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
                        className="text-red-600 hover:underline"
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

      <Modal
        open={modalOpen}
        title={
          editing
            ? "Departmanı Düzenle / Edit Department"
            : "Yeni Departman / New Department"
        }
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Ad / Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-bronze-200 px-3 py-2 focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Açıklama / Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-bronze-200 px-3 py-2 focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300"
            />
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
