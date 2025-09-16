import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  mood: String,
  audio: String,
});

const SongModel = mongoose.model("Song", songSchema);

export default SongModel;
