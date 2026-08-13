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
  assert.match(dashboard, /className="subnav"/);
  assert.match(dashboard, /Money future/);
  assert.match(dashboard, /Time future/);
  assert.match(dashboard, /Energy future/);
  assert.match(dashboard, /hidden=\{active!=="Overview"\}/);
  assert.doesNotMatch(dashboard, /navigate\("ROI Compass"\)/);
  assert.match(css, /\.side-foot \.account-copy\{min-width:0/);
  assert.match(css, /\.ambient-orb/);
});
