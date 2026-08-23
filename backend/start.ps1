# Launch script for E-Shop Manager API
# Pulls secrets from user-scope environment variables (set once, never in Git).
$env:EShopDatabase__ConnectionString = [Environment]::GetEnvironmentVariable("EShopDatabase__ConnectionString", "User")
$env:JwtSettings__Secret = [Environment]::GetEnvironmentVariable("JwtSettings__Secret", "User")

if ([string]::IsNullOrWhiteSpace($env:EShopDatabase__ConnectionString)) {
    Write-Error "EShopDatabase__ConnectionString is not set. Run the setup to configure user-scope environment variables first."
    exit 1
}

Start-Process -FilePath "$PSScriptRoot\bin\Debug\net10.0\EShopManager.API.exe" -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
