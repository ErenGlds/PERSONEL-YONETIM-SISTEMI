"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken } from "@/lib/api";
import { AuthResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Giriş başarısız/Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-bronze-700">Hitit CS</h1>
          <p className="mt-2 text-clay-700">Personel Yönetim Sistemi</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-bronze-200 bg-white p-8 shadow-lg"
        >
          <h2 className="mb-6 text-xl font-semibold text-clay-800">
            Giriş Yap/Login
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-clay-700">
              E-posta/E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-bronze-200 px-3 py-2 focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300"
              placeholder="(ad/firstname).(soyad/lastname)@hititcs.com"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-clay-700">
              Şifre/Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-bronze-200 px-3 py-2 focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-bronze-600 py-2.5 font-medium text-white transition hover:bg-bronze-700 disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor/Loging in . . ." : "Giriş Yap/Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
