#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Creates an Entra ID app registration with Teams/Chat permissions.
    
.DESCRIPTION
    This script creates an app registration that can be used with the Teams MCP server.
    It requests delegated permissions for Chat and Teams APIs.
    
    After running this script, an admin needs to grant consent in Azure Portal.
    
.EXAMPLE
    ./scripts/create-app-registration.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "🔧 Creating Entra ID App Registration for Teams MCP" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "❌ Not logged in. Run 'az login' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "   Tenant: $($account.tenantId)" -ForegroundColor Gray
Write-Host ""

# App name
$appName = "Teams MCP Server - $($account.user.name)"

# Microsoft Graph API ID
$graphApiId = "00000003-0000-0000-c000-000000000000"

# Required delegated permissions (scope IDs from Microsoft Graph)
$permissions = @(
    @{ id = "465a38f9-76ea-45b9-9f34-9e8b0d4b0b42"; type = "Scope" }  # Chat.ReadWrite
    @{ id = "ebf0f66e-9fb1-49e4-a278-222f76911cf4"; type = "Scope" }  # ChannelMessage.Send
    @{ id = "2280dda6-0bfd-44ee-a2f4-cb867cfc4c1e"; type = "Scope" }  # Team.ReadBasic.All
    @{ id = "9d8982ae-4365-4f57-95e9-d6032a4c0b87"; type = "Scope" }  # Channel.ReadBasic.All
    @{ id = "e1fe6dd8-ba31-4d61-89e7-88639da4683d"; type = "Scope" }  # User.Read
)

# Create the app
Write-Host "📝 Creating app registration: $appName" -ForegroundColor Yellow

$app = az ad app create `
    --display-name $appName `
    --public-client-redirect-uris "https://login.microsoftonline.com/common/oauth2/nativeclient" "http://localhost" `
    --sign-in-audience "AzureADMyOrg" `
    2>&1 | ConvertFrom-Json

if (-not $app.appId) {
    Write-Host "❌ Failed to create app" -ForegroundColor Red
    exit 1
}

Write-Host "✅ App created with ID: $($app.appId)" -ForegroundColor Green
Write-Host ""

# Add API permissions
Write-Host "🔑 Adding Microsoft Graph permissions..." -ForegroundColor Yellow

foreach ($perm in $permissions) {
    az ad app permission add `
        --id $app.appId `
        --api $graphApiId `
        --api-permissions "$($perm.id)=$($perm.type)" `
        2>&1 | Out-Null
}

Write-Host "✅ Permissions added" -ForegroundColor Green
Write-Host ""

# Output configuration
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    CONFIGURATION                              " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add these environment variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  TEAMS_MCP_CLIENT_ID=$($app.appId)" -ForegroundColor White
Write-Host "  TEAMS_MCP_TENANT_ID=$($account.tenantId)" -ForegroundColor White
Write-Host ""
Write-Host "Or add to your MCP config:" -ForegroundColor Yellow
Write-Host ""
Write-Host @"
{
  "servers": {
    "teams": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/teams-mcp/dist/index.js"],
      "env": {
        "TEAMS_MCP_CLIENT_ID": "$($app.appId)",
        "TEAMS_MCP_TENANT_ID": "$($account.tenantId)"
      }
    }
  }
}
"@ -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Admin consent required!" -ForegroundColor Red
Write-Host ""
Write-Host "   Ask your admin to grant consent at:" -ForegroundColor Yellow
Write-Host "   https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/$($app.appId)" -ForegroundColor White
Write-Host ""
Write-Host "   Or run (requires admin role):" -ForegroundColor Yellow
Write-Host "   az ad app permission admin-consent --id $($app.appId)" -ForegroundColor White
Write-Host ""
