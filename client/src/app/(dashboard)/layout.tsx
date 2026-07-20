"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import { User } from "@/types";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const token = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("token"),
    () => null,
  );

  const userJson = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("user"),
    () => null,
  );

  const user: User | null = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    if (token === null) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-clay-700">Yükleniyor/Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-end gap-4 border-b border-bronze-200 bg-white px-6 py-3">
          <div className="text-right">
            <p className="text-sm font-medium text-clay-800">{user?.name}</p>
            <p className="text-xs text-clay-700/60">{user?.role}</p>
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
