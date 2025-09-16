import dotenv from "dotenv";

// Load .env first
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
