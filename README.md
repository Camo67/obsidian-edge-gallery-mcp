This documentation establishes your open-source credit for creating the **Edge Gallery AI MCP Gateway** (`obsidian-edge-gallery-mcp`).

It provides the complete structure needed to publish the project to GitHub, follow standard Obsidian development specifications, and successfully run the native on-device loop loopback configuration.

---

## 📁 Repository Structure Blueprint

Initialize your repository with exactly these four foundational files in the plugin bundle folder (`.obsidian/plugins/obsidian-edge-gallery-mcp/`):

```
📂 obsidian-edge-gallery-mcp
├── 📄 manifest.json      <-- Plugin identification & metadata
├── 📄 main.ts             <-- Core Model Context Protocol Server engine
├── 📄 package.json       <-- Node build dependencies 
└── 📄 README.md          <-- Public architectural blueprint & user guide

```

---

## 📄 1. `manifest.json`

```json
{
  "id": "obsidian-edge-gallery-mcp",
  "name": "Edge Gallery AI MCP Gateway",
  "version": "1.0.0",
  "minAppVersion": "1.4.0",
  "description": "Exposes local Vault data directory structures directly to Google AI Edge Gallery via native Model Context Protocol over Streamable HTTP.",
  "author": "Cameron De Vries",
  "authorUrl": "https://github.com/CommunityinUnityza",
  "isDesktopOnly": false
}

```

---

## 📄 2. `package.json`

```json
{
  "name": "obsidian-edge-gallery-mcp",
  "version": "1.0.0",
  "description": "Native Obsidian MCP server tracking loopback interfaces for Edge Gallery.",
  "main": "main.js",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {},
  "devDependencies": {
    "obsidian": "latest",
    "typescript": "^5.0.0"
  }
}

```

---

## 📄 3. `main.ts`

```typescript
import { Plugin, Notice } from 'obsidian';

export default class EdgeGalleryMCPPlugin extends Plugin {
  server: any;

  async onload() {
    console.log('Initializing Obsidian Edge Gallery MCP Bridge Engine...');
    this.startLocalMCPServer();
  }

  startLocalMCPServer() {
    const http = require('http');

    this.server = http.createServer(async (req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // 1. MCP Tool Discovery Endpoint for the Edge Gallery client app
      if (req.method === 'GET' && req.url === '/tools') {
        return res.end(JSON.stringify({
          tools: [
            {
              name: "read_training_ingredients",
              description: "Pulls raw markdown context parameters out of the 01_Dry_Ingredients training folder",
              inputSchema: { type: "object", properties: {} }
            }
          ]
        }));
      }

      // 2. MCP Tool Execution Handling Loop
      if (req.method === 'POST' && req.url === '/tools/call') {
        let payloadBuffer = '';
        req.on('data', (chunk: any) => payloadBuffer += chunk);
        req.on('end', async () => {
          try {
            const bodyData = JSON.parse(payloadBuffer);

            if (bodyData.name === "read_training_ingredients") {
              const files = this.app.vault.getMarkdownFiles().filter(f => f.path.startsWith('01_Dry_Ingredients/'));
              
              if (files.length === 0) {
                return res.end(JSON.stringify({ content: [{ type: "text", text: "No pending training files found inside ingestion layer." }] }));
              }

              const activeFileText = await this.app.vault.read(files[0]);
              new Notice(`Gemma 4 Edge Agent is parsing: ${files[0].name}`);

              return res.end(JSON.stringify({
                content: [{ type: "text", text: `File Content for ${files[0].name}:\n\n${activeFileText}` }]
              }));
            }
          } catch (err) {
            res.writeHead(500);
            return res.end(JSON.stringify({ error: "Internal processing malfunction" }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end();
    });

    // Deploy to local internal loopback network dock
    this.server.listen(3000, '127.0.0.1', () => {
      new Notice('Edge Gallery MCP Bridge Live on Port 3000');
    });
  }

  onunload() {
    if (this.server) {
      this.server.close();
    }
    console.log('Obsidian Edge Gallery MCP Bridge Offline.');
  }
}

```

---

## 📄 4. `README.md`

```markdown
# Edge Gallery AI MCP Gateway for Obsidian Mobile

A decentralized, open-source Model Context Protocol (MCP) server engineered completely inside an Obsidian Community Plugin. This tool bridges on-device local storage vaults directly to the native **Google AI Edge Gallery** Android platform via local loopback.

## 🛰️ Architecture
No cloud servers, no remote API subscriptions, and no developer computer required. Your phone is a self-contained AI business simulation lab.


```

[ Google AI Edge Gallery App ] (Gemma 4 Native Inference Runtime)
|
| (Secure Loopback Local Machine Network Request)
v
[ Your Obsidian Plugin Engine ] (Local Host MCP Server on Port 3000)
|
+---> Scans /01_Dry_Ingredients & Pipes to Sandbox Logic

```

## 🛠️ Step-by-Step Device Deployment

### 1. File Placement
Drop the compiled plugin bundle inside your targeted local obsidian training folder directory:
`YOUR_VAULT/.obsidian/plugins/obsidian-edge-gallery-mcp/`

### 2. Activate Plugin
1. Open Obsidian Mobile Settings -> **Community Plugins**.
2. Refresh and toggle **Edge Gallery AI MCP Gateway** to `ON`.
3. Confirm the status message: `Edge Gallery MCP Bridge Live on Port 3000`.

### 3. Connect Google AI Edge Gallery App
1. Fire up the **Google AI Edge Gallery** application on your smartphone.
2. Ensure you have the `Gemma-4-E2B-it` agent-capable model activated.
3. Access the top configuration menu and locate the **Agent Skills / Model Context Protocol (MCP)** interface panel.
4. Tap **+ Add MCP Server** and insert your dedicated local address entry hook:
   * **URL:** `http://127.0.0.1:3000/tools`
5. Initiate connection. The on-device model will automatically import your folder system tools directly into its native processing memory pipeline.

```
