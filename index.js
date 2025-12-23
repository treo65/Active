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
// --- 4. SERVE STATIC FILES & DASHBOARD ---
// This tells the server to look in the same folder for your HTML/CSS/JS
app.use(express.static(__dirname));

// This fixes the "Cannot GET /" error by pointing the home page to your dashboard
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/crm-dashboard.html");
});

// Explicit route for the dashboard
app.get("/crm-dashboard.html", (req, res) => {
  res.sendFile(__dirname + "/crm-dashboard.html");
});

// --- 5. START SERVER ---
// Using 10000 or process.env.PORT is required for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Stats: /api/stats`);
});
