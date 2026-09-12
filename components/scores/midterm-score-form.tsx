'use client';

import { DailyTestScoreForm, type DailyTestScore, type Student, type Subject } from './daily-test-score-form';

export function MidtermScoreForm(props: { students: Student[]; subjects: Subject[]; initialScores: DailyTestScore[] }) {
  return <DailyTestScoreForm {...props} midterm />;
}
