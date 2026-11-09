export interface DefaultObjectiveSubject {
  subjectNameAliases: string[];
  semester: 'I' | 'II';
  topics: string[];
  objectives: {
    code: string;
    description: string;
  }[];
}

export const GRADE_6_OBJECTIVES: DefaultObjectiveSubject[] = [
  {
    subjectNameAliases: ['Pendidikan Agama', 'PAI', 'Pendidikan Agama Islam', 'Pendidikan Agama dan Budi Pekerti', 'PABP'],
    semester: 'I',
    topics: [
      "Belajar Al-Qur'an dan Hadist",
      "Allah Swt Maha Segalanya",
      "Hidup Damai Dengan Saling Memaafkan",
      "Hukum Halal dan Haram",
      "Jasa Khulafaurrasyidin"
    ],
    objectives: [
      { code: 'TP 1', description: 'mengetahui bacaan surah ad-Duha dengan tartil' },
      { code: 'TP 2', description: 'melafalkan bacaan surah ad-Duha beserta terjemahannya dengan benar' },
      { code: 'TP 3', description: 'menyampaikan pesan pokok surah ad-Duha dengan percaya diri' },
      { code: 'TP 4', description: 'menerapkan pesan pokok surah ad-Duha dalam kehidupan sehari-hari' },
      { code: 'TP 5', description: 'memahami pengertian asmaulhusna al-Afuw dengan tepat' },
      { code: 'TP 6', description: 'mengetahui pengertian asmaulhusna al-Wahid dengan tepat' },
      { code: 'TP 7', description: 'memahami pengertian asmaulhusna as-Samad dengan tepat' },
      { code: 'TP 8', description: 'mengetahui cara Allah Swt mengampuni kesalahan manusia' },
      { code: 'TP 9', description: 'memahami perintah memaafkan sesuai dengan ajaran Islam' },
      { code: 'TP 10', description: 'memahami syarat dan adab menyatakan penyesalan' },
      { code: 'TP 11', description: 'menjelaskan adab memberi maaf sesuai dengan ajaran Islam' },
      { code: 'TP 12', description: 'menerapkan perilaku yang mencerminkan penyesalan dan memaafkan' },
      { code: 'TP 13', description: 'mengetahui definisi haram sesuai syariat Islam' },
      { code: 'TP 14', description: 'menguraikan dasar hukum halal serta haram sesuai Al-Qur\'an dan hadis' },
      { code: 'TP 15', description: 'mengetahui sebab-sebab halal dan haram dengan tepat' },
      { code: 'TP 16', description: 'mengetahui penerapan sikap halal dan haram dalam kehidupan sehari-hari' },
      { code: 'TP 17', description: 'menjelaskan contoh perilaku termasuk halal dan haram dalam kehidupan' },
      { code: 'TP 18', description: 'menguraikan penerapan halal dan haram dalam makanan yang dikonsumsi' }
    ]
  },
  {
    subjectNameAliases: ['Pendidikan Pancasila', 'PPKn', 'Pancasila', 'PPKN'],
    semester: 'I',
    topics: [
      'Belajar Pancasila yang menyenangkan',
      'Mengamalkan Pancasila Untuk Kebahagian Bersama',
      'Mengenal, Norma, Hak dan Kewajiban Dalam Kehidupan Berbangsa dan Bernegara',
      'Belajar Bermusyawarah'
    ],
    objectives: [
      { code: 'TP 1', description: 'menjelaskan keterkaitan sila-sila dalam Pancasila sebagai satu kesatuan yang utuh' },
      { code: 'TP 2', description: 'menguraikan makna Pancasila sebagai dasar negara, pandangan hidup, dan ideologi bangsa dan negara' },
      { code: 'TP 3', description: 'mengidentifikasi bentuk-bentuk norma, hak, dan kewajiban warga negara dan menunjukkan contoh-contohnya' },
      { code: 'TP 4', description: 'melaksanakan praktik musyawarah untuk membuat kesepakatan dan aturan bersama serta menerapkannya' }
    ]
  },
  {
    subjectNameAliases: ['Bahasa Indonesia', 'B. Indonesia', 'B.Indo', 'B Indo', 'BI'],
    semester: 'I',
    topics: [
      'Bangga Menjadi Anak Indonesia',
      'Musisi Indonesia di Pentas Dunia',
      'Taman Nasional dan Situs Warisan Dunia',
      'Jeda Untuk Iklim'
    ],
    objectives: [
      { code: 'TP 1', description: 'menyebutkan unsur intrinsik cerita' },
      { code: 'TP 2', description: 'mencari informasi dalam bacaan dengan memindai bacaan' },
      { code: 'TP 3', description: 'mengisi formulir dan menulis surat elektronik' },
      { code: 'TP 4', description: 'memahami informasi pokok dalam surat resmi' },
      { code: 'TP 5', description: 'memahami ide pokok dan ide pendukung dari suatu artikel' },
      { code: 'TP 6', description: 'membuat peta pikiran untuk mengorganisasikan ide-ide dan mampu mempresentasikannya di depan kelas' },
      { code: 'TP 7', description: 'memahami ide pokok dan ide pendukung dari suatu transkrip wawancara' },
      { code: 'TP 8', description: 'menulis kalimat efektif dalam menuliskan hasil wawancara' },
      { code: 'TP 9', description: 'memahami penggunaan gaya bahasa majas dalam cerita' },
      { code: 'TP 10', description: 'mengelompokkan informasi dari catatan perjalanan' },
      { code: 'TP 11', description: 'membedakan opini dan fakta' },
      { code: 'TP 12', description: 'memahami kalimat langsung dan tidak langsung' },
      { code: 'TP 13', description: 'menulis ringkasan teks eksplanasi ilmiah' },
      { code: 'TP 14', description: 'memahami istilah baru dari menyimak bacaan' },
      { code: 'TP 15', description: 'memahami sinonim dan antonim kata' }
    ]
  },
  {
    subjectNameAliases: ['Matematika', 'MTK', 'Math'],
    semester: 'I',
    topics: [
      'Pecahan dan Desimal',
      'Perbandingan'
    ],
    objectives: [
      { code: 'TP 1', description: 'memahami perkalian pecahan dengan bilangan asli dan menghitung hasil perkalian tersebut' },
      { code: 'TP 2', description: 'memahami pembagian pecahan dengan bilangan asli dan menghitung hasil pembagian tersebut' },
      { code: 'TP 3', description: 'mengubah pecahan menjadi desimal serta membandingkan dan mengurutkan bilangan desimal (satu angka di belakang koma)' },
      { code: 'TP 4', description: 'memahami konsep rasio dan menggunakan bahasa rasio untuk menjelaskan hubungan perbandingan antara dua besaran' },
      { code: 'TP 5', description: 'menentukan kesamaan rasio dengan menggunakan tabel rasio' },
      { code: 'TP 6', description: 'menentukan rasio satuan' },
      { code: 'TP 7', description: 'menentukan rasio bagian terhadap bagian dan rasio terhadap keseluruhan' }
    ]
  },
  {
    subjectNameAliases: ['Ilmu Pengetahuan Alam dan Sosial', 'IPAS', 'IPA', 'IPS'],
    semester: 'I',
    topics: [
      'Bagaimana Tubuh Kita Bergerak',
      'Cerita tentang Indonesia Kita',
      'Pelesir Keliling Dunia',
      'Indonesia dan Masyarakat Dunia'
    ],
    objectives: [
      { code: 'TP 1', description: 'mengidentifikasi organ tubuh yang termasuk sistem gerak' },
      { code: 'TP 2', description: 'menjelaskan cara tubuh melakukan gerak' },
      { code: 'TP 3', description: 'memahami sistem syaraf yang mengendalikan tubuh' },
      { code: 'TP 4', description: 'menjelaskan cara menjaga kesehatan sistem gerak dalam perilaku sehari-hari' },
      { code: 'TP 5', description: 'mengenal sejarah, baik tokoh maupun periodisasinya serta menghubungkan dengan konteks kehidupan sekarang' },
      { code: 'TP 6', description: 'menceritakan kembali perjuangan para pahlawan bangsa dalam melawan imperialisme dan mencapai kemerdekaan' },
      { code: 'TP 7', description: 'merefleksikan semangat para pahlawan dalam mengusir penjajah dari bumi Indonesia' },
      { code: 'TP 8', description: 'mengidentifikasi pembagian wilayah di enam benua dan ciri khas kondisi geografis di berbagai negara' },
      { code: 'TP 9', description: 'mengenali ciri khas di beberapa negara dan bentang alam populernya' },
      { code: 'TP 10', description: 'menganalisis negara-negara yang mampu memanfaatkan kondisi geografisnya' },
      { code: 'TP 11', description: 'mengidentifikasi potensi wilayah di sekitar tempat tinggal, dan Indonesia sebagai bagian dari dunia' },
      { code: 'TP 12', description: 'menjelaskan bentuk-bentuk interaksi antar negara di dunia sebagai dampak perkembangan globalisasi' },
      { code: 'TP 13', description: 'menganalisis Indonesia dalam kerja sama dunia untuk menghadapi tantangan global' },
      { code: 'TP 14', description: 'memahami perannya dalam menjaga kelestarian budaya Indonesia' }
    ]
  },
  {
    subjectNameAliases: ['Seni Rupa', 'Seni Budaya', 'SBdP', 'Seni'],
    semester: 'I',
    topics: [
      'Unsur dan Prinsip Seni rupa',
      'Menggambar Ritme Dalam Seni Rupa',
      'Membuat Karya Makrame',
      'Membuat Karya Anyaman'
    ],
    objectives: [
      { code: 'TP 1', description: 'mengidentifikasi unsur-unsur seni rupa di lingkungan sekitar' },
      { code: 'TP 2', description: 'menggambar objek di sekitar yang menggunakan prinsip ritme' },
      { code: 'TP 3', description: 'menjelaskan langkah-langkah menggambar objek' },
      { code: 'TP 4', description: 'mempraktikkan langkah menggambar objek' },
      { code: 'TP 5', description: 'menentukan unsur seni rupa yang ada di lingkungan sekitar' },
      { code: 'TP 6', description: 'menemukan dan mendeskripsikan objek di sekitar yang menggunakan prinsip ritme' },
      { code: 'TP 7', description: 'membuat pola gambar yang menunjukkan prinsip ritme' }
    ]
  },
  {
    subjectNameAliases: ['Pendidikan Jasmani dan Olahraga', 'PJOK', 'Penjas', 'Penjaskes'],
    semester: 'I',
    topics: [
      'Aktivitas Permainan Invasi (Bola Tangan)',
      'Aktivitas Permainan Net (Bola Voli)',
      'Modifikasi Pola Gerak dasar (Permainan Rounders)',
      'Variasi dan Kombinasi Pola Gerak dasar dalam pencak silat',
      'Aktivitas Gerak Dominan dalam senam'
    ],
    objectives: [
      { code: 'TP 1', description: 'menjelaskan modifikasi pola gerak dasar variasi melempar, menangkap, dan menggiring bola' },
      { code: 'TP 2', description: 'mempraktikkan modifikasi pola gerak dasar variasi melempar, menangkap, dan menggiring bola' },
      { code: 'TP 3', description: 'menjelaskan modifikasi pola gerak dasar variasi passing dan servis' },
      { code: 'TP 4', description: 'mempraktikkan modifikasi pola gerak dasar variasi passing dan servis' },
      { code: 'TP 5', description: 'menjelaskan modifikasi pola gerak dasar variasi melempar, menangkap, dan memukul bola' },
      { code: 'TP 6', description: 'mempraktikkan modifikasi pola gerak dasar variasi melempar, menangkap, dan memukul bola' },
      { code: 'TP 7', description: 'menjelaskan modifikasi pola gerak dasar pada bela diri pencak silat (kuda-kuda, pukulan, tangkisan)' },
      { code: 'TP 8', description: 'mempraktikkan modifikasi pola gerak dasar pada bela diri pencak silat' },
      { code: 'TP 9', description: 'menjelaskan gerakan berdiri dengan kedua tangan, guling lenting, dan meroda' },
      { code: 'TP 10', description: 'mempraktikkan gerakan berdiri dengan kedua tangan, guling lenting, dan meroda' }
    ]
  },
  {
    subjectNameAliases: ['Bahasa Inggris', 'Bahasa Inggris *', 'English', 'B.Inggris', 'B Inggris'],
    semester: 'I',
    topics: [
      'I studied last night, but my sister didn\'t',
      'We went to a museum last week',
      'I was In Bali last week',
      'How did Cici Feel yesterday',
      'What did you do yesterday'
    ],
    objectives: [
      { code: 'TP 1', description: 'mengidentifikasi dan mengucapkan kata kerja bantu bentuk lampau' },
      { code: 'TP 2', description: 'menggunakan kata keterangan waktu dalam kalimat bentuk lampau' },
      { code: 'TP 3', description: 'berbicara dengan menggunakan kata "was/were" pada kalimat bentuk lampau' },
      { code: 'TP 4', description: 'menggunakan kata "was/were" untuk mengungkapkan perasaan pada kalimat bentuk lampau' },
      { code: 'TP 5', description: 'menjawab dan membuat pertanyaan menggunakan 5W1H mengenai peristiwa di waktu lampau' }
    ]
  },
  {
    subjectNameAliases: ['Bahasa Sunda', 'B.Sunda', 'B Sunda', 'Mulok Bahasa Sunda'],
    semester: 'I',
    topics: [
      'Nyalamatkeun mahluk hirup',
      'Pupuh Durma',
      'Inohong Sunda'
    ],
    objectives: [
      { code: 'TP 1', description: 'memahami carita pondok, menyimpulkan dan menceritakan kembali isi carita pondok' },
      { code: 'TP 2', description: 'memahami biografi tokoh (inohong) dan menceritakan kembali riwayat hidup tokoh Sunda' },
      { code: 'TP 3', description: 'menerapkan awalan (rarangken hareup) "di-" dan "ka-" dalam kalimat' }
    ]
  }
];

export function findDefaultObjectivesForSubject(subjectName: string, semester: 'I' | 'II' = 'I') {
  const normalized = subjectName.trim().toLowerCase();
  const match = GRADE_6_OBJECTIVES.find((item) =>
    item.semester === semester &&
    item.subjectNameAliases.some((alias) => alias.toLowerCase() === normalized)
  );
  return match || null;
}

