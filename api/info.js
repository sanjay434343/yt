import { Innertube } from "youtubei.js";

let ytPromise = Innertube.create(); // initialize once

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing video ID (?id=)" });

    const yt = await ytPromise; // await the initialized client
    const info = await yt.getInfo(id);

    const formats = info.streaming_data.adaptive_formats.map(f => ({
      itag: f.itag,
      mimeType: f.mime_type,
      bitrate: f.bitrate,
      quality: f.quality_label || null,
      audioQuality: f.audio_quality || null,
      url: f.deciphered_url || f.url || null
    }));

    res.status(200).json({
      success: true,
      video_id: id,
      title: info.basic_info.title,
      author: info.basic_info.author,
      thumbnails: info.basic_info.thumbnail,
      formats: formats.filter(f => f.url)
    });

  } catch (err) {
    console.error("Innertube fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch video info" });
  }
}
