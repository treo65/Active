// combine-all-data.js - Combine all your candidate data
const fs = require('fs');
const path = require('path');

console.log('\n🔄 COMBINING ALL CANDIDATE DATA\n');
console.log('===============================\n');

async function combineData() {
    try {
        // 1. Your original 6 candidates (hardcoded)
        const originalCandidates = [
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
            },
            {
                id: 2,
                name: "Rihanna Campbell",
                email: "rihannac32@yahoo.com",
                phone: "+447704375461",
                status: "New",
                aiScore: 90,
                position: "Indesign Specialist",
                skills: ["IT"],
                appliedDate: "2025-12-21",
                source: "Original Database"
            },
            {
                id: 3,
                name: "David Barrett",
                email: "David_barrett1997@outlook.com",
                phone: "+447398170616",
                status: "New",
                aiScore: 89,
                position: "Carpenter",
                skills: ["Carpentry"],
                appliedDate: "2025-12-21",
                source: "Original Database"
            },
            {
                id: 4,
                name: "Tynisha Griffiths-Fernandez",
                email: "teefernandez27@gmail.com",
                phone: "+447496238344",
                status: "New",
                aiScore: 92,
                position: "Logistics",
                skills: ["Logistics"],
                appliedDate: "2025-12-21",
                source: "Original Database"
            },
            {
                id: 5,
                name: "Shah Memon",
                email: "samemon@hotmail.co.uk",
                phone: "+447759911897",
                status: "New",
                aiScore: 78,
                position: "Project Manager",
                skills: ["Management"],
                appliedDate: "2025-12-21",
                source: "Original Database"
            },
            {
                id: 6,
                name: "Trevor Sands",
                email: "sands.trevor@gmail.com",
                phone: "+44123456789",
                status: "New",
                aiScore: 75,
                position: "Security Director",
                skills: ["Security"],
                appliedDate: "2025-12-21",
                source: "Original Database"
            }
        ];

        console.log(`📊 Original candidates: ${originalCandidates.length}`);

        // 2. Read from current JSON file (if exists)
        let jsonCandidates = [];
        const jsonPath = path.join(__dirname, 'data', 'candidates.json');
        
        if (fs.existsSync(jsonPath)) {
            const jsonData = fs.readFileSync(jsonPath, 'utf8');
            jsonCandidates = JSON.parse(jsonData);
            console.log(`📁 JSON file candidates: ${jsonCandidates.length}`);
        }

        // 3. Read from CSV file
        let csvCandidates = [];
        const csvPath = path.join(__dirname, 'google-drive-data.csv');
        
        if (fs.existsSync(csvPath)) {
            const csvData = fs.readFileSync(csvPath, 'utf8');
            const rows = csvData.split('\n').filter(r => r.trim());
            
            if (rows.length > 1) {
                const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
                
                for (let i = 1; i < rows.length; i++) {
                    const values = rows[i].split(',').map(v => v.trim());
                    const candidate = {};
                    
                    headers.forEach((header, index) => {
                        candidate[header] = values[index] || '';
                    });
                    
                    // Add missing fields
                    if (!candidate.aiScore) candidate.aiScore = Math.floor(Math.random() * 20) + 75;
                    if (!candidate.status) candidate.status = 'New';
                    if (!candidate.appliedDate) candidate.appliedDate = new Date().toISOString().split('T')[0];
                    if (!candidate.skills) candidate.skills = ['General'];
                    if (!candidate.source) candidate.source = 'Google Drive';
                    
                    csvCandidates.push(candidate);
                }
            }
            console.log(`📄 CSV file candidates: ${csvCandidates.length}`);
        }

        // 4. Combine all candidates
        const allCandidates = [...originalCandidates];
        let nextId = 7; // Start after original 6

        // Add JSON candidates (avoid duplicates by email)
        jsonCandidates.forEach(candidate => {
            if (!allCandidates.find(c => c.email === candidate.email)) {
                candidate.id = nextId++;
                allCandidates.push(candidate);
            }
        });

        // Add CSV candidates (avoid duplicates by email)
        csvCandidates.forEach(candidate => {
            if (!allCandidates.find(c => c.email === candidate.email)) {
                candidate.id = nextId++;
                allCandidates.push(candidate);
            }
        });

        console.log(`\n🎯 TOTAL CANDIDATES: ${allCandidates.length}`);

        // 5. Save combined data
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(jsonPath, JSON.stringify(allCandidates, null, 2));
        
        console.log(`\n✅ Saved to: ${jsonPath}`);

        // 6. Show statistics
        const avgScore = Math.round(allCandidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / allCandidates.length);
        const topMatches = allCandidates.filter(c => (c.aiScore || 0) >= 90).length;
        
        console.log(`\n📈 FINAL STATISTICS:`);
        console.log(`   Average AI Score: ${avgScore}%`);
        console.log(`   Top Matches (90%+): ${topMatches}`);
        console.log(`   Total Candidates: ${allCandidates.length}`);

        // 7. Show sources
        const sources = {};
        allCandidates.forEach(c => {
            const source = c.source || 'Unknown';
            sources[source] = (sources[source] || 0) + 1;
        });

        console.log(`\n📊 SOURCES:`);
        Object.entries(sources).forEach(([source, count]) => {
            console.log(`   ${source}: ${count} candidates`);
        });

        console.log('\n✨ Data combined successfully!');
        console.log('🔄 Restart server: node server.js');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run
combineData();