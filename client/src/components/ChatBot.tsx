"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Şu an kimler müsait?",
  "Kaç kişi izinde?",
  "Bekleyen görevler neler?",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history = messages;
    setMessages([...history, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch<{ reply: string }>("/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed, history }),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? `⚠️ ${err.message}`
              : "⚠️ Bir hata oluştu / An error occurred",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-bronze-600 text-2xl text-white shadow-lg transition hover:bg-bronze-700 dark:bg-bronze-500 dark:hover:bg-bronze-600"
        title="AI Asistan"
      >
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-96 flex-col overflow-hidden rounded-xl border border-bronze-200 bg-white shadow-2xl dark:border-clay-700 dark:bg-clay-800">
          <div className="border-b border-bronze-100 bg-clay-900 px-4 py-3 dark:border-clay-700 dark:bg-clay-950">
            <h3 className="font-semibold text-bronze-100">
              🤖 Hitit CS Asistan
            </h3>
            <p className="text-xs text-bronze-200/60">
              Sistem verilerine göre yanıtlar / Answers from system data
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-bronze-50/40 p-4 dark:bg-clay-900/40">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-center text-sm text-clay-700/60 dark:text-bronze-200/60">
                  Merhaba! Personel sistemi hakkında soru sorabilirsiniz.
                </p>
                <div className="space-y-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full rounded-lg border border-bronze-200 bg-white px-3 py-2 text-left text-sm text-clay-700 transition hover:bg-bronze-50 dark:border-clay-700 dark:bg-clay-800 dark:text-bronze-200 dark:hover:bg-clay-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-bronze-600 text-white dark:bg-bronze-500"
                      : "border border-bronze-100 bg-white text-clay-800 dark:border-clay-700 dark:bg-clay-900 dark:text-bronze-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-bronze-100 bg-white px-3 py-2 text-sm text-clay-700/60 dark:border-clay-700 dark:bg-clay-900 dark:text-bronze-200/60">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce [animation-delay:0.15s]">
                      ●
                    </span>
                    <span className="animate-bounce [animation-delay:0.3s]">
                      ●
                    </span>
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-bronze-100 bg-white p-3 dark:border-clay-700 dark:bg-clay-800"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sorunuzu yazın... / Ask a question..."
              className="flex-1 rounded-lg border border-bronze-200 px-3 py-2 text-sm focus:border-bronze-500 focus:outline-none dark:border-clay-700 dark:bg-clay-900 dark:text-bronze-100 dark:placeholder:text-bronze-200/40"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-bronze-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-bronze-700 disabled:opacity-50 dark:bg-bronze-500 dark:hover:bg-bronze-600"
            >
              Gönder
            </button>
          </form>
        </div>
      )}
    </>
  );
}
