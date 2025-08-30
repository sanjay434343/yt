import { Innertube } from "youtubei.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { id } = req.query; // YouTube video ID
    if (!id) {
      return res.status(400).json({ error: "Missing video ID (?id=)" });
    }

    const yt = await Innertube.create();

    // Get stream info
    const info = await yt.getInfo(id);

    // Extract audio & video formats
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
      formats: formats.filter(f => f.url) // only send playable URLs
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video info" });
  }
}
