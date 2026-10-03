// Lighthouse CI for the pages anyone can reach without an account. Each page is audited three times and
// the median run is asserted, so one slow run doesn't fail the pipeline. Reports are written to
// lighthouse-reports/ (a CI artifact), never uploaded anywhere.
// Run with: BASE_URL=https://<host> CHROME_PATH=<chromium> npx @lhci/cli autorun --config=<this file>
const base = process.env.BASE_URL;
if (!base) throw new Error("BASE_URL must be set");

module.exports = {
  ci: {
    collect: {
      url: [`${base}/`, `${base}/signUp`],
      numberOfRuns: 3,
      settings: {
        // containers have no sandbox support and a small /dev/shm
        chromeFlags: "--headless=new --no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      // just under the first baseline (performance 0.99-1, accessibility and best practices 1, SEO 0.9),
      // so a real regression fails the pipeline but run-to-run noise doesn't
      assertions: {
        "categories:performance": ["error", { minScore: 0.9, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:best-practices": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:seo": ["warn", { minScore: 0.9, aggregationMethod: "median-run" }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "lighthouse-reports",
    },
  },
};
