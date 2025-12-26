// server-simple.js - Working server without OpenAI
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

console.log('\n🚀 SIMPLE CRM SERVER STARTING...\n');

// Database path
const dbPath = path.join(__dirname, 'data', 'candidates.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initialize database if not exists
if (!fs.existsSync(dbPath)) {
    const initialData = [
        {
            id: 1,
            name: "Donald Mutale",
            email: "donaldmutale@hotmail.com",
            phone: "+447933544411",
            status: "Rejected",
            aiScore: 82,
            position: "Luton",
            skills: ["Retail"],
            appliedDate: "2025-12-21",
            source: "Original Database"
        }
    ];
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    console.log('📁 Created initial database');
}

// Helper function to read database
function readDatabase() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Database read error:', error);
        return [];
    }
}

// Helper function to write database
function writeDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Database write error:', error);
        return false;
    }
}

// API: Get statistics
app.get("/api/stats", (req, res) => {
    try {
        const candidates = readDatabase();
        
        // Calculate statistics
        const total = candidates.length;
        const averageAiScore = total > 0 ? 
            Math.round(candidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / total) : 0;
        const topMatches = candidates.filter(c => (c.aiScore || 0) >= 90).length;
        const newToday = candidates.filter(c => {
            const today = new Date().toISOString().split('T')[0];
            return c.appliedDate === today;
        }).length;
        
        res.json({
            total: total,
            totalApplications: total,
            averageAiScore: averageAiScore,
            topMatches: topMatches,
            newToday: newToday,
            candidates: candidates.slice(0, 8), // Return first 8
            message: "CRM Active with " + total + " candidates"
        });
        
    } catch (error) {
        console.error('❌ Stats error:', error);
        res.status(500).json({ error: "Failed to get stats" });
    }
});

// API: Get all candidates
app.get("/api/candidates", (req, res) => {
    try {
        const candidates = readDatabase();
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: "Failed to get candidates" });
    }
});

// API: Add new candidate
app.post("/api/candidates", (req, res) => {
    try {
        const candidates = readDatabase();
        const newCandidate = req.body;
        
        // Generate ID
        newCandidate.id = candidates.length > 0 ? 
            Math.max(...candidates.map(c => c.id)) + 1 : 1;
        
        // Set default values
        if (!newCandidate.aiScore) newCandidate.aiScore = Math.floor(Math.random() * 20) + 75;
        if (!newCandidate.status) newCandidate.status = "New";
        if (!newCandidate.appliedDate) newCandidate.appliedDate = new Date().toISOString().split('T')[0];
        if (!newCandidate.skills) newCandidate.skills = ["General"];
        
        candidates.push(newCandidate);
        
        if (writeDatabase(candidates)) {
            res.json(newCandidate);
        } else {
            res.status(500).json({ error: "Failed to save candidate" });
        }
        
    } catch (error) {
        res.status(500).json({ error: "Failed to add candidate" });
    }
});

// API: Update candidate
app.put("/api/candidates/:id", (req, res) => {
    try {
        const candidates = readDatabase();
        const id = parseInt(req.params.id);
        const index = candidates.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        
        candidates[index] = { ...candidates[index], ...req.body };
        
        if (writeDatabase(candidates)) {
            res.json(candidates[index]);
        } else {
            res.status(500).json({ error: "Failed to update candidate" });
        }
        
    } catch (error) {
        res.status(500).json({ error: "Failed to update candidate" });
    }
});

// Serve static files
app.use(express.static(__dirname));

// Default route
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI Talent CRM</title>
            <style>
                body { font-family: Arial; padding: 40px; text-align: center; }
                h1 { color: #333; }
                .links { margin: 30px; }
                .links a { display: inline-block; margin: 10px; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>🚀 AI Talent CRM System</h1>
            <p>Your recruitment system is running successfully!</p>
            <div class="links">
                <a href="/dashboard-final.html">📊 Go to Dashboard</a>
                <a href="/crm-dashboard.html">📈 Original Dashboard</a>
                <a href="/api/stats">📡 View API</a>
            </div>
            <p style="margin-top: 40px; color: #666;">
                API Endpoint: <code>http://localhost:3001/api/stats</code>
            </p>
        </body>
        </html>
    `);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    const candidates = readDatabase();
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📂 Database: ${dbPath}`);
    console.log(`👥 Candidates loaded: ${candidates.length}`);
    console.log(`💻 Dashboard: http://localhost:${PORT}/dashboard-final.html`);
    console.log(`📡 API: http://localhost:${PORT}/api/stats`);
    console.log('\n🎯 System ready!');
});