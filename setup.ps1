# Cosmic Watch - Quick Setup Script

Write-Host "🌌 Cosmic Watch - Quick Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if docker-compose is available
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting up environment..." -ForegroundColor Yellow

# Create .env file if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file and add your NASA API key" -ForegroundColor Yellow
    Write-Host "Get your free API key at: https://api.nasa.gov/" -ForegroundColor Cyan
    Write-Host ""
    
    $continue = Read-Host "Press Enter to continue after updating .env (or Ctrl+C to exit)"
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Gray
Write-Host ""

docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🚀 Cosmic Watch is now running!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend:   http://localhost:4000" -ForegroundColor Cyan
    Write-Host "Health:    http://localhost:4000/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To view logs:      docker-compose logs -f" -ForegroundColor Gray
    Write-Host "To stop:           docker-compose down" -ForegroundColor Gray
    Write-Host "To restart:        docker-compose restart" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Happy exploring! 🌠" -ForegroundColor Magenta
} else {
    Write-Host ""
    Write-Host "❌ Failed to start containers" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    exit 1
}
