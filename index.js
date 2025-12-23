require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// --- 1. CONNECT TO THE CLOUD DATABASE ---
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ Database connection error:", err));

// --- 2. DEFINE DATA MODEL ---
const CandidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  status: { type: String, default: "new" },
  position: String,
  created: { type: Date, default: Date.now }
});

const Candidate = mongoose.model("Candidate", CandidateSchema);

// --- 3. API ROUTES (Talking to the Database) ---
app.get("/api/stats", async (req, res) => {
  try {
    const all = await Candidate.find();
    res.json({
      total: all.length,
      new: all.filter(c => c.status === "new").length,
      interview: all.filter(c => c.status === "interview").length,
      hired: all.filter(c => c.status === "hired").length,
      message: "Cloud CRM Active"
    });
  } catch (err) { res.status(500).json(err); }
});

app.get("/api/candidates", async (req, res) => {
  const all = await Candidate.find().sort({ created: -1 });
  res.json(all);
});

app.post("/api/candidates", async (req, res) => {
  const newCandidate = new Candidate(req.body);
  await newCandidate.save();
  res.json(newCandidate);
});

// Serve static files
app.use(express.static("."));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
{
  "name": "ai-talent-crm",
  "version": "1.0.0",
  "description": "Talent CRM with AI Scoring",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "mongoose": "^7.0.0",
    "openai": "^4.0.0"
  }
}