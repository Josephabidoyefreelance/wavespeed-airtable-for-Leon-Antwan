import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ✅ Health Check Endpoint
app.get('/', (req, res) => {
  res.send(`
    <h2>✅ WaveSpeed + Airtable Server Running!</h2>
    <p>If you're seeing this, the backend works!</p>
  `);
});

// ✅ Placeholder: Image generation endpoint
app.post('/generate', async (req, res) => {
  try {
    console.log("Received generation request:", req.body);

    // --- For now, respond with a mock (until we add real APIs) ---
    return res.json({
      success: true,
      imageUrl: "https://placehold.co/600x400?text=Mock+Image",
      message: "Temporary mock image returned ✅"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error generating image"
    });
  }
});

// ✅ Required by Render — use Render PORT variable!
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running on Render port ${PORT}`);
});
