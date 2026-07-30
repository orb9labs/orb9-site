import { mkdir, readFile, writeFile } from "node:fs/promises";

const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/assets/css/style.css": ["assets/css/style.css", "text/css; charset=utf-8"],
  "/assets/js/script.js": ["assets/js/script.js", "text/javascript; charset=utf-8"],
};

const bundled = {};
for (const [route, [path, type]] of Object.entries(files)) {
  bundled[route] = { body: await readFile(path, "utf8"), type };
}

const worker = `const files = ${JSON.stringify(bundled)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const file = files[url.pathname];

    if (!file) {
      return new Response("Página não encontrada", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }

    return new Response(file.body, {
      headers: {
        "content-type": file.type,
        "cache-control": url.pathname === "/" || url.pathname === "/index.html"
          ? "public, max-age=0, must-revalidate"
          : "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin"
      }
    });
  }
};
`;

await mkdir("dist/server", { recursive: true });
await writeFile("dist/server/index.js", worker);
