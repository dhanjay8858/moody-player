import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "./src/db/db.js";
import SongModel from "./src/models/song.model.js";

async function seed() {
  try {
    await connectDB();

    const sample = [
      {
        title: "Sunrise Serenade",
        artist: "Ava Carter",
        mood: "happy",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
      {
        title: "Midnight Reflections",
        artist: "Noah Blake",
        mood: "sad",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      },
      {
        title: "Calm Waters",
        artist: "Mia Rivera",
        mood: "neutral",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      },
    ];

    await SongModel.deleteMany({});
    await SongModel.insertMany(sample);
    console.log("✅ Seeded sample songs");
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();


