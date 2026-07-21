"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/api";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Departmanlar-Departments", path: "/departments", icon: "🏢" },
  { name: "Çalışanlar-Employees", path: "/employees", icon: "👥" },
  { name: "İzinler-Leaves", path: "/leaves", icon: "📅" },
  { name: "Tatiller-Holidays", path: "/holidays", icon: "🎉" },
  { name: "Görevler-Tasks", path: "/tasks", icon: "📋" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-clay-900 text-bronze-100">
      <div className="border-b border-clay-700 p-6">
        <h1 className="text-2xl font-bold text-bronze-400">Hitit CS</h1>
        <p className="mt-1 text-xs text-bronze-200/60">
          Personel Yönetim Sistemi
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                isActive
                  ? "bg-bronze-600 font-medium text-white"
                  : "text-bronze-100/80 hover:bg-clay-800 hover:text-bronze-100"
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-clay-700 p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-bronze-100/80 transition hover:bg-clay-800 hover:text-red-300"
        >
          Çıkış Yap/Log off
        </button>
      </div>
    </aside>
  );
}
