#!/usr/bin/env node
/**
 * Secure Microsoft Teams MCP Server
 *
 * This MCP server uses ONLY official Microsoft packages:
 * - @azure/identity: Official Azure authentication
 * - @microsoft/microsoft-graph-client: Official Graph SDK
 *
 * Authentication uses Azure CLI credentials (az login) or Device Code flow.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Client } from "@microsoft/microsoft-graph-client";
import {
  AzureCliCredential,
  DeviceCodeCredential,
  ChainedTokenCredential,
} from "@azure/identity";

// Graph API scopes for Teams
const GRAPH_SCOPES = [
  "https://graph.microsoft.com/Chat.ReadWrite",
  "https://graph.microsoft.com/ChannelMessage.Send",
  "https://graph.microsoft.com/Team.ReadBasic.All",
  "https://graph.microsoft.com/Channel.ReadBasic.All",
  "https://graph.microsoft.com/User.Read",
];

/**
 * Create authenticated Microsoft Graph client using Azure identity
 */
function createGraphClient(): Client {
  // Try Azure CLI first, fall back to device code
  const credential = new ChainedTokenCredential(
    new AzureCliCredential(),
    new DeviceCodeCredential({
      clientId: "04b07795-8ddb-461a-bbee-02f9e1bf7b46", // Azure CLI client ID (public)
      tenantId: "common",
      userPromptCallback: (info) => {
        console.error(`\n🔐 Authentication required:`);
        console.error(`   Visit: ${info.verificationUri}`);
        console.error(`   Enter code: ${info.userCode}\n`);
      },
    })
  );

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken(GRAPH_SCOPES);
        return token?.token ?? "";
      },
    },
  });
}

// Initialize Graph client
const graphClient = createGraphClient();

// Create MCP server
const server = new Server(
  {
    name: "teams-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_current_user",
        description: "Get the current authenticated user's information",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "list_chats",
        description: "List the user's Teams chats",
        inputSchema: {
          type: "object",
          properties: {
            top: {
              type: "number",
              description: "Number of chats to return (default: 20)",
            },
          },
          required: [],
        },
      },
      {
        name: "list_teams",
        description: "List Teams the user has joined",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "list_channels",
        description: "List channels in a specific Team",
        inputSchema: {
          type: "object",
          properties: {
            teamId: {
              type: "string",
              description: "The ID of the Team",
            },
          },
          required: ["teamId"],
        },
      },
      {
        name: "send_chat_message",
        description: "Send a message to a Teams chat",
        inputSchema: {
          type: "object",
          properties: {
            chatId: {
              type: "string",
              description: "The ID of the chat",
            },
            message: {
              type: "string",
              description: "The message content to send",
            },
          },
          required: ["chatId", "message"],
        },
      },
      {
        name: "send_channel_message",
        description: "Send a message to a Teams channel",
        inputSchema: {
          type: "object",
          properties: {
            teamId: {
              type: "string",
              description: "The ID of the Team",
            },
            channelId: {
              type: "string",
              description: "The ID of the channel",
            },
            message: {
              type: "string",
              description: "The message content to send",
            },
          },
          required: ["teamId", "channelId", "message"],
        },
      },
      {
        name: "get_chat_messages",
        description: "Get recent messages from a Teams chat",
        inputSchema: {
          type: "object",
          properties: {
            chatId: {
              type: "string",
              description: "The ID of the chat",
            },
            top: {
              type: "number",
              description: "Number of messages to return (default: 20)",
            },
          },
          required: ["chatId"],
        },
      },
      {
        name: "get_channel_messages",
        description: "Get recent messages from a Teams channel",
        inputSchema: {
          type: "object",
          properties: {
            teamId: {
              type: "string",
              description: "The ID of the Team",
            },
            channelId: {
              type: "string",
              description: "The ID of the channel",
            },
            top: {
              type: "number",
              description: "Number of messages to return (default: 20)",
            },
          },
          required: ["teamId", "channelId"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_current_user": {
        const user = await graphClient.api("/me").get();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(user, null, 2),
            },
          ],
        };
      }

      case "list_chats": {
        const top = (args?.top as number) || 20;
        const chats = await graphClient.api("/me/chats").top(top).get();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(chats.value, null, 2),
            },
          ],
        };
      }

      case "list_teams": {
        const teams = await graphClient.api("/me/joinedTeams").get();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(teams.value, null, 2),
            },
          ],
        };
      }

      case "list_channels": {
        const teamId = args?.teamId as string;
        if (!teamId) throw new Error("teamId is required");

        const channels = await graphClient
          .api(`/teams/${teamId}/channels`)
          .get();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(channels.value, null, 2),
            },
          ],
        };
      }

      case "send_chat_message": {
        const chatId = args?.chatId as string;
        const message = args?.message as string;
        if (!chatId || !message)
          throw new Error("chatId and message are required");

        const result = await graphClient
          .api(`/me/chats/${chatId}/messages`)
          .post({
            body: {
              content: message,
            },
          });
        return {
          content: [
            {
              type: "text",
              text: `Message sent successfully. Message ID: ${result.id}`,
            },
          ],
        };
      }

      case "send_channel_message": {
        const teamId = args?.teamId as string;
        const channelId = args?.channelId as string;
        const message = args?.message as string;
        if (!teamId || !channelId || !message)
          throw new Error("teamId, channelId, and message are required");

        const result = await graphClient
          .api(`/teams/${teamId}/channels/${channelId}/messages`)
          .post({
            body: {
              content: message,
            },
          });
        return {
          content: [
            {
              type: "text",
              text: `Message sent successfully. Message ID: ${result.id}`,
            },
          ],
        };
      }

      case "get_chat_messages": {
        const chatId = args?.chatId as string;
        const top = (args?.top as number) || 20;
        if (!chatId) throw new Error("chatId is required");

        const messages = await graphClient
          .api(`/me/chats/${chatId}/messages`)
          .top(top)
          .get();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(messages.value, null, 2),
            },
          ],
        };
      }

      case "get_channel_messages": {
        const teamId = args?.teamId as string;
        const channelId = args?.channelId as string;
        const top = (args?.top as number) || 20;
        if (!teamId || !channelId)
          throw new Error("teamId and channelId are required");

        const messages = await graphClient
          .api(`/teams/${teamId}/channels/${channelId}/messages`)
          .top(top)
          .get();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(messages.value, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Teams MCP server running on stdio");
}

main().catch(console.error);
