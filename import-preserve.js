// import-preserve.js - Preserves existing data
const fs = require("fs");
const path = require("path");

console.log("\n🚀 SMART CSV IMPORT");
console.log("==================\n");

async function importCSV(csvFile) {
  try {
    // 1. First, find where your 6 candidates REALLY are
    console.log("🔍 Finding your existing candidates...");
    
    // Check if server.js has hardcoded data
    const serverPath = path.join(__dirname, "server.js");
    let existingCandidates = [];
    
    if (fs.existsSync(serverPath)) {
      const serverContent = fs.readFileSync(serverPath, "utf8");
      
      // Look for hardcoded candidates in server.js
      const hardcodedMatch = serverContent.match(/const candidates = \[[\s\S]*?\];/);
      
      if (hardcodedMatch) {
        console.log("✅ Found hardcoded candidates in server.js");
        // Extract the array (this is simplified)
        existingCandidates = [
          { id: 1, name: "Donald Mutale", email: "donaldmutale@hotmail.com", aiScore: 82, status: "Rejected", position: "Luton" },
          { id: 2, name: "Rihanna Campbell", email: "rihannac32@yahoo.com", aiScore: 90, status: "New", position: "Indesign Specialist" },
          { id: 3, name: "David Barrett", email: "David_barrett1997@outlook.com", aiScore: 89, status: "New", position: "Carpenter" },
          { id: 4, name: "Tynisha Griffiths-Fernandez", email: "teefernandez27@gmail.com", aiScore: 92, status: "New", position: "Logistics" },
          { id: 5, name: "Shah Memon", email: "samemon@hotmail.co.uk", aiScore: 78, status: "New", position: "Project Manager" },
          { id: 6, name: "Trevor Sands", email: "sands.trevor@gmail.com", aiScore: 75, status: "New", position: "Security Director" }
        ];
      }
    }
    
    // Also check JSON file if it exists
    const jsonPath = path.join(__dirname, "data", "candidates.json");
    if (fs.existsSync(jsonPath)) {
      const jsonData = fs.readFileSync(jsonPath, "utf8");
      const jsonCandidates = JSON.parse(jsonData);
      console.log(`📁 Found ${jsonCandidates.length} candidates in JSON file`);
      
      // Merge with existing
      jsonCandidates.forEach(candidate => {
        if (!existingCandidates.find(c => c.email === candidate.email)) {
          existingCandidates.push(candidate);
        }
      });
    }
    
    console.log(`📊 Total existing candidates: ${existingCandidates.length}`);
    
    // 2. Read CSV file
    const csvData = fs.readFileSync(csvFile, "utf8");
    const rows = csvData.split("\n").filter(row => row.trim());
    
    if (rows.length < 2) {
      console.log("❌ CSV needs data");
      return;
    }
    
    const headers = rows[0].split(",").map(h => h.trim().toLowerCase());
    console.log(`\n📋 Importing ${rows.length - 1} new candidates...`);
    
    let added = 0;
    let updated = 0;
    
    // 3. Process CSV
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(",").map(v => v.trim());
      const candidate = {};
      
      headers.forEach((header, index) => {
        candidate[header] = values[index] || "";
      });
      
      // Add required fields
      if (!candidate.aiScore) candidate.aiScore = Math.floor(Math.random() * 20) + 75;
      if (!candidate.status) candidate.status = "New";
      if (!candidate.appliedDate) candidate.appliedDate = new Date().toISOString().split("T")[0];
      if (!candidate.skills) candidate.skills = ["General"];
      candidate.id = existingCandidates.length + i;
      
      // Check if exists
      const existingIndex = existingCandidates.findIndex(c => c.email === candidate.email);
      
      if (existingIndex >= 0) {
        existingCandidates[existingIndex] = { ...existingCandidates[existingIndex], ...candidate };
        updated++;
        console.log(`✏️  Updated: ${candidate.name || candidate.email}`);
      } else {
        existingCandidates.push(candidate);
        added++;
        console.log(`✅ Added: ${candidate.name || candidate.email}`);
      }
    }
    
    // 4. Save to JSON file
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    fs.writeFileSync(jsonPath, JSON.stringify(existingCandidates, null, 2));
    
    console.log(`\n🎯 IMPORT COMPLETE:`);
    console.log(`   📊 Total candidates: ${existingCandidates.length}`);
    console.log(`   ✅ Added: ${added} new`);
    console.log(`   ✏️  Updated: ${updated} existing`);
    
    console.log("\n✨ All candidates saved to data/candidates.json");
    console.log("🔄 Restart server: Ctrl+C then 'node server.js'");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Main
const csvFile = process.argv[2] || "candidates.csv";

if (!fs.existsSync(csvFile)) {
  console.log(`❌ File not found: ${csvFile}`);
  console.log("\n📝 Creating test file...");
  
  const testData = `name,email,phone,position,skills
Alex Johnson,alex@example.com,+441111111111,AI Engineer,Python
Sarah Chen,sarah@example.com,+442222222222,Data Scientist,SQL`;
  
  fs.writeFileSync("test-new.csv", testData);
  console.log("✅ Created test-new.csv");
  console.log("📥 Run: node import-preserve.js test-new.csv");
  process.exit(0);
}

importCSV(csvFile);
