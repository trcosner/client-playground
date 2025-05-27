import { createServer } from "http";
import next from "next";
import { WebSocketServer } from "ws";
import chokidar from "chokidar";
import path from "path";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = parseInt(process.env.PORT || "3000", 10);
const shaderPath = path.join(process.cwd(), "public", "shaders");

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // WebSocket server (manual upgrade)
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    console.log("[WebSocket] Client connected.");
  });

  // Broadcast to all WebSocket clients
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Watch shader directory and notify clients
  chokidar.watch(shaderPath).on("change", (filePath) => {
    const fileName = path.basename(filePath);
    console.log(`[Shader Watcher] Reload: ${fileName}`);
    broadcast({ type: "shader-update", file: fileName });
  });

  // Only handle upgrades for our custom WebSocket route
  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
    // DO NOT destroy socket here – Next.js needs upgrades for HMR.
  });

  server.listen(PORT, () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
});
