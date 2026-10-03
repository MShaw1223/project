// Route coverage of the smoke checks: how many of the backend's routes they send a request to. It says
// what the checks reach in a deployed environment, not how much code runs (the unit tests measure that).
// The routes are read from backend/main.go, the requests from the file the checks write (REQUESTS_FILE).
// Run with: node route-coverage.mjs <requests.json> [<report.json>]
import { readFileSync, writeFileSync } from "node:fs";

const [requestsFile, reportFile] = process.argv.slice(2);
if (!requestsFile) throw new Error("usage: node route-coverage.mjs <requests.json> [<report.json>]");

const mainGo = readFileSync(new URL("../../../backend/main.go", import.meta.url), "utf8");
const routes = [...mainGo.matchAll(/router\.(GET|POST|PUT|PATCH|DELETE)\("([^"]+)"/g)].map(([, method, path]) => ({
  method,
  path,
  // :id matches one path segment
  pattern: new RegExp(`^${path.replace(/:[^/]+/g, "[^/]+")}$`),
}));
if (routes.length === 0) throw new Error("no routes found in backend/main.go");

// the checks reach the backend through the frontend's /backend proxy
const requests = JSON.parse(readFileSync(requestsFile, "utf8"))
  .filter(({ path }) => path.startsWith("/backend/"))
  .map(({ method, path }) => ({ method, path: path.slice("/backend".length) }));

const reached = (route) => requests.some(({ method, path }) => method === route.method && route.pattern.test(path));
const covered = routes.filter(reached);
const percent = ((100 * covered.length) / routes.length).toFixed(1);

for (const route of routes) console.log(`${reached(route) ? "✓" : "✗"} ${route.method} ${route.path}`);
console.log(`Smoke route coverage: ${percent}% (${covered.length}/${routes.length} backend routes)`);

if (reportFile) {
  const name = ({ method, path }) => `${method} ${path}`;
  const report = {
    percent: Number(percent),
    covered: covered.map(name),
    uncovered: routes.filter((route) => !reached(route)).map(name),
  };
  writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
}
