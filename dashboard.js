// --- CONFIGURATION ---
const API_BASE = "https://active-glya.onrender.com";

// --- GLOBAL STATE ---
let candidatesData = [];

// --- INITIALIZE ON LOAD ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Dashboard initializing...");
    await refreshAllData(); // Load data from Render immediately
});

// --- 1. THE REFRESH ENGINE ---
async function refreshAllData() {
    try {
        const response = await fetch(`${API_BASE}/api/candidates`);
        if (!response.ok) throw new Error("Network response was not ok");
        
        candidatesData = await response.json();
        
        // Update the UI components
        renderDashboardTable();
        updateDashboardStats();
        
    } catch (error) {
        console.error("Fetch Error:", error);
        showMessage("Could not connect to Render. Is the server awake?", "Error");
    }
}

// --- 2. THE STATS UPDATER ---
function updateDashboardStats() {
    const total = candidatesData.length;
    const hired = candidatesData.filter(c => c.status?.toLowerCase() === 'hired').length;
    const avgScore = total > 0 
        ? Math.round(candidatesData.reduce((sum, c) => sum + (parseInt(c.ai_score) || 0), 0) / total) 
        : 0;

    // Update the numbers on your page
    const elements = {
        'totalApplications': total,
        'hiredCount': hired,
        'avgScore': avgScore + '%'
    };

    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

// --- 3. THE TABLE RENDERER ---
function renderDashboardTable() {
    const tbody = document.getElementById('applications-body-dashboard');
    if (!tbody) return;

    if (candidatesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No candidates found.</td></tr>';
        return;
    }

    tbody.innerHTML = candidatesData.map(c => `
        <tr>
            <td><strong>${c.name}</strong><br><small>${c.email}</small></td>
            <td>${c.job_title || 'N/A'}</td>
            <td><span class="badge ${c.status}">${c.status}</span></td>
            <td><strong>${c.ai_score || 0}%</strong></td>
            <td>
                <button onclick="deleteCandidate('${c._id || c.id}')" class="btn-delete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// --- 4. THE DELETE ACTION ---
async function deleteCandidate(id) {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
        const response = await fetch(`${API_BASE}/api/candidates/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage("Candidate deleted!", "Success");
            await refreshAllData(); // This refreshes the table AND the stats automatically
        }
    } catch (error) {
        showMessage("Error deleting candidate.", "Error");
    }
}

// --- UTILITY: NOTIFICATIONS ---
function showMessage(msg, type) {
    const box = document.getElementById('messageBox');
    if (box) {
        box.innerText = `${type}: ${msg}`;
        box.style.display = 'block';
        setTimeout(() => box.style.display = 'none', 3000);
    }

}
function renderUI() {
    const tbody = document.getElementById('applications-body-dashboard');
    if (!tbody) return;

    // 1. Calculate Totals
    const total = candidatesData.length;
    
    // 2. Calculate Top Matches (Score 90 or above)
    // We use parseInt to make sure "90" (text) is treated as 90 (number)
    const topMatches = candidatesData.filter(c => {
        const score = parseInt(c.ai_score || c.score);
        return !isNaN(score) && score >= 90;
    }).length;

    // 3. Calculate New Today
    // Checks if the candidate's date matches today's date
    const todayStr = new Date().toISOString().split('T')[0]; 
    const newToday = candidatesData.filter(c => {
        const cDate = (c.timestamp || c.date || "").split('T')[0];
        return cDate === todayStr;
    }).length;

    // 4. Calculate Average AI Score
    const avgScore = total > 0 
        ? Math.round(candidatesData.reduce((sum, c) => sum + (parseInt(c.ai_score || c.score) || 0), 0) / total) 
        : 0;

    // 5. Push the numbers to your HTML IDs
    document.getElementById('totalApplications').innerText = total;
    document.getElementById('avgScore').innerText = avgScore + '%';
    document.getElementById('topMatches').innerText = topMatches;
    document.getElementById('newToday').innerText = newToday;

    // 6. Update the Table Rows
    tbody.innerHTML = candidatesData.map(c => `
        <tr>
            <td><strong>${c.name}</strong><br><small>${c.email}</small></td>
            <td>${c.job_title || c.role || 'N/A'}</td>
            <td><span class="badge ${c.status?.toLowerCase()}">${c.status || 'New'}</span></td>
            <td><strong style="color: ${parseInt(c.ai_score) >= 90 ? '#10b981' : '#f59e0b'}">${c.ai_score || 0}%</strong></td>
            <td>
                <button onclick="deleteCand('${c._id || c.id}')" class="btn-delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}
