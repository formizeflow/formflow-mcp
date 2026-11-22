# @formizeflow/mcp

[![CI](https://github.com/formizeflow/formflow-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/formizeflow/formflow-mcp/actions/workflows/ci.yml)

The FormFlow MCP server. Your agent can build forms, publish them, run A/B tests and read responses and results in your FormFlow workspace.

It is a small stdio relay: messages from your MCP client go to `https://formize.net/api/mcp` with your API key. Nothing else is loaded or stored.

## Setup

Create an API key in FormFlow under Settings > API keys, with only the scopes the agent needs.

### Claude Code

```bash
claude mcp add formflow -e FORMFLOW_API_KEY=ff_live_... -- npx -y @formizeflow/mcp
# or straight over HTTP, no package:
claude mcp add --transport http formflow https://formize.net/api/mcp --header "Authorization: Bearer $FORMFLOW_API_KEY"
```

### Claude Desktop (`claude_desktop_config.json`) and Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "formflow": {
      "command": "npx",
      "args": ["-y", "@formizeflow/mcp"],
      "env": { "FORMFLOW_API_KEY": "ff_live_..." }
    }
  }
}
```

## Environment

| Variable | Default | |
|---|---|---|
| `FORMFLOW_API_KEY` | required | A FormFlow API key (`ff_live_...`) or OAuth access token |
| `FORMFLOW_URL` | `https://formize.net` | Your FormFlow host, for self-hosted or custom domains |

Every tool checks the key's scopes, stays inside the key's workspace, and writes an audit event (`mcp.<tool>`).
