// import-to-json.js - Updates your candidates.json directly
const fs = require('fs');
const path = require('path');

console.log('\n🚀 CSV TO JSON IMPORT');
console.log('=====================\n');

function importCSV(csvFile) {
  try {
    // Read CSV
    const csvData = fs.readFileSync(csvFile, 'utf8');
    const rows = csvData.split('\n').filter(row => row.trim());
    
    if (rows.length < 2) {
      console.log('❌ Need header + data rows');
      return;
    }
    
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
    console.log(`📋 Processing ${rows.length - 1} candidates...\n`);
    
    // Read existing JSON file
    const jsonPath = path.join(__dirname, 'data', 'candidates.json');
    let existingCandidates = [];
    
    if (fs.existsSync(jsonPath)) {
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      existingCandidates = JSON.parse(jsonData);
      console.log(`📁 Found ${existingCandidates.length} existing candidates`);
    } else {
      console.log('📁 Creating new candidates.json file');
      // Create data directory if it doesn't exist
      if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
      }
    }
    
    let added = 0;
    let updated = 0;
    
    // Process each CSV row
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',').map(v => v.trim());
      const candidate = {};
      
      // Map headers to values
      headers.forEach((header, index) => {
        candidate[header] = values[index] || '';
      });
      
      // Add missing fields
      if (!candidate.aiScore) candidate.aiScore = Math.floor(Math.random() * 20) + 75;
      if (!candidate.status) candidate.status = 'New';
      if (!candidate.appliedDate) candidate.appliedDate = new Date().toISOString().split('T')[0];
      if (!candidate.skills) candidate.skills = ['General'];
      
      // Generate ID
      candidate.id = existingCandidates.length + i;
      
      // Check if email already exists
      const existingIndex = existingCandidates.findIndex(c => c.email === candidate.email);
      
      if (existingIndex >= 0) {
        // Update existing
        existingCandidates[existingIndex] = { ...existingCandidates[existingIndex], ...candidate };
        updated++;
        console.log(`✏️  Updated: ${candidate.name || candidate.email}`);
      } else {
        // Add new
        existingCandidates.push(candidate);
        added++;
        console.log(`✅ Added: ${candidate.name || candidate.email} (ID: ${candidate.id})`);
      }
    }
    
    // Save back to JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(existingCandidates, null, 2));
    
    console.log(`\n🎯 IMPORT COMPLETE:`);
    console.log(`   ✅ Added: ${added} new candidates`);
    console.log(`   ✏️  Updated: ${updated} existing candidates`);
    console.log(`   📊 Total in JSON file: ${existingCandidates.length}`);
    
    console.log('\n✨ JSON file updated!');
    console.log('🔄 Restart server or wait for auto-refresh');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main
const csvFile = process.argv[2] || 'candidates.csv';

if (!fs.existsSync(csvFile)) {
  console.log(`❌ File not found: ${csvFile}`);
  console.log('\n📝 Creating test file...');
  
  const testData = `name,email,phone,position,skills,status
Alex Johnson,alex@example.com,+441111111111,AI Engineer,Python,New
Sarah Chen,sarah@example.com,+442222222222,Data Scientist,SQL,Interview
Mike Wilson,mike@example.com,+443333333333,ML Engineer,AWS,Screening`;
  
  fs.writeFileSync('test-csv.csv', testData);
  console.log('✅ Created test-csv.csv');
  console.log('📥 Run: node import-to-json.js test-csv.csv');
  process.exit(0);
}

importCSV(csvFile);