import json
from pyxlsb import open_workbook

xlsb_path = r'f:\PROJECT\rapotin\docs\RAPOR IKM KELAS 6 REV TERBARU (2025).xlsb'
output_json_path = r'f:\PROJECT\rapotin\prisma\dev-test-data.json'

def clean_str(val):
    if val is None:
        return ''
    if isinstance(val, float) and val.is_integer():
        return str(int(val)).strip()
    return str(val).strip()

def clean_num(val):
    if val is None or val == '' or val == '-':
        return None
    try:
        f = float(val)
        return round(f, 2)
    except (ValueError, TypeError):
        return None

def extract_all():
    print("Reading workbook...")
    with open_workbook(xlsb_path) as wb:
        # 1. School, Teacher, Classroom, ReportConfig
        school_info = {
            "name": "SDN Segaramakmur 01",
            "npsn": "20218120",
            "address": "JL. Marunda Makmur, Tarumajaya, Kab. Bekasi, Jawa Barat",
        }
        teacher_info = {
            "name": "YAYAH KUDSIYAH, S.Pd",
            "nip": "198310132008012005",
        }
        classroom_info = {
            "name": "Kelas VI",
            "academic_year": "2025/2026",
        }
        report_config = {
            "semester": "I",
            "report_date": "22 Desember 2025",
            "report_place": "Tarumajaya",
            "headmaster_name": "H. SUHANDA, S.Pd",
            "headmaster_nip": "19721202199603002",
        }

        # 2. Extract Students from 'Data Siswa'
        students = []
        with wb.get_sheet('Data Siswa') as sheet:
            rows = list(sheet.rows())
            # Student rows: row index 8 to 38 (31 students)
            for r in range(8, 39):
                row = rows[r]
                nis = clean_str(row[3].v)
                nisn = clean_str(row[4].v)
                full_name = clean_str(row[5].v)
                gender = clean_str(row[6].v)
                if not full_name:
                    continue
                students.append({
                    "no": int(row[2].v),
                    "nis": nis,
                    "nisn": nisn,
                    "full_name": full_name,
                    "gender": gender,
                })
        print(f"Extracted {len(students)} students.")

        # 3. Extract Attendance & Teacher Notes from 'Absen'
        attendance_and_notes = {}
        with wb.get_sheet('Absen') as sheet:
            rows = list(sheet.rows())
            for r in range(8, 39):
                row = rows[r]
                nis = clean_str(row[3].v)
                if not nis:
                    continue
                s_days = clean_num(row[31].v) or 0
                i_days = clean_num(row[32].v) or 0
                a_days = clean_num(row[33].v) or 0
                note = clean_str(row[35].v) if len(row) > 35 else ""
                # Remove extra quotes from note if present
                if note.startswith('"') and note.endswith('"'):
                    note = note[1:-1].strip()
                attendance_and_notes[nis] = {
                    "sickness_days": int(s_days),
                    "permission_days": int(i_days),
                    "unexcused_days": int(a_days),
                    "teacher_note": note,
                }
        print(f"Extracted attendance for {len(attendance_and_notes)} students.")

        # 4. Extract Extracurricular from 'Ekstrakurikuler'
        extracurriculars = {}
        with wb.get_sheet('Ekstrakurikuler') as sheet:
            rows = list(sheet.rows())
            for r in range(12, 43):
                row = rows[r]
                nis = clean_str(row[3].v)
                if not nis:
                    continue
                predikat = clean_str(row[7].v)
                deskripsi = clean_str(row[8].v)
                full_desc = f"{predikat}, {deskripsi}" if predikat and deskripsi else (predikat or deskripsi)
                extracurriculars[nis] = [{
                    "name": "Pramuka",
                    "score_description": full_desc,
                }]
        print(f"Extracted extracurricular for {len(extracurriculars)} students.")

        # 5. Extract Subjects & Scores from the 9 sheets
        subjects_spec = [
            ("Pendidikan Agama", "FOR & SUM AGM"),
            ("Pendidikan Pancasila", "FOR & SUM PKN"),
            ("Bahasa Indonesia", "FOR & SUM BI"),
            ("Matematika", "FOR & SUM MTK"),
            ("Ilmu Pengetahuan Alam dan Sosial", "FOR & SUM IPAS"),
            ("Seni Rupa", "FOR & SUM SENI RUPA"),
            ("PJOK", "FOR & SUM PJOK"),
            ("Bahasa Inggris", "FOR & SUM BING"),
            ("Bahasa Sunda", "FOR & SUM MULOK 1"),
        ]

        scores_by_subject = {}

        for sub_name, sheet_name in subjects_spec:
            print(f"Extracting scores for {sub_name} ({sheet_name})...")
            with wb.get_sheet(sheet_name) as sheet:
                rows = list(sheet.rows())
                r9 = [cell.v for cell in rows[9]]

                # Identify active TP columns (cols 3..22)
                active_tps = []
                for c in range(3, 23):
                    tp_code = clean_str(r9[c]) if c < len(r9) else f"TP {c-2}"
                    # Check if any student has score in this col
                    if any(clean_num(rows[r][c].v) is not None for r in range(11, 42) if c < len(rows[r])):
                        active_tps.append((c, tp_code))

                # Identify active LM columns (cols 25, 27, 29, 31, 33, 35, 37, 39, 41)
                active_lms = []
                for idx, c in enumerate([25, 27, 29, 31, 33, 35, 37, 39, 41]):
                    lm_code = clean_str(r9[c]) if c < len(r9) and r9[c] else f"LM {idx+1}"
                    if any(clean_num(rows[r][c].v) is not None for r in range(11, 42) if c < len(rows[r])):
                        active_lms.append((c, lm_code))

                student_scores = []
                for r in range(11, 42):
                    row = rows[r]
                    if len(row) < 3 or row[1].v is None:
                        continue
                    
                    try:
                        stud_no = int(row[1].v)
                    except (ValueError, TypeError):
                        continue

                    stud_idx = stud_no - 1
                    if stud_idx < 0 or stud_idx >= len(students):
                        continue

                    nis = students[stud_idx]["nis"]

                    # Assignments (Formatif)
                    asgs = []
                    for c, code in active_tps:
                        val = clean_num(row[c].v) if c < len(row) else None
                        if val is not None:
                            asgs.append({
                                "label": f"Tugas {code}",
                                "score": val,
                            })

                    # Daily Tests (Sumatif LM / UH)
                    uhs = []
                    for c, code in active_lms:
                        val = clean_num(row[c].v) if c < len(row) else None
                        if val is not None:
                            uhs.append({
                                "label": f"UH {code}",
                                "score": val,
                            })

                    # Midterm (STS) col 45
                    sts = clean_num(row[45].v) if len(row) > 45 else None

                    # Final (SAS) col 47
                    sas = clean_num(row[47].v) if len(row) > 47 else None

                    # Competency descriptions col 54 & 57
                    d_high = clean_str(row[54].v) if len(row) > 54 else ""
                    d_low = clean_str(row[57].v) if len(row) > 57 else ""

                    student_scores.append({
                        "nis": nis,
                        "assignments": asgs,
                        "daily_tests": uhs,
                        "midterm_score": sts,
                        "final_score": sas,
                        "highest_desc": d_high,
                        "lowest_desc": d_low,
                    })

                scores_by_subject[sub_name] = student_scores

        data = {
            "school": school_info,
            "teacher": teacher_info,
            "classroom": classroom_info,
            "report_config": report_config,
            "subjects": [s[0] for s in subjects_spec],
            "students": students,
            "attendance_and_notes": attendance_and_notes,
            "extracurriculars": extracurriculars,
            "scores_by_subject": scores_by_subject,
        }

        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"Data successfully extracted to {output_json_path}!")

if __name__ == '__main__':
    extract_all()
