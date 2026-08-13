import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/domain/upload.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const upload = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

test("accepts supported sample-document formats", () => {
  for (const file of [
    { name:"statement.pdf", type:"application/pdf" },
    { name:"usage.csv", type:"text/csv" },
    { name:"notes.txt", type:"text/plain" },
    { name:"screen.png", type:"image/png" },
    { name:"screen.JPG", type:"image/jpeg" },
  ]) assert.deepEqual(upload.validateDemoUpload({ ...file, size:1024 }), { ok:true });
});

test("rejects empty, oversized, unsupported, and MIME-mismatched files", () => {
  const invalid = [
    { name:"empty.pdf", size:0, type:"application/pdf" },
    { name:"huge.pdf", size:upload.MAX_DEMO_UPLOAD_BYTES + 1, type:"application/pdf" },
    { name:"malware.exe", size:100, type:"application/x-msdownload" },
    { name:"renamed.pdf", size:100, type:"application/x-msdownload" },
    { name:"renamed.png", size:100, type:"application/pdf" },
  ];
  for (const file of invalid) assert.equal(upload.validateDemoUpload(file).ok, false);
});
