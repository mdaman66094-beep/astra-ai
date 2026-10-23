const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({ status: "online", name: "Astra AI" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Apna sawal likhiye." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable missing");
      return res.status(500).json({
        error: "Server par API key nahi mili. Render Environment check karein."
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: "You are Astra AI, a helpful assistant. Reply in Hindi when the user writes in Hindi.\n\nUser: " + message
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API returned HTTP", response.status);
      return res.status(502).json({
        error: "Gemini API se jawab nahi mila. API key, model access aur quota check karein."
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "").join("");

    res.json({ reply: reply || "Abhi jawab nahi mila." });
  } catch (error) {
    console.error("Chat request failed:", error.message);
    res.status(500).json({ error: "Server mein dikkat hai. Dobara koshish karein." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Astra AI running on port ${PORT}`);
});
