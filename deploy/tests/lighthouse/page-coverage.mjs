// Page coverage of the Lighthouse audits: how many of the app's pages they open. The pages are read from
// frontend/src/lib/routes.ts, the audited URLs from the manifest Lighthouse CI writes with its reports.
// Run with: node page-coverage.mjs <lighthouse-reports/manifest.json> [<report.json>]
import { readFileSync, writeFileSync } from "node:fs";

const [manifestFile, reportFile] = process.argv.slice(2);
if (!manifestFile) throw new Error("usage: node page-coverage.mjs <manifest.json> [<report.json>]");

const routesTs = readFileSync(new URL("../../../frontend/src/lib/routes.ts", import.meta.url), "utf8");
const [, routesBlock] = routesTs.match(/export const ROUTES = \{([^}]*)\}/) ?? [];
const pages = [...(routesBlock ?? "").matchAll(/"([^"]+)"/g)].map(([, path]) => path);
if (pages.length === 0) throw new Error("no pages found in frontend/src/lib/routes.ts");

// one entry per run, so each audited page appears several times
const audited = new Set(JSON.parse(readFileSync(manifestFile, "utf8")).map(({ url }) => new URL(url).pathname));
const covered = pages.filter((page) => audited.has(page));
const percent = ((100 * covered.length) / pages.length).toFixed(1);

for (const page of pages) console.log(`${audited.has(page) ? "✓" : "✗"} ${page}`);
console.log(`Lighthouse page coverage: ${percent}% (${covered.length}/${pages.length} pages)`);

if (reportFile) {
  const report = { percent: Number(percent), covered, uncovered: pages.filter((page) => !audited.has(page)) };
  writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
}
