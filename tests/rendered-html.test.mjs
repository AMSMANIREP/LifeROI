import assert from "node:assert/strict";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS:{ fetch:async()=>new Response("Not found",{status:404}) } }, { waitUntil(){}, passThroughOnException(){} });
}

test("renders the LifeROI product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /LifeROI/);
  assert.match(html, /RESOURCE SCORE/i);
  assert.match(html, /WHAT IF\? SIMULATOR/i);
  assert.match(html, /actual usage can vary/i);
  assert.doesNotMatch(html, /codex-preview/);
});

test("uses finished product metadata", async () => {
  const { readFile } = await import("node:fs/promises");
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");
  assert.match(layout, /LifeROI/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
});

test("wires advisor input, keyboard submit, and every navigation destination", async () => {
  const { readFile } = await import("node:fs/promises");
  const dashboard = await readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8");
  assert.match(dashboard, /onSubmit=\{e=>\{e\.preventDefault\(\);askAdvisor\(\)\}\}/);
  assert.match(dashboard, /setAdvisorInput\(x\)/);
  for (const id of ["overview", "money", "time", "energy", "resources", "future", "goals", "opportunities", "settings"]) {
    assert.match(dashboard, new RegExp(`id=\\"${id}\\"`));
  }
  assert.match(dashboard, /IntersectionObserver/);
  assert.match(dashboard, /scroll-floater/);
});

test("uses stable tab views, working information dialogs, and data-aware sections", async () => {
  const { readFile } = await import("node:fs/promises");
  const [dashboard, css] = await Promise.all([
    readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  assert.match(dashboard, /const dataAvailable/);
  assert.match(dashboard, /hidden=\{active!=="Settings"\}/);
  assert.match(dashboard, /setInfo\("score"\)/);
  assert.match(dashboard, /extra.*achievable/i);
  assert.match(dashboard, /emoji-burst/);
  assert.doesNotMatch(dashboard, /const sectionObserver/);
  assert.match(css, /\.sidebar\{position:fixed!important/);
  assert.match(css, /\.tab-section\[hidden\],\.opps-goals>\[hidden\]/);
});

test("provides a dedicated upload workspace, LifeROI Compass, and detailed time allocation", async () => {
  const { readFile } = await import("node:fs/promises");
  const [dashboard, css] = await Promise.all([
    readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  assert.match(dashboard, /className="upload-fab"/);
  assert.match(dashboard, /className="upload-workspace panel tab-section"/);
  assert.match(dashboard, /LifeROI Compass/);
  assert.doesNotMatch(dashboard, /Ask LifeROI<\/b>/);
  assert.match(dashboard, /const timeActivities/);
  assert.match(dashboard, /ACTIVITY BREAKDOWN/);
  assert.match(dashboard, /WEEKLY RHYTHM/);
  assert.match(css, /\.time-details\{display:grid/);
});

test("supports cross-resource documents and the new resource hierarchy", async () => {
  const { readFile } = await import("node:fs/promises");
  const [dashboard, css] = await Promise.all([
    readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  assert.match(dashboard, /type="file"/);
  assert.match(dashboard, /freshSummary/);
  assert.match(dashboard, /Math\.random/);
  assert.match(dashboard, /resource-world/);
  assert.match(dashboard, /world-switch/);
  assert.match(dashboard, /Future Canvas/);
  assert.doesNotMatch(dashboard, /Money future|Time future|Energy future/);
  assert.match(dashboard, /hidden=\{active!=="Overview"\}/);
  assert.doesNotMatch(dashboard, /navigate\("ROI Compass"\)/);
  assert.match(css, /\.side-foot \.account-copy\{min-width:0/);
  assert.match(css, /\.ambient-orb/);
});

test("recalculates every dashboard family from the generated dataset", async () => {
  const { readFile } = await import("node:fs/promises");
  const dashboard = await readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8");
  for (const field of ["dashboard.score", "dashboard.money", "dashboard.screenMinutes", "dashboard.socialMinutes", "dashboard.energyKwh", "dashboard.energyCost", "dashboard.subscriptions", "dashboard.currentSavings", "dashboard.monthlyContribution", "dashboard.monthlyTrend"]) {
    assert.match(dashboard, new RegExp(field.replace(".", "\\.")));
  }
  assert.match(dashboard, /const moneyBreakdown/);
  assert.match(dashboard, /const activityData/);
  assert.match(dashboard, /monthlySpending: dashboard\.money/);
  assert.match(dashboard, /setAdvisorReply\(`Your synthetic dataset/);
});

test("connects life impact with sourced expert inspiration", async () => {
  const { readFile } = await import("node:fs/promises");
  const [dashboard, css, layout] = await Promise.all([
    readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);
  assert.match(dashboard, /THE LIFE DIVIDEND/);
  assert.match(dashboard, /Morgan Housel/);
  assert.match(dashboard, /James Clear/);
  assert.match(dashboard, /Amory Lovins/);
  assert.match(dashboard, /Read the source/);
  assert.match(dashboard, /promiseStreak/);
  assert.match(css, /\.mindset-lab/);
  assert.match(layout, /Buy back your future/);
});

test("places dynamic inspiration first and provides a working account menu", async () => {
  const { readFile } = await import("node:fs/promises");
  const [dashboard, css] = await Promise.all([
    readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  const headerAt = dashboard.indexOf('className="topbar view-header"');
  const quoteAt = dashboard.indexOf('className="mentor-stage mentor-stage-top');
  const heroAt = dashboard.indexOf('className="hero-grid');
  assert.ok(headerAt < quoteAt && quoteAt < heroAt);
  assert.match(dashboard, /useState\(\(\) => Math\.floor\(Math\.random\(\)\*mentors\.length\)\)/);
  assert.match(dashboard, /aria-expanded=\{accountMenu\}/);
  assert.match(dashboard, /className="account-menu"/);
  assert.match(css, /\.account-menu\{/);
  assert.match(css, /\.mentor-stage-top\{/);
});

test("uses the LifeROI growth identity and a varied wisdom stream", async () => {
  const { readFile } = await import("node:fs/promises");
  const [dashboard, css, favicon] = await Promise.all([
    readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("public/favicon.svg", root), "utf8"),
  ]);
  assert.match(dashboard, /Your life, multiplied/);
  assert.match(dashboard, /LifeROI infinity growth logo/);
  assert.match(dashboard, /WISDOM STREAM/);
  assert.match(dashboard, /quote-lesson/);
  assert.match(dashboard, /Options make people happy/);
  assert.doesNotMatch(dashboard, /A new perspective with every visit/);
  assert.doesNotMatch(dashboard, /<b>Upload data<\/b><i>/);
  assert.match(css, /\.f12\{/);
  assert.match(favicon, /linearGradient/);
});

test("derives a stable cute profile character from name and gender", async () => {
  const { readFile } = await import("node:fs/promises");
  const [dashboard, css] = await Promise.all([
    readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  assert.match(dashboard, /type Gender = "male"\|"female"\|"nonbinary"/);
  assert.match(dashboard, /const cuteCharacter/);
  assert.match(dashboard, /signature%characters\.length/);
  assert.match(dashboard, /profileCharacter/);
  assert.match(dashboard, /personalized \$\{profile\.gender\} character/);
  assert.match(css, /\.character-avatar\{/);
  assert.match(css, /\.account-menu-profile\{/);
});

test("reserves a collision-free lane for the upload control", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("app/globals.css", root), "utf8");
  assert.match(css, /\.topbar\{min-height:92px;padding-right:230px/);
  assert.match(css, /\.upload-fab\{top:20px;right:22px;min-width:174px;height:54px/);
  assert.match(css, /\.section-anchor\{scroll-margin-top:112px\}/);
  assert.match(css, /@media\(max-width:720px\)\{\.content\{padding-top:76px\}/);
});

test("states the prototype upload boundary and supports keyboard-safe dialogs", async () => {
  const { readFile } = await import("node:fs/promises");
  const dashboard = await readFile(new URL("app/LifeROIDashboard.tsx", root), "utf8");
  assert.match(dashboard, /Use synthetic samples only/);
  assert.match(dashboard, /does not read or store file contents/);
  assert.match(dashboard, /validateDemoUpload\(file\)/);
  assert.match(dashboard, /event\.key === "Escape"/);
  assert.match(dashboard, /aria-labelledby="active-modal-title"/);
});
