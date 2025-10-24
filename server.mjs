// server.mjs
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // optional, only if Node < 18

dotenv.config(); // Load environment variables from .env

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON from requests
app.use(express.static("Public")); // Serve your frontend files

// Endpoint to generate images via WaveSpeed API
app.post("/api/generate-batch", async (req, res) => {
  const { prompt, subject, references, width, height, batchCount } = req.body;

  if (!prompt || !subject) {
    return res.status(400).json({ message: "❌ Prompt and Subject URL are required!" });
  }

  try {
    // Call WaveSpeed API
    const wsResponse = await fetch("https://api.wavespeed.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WAVESPEED_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        subject,
        references: references || [],
        width: width || 512,
        height: height || 512,
        batchCount: batchCount || 1,
      }),
    });

    const wsData = await wsResponse.json();

    // Here: log to Airtable
    if (process.env.AIRTABLE_BASE_ID && process.env.AIRTABLE_TABLE && process.env.AIRTABLE_TOKEN) {
      const airtableResp = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  Prompt: prompt,
                  Subject: subject,
                  References: references ? references.join(", ") : "",
                  Width: width || 512,
                  Height: height || 512,
                  BatchCount: batchCount || 1,
                  GeneratedImages: wsData.images ? wsData.images.join(", ") : "",
                  Timestamp: new Date().toISOString(),
                },
              },
            ],
          }),
        }
      );

      if (!airtableResp.ok) {
        console.error("⚠️ Failed to log to Airtable");
      }
    }

    res.json({
      message: "✅ Images generated successfully and logged to Airtable!",
      images: wsData.images || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to generate images" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
