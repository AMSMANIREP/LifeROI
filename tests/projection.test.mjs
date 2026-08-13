import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/domain/projection.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const service = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

test("calculates guaranteed arithmetic savings deterministically", () => {
  const result = service.calculateProjection({ monthlySpending: 80000, reductionPercentage: 10, years: 10, annualReturn: 0, currentSavings: 200000 });
  assert.equal(result.monthlySavings, 8000);
  assert.equal(result.annualSavings, 96000);
  assert.equal(result.futureCashValue, 1160000);
  assert.equal(result.futureInvestmentValue, result.futureCashValue);
});

test("compounds monthly contributions and separates inflation-adjusted value", () => {
  const result = service.calculateProjection({ monthlySpending: 80000, reductionPercentage: 10, years: 10, annualReturn: 8, currentSavings: 200000, inflationRate: 5 });
  assert.ok(result.futureInvestmentValue > result.futureCashValue);
  assert.ok(result.inflationAdjustedValue < result.futureInvestmentValue);
});

test("converts reclaimed attention into annual hours", () => {
  const result = service.timeRecovered(150, 20);
  assert.equal(result.dailyMinutes, 30);
  assert.ok(Math.abs(result.annualHours - 182.5) < 0.001);
});
