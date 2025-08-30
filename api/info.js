import express from "express";
import { Innertube } from "youtubei.js";
import cors from "cors";

const app = express();
app.use(cors()); // allow all origins

// API: /info?id=VIDEO_ID or /info?url=FULL_YOUTUBE_URL
app.get("/", async (req, res) => {
  try {
    let { id, url } = req.query;

    if (!id && !url) return res.status(400).json({ error: "Provide ?id=VIDEO_ID or ?url=FULL_YOUTUBE_URL" });

    // Extract video ID if URL is provided
    if (url && !id) {
      const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      if (match) id = match[1];
      else return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Initialize Innertube on each request
    const yt = await Innertube.create();
    const info = await yt.getInfo(id);

    const formats = info.streaming_data.adaptive_formats.map(f => ({
      itag: f.itag,
      mimeType: f.mime_type,
      quality: f.quality_label || null,
      audioQuality: f.audio_quality || null,
      url: f.deciphered_url || f.url || null
    }));

    res.json({
      success: true,
      video_id: id,
      title: info.basic_info.title,
      author: info.basic_info.author,
      thumbnails: info.basic_info.thumbnail,
      formats: formats.filter(f => f.url)
    });

  } catch (err) {
    console.error("Innertube error:", err.message);
    res.status(500).json({ error: "Failed to fetch video info" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
