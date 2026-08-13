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

export function calculateProjection(input: ProjectionInput): ProjectionResult {
  const monthlySavings = input.monthlySpending * (input.reductionPercentage / 100);
  const annualSavings = monthlySavings * 12;
  const months = Math.max(0, input.years * 12);
  const monthlyRate = Math.max(0, input.annualReturn) / 100 / 12;
  const current = input.currentSavings ?? 0;
  const futureCashValue = current + monthlySavings * months;
  const futureInvestmentValue = monthlyRate === 0
    ? futureCashValue
    : current * Math.pow(1 + monthlyRate, months) + monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  const inflationAdjustedValue = futureInvestmentValue / Math.pow(1 + (input.inflationRate ?? 0) / 100, input.years);
  return { monthlySavings, annualSavings, futureCashValue, futureInvestmentValue, inflationAdjustedValue };
}

export function timeRecovered(minutesPerDay: number, reductionPercentage: number) {
  const dailyMinutes = minutesPerDay * reductionPercentage / 100;
  return { dailyMinutes, weeklyHours: dailyMinutes * 7 / 60, annualHours: dailyMinutes * 365 / 60 };
}

export function monthsToGoal(target: number, current: number, monthlyContribution: number) {
  if (current >= target) return 0;
  if (monthlyContribution <= 0) return Number.POSITIVE_INFINITY;
  return Math.ceil((target - current) / monthlyContribution);
}
