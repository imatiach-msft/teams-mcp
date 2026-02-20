# Teams MCP Server (Secure)

A secure Microsoft Teams MCP server using **only official Microsoft packages**.

## Security

This server uses exclusively official Microsoft packages:

| Package | Source | Purpose |
|---------|--------|---------|
| `@azure/identity` | [Microsoft Azure SDK](https://github.com/Azure/azure-sdk-for-js) | Authentication |
| `@microsoft/microsoft-graph-client` | [Microsoft Graph SDK](https://github.com/microsoftgraph/msgraph-sdk-javascript) | Graph API calls |
| `@modelcontextprotocol/sdk` | [Anthropic MCP](https://github.com/modelcontextprotocol/typescript-sdk) | MCP protocol |

**No third-party authentication or API wrappers.**

## Prerequisites

- Node.js 18+
- Azure CLI (`az login`) - required for authentication

## Installation

```bash
npm install
npm run build
```

## Authentication

The server uses Azure CLI credentials (`az login`). For enterprise tenants with Conditional Access policies blocking Graph API Chat permissions, use the **Power Automate integration** instead.

## Power Automate Integration (Recommended for Enterprise)

If your organization blocks direct Graph API access to Teams chats, you can use Power Automate as a bridge:

### One-time Setup

1. Go to [Power Automate](https://make.powerautomate.com)
2. Create a new **Instant cloud flow**
3. Add trigger: **"When an HTTP request is received"**
4. Click "Use sample payload" and enter: `{"message": "Hello"}`
5. Add action: **"Post message in a chat or channel"** (Microsoft Teams)
6. Configure the Teams action with your target chat/channel
7. For Message, select **message** from Dynamic content
8. Save and turn on the flow
9. Copy the HTTP POST URL from the trigger

### Usage

```bash
# Set your Power Automate flow URL
export POWER_AUTOMATE_URL="https://....powerplatform.com/.../invoke?api-version=1"

# Post a message (uses Azure AD auth automatically)
curl -X POST "$POWER_AUTOMATE_URL" \
  -H "Authorization: Bearer $(az account get-access-token --resource https://service.flow.microsoft.com/ --query accessToken -o tsv)" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from MCP!"}'
```

## Usage

### Add to your MCP config

**VS Code (`.vscode/mcp.json`):**
```json
{
  "servers": {
    "teams": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/teams-mcp/dist/index.js"]
    }
  }
}
```

**Claude Desktop (`claude_desktop_config.json`):**
```json
{
  "mcpServers": {
    "teams": {
      "command": "node",
      "args": ["C:/teams-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_current_user` | Get authenticated user info |
| `list_chats` | List user's Teams chats |
| `list_teams` | List joined Teams |
| `list_channels` | List channels in a Team |
| `send_chat_message` | Send message to a chat (requires Graph permissions) |
| `send_channel_message` | Send message to a channel (requires Graph permissions) |
| `get_chat_messages` | Get messages from a chat |
| `get_channel_messages` | Get messages from a channel |
| `send_via_power_automate` | **Send message via Power Automate** (bypasses Graph restrictions) |

## Examples

### Send a message via Power Automate (Recommended)
```json
{
  "tool": "send_via_power_automate",
  "arguments": {
    "flowUrl": "https://....powerplatform.com/.../invoke?api-version=1",
    "message": "Hello from MCP!"
  }
}
```

### Send a message to a chat (requires Graph permissions)
```json
{
  "tool": "send_chat_message",
  "arguments": {
    "chatId": "19:abc123@thread.v2",
    "message": "Hello from MCP!"
  }
}
```

## License

MIT
