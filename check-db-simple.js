// check-db-simple.js - No dependencies check
console.log('🔍 CHECKING YOUR SETUP\n');

// Check if .env exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const mongoLine = envContent.split('\n').find(line => line.includes('MONGO_URI'));
  
  if (mongoLine) {
    console.log('✅ MONGO_URI found:', mongoLine.replace(/:[^:@]+@/, ':****@'));
  } else {
    console.log('❌ MONGO_URI NOT found in .env');
  }
} else {
  console.log('❌ .env file not found');
}

// Check if server.js is running
console.log('\n🌐 Checking server on port 3001...');

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/stats',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server responding (Status: ${res.statusCode})`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const stats = JSON.parse(data);
      console.log(`📊 Current stats: ${stats.total} candidates`);
      console.log(`📈 Source: ${stats.message || 'Unknown'}`);
    } catch (e) {
      console.log('📄 Response:', data.substring(0, 100));
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Server not responding:', e.message);
  console.log('Start server with: node server.js');
});

req.on('timeout', () => {
  console.log('❌ Server timeout - not running');
  req.destroy();
});

req.end();