import { Question, InfographicItem } from './types';

export const INFOGRAPHICS: Record<string, InfographicItem[]> = {
  definisi: [
    {
      id: 'mat-definisi',
      title: 'Definisi & Komposisi Normal',
      iconName: 'BookOpen',
      summary: 'Masuknya zat asing ke atmosfer yang menurunkan mutu udara, serta pemahaman komposisi ideal udara bersih.',
      content: [
        'Definisi Pencemaran Udara: Masuk atau dimasukkannya zat, energi, dan/atau komponen lain ke dalam udara ambien oleh kegiatan manusia, sehingga mutu udara turun sampai ke tingkat tertentu yang menyebabkan udara ambien tidak dapat memenuhi fungsinya.',
        'Keseimbangan Atmosfer Bersih: Udara bersih yang ideal sangat penting untuk kelangsungan seluruh makhluk hidup dan kestabilan ekosistem bumi.',
        'Komposisi Gas Udara Normal: Kondisi ideal udara bersih terdiri dari sekitar 78% Nitrogen (N₂), 21% Oksigen (O₂), 0,93% Argon (Ar), 0,03% Karbondioksida (CO₂), serta uap air dalam jumlah bervariasi.'
      ],
      stats: [
        { label: 'Nitrogen Udara', value: '78%', color: 'from-blue-500 to-indigo-600' },
        { label: 'Oksigen Bersih', value: '21%', color: 'from-teal-400 to-emerald-500' }
      ],
      solutions: [
        'Memahami parameter alami komposisi udara sebagai pembanding utama tingkat pencemaran.',
        'Menjaga keseimbangan kadar oksigen di sekitar pemukiman dengan menanam tanaman rimbun.',
        'Menghindari pembuangan asap atau pembakaran yang merusak komposisi gas bersih.'
      ],
      source: 'Kementerian Lingkungan Hidup dan Kehutanan (KLHK)'
    }
  ],
  pengelompokan: [
    {
      id: 'mat-pengelompokan',
      title: 'Pengelompokan Polutan Udara',
      iconName: 'Layers',
      summary: 'Dua kategori utama zat pencemar udara berdasarkan mekanisme pembentukannya di atmosfer.',
      content: [
        'Polutan Primer: Zat pencemar yang ditimbulkan secara langsung dari sumber pencemaran itu sendiri. Contoh polutan primer meliputi Karbon Monoksida (CO), Sulfur Dioksida (SO₂), Nitrogen Oksida (NOₓ), dan Karbon Dioksida (CO₂) hasil dari pembakaran knalpot kendaraan bermotor.',
        'Polutan Sekunder: Zat pencemar yang terbentuk melalui reaksi-reaksi kimia antara polutan primer di atmosfer. Contoh polutan sekunder meliputi Ozon permukaan (O₃) dan Smog (asap kabut fotokimia) yang terbentuk karena reaksi polutan dengan paparan sinar matahari.',
        'Perbedaan Dampak: Polutan sekunder sering kali menyebar lebih luas dan memiliki sifat racun akumulatif yang lebih merusak kesehatan daripada polutan primer.'
      ],
      stats: [
        { label: 'Polutan Primer', value: 'CO, SO₂, NOₓ', color: 'from-amber-500 to-orange-600' },
        { label: 'Polutan Sekunder', value: 'O₃ & Smog', color: 'from-purple-500 to-rose-600' }
      ],
      solutions: [
        'Membatasi pelepasan polutan primer agar reaksi pembentukan polutan sekunder dapat dicegah.',
        'Menggunakan konverter katalitik kendaraan untuk mereduksi keluaran gas CO dan NOₓ.',
        'Mengurangi aktivitas luar ruangan saat intensitas cahaya matahari terik berinteraksi dengan smog.'
      ],
      source: 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)'
    }
  ],
  sumber: [
    {
      id: 'mat-sumber',
      title: 'Sumber-Sumber Pencemaran',
      iconName: 'Factory',
      summary: 'Asal usul polutan dari siklus alamiah bumi maupun dampak emisi harian aktivitas manusia.',
      content: [
        'Faktor Alam (Internal): Aktivitas alamiah bumi yang berada di luar kendali langsung manusia. Contoh faktor alam meliputi letusan gunung berapi (yang memuntahkan abu vulkanik pekat dan gas sulfur), kebakaran hutan alami akibat kekeringan, serta pelepasan gas metana dari proses pembusukan kotoran hewan secara alami.',
        'Faktor Manusia (Antropogenik/Eksternal): Hasil sampingan dari aktivitas harian, mobilitas, pertanian, dan industrialisasi manusia. Contoh faktor manusia meliputi asap kendaraan bermotor, asap cerobong industri, pembakaran sampah secara terbuka, aktivitas pertanian (pestisida dan pupuk kimia), serta pemakaian zat CFC (Chlorofluorocarbon) pada AC generasi lama atau kulkas bocor.',
        'Urgensi Kota: Aktivitas antropogenik manusia bertanggung jawab atas hampir seluruh krisis udara di perkotaan saat ini.'
      ],
      stats: [
        { label: 'Emisi Manusia', value: '80%+ Kota', color: 'from-red-500 to-rose-700' },
        { label: 'Zat Perusak AC', value: 'Gas CFC', color: 'from-cyan-500 to-blue-600' }
      ],
      solutions: [
        'Menghentikan kebiasaan membakar sampah rumah tangga secara sembarangan di pemukiman.',
        'Melakukan perawatan berkala pada mesin kendaraan dan beralih ke AC ramah lingkungan.',
        'Mengolah kotoran hewan ternak menjadi biogas ramah lingkungan.'
      ],
      source: 'Lembaga Ilmu Pengetahuan Indonesia (LIPI)'
    }
  ],
  dampak: [
    {
      id: 'mat-dampak',
      title: 'Dampak Pencemaran Udara',
      iconName: 'Heart',
      summary: 'Kerusakan komprehensif terhadap kesehatan tubuh manusia, keseimbangan ekosistem bumi, dan kelangsungan tumbuhan.',
      content: [
        'A. Dampak bagi Kesehatan Manusia: Menyebabkan gangguan saluran pernapasan parah seperti ISPA, asma, dan bronkitis kronis. Penurunan fungsi paru-paru dapat memicu kanker paru-paru. Selain itu, gas Karbon Monoksida (CO) sangat berbahaya karena mengikat hemoglobin dalam sel darah merah 200x lebih kuat daripada oksigen, memicu pusing, pingsan, hingga kematian akibat asfiksia.',
        'B. Dampak bagi Lingkungan & Ekosistem: Menimbulkan Hujan Asam akibat gas SO₂ dan NOₓ bereaksi dengan air hujan menjadi asam kuat (merusak tanah, membunuh biota air, mengorosi gedung); memicu Efek Rumah Kaca & Pemanasan Global karena gas CO₂ dan metana memerangkap panas matahari; serta Penipisan Lapisan Ozon pelindung oleh gas CFC di stratosfer sehingga radiasi ultraviolet (UV-B) merusak bumi.',
        'C. Dampak bagi Tumbuhan: Mengganggu jalannya proses fotosintesis penting karena permukaan stomata daun tersumbat oleh lapisan jelaga hitam dan debu polutan, serta memicu penyakit Klorosis (kerusakan klorofil) yang membuat daun menguning dan mati layu.'
      ],
      stats: [
        { label: 'Dampak Selular', value: 'CO Ikat Hb', color: 'from-red-600 to-rose-700' },
        { label: 'Kerusakan Daun', value: 'Klorosis', color: 'from-yellow-500 to-amber-600' }
      ],
      solutions: [
        'Mengenakan masker penyaring udara yang memadai saat bepergian keluar rumah.',
        'Menyiram dedaunan tanaman hias secara rutin untuk membersihkan sumbatan jelaga debu.',
        'Mengurangi penggunaan energi fosil guna menekan emisi gas hujan asam.'
      ],
      source: 'Organisasi Kesehatan Dunia (WHO)'
    }
  ],
  indikator: [
    {
      id: 'mat-indikator',
      title: 'Parameter & Indikator Kualitas',
      iconName: 'Activity',
      summary: 'Cara mendeteksi polusi menggunakan panca indera, sensor kimia ISPU/AQI, serta tanaman bioindikator alami.',
      content: [
        'Indikator Fisik: Deteksi dini polusi udara menggunakan panca indera manusia, seperti timbulnya bau menyengat atau tidak sedap, perubahan warna udara langit menjadi kelabu/kecokelatan, kepekatan asap cerobong, serta kenaikan suhu udara lingkungan sekitar.',
        'Indikator Kimia: Pengukuran ilmiah menggunakan alat sensor gas untuk menentukan angka ISPU (Indeks Standar Pencemar Udara) atau AQI (Air Quality Index) dengan melacak gas beracun (CO, SO₂, NO₂) serta konsentrasi debu halus PM2.5 dan PM10.',
        'Indikator Biologi (Bioindikator): Memanfaatkan kepekaan makhluk hidup sensitif terhadap polusi untuk mendeteksi mutu udara. Contoh terpopuler adalah Liken (Lumut Kerak); jika di suatu batang pohon perkotaan tidak ditemukan Liken yang tumbuh, hal tersebut menandakan kadar Sulfur Dioksida (SO₂) di udara daerah tersebut sudah sangat tinggi.'
      ],
      stats: [
        { label: 'Bioindikator', value: 'Liken / Lumut', color: 'from-emerald-500 to-green-600' },
        { label: 'Rentang Deteksi', value: 'ISPU / AQI', color: 'from-blue-500 to-cyan-500' }
      ],
      solutions: [
        'Memperhatikan keberadaan Lumut Kerak (Liken) di pepohonan sekitar rumah Anda.',
        'Memantau skor kualitas udara harian melalui aplikasi berbasis AQI sebelum beraktivitas.',
        'Mendukung pemasangan stasiun pemantau kualitas udara kimiawi di area perkotaan.'
      ],
      source: 'Pusat Studi Lingkungan Hidup (PSLH)'
    }
  ],
  solusi: [
    {
      id: 'mat-solusi',
      title: 'Upaya Penanggulangan & Solusi',
      iconName: 'Shield',
      summary: 'Rangkaian aksi nyata menyelamatkan udara melalui aksi preventif pencegahan, tindakan kuratif, dan kepatuhan regulasi.',
      content: [
        'Tindakan Preventif (Pencegahan): Tindakan sebelum polusi terjadi dengan beralih menggunakan moda transportasi umum massal, berjalan kaki, menggunakan sepeda, mengadopsi kendaraan listrik (EV), beralih ke sumber energi terbarukan (surya, angin, mikrohidro), serta gencar menanam pohon pelestari lingkungan (reboisasi/jalur hijau) sebagai penyerap gas karbon dioksida alami.',
        'Tindakan Kuratif (Pengolahan): Langkah penanganan polusi pasca-produksi seperti mewajibkan pemasangan alat filter atau alat scrubber (penyaring gas) pada cerobong asap industri/pabrik guna menetralkan gas beracun sebelum dilepas, serta menjalankan uji emisi kendaraan bermotor secara berkala.',
        'Regulasi & Hukum: Penyusunan dan penegakan undang-undang lingkungan oleh pemerintah berupa sanksi administratif dan denda pidana yang tegas bagi pelaku industri yang melanggar ambang batas emisi maksimal.'
      ],
      stats: [
        { label: 'Pencegahan', value: 'EBT & Reboisasi', color: 'from-emerald-500 to-teal-600' },
        { label: 'Penanganan', value: 'Filter Scrubber', color: 'from-blue-500 to-indigo-600' }
      ],
      solutions: [
        'Beralih ke kendaraan umum atau kendaraan ramah lingkungan sesering mungkin.',
        'Memasang alat filter polusi sederhana di ruang sirkulasi udara rumah.',
        'Mengkampanyekan pentingnya kepatuhan regulasi ambang batas emisi di lingkungan industri.'
      ],
      source: 'Dinas Lingkungan Hidup (DLH)'
    }
  ]
};

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Zat pencemar udara yang sangat kecil (berukuran 2.5 mikrometer) sehingga dapat menembus saluran pernapasan dan langsung masuk ke pembuluh darah disebut...',
    options: [
      'Sulfur Dioksida (SO2)',
      'Partikulat PM2.5',
      'Karbon Monoksida (CO)',
      'Gas Nitrogen Dioksida (NO2)'
    ],
    correctAnswer: 1,
    explanation: 'PM2.5 adalah partikel udara yang berukuran kurang dari 2.5 mikron. Karena ukurannya yang super kecil, PM2.5 sangat berbahaya karena dapat melewati filter alami hidung manusia.'
  },
  {
    id: 2,
    text: 'Mengapa gas Karbon Monoksida (CO) sangat berbahaya bagi tubuh manusia?',
    options: [
      'Sebab gas CO berbau sangat menyengat dan merusak kornea mata',
      'Sebab gas CO dapat menghancurkan lapisan kulit secara langsung',
      'Sebab gas CO mengikat hemoglobin darah lebih kuat daripada oksigen, membuat tubuh kekurangan oksigen',
      'Sebab gas CO memicu pembentukan awan hujan asam dalam hitungan detik'
    ],
    correctAnswer: 2,
    explanation: 'Gas CO tidak berwarna dan tidak berbau. Namun, ia mengikat hemoglobin darah 200 kali lebih kuat dibandingkan oksigen, sehingga menghambat distribusi oksigen di dalam tubuh.'
  },
  {
    id: 3,
    text: 'Hujan asam terjadi akibat bereaksinya air hujan di atmosfer dengan gas pencemar...',
    options: [
      'Sulfur Dioksida (SO2) dan Nitrogen Oksida (NOx)',
      'Oksigen (O2) dan Hidrogen (H2)',
      'Karbon Dioksida (CO2) dan Metana (CH4)',
      'CFC (Klorofluorokarbon) dan Argon'
    ],
    correctAnswer: 0,
    explanation: 'Sulfur Dioksida (SO2) dari PLTU/pabrik dan Nitrogen Oksida (NOx) dari knalpot bereaksi dengan uap air membentuk asam sulfat & asam nitrat yang memicu hujan asam (pH < 5.6).'
  },
  {
    id: 4,
    text: 'Sektor manakah yang menjadi penyumbang terbesar (70-80%) terhadap pencemaran udara di kawasan perkotaan?',
    options: [
      'Sektor Pertanian & Peternakan',
      'Sektor Transportasi (Kendaraan Bermotor)',
      'Sektor Pembangunan Gedung',
      'Sektor Rumah Tangga & Masak'
    ],
    correctAnswer: 1,
    explanation: 'Di daerah perkotaan padat, emisi dari pembakaran bahan bakar fosil oleh kendaraan bermotor menjadi kontributor polusi udara terbesar.'
  },
  {
    id: 5,
    text: 'Penyakit apa yang sering melanda anak-anak dan warga kota akibat paparan asap dan debu polutan secara terus menerus?',
    options: [
      'Osteoporosis',
      'Diabetes Melitus',
      'ISPA (Infeksi Saluran Pernapasan Akut)',
      'Gastritis (Maag)'
    ],
    correctAnswer: 2,
    explanation: 'ISPA adalah infeksi akut yang menyerang saluran pernapasan, dipicu oleh iritasi akibat partikel polutan yang merusak pertahanan paru.'
  },
  {
    id: 6,
    text: 'Jenis pohon apakah yang dikenal sangat baik dan efektif ditanam di perkotaan karena kapasitas penyerapan karbon dioksida (CO2) yang sangat tinggi?',
    options: [
      'Pohon Kelapa',
      'Pohon Trembesi',
      'Tanaman Kaktus',
      'Pohon Pinang'
    ],
    correctAnswer: 1,
    explanation: 'Pohon Trembesi memiliki tajuk yang sangat rindang dan memiliki kemampuan menyerap CO2 tertinggi dibanding pohon lainnya, yaitu mencapai 28,5 ton/tahun.'
  },
  {
    id: 7,
    text: 'Manakah tindakan di rumah yang PALING efektif untuk mengurangi kontribusi pribadi terhadap pencemaran udara?',
    options: [
      'Membakar tumpukan daun kering di halaman belakang setiap sore',
      'Menggunakan kulkas bekas yang masih bocor gas CFC-nya',
      'Menanam tanaman hias penyerap polutan seperti Sansevieria (Lidah Mertua) dan menghemat pemakaian listrik',
      'Membeli mobil baru berbahan bakar solar'
    ],
    correctAnswer: 2,
    explanation: 'Tanaman Lidah Mertua (Sansevieria) terbukti mampu menyerap puluhan zat kimia beracun di udara rumah, sementara menghemat listrik mengurangi emisi PLTU batu bara.'
  },
  {
    id: 8,
    text: 'Batas kualitas udara sehat diukur menggunakan indikator AQI. Singkatan dari apakah AQI?',
    options: [
      'Air Quality Index',
      'Atmospheric Quiz Indicator',
      'Acidity Quality Inspector',
      'Air Quantity Interval'
    ],
    correctAnswer: 0,
    explanation: 'AQI singkatan dari Air Quality Index (Indeks Kualitas Udara), rentang angka dari 0-500 yang mengukur tingkat keamanan udara untuk dihirup.'
  }
];

export const BADGES_LIST = [
  {
    id: 'badge-first-lesson',
    title: 'Pelajar Pemula',
    description: 'Membaca modul Ilmu Baru untuk pertama kalinya.',
    icon: '📖'
  },
  {
    id: 'badge-all-lessons',
    title: 'Cendekia Udara',
    description: 'Menyelesaikan seluruh modul pembelajaran polusi udara.',
    icon: '🎓'
  },
  {
    id: 'badge-air-purifier',
    title: 'Pembersih Langit',
    description: 'Mencapai skor 100+ dalam game interaktif Bermain.',
    icon: '🧹'
  },
  {
    id: 'badge-quiz-master',
    title: 'Eco-Hero Sejati',
    description: 'Mendapatkan nilai sempurna (100) pada Kuis Udara.',
    icon: '🛡️'
  },
  {
    id: 'badge-classroom-crew',
    title: 'Kolektif Hijau',
    description: 'Berhasil bergabung dengan kelompok guru.',
    icon: '👥'
  }
];
