import { Response } from "express";
import { buildContext } from "../utils/buildContext";
import { AuthRequest } from "../middleware/authMIDDLEware";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || !message.trim()) {
      res
        .status(400)
        .json({ message: "Mesaj boş olamaz / Message is required" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res
        .status(500)
        .json({ message: "AI servisi yapılandırılmamış / AI not configured" });
      return;
    }

    const isAdmin = req.user?.role === "admin";
    const context = await buildContext(isAdmin);

    const systemPrompt = `Sen "Hitit CS Personel Yönetim Sistemi"nin yapay zeka asistanısın.
Görevin: aşağıdaki güncel sistem verisine dayanarak kullanıcının sorularını yanıtlamak.

KURALLAR:
- Sadece verilen veriye dayan. Veride olmayan bir bilgi sorulursa "Bu bilgi sistemde bulunmuyor" de, ASLA uydurma.
- Kısa, net ve sorulan dilde cevap ver.
- Sayı veya liste soruluyorsa maddeler halinde yaz.
- Kullanıcının yetkisi: ${isAdmin ? "Yönetici (admin)" : "Çalışan (employee)"}.
${isAdmin ? "" : "- Maaş bilgisi sana verilmedi; maaş sorulursa 'Bu bilgiye erişim yetkiniz yok' de."}

${context}`;

    const contents = [
      ...(history ?? []).slice(-10).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error("Gemini API hatası:", response.status, raw);
      res.status(502).json({
        message: "AI servisi hata döndü / AI service error",
        detail: raw.slice(0, 500),
      });
      return;
    }

    const data = JSON.parse(raw) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Cevap üretilemedi / No response generated";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("AI hatası:", error);
    res.status(500).json({
      message: "AI servisine ulaşılamadı / AI service unavailable",
    });
  }
};
