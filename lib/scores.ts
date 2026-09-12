export function overallScore(assignment: number, dailyTest: number, midterm: number = 0) {
  return (assignment + dailyTest + midterm) / 3;
}

export function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}
