// seed-database.js
require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

const CandidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  position: String,
  title: String,
  location: String,
  status: { type: String, default: "new" },
  aiScore: Number,
  skills: [String],
  experience: String,
  matchReason: String,
  createdAt: { type: Date, default: Date.now }
});

const Candidate = mongoose.model('Candidate', CandidateSchema);

async function seedDatabase() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Candidate.deleteMany({});
    console.log('🗑️  Cleared existing candidates');
    
    // Add mock candidates
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
    
    await Candidate.insertMany(mockCandidates);
    console.log(`✅ Seeded database with ${mockCandidates.length} candidates`);
    
    // Display what we added
    const count = await Candidate.countDocuments();
    console.log(`📊 Total candidates in database: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();