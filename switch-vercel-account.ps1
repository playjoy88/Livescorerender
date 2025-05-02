# PowerShell script to switch Vercel accounts for the LiveScore project

Write-Host "Starting Vercel account switch process..." -ForegroundColor Green

# Step 1: Check if .vercel directory exists
if (Test-Path ".vercel") {
    Write-Host "Found existing Vercel configuration."
    
    # Step 2: Remove the current Vercel connection
    Write-Host "Removing existing Vercel connection..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .vercel
    Write-Host "Vercel connection removed successfully!" -ForegroundColor Green
} else {
    Write-Host "No existing Vercel configuration found." -ForegroundColor Yellow
}

# Step 3: Logout from current Vercel account
Write-Host "Logging out from current Vercel account..." -ForegroundColor Yellow
npx vercel logout
Write-Host "Logout complete!" -ForegroundColor Green

# Step 4: Login to new Vercel account
Write-Host "Please log in to your new Vercel account..." -ForegroundColor Yellow
npx vercel login

# Step 5: Deploy to the new account
Write-Host "`nWould you like to deploy the project to your new Vercel account now? (Y/N)" -ForegroundColor Cyan
$deployNow = Read-Host
if ($deployNow -eq "Y" -or $deployNow -eq "y") {
    Write-Host "Starting deployment to new Vercel account..." -ForegroundColor Yellow
    npx vercel
    
    Write-Host "`nDo you want to deploy to production? (Y/N)" -ForegroundColor Cyan
    $deployProd = Read-Host
    if ($deployProd -eq "Y" -or $deployProd -eq "y") {
        Write-Host "Deploying to production..." -ForegroundColor Yellow
        npx vercel --prod
    }
}

Write-Host "`nVercel account switch process completed!" -ForegroundColor Green
Write-Host "Your project is now connected to your new Vercel account." -ForegroundColor Green
Write-Host "Important: If you had custom domains or environment variables, make sure to set them up in your new project." -ForegroundColor Yellow
