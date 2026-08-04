import { mkdir, readFile, writeFile } from "node:fs/promises";

const files = {
  "/": ["index.html", "text/html; charset=utf-8", false],
  "/index.html": ["index.html", "text/html; charset=utf-8", false],
  "/sobre": ["sobre/index.html", "text/html; charset=utf-8", false],
  "/sobre/": ["sobre/index.html", "text/html; charset=utf-8", false],
  "/sobre/index.html": ["sobre/index.html", "text/html; charset=utf-8", false],
  "/assets/css/style.css": ["assets/css/style.css", "text/css; charset=utf-8", false],
  "/assets/js/script.js": ["assets/js/script.js", "text/javascript; charset=utf-8", false],
  "/assets/images/orb9-logo-social.png": ["assets/images/orb9-logo-social.png", "image/png", true],
  "/assets/images/orb9-symbol.png": ["assets/images/orb9-symbol.png", "image/png", true],
  "/assets/images/orb9-header-logo.png": ["assets/images/orb9-header-logo.png", "image/png", true],
  "/assets/images/orb9-favicon.png": ["assets/images/orb9-favicon.png", "image/png", true],
  "/assets/video/orb9-ecosystem.mp4": ["assets/video/orb9-ecosystem.mp4", "video/mp4", true],
};

const bundled = {};
for (const [route, [path, type, binary]] of Object.entries(files)) {
  const contents = await readFile(path);
  bundled[route] = { body: binary ? contents.toString("base64") : contents.toString("utf8"), type, binary };
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

    const body = file.binary
      ? Uint8Array.from(atob(file.body), character => character.charCodeAt(0))
      : file.body;

    return new Response(body, {
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
