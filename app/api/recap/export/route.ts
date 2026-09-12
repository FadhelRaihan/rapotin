import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import ExcelJS from 'exceljs';
import { exportRanks } from '@/lib/export-ranking';
import { overallScore } from '@/lib/scores';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const classroomId = session.classroomId;
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('mode') || '1'; // '1' | '2' | '3' | '4'
  const semester = searchParams.get('semester') || 'I';
  const subjectId = searchParams.get('subjectId') || '';
  const scoreType = searchParams.get('scoreType') || 'ASSIGNMENT'; // 'ASSIGNMENT' | 'DAILY_TEST'
  const label = searchParams.get('label') || '';

  try {
    // 1. Fetch Classroom, Teacher, School details
    const classroom = await withDbRetry(() =>
      db.classroom.findUnique({
        where: { id: classroomId },
        include: { school: true, teacher: true },
      })
    );

    const schoolName = classroom?.school?.name || 'SD Negeri Segara Makmur 01';
    const teacherName = classroom?.teacher?.name || session.name || 'Guru Kelas';
    const classroomName = classroom?.name || 'Kelas VI';
    const academicYear = classroom?.academic_year || '2025/2026';

    // 2. Fetch Students and Subjects
    const students = await withDbRetry(() =>
      db.student.findMany({
        where: { classroom_id: classroomId },
        orderBy: { full_name: 'asc' },
      })
    );

    const subjects = await withDbRetry(() =>
      db.subject.findMany({
        where: { classroom_id: classroomId },
        orderBy: { name: 'asc' },
      })
    );

    // 3. Fetch Assignment & Daily Test Scores
    const assignmentScores = await withDbRetry(() =>
      db.assignmentScore.findMany({
        where: {
          student: { classroom_id: classroomId },
          semester,
        },
        orderBy: { recorded_at: 'asc' },
      })
    );

    const dailyTestScores = await withDbRetry(() =>
      db.dailyTestScore.findMany({
        where: {
          student: { classroom_id: classroomId },
          semester,
        },
        orderBy: { recorded_at: 'asc' },
      })
    );

    const midterms = await db.midtermScore.findMany({ where: { student: { classroom_id: classroomId }, semester } });
    const stsValue = (studentId: string, subjectId: string) => {
      const item = midterms.find(score => score.student_id === studentId && score.subject_id === subjectId);
      return item && !item.is_pending ? Number(item.score) : 0;
    };
    students.sort((a, b) => a.full_name.localeCompare(b.full_name, 'id', { sensitivity: 'base' }) || a.id.localeCompare(b.id));
    // Initialize Excel Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rapotin App';
    workbook.created = new Date();

    // Helper: Style Header Block & Freeze Panes
    const applyStandardHeaderAndFreeze = (
      worksheet: ExcelJS.Worksheet,
      titleText: string,
      subTitleText: string
    ) => {
      // Freeze header row (Rows 1-6 remain fixed during scroll)
      worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 6 }];

      // Row 1: School Name
      worksheet.mergeCells('A1:G1');
      const r1 = worksheet.getCell('A1');
      r1.value = schoolName.toUpperCase();
      r1.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF7C3AED' } };

      // Row 2: Report Title
      worksheet.mergeCells('A2:G2');
      const r2 = worksheet.getCell('A2');
      r2.value = titleText;
      r2.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF111827' } };

      // Row 3: Classroom & Teacher Info
      worksheet.mergeCells('A3:G3');
      const r3 = worksheet.getCell('A3');
      r3.value = `Kelas: ${classroomName} (${academicYear})  |  Wali Kelas: ${teacherName}  |  Semester: ${semester}`;
      r3.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF4B5563' } };

      // Row 4: Subtitle / Export Context
      worksheet.mergeCells('A4:G4');
      const r4 = worksheet.getCell('A4');
      r4.value = subTitleText;
      r4.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF6B7280' } };

      // Row 5: Empty Spacer
    };

    // Helper: Style Table Headers (Row 6)
    const styleTableHeader = (row: ExcelJS.Row) => {
      row.height = 24;
      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF7C3AED' }, // Rapotin Purple
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'medium', color: { argb: 'FF6D28D9' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    };

    // Helper: Style Data Rows with Alternating Colors
    const styleDataRow = (row: ExcelJS.Row, rowIndex: number) => {
      row.height = 20;
      const isEven = rowIndex % 2 === 0;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 9 };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
        // Alignment
        if (colNumber === 1 || colNumber === 2 || colNumber === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.numFmt = '0.0';
        }
      });
    };

    // ==========================================
    // MODE 1: EXPORT ALL SUBJECTS IN 1 SEMESTER
    // ==========================================
    if (mode === '5') {
      const ws = workbook.addWorksheet('Rekap STS');
      applyStandardHeaderAndFreeze(ws, 'NILAI STS', `Semester ${semester}`);
      ws.getRow(6).values = ['No', 'NIS / NISN', 'Nama Siswa', 'L/P', ...subjects.map(subject => subject.name), 'Rata-Rata STS', 'Ranking'];
      styleTableHeader(ws.getRow(6));
      const rows = students.map(student => {
        const values = subjects.map(subject => {
          const item = midterms.find(score => score.student_id === student.id && score.subject_id === subject.id);
          return item && !item.is_pending && item.score !== null ? Number(item.score) : null;
        });
        const filled = values.filter((value): value is number => value !== null);
        const mean = filled.length ? filled.reduce((sum, value) => sum + value, 0) / filled.length : null;
        return { student, values, mean };
      });
      const ranks = exportRanks(rows.map(row => row.mean));
      rows.forEach((item, index) => {
        const row = ws.addRow([index + 1, item.student.nisn || item.student.nis, item.student.full_name, item.student.gender || '-', ...item.values.map(value => value ?? '-'), item.mean ?? '-', ranks[index] ?? '-']);
        styleDataRow(row, index);
        row.getCell(subjects.length + 6).numFmt = '0';
      });
      ws.columns = [{ width: 8 }, { width: 18 }, { width: 30 }, { width: 10 }, ...subjects.map(() => ({ width: 18 })), { width: 18 }, { width: 12 }];
    }
    else if (mode === '1') {
      subjects.forEach((subject) => {
        const sheetName = subject.name.replace(/[*?:/\\\[\]]/g, '').substring(0, 30);
        const ws = workbook.addWorksheet(sheetName);

        applyStandardHeaderAndFreeze(
          ws,
          `REKAPITULASI NILAI MATA PELAJARAN ${subject.name.toUpperCase()}`,
          `Rekap Nilai Tugas, Ulangan Harian & Rata-Rata Akhir Semester ${semester}`
        );

        // Subject Specific Scores
        const subjectAsgs = assignmentScores.filter((a) => a.subject_id === subject.id);
        const subjectUhs = dailyTestScores.filter((d) => d.subject_id === subject.id);

        const uniqueAsgLabels = Array.from(new Set(subjectAsgs.map((a) => a.label)));
        const uniqueUhLabels = Array.from(new Set(subjectUhs.map((d) => d.label)));

        // Column Headers (Row 6)
        const headerValues = [
          'Rank',
          'NIS / NISN',
          'Nama Siswa',
          'L/P',
          ...uniqueAsgLabels.map((_, i) => `T${i + 1}`),
          'Rerata Tugas',
          ...uniqueUhLabels.map((_, i) => `UH${i + 1}`),
          'Rerata UH',
          'STS', 'Overall',
        ];

        ws.getRow(6).values = headerValues;
        styleTableHeader(ws.getRow(6));

        // Calculate Student Data & Auto-Sort by Average Highest First
        const studentRows = students.map((student) => {
          const asgScores = uniqueAsgLabels.map((lbl) => {
            const found = subjectAsgs.find((a) => a.student_id === student.id && a.label === lbl);
            return found ? Number(found.score) : null;
          });

          const uhScores = uniqueUhLabels.map((lbl) => {
            const found = subjectUhs.find((d) => d.student_id === student.id && d.label === lbl);
            return found ? Number(found.score) : null;
          });

          const validAsgs = subjectAsgs.filter(item => item.student_id === student.id).map(item => Number(item.score));
          const validUhs = subjectUhs.filter(item => item.student_id === student.id).map(item => Number(item.score));

          const asgAvg =
            validAsgs.length > 0
              ? validAsgs.reduce((a, b) => a + b, 0) / validAsgs.length
              : 0;

          const uhAvg =
            validUhs.length > 0
              ? validUhs.reduce((a, b) => a + b, 0) / validUhs.length
              : 0;

          const overallAvg = overallScore(asgAvg, uhAvg, stsValue(student.id, subject.id));

          return {
            student,
            asgScores,
            asgAvg: Math.round(asgAvg * 10) / 10,
            uhScores,
            uhAvg: Math.round(uhAvg * 10) / 10,
            overallAvg,
          };
        });

        const ranks = exportRanks(studentRows.map(item => item.overallAvg));

        // Add rows to Worksheet
        studentRows.forEach((item, index) => {
          const rowValues = [
            ranks[index],
            item.student.nisn || item.student.nis,
            item.student.full_name,
            item.student.gender || '-',
            ...item.asgScores.map((v) => (v !== null ? v : '-')),
            item.asgAvg,
            ...item.uhScores.map((v) => (v !== null ? v : '-')),
            item.uhAvg,
            stsValue(item.student.id, subject.id), Math.round(item.overallAvg * 10) / 10,
          ];

          const row = ws.addRow(rowValues);
          styleDataRow(row, index);
        });

        // Set column widths
        ws.columns = [
          { width: 8 },
          { width: 14 },
          { width: 28 },
          { width: 8 },
          ...uniqueAsgLabels.map(() => ({ width: 10 })),
          { width: 14 },
          ...uniqueUhLabels.map(() => ({ width: 10 })),
          { width: 14 }, { width: 14 },
          { width: 14 },
        ];
      });
    }

    // ==========================================
    // MODE 2: EXPORT SPECIFIC SUBJECT & SEMESTER
    // ==========================================
    else if (mode === '2') {
      const subject = subjects.find((s) => s.id === subjectId) || subjects[0];
      const sheetName = subject.name.replace(/[*?:/\\\[\]]/g, '').substring(0, 30);
      const ws = workbook.addWorksheet(sheetName);

      applyStandardHeaderAndFreeze(
        ws,
        `REKAPITULASI NILAI MATA PELAJARAN ${subject.name.toUpperCase()}`,
        `Semester ${semester}  |  Detail Nilai Tugas & Ulangan Harian`
      );

      const subjectAsgs = assignmentScores.filter((a) => a.subject_id === subject.id);
      const subjectUhs = dailyTestScores.filter((d) => d.subject_id === subject.id);

      const uniqueAsgLabels = Array.from(new Set(subjectAsgs.map((a) => a.label)));
      const uniqueUhLabels = Array.from(new Set(subjectUhs.map((d) => d.label)));

      const headerValues = [
        'Rank',
        'NIS / NISN',
        'Nama Siswa',
        'L/P',
        ...uniqueAsgLabels.map((_, i) => `T${i + 1}`),
        'Rerata Tugas',
        ...uniqueUhLabels.map((_, i) => `UH${i + 1}`),
        'Rerata UH',
        'STS', 'Overall',
      ];

      ws.getRow(6).values = headerValues;
      styleTableHeader(ws.getRow(6));

      const studentRows = students.map((student) => {
        const asgScores = uniqueAsgLabels.map((lbl) => {
          const found = subjectAsgs.find((a) => a.student_id === student.id && a.label === lbl);
          return found ? Number(found.score) : null;
        });

        const uhScores = uniqueUhLabels.map((lbl) => {
          const found = subjectUhs.find((d) => d.student_id === student.id && d.label === lbl);
          return found ? Number(found.score) : null;
        });

        const validAsgs = subjectAsgs.filter(item => item.student_id === student.id).map(item => Number(item.score));
        const validUhs = subjectUhs.filter(item => item.student_id === student.id).map(item => Number(item.score));

        const asgAvg =
          validAsgs.length > 0 ? validAsgs.reduce((a, b) => a + b, 0) / validAsgs.length : 0;
        const uhAvg =
          validUhs.length > 0 ? validUhs.reduce((a, b) => a + b, 0) / validUhs.length : 0;

        return {
          student,
          asgScores,
          asgAvg: Math.round(asgAvg * 10) / 10,
          uhScores,
          uhAvg: Math.round(uhAvg * 10) / 10,
          overallAvg: overallScore(asgAvg, uhAvg, stsValue(student.id, subject.id)),
        };
      });

      const ranks = exportRanks(studentRows.map(item => item.overallAvg));

      studentRows.forEach((item, index) => {
        const rowValues = [
          ranks[index],
          item.student.nisn || item.student.nis,
          item.student.full_name,
          item.student.gender || '-',
          ...item.asgScores.map((v) => (v !== null ? v : '-')),
          item.asgAvg,
          ...item.uhScores.map((v) => (v !== null ? v : '-')),
          item.uhAvg,
          stsValue(item.student.id, subject.id), Math.round(item.overallAvg * 10) / 10,
        ];

        const row = ws.addRow(rowValues);
        styleDataRow(row, index);
      });

      ws.columns = [
        { width: 8 },
        { width: 14 },
        { width: 28 },
        { width: 8 },
        ...uniqueAsgLabels.map(() => ({ width: 10 })),
        { width: 14 },
        ...uniqueUhLabels.map(() => ({ width: 10 })),
        { width: 14 }, { width: 14 },
        { width: 14 },
      ];
    }

    // =========================================================================
    // MODE 3: EXPORT BY SUBJECT & SCORE TYPE -> MULTIPLE SHEETS PER TASK/UH
    // =========================================================================
    else if ((mode === '3' || mode === '4') && scoreType === 'MIDTERM') {
      const subject = subjects.find(item => item.id === subjectId);
      if (!subject) return NextResponse.json({ error: 'Pilih mata pelajaran STS' }, { status: 400 });
      const ws = workbook.addWorksheet('STS');
      applyStandardHeaderAndFreeze(ws, `REKAP NILAI STS ${subject.name}`, `Semester ${semester}`);
      ws.getRow(6).values = ['No', 'NIS / NISN', 'Nama Siswa', 'L/P', 'STS', 'Status', 'Tanggal'];
      styleTableHeader(ws.getRow(6));
      students.forEach((student, index) => {
        const item = midterms.find(score => score.student_id === student.id && score.subject_id === subject.id);
        const row = ws.addRow([index + 1, student.nisn || student.nis, student.full_name, student.gender || '-', item && !item.is_pending ? Number(item.score) : '-', !item ? 'Kosong' : item.is_pending ? 'Susulan' : 'Terisi', item?.recorded_at.toISOString().slice(0, 10) ?? '-']);
        styleDataRow(row, index);
      });
      ws.columns.forEach(column => { column.width = 18; });
    }
    else if (mode === '3') {
      const subject = subjects.find((s) => s.id === subjectId) || subjects[0];
      const isAssignment = scoreType === 'ASSIGNMENT';

      const targetScores = isAssignment
        ? assignmentScores.filter((a) => a.subject_id === subject.id)
        : dailyTestScores.filter((d) => d.subject_id === subject.id);

      const uniqueLabels = Array.from(new Set(targetScores.map((s) => s.label)));

      if (uniqueLabels.length === 0) {
        uniqueLabels.push(isAssignment ? 'Tugas 1' : 'UH 1');
      }

      uniqueLabels.forEach((taskLabel, idx) => {
        const sheetName = `${isAssignment ? 'T' : 'UH'}${idx + 1} - ${taskLabel}`
          .replace(/[*?:/\\\[\]]/g, '')
          .substring(0, 30);

        const ws = workbook.addWorksheet(sheetName);

        applyStandardHeaderAndFreeze(
          ws,
          `REKAPITULASI ${isAssignment ? 'NILAI TUGAS' : 'ULANGAN HARIAN'} ${subject.name.toUpperCase()}`,
          `Judul ${isAssignment ? 'Tugas' : 'UH'}: ${taskLabel}  |  Semester ${semester}`
        );

        ws.getRow(6).values = [
          'Rank',
          'NIS / NISN',
          'Nama Siswa',
          'L/P',
          'Nilai Akhir (0-100)',
          'Status',
        ];
        styleTableHeader(ws.getRow(6));

        const studentRows = students.map((student) => {
          const found = targetScores.find(
            (s) => s.student_id === student.id && s.label === taskLabel
          );
          const score = found ? Number(found.score) : 0;
          return { student, score, isRecorded: !!found };
        });

        const ranks = exportRanks(studentRows.map(item => item.score));

        studentRows.forEach((item, index) => {
          const rowValues = [
            ranks[index],
            item.student.nisn || item.student.nis,
            item.student.full_name,
            item.student.gender || '-',
            item.isRecorded ? item.score : '-',
            item.isRecorded ? 'Terisi' : 'Kosong',
          ];

          const row = ws.addRow(rowValues);
          styleDataRow(row, index);
        });

        ws.columns = [
          { width: 8 },
          { width: 14 },
          { width: 28 },
          { width: 8 },
          { width: 18 },
          { width: 14 },
        ];
      });
    }

    // =========================================================================
    // MODE 4: EXPORT SPECIFIC SUBJECT, SCORE TYPE & SPECIFIC TASK/UH LABEL
    // =========================================================================
    else if (mode === '4') {
      const subject = subjects.find((s) => s.id === subjectId) || subjects[0];
      const isAssignment = scoreType === 'ASSIGNMENT';
      const targetLabel = label || (isAssignment ? 'Tugas 1' : 'UH 1');

      const sheetName = targetLabel.replace(/[*?:/\\\[\]]/g, '').substring(0, 30);
      const ws = workbook.addWorksheet(sheetName);

      applyStandardHeaderAndFreeze(
        ws,
        `LAPORAN NILAI ${isAssignment ? 'TUGAS' : 'ULANGAN HARIAN'} ${subject.name.toUpperCase()}`,
        `Judul: ${targetLabel}  |  Semester ${semester}`
      );

      ws.getRow(6).values = [
        'Rank',
        'NIS / NISN',
        'Nama Siswa',
        'L/P',
        'Nilai (0-100)',
        'Status',
      ];
      styleTableHeader(ws.getRow(6));

      const targetScores = isAssignment
        ? assignmentScores.filter((a) => a.subject_id === subject.id && a.label === targetLabel)
        : dailyTestScores.filter((d) => d.subject_id === subject.id && d.label === targetLabel);

      const studentRows = students.map((student) => {
        const found = targetScores.find((s) => s.student_id === student.id);
        const score = found ? Number(found.score) : 0;
        return { student, score, isRecorded: !!found };
      });

      const ranks = exportRanks(studentRows.map(item => item.score));

      studentRows.forEach((item, index) => {
        const rowValues = [
          ranks[index],
          item.student.nisn || item.student.nis,
          item.student.full_name,
          item.student.gender || '-',
          item.isRecorded ? item.score : '-',
          item.isRecorded ? 'Terisi' : 'Kosong',
        ];

        const row = ws.addRow(rowValues);
        styleDataRow(row, index);
      });

      ws.columns = [
        { width: 8 },
        { width: 14 },
        { width: 28 },
        { width: 8 },
        { width: 18 },
        { width: 14 },
      ];
    }

    // Generate Excel Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `Rekap_Nilai_Rapotin_Sem${semester}_Mode${mode}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghasilkan file Excel export.' },
      { status: 500 }
    );
  }
}
