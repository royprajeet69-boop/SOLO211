import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiInstance: GoogleGenAI | null = null;
function getAIInstance() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required in secrets");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// AI Chatbot endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      res.status(400).json({ error: "Invalid history array in request body." });
      return;
    }

    // Lazy load the Gemini client & check API key
    const ai = getAIInstance();

    // Map history to Google GenAI format (role must be "user" or "model")
    const contents = history.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const systemInstruction = 
      "You are 'PureSpace CleanBot', an elegant, warm, and highly professional AI Clean Assistant for 'PureSpace Cleaning'. " +
      "Your goals are to help clients understand PureSpace's capabilities, services, and pricing, and guide them into booking. " +
      "\n\nHere is info about PureSpace Services:\n" +
      "1. Residential Cleaning ($79 base price) - Standard detailed upkeep: dusting, vacuuming, mopping, kitchen & living space sanitation.\n" +
      "2. Office & Commercial ($189 base price) - Tailored workspace polishing, trash management, communal sanitization.\n" +
      "3. Deep Clean & Move-Out ($249 base price) - Heavy grease scrubbing, oven/fridge interior polish, high dusting, deep sanitation checks.\n" +
      "\nPricing Plans:\n" +
      "- Basic ($59) - Best for small flats/regular upkeep. Covers basic dusting, vacuuming, sweeps, eco supplies.\n" +
      "- Standard ($149) - Detailed kitchen/bath deep sanitation, window polishing, exterior appliances, bi-weekly favorite.\n" +
      "- Premium ($299) - Luxury deep sanitation, cabinet interiors, carpet fluffing, aroma selection, 3 professional cleaners.\n\n" +
      "Our special features include organic eco-friendly safe supplies, background-checked professional cleaners, and 100% satisfaction satisfaction guarantees.\n\n" +
      "Formatting Instructions:\n" +
      "- Maintain an elegant, luxurious, yet humble and helpful tone.\n" +
      "- Write answers using clear formatting, tiny lists, bold terms, keeping answers short and concise (under 150 words).\n" +
      "- Never make up plans or coupons we don't have. Guide them gracefully to complete the booking form or contact support via WhatsApp/FB/Instagram.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I am here to guide you with any eco-clean queries. How can I assist you today?";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Something went wrong while connecting to Gemini AI.",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
