#!/usr/bin/env node
/**
 * stdio entry for Claude Desktop, Claude Code and Cursor. It is a thin relay: JSON-RPC from stdio is forwarded to a FormFlow
 * instance's Streamable HTTP endpoint (`<FORMFLOW_URL>/api/mcp`) with your API key. No database or app code is loaded.
 *
 *   FORMFLOW_API_KEY=ff_live_... FORMFLOW_URL=https://forms.example.com npx -y @formizeflow/mcp
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

const key = process.env.FORMFLOW_API_KEY;
const base = (process.env.FORMFLOW_URL ?? "https://formize.net").replace(/\/$/, "");
if (!key) {
  console.error("FORMFLOW_API_KEY is required (create one in Settings > Developers).");
  process.exit(1);
}

const up = new StreamableHTTPClientTransport(new URL(`${base}/api/mcp`), { requestInit: { headers: { Authorization: `Bearer ${key}` } } });
const down = new StdioServerTransport();

const isRequest = (m: JSONRPCMessage): m is JSONRPCMessage & { id: string | number; method: string } => "method" in m && "id" in m;

down.onmessage = (m) => {
  up.send(m).catch((e: unknown) => {
    console.error(`[formflow-mcp] ${e instanceof Error ? e.message : "request failed"}`);
    if (isRequest(m)) void down.send({ jsonrpc: "2.0", id: m.id, error: { code: -32000, message: `FormFlow request failed: ${e instanceof Error ? e.message : "unknown error"}` } });
  });
};
up.onmessage = (m) => { void down.send(m); };
up.onerror = (e) => console.error(`[formflow-mcp] ${e.message}`);
down.onerror = (e) => console.error(`[formflow-mcp] ${e.message}`);
up.onclose = () => { void down.close(); };
down.onclose = () => { void up.close().finally(() => process.exit(0)); };

void (async () => { await up.start(); await down.start(); })().catch((e: unknown) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
