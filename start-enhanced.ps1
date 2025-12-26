Write-Host "🚀 STARTING ENHANCED AI TALENT CRM PRO" -ForegroundColor Green
Write-Host "===========================================`n"

Write-Host "📋 Checking system requirements..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Install Node.js v16+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Setting up dependencies..." -ForegroundColor Yellow
node setup-enhanced.js

Write-Host "`n🔑 API KEY SETUP REQUIRED:" -ForegroundColor Cyan
Write-Host "1. Google Drive API - For CV import" -ForegroundColor White
Write-Host "2. OpenAI API - For AI Assistant" -ForegroundColor White
Write-Host "3. Benchmark Email API - For email sending" -ForegroundColor White
Write-Host "`nSee .env.template for configuration" -ForegroundColor Yellow

Write-Host "`n🌐 Starting server..." -ForegroundColor Yellow
Write-Host "   Dashboard: http://localhost:3001/dashboard-enhanced.html" -ForegroundColor White
Write-Host "   Original: http://localhost:3001/crm-dashboard.html" -ForegroundColor White
Write-Host "   API: http://localhost:3001/api/stats" -ForegroundColor White

Write-Host "`n🎯 FEATURES READY:" -ForegroundColor Cyan
Write-Host "• Google Drive CV Import (Connect via Dashboard)" -ForegroundColor White
Write-Host "• AI Assistant (Bottom of dashboard)" -ForegroundColor White
Write-Host "• Benchmark Email Integration" -ForegroundColor White
Write-Host "• Team Meeting Scheduling" -ForegroundColor White
Write-Host "• Direct Calling & WhatsApp" -ForegroundColor White
Write-Host "• Delete Candidates with Confirmation" -ForegroundColor White
Write-Host "• CV Preview & Extraction" -ForegroundColor White

Write-Host "`n📞 CONTACT FEATURES:" -ForegroundColor Cyan
Write-Host "• Phone numbers shown on each candidate card" -ForegroundColor White
Write-Host "• One-click call (mobile) / Copy number (desktop)" -ForegroundColor White
Write-Host "• WhatsApp integration with pre-filled message" -ForegroundColor White
Write-Host "• Email composition ready" -ForegroundColor White

Write-Host "`n🚀 Starting server in new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start" -WindowStyle Minimized

Write-Host "`n⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n🌐 Opening enhanced dashboard..." -ForegroundColor Green
Start-Process "http://localhost:3001/dashboard-enhanced.html"

Write-Host "`n🎉 ENHANCED CRM READY!" -ForegroundColor Green
Write-Host "   Manage candidates, import CVs from Google Drive," -ForegroundColor White
Write-Host "   use AI insights, send emails, and schedule team meetings!" -ForegroundColor White

Write-Host "`n📋 Quick Commands:" -ForegroundColor Cyan
Write-Host "   Stop server: Ctrl+C in the server window" -ForegroundColor White
Write-Host "   Restart: npm start" -ForegroundColor White
Write-Host "   Import CVs: Click 'Connect Google Drive' in dashboard" -ForegroundColor White
Write-Host "   Send email: Fill form in email section" -ForegroundColor White
Write-Host "   Team meeting: Click 'Team Meeting' button" -ForegroundColor White
