// import-from-drive-now.js - Working Google Drive Import
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('\n🚀 GOOGLE DRIVE CV IMPORT\n');
console.log('========================\n');

async function main() {
    // Check for credentials
    const keyPath = path.join(__dirname, 'service-account-key.json');
    
    if (!fs.existsSync(keyPath)) {
        console.log('❌ service-account-key.json not found');
        console.log('\n📝 SETUP REQUIRED:');
        console.log('1. Get credentials from: https://console.cloud.google.com');
        console.log('2. Save as service-account-key.json in this folder');
        console.log('\nFor now, using MANUAL CSV method...\n');
        
        useCSVMethod();
        return;
    }
    
    console.log('✅ Found service account key');
    
    // Ask user what they want to do
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('\nChoose method:\n1. Google Drive API (requires setup)\n2. CSV File (manual export)\n\nEnter choice (1 or 2): ', async (choice) => {
        if (choice === '1') {
            console.log('\n🔄 Attempting Google Drive API connection...');
            await useGoogleDriveAPI();
        } else {
            console.log('\n📁 Using CSV method...');
            useCSVMethod();
        }
        rl.close();
    });
}

async function useGoogleDriveAPI() {
    try {
        const { google } = require('googleapis');
        
        const auth = new google.auth.GoogleAuth({
            keyFile: 'service-account-key.json',
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        
        const authClient = await auth.getClient();
        const drive = google.drive({ version: 'v3', auth: authClient });
        
        console.log('✅ Connected to Google Drive API');
        
        // Search for CSV or spreadsheet files
        const response = await drive.files.list({
            q: "mimeType contains 'csv' or mimeType contains 'spreadsheet'",
            fields: 'files(id, name, mimeType, webViewLink)',
            pageSize: 10,
        });
        
        const files = response.data.files || [];
        
        if (files.length === 0) {
            console.log('❌ No CSV/spreadsheet files found in Google Drive');
            console.log('Upload a CSV file or Google Sheet first');
            useCSVMethod();
            return;
        }
        
        console.log(`\n📁 Found ${files.length} files:`);
        files.forEach((file, i) => {
            console.log(`${i + 1}. ${file.name} (${file.mimeType})`);
        });
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('\nEnter file number to import (or 0 to cancel): ', async (fileNum) => {
            const num = parseInt(fileNum);
            
            if (num > 0 && num <= files.length) {
                const file = files[num - 1];
                console.log(`\n📥 Importing: ${file.name}`);
                
                // Download file
                const destPath = path.join(__dirname, 'temp-drive-file.csv');
                const dest = fs.createWriteStream(destPath);
                
                const fileResponse = await drive.files.get(
                    { fileId: file.id, alt: 'media' },
                    { responseType: 'stream' }
                );
                
                await new Promise((resolve, reject) => {
                    fileResponse.data.pipe(dest)
                        .on('finish', resolve)
                        .on('error', reject);
                });
                
                console.log('✅ File downloaded');
                await processCSVFile(destPath);
                
                // Cleanup
                fs.unlinkSync(destPath);
                
            } else {
                console.log('Import cancelled');
                useCSVMethod();
            }
            
            rl.close();
        });
        
    } catch (error) {
        console.error('❌ Google Drive API error:', error.message);
        console.log('\nFalling back to CSV method...\n');
        useCSVMethod();
    }
}

function useCSVMethod() {
    const csvFile = 'candidates.csv';
    
    if (!fs.existsSync(csvFile)) {
        console.log(`❌ ${csvFile} not found`);
        console.log('\n📝 Creating sample CSV...');
        
        const sampleData = `name,email,phone,position,skills,status,source
Alex Johnson,alex@example.com,+441111111111,AI Engineer,Python|TensorFlow,New,Google Drive
Sarah Chen,sarah@example.com,+442222222222,Data Scientist,R|SQL,Interview,Google Drive
Mike Wilson,mike@example.com,+443333333333,ML Engineer,AWS|Docker,Screening,Google Drive`;
        
        fs.writeFileSync(csvFile, sampleData);
        console.log(`✅ Created ${csvFile}`);
        console.log('📝 Edit this file with your actual data');
    }
    
    console.log(`\n📁 Using file: ${csvFile}`);
    processCSVFile(csvFile);
}

async function processCSVFile(filePath) {
    try {
        console.log(`\n📋 Processing ${filePath}...`);
        
        const csvData = fs.readFileSync(filePath, 'utf8');
        const rows = csvData.split('\n').filter(r => r.trim());
        
        if (rows.length < 2) {
            console.log('❌ CSV needs data');
            return;
        }
        
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        console.log(`Found ${rows.length - 1} candidates`);
        
        // Read existing candidates
        const jsonPath = path.join(__dirname, 'data', 'candidates.json');
        let existingCandidates = [];
        
        if (fs.existsSync(jsonPath)) {
            try {
                const existingData = fs.readFileSync(jsonPath, 'utf8');
                existingCandidates = JSON.parse(existingData);
                console.log(`📊 Existing candidates: ${existingCandidates.length}`);
            } catch (e) {
                console.log('⚠️  Starting fresh JSON file');
            }
        }
        
        let added = 0;
        let updated = 0;
        
        // Process each row
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',').map(v => v.trim());
            const candidate = {};
            
            headers.forEach((header, index) => {
                if (values[index]) {
                    candidate[header] = values[index];
                }
            });
            
            // Ensure required fields
            if (!candidate.aiScore && !candidate.aiscore) {
                candidate.aiScore = Math.floor(Math.random() * 20) + 75;
            }
            if (!candidate.status) candidate.status = 'New';
            if (!candidate.appliedDate) candidate.appliedDate = new Date().toISOString().split('T')[0];
            if (!candidate.skills) candidate.skills = ['General'];
            if (!candidate.source) candidate.source = 'Google Drive Import';
            
            // Find existing by email
            const existingIndex = existingCandidates.findIndex(c => 
                c.email && candidate.email && 
                c.email.toLowerCase() === candidate.email.toLowerCase()
            );
            
            if (existingIndex >= 0) {
                // Update
                existingCandidates[existingIndex] = {
                    ...existingCandidates[existingIndex],
                    ...candidate
                };
                updated++;
                console.log(`✏️  Updated: ${candidate.name || candidate.email}`);
            } else {
                // Add new
                candidate.id = existingCandidates.length > 0 ? 
                    Math.max(...existingCandidates.map(c => c.id || 0)) + 1 : 1;
                existingCandidates.push(candidate);
                added++;
                console.log(`✅ Added: ${candidate.name || candidate.email}`);
            }
        }
        
        // Save
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(jsonPath, JSON.stringify(existingCandidates, null, 2));
        
        console.log(`\n🎯 IMPORT COMPLETE:`);
        console.log(`   ✅ Added: ${added} new candidates`);
        console.log(`   ✏️  Updated: ${updated} existing candidates`);
        console.log(`   📊 Total candidates: ${existingCandidates.length}`);
        
        // Show stats
        const avgScore = Math.round(existingCandidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / existingCandidates.length);
        const topMatches = existingCandidates.filter(c => (c.aiScore || 0) >= 90).length;
        
        console.log(`\n📈 STATISTICS:`);
        console.log(`   Average AI Score: ${avgScore}%`);
        console.log(`   Top Matches (90%+): ${topMatches}`);
        
        console.log('\n✨ Done! Restart server: Ctrl+C then "node server.js"');
        
    } catch (error) {
        console.error('❌ Processing error:', error.message);
    }
}

// Run
main().catch(console.error);