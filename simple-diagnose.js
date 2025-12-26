// simple-diagnose.js
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 SIMPLE DATABASE DIAGNOSTIC\n');

async function checkDB() {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      console.log('❌ MONGO_URI not found in .env');
      console.log('Add this to your .env file:');
      console.log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
      return;
    }
    
    console.log('Connecting to:', uri.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    console.log('Database name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections found:');
    
    for (const col of collections) {
      const collection = db.collection(col.name);
      const count = await collection.countDocuments();
      console.log(`\n${col.name}: ${count} documents`);
      
      if (count > 0) {
        const firstDoc = await collection.findOne();
        console.log('First document keys:', Object.keys(firstDoc));
        
        if (firstDoc.name && firstDoc.email) {
          console.log('👥 Contains candidate data!');
          console.log(`Sample: ${firstDoc.name} (${firstDoc.email})`);
        }
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Diagnostic complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDB();