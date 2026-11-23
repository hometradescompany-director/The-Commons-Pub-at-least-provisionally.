import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const files = new Map([
  ["/", ["../demo/index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["../demo/styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["../demo/app.js", "text/javascript; charset=utf-8"]],
  ["/renderer-2d.js", ["../demo/renderer-2d.js", "text/javascript; charset=utf-8"]],
  ["/simulator.js", ["../src/simulator.js", "text/javascript; charset=utf-8"]],
  ["/fixtures.js", ["../src/fixtures.js", "text/javascript; charset=utf-8"]]
]);

const server = createServer(async (request, response) => {
  if (request.method !== "GET") {
    response.writeHead(405, { "content-type": "text/plain; charset=utf-8", allow: "GET" });
    response.end("Method not allowed");
    return;
  }
  let pathname;
  try {
    pathname = new URL(request.url, "http://127.0.0.1").pathname;
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }
  if (pathname === "/favicon.ico") {
    response.writeHead(204);
    response.end();
    return;
  }
  const entry = files.get(pathname);
  if (!entry) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  try {
    const contents = await readFile(new URL(entry[0], import.meta.url));
    response.writeHead(200, {
      "content-type": entry[1],
      "cache-control": "no-store",
      "content-security-policy": "default-src 'self'; connect-src 'none'; script-src 'self'; style-src 'self'; base-uri 'none'; form-action 'none'",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    });
    response.end(contents);
  } catch {
    response.writeHead(500);
    response.end("Unable to load local demo");
  }
});

server.listen(4173, "127.0.0.1", () => {
  process.stdout.write("Commons Pub demo: http://127.0.0.1:4173\n");
});

server.on("error", error => {
  process.stderr.write(`Unable to start local demo server: ${error.message}\n`);
  process.exitCode = 1;
});
