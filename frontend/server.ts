import { serve } from "bun";
import { readFileSync } from "fs";
import path from "path";

const server = serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    log(req);
    let filePath = path.join("src", url.pathname);

    // Serve index.html for the root path
    if (url.pathname === "/") {
      filePath = path.join("src", "index.html");
    }

    try {
      const file = readFileSync(filePath);
      const ext = path.extname(filePath);
      const contentType = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
      }[ext] || "text/plain";

      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  },
});

let log = (req: Request) => {
  console.log(`${req.method} received at ${req.url}`);
};

console.log(`Listening on http://localhost:${server.port}...`);
