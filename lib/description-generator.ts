export interface ObjectiveScoreItem {
  code: string;
  description: string;
  score: number;
}

export interface GeneratedDescription {
  highestDesc: string;
  lowestDesc: string;
  fullDesc: string;
}

function cleanObjectiveText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.endsWith('.')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

/**
 * Merumuskan narasi Capaian Kompetensi Kurikulum Merdeka
 * berdasarkan kompetensi tertinggi (MAX) dan kompetensi terendah (MIN).
 */
export function generateCompetencyDescription(
  studentName: string,
  objectivesWithScores: ObjectiveScoreItem[],
  overallAverage: number = 0
): GeneratedDescription {
  const firstName = studentName.trim();

  // Jika belum ada data TP yang dinilai atau data TP di DB kosong
  if (objectivesWithScores.length === 0) {
    return {
      highestDesc: '',
      lowestDesc: '',
      fullDesc: '',
    };
  }

  // Urutkan nilai dari tertinggi ke terendah
  const sorted = [...objectivesWithScores].sort((a, b) => b.score - a.score);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  const highestText = cleanObjectiveText(highest.description);
  const lowestText = cleanObjectiveText(lowest.description);

  let highestDesc = `Ananda ${firstName} menunjukkan penguasaan dalam ${highestText}.`;

  let lowestDesc = '';
  // Jika TP terendah berbeda dengan TP tertinggi
  if (highest.code !== lowest.code) {
    if (lowest.score < 75) {
      lowestDesc = `Ananda ${firstName} membutuhkan bimbingan dan penguatan dalam ${lowestText}.`;
    } else if (lowest.score < 85) {
      lowestDesc = `Ananda ${firstName} membutuhkan penguatan dalam ${lowestText}.`;
    } else {
      lowestDesc = `Serta menunjukkan konsistensi capaian pembelajaran yang sangat baik pada seluruh kompetensi.`;
    }
  } else {
    lowestDesc = `Serta menunjukkan ketuntasan belajar yang optimal.`;
  }

  const fullDesc = lowestDesc ? `${highestDesc}\n\n${lowestDesc}` : highestDesc;

  return {
    highestDesc,
    lowestDesc,
    fullDesc,
  };
}

