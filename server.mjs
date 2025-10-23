import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse JSON bodies
app.use(express.json());

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running correctly 🚀" });
});

// ✅ Create record in Airtable
app.get("/api/create-record", async (req, res) => {
  try {
    if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE || !process.env.AIRTABLE_TOKEN) {
      return res.status(500).json({ message: "❌ Missing Airtable environment variables" });
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE}`,
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
                Prompt: "Test Ping",
                Status: "processing",
              },
            },
          ],
        }),
      }
    );

    const result = await response.json();
    res.json({ message: "✅ Record created successfully!", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to create record", error: err.message });
  }
});

// ✅ Get all Airtable records
app.get("/api/records", async (req, res) => {
  try {
    if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE || !process.env.AIRTABLE_TOKEN) {
      return res.status(500).json({ message: "❌ Missing Airtable environment variables" });
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    )

    const result = await response.json();
    res.json({ message: "✅ Records fetched successfully!", data: result.records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to fetch records", error: err.message });
  }
});

// ✅ POST route to generate batch (for testing)
app.post("/api/generate-batch", async (req, res) => {
  const { prompt, subject, references, width, height, batchCount } = req.body;

  if (!prompt || !subject) {
    return res.status(400).json({ message: "Prompt and Subject Image URL are required" });
  }

  // For now, just echo back payload (later you can integrate WaveSpeed + Airtable)
  res.json({
    message: "✅ Payload received successfully!",
    payload: req.body,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
