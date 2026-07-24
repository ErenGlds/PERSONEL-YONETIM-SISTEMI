"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface NotificationItem {
  _id: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    apiFetch<NotificationResponse>("/notifications")
      .then((data) => {
        setItems(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && unreadCount > 0) {
      try {
        await apiFetch("/notifications/read", { method: "PUT" });
        setUnreadCount(0);
      } catch {}
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    setOpen(false);
    if (item.link) router.push(item.link);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch {}
  };

  const handleClearAll = async () => {
    try {
      await apiFetch("/notifications/clear", { method: "DELETE" });
      setItems([]);
      setUnreadCount(0);
    } catch {}
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative rounded-full p-2 text-xl transition hover:bg-bronze-100 dark:hover:bg-clay-800"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-bronze-200 bg-white shadow-xl dark:border-clay-700 dark:bg-clay-800">
          <div className="flex items-center justify-between border-b border-bronze-100 bg-bronze-50 px-4 py-3 dark:border-clay-700 dark:bg-clay-900">
            <h3 className="text-sm font-semibold text-clay-800 dark:text-bronze-100">
              Bildirimler / Notifications
            </h3>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:underline"
              >
                Temizle / Clear
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-clay-700/60">
                Bildirim yok. / No notifications. 🔕
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={`flex w-full cursor-pointer items-start justify-between gap-2 border-b border-bronze-100 px-4 py-3 text-left text-sm transition hover:bg-bronze-50 dark:border-clay-700 dark:hover:bg-clay-900 ${
                    item.read
                      ? "text-clay-700/70 dark:text-bronze-200/60"
                      : "bg-bronze-50/50 font-medium text-clay-800 dark:bg-clay-900/50 dark:text-bronze-100"
                  }`}
                >
                  <div>
                    <p>{item.message}</p>
                    <p className="mt-1 text-xs text-clay-700/50">
                      {formatTime(item.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, item._id)}
                    className="shrink-0 rounded p-1 text-clay-700/40 transition hover:bg-red-50 hover:text-red-600"
                    title="Sil / Delete"
                  >
                    X
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
