"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full p-2 text-xl transition hover:bg-bronze-100 dark:hover:bg-clay-800"
      title={
        theme === "light" ? "Koyu tema / Dark mode" : "Açık tema / Light mode"
      }
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
