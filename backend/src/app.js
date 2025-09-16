import express from "express";
import router from "./routes/song.routes.js";
import cors from "cors";

const app = express();

// Allow frontend requests
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"], // Allow Vite dev servers and direct requests
  methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTP methods
  credentials: true, // if you use cookies/auth headers
}));

app.use(express.json());
// Mount all API routes under /api
app.use("/api", router);

export default app;
