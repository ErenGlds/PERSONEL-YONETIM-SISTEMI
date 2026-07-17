"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Holiday } from "@/types";
import Modal from "@/components/modal";

const emptyForm = { name: "", date: "", description: "" };

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchHolidays = () => {
    apiFetch<Holiday[]>("/holidays")
      .then((data) => {
        setHolidays(data);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Hata"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openModal = (holiday: Holiday | null = null) => {
    setEditing(holiday);
    setForm(
      holiday
        ? {
            name: holiday.name,
            date: holiday.date.slice(0, 10),
            description: holiday.description ?? "",
          }
        : emptyForm,
    );
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/holidays/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch("/holidays", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setModalOpen(false);
      fetchHolidays();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Kaydedilemedi / Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (holiday: Holiday) => {
    if (!confirm(`"${holiday.name}" silinsin mi? / Delete this holiday?`))
      return;
    try {
      await apiFetch(`/holidays/${holiday._id}`, { method: "DELETE" });
      fetchHolidays();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silinemedi / Delete failed");
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR");

  const isPast = (iso: string) => new Date(iso) < new Date();

  const inputCls =
    "w-full rounded-lg border border-bronze-200 px-3 py-2 focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300";

  if (loading)
    return <p className="text-clay-700">Yükleniyor... / Loading...</p>;
  if (error)
    return <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-clay-800">
          Tatiller / Holidays
        </h1>
        <button
          onClick={() => openModal()}
          className="rounded-lg bg-bronze-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-bronze-700"
        >
          + Yeni Tatil / New Holiday
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-bronze-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-bronze-100 text-clay-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Ad / Name</th>
              <th className="px-4 py-3 font-semibold">Tarih / Date</th>
              <th className="px-4 py-3 font-semibold">
                Açıklama / Description
              </th>
              <th className="px-4 py-3 text-right font-semibold">
                İşlemler / Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {holidays.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-clay-700/60"
                >
                  Henüz tatil yok. / No holidays yet. 🎉
                </td>
              </tr>
            ) : (
              holidays.map((holiday) => (
                <tr
                  key={holiday._id}
                  className={`border-t border-bronze-100 hover:bg-bronze-50 ${
                    isPast(holiday.date) ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-clay-800">
                    {holiday.name}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80">
                    {formatDate(holiday.date)}
                  </td>
                  <td className="px-4 py-3 text-clay-700/80">
                    {holiday.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openModal(holiday)}
                      className="mr-3 text-bronze-700 hover:underline"
                    >
                      Düzenle / Edit
                    </button>
                    <button
                      onClick={() => handleDelete(holiday)}
                      className="text-red-600 hover:underline"
                    >
                      Sil / Delete
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
          editing ? "Tatili Düzenle / Edit Holiday" : "Yeni Tatil / New Holiday"
        }
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Ad / Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Tarih / Date *
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
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
              rows={2}
              className={inputCls}
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
