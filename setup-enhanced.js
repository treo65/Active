// setup-enhanced.js - Install all required dependencies
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 SETTING UP ENHANCED CRM SYSTEM\n');
console.log('================================\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
    console.log('📦 Creating package.json...');
    const packageJson = {
        name: "ai-crm-pro",
        version: "2.0.0",
        description: "AI Talent CRM with Google Drive, Email & AI Integration",
        main: "server-enhanced.js",
        scripts: {
            "start": "node server-enhanced.js",
            "dev": "nodemon server-enhanced.js",
            "drive-sync": "node scripts/drive-sync.js",
            "import-csv": "node scripts/import-csv.js"
        },
        dependencies: {
            "express": "^4.18.2",
            "cors": "^2.8.5",
            "multer": "^1.4.5-lts.1",
            "googleapis": "^128.0.0",
            "dotenv": "^16.0.3",
            "axios": "^1.6.0",
            "pdf-parse": "^1.1.1",
            "mammoth": "^1.6.0"
        },
        devDependencies: {
            "nodemon": "^3.0.1"
        },
        keywords: ["crm", "ai", "recruitment", "google-drive", "email"],
        author: "AI Talent CRM Team",
        license: "MIT"
    };
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json created');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
} catch (error) {
    console.log('⚠️  Installation had issues, but continuing...');
}

// Create necessary directories
console.log('\n📁 Creating directories...');
const dirs = ['data', 'uploads', 'scripts', 'logs', 'temp_cvs'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created: ${dir}/`);
    }
});

// Create sample service account key template
console.log('\n🔑 Creating Google Drive setup guide...');
const googleDriveGuide = `
# GOOGLE DRIVE SETUP GUIDE
=========================

## 1. Enable Google Drive API
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable "Google Drive API"
4. Go to "Credentials" → "Create Credentials" → "Service Account"
5. Fill in details and create key (JSON format)
6. Download the JSON file

## 2. Save Credentials
Save the downloaded JSON file as:
service-account-key.json

## 3. Share Google Drive folder
1. Create a folder "CVs" in your Google Drive
2. Share it with your service account email
3. Upload CVs to this folder

## 4. Configure .env file
Create a .env file with:
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
OPENAI_API_KEY=your_openai_key_here
BENCHMARK_EMAIL_API_KEY=your_benchmark_key_here

## 5. Restart server
The system will automatically detect CVs in your Google Drive!
`;

fs.writeFileSync('GOOGLE_DRIVE_SETUP.md', googleDriveGuide);
console.log('✅ Google Drive setup guide created');

// Create sample candidates.json if doesn't exist
if (!fs.existsSync('data/candidates.json')) {
    console.log('\n👥 Creating sample candidates database...');
    const sampleCandidates = [
        {
            "id": 1,
            "name": "Donald Mutale",
            "email": "donaldmutale@hotmail.com",
            "phone": "+447933544411",
            "status": "Rejected",
            "aiScore": 82,
            "position": "Luton",
            "skills": ["Retail"],
            "appliedDate": "2025-12-21",
            "source": "Original Database"
        },
        {
            "id": 2,
            "name": "Rihanna Campbell",
            "email": "rihannac32@yahoo.com",
            "phone": "+447704375461",
            "status": "New",
            "aiScore": 90,
            "position": "Indesign Specialist",
            "skills": ["IT"],
            "appliedDate": "2025-12-21",
            "source": "Original Database"
        },
        {
            "id": 3,
            "name": "David Barrett",
            "email": "David_barrett1997@outlook.com",
            "phone": "+447398170616",
            "status": "New",
            "aiScore": 89,
            "position": "Carpenter",
            "skills": ["Carpentry"],
            "appliedDate": "2025-12-21",
            "source": "Original Database"
        },
        {
            "id": 4,
            "name": "Tynisha Griffiths-Fernandez",
            "email": "teefernandez27@gmail.com",
            "phone": "+447496238344",
            "status": "New",
            "aiScore": 92,
            "position": "Logistics",
            "skills": ["Logistics"],
            "appliedDate": "2025-12-21",
            "source": "Original Database"
        },
        {
            "id": 5,
            "name": "Shah Memon",
            "email": "samemon@hotmail.co.uk",
            "phone": "+447759911897",
            "status": "New",
            "aiScore": 78,
            "position": "Project Manager",
            "skills": ["Management"],
            "appliedDate": "2025-12-21",
            "source": "Original Database"
        },
        {
            "id": 6,
            "name": "Trevor Sands",
            "email": "sands.trevor@gmail.com",
            "phone": "+44123456789",
            "status": "New",
            "aiScore": 75,
            "position": "Security Director",
            "skills": ["Security"],
            "appliedDate": "2025-12-21",
            "source": "Original Database"
        },
        {
            "id": 7,
            "name": "Alex Johnson",
            "email": "alex.johnson@example.com",
            "phone": "+441111111111",
            "status": "New",
            "aiScore": 88,
            "position": "AI Engineer",
            "skills": ["Python", "TensorFlow", "MLOps"],
            "appliedDate": "2025-12-25",
            "source": "Google Drive CV",
            "cvFile": "Alex_Johnson_CV.pdf"
        },
        {
            "id": 8,
            "name": "Sarah Chen",
            "email": "sarah.chen@example.com",
            "phone": "+442222222222",
            "status": "Interview",
            "aiScore": 85,
            "position": "Data Scientist",
            "skills": ["R", "SQL", "Statistics", "Python"],
            "appliedDate": "2025-12-25",
            "source": "Google Drive CV",
            "cvFile": "Sarah_Chen_Resume.docx"
        },
        {
            "id": 9,
            "name": "Mike Wilson",
            "email": "mike.wilson@example.com",
            "phone": "+443333333333",
            "status": "Screening",
            "aiScore": 92,
            "position": "ML Engineer",
            "skills": ["Python", "AWS", "Docker", "Kubernetes"],
            "appliedDate": "2025-12-25",
            "source": "Google Drive CV",
            "cvFile": "Mike_Wilson_CV.pdf"
        }
    ];
    
    fs.writeFileSync('data/candidates.json', JSON.stringify(sampleCandidates, null, 2));
    console.log(`✅ Created sample database with ${sampleCandidates.length} candidates`);
}

// Create environment template
if (!fs.existsSync('.env')) {
    console.log('\n⚙️  Creating environment configuration...');
    const envTemplate = `# AI TALENT CRM PRO - ENVIRONMENT CONFIGURATION
# ==============================================

# Google Drive API (Required for CV import)
# Create service account: https://console.cloud.google.com
# Save JSON as service-account-key.json
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here

# OpenAI API (For AI Assistant)
# Get key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_key_here

# Benchmark Email API (For email sending)
# Get key from: https://ui.benchmarkemail.com/API
BENCHMARK_EMAIL_API_KEY=your_benchmark_key_here
BENCHMARK_EMAIL_CLIENT_ID=your_client_id_here

# Application Settings
PORT=3001
NODE_ENV=development
DEBUG=true

# Database Settings
DB_PATH=./data/candidates.json
MAX_FILE_SIZE=10485760  # 10MB

# Email Templates
EMAIL_SENDER=your-email@example.com
EMAIL_SENDER_NAME=Talent CRM Pro

# Team Settings
TEAM_MEETING_PROVIDER=google  # google, zoom, teams
TEAM_NOTIFICATIONS=true`;
    
    fs.writeFileSync('.env.template', envTemplate);
    console.log('✅ Environment template created (.env.template)');
    console.log('📝 Rename to .env and fill in your API keys');
}

console.log('\n🎯 SETUP COMPLETE!');
console.log('\nNext steps:');
console.log('1. Fill in your API keys in .env file');
console.log('2. Set up Google Drive (see GOOGLE_DRIVE_SETUP.md)');
console.log('3. Start the server: npm start');
console.log('4. Open: http://localhost:3001/dashboard-enhanced.html');
console.log('\nFeatures ready:');
console.log('• Google Drive CV import');
console.log('• AI Assistant with candidate analysis');
console.log('• Benchmark Email integration');
console.log('• Team meeting scheduling');
console.log('• Direct calling & WhatsApp integration');
console.log('• Delete candidates with confirmation');
console.log('• Search and filter capabilities');
console.log('• Pagination for large datasets');
console.log('• CV preview and extraction');
`;
