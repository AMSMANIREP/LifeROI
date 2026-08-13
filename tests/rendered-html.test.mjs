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
  assert.match(html, /not guaranteed/i);
  assert.doesNotMatch(html, /codex-preview/);
});

test("uses finished product metadata", async () => {
  const { readFile } = await import("node:fs/promises");
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");
  assert.match(layout, /LifeROI/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
});
