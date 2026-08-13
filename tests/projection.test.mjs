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

test("matches an independently calculated ordinary-annuity projection", () => {
  const input = { monthlySpending: 80000, reductionPercentage: 10, years: 20, annualReturn: 8, currentSavings: 200000, inflationRate: 5 };
  const result = service.calculateProjection(input);
  const months = input.years * 12;
  const monthlyRate = input.annualReturn / 1200;
  const contribution = input.monthlySpending * input.reductionPercentage / 100;
  const expected = input.currentSavings * (1 + monthlyRate) ** months
    + contribution * (((1 + monthlyRate) ** months - 1) / monthlyRate);
  assert.ok(Math.abs(result.futureInvestmentValue - expected) < 0.01);
  assert.ok(Math.abs(result.inflationAdjustedValue - expected / 1.05 ** 20) < 0.01);
});

test("handles supported savings boundaries without reversing the result", () => {
  let previous = -1;
  for (const reductionPercentage of [0, 5, 10, 15, 20, 25, 30, 100]) {
    const result = service.calculateProjection({ monthlySpending: 80000, reductionPercentage, years: 10, annualReturn: 0 });
    assert.ok(result.futureCashValue >= previous);
    previous = result.futureCashValue;
  }
});

test("rejects unsafe or nonsensical projection inputs", () => {
  const valid = { monthlySpending: 80000, reductionPercentage: 10, years: 10, annualReturn: 8 };
  for (const reductionPercentage of [-10, 101, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => service.calculateProjection({ ...valid, reductionPercentage }));
  }
  assert.throws(() => service.calculateProjection({ ...valid, monthlySpending: -1 }), RangeError);
  assert.throws(() => service.calculateProjection({ ...valid, years: Number.NaN }), TypeError);
});

test("validates goal and time edge cases", () => {
  assert.equal(service.monthsToGoal(0, 0, 0), 0);
  assert.equal(service.monthsToGoal(1000, 0, 0), Number.POSITIVE_INFINITY);
  assert.throws(() => service.monthsToGoal(-1, 0, 100), RangeError);
  assert.throws(() => service.timeRecovered(1441, 10), RangeError);
  assert.throws(() => service.timeRecovered(60, 101), RangeError);
});
