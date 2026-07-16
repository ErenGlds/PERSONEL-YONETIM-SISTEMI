"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { User } from "@/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [hasToken] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return getToken() !== null;
  });

  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (!hasToken) {
      router.replace("/login");
    }
  }, [hasToken, router]);

  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-clay-700">Yönlendiriliyor/Directing...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-end border-b border-bronze-200 bg-white px-6 py-3">
          <div className="text-right">
            <p className="text-sm font-medium text-clay-800">{user?.name}</p>
            <p className="text-xs text-clay-700/60">{user?.role}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
