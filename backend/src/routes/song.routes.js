import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { uploadImage } from "../service/storage.service.js";
import SongModel from "../models/song.model.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Health check endpoint
router.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const dbStates = ["disconnected","connected","connecting","disconnecting"]; 
  res.status(200).json({ 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    status: "healthy",
    db: {
      state: dbStates[dbState] || "unknown",
      readyState: dbState
    }
  });
});

// Create a song (with audio upload)
router.post("/song", upload.single("audio"), async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const filedata = await uploadImage(req.file);
    console.log("Uploaded:", filedata);

    const song = await SongModel.create({
      title: req.body.title,
      artist: req.body.artist,
      mood: req.body.mood,
      audio: filedata.url, // save uploaded audio URL
    });

    res.status(201).json({
      message: "Song created",
      song,
    });
  } catch (err) {
    console.error("Error creating song:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get songs (optionally filter by mood)
router.get("/song", async (req, res) => {
  try {
    const { mood } = req.query;
    let songs;

    if (mood) {
      songs = await SongModel.find({ mood });
    } else {
      songs = await SongModel.find();
    }

    // Create formatted songs to ensure full URLs
    const formattedSongs = songs.map(song => {
      const fullAudioUrl = song.audio;
      console.log("Full audio URL:", fullAudioUrl);
      
      // Check if audio URL exists
      if (!fullAudioUrl) {
        console.error("Missing audio URL for song:", song._id);
      }
      
      // Create a complete object with all fields to avoid truncation
      return {
        _id: song._id,
        title: song.title || "Unknown Title",
        artist: song.artist || "Unknown Artist",
        mood: song.mood,
        audio: fullAudioUrl || ""
      };
    });
    
    // Log the complete response to verify no truncation
    console.log("Sending response with tracks:", JSON.stringify(formattedSongs, null, 2));
    
    res.status(200).json({
      message: "Songs retrieved successfully",
      tracks: formattedSongs, // 👈 keep key consistent with frontend
    });
  } catch (err) {
    console.error("Error fetching songs:", err);
    res.status(500).json({ message: "Server error", error: err?.message || "" });
  }
});

export default router;
