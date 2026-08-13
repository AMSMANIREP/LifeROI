import assert from "node:assert/strict";

const workerUrl = new URL("../../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("performance-smoke", `${Date.now()}`);
const { default: worker } = await import(workerUrl.href);
const env = { ASSETS:{ fetch:async()=>new Response("Not found",{status:404}) } };
const context = { waitUntil(){}, passThroughOnException(){} };

async function renderOnce() {
  const started = performance.now();
  const response = await worker.fetch(new Request("http://localhost/", { headers:{ accept:"text/html" } }), env, context);
  assert.equal(response.status, 200);
  await response.arrayBuffer();
  return performance.now() - started;
}

for (let index=0; index<3; index++) await renderOnce();
const samples = [];
for (let index=0; index<25; index++) samples.push(await renderOnce());
samples.sort((a,b)=>a-b);
const percentile = value => samples[Math.min(samples.length-1, Math.ceil(samples.length*value)-1)];
console.log(JSON.stringify({ requests:samples.length, p50Ms:+percentile(.5).toFixed(2), p95Ms:+percentile(.95).toFixed(2), p99Ms:+percentile(.99).toFixed(2), environment:"local built worker; excludes network, browser, AI, storage, and database" }));
