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
