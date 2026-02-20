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
- Azure CLI (`az login`) - recommended for seamless auth

## Installation

```bash
npm install
npm run build
```

## Authentication

The server uses a credential chain:

1. **Azure CLI** (recommended): If you're logged in via `az login`, it uses those credentials automatically
2. **Device Code**: Falls back to device code flow if Azure CLI isn't available

### Required Graph API Permissions

Your Azure identity needs these delegated permissions:
- `Chat.ReadWrite` - Read and send chat messages
- `ChannelMessage.Send` - Send channel messages
- `Team.ReadBasic.All` - List teams
- `Channel.ReadBasic.All` - List channels
- `User.Read` - Get current user

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

### Development mode

```bash
npm run dev
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_current_user` | Get authenticated user info |
| `list_chats` | List user's Teams chats |
| `list_teams` | List joined Teams |
| `list_channels` | List channels in a Team |
| `send_chat_message` | Send message to a chat |
| `send_channel_message` | Send message to a channel |
| `get_chat_messages` | Get messages from a chat |
| `get_channel_messages` | Get messages from a channel |

## Examples

### Send a message to a chat
```json
{
  "tool": "send_chat_message",
  "arguments": {
    "chatId": "19:abc123@thread.v2",
    "message": "Hello from MCP!"
  }
}
```

### Send a message to a channel
```json
{
  "tool": "send_channel_message",
  "arguments": {
    "teamId": "team-guid",
    "channelId": "channel-guid",
    "message": "Hello team!"
  }
}
```

## License

MIT
