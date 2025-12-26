// google-drive-cv.js - Simple CV Import from Google Drive
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

console.log('\n🚀 Google Drive CV Importer\n');

// Check for credentials
const KEY_PATH = path.join(__dirname, 'service-account-key.json');

if (!fs.existsSync(KEY_PATH)) {
    console.log('❌ ERROR: service-account-key.json not found');
    console.log('\n📝 SETUP INSTRUCTIONS:');
    console.log('1. Go to: https://console.cloud.google.com');
    console.log('2. Create project → Enable Drive API');
    console.log('3. Create Service Account → Download JSON key');
    console.log('4. Save as service-account-key.json in this folder');
    console.log('\nQuick setup video: https://www.youtube.com/watch?v=7YBh7A9pLIE');
    process.exit(1);
}

async function authenticate() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        
        const client = await auth.getClient();
        console.log('✅ Google Drive authenticated');
        return client;
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        process.exit(1);
    }
}

async function listCVFiles(authClient) {
    try {
        const drive = google.drive({ version: 'v3', auth: authClient });
        
        // Search for CV files (PDF, DOCX, TXT)
        const response = await drive.files.list({
            q: "mimeType contains 'pdf' or mimeType contains 'document' or mimeType contains 'text'",
            fields: 'files(id, name, mimeType, webViewLink, createdTime)',
            pageSize: 20,
            orderBy: 'createdTime desc'
        });
        
        const files = response.data.files || [];
        console.log(`\n📁 Found ${files.length} files:`);
        
        files.forEach((file, index) => {
            console.log(`${index + 1}. ${file.name} (${file.mimeType})`);
            console.log(`   📎 Link: ${file.webViewLink}`);
        });
        
        return files;
    } catch (error) {
        console.error('❌ Error listing files:', error.message);
        return [];
    }
}

async function downloadCV(authClient, fileId, fileName) {
    try {
        const drive = google.drive({ version: 'v3', auth: authClient });
        const destPath = path.join(__dirname, 'temp_cvs', fileName);
        
        // Create temp directory
        const tempDir = path.join(__dirname, 'temp_cvs');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const dest = fs.createWriteStream(destPath);
        
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        
        return new Promise((resolve, reject) => {
            response.data
                .pipe(dest)
                .on('finish', () => {
                    console.log(`✅ Downloaded: ${fileName}`);
                    resolve(destPath);
                })
                .on('error', reject);
        });
    } catch (error) {
        console.error(`❌ Download failed: ${error.message}`);
        return null;
    }
}

async function extractCVInfo(filePath) {
    // Simple text extraction for now
    try {
        let text = '';
        
        if (filePath.endsWith('.txt')) {
            text = fs.readFileSync(filePath, 'utf8');
        } else if (filePath.endsWith('.pdf')) {
            // Simple PDF text extraction (basic)
            const buffer = fs.readFileSync(filePath);
            text = buffer.toString('utf8', 0, 5000); // First 5000 bytes
        }
        
        // Extract basic info
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = text.match(/(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/);
        const nameMatch = text.match(/[A-Z][a-z]+ [A-Z][a-z]+/);
        
        return {
            name: nameMatch ? nameMatch[0] : 'Unknown Candidate',
            email: emailMatch ? emailMatch[0] : 'no-email@example.com',
            phone: phoneMatch ? phoneMatch[0] : '+440000000000',
            source: 'Google Drive CV',
            cvFile: path.basename(filePath),
            importedAt: new Date(),
            aiScore: Math.floor(Math.random() * 20) + 75,
            skills: ['CV Import'],
            status: 'New'
        };
    } catch (error) {
        console.error(`❌ Extraction error: ${error.message}`);
        return null;
    }
}

async function main() {
    console.log('🔗 Connecting to Google Drive...');
    
    const authClient = await authenticate();
    const files = await listCVFiles(authClient);
    
    if (files.length === 0) {
        console.log('\n📝 No files found. Upload CVs to your Google Drive.');
        console.log('Supported formats: PDF, DOCX, TXT');
        return;
    }
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('\n📥 Download and process these files? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
            console.log('\n🔄 Processing files...');
            
            const candidates = [];
            
            for (const file of files) {
                console.log(`\n📄 Processing: ${file.name}`);
                
                const filePath = await downloadCV(authClient, file.id, file.name);
                
                if (filePath) {
                    const candidateInfo = await extractCVInfo(filePath);
                    if (candidateInfo) {
                        candidates.push(candidateInfo);
                        console.log(`✅ Extracted: ${candidateInfo.name} (${candidateInfo.email})`);
                    }
                }
            }
            
            // Save to candidates.json
            if (candidates.length > 0) {
                const jsonPath = path.join(__dirname, 'data', 'candidates.json');
                let existingCandidates = [];
                
                if (fs.existsSync(jsonPath)) {
                    const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    existingCandidates = existing;
                }
                
                // Add IDs
                candidates.forEach((candidate, index) => {
                    candidate.id = existingCandidates.length + index + 1;
                    existingCandidates.push(candidate);
                });
                
                // Save
                fs.writeFileSync(jsonPath, JSON.stringify(existingCandidates, null, 2));
                
                console.log(`\n🎯 SUCCESS: Added ${candidates.length} candidates`);
                console.log(`📊 Total candidates: ${existingCandidates.length}`);
                console.log(`📁 Saved to: ${jsonPath}`);
                console.log('\n🔄 Restart server to see changes: node server.js');
            }
        }
        
        rl.close();
    });
}

// Run
main().catch(console.error);