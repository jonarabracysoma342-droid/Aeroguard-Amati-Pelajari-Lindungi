import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Ask Gemini AI about air quality
  app.post("/api/gemini/tanya", async (req, res) => {
    try {
      const { question, moduleName, context } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Pertanyaan tidak boleh kosong." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Fallback: If API key is missing, return a beautifully simulated response
        // so that the applet functions gracefully even without an active key.
        console.warn("GEMINI_API_KEY is not configured. Falling back to educational simulation.");
        
        let simulatedAnswer = `Halo! Terima kasih atas pertanyaannya mengenai "${moduleName || 'Kualitas Udara'}". \n\nSebagai asisten AI Udaraku, berikut penjelasannya:\n\nPolusi udara seperti PM2.5, karbon monoksida (CO), atau ISPA adalah masalah serius. Ketika kadar polutan tinggi, saluran pernapasan kita terpapar partikel halus yang memicu inflamasi, batuk, hingga sesak napas. Cara mitigasi terbaik adalah memantau indeks kualitas udara (AQI), memakai masker respirator (seperti KN95/KF94) saat beraktivitas di luar, menggunakan penyaring udara (HEPA filter) di dalam ruangan, dan menanam tanaman penyerap polutan.\n\n*(Catatan: Silakan konfigurasikan GEMINI_API_KEY di Settings > Secrets untuk mendapatkan jawaban AI interaktif yang lebih mendalam!)*`;
        
        return res.json({ answer: simulatedAnswer });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemPrompt = `Anda adalah "Asisten AI Udaraku", seorang ahli edukasi kualitas udara dan kesehatan lingkungan yang ramah, interaktif, dan mudah dipahami oleh anak sekolah atau siswa (berusia 10-15 tahun).
Anda sedang mendampingi siswa membaca materi modul "${moduleName || 'Kualitas Udara'}".
Berikut ringkasan materi modul tersebut sebagai konteks tambahan untuk membantu Anda menjawab pertanyaan siswa dengan akurat:
${context ? JSON.stringify(context) : 'Kualitas udara, polusi udara, dampak kesehatan, dan aksi mitigasi hijau.'}

Aturan menjawab:
1. Jawablah menggunakan Bahasa Indonesia yang santun, mendidik, hangat, dan memberikan semangat (gunakan sapaan hangat seperti "Halo!", "Pertanyaan bagus sekali!", dll).
2. Sampaikan penjelasan ilmiah secara sederhana dan mudah dimengerti anak sekolah. Gunakan analogi yang menarik jika perlu.
3. Berikan solusi praktis atau langkah aksi nyata (Eco-Action) yang bisa siswa lakukan di rumah atau sekolah untuk menjaga kebersihan udara.
4. Jaga agar panjang jawaban berkisar antara 2 sampai 4 paragraf agar tidak terlalu panjang namun tetap mendalam.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: question,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const answer = response.text || "Maaf, AI tidak dapat menghasilkan jawaban saat ini. Silakan coba lagi.";
      res.json({ answer });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Gagal berkomunikasi dengan AI. " + (error.message || "") });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
