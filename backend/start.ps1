# Launch script for E-Shop Manager API
# Pulls secrets from user-scope environment variables (set once, never in Git).
$env:Stripe__SecretKey = [Environment]::GetEnvironmentVariable("Stripe__SecretKey", "User")
if ([string]::IsNullOrWhiteSpace($env:Stripe__SecretKey)) {
    Write-Warning "Stripe__SecretKey is not set. Stripe payments will not work. Set it via User-scope environment variables."
}

if ([string]::IsNullOrWhiteSpace($env:EShopDatabase__ConnectionString)) {
    Write-Error "EShopDatabase__ConnectionString is not set. Run the setup to configure user-scope environment variables first."
    exit 1
}

Start-Process -FilePath "$PSScriptRoot\bin\Debug\net10.0\EShopManager.API.exe" -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
