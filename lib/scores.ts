export function summativeScore(dailyTest: number, midterm: number = 0, finalExam: number = 0) {
  return (dailyTest + midterm + finalExam) / 3;
}

export function overallScore(assignment: number, dailyTest: number, midterm: number = 0, finalExam: number = 0) {
  return (assignment + summativeScore(dailyTest, midterm, finalExam)) / 2;
}

export function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}
