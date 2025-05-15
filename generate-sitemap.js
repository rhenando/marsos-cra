// generate-sitemap.js (CommonJS version for CRA)
const { SitemapStream, streamToPromise } = require("sitemap");
const fs = require("fs");
const path = require("path");

const sitemap = new SitemapStream({ hostname: "https://marsos.sa" });

sitemap.write({ url: "/", changefreq: "daily", priority: 1.0 });
sitemap.write({ url: "/products", changefreq: "weekly", priority: 0.8 });
sitemap.write({ url: "/categories", changefreq: "weekly", priority: 0.8 });
// Add more static routes as needed...

sitemap.end();

streamToPromise(sitemap).then((data) => {
  const outputPath = path.resolve(__dirname, "public", "sitemap.xml");
  fs.writeFileSync(outputPath, data);
  console.log("✅ Sitemap generated at public/sitemap.xml");
});
