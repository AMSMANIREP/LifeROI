export type ProjectionInput = {
  monthlySpending: number;
  reductionPercentage: number;
  years: number;
  annualReturn: number;
  currentSavings?: number;
  inflationRate?: number;
};

export type ProjectionResult = {
  monthlySavings: number;
  annualSavings: number;
  futureCashValue: number;
  futureInvestmentValue: number;
  inflationAdjustedValue: number;
};

function finiteNumber(name: string, value: number): number {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
  return value;
}

function range(name: string, value: number, minimum: number, maximum: number): number {
  finiteNumber(name, value);
  if (value < minimum || value > maximum) {
    throw new RangeError(`${name} must be between ${minimum} and ${maximum}`);
  }
  return value;
}

export function calculateProjection(input: ProjectionInput): ProjectionResult {
  const monthlySpending = range("monthlySpending", input.monthlySpending, 0, Number.MAX_SAFE_INTEGER);
  const reductionPercentage = range("reductionPercentage", input.reductionPercentage, 0, 100);
  const years = range("years", input.years, 0, 100);
  const annualReturn = range("annualReturn", input.annualReturn, 0, 100);
  const current = range("currentSavings", input.currentSavings ?? 0, 0, Number.MAX_SAFE_INTEGER);
  const inflationRate = range("inflationRate", input.inflationRate ?? 0, -99, 100);
  const monthlySavings = monthlySpending * (reductionPercentage / 100);
  const annualSavings = monthlySavings * 12;
  const months = years * 12;
  const monthlyRate = annualReturn / 100 / 12;
  const futureCashValue = current + monthlySavings * months;
  const futureInvestmentValue = monthlyRate === 0
    ? futureCashValue
    : current * Math.pow(1 + monthlyRate, months) + monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  const inflationAdjustedValue = futureInvestmentValue / Math.pow(1 + inflationRate / 100, years);
  return { monthlySavings, annualSavings, futureCashValue, futureInvestmentValue, inflationAdjustedValue };
}

export function timeRecovered(minutesPerDay: number, reductionPercentage: number) {
  const safeMinutes = range("minutesPerDay", minutesPerDay, 0, 1440);
  const safeReduction = range("reductionPercentage", reductionPercentage, 0, 100);
  const dailyMinutes = safeMinutes * safeReduction / 100;
  return { dailyMinutes, weeklyHours: dailyMinutes * 7 / 60, annualHours: dailyMinutes * 365 / 60 };
}

export function monthsToGoal(target: number, current: number, monthlyContribution: number) {
  finiteNumber("target", target);
  finiteNumber("current", current);
  finiteNumber("monthlyContribution", monthlyContribution);
  if (target < 0) throw new RangeError("target must not be negative");
  if (current < 0) throw new RangeError("current must not be negative");
  if (monthlyContribution < 0) throw new RangeError("monthlyContribution must not be negative");
  if (current >= target) return 0;
  if (monthlyContribution <= 0) return Number.POSITIVE_INFINITY;
  return Math.ceil((target - current) / monthlyContribution);
}
