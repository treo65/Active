
### **Step 8: Create Automation Script**

Create `scripts/drive-sync.js`:

```javascript
// scripts/drive-sync.js - Automated CV import
const googleDriveService = require('../services/google-drive-service');
const mongoose = require('mongoose');
require('dotenv').config();

async function syncCVs() {
    console.log('\n🔄 Automated CV Sync from Google Drive\n');
    console.log(new Date().toISOString());
    
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database');
        
        // Process CVs
        const candidates = await googleDriveService.processCVFolder();
        console.log(`📄 Processed ${candidates.length} CVs`);
        
        // Import to database
        const Candidate = mongoose.model('Candidate');
        let imported = 0;
        
        for (const candidate of candidates) {
            const existing = await Candidate.findOne({ email: candidate.email });
            
            if (existing) {
                console.log(`✏️  Updated: ${candidate.name}`);
                Object.assign(existing, candidate);
                await existing.save();
            } else {
                console.log(`✅ Added: ${candidate.name}`);
                const newCandidate = new Candidate(candidate);
                await newCandidate.save();
                imported++;
            }
        }
        
        console.log(`\n🎯 Import complete: ${imported} new candidates`);
        
        // Cleanup
        await mongoose.disconnect();
        console.log('✨ Sync completed successfully');
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

// Run sync
syncCVs();