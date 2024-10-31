import * as fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath, URL } from "node:url";

const pagesMeta = [
  { url: "https://helixbridge.app", priority: 1.0 },
  { url: "https://helixbridge.app/#/relayer", priority: 0.8 },
  { url: "https://helixbridge.app/#/explorer", priority: 0.8 },
  { url: "https://testnet.helixbridge.app", priority: 0.8 },
];

const urls = pagesMeta
  .map((pageMeta) => {
    const url = new URL(pageMeta.url);
    return `  <url>
    <loc>${url.toString()}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${pageMeta.priority.toFixed(1)}</priority>
  </url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
fs.writeFileSync(path.resolve(__dirname, "../dist/sitemap.xml"), sitemap);
