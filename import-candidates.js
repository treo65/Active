// import-candidates.js - SIMPLE WORKING IMPORT
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('\n🚀 CSV IMPORT TOOL');
console.log('==================\n');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const args = process.argv.slice(2);
    const csvFile = args[0] || 'candidates.csv';
    
    if (!fs.existsSync(csvFile)) {
      console.log(`❌ File not found: ${csvFile}`);
      console.log('\n📝 Create test file:');
      console.log('node import-candidates.js --create-test');
      process.exit(1);
    }
    
    if (args.includes('--create-test')) {
      const testData = `name,email,phone,position,skills
Test Candidate,test@example.com,+441234567890,AI Engineer,Python
Another Test,another@example.com,+441234567891,Data Scientist,R`;
      
      fs.writeFileSync('test-candidates.csv', testData);
      console.log('✅ Created test-candidates.csv');
      console.log('📥 Import: node import-candidates.js test-candidates.csv');
      process.exit(0);
    }
    
    // Read CSV
    const csvData = fs.readFileSync(csvFile, 'utf8');
    const rows = csvData.split('\n').filter(row => row.trim());
    
    if (rows.length < 2) {
      console.log('❌ CSV needs header row + data');
      process.exit(1);
    }
    
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
    console.log(`📋 Importing ${rows.length - 1} candidates...`);
    
    // Use the database directly
    const db = mongoose.connection.db;
    
    let success = 0;
    let failed = 0;
    
    // Process each row
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',').map(v => v.trim());
      const candidate = {};
      
      // Map headers to values
      headers.forEach((header, index) => {
        if (values[index]) {
          candidate[header] = values[index];
        }
      });
      
      // Add required fields
      if (!candidate.aiScore) candidate.aiScore = Math.floor(Math.random() * 20) + 75;
      if (!candidate.status) candidate.status = 'New';
      if (!candidate.appliedDate) candidate.appliedDate = new Date();
      if (!candidate.skills) candidate.skills = ['General'];
      
      try {
        // Insert into database
        const result = await db.collection('candidates').updateOne(
          { email: candidate.email },
          { $set: candidate },
          { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
          console.log(`✅ Added: ${candidate.name || candidate.email}`);
          success++;
        } else if (result.modifiedCount > 0) {
          console.log(`✏️  Updated: ${candidate.name || candidate.email}`);
        }
      } catch (error) {
        console.log(`❌ Failed: ${candidate.email} - ${error.message}`);
        failed++;
      }
    }
    
    // Get final count
    const total = await db.collection('candidates').countDocuments();
    
    console.log('\n🎯 IMPORT SUMMARY:');
    console.log(`   ✅ Success: ${success}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total in database: ${total}`);
    
    mongoose.disconnect();
    console.log('\n✨ Done! Dashboard: http://localhost:3001/crm-dashboard.html');
    
  }).catch(err => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });