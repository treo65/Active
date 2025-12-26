// check-database.js - Simple database diagnostic
const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Checking MongoDB Database...\n');
  
  try {
    // Connect using your existing connection string
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 COLLECTIONS FOUND:');
    
    if (collections.length === 0) {
      console.log('❌ No collections found');
    } else {
      collections.forEach((col, index) => {
        console.log(`${index + 1}. ${col.name}`);
      });
    }
    
    // Check for candidates in different possible collections
    console.log('\n👥 CANDIDATE COUNTS:');
    
    // Try "candidates" collection (plural)
    try {
      const candidatesCollection = mongoose.connection.collection('candidates');
      const candidateCount = await candidatesCollection.countDocuments();
      console.log(`- "candidates" collection: ${candidateCount} documents`);
      
      if (candidateCount > 0) {
        const sample = await candidatesCollection.findOne();
        console.log('  Sample document fields:', Object.keys(sample));
      }
    } catch (e) {
      console.log('- "candidates" collection: Not found');
    }
    
    // Try "Candidate" collection (singular)
    try {
      const CandidateCollection = mongoose.connection.collection('Candidate');
      const CandidateCount = await CandidateCollection.countDocuments();
      console.log(`- "Candidate" collection: ${CandidateCount} documents`);
    } catch (e) {
      console.log('- "Candidate" collection: Not found');
    }
    
    // Check what your server.js API actually returns
    console.log('\n🌐 CHECKING SERVER API:');
    console.log('Run this in another terminal:');
    console.log('  curl http://localhost:3001/api/stats');
    console.log('Or:');
    console.log('  Invoke-RestMethod -Uri "http://localhost:3001/api/stats"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connection closed');
  }
}

checkDatabase();