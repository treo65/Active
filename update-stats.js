// update-stats.js - Update dashboard statistics in real-time
const fs = require('fs').promises;
const path = require('path');

async function calculateRealStats() {
    const dbPath = path.join(__dirname, 'data', 'candidates.json');
    
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        const candidates = JSON.parse(data);
        
        const total = candidates.length;
        const avgScore = total > 0 ? 
            Math.round(candidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / total) : 0;
        
        const topMatches = candidates.filter(c => c.aiScore >= 90).length;
        
        // Count new today
        const today = new Date().toISOString().split('T')[0];
        const newToday = candidates.filter(c => c.appliedDate === today || 
                                               c.uploadedAt?.startsWith(today) ||
                                               c.imported_date?.startsWith(today)).length;
        
        // Count by status
        const statusCounts = {};
        candidates.forEach(c => {
            const status = c.status || 'New';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        console.log('\n📈 REAL-TIME STATISTICS:');
        console.log(`   Total Candidates: ${total}`);
        console.log(`   Average AI Score: ${avgScore}%`);
        console.log(`   Top Matches (90%+): ${topMatches}`);
        console.log(`   New Today: ${newToday}`);
        console.log(`   By Status:`);
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`     • ${status}: ${count}`);
        });
        
        return { total, avgScore, topMatches, newToday, statusCounts };
        
    } catch (error) {
        console.log('❌ Error calculating stats:', error.message);
        return { total: 0, avgScore: 0, topMatches: 0, newToday: 0, statusCounts: {} };
    }
}

// Run and export
calculateRealStats().then(stats => {
    // Can be used by other scripts
    module.exports = { calculateRealStats };
});