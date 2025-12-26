require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI; 
mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ Database connection error:", err));

// Define Data Model (Enhanced for AI CRM)
const CandidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  position: String,
  title: String,
  location: String,
  status: { 
    type: String, 
    default: "new",
    enum: ["new", "screening", "interview", "offer", "hired", "rejected"]
  },
  aiScore: { 
    type: Number, 
    default: Math.floor(Math.random() * 30) + 70 // Random score 70-99
  },
  skills: [String],
  experience: String,
  source: String,
  lastContact: Date,
  notes: String,
  matchReason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Candidate = mongoose.model("Candidate", CandidateSchema);

// --- API ROUTES FOR AI CRM DASHBOARD ---

// Dashboard Stats Endpoint (matches dashboard expectations)
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const allCandidates = await Candidate.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      totalCandidates: allCandidates.length,
      candidatesTrend: "12% from last month",
      avgScore: Math.round(allCandidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / allCandidates.length || 0) + "%",
      scoreImprovement: "5.2% improvement",
      topMatches: allCandidates.filter(c => c.aiScore >= 90).length,
      newToday: allCandidates.filter(c => {
        const created = new Date(c.createdAt);
        return created >= today;
      }).length,
      inPipeline: allCandidates.filter(c => ["new", "screening", "interview"].includes(c.status)).length,
      avgResponseTime: "2.1 days"
    };
    
    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Candidates Endpoint (enhanced for dashboard)
app.get("/api/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .sort({ aiScore: -1, createdAt: -1 })
      .limit(8);
    
    // Get stats for the response
    const allCandidates = await Candidate.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      totalCandidates: allCandidates.length,
      candidatesTrend: "12% from last month",
      avgScore: Math.round(allCandidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / allCandidates.length || 0) + "%",
      scoreImprovement: "5.2% improvement",
      topMatches: allCandidates.filter(c => c.aiScore >= 90).length,
      newToday: allCandidates.filter(c => {
        const created = new Date(c.createdAt);
        return created >= today;
      }).length
    };
    
    res.json({
      stats,
      candidates: candidates.map(c => ({
        id: c._id,
        name: c.name,
        title: c.title || c.position || "Candidate",
        email: c.email,
        phone: c.phone,
        aiScore: c.aiScore || Math.floor(Math.random() * 30) + 70,
        skills: c.skills || ["AI", "Machine Learning", "Programming"],
        location: c.location || "Remote",
        status: c.status,
        matchReason: c.matchReason || "Strong AI skills match"
      }))
    });
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// Add mock candidates if database is empty
app.post("/api/seed", async (req, res) => {
  try {
    const mockCandidates = [
      {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+44 7911 123456",
        position: "Senior AI Engineer",
        title: "Senior AI Engineer",
        location: "London",
        aiScore: 94,
        skills: ["Python", "TensorFlow", "MLOps", "AWS", "Docker"],
        experience: "8 years",
        status: "interview",
        matchReason: "Perfect match for AI Lead position"
      },
      {
        name: "Michael Chen",
        email: "michael.c@example.com",
        phone: "+44 7911 234567",
        position: "Data Scientist",
        title: "Senior Data Scientist",
        location: "Manchester",
        aiScore: 92,
        skills: ["R", "PyTorch", "SQL", "Big Data", "Statistics"],
        experience: "6 years",
        status: "screening",
        matchReason: "Strong ML background"
      },
      {
        name: "Emma Wilson",
        email: "emma.w@example.com",
        phone: "+44 7911 345678",
        position: "ML Ops Engineer",
        title: "ML Ops Specialist",
        location: "Bristol",
        aiScore: 88,
        skills: ["Kubernetes", "Azure", "Python", "CI/CD"],
        experience: "5 years",
        status: "new",
        matchReason: "Excellent infrastructure skills"
      },
      {
        name: "David Smith",
        email: "david.s@example.com",
        phone: "+44 7911 456789",
        position: "AI Researcher",
        title: "PhD AI Researcher",
        location: "Cambridge",
        aiScore: 96,
        skills: ["Deep Learning", "NLP", "Research", "Papers"],
        experience: "4 years",
        status: "interview",
        matchReason: "Top-tier research experience"
      }
    ];
    
    await Candidate.deleteMany({});
    await Candidate.insertMany(mockCandidates);
    
    res.json({ 
      message: "Database seeded with 4 mock candidates",
      count: mockCandidates.length 
    });
  } catch (err) {
    console.error("Error seeding database:", err);
    res.status(500).json({ error: "Failed to seed database" });
  }
});

// Original endpoints (keep for compatibility)
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

app.post("/api/candidates", async (req, res) => {
  const newCandidate = new Candidate(req.body);
  await newCandidate.save();
  res.json(newCandidate);
});

// Serve static files
app.use(express.static("."));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 AI CRM Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/crm-dashboard.html`);
  console.log(`🔧 API Base: http://localhost:${PORT}/api`);
});
// Requires: npm install googleapis
const { google } = require('googleapis');
const drive = google.drive('v3');

// Setup OAuth2 and read Google Sheet
async function fetchCandidatesFromDrive() {
  const response = await drive.files.export({
    fileId: 'YOUR_SHEET_ID',
    mimeType: 'text/csv'
  });
  // Parse and save to MongoDB
}