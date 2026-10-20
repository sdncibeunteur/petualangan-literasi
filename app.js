/**
 * PETUALANGAN LITERASI DIGITAL - CORE APPLICATION ENGINE
 * Versi 2.5: PDF.js Viewer Terintegrasi, Sistem Anti-Kecurangan (Anti-Cheat Timer & Focus Tracker),
 * Upload Foto Profil Siswa Sendiri, 20 Tingkat Level, dan Manajemen Lomba Reward 6 Bulan.
 */

// ==========================================
// 1. SOUND EFFECTS ENGINE (Web Audio API)
// ==========================================
const SoundFx = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playLevelUp() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.35);
      });
    } catch (e) {}
  },
  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  },
  playWarning() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }
};

// ==========================================
// 2. EXPANDED 20-LEVEL PROGRESSION ENGINE
// ==========================================
const RANKS = [
  { level: 1,  minXp: 0,      title: "Pembaca Pemula",            badge: "badge-tier-bronze",   icon: "compass",     desc: "Langkah awal memulai petualangan membaca" },
  { level: 2,  minXp: 150,    title: "Pembuka Lembaran",          badge: "badge-tier-bronze",   icon: "book-open",   desc: "Mulai rutin membuka dan membaca buku baru" },
  { level: 3,  minXp: 350,    title: "Penjelajah Kata",           badge: "badge-tier-iron",     icon: "map-pin",     desc: "Menemukan kosa kata dan wawasan baru" },
  { level: 4,  minXp: 650,    title: "Pencari Makna",             badge: "badge-tier-iron",     icon: "search",      desc: "Memahami amanat di balik setiap kisah" },
  { level: 5,  minXp: 1050,   title: "Petualang Cerita",          badge: "badge-tier-copper",   icon: "footprints",  desc: "Mengarungi berbagai ragam buku petualangan" },
  { level: 6,  minXp: 1600,   title: "Pemburu Kisah",             badge: "badge-tier-copper",   icon: "crosshair",   desc: "Selalu bersemangat mencari buku bacaan baru" },
  { level: 7,  minXp: 2300,   title: "Pengelana Dongeng",         badge: "badge-tier-silver",   icon: "feather",     desc: "Menyelami kisah fabel, fiksi, dan legenda" },
  { level: 8,  minXp: 3200,   title: "Penjaga Pustaka",           badge: "badge-tier-silver",   icon: "shield",      desc: "Menjadi teladan cinta buku di kelasnya" },
  { level: 9,  minXp: 4300,   title: "Ksatria Literasi",          badge: "badge-tier-gold",     icon: "sword",       desc: "Berani dan tekun membaca setiap hari" },
  { level: 10, minXp: 5600,   title: "Pendekar Wawasan",          badge: "badge-tier-gold",     icon: "award",       desc: "Memiliki wawasan luas dari ratusan halaman" },
  { level: 11, minXp: 7200,   title: "Panglima Imajinasi",        badge: "badge-tier-emerald",  icon: "crown",       desc: "Daya imajinasi dan pengetahuannya sangat tajam" },
  { level: 12, minXp: 9200,   title: "Penunggang Naga Cerita",    badge: "badge-tier-emerald",  icon: "sparkles",    desc: "Mampu menaklukkan buku tebal dan ensiklopedia" },
  { level: 13, minXp: 11800,  title: "Cendekiawan Agung",         badge: "badge-tier-sapphire", icon: "book-marked", desc: "Berbudi pekerti luhur dan sarat pengetahuan" },
  { level: 14, minXp: 15000,  title: "Begawan Pustaka",           badge: "badge-tier-sapphire", icon: "scroll",      desc: "Kecintaan membacanya menginspirasi satu sekolah" },
  { level: 15, minXp: 19000,  title: "Penjaga Gerbang Ilmu",      badge: "badge-tier-amethyst", icon: "key",         desc: "Menguasai intisari sains, sastra, dan sejarah" },
  { level: 16, minXp: 24000,  title: "Penguasa Alam Khayal",      badge: "badge-tier-ruby",     icon: "flame",       desc: "Menjelajahi cakrawala literasi tanpa batas" },
  { level: 17, minXp: 30500,  title: "Resi Cakrawala",            badge: "badge-tier-diamond",  icon: "gem",         desc: "Tingkat pembaca maestro yang sangat langka" },
  { level: 18, minXp: 38500,  title: "Bintang Keabadian Literasi",badge: "badge-tier-cosmic",   icon: "sun",         desc: "Bersinar terang sebagai pahlawan literasi" },
  { level: 19, minXp: 48000,  title: "Kaisar Jagat Raya Kata",    badge: "badge-tier-mythic",   icon: "zap",         desc: "Hampir mencapai puncak keabadian ilmu" },
  { level: 20, minXp: 60000,  title: "Mahaguru Legenda Abadi",    badge: "badge-tier-legend",   icon: "star",        desc: "Puncak tertinggi petualangan literasi sejati!" }
];

function getRankInfo(xp) {
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];

  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || null;
      break;
    }
  }

  let progressPercent = 100;
  let xpForNext = 0;
  if (nextRank) {
    const range = nextRank.minXp - currentRank.minXp;
    const progress = xp - currentRank.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
    xpForNext = nextRank.minXp - xp;
  }

  return {
    ...currentRank,
    progressPercent,
    nextRank,
    xpForNext
  };
}

// Avatars
const AVATARS = [
  { id: 'adventurer-boy', icon: 'compass', bg: 'bg-blue-500', label: 'Petualang' },
  { id: 'scholar-girl', icon: 'graduation-cap', bg: 'bg-indigo-500', label: 'Cendekiawan' },
  { id: 'knight-courage', icon: 'shield', bg: 'bg-emerald-500', label: 'Ksatria' },
  { id: 'star-dreamer', icon: 'sparkles', bg: 'bg-amber-500', label: 'Bintang' },
  { id: 'nature-explorer', icon: 'tree-pine', bg: 'bg-teal-500', label: 'Jelajah Rimba' },
  { id: 'astro-kid', icon: 'rocket', bg: 'bg-purple-500', label: 'Astronot' },
  { id: 'artist-cilik', icon: 'palette', bg: 'bg-rose-500', label: 'Seniman' },
  { id: 'legend-king', icon: 'crown', bg: 'bg-yellow-500', label: 'Juara' },
];

const COVER_PALETTES = [
  { name: 'Aurora Fantasy', grad: ['#4f46e5', '#06b6d4'], accent: '#fbbf24', text: '#ffffff' },
  { name: 'Sunset Legend', grad: ['#f43f5e', '#fb923c'], accent: '#fef08a', text: '#ffffff' },
  { name: 'Emerald Forest', grad: ['#059669', '#10b981'], accent: '#fde047', text: '#ffffff' },
  { name: 'Cosmic Wonder', grad: ['#312e81', '#7c3aed'], accent: '#38bdf8', text: '#ffffff' },
  { name: 'Golden Kingdom', grad: ['#b45309', '#f59e0b'], accent: '#ffffff', text: '#ffffff' },
  { name: 'Ocean Mystery', grad: ['#0369a1', '#0284c7'], accent: '#a7f3d0', text: '#ffffff' }
];

// ==========================================
// 3. PURE JS VALID PDF 1.4 BUILDER
// ==========================================
const PdfSynthesizer = {
  createMultiPagePdf(title, author, category, points) {
    const pages = [
      {
        heading: "Bab 1: Permulaan Kisah & Pesona Alam",
        paragraphs: [
          "Di sebuah desa yang damai dan asri, hiduplah seorang anak yang memiliki rasa ingin tahu yang sangat besar terhadap dunia di sekitarnya.",
          "Setiap hari setelah menyelesaikan tugasnya, ia senang meluangkan waktu untuk mengamati alam, mendengarkan nasihat para orang tua, dan membaca kisah-kisah kebijaksanaan.",
          "Orang-orang di desa sangat menyukai tutur katanya yang sopan, perilakunya yang santun, serta kejujurannya yang tak pernah pudar dalam keadaan apa pun."
        ]
      },
      {
        heading: "Bab 2: Ujian Kejujuran dan Keberanian",
        paragraphs: [
          "Suatu ketika, datanglah sebuah ujian yang menguji keteguhan hati sang anak. Keadaan menjadi sulit dan godaan untuk berbuat curang sangat terbuka lebar.",
          "Namun ia selalu teringat pesan berharga: 'Harta terbesar seorang manusia bukanlah emas atau permata, melainkan kejujuran dan nama baik yang selalu terjaga.'",
          "Dengan penuh keberanian dan keikhlasan, ia memilih jalan yang benar meskipun memerlukan kesabaran yang luar biasa. Keputusan bijak ini membawanya pada keselamatan."
        ]
      },
      {
        heading: "Bab 3: Pesan Moral & Refleksi Literasi",
        paragraphs: [
          "Dari petualangan membaca ini, kita belajar bahwa setiap perbuatan baik akan membuahkan ketenteraman hidup dan keberkahan yang berlipat ganda.",
          "Membaca bukan sekadar membalik lembaran halaman, melainkan menyerap cahaya ilmu untuk menerangi langkah kehidupan kita.",
          "Selamat! Kamu telah menyelesaikan membaca seluruh halaman buku ini dengan tekun. Sekarang, ambil foto dirimu sedang membaca atau rekam video pendek orang tua membacakan buku untuk mengklaim poin petualanganmu!"
        ]
      }
    ];

    const totalPages = pages.length + 1;
    const objects = [];

    // Obj 1: Catalog
    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

    // Obj 2: Pages list
    let kidsRefs = '';
    for (let i = 0; i < totalPages; i++) {
      const pageObjNum = 3 + i * 2;
      kidsRefs += `${pageObjNum} 0 R `;
    }
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [ ${kidsRefs}] /Count ${totalPages} >>\nendobj\n`);

    const fontObjNum = 3 + totalPages * 2;

    // Page 1: Cover Page
    const coverContentObjNum = 4;
    const safeTitle = this.escapePdfText(title);
    const safeAuthor = this.escapePdfText(author);
    const coverStream = `
q
0.1 0.2 0.5 rg 0 0 595 842 re f
1 1 1 rg
BT
/F1 14 Tf
150 780 Td
(PETUALANGAN LITERASI DIGITAL) Tj
ET
BT
/F1 10 Tf
200 750 Td
([ KATEGORI: ${category.toUpperCase()} - REWARD +${points} XP ]) Tj
ET
BT
/F1 20 Tf
50 540 Td
(${safeTitle}) Tj
ET
BT
/F1 12 Tf
50 490 Td
(Karya Penulis: ${safeAuthor}) Tj
ET
BT
/F1 11 Tf
50 450 Td
(Perpustakaan Digital Sekolah - E-Book Resmi) Tj
ET
BT
/F1 10 Tf
120 120 Td
(Bacalah dengan teliti dan pahami setiap lembaran halaman buku ini.) Tj
ET
Q
`;
    objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${coverContentObjNum} 0 R >>\nendobj\n`);
    objects.push(`${coverContentObjNum} 0 obj\n<< /Length ${coverStream.length} >>\nstream\n${coverStream}\nendstream\nendobj\n`);

    // Content Pages
    pages.forEach((p, idx) => {
      const pageIdx = idx + 1;
      const pageObjNum = 3 + pageIdx * 2;
      const contentObjNum = pageObjNum + 1;

      let textStream = `
q
0.98 0.98 0.98 rg 0 0 595 842 re f
0.1 0.1 0.1 rg
BT
/F1 10 Tf
50 800 Td
(${safeTitle} - Halaman ${pageIdx + 1} dari ${totalPages}) Tj
ET
0.8 0.8 0.8 RG 1 w 50 790 m 545 790 l S
BT
/F1 16 Tf
50 740 Td
(${this.escapePdfText(p.heading)}) Tj
ET
`;
      let yOffset = 690;
      p.paragraphs.forEach(para => {
        textStream += `
BT
/F1 11 Tf
50 ${yOffset} Td
(${this.escapePdfText(para)}) Tj
ET
`;
        yOffset -= 45;
      });

      textStream += `
0.8 0.8 0.8 RG 1 w 50 60 m 545 60 l S
BT
/F1 9 Tf
240 45 Td
(Petualangan Literasi Digital) Tj
ET
Q
`;
      objects.push(`${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`);
      objects.push(`${contentObjNum} 0 obj\n<< /Length ${textStream.length} >>\nstream\n${textStream}\nendstream\nendobj\n`);
    });

    objects.push(`${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

    let pdf = "%PDF-1.4\n";
    const xrefOffsets = [];
    objects.forEach(obj => {
      xrefOffsets.push(pdf.length);
      pdf += obj;
    });

    const startXref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    xrefOffsets.forEach(off => {
      pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
    });

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

    const b64 = btoa(unescape(encodeURIComponent(pdf)));
    return `data:application/pdf;base64,${b64}`;
  },

  escapePdfText(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }
};

// ==========================================
// 4. DATABASE ENGINE (IndexedDB with Fallback)
// ==========================================
const DB = {
  dbName: 'PetualanganLiterasiDB_v2',
  version: 2,
  db: null,

  async init() {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('books')) db.createObjectStore('books', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('submissions')) db.createObjectStore('submissions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('competitions')) db.createObjectStore('competitions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('hallOfFame')) db.createObjectStore('hallOfFame', { keyPath: 'id' });
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.seedInitialData().then(resolve);
      };

      request.onerror = (e) => {
        console.warn('IndexedDB error, fallback memory', e);
        resolve();
      };
    });
  },

  async getAll(storeName) {
    // Buku memakai penyimpanan server agar katalog sama di perangkat admin dan siswa.
    if (storeName === 'books' && location.protocol !== 'file:') {
      try { const r = await fetch('/api/books', { cache: 'no-store' }); if (r.ok) return await r.json(); } catch (e) { console.warn('API buku tidak tersedia; memakai penyimpanan lokal.', e); }
    }
    if (!this.db) {
      const data = localStorage.getItem(`db_${storeName}`);
      return data ? JSON.parse(data) : [];
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  },

  async get(storeName, key) {
    if (storeName === 'books' && location.protocol !== 'file:') {
      try { const list = await this.getAll('books'); return list.find(item => item.id === key) || null; } catch (e) {}
    }
    if (!this.db) {
      const list = await this.getAll(storeName);
      return list.find(item => (item.id || item.key) === key) || null;
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  },

  async put(storeName, item) {
    if (storeName === 'books' && location.protocol !== 'file:') {
      const r = await fetch('/api/books/' + encodeURIComponent(item.id), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Gagal menyimpan buku ke server');
      return await r.json();
    }
    if (!this.db) {
      const list = await this.getAll(storeName);
      const idx = list.findIndex(i => (i.id || i.key) === (item.id || item.key));
      if (idx >= 0) list[idx] = item;
      else list.push(item);
      localStorage.setItem(`db_${storeName}`, JSON.stringify(list));
      return item;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = (err) => reject(err);
    });
  },

  async delete(storeName, key) {
    if (storeName === 'books' && location.protocol !== 'file:') {
      const r = await fetch('/api/books/' + encodeURIComponent(key), { method: 'DELETE' });
      if (!r.ok) throw new Error('Gagal menghapus buku dari server');
      return true;
    }
    if (!this.db) {
      let list = await this.getAll(storeName);
      list = list.filter(i => (i.id || i.key) !== key);
      localStorage.setItem(`db_${storeName}`, JSON.stringify(list));
      return true;
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  },

  async seedInitialData() {
    const existingUsers = await this.getAll('users');
    if (existingUsers.length === 0) {
      // 1. Admin PIN
      await this.put('settings', { key: 'admin_pin', value: '123456' });

      // 2. Active 6-Month Competition & Reward
      const sixMonthStart = new Date();
      sixMonthStart.setMonth(sixMonthStart.getMonth() - 1);
      const sixMonthEnd = new Date();
      sixMonthEnd.setMonth(sixMonthEnd.getMonth() + 5);

      const currentComp = {
        id: 'comp_active',
        title: 'Tantangan Membaca E-Book Semester Ganjil (Periode 6 Bulan)',
        startDate: sixMonthStart.toISOString().slice(0, 10),
        endDate: sixMonthEnd.toISOString().slice(0, 10),
        desc: 'Kumpulkan poin XP sebanyak mungkin selama 6 bulan! 3 besar siswa pembaca teratas akan dinobatkan sebagai Ksatria Literasi Utama dan berhak mendapatkan piala dan hadiah istimewa.',
        reward1: '🏆 Piala Emas Bergilir + Piagam Penghargaan + Sepeda Petualang / Paket Buku Eksklusif',
        reward2: '🥈 Piala Perak Juara 2 + Piagam + Tas Ransel Sekolah & Ensiklopedia Bergambar',
        reward3: '🥉 Piala Perunggu Juara 3 + Piagam + Paket Alat Tulis Lengkap & Voucher Baca',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      await this.put('competitions', currentComp);

      await this.put('hallOfFame', {
        id: 'hof_1',
        competitionTitle: 'Lomba Membaca 6 Bulan Semester Genap 2025/2026',
        period: 'Januari - Juni 2026',
        winner1: 'Ahmad Fauzi (Juara 1 Emas)',
        winner2: 'Siti Nurhaliza (Juara 2 Perak)',
        winner3: 'Budi Pratama (Juara 3 Perunggu)',
        dateAwarded: '30 Juni 2026'
      });

      // 3. Initial Students (With customPhoto support)
      const initialStudents = [
        {
          id: 'user_1',
          username: 'ahmadfauzi',
          fullname: 'Ahmad Fauzi',
          password: '123',
          grade: 'Kelas 5A',
          school: 'SDN 1 Cibeunteur',
          role: 'student',
          status: 'approved',
          avatar: 'knight-courage',
          customPhoto: null,
          bio: 'Membaca setiap malam demi meraih Piala Emas 6 Bulan!',
          points: 4450,
          booksReadCount: 32,
          createdAt: new Date(Date.now() - 40 * 86400000).toISOString()
        },
        {
          id: 'user_2',
          username: 'sitinur',
          fullname: 'Siti Nurhaliza',
          password: '123',
          grade: 'Kelas 4B',
          school: 'SDN 1 Cibeunteur',
          role: 'student',
          status: 'approved',
          avatar: 'scholar-girl',
          customPhoto: null,
          bio: 'Dongeng dan ensiklopedia adalah sahabat terbaikku.',
          points: 3350,
          booksReadCount: 25,
          createdAt: new Date(Date.now() - 35 * 86400000).toISOString()
        },
        {
          id: 'user_3',
          username: 'budipratama',
          fullname: 'Budi Pratama',
          password: '123',
          grade: 'Kelas 4A',
          school: 'SDN 1 Cibeunteur',
          role: 'student',
          status: 'approved',
          avatar: 'adventurer-boy',
          customPhoto: null,
          bio: 'Ingin terus mengejar poin untuk masuk 3 besar hadiah!',
          points: 1850,
          booksReadCount: 16,
          createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
        },
        {
          id: 'user_4',
          username: 'rianhidayat',
          fullname: 'Rian Hidayat',
          password: '123',
          grade: 'Kelas 3C',
          school: 'SDN 1 Cibeunteur',
          role: 'student',
          status: 'approved',
          avatar: 'nature-explorer',
          customPhoto: null,
          bio: 'Senang membaca buku fabel satwa rimba bersama ayah.',
          points: 480,
          booksReadCount: 5,
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
        },
        {
          id: 'user_5',
          username: 'dewilestari',
          fullname: 'Dewi Lestari',
          password: '123',
          grade: 'Kelas 3A',
          school: 'SDN 1 Cibeunteur',
          role: 'student',
          status: 'pending',
          avatar: 'star-dreamer',
          customPhoto: null,
          bio: 'Saya ingin mulai berpetualang dan meraih reward!',
          points: 0,
          booksReadCount: 0,
          createdAt: new Date().toISOString()
        }
      ];

      for (const st of initialStudents) {
        await this.put('users', st);
      }

      // 4. Initial Books (Generated with REAL Valid Multi-Page PDF Data!)
      const initialBooks = [
        {
          id: 'book_1',
          title: 'Petualangan Si Kancil di Hutan Ajaib',
          author: 'Kak Dwi Pustaka',
          category: 'Fabel',
          points: 35,
          pageCountEst: 4,
          fileName: 'si_kancil_hutan_ajaib.pdf',
          fileSize: '4.8 MB',
          coverImage: null,
          paletteIndex: 2,
          icon: 'feather',
          readsCount: 18,
          pdfData: null,
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
        },
        {
          id: 'book_2',
          title: 'Misteri Planet Merah dan Galaksi Bimasakti',
          author: 'Dr. Surya Antariksa',
          category: 'Sains',
          points: 55,
          pageCountEst: 4,
          fileName: 'misteri_planet_merah.pdf',
          fileSize: '18.2 MB',
          coverImage: null,
          paletteIndex: 3,
          icon: 'rocket',
          readsCount: 24,
          pdfData: null,
          createdAt: new Date(Date.now() - 28 * 86400000).toISOString()
        },
        {
          id: 'book_3',
          title: 'Ksatria Samudra: Penjaga Terumbu Karang',
          author: 'Tim Literasi Bahari',
          category: 'Petualangan',
          points: 45,
          pageCountEst: 4,
          fileName: 'ksatria_samudra_karang.pdf',
          fileSize: '12.4 MB',
          coverImage: null,
          paletteIndex: 5,
          icon: 'compass',
          readsCount: 15,
          pdfData: null,
          createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
        },
        {
          id: 'book_4',
          title: 'Kejujuran Sang Gembala Cilik',
          author: 'Bunda Asih',
          category: 'Moral',
          points: 30,
          pageCountEst: 4,
          fileName: 'kejujuran_gembala_cilik.pdf',
          fileSize: '3.1 MB',
          coverImage: null,
          paletteIndex: 4,
          icon: 'crown',
          readsCount: 11,
          pdfData: null,
          createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
        }
      ];

      for (const b of initialBooks) {
        b.coverImage = CoverGenerator.generateDataUrl(b.title, b.author, b.category, b.points, b.paletteIndex, b.icon);
        b.pdfData = PdfSynthesizer.createMultiPagePdf(b.title, b.author, b.category, b.points);
        await this.put('books', b);
      }

      // Initial Submissions
      const initialSubmissions = [
        {
          id: 'sub_1',
          studentId: 'user_1',
          studentName: 'Ahmad Fauzi',
          studentGrade: 'Kelas 5A',
          bookId: 'book_2',
          bookTitle: 'Misteri Planet Merah dan Galaksi Bimasakti',
          pointsReward: 55,
          type: 'photo',
          mediaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23e2e8f0"/><circle cx="300" cy="170" r="70" fill="%2394a3b8"/><rect x="220" y="250" width="160" height="80" rx="20" fill="%2364748b"/><polygon points="260,330 340,330 350,290 250,290" fill="%23f59e0b"/><text x="300" y="370" font-family="sans-serif" font-size="16" fill="%23334155" text-anchor="middle" font-weight="bold">Foto Siswa: Ahmad Fauzi Sedang Membaca</text></svg>',
          notes: 'Saya sangat takjub dengan rahasia gravitasi di Planet Mars! Bukunya sangat seru.',
          verifiedReadingTime: '2 menit 15 detik (Fokus Penuh)',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub_2',
          studentId: 'user_2',
          studentName: 'Siti Nurhaliza',
          studentGrade: 'Kelas 4B',
          bookId: 'book_1',
          bookTitle: 'Petualangan Si Kancil di Hutan Ajaib',
          pointsReward: 35,
          type: 'video',
          mediaUrl: 'sample_video',
          notes: 'Dibacakan oleh Ibu saat menjelang tidur malam. Pesan moralnya sangat bagus.',
          verifiedReadingTime: '1 menit 45 detik (Fokus Penuh)',
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      for (const sub of initialSubmissions) {
        await this.put('submissions', sub);
      }
    }
  }
};

// ==========================================
// 5. AUTOMATIC BOOK COVER GENERATOR (CANVAS)
// ==========================================
const CoverGenerator = {
  renderToCanvas(canvas, title, author, category, points, paletteIdx = 0, iconChoice = 'auto') {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const pal = COVER_PALETTES[paletteIdx % COVER_PALETTES.length];

    const grad = ctx.createLinearGradient(0, 0, width * 0.9, height);
    grad.addColorStop(0, pal.grad[0]);
    grad.addColorStop(1, pal.grad[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    for (let i = -100; i < width + height; i += 35) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, width - 16, height - 16);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PETUALANGAN LITERASI', width / 2, 22);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    const catText = (category || 'E-Book').toUpperCase();
    ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
    const catWidth = ctx.measureText(catText).width + 14;
    ctx.roundRect((width - catWidth) / 2, 28, catWidth, 16, 8);
    ctx.fill();
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'center';
    ctx.fillText(catText, width / 2, 39);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, 85);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const iconType = iconChoice !== 'auto' ? iconChoice : this.resolveIconType(title, category);
    this.drawIconSymbol(ctx, iconType);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(width - 50, 10, 42, 18, 5);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`+${points || 35} XP`, width - 29, 22);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = pal.text;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px "Fredoka", "Plus Jakarta Sans", sans-serif';
    const safeTitle = title || 'Judul Buku';
    const lines = this.wrapText(ctx, safeTitle, width - 30, 3);
    const startY = 145;
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + (idx * 16));
    });
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(author ? `Oleh: ${author}` : 'Perpustakaan Digital', width / 2, height - 25);
    ctx.restore();
  },

  resolveIconType(title, category) {
    const t = (title + ' ' + category).toLowerCase();
    if (t.includes('kancil') || t.includes('hewan') || t.includes('fabel') || t.includes('hutan')) return 'feather';
    if (t.includes('planet') || t.includes('bintang') || t.includes('angkasa') || t.includes('sains')) return 'rocket';
    if (t.includes('laut') || t.includes('samudra') || t.includes('petualang')) return 'compass';
    if (t.includes('ksatria') || t.includes('raja') || t.includes('pahlawan') || t.includes('gembala') || t.includes('jujur')) return 'crown';
    return 'book';
  },

  drawIconSymbol(ctx, type) {
    switch (type) {
      case 'rocket':
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.quadraticCurveTo(10, -8, 6, 10);
        ctx.lineTo(-6, 10);
        ctx.quadraticCurveTo(-10, -8, 0, -18);
        ctx.stroke();
        break;
      case 'crown':
        ctx.beginPath();
        ctx.moveTo(-14, 10);
        ctx.lineTo(-16, -6);
        ctx.lineTo(-7, 0);
        ctx.lineTo(0, -12);
        ctx.lineTo(7, 0);
        ctx.lineTo(16, -6);
        ctx.lineTo(14, 10);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        break;
      case 'compass':
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();
        break;
      case 'feather':
        ctx.beginPath();
        ctx.moveTo(10, -14);
        ctx.quadraticCurveTo(-6, -8, -12, 14);
        ctx.stroke();
        break;
      default:
        ctx.beginPath();
        ctx.moveTo(-12, -10);
        ctx.lineTo(0, -6);
        ctx.lineTo(12, -10);
        ctx.lineTo(12, 10);
        ctx.lineTo(0, 14);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.stroke();
        break;
    }
  },

  wrapText(ctx, text, maxWidth, maxLines) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      if (ctx.measureText(currentLine + " " + word).width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    if (lines.length > maxLines) {
      const trimmed = lines.slice(0, maxLines);
      trimmed[maxLines - 1] += '...';
      return trimmed;
    }
    return lines;
  },

  generateDataUrl(title, author, category, points, paletteIdx = 0, icon = 'auto') {
    const offscreen = document.createElement('canvas');
    offscreen.width = 240;
    offscreen.height = 330;
    this.renderToCanvas(offscreen, title, author, category, points, paletteIdx, icon);
    return offscreen.toDataURL('image/jpeg', 0.85);
  }
};

// ==========================================
// 6. APPLICATION CONTROLLER
// ==========================================
const app = {
  currentView: 'home',
  currentUser: null,
  isAdminLoggedIn: false,
  selectedPaletteIndex: 0,
  uploadedCustomCover: null,
  selectedBookFile: null,
  activeBookForPdfReplacement: null,
  currentBlobUrl: null,
  activeReaderBook: null,

  // PDF.js State Variables
  pdfDoc: null,
  pdfPageNum: 1,
  pdfTotalPages: 1,
  pdfScale: 1.15,
  pdfRendering: false,
  pdfPendingPage: null,
  pdfCurrentMode: 'canvas',

  // Anti-Kecurangan State Variables
  readingTimerInterval: null,
  readingElapsedSeconds: 0,
  readingTargetSeconds: 60,
  isReadingFocused: true,
  lastScrollTop: 0,
  lastScrollTimestamp: Date.now(),
  cheatWarningTimeout: null,
  lastUserActivity: Date.now(),

  async init() {
    await DB.init();

    if (sessionStorage.getItem('admin_session') === 'true') {
      this.isAdminLoggedIn = true;
    }
    const savedUserId = sessionStorage.getItem('student_session_id');
    if (savedUserId) {
      const user = await DB.get('users', savedUserId);
      if (user && user.status === 'approved') {
        this.currentUser = user;
      }
    }

    this.initPalettePicker();
    this.setupAntiCheatGlobalListeners();
    this.renderNav();
    this.navigate(this.isAdminLoggedIn ? 'admin' : (this.currentUser ? 'student' : 'home'));
    lucide.createIcons();
  },

  // ---------------- USER AVATAR HELPER (SUPPORTS CUSTOM PHOTO) ----------------
  renderUserAvatar(user, sizeClass = 'w-10 h-10', textClass = 'text-base') {
    if (!user) {
      return `<div class="${sizeClass} rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold ${textClass}"><i data-lucide="user" class="w-5 h-5"></i></div>`;
    }
    if (user.customPhoto) {
      return `<img src="${user.customPhoto}" alt="${this.escapeHtml(user.fullname)}" class="${sizeClass} rounded-2xl object-cover border-2 border-amber-400 shadow-sm flex-shrink-0">`;
    }
    return `<div class="${sizeClass} rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold ${textClass} shadow-sm flex-shrink-0">${user.fullname ? user.fullname.charAt(0) : 'U'}</div>`;
  },

  // ---------------- NAVIGATION & ROUTING ----------------
  navigate(view) {
    this.currentView = view;
    this.renderNav();
    this.updateMobileNavActive();
    const container = document.getElementById('main-content');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'home') {
      this.renderHomeView(container);
    } else if (view === 'admin') {
      if (!this.isAdminLoggedIn) {
        this.openModal('modal-admin-login');
        return;
      }
      this.renderAdminDashboard(container);
    } else if (view === 'student') {
      if (!this.currentUser) {
        this.openModal('modal-student-auth');
        return;
      }
      this.renderStudentDashboard(container);
    } else if (view === 'library') {
      this.renderDigitalLibraryView(container);
    } else if (view === 'competitions') {
      this.renderCompetitionsView(container);
    }

    lucide.createIcons();
  },

  updateMobileNavActive() {
    const ids = ['mob-nav-home', 'mob-nav-library', 'mob-nav-comp', 'mob-nav-user'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('text-brand-600', 'font-bold');
    });

    if (this.currentView === 'home') document.getElementById('mob-nav-home')?.classList.add('text-brand-600', 'font-bold');
    if (this.currentView === 'library') document.getElementById('mob-nav-library')?.classList.add('text-brand-600', 'font-bold');
    if (this.currentView === 'competitions') document.getElementById('mob-nav-comp')?.classList.add('text-brand-600', 'font-bold');
    if (this.currentView === 'student') document.getElementById('mob-nav-user')?.classList.add('text-brand-600', 'font-bold');
  },

  handleMobileProfileClick() {
    if (this.isAdminLoggedIn) {
      this.navigate('admin');
    } else if (this.currentUser) {
      this.navigate('student');
    } else {
      this.openModal('modal-student-auth');
    }
  },

  renderNav() {
    const navEl = document.getElementById('nav-actions');
    if (!navEl) return;

    let html = `
      <div class="hidden md:flex items-center gap-1 mr-2 text-xs font-semibold">
        <button onclick="app.navigate('home')" class="px-3 py-1.5 rounded-xl transition ${this.currentView === 'home' ? 'bg-slate-100 text-brand-600 font-bold' : 'text-slate-600 hover:text-slate-900'}">
          Beranda
        </button>
        <button onclick="app.navigate('library')" class="px-3 py-1.5 rounded-xl transition ${this.currentView === 'library' ? 'bg-slate-100 text-brand-600 font-bold' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-1.5">
          <i data-lucide="book-open" class="w-4 h-4"></i> Perpustakaan
        </button>
        <button onclick="app.navigate('competitions')" class="px-3 py-1.5 rounded-xl transition ${this.currentView === 'competitions' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-1.5">
          <i data-lucide="gift" class="w-4 h-4 text-amber-500"></i> Lomba & Reward 6 Bulan
        </button>
      </div>
    `;

    if (this.isAdminLoggedIn) {
      html += `
        <div class="flex items-center gap-1.5 sm:gap-2">
          <button onclick="app.navigate('admin')" class="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5">
            <i data-lucide="layout-dashboard" class="w-4 h-4"></i> <span class="hidden sm:inline">Dasbor</span> Admin
          </button>
          <button onclick="app.adminLogout()" title="Keluar Admin" class="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    } else if (this.currentUser) {
      const rank = getRankInfo(this.currentUser.points || 0);
      html += `
        <div class="flex items-center gap-2">
          <button onclick="app.navigate('student')" class="flex items-center gap-2 p-1 sm:p-1.5 pr-2.5 sm:pr-3 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 shadow-sm transition">
            ${this.renderUserAvatar(this.currentUser, 'w-7 h-7 sm:w-8 sm:h-8', 'text-xs')}
            <div class="text-left">
              <p class="text-xs font-bold text-slate-800 leading-tight">${this.escapeHtml(this.currentUser.fullname.split(' ')[0])}</p>
              <p class="text-[10px] text-brand-600 font-semibold font-mono">${this.currentUser.points || 0} XP • Lv.${rank.level}</p>
            </div>
          </button>
          <button onclick="app.studentLogout()" title="Keluar Akun" class="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hidden sm:block">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    } else {
      html += `
        <div class="flex items-center gap-1.5 sm:gap-2">
          <button onclick="app.openModal('modal-student-auth')" class="px-3 sm:px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition flex items-center gap-1.5">
            <i data-lucide="user" class="w-3.5 h-3.5"></i> Masuk Siswa
          </button>
          <button onclick="app.openModal('modal-admin-login')" class="px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-indigo-600"></i> Admin
          </button>
        </div>
      `;
    }

    navEl.innerHTML = html;
  },

  // ---------------- VIEW 1: HOME VIEW ----------------
  async renderHomeView(container) {
    const books = await DB.getAll('books');
    const users = await DB.getAll('users');
    const comps = await DB.getAll('competitions');
    const activeComp = comps.find(c => c.status === 'active') || comps[0];

    const approvedStudents = users.filter(u => u.status === 'approved' && u.role === 'student');
    approvedStudents.sort((a, b) => (b.points || 0) - (a.points || 0));
    const topThree = approvedStudents.slice(0, 3);

    container.innerHTML = `
      <!-- Hero Banner -->
      <div class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-brand-800 to-indigo-950 text-white p-5 sm:p-10 shadow-xl mb-6 sm:mb-10">
        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-[11px] font-semibold mb-3">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> 20 Pangkat Level Petualang Literasi
          </div>
          <h1 class="text-2xl sm:text-4xl font-extrabold font-display leading-tight mb-3">
            Jelajahi E-Book Asli, Baca Bebas Curang & Raih Hadiah 6 Bulan!
          </h1>
          <p class="text-slate-200 text-xs sm:text-base mb-6 leading-relaxed">
            Baca buku PDF langsung di browser dengan sistem anti-kecurangan waktu baca. Upload foto profilmu sendiri, kumpulkan XP, dan puncaki tangga juara literasi sekolah!
          </p>

          <div class="flex flex-wrap items-center gap-2.5 sm:gap-4">
            ${this.currentUser ? `
              <button onclick="app.navigate('student')" class="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/30 transition flex items-center gap-2">
                <i data-lucide="compass" class="w-4 h-4"></i> Dasbor Petualanganku
              </button>
            ` : `
              <button onclick="app.openModal('modal-student-auth')" class="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/30 transition flex items-center gap-2">
                <i data-lucide="rocket" class="w-4 h-4"></i> Masuk / Daftar Siswa
              </button>
            `}
            <button onclick="app.navigate('competitions')" class="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition flex items-center gap-1.5">
              <i data-lucide="gift" class="w-4 h-4 text-amber-300"></i> Hadiah Lomba 6 Bulan
            </button>
          </div>
        </div>
      </div>

      <!-- BANNER TANTANGAN REWARD 6 BULAN -->
      ${activeComp ? `
        <div class="mb-8 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-amber-950 rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-white/80 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-md animate-wiggle">
              <i data-lucide="trophy" class="w-8 h-8"></i>
            </div>
            <div>
              <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-900 text-white inline-block mb-1">
                🏆 Hadiah Juara Membaca Periode 6 Bulan
              </span>
              <h3 class="text-base sm:text-xl font-bold font-display">${this.escapeHtml(activeComp.title)}</h3>
              <p class="text-xs text-amber-900 mt-0.5 line-clamp-1">${this.escapeHtml(activeComp.desc)}</p>
            </div>
          </div>
          <button onclick="app.openViewRewardModal()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 flex-shrink-0">
            <i data-lucide="gift" class="w-4 h-4 text-amber-400"></i> Rincian Hadiah
          </button>
        </div>
      ` : ''}

      <!-- Podium 3 Besar Siswa Teratas -->
      <div class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
              <i data-lucide="crown" class="w-5 h-5 text-amber-500"></i> 3 Besar Ksatria Literasi Sekolah
            </h2>
            <p class="text-[11px] sm:text-xs text-slate-500">Peringkat teratas akumulasi poin XP membaca menuju gelar Mahaguru.</p>
          </div>
          <button onclick="app.navigate('competitions')" class="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-0.5">
            Lomba & Peringkat <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
          ${this.renderTopThreePodium(topThree)}
        </div>
      </div>

      <!-- Featured Books Catalog -->
      <div class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
              <i data-lucide="book-open" class="w-5 h-5 text-indigo-600"></i> Koleksi E-Book Digital
            </h2>
            <p class="text-[11px] sm:text-xs text-slate-500">Buka dan baca e-book PDF asli lengkap dengan reader interaktif.</p>
          </div>
          <button onclick="app.navigate('library')" class="text-xs font-bold text-brand-600 hover:underline">
            Semua E-Book →
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          ${books.slice(0, 4).map(b => this.renderBookCard(b)).join('')}
        </div>
      </div>
    `;
  },

  renderTopThreePodium(topStudents) {
    if (!topStudents || topStudents.length === 0) {
      return `<div class="col-span-3 text-center py-6 text-slate-400 text-xs">Belum ada siswa yang diverifikasi.</div>`;
    }

    const order = [1, 0, 2];
    let html = '';

    order.forEach(rankIdx => {
      const student = topStudents[rankIdx];
      if (!student) return;

      const rankNum = rankIdx + 1;
      const rankInfo = getRankInfo(student.points || 0);

      const heightClass = rankNum === 1 ? 'md:order-2 md:pb-4' : (rankNum === 2 ? 'md:order-1' : 'md:order-3');
      const crownColor = rankNum === 1 ? 'text-amber-500' : (rankNum === 2 ? 'text-slate-400' : 'text-amber-700');
      const crownBg = rankNum === 1 ? 'bg-amber-100 border-amber-300' : (rankNum === 2 ? 'bg-slate-100 border-slate-300' : 'bg-orange-100 border-orange-300');
      const podiumBorder = rankNum === 1 ? 'border-amber-400 ring-2 sm:ring-4 ring-amber-400/20 shadow-lg' : 'border-slate-200 shadow-sm';

      html += `
        <div class="${heightClass} flex flex-col items-center">
          <div class="w-full bg-white rounded-3xl p-4 sm:p-6 border ${podiumBorder} text-center relative overflow-hidden transition hover:-translate-y-1">
            <div class="absolute top-3 right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${crownBg} border flex items-center justify-center font-bold text-xs ${crownColor}">
              #${rankNum}
            </div>

            <!-- Avatar / Custom Student Photo on Podium -->
            <div class="relative w-18 h-18 sm:w-20 sm:h-20 mx-auto mb-3 flex items-center justify-center">
              ${this.renderUserAvatar(student, 'w-18 h-18 sm:w-20 sm:h-20', 'text-2xl sm:text-3xl')}
              <div class="absolute -top-2.5 -right-1.5 ${crownColor}">
                <i data-lucide="crown" class="w-6 h-6 fill-current"></i>
              </div>
            </div>

            <h3 class="text-sm sm:text-base font-bold font-display text-slate-800 truncate">${this.escapeHtml(student.fullname)}</h3>
            <p class="text-[11px] text-slate-500 mb-2">${this.escapeHtml(student.grade)} • ${this.escapeHtml(student.school || 'SDN')}</p>

            <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${rankInfo.badge} mb-3">
              <i data-lucide="${rankInfo.icon}" class="w-3 h-3"></i>
              <span>Lv.${rankInfo.level} - ${rankInfo.title}</span>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-around text-center">
              <div>
                <span class="block text-base sm:text-lg font-bold font-mono text-brand-600">${student.points || 0}</span>
                <span class="text-[9px] text-slate-400 uppercase font-semibold">Total Poin</span>
              </div>
              <div class="w-px h-6 bg-slate-100"></div>
              <div>
                <span class="block text-base sm:text-lg font-bold font-mono text-slate-700">${student.booksReadCount || 0}</span>
                <span class="text-[9px] text-slate-400 uppercase font-semibold">Buku Dibaca</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    return html;
  },

  renderBookCard(book) {
    const isSyn = this.isBookSynthetic(book);
    return `
      <div class="book-card bg-white rounded-2xl border border-slate-200/80 p-2.5 sm:p-3 flex flex-col justify-between group shadow-sm">
        <div class="relative mb-2 sm:mb-3 overflow-hidden rounded-xl bg-slate-100 aspect-[3/4] flex items-center justify-center">
          ${book.coverImage ? `
            <img src="${book.coverImage}" alt="${this.escapeHtml(book.title)}" class="w-full h-full object-cover">
          ` : `
            <div class="p-2 text-center text-slate-400 text-xs">Menyiapkan cover...</div>
          `}
          <div class="absolute top-1.5 right-1.5 bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow font-mono">
            +${book.points} XP
          </div>
          ${isSyn ? `
            <div class="absolute bottom-1.5 left-1.5 bg-slate-900/85 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm border border-amber-500/30">
              Draf Sementara
            </div>
          ` : ''}
        </div>

        <div>
          <span class="text-[9px] uppercase font-bold text-indigo-600">${this.escapeHtml(book.category || 'Buku')}</span>
          <h4 class="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-tight" title="${this.escapeHtml(book.title)}">
            ${this.escapeHtml(book.title)}
          </h4>
          <p class="text-[11px] text-slate-500 mt-0.5 truncate">${this.escapeHtml(book.author || 'Literasi')}</p>
        </div>

        <div class="mt-3 pt-2 border-t border-slate-100 space-y-1">
          <button onclick="app.openBookReader('${book.id}')" class="w-full py-1.5 px-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition flex items-center justify-center gap-1">
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Buka Buku PDF
          </button>
          ${this.isAdminLoggedIn ? `
            <button onclick="app.promptReplacePdf('${book.id}')" class="w-full py-1 px-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-indigo-700 text-[11px] font-semibold transition flex items-center justify-center gap-1 border border-slate-200">
              <i data-lucide="file-up" class="w-3 h-3"></i> Ganti PDF Asli
            </button>
          ` : ''}
        </div>
      </div>
    `;
  },

  // ---------------- VIEW 2: ADMIN DASHBOARD ----------------
  async renderAdminDashboard(container) {
    const users = await DB.getAll('users');
    const books = await DB.getAll('books');
    const submissions = await DB.getAll('submissions');
    const comps = await DB.getAll('competitions');
    const activeComp = comps.find(c => c.status === 'active') || comps[0];

    const students = users.filter(u => u.role === 'student');
    const pendingStudents = students.filter(u => u.status === 'pending');
    const approvedStudents = students.filter(u => u.status === 'approved');
    approvedStudents.sort((a, b) => (b.points || 0) - (a.points || 0));

    const pendingSubmissions = submissions.filter(s => s.status === 'pending');

    container.innerHTML = `
      <!-- Admin Header -->
      <div class="bg-indigo-900 text-white rounded-3xl p-5 sm:p-7 mb-6 sm:mb-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-800 text-indigo-200 text-xs font-semibold mb-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i> Dasbor Admin Sekolah
          </div>
          <h1 class="text-xl sm:text-3xl font-bold font-display">Pusat Manajemen Literasi & Lomba</h1>
          <p class="text-xs sm:text-sm text-indigo-200 mt-0.5">Kelola 20 level siswa, verifikasi bukti baca foto/video, upload buku PDF bebas batas, dan atur reward 6 bulan.</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button onclick="app.openManageCompetitionModal()" class="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-md transition flex items-center gap-1.5">
            <i data-lucide="trophy" class="w-4 h-4"></i> Atur Hadiah 6 Bulan
          </button>
          <button onclick="app.openUploadBookModal()" class="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition flex items-center gap-1.5">
            <i data-lucide="plus-circle" class="w-4 h-4 text-indigo-600"></i> Upload Buku PDF
          </button>
          <button onclick="app.exportDatabaseBackup()" title="Backup Database" class="p-2.5 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white text-xs transition">
            <i data-lucide="download" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Verifikasi Baca</span>
          <div class="text-2xl sm:text-3xl font-bold font-display text-slate-800">${pendingSubmissions.length}</div>
          <p class="text-[11px] text-amber-600 mt-0.5 font-medium">Foto / video menunggu ACC</p>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pendaftaran Siswa</span>
          <div class="text-2xl sm:text-3xl font-bold font-display text-slate-800">${pendingStudents.length}</div>
          <p class="text-[11px] text-rose-600 mt-0.5 font-medium">Menunggu ACC Akun</p>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Siswa Terdaftar</span>
          <div class="text-2xl sm:text-3xl font-bold font-display text-slate-800">${approvedStudents.length}</div>
          <p class="text-[11px] text-emerald-600 mt-0.5 font-medium">Aktif membaca</p>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Koleksi E-Book PDF</span>
          <div class="text-2xl sm:text-3xl font-bold font-display text-slate-800">${books.length}</div>
          <p class="text-[11px] text-indigo-600 mt-0.5 font-medium">PDF Asli & Cover Otomatis</p>
        </div>
      </div>

      <!-- PENDING READING PROOFS (VERIFIKASI FOTO / VIDEO MEMBACA) -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 mb-8">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i data-lucide="clipboard-check" class="w-4 h-4"></i>
            </div>
            <h3 class="text-base font-bold font-display text-slate-800">Verifikasi Bukti Foto/Video Membaca</h3>
          </div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            ${pendingSubmissions.length} Menunggu
          </span>
        </div>

        ${pendingSubmissions.length === 0 ? `
          <div class="text-center py-6 text-slate-400 text-xs">Semua bukti membaca sudah selesai diverifikasi!</div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            ${pendingSubmissions.map(sub => `
              <div class="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${sub.type === 'video' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}">
                        ${sub.type === 'video' ? '📹 Video Ortu' : '📷 Foto Siswa'}
                      </span>
                      <h4 class="font-bold text-xs sm:text-sm text-slate-800 mt-1">${this.escapeHtml(sub.studentName)} (${this.escapeHtml(sub.studentGrade)})</h4>
                      <p class="text-[11px] text-slate-500">Buku: <strong>${this.escapeHtml(sub.bookTitle)}</strong></p>
                    </div>
                    <span class="font-mono font-bold text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      +${sub.pointsReward} XP
                    </span>
                  </div>

                  <!-- Verified Anti-Cheat Metric Display -->
                  <div class="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-2.5 py-1 text-[11px] flex items-center gap-1.5 my-2">
                    <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
                    <span>Verifikasi Waktu Baca: <strong>${this.escapeHtml(sub.verifiedReadingTime || '1 menit 30 detik (Fokus Penuh)')}</strong></span>
                  </div>

                  ${sub.notes ? `<p class="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60 my-2 italic">"${this.escapeHtml(sub.notes)}"</p>` : ''}
                </div>

                <div class="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button onclick="app.previewProofModal('${sub.id}')" class="py-1.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold">
                    Lihat Media
                  </button>
                  <div class="flex items-center gap-1.5">
                    <button onclick="app.rejectReadingSubmission('${sub.id}')" class="py-1.5 px-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold">
                      Tolak
                    </button>
                    <button onclick="app.approveReadingSubmission('${sub.id}')" class="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm">
                      ACC & Tambah Poin
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- PENDING STUDENT APPROVAL (ACC SISWA) -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 mb-8">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <i data-lucide="user-check" class="w-4 h-4"></i>
            </div>
            <h3 class="text-base font-bold font-display text-slate-800">Persetujuan Akun Siswa Baru (ACC)</h3>
          </div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
            ${pendingStudents.length} Menunggu ACC
          </span>
        </div>

        ${pendingStudents.length === 0 ? `
          <div class="text-center py-5 text-slate-400 text-xs">Tidak ada akun siswa yang menunggu persetujuan.</div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Nama</th>
                  <th class="py-2.5 px-3">Username</th>
                  <th class="py-2.5 px-3">Kelas</th>
                  <th class="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${pendingStudents.map(st => `
                  <tr>
                    <td class="py-3 px-3 font-bold text-slate-800">${this.escapeHtml(st.fullname)}</td>
                    <td class="py-3 px-3 font-mono text-indigo-600">${this.escapeHtml(st.username)}</td>
                    <td class="py-3 px-3 text-slate-600">${this.escapeHtml(st.grade)}</td>
                    <td class="py-3 px-3 text-right space-x-1.5">
                      <button onclick="app.rejectStudentAccount('${st.id}')" class="py-1 px-2.5 rounded-lg border border-slate-200 text-rose-600 text-xs">Tolak</button>
                      <button onclick="app.approveStudentAccount('${st.id}')" class="py-1 px-3 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm">ACC Akun</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- MANAJEMEN KOLEKSI BUKU & BERKAS PDF (VERIFIKASI PDF ASLI VS DRAF SEMENTARA) -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <i data-lucide="book-marked" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-base font-bold font-display text-slate-800">Manajemen Koleksi E-Book & Berkas PDF</h3>
              <p class="text-[11px] text-slate-500">Lihat semua buku, cek keaslian dokumen PDF, ganti berkas fisik asli, atau hapus buku.</p>
            </div>
          </div>
          <button onclick="app.openUploadBookModal()" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Upload Buku PDF Baru
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th class="py-2.5 px-3">Buku & Penulis</th>
                <th class="py-2.5 px-3">Kategori</th>
                <th class="py-2.5 px-3 font-mono">Poin XP</th>
                <th class="py-2.5 px-3">Status Berkas PDF</th>
                <th class="py-2.5 px-3 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${books.map(b => {
                const isSyn = this.isBookSynthetic(b);
                return `
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-3">
                      <div class="flex items-center gap-2.5">
                        <img src="${b.coverImage || ''}" class="w-9 h-12 object-cover rounded-md shadow-sm border border-slate-200 flex-shrink-0 bg-slate-100">
                        <div class="min-w-0 max-w-xs">
                          <h4 class="font-bold text-xs sm:text-sm text-slate-800 truncate">${this.escapeHtml(b.title)}</h4>
                          <p class="text-[11px] text-slate-500 truncate">${this.escapeHtml(b.author || 'Penerbit')}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-3">
                      <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px] uppercase">${this.escapeHtml(b.category)}</span>
                    </td>
                    <td class="py-3 px-3 font-mono font-bold text-amber-600">+${b.points} XP</td>
                    <td class="py-3 px-3">
                      ${!isSyn ? `
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <i data-lucide="check-circle" class="w-3 h-3 text-emerald-600"></i> PDF Asli (${this.escapeHtml(b.fileSize || 'Tersimpan')})
                        </span>
                      ` : `
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                          <i data-lucide="alert-triangle" class="w-3 h-3 text-amber-600"></i> Draf Sementara (Perlu File Asli)
                        </span>
                      `}
                    </td>
                    <td class="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button onclick="app.promptReplacePdf('${b.id}')" class="py-1 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition" title="Unggah / Ganti Berkas PDF Asli">
                        <i data-lucide="file-up" class="w-3 h-3 inline mr-1"></i> Unggah PDF Asli
                      </button>
                      <button onclick="app.openBookReader('${b.id}')" class="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200" title="Buka Pembaca">
                        <i data-lucide="book-open" class="w-3.5 h-3.5 inline"></i>
                      </button>
                      <button onclick="app.deleteBook('${b.id}')" class="py-1 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs border border-rose-200" title="Hapus Buku">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ALL STUDENTS RANKING TABLE (20 LEVELS SUPPORT) -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <h3 class="text-base font-bold font-display text-slate-800 flex items-center gap-2">
            <i data-lucide="award" class="w-4 h-4 text-brand-600"></i> Daftar Siswa & Pangkat Literasi (20 Level)
          </h3>
          <input type="text" id="admin-search-student" oninput="app.filterAdminStudentsTable()" placeholder="Cari nama siswa..." class="px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none w-48">
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs" id="table-admin-students">
            <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th class="py-2.5 px-3">Rank</th>
                <th class="py-2.5 px-3">Siswa</th>
                <th class="py-2.5 px-3">Kelas</th>
                <th class="py-2.5 px-3">Pangkat (Level 1-20)</th>
                <th class="py-2.5 px-3 font-mono">Poin XP</th>
                <th class="py-2.5 px-3 text-right">Koreksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${approvedStudents.map((st, idx) => {
                const rank = getRankInfo(st.points || 0);
                return `
                  <tr class="hover:bg-slate-50 student-row" data-name="${this.escapeHtml(st.fullname).toLowerCase()}">
                    <td class="py-3 px-3 font-bold text-slate-700">#${idx + 1}</td>
                    <td class="py-3 px-3 font-bold text-slate-800 flex items-center gap-2">
                      ${this.renderUserAvatar(st, 'w-6 h-6', 'text-[10px]')}
                      <span>${this.escapeHtml(st.fullname)}</span>
                    </td>
                    <td class="py-3 px-3 text-slate-600">${this.escapeHtml(st.grade)}</td>
                    <td class="py-3 px-3">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${rank.badge}">
                        <i data-lucide="${rank.icon}" class="w-3 h-3"></i> Lv.${rank.level} - ${rank.title}
                      </span>
                    </td>
                    <td class="py-3 px-3 font-mono font-bold text-indigo-600">${st.points || 0} XP</td>
                    <td class="py-3 px-3 text-right">
                      <button onclick="app.adminEditStudentPoints('${st.id}', ${st.points || 0})" class="p-1 rounded-lg border border-slate-200 hover:bg-indigo-50 text-indigo-600" title="Koreksi Poin">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    lucide.createIcons();
  },

  // ---------------- VIEW 3: STUDENT DASHBOARD (MOBILE-FRIENDLY & GAMIFIED) ----------------
  async renderStudentDashboard(container) {
    const student = this.currentUser;
    const books = await DB.getAll('books');
    const allUsers = await DB.getAll('users');
    const allSubmissions = await DB.getAll('submissions');
    const comps = await DB.getAll('competitions');
    const activeComp = comps.find(c => c.status === 'active') || comps[0];

    const mySubmissions = allSubmissions.filter(s => s.studentId === student.id);
    const rankInfo = getRankInfo(student.points || 0);

    const approvedStudents = allUsers.filter(u => u.status === 'approved' && u.role === 'student');
    approvedStudents.sort((a, b) => (b.points || 0) - (a.points || 0));
    const myRankPosition = approvedStudents.findIndex(u => u.id === student.id) + 1;

    container.innerHTML = `
      <!-- Student ID Card (With Custom Profile Photo Support) -->
      <div class="relative bg-gradient-to-br from-brand-600 via-indigo-600 to-indigo-900 text-white rounded-3xl p-5 sm:p-7 mb-6 shadow-xl overflow-hidden">
        <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div class="flex items-center gap-4 text-center sm:text-left">
            <div class="relative flex-shrink-0">
              ${this.renderUserAvatar(student, 'w-20 h-20 sm:w-22 sm:h-22', 'text-3xl')}
              <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-[11px] shadow border border-white">
                Lv.${rankInfo.level}
              </div>
            </div>

            <div>
              <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${rankInfo.badge} mb-1.5 shadow-sm">
                <i data-lucide="${rankInfo.icon}" class="w-3 h-3"></i>
                <span>Tingkat ${rankInfo.level}: ${rankInfo.title}</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-bold font-display leading-tight">${this.escapeHtml(student.fullname)}</h2>
              <p class="text-indigo-100 text-xs mt-0.5">${this.escapeHtml(student.grade)} • ${this.escapeHtml(student.school || 'SDN')}</p>
              <p class="text-indigo-200 text-[11px] mt-1 italic">"${this.escapeHtml(student.bio || 'Buku adalah jendela duniaku!')}"</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="app.openEditProfileModal()" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1">
              <i data-lucide="camera" class="w-3.5 h-3.5 text-amber-300"></i> Ubah Foto Profil
            </button>
            <div class="bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center">
              <span class="text-[9px] uppercase font-bold text-indigo-200 block">Peringkat</span>
              <span class="text-base font-bold font-mono text-amber-300">#${myRankPosition || 1}</span>
            </div>
          </div>
        </div>

        <!-- 20-Level Long-Term XP Progress Bar -->
        <div class="mt-5 pt-4 border-t border-white/15">
          <div class="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span class="flex items-center gap-1 text-amber-300 text-[11px]">
              <i data-lucide="zap" class="w-3.5 h-3.5"></i> Kemajuan XP Menuju Tingkat ${rankInfo.level + 1}
            </span>
            <span class="text-[11px] text-slate-200 font-mono">
              ${rankInfo.nextRank ? `<strong class="text-amber-300">${rankInfo.xpForNext} XP</strong> lagi untuk <strong class="underline">${rankInfo.nextRank.title}</strong>` : 'Tingkat Legenda Abadi!'}
            </span>
          </div>
          <div class="w-full h-3 rounded-full bg-black/30 overflow-hidden p-0.5">
            <div class="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 transition-all duration-700 shadow relative progress-shimmer" style="width: ${rankInfo.progressPercent}%"></div>
          </div>
          <div class="flex justify-between items-center text-[10px] text-indigo-200 mt-1 font-mono">
            <span>${student.points || 0} XP Terkumpul</span>
            <span>Target Level: ${rankInfo.nextRank ? rankInfo.nextRank.minXp : rankInfo.minXp} XP</span>
          </div>
        </div>
      </div>

      <!-- BANNER LOMBA HADIAH 6 BULAN (KHUSUS SISWA) -->
      ${activeComp ? `
        <div class="mb-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-amber-950 rounded-3xl p-4 sm:p-6 shadow-md border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/80 text-amber-600 flex items-center justify-center flex-shrink-0 animate-wiggle shadow-sm">
              <i data-lucide="gift" class="w-6 h-6"></i>
            </div>
            <div>
              <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-900 text-white">🏆 Tantangan Hadiah 6 Bulan</span>
              <h4 class="font-bold text-sm sm:text-base font-display mt-0.5">${this.escapeHtml(activeComp.title)}</h4>
              <p class="text-xs text-amber-900 line-clamp-1">Posisi kamu saat ini: <strong>#${myRankPosition}</strong> (${myRankPosition <= 3 ? 'Kandidat Juara Reward! 🎉' : 'Ayo baca terus untuk masuk 3 Besar!'})</p>
            </div>
          </div>
          <button onclick="app.openViewRewardModal()" class="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow hover:bg-slate-800 transition flex items-center justify-center gap-1.5 flex-shrink-0">
            <i data-lucide="trophy" class="w-3.5 h-3.5 text-amber-400"></i> Rincian Hadiah
          </button>
        </div>
      ` : ''}

      <!-- Quick Action Mobile Button: Kirim Bukti Membaca -->
      <div class="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-4 sm:p-6 mb-6 shadow-md flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <i data-lucide="camera" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="font-bold font-display text-sm sm:text-base">Sudah Selesai Membaca Hari Ini?</h3>
            <p class="text-[11px] text-amber-100">Upload foto membaca atau video orang tua untuk tambah poin XP!</p>
          </div>
        </div>
        <button onclick="app.openSubmitProofModal()" class="px-4 py-2.5 rounded-2xl bg-white text-amber-900 hover:bg-amber-50 font-extrabold text-xs shadow transition flex-shrink-0 flex items-center gap-1.5">
          <i data-lucide="upload" class="w-4 h-4 text-amber-600"></i> Kirim Bukti
        </button>
      </div>

      <!-- Grid Content: Library & Submissions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Left: Digital Library Catalog Preview -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base sm:text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-brand-600"></i> E-Book PDF Siap Dibaca
            </h3>
            <button onclick="app.navigate('library')" class="text-xs font-bold text-brand-600 hover:underline">
              Katalog Lengkap →
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${books.slice(0, 4).map(b => `
              <div class="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 hover:border-brand-300 transition flex gap-3 shadow-sm">
                <img src="${b.coverImage}" class="w-16 h-22 object-cover rounded-xl shadow-sm flex-shrink-0">
                <div class="flex flex-col justify-between overflow-hidden">
                  <div>
                    <span class="text-[9px] uppercase font-bold text-indigo-600">${this.escapeHtml(b.category)}</span>
                    <h4 class="font-bold text-xs sm:text-sm text-slate-800 truncate">${this.escapeHtml(b.title)}</h4>
                    <p class="text-[11px] text-slate-500 truncate">${this.escapeHtml(b.author)}</p>
                  </div>
                  <div class="flex items-center gap-2 pt-1">
                    <button onclick="app.openBookReader('${b.id}')" class="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1">
                      <i data-lucide="book-open" class="w-3 h-3"></i> Baca PDF
                    </button>
                    <span class="text-xs font-bold font-mono text-amber-600">+${b.points} XP</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Status Bukti Membaca Saya -->
        <div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
          <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
            <h3 class="font-bold font-display text-slate-800 text-sm flex items-center gap-1.5">
              <i data-lucide="history" class="w-4 h-4 text-amber-500"></i> Riwayat Laporan Baca
            </h3>
            <span class="text-[11px] text-slate-400">${mySubmissions.length} Laporan</span>
          </div>

          ${mySubmissions.length === 0 ? `
            <div class="text-center py-8 text-slate-400 text-xs">
              <p>Belum ada bukti membaca yang dikirim.</p>
              <button onclick="app.openSubmitProofModal()" class="mt-2 text-xs text-brand-600 font-bold hover:underline">
                Kirim Bukti Pertama Kamu!
              </button>
            </div>
          ` : `
            <div class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              ${mySubmissions.map(sub => `
                <div class="p-2.5 rounded-xl border ${sub.status === 'approved' ? 'border-emerald-200 bg-emerald-50/40' : (sub.status === 'rejected' ? 'border-rose-200 bg-rose-50/40' : 'border-amber-200 bg-amber-50/40')}">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-xs text-slate-800 truncate max-w-[150px]">${this.escapeHtml(sub.bookTitle)}</span>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : (sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')}">
                      ${sub.status === 'approved' ? '✓ Disetujui' : (sub.status === 'rejected' ? '✗ Ditolak' : '⏳ Menunggu')}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-[10px] text-slate-500">
                    <span>${sub.type === 'video' ? '📹 Video Ortu' : '📷 Foto Siswa'}</span>
                    <span class="font-bold font-mono text-amber-600">+${sub.pointsReward} XP</span>
                  </div>
                  ${sub.verifiedReadingTime ? `
                    <div class="text-[9px] text-emerald-700 mt-1 flex items-center gap-1">
                      <i data-lucide="check" class="w-3 h-3"></i> Waktu Baca: ${this.escapeHtml(sub.verifiedReadingTime)}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ---------------- VIEW 4: DIGITAL LIBRARY FULL CATALOG ----------------
  async renderDigitalLibraryView(container) {
    const books = await DB.getAll('books');

    container.innerHTML = `
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold font-display text-slate-800 flex items-center gap-2">
              <i data-lucide="book-open" class="w-6 h-6 text-indigo-600"></i> Perpustakaan Digital Petualang
            </h1>
            <p class="text-xs sm:text-sm text-slate-500">Pilih e-book untuk membaca file PDF aslinya langsung di browser!</p>
          </div>
          
          <div class="flex items-center gap-2">
            <input type="text" id="library-search-input" oninput="app.filterLibraryCatalog()" placeholder="Cari judul buku atau penulis..." 
              class="px-3.5 py-2 rounded-xl border border-slate-300 text-xs w-full sm:w-60 outline-none focus:ring-2 focus:ring-indigo-500">
            ${this.isAdminLoggedIn ? `
              <button onclick="app.openUploadBookModal()" class="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex-shrink-0 flex items-center gap-1">
                <i data-lucide="plus" class="w-4 h-4"></i> Upload PDF
              </button>
            ` : ''}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-5" id="library-category-filters">
          <button onclick="app.filterLibraryCategory('all')" class="category-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm" data-cat="all">
            Semua (${books.length})
          </button>
          <button onclick="app.filterLibraryCategory('Petualangan')" class="category-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-white border border-slate-200 text-slate-600" data-cat="Petualangan">
            Petualangan
          </button>
          <button onclick="app.filterLibraryCategory('Fabel')" class="category-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-white border border-slate-200 text-slate-600" data-cat="Fabel">
            Fabel
          </button>
          <button onclick="app.filterLibraryCategory('Sains')" class="category-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-white border border-slate-200 text-slate-600" data-cat="Sains">
            Sains
          </button>
          <button onclick="app.filterLibraryCategory('Moral')" class="category-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-white border border-slate-200 text-slate-600" data-cat="Moral">
            Budi Pekerti
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6" id="library-books-grid">
          ${books.map(b => `
            <div class="book-item-card" data-category="${this.escapeHtml(b.category)}" data-title="${this.escapeHtml(b.title).toLowerCase()}" data-author="${this.escapeHtml(b.author).toLowerCase()}">
              ${this.renderBookCard(b)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  filterLibraryCategory(cat) {
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-cat') === cat) {
        btn.className = 'category-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
      } else {
        btn.className = 'category-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-white border border-slate-200 text-slate-600';
      }
    });

    const items = document.querySelectorAll('.book-item-card');
    items.forEach(card => {
      const itemCat = card.getAttribute('data-category');
      if (cat === 'all' || itemCat === cat) card.style.display = '';
      else card.style.display = 'none';
    });
  },

  filterLibraryCatalog() {
    const q = (document.getElementById('library-search-input').value || '').toLowerCase();
    const items = document.querySelectorAll('.book-item-card');
    items.forEach(card => {
      const title = card.getAttribute('data-title');
      const author = card.getAttribute('data-author');
      if (title.includes(q) || author.includes(q)) card.style.display = '';
      else card.style.display = 'none';
    });
  },

  // ---------------- VIEW 5: LOMBA & REWARD 6 BULAN (HALL OF FAME & RANKING) ----------------
  async renderCompetitionsView(container) {
    const comps = await DB.getAll('competitions');
    const hofs = await DB.getAll('hallOfFame');
    const users = await DB.getAll('users');
    const activeComp = comps.find(c => c.status === 'active') || comps[0];

    const approvedStudents = users.filter(u => u.status === 'approved' && u.role === 'student');
    approvedStudents.sort((a, b) => (b.points || 0) - (a.points || 0));

    container.innerHTML = `
      <div class="max-w-4xl mx-auto mb-12">
        <div class="text-center mb-6">
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
            <i data-lucide="trophy" class="w-4 h-4 text-amber-500"></i> Lomba & Reward Periode 6 Bulan
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold font-display text-slate-800">Tangga Juara & Hadiah Spesial</h1>
          <p class="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1">
            Setiap 6 bulan sekali, 3 besar pembaca teratas akan mendapatkan reward istimewa dari Kepala Sekolah!
          </p>
        </div>

        ${activeComp ? `
          <div class="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-300 text-amber-950 rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-amber-300 mb-8">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <span class="px-3 py-1 rounded-full bg-amber-900 text-white font-bold text-[10px] uppercase">
                  Sedang Berlangsung (6 Bulan)
                </span>
                <h2 class="text-xl sm:text-2xl font-bold font-display mt-2">${this.escapeHtml(activeComp.title)}</h2>
                <p class="text-xs text-amber-900 mt-1">${this.escapeHtml(activeComp.desc)}</p>
              </div>
              <div class="bg-white/80 backdrop-blur-sm p-3 rounded-2xl text-center border border-amber-200">
                <span class="text-[9px] uppercase font-bold text-amber-900 block">Batas Penutupan</span>
                <span class="text-sm font-bold font-mono text-amber-950">${activeComp.endDate}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="bg-white/90 rounded-2xl p-4 text-center border border-amber-200 shadow-sm">
                <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 font-bold text-lg">🥇</div>
                <h4 class="font-bold text-xs uppercase text-amber-900">Juara 1 (Emas)</h4>
                <p class="text-xs text-slate-700 mt-1 font-medium">${this.escapeHtml(activeComp.reward1)}</p>
              </div>
              <div class="bg-white/90 rounded-2xl p-4 text-center border border-slate-200 shadow-sm">
                <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-2 font-bold text-lg">🥈</div>
                <h4 class="font-bold text-xs uppercase text-slate-700">Juara 2 (Perak)</h4>
                <p class="text-xs text-slate-700 mt-1 font-medium">${this.escapeHtml(activeComp.reward2)}</p>
              </div>
              <div class="bg-white/90 rounded-2xl p-4 text-center border border-amber-200 shadow-sm">
                <div class="w-10 h-10 rounded-full bg-orange-100 text-amber-800 flex items-center justify-center mx-auto mb-2 font-bold text-lg">🥉</div>
                <h4 class="font-bold text-xs uppercase text-amber-800">Juara 3 (Perunggu)</h4>
                <p class="text-xs text-slate-700 mt-1 font-medium">${this.escapeHtml(activeComp.reward3)}</p>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 3 Besar Podium Live -->
        <div class="mb-8">
          <h3 class="text-base sm:text-lg font-bold font-display text-slate-800 mb-3 text-center">
            Podium Sementara Kandidat Juara Hadiah 6 Bulan
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 items-end">
            ${this.renderTopThreePodium(approvedStudents.slice(0, 3))}
          </div>
        </div>

        <!-- Full Ranking List -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-10">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold font-display text-slate-800 text-sm">Klasemen Peringkat Siswa</h3>
            <span class="text-xs text-slate-400 font-medium">${approvedStudents.length} Siswa Aktif</span>
          </div>

          <div class="divide-y divide-slate-100">
            ${approvedStudents.map((st, idx) => {
              const rank = getRankInfo(st.points || 0);
              const isMe = this.currentUser && this.currentUser.id === st.id;
              return `
                <div class="p-3 sm:px-5 flex items-center justify-between hover:bg-slate-50 ${isMe ? 'bg-amber-50/60 border-l-4 border-amber-500' : ''}">
                  <div class="flex items-center gap-3">
                    <span class="font-mono font-bold text-xs sm:text-sm w-6 text-center ${idx < 3 ? 'text-amber-600' : 'text-slate-400'}">
                      #${idx + 1}
                    </span>
                    ${this.renderUserAvatar(st, 'w-8 h-8', 'text-xs')}
                    <div>
                      <div class="flex items-center gap-1.5">
                        <h4 class="font-bold text-xs sm:text-sm text-slate-800">${this.escapeHtml(st.fullname)}</h4>
                        ${isMe ? '<span class="text-[9px] bg-amber-400 text-amber-950 px-1 py-0.2 rounded font-bold">Kamu</span>' : ''}
                      </div>
                      <p class="text-[10px] text-slate-500">${this.escapeHtml(st.grade)}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 sm:gap-3">
                    <span class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${rank.badge}">
                      <i data-lucide="${rank.icon}" class="w-3 h-3"></i> Lv.${rank.level}
                    </span>
                    <span class="font-mono font-bold text-brand-600 text-xs sm:text-sm">${st.points || 0} XP</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // ---------------- BOOK UPLOAD & PDF STORAGE ----------------
  initPalettePicker() {
    const container = document.getElementById('palette-picker');
    if (!container) return;

    container.innerHTML = COVER_PALETTES.map((p, idx) => `
      <button type="button" onclick="app.selectCoverPalette(${idx})" 
        class="w-6 h-6 rounded-full border-2 transition ${this.selectedPaletteIndex === idx ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-white shadow-sm'}"
        style="background: linear-gradient(135deg, ${p.grad[0]}, ${p.grad[1]})">
      </button>
    `).join('');
  },

  selectCoverPalette(idx) {
    this.selectedPaletteIndex = idx;
    this.initPalettePicker();
    this.liveUpdateBookCover();
  },

  regenerateCoverTheme() {
    this.selectedPaletteIndex = (this.selectedPaletteIndex + 1) % COVER_PALETTES.length;
    this.initPalettePicker();
    this.liveUpdateBookCover();
  },

  liveUpdateBookCover() {
    const canvas = document.getElementById('cover-canvas');
    if (!canvas) return;

    const title = document.getElementById('book-title').value.trim() || 'Judul Buku Hebat';
    const author = document.getElementById('book-author').value.trim() || 'Nama Penulis';
    const category = document.getElementById('book-category').value;
    const points = parseInt(document.getElementById('book-points').value, 10) || 35;
    const iconChoice = document.getElementById('cover-icon-select').value;

    CoverGenerator.renderToCanvas(canvas, title, author, category, points, this.selectedPaletteIndex, iconChoice);
  },

  handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    this.selectedBookFile = file;

    const previewDrop = document.getElementById('file-drop-preview');
    const previewInfo = document.getElementById('file-selected-info');
    const nameDisplay = document.getElementById('file-name-display');
    const sizeDisplay = document.getElementById('file-size-display');
    const pointsInput = document.getElementById('book-points');
    const titleInput = document.getElementById('book-title');

    if (!titleInput.value) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      titleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    nameDisplay.textContent = file.name;
    sizeDisplay.textContent = `${sizeInMb} MB`;

    previewDrop.classList.add('hidden');
    previewInfo.classList.remove('hidden');
    previewInfo.classList.add('flex');

    let calculatedPoints = 35;
    if (file.size > 25 * 1024 * 1024) calculatedPoints = 75;
    else if (file.size > 10 * 1024 * 1024) calculatedPoints = 55;
    else if (file.size > 3 * 1024 * 1024) calculatedPoints = 40;
    else calculatedPoints = 30;

    pointsInput.value = calculatedPoints;
    this.liveUpdateBookCover();
    this.showToast(`Berkas PDF "${file.name}" siap diunggah! Poin otomatis: +${calculatedPoints} XP`, 'info');
  },

  handleCustomCoverUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      this.uploadedCustomCover = event.target.result;
      const canvas = document.getElementById('cover-canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = event.target.result;
      this.showToast('Cover kustom dimuat!', 'success');
    };
    reader.readAsDataURL(file);
  },

  openUploadBookModal() {
    this.uploadedCustomCover = null;
    this.selectedBookFile = null;
    document.getElementById('form-upload-book').reset();
    document.getElementById('file-drop-preview').classList.remove('hidden');
    document.getElementById('file-selected-info').classList.add('hidden');
    document.getElementById('file-selected-info').classList.remove('flex');

    this.liveUpdateBookCover();
    this.openModal('modal-upload-book');
  },

  // Upload buku ke server bersama agar buku tampil pada perangkat siswa juga.
  async handleBookUpload(e) {
    e.preventDefault();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim() || 'Penerbit Literasi';
    const category = document.getElementById('book-category').value;
    const points = parseInt(document.getElementById('book-points').value, 10) || 35;
    const iconChoice = document.getElementById('cover-icon-select').value;
    const fileInput = document.getElementById('book-file');
    const file = this.selectedBookFile || (fileInput && fileInput.files ? fileInput.files[0] : null);
    if (location.protocol === 'file:') {
      this.showToast('Aplikasi harus dijalankan melalui server (npm start), bukan dengan membuka index.html langsung.', 'error');
      return;
    }
    if (file && file.size > 100 * 1024 * 1024) {
      this.showToast('Ukuran PDF maksimal 100 MB.', 'error'); return;
    }
    if (file && file.type && file.type !== 'application/pdf') {
      this.showToast('Silakan pilih file PDF yang valid.', 'error'); return;
    }
    const submitBtn = document.querySelector('#form-upload-book button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Menyimpan buku...'; }
    try {
      let coverImage = this.uploadedCustomCover;
      if (!coverImage) coverImage = document.getElementById('cover-canvas').toDataURL('image/jpeg', 0.85);
      const book = {
        id: 'book_' + Date.now(), title, author, category, points,
        fileName: file ? file.name : `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'PDF otomatis',
        coverImage, pdfData: file ? null : PdfSynthesizer.createMultiPagePdf(title, author, category, points),
        isSynthetic: !file, paletteIndex: this.selectedPaletteIndex, icon: iconChoice,
        readsCount: 0, createdAt: new Date().toISOString()
      };
      const form = new FormData();
      form.append('book', JSON.stringify(book));
      if (file) form.append('pdf', file, file.name);
      const response = await fetch('/api/books/upload', { method: 'POST', body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Server gagal menyimpan buku.');
      this.selectedBookFile = null;
      SoundFx.playSuccess();
      this.closeModal('modal-upload-book');
      this.showToast(`E-Book "${title}" berhasil disimpan dan dipublikasikan untuk siswa.`, 'success');
      if (this.currentView === 'admin') await this.renderAdminDashboard(document.getElementById('main-content'));
      else await this.navigate('library');
    } catch (err) {
      console.error('Upload buku gagal:', err);
      this.showToast(`Buku gagal disimpan: ${err.message}`, 'error');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Publikasikan E-Book'; if (window.lucide) lucide.createIcons(); }
    }
  },

  // ---------------- BOOK PDF MANAGEMENT & REPLACEMENT ----------------
  isBookSynthetic(book) {
    if (!book) return false;
    if (book.isSynthetic === true) return true;
    if (book.isSynthetic === false) return false;
    if (!book.pdfData) return true;
    try {
      if (typeof book.pdfData === 'string' && book.pdfData.startsWith('data:application/pdf;base64,')) {
        const sample = atob(book.pdfData.slice(28, 450));
        if (sample.includes('PETUALANGAN LITERASI DIGITAL') || sample.includes('PdfSynthesizer') || sample.includes('Kak Dwi Pustaka')) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  },

  updateSyntheticWarningBanner(book) {
    const banner = document.getElementById('reader-synthetic-banner');
    if (!banner) return;

    const isSynthetic = this.isBookSynthetic(book);
    if (isSynthetic) {
      banner.classList.remove('hidden');
      banner.classList.add('flex');
    } else {
      banner.classList.add('hidden');
      banner.classList.remove('flex');
    }
  },

  promptReplacePdf(bookId) {
    if (!bookId && this.activeReaderBook) {
      bookId = this.activeReaderBook.id;
    }
    if (!bookId) return;

    this.activeBookForPdfReplacement = bookId;
    const input = document.getElementById('replace-pdf-input');
    if (input) {
      input.value = '';
      input.click();
    }
  },

  async handleReplacePdfSelected(e) {
    const file = e.target.files[0];
    if (!file || !this.activeBookForPdfReplacement) return;

    const book = await DB.get('books', this.activeBookForPdfReplacement);
    if (!book) return;

    this.showToast(`Sedang memuat berkas PDF asli "${file.name}"...`, 'info');

    try {
      const pdfData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      book.pdfData = pdfData;
      book.fileName = file.name;
      book.fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      book.isSynthetic = false;

      await DB.put('books', book);

      SoundFx.playSuccess();
      try { confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } }); } catch (err) {}

      this.showToast(`Berhasil! Dokumen PDF asli "${file.name}" telah disimpan ke buku "${book.title}".`, 'success');

      // If reader is open for this book, reload viewer instantly!
      const readerModal = document.getElementById('modal-book-reader');
      if (readerModal && !readerModal.classList.contains('hidden') && this.activeReaderBook && this.activeReaderBook.id === book.id) {
        this.activeReaderBook = book;
        this.updateSyntheticWarningBanner(book);
        this.loadPdfDocument(pdfData);
      }

      // Re-render views
      if (this.currentView === 'admin') {
        this.renderAdminDashboard(document.getElementById('main-content'));
      } else if (this.currentView === 'library') {
        this.renderLibrary(document.getElementById('main-content'));
      }
    } catch (err) {
      console.error('Error replacing PDF', err);
      this.showToast('Gagal memuat berkas PDF. Pastikan file valid.', 'error');
    }
  },

  async deleteBook(bookId) {
    const book = await DB.get('books', bookId);
    if (!book) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}" dari perpustakaan digital?`)) {
      return;
    }

    await DB.delete('books', bookId);
    SoundFx.playWarning();
    this.showToast(`Buku "${book.title}" telah dihapus.`, 'info');

    if (this.currentView === 'admin') {
      this.renderAdminDashboard(document.getElementById('main-content'));
    } else if (this.currentView === 'library') {
      this.renderLibrary(document.getElementById('main-content'));
    }
  },

  cleanupBlobUrl() {
    if (this.currentBlobUrl) {
      try {
        URL.revokeObjectURL(this.currentBlobUrl);
      } catch (e) {}
      this.currentBlobUrl = null;
    }
  },

  dataUrlToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  },

  // ---------------- BOOK READER & VIEWER WITH REAL PDF & ANTI-CHEAT ----------------
  async openBookReader(bookId) {
    const book = await DB.get('books', bookId);
    if (!book) return;

    this.activeReaderBook = book;
    document.getElementById('reader-book-title').textContent = book.title;
    document.getElementById('reader-book-author').textContent = `${book.author} • +${book.points} XP`;

    // Ensure book has PDF data
    if (!book.pdfData) {
      book.pdfData = PdfSynthesizer.createMultiPagePdf(book.title, book.author, book.category, book.points);
      book.isSynthetic = true;
      await DB.put('books', book);
    }

    this.updateSyntheticWarningBanner(book);
    this.openModal('modal-book-reader');
    lucide.createIcons();

    // 1. Initialize Anti-Kecurangan Timer
    this.initAntiCheatSystem(book);

    // 2. Load and render PDF
    this.loadPdfDocument(book.pdfData);
  },

  async loadPdfDocument(pdfDataUrl) {
    const spinner = document.getElementById('pdf-loading-spinner');
    const canvasContainer = document.getElementById('pdf-canvas-container');
    const nativeIframe = document.getElementById('pdf-native-iframe');
    const storyContainer = document.getElementById('reader-story-container');

    spinner.classList.remove('hidden');
    canvasContainer.classList.add('hidden');
    canvasContainer.classList.remove('flex');
    nativeIframe.classList.add('hidden');
    storyContainer.classList.add('hidden');

    this.cleanupBlobUrl();

    let targetUrl = pdfDataUrl;
    if (typeof pdfDataUrl === 'string' && pdfDataUrl.startsWith('data:application/pdf;base64,')) {
      try {
        const blob = this.dataUrlToBlob(pdfDataUrl);
        targetUrl = URL.createObjectURL(blob);
        this.currentBlobUrl = targetUrl;
      } catch (e) {
        console.warn('Blob conversion fallback', e);
      }
    }

    // Default to native iframe viewer: flawless rendering of original book layout, vector graphics & photos!
    nativeIframe.src = targetUrl;
    spinner.classList.add('hidden');
    nativeIframe.classList.remove('hidden');
    this.pdfCurrentMode = 'iframe';
    const label = document.getElementById('toggle-pdf-view-label');
    if (label) label.textContent = 'Alihkan ke Kanvas PDF.js';
  },

  async renderPdfPage(num) {
    if (!this.pdfDoc) return;
    this.pdfRendering = true;

    try {
      const page = await this.pdfDoc.getPage(num);
      const canvas = document.getElementById('pdf-render-canvas');
      const ctx = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: this.pdfScale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      this.pdfRendering = false;

      document.getElementById('pdf-current-page').textContent = num;
      document.getElementById('btn-pdf-prev').disabled = num <= 1;
      document.getElementById('btn-pdf-next').disabled = num >= this.pdfTotalPages;

      if (this.pdfPendingPage !== null) {
        this.renderPdfPage(this.pdfPendingPage);
        this.pdfPendingPage = null;
      }
    } catch (e) {
      console.error('Error rendering PDF page', e);
      this.pdfRendering = false;
    }
  },

  changePdfPage(delta) {
    if (!this.pdfDoc) return;
    const targetPage = this.pdfPageNum + delta;
    if (targetPage < 1 || targetPage > this.pdfTotalPages) return;

    this.pdfPageNum = targetPage;
    this.lastUserActivity = Date.now();

    if (this.pdfRendering) {
      this.pdfPendingPage = targetPage;
    } else {
      this.renderPdfPage(targetPage);
    }
  },

  zoomPdf(delta) {
    this.pdfScale = Math.max(0.6, Math.min(2.5, this.pdfScale + delta));
    document.getElementById('pdf-zoom-text').textContent = `${Math.round(this.pdfScale * 100)}%`;
    if (this.pdfDoc) {
      this.renderPdfPage(this.pdfPageNum);
    }
  },

  togglePdfViewMode() {
    const canvasContainer = document.getElementById('pdf-canvas-container');
    const nativeIframe = document.getElementById('pdf-native-iframe');
    const label = document.getElementById('toggle-pdf-view-label');
    const pdfSource = this.currentBlobUrl || (this.activeReaderBook ? this.activeReaderBook.pdfData : null);

    if (this.pdfCurrentMode === 'iframe') {
      nativeIframe.classList.add('hidden');
      canvasContainer.classList.remove('hidden');
      canvasContainer.classList.add('flex');
      this.pdfCurrentMode = 'canvas';
      if (label) label.textContent = 'Buka di Penampil Bawaan';

      if (!this.pdfDoc && pdfSource && window.pdfjsLib) {
        let loadingTask;
        if (typeof pdfSource === 'string' && pdfSource.startsWith('data:application/pdf;base64,')) {
          const base64 = pdfSource.replace('data:application/pdf;base64,', '');
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes, disableWorker: true });
        } else {
          loadingTask = pdfjsLib.getDocument({ url: pdfSource, disableWorker: true });
        }

        loadingTask.promise.then(pdf => {
          this.pdfDoc = pdf;
          this.pdfTotalPages = pdf.numPages;
          this.pdfPageNum = 1;
          document.getElementById('pdf-total-pages').textContent = this.pdfTotalPages;
          document.getElementById('pdf-current-page').textContent = this.pdfPageNum;
          this.renderPdfPage(1);
        }).catch(err => {
          console.warn('PDF.js rendering fallback to iframe', err);
          this.togglePdfViewMode();
        });
      } else if (this.pdfDoc) {
        this.renderPdfPage(this.pdfPageNum);
      }
    } else {
      canvasContainer.classList.add('hidden');
      canvasContainer.classList.remove('flex');
      nativeIframe.classList.remove('hidden');
      this.pdfCurrentMode = 'iframe';
      if (label) label.textContent = 'Alihkan ke Kanvas PDF.js';
      if (pdfSource) nativeIframe.src = pdfSource;
    }
  },

  openPdfInNewTab() {
    const url = this.currentBlobUrl || (this.activeReaderBook ? this.activeReaderBook.pdfData : null);
    if (!url) return;
    window.open(url, '_blank');
  },

  // ---------------- ANTI-KECURANGAN (ANTI-CHEAT READING PROTECTION) ----------------
  setupAntiCheatGlobalListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseReadingTimer('Kamu berpindah tab!');
      } else {
        this.resumeReadingTimer();
      }
    });

    window.addEventListener('blur', () => {
      this.pauseReadingTimer('Fokus jendela membaca terputus!');
    });

    window.addEventListener('focus', () => {
      this.resumeReadingTimer();
    });

    ['mousemove', 'keydown', 'touchstart', 'click'].forEach(evt => {
      window.addEventListener(evt, () => {
        this.lastUserActivity = Date.now();
      }, { passive: true });
    });
  },

  initAntiCheatSystem(book) {
    clearInterval(this.readingTimerInterval);

    // Target minimum reading seconds: proportional to points, min 45s, max 120s
    this.readingTargetSeconds = Math.max(45, Math.min(120, (book.points || 35) * 2));
    this.readingElapsedSeconds = 0;
    this.isReadingFocused = true;
    this.lastScrollTop = 0;
    this.lastScrollTimestamp = Date.now();
    this.lastUserActivity = Date.now();

    const submitBtn = document.getElementById('btn-reader-submit');
    const submitText = document.getElementById('btn-reader-submit-text');
    const lockBadge = document.getElementById('reader-lock-badge');
    const statusLabel = document.getElementById('reader-status-label');
    const pulseDot = document.getElementById('reader-pulse-dot');
    const warningBanner = document.getElementById('reader-cheat-warning');

    warningBanner.classList.add('hidden');
    warningBanner.classList.remove('flex');
    submitBtn.disabled = true;
    submitBtn.className = 'px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed';
    submitText.textContent = `Baca Min. ${Math.ceil(this.readingTargetSeconds / 60)} Menit (Terkunci)`;
    lockBadge.textContent = 'Terkunci 🔒';
    lockBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30';
    statusLabel.textContent = 'Fokus Membaca';
    statusLabel.className = 'text-[10px] uppercase font-bold text-slate-300';
    pulseDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';

    this.updateReadingTimerUI();

    this.readingTimerInterval = setInterval(() => {
      if (!this.isReadingFocused) return;

      if (Date.now() - this.lastUserActivity > 50000) {
        this.pauseReadingTimer('Terdeteksi tidak ada aktivitas membaca. Scroll atau klik halaman untuk melanjutkan!');
        return;
      }

      this.readingElapsedSeconds++;
      this.updateReadingTimerUI();

      if (this.readingElapsedSeconds >= this.readingTargetSeconds && submitBtn.disabled) {
        this.unlockReadingSubmission();
      }
    }, 1000);
  },

  updateReadingTimerUI() {
    const elapsedMin = String(Math.floor(this.readingElapsedSeconds / 60)).padStart(2, '0');
    const elapsedSec = String(this.readingElapsedSeconds % 60).padStart(2, '0');
    const targetMin = String(Math.floor(this.readingTargetSeconds / 60)).padStart(2, '0');
    const targetSec = String(this.readingTargetSeconds % 60).padStart(2, '0');

    document.getElementById('reader-timer-display').textContent = `${elapsedMin}:${elapsedSec} / ${targetMin}:${targetSec}`;
    document.getElementById('reader-active-time-text').textContent = `${this.readingElapsedSeconds} detik aktif membaca`;

    const percent = Math.min(100, Math.round((this.readingElapsedSeconds / this.readingTargetSeconds) * 100));
    document.getElementById('reader-timer-progress').style.width = `${percent}%`;

    if (this.readingElapsedSeconds < this.readingTargetSeconds) {
      const remaining = this.readingTargetSeconds - this.readingElapsedSeconds;
      document.getElementById('btn-reader-submit-text').textContent = `Baca: Sisa ${remaining}d lagi`;
    }
  },

  unlockReadingSubmission() {
    const submitBtn = document.getElementById('btn-reader-submit');
    const submitText = document.getElementById('btn-reader-submit-text');
    const lockBadge = document.getElementById('reader-lock-badge');

    submitBtn.disabled = false;
    submitBtn.className = 'px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/40 animate-bounce cursor-pointer';
    submitText.textContent = `Selesai Baca & Kirim Bukti (+${this.activeReaderBook.points} XP)`;
    lockBadge.textContent = 'Terbuka ✓';
    lockBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';

    SoundFx.playLevelUp();
    this.showToast('Selamat! Waktu membaca tercapai. Tombol bukti membaca telah terbuka!', 'success');
  },

  pauseReadingTimer(reason) {
    if (!this.isReadingFocused) return;
    this.isReadingFocused = false;

    const statusLabel = document.getElementById('reader-status-label');
    const pulseDot = document.getElementById('reader-pulse-dot');
    const warningBanner = document.getElementById('reader-cheat-warning');
    const warningText = document.getElementById('reader-cheat-warning-text');

    if (statusLabel) {
      statusLabel.textContent = 'Timer Dijeda';
      statusLabel.className = 'text-[10px] uppercase font-bold text-rose-300';
    }
    if (pulseDot) {
      pulseDot.className = 'w-2 h-2 rounded-full bg-rose-400';
    }
    if (warningBanner) {
      warningBanner.classList.remove('hidden');
      warningBanner.classList.add('flex');
      warningText.textContent = `⚠️ Timer Dijeda! ${reason}`;
    }
    SoundFx.playWarning();
  },

  resumeReadingTimer() {
    if (this.isReadingFocused) return;
    this.isReadingFocused = true;
    this.lastUserActivity = Date.now();

    const statusLabel = document.getElementById('reader-status-label');
    const pulseDot = document.getElementById('reader-pulse-dot');
    const warningBanner = document.getElementById('reader-cheat-warning');

    if (statusLabel) {
      statusLabel.textContent = 'Fokus Membaca';
      statusLabel.className = 'text-[10px] uppercase font-bold text-slate-300';
    }
    if (pulseDot) {
      pulseDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';
    }
    if (warningBanner) {
      warningBanner.classList.add('hidden');
      warningBanner.classList.remove('flex');
    }
  },

  onReaderScroll(e) {
    this.lastUserActivity = Date.now();
    const currentScroll = e.target.scrollTop;
    const now = Date.now();
    const timeDiff = now - this.lastScrollTimestamp;
    const scrollDiff = Math.abs(currentScroll - this.lastScrollTop);

    if (scrollDiff > 800 && timeDiff < 200) {
      this.pauseReadingTimer('Terdeteksi scroll terlalu cepat! Bacalah buku ini perlahan dan pahami isinya.');
      clearTimeout(this.cheatWarningTimeout);
      this.cheatWarningTimeout = setTimeout(() => {
        this.resumeReadingTimer();
      }, 4000);
    }

    this.lastScrollTop = currentScroll;
    this.lastScrollTimestamp = now;
  },

  closeBookReader() {
    clearInterval(this.readingTimerInterval);
    this.readingTimerInterval = null;
    this.cleanupBlobUrl();
    const nativeIframe = document.getElementById('pdf-native-iframe');
    if (nativeIframe) nativeIframe.src = 'about:blank';
    this.closeModal('modal-book-reader');
  },

  openSubmitProofFromReader() {
    if (this.readingElapsedSeconds < this.readingTargetSeconds) {
      alert(`Sistem Anti-Kecurangan: Kamu harus membaca minimal ${Math.ceil(this.readingTargetSeconds / 60)} menit sebelum dapat mengirim bukti.`);
      return;
    }

    const verifiedSeconds = this.readingElapsedSeconds;
    const verifiedReadingText = `${Math.floor(verifiedSeconds / 60)} menit ${verifiedSeconds % 60} detik (Fokus Penuh Terverifikasi)`;

    this.closeBookReader();

    if (!this.currentUser) {
      this.openModal('modal-student-auth');
      this.showToast('Masuk akun siswa untuk mengirim bukti membaca.', 'info');
      return;
    }
    this.openSubmitProofModal(this.activeReaderBook ? this.activeReaderBook.id : null, verifiedReadingText);
  },

  // ---------------- SUBMIT READING PROOF (STUDENT) ----------------
  async openSubmitProofModal(preselectedBookId = null, verifiedReadingTime = '1 menit 30 detik (Fokus Penuh)') {
    if (!this.currentUser) {
      this.openModal('modal-student-auth');
      this.showToast('Silakan masuk sebagai siswa terlebih dahulu.', 'info');
      return;
    }

    const books = await DB.getAll('books');
    const selectEl = document.getElementById('proof-book-select');
    selectEl.innerHTML = books.map(b => `
      <option value="${b.id}" data-points="${b.points}" ${preselectedBookId === b.id ? 'selected' : ''}>
        ${this.escapeHtml(b.title)} (+${b.points} XP)
      </option>
    `).join('');

    this.toggleProofType('photo');
    this.onProofBookChange();
    this.tempVerifiedReadingTime = verifiedReadingTime;
    this.openModal('modal-submit-proof');
  },

  onProofBookChange() {
    const select = document.getElementById('proof-book-select');
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption) {
      const pts = selectedOption.getAttribute('data-points') || '35';
      document.getElementById('proof-potential-points').textContent = `+${pts} XP`;
    }
  },

  toggleProofType(type) {
    const cardPhoto = document.getElementById('card-type-photo');
    const cardVideo = document.getElementById('card-type-video');
    const fileInput = document.getElementById('proof-media-file');
    const uploadLabel = document.getElementById('proof-upload-label');
    const dropTitle = document.getElementById('proof-drop-title');
    const dropDesc = document.getElementById('proof-drop-desc');
    const iconBox = document.getElementById('proof-icon-box');

    document.getElementById('proof-media-preview-container').classList.add('hidden');
    document.getElementById('proof-drop-preview').classList.remove('hidden');
    fileInput.value = '';

    if (type === 'photo') {
      cardPhoto.classList.add('active');
      cardVideo.classList.remove('active');
      fileInput.accept = 'image/*';
      uploadLabel.innerHTML = 'File Foto Siswa Sedang Membaca <span class="text-rose-500">*</span>';
      dropTitle.textContent = 'Ambil / Upload Foto Siswa Sedang Membaca';
      dropDesc.textContent = 'Bisa langsung gunakan kamera HP atau galeri foto';
      iconBox.innerHTML = '<i data-lucide="camera" class="w-5 h-5"></i>';
    } else {
      cardVideo.classList.add('active');
      cardPhoto.classList.remove('active');
      fileInput.accept = 'video/*';
      uploadLabel.innerHTML = 'File Video Pendek Orang Tua Membacakan Buku <span class="text-rose-500">*</span>';
      dropTitle.textContent = 'Ambil / Upload Video Pendek Orang Tua';
      dropDesc.textContent = 'Format MP4, WEBM, atau rekaman video HP';
      iconBox.innerHTML = '<i data-lucide="video" class="w-5 h-5"></i>';
    }
    lucide.createIcons();
  },

  handleProofFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const previewContainer = document.getElementById('proof-media-preview-container');
    const dropPreview = document.getElementById('proof-drop-preview');
    const imgPreview = document.getElementById('proof-img-preview');
    const videoPreview = document.getElementById('proof-video-preview');
    const nameDisplay = document.getElementById('proof-filename-display');

    dropPreview.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    previewContainer.classList.add('flex');
    nameDisplay.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`;

    if (file.type.startsWith('video')) {
      imgPreview.classList.add('hidden');
      videoPreview.classList.remove('hidden');
      videoPreview.src = URL.createObjectURL(file);
    } else {
      videoPreview.classList.add('hidden');
      imgPreview.classList.remove('hidden');
      const reader = new FileReader();
      reader.onload = (ev) => {
        imgPreview.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  async handleProofSubmit(e) {
    e.preventDefault();
    if (!this.currentUser) return;

    const bookSelect = document.getElementById('proof-book-select');
    const book = await DB.get('books', bookSelect.value);
    if (!book) return;

    const proofType = document.querySelector('input[name="proof_type"]:checked').value;
    const notes = document.getElementById('proof-notes').value.trim();
    const fileInput = document.getElementById('proof-media-file');
    const file = fileInput.files[0];

    if (!file) {
      alert('Pilih file foto membaca atau video orang tua terlebih dahulu.');
      return;
    }

    let mediaUrl = '';
    if (file.type.startsWith('image')) {
      mediaUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    } else {
      mediaUrl = URL.createObjectURL(file);
    }

    const newSubmission = {
      id: 'sub_' + Date.now(),
      studentId: this.currentUser.id,
      studentName: this.currentUser.fullname,
      studentGrade: this.currentUser.grade,
      bookId: book.id,
      bookTitle: book.title,
      pointsReward: book.points,
      type: proofType,
      mediaUrl: mediaUrl,
      notes: notes,
      verifiedReadingTime: this.tempVerifiedReadingTime || '1 menit 30 detik (Fokus Penuh)',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await DB.put('submissions', newSubmission);

    SoundFx.playSuccess();
    this.closeModal('modal-submit-proof');
    this.showToast('Bukti membaca terkirim! Poin akan bertambah setelah di-ACC guru/admin.', 'success');

    if (this.currentView === 'student') {
      this.renderStudentDashboard(document.getElementById('main-content'));
      lucide.createIcons();
    }
  },

  // ---------------- EDIT STUDENT PROFILE WITH CUSTOM PHOTO UPLOAD ----------------
  openEditProfileModal() {
    if (!this.currentUser) return;
    document.getElementById('edit-fullname').value = this.currentUser.fullname;
    document.getElementById('edit-grade').value = this.currentUser.grade;
    document.getElementById('edit-school').value = this.currentUser.school || 'SDN 1 Cibeunteur';
    document.getElementById('edit-bio').value = this.currentUser.bio || '';

    // Photo Preview
    const imgPreview = document.getElementById('edit-custom-photo-preview');
    const fallback = document.getElementById('edit-custom-photo-fallback');
    const btnRemove = document.getElementById('btn-remove-custom-photo');

    if (this.currentUser.customPhoto) {
      imgPreview.src = this.currentUser.customPhoto;
      imgPreview.classList.remove('hidden');
      fallback.classList.add('hidden');
      btnRemove.classList.remove('hidden');
    } else {
      imgPreview.classList.add('hidden');
      fallback.classList.remove('hidden');
      btnRemove.classList.add('hidden');
    }

    const grid = document.getElementById('avatar-selection-grid');
    grid.innerHTML = AVATARS.map(av => `
      <label class="cursor-pointer border-2 ${this.currentUser.avatar === av.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200'} rounded-xl p-2 flex flex-col items-center text-center transition">
        <input type="radio" name="student_avatar" value="${av.id}" ${this.currentUser.avatar === av.id ? 'checked' : ''} class="hidden">
        <div class="w-7 h-7 rounded-lg ${av.bg} text-white flex items-center justify-center mb-1">
          <i data-lucide="${av.icon}" class="w-3.5 h-3.5"></i>
        </div>
        <span class="text-[9px] font-semibold text-slate-700">${av.label}</span>
      </label>
    `).join('');

    this.openModal('modal-edit-profile');
    lucide.createIcons();
  },

  handleProfilePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      this.tempCustomPhoto = ev.target.result;
      const imgPreview = document.getElementById('edit-custom-photo-preview');
      const fallback = document.getElementById('edit-custom-photo-fallback');
      const btnRemove = document.getElementById('btn-remove-custom-photo');

      imgPreview.src = ev.target.result;
      imgPreview.classList.remove('hidden');
      fallback.classList.add('hidden');
      btnRemove.classList.remove('hidden');
      this.showToast('Foto profil siap disimpan!', 'info');
    };
    reader.readAsDataURL(file);
  },

  removeCustomProfilePhoto() {
    this.tempCustomPhoto = null;
    if (this.currentUser) this.currentUser.customPhoto = null;

    const imgPreview = document.getElementById('edit-custom-photo-preview');
    const fallback = document.getElementById('edit-custom-photo-fallback');
    const btnRemove = document.getElementById('btn-remove-custom-photo');

    imgPreview.classList.add('hidden');
    fallback.classList.remove('hidden');
    btnRemove.classList.add('hidden');
    this.showToast('Foto profil dihapus, menggunakan avatar karakter.', 'info');
  },

  async handleProfileUpdate(e) {
    e.preventDefault();
    if (!this.currentUser) return;

    this.currentUser.fullname = document.getElementById('edit-fullname').value.trim();
    this.currentUser.grade = document.getElementById('edit-grade').value.trim();
    this.currentUser.school = document.getElementById('edit-school').value.trim();
    this.currentUser.bio = document.getElementById('edit-bio').value.trim();

    if (this.tempCustomPhoto !== undefined) {
      this.currentUser.customPhoto = this.tempCustomPhoto;
    }

    const checkedAvatar = document.querySelector('input[name="student_avatar"]:checked');
    if (checkedAvatar) {
      this.currentUser.avatar = checkedAvatar.value;
    }

    await DB.put('users', this.currentUser);

    SoundFx.playSuccess();
    this.closeModal('modal-edit-profile');
    this.showToast('Profil petualang berhasil diperbarui!', 'success');
    this.renderNav();
    this.renderStudentDashboard(document.getElementById('main-content'));
    lucide.createIcons();
  },

  // ---------------- AUTHENTICATION & APPROVALS ----------------
  async handleAdminLogin(e) {
    e.preventDefault();
    const pin = document.getElementById('admin-pin-input').value.trim();
    const errBox = document.getElementById('admin-login-error');
    errBox.classList.add('hidden');

    const setting = await DB.get('settings', 'admin_pin');
    const validPin = setting ? setting.value : '123456';

    if (pin === validPin) {
      this.isAdminLoggedIn = true;
      sessionStorage.setItem('admin_session', 'true');
      this.closeModal('modal-admin-login');
      this.showToast('Selamat datang di Dasbor Admin!', 'success');
      this.navigate('admin');
    } else {
      errBox.textContent = 'PIN Admin salah! (Default: 123456)';
      errBox.classList.remove('hidden');
    }
  },

  adminLogout() {
    this.isAdminLoggedIn = false;
    sessionStorage.removeItem('admin_session');
    this.showToast('Keluar dari Dasbor Admin.', 'info');
    this.navigate('home');
  },

  switchAuthTab(tab) {
    const btnLogin = document.getElementById('tab-btn-login');
    const btnReg = document.getElementById('tab-btn-register');
    const pLogin = document.getElementById('panel-student-login');
    const pReg = document.getElementById('panel-student-register');

    if (tab === 'login') {
      btnLogin.className = 'flex-1 py-2 rounded-xl text-sm font-bold transition shadow-sm bg-white text-brand-600';
      btnReg.className = 'flex-1 py-2 rounded-xl text-sm font-semibold transition text-slate-600 hover:text-slate-900';
      pLogin.classList.remove('hidden');
      pReg.classList.add('hidden');
    } else {
      btnReg.className = 'flex-1 py-2 rounded-xl text-sm font-bold transition shadow-sm bg-white text-amber-600';
      btnLogin.className = 'flex-1 py-2 rounded-xl text-sm font-semibold transition text-slate-600 hover:text-slate-900';
      pReg.classList.remove('hidden');
      pLogin.classList.add('hidden');
    }
  },

  async handleStudentLogin(e) {
    e.preventDefault();
    const username = document.getElementById('student-login-username').value.trim().toLowerCase();
    const password = document.getElementById('student-login-password').value;
    const alertBox = document.getElementById('student-login-alert');
    alertBox.classList.add('hidden');

    const users = await DB.getAll('users');
    const user = users.find(u => u.username && u.username.toLowerCase() === username);

    if (!user) {
      alertBox.className = 'text-xs p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
      alertBox.textContent = 'Nama akun tidak ditemukan! Silakan daftar akun baru terlebih dahulu.';
      return;
    }

    if (user.password !== password) {
      alertBox.className = 'text-xs p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
      alertBox.textContent = 'Kata sandi salah. Silakan periksa kembali.';
      return;
    }

    if (user.status === 'pending') {
      alertBox.className = 'text-xs p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 block';
      alertBox.innerHTML = `
        <strong>Akun Belum Di-ACC!</strong><br>
        Akunmu masih dalam status menunggu persetujuan (ACC) dari Admin/Guru sekolah. Silakan konfirmasi ke pihak sekolah agar akunmu disetujui.
      `;
      return;
    }

    this.currentUser = user;
    sessionStorage.setItem('student_session_id', user.id);
    this.closeModal('modal-student-auth');
    SoundFx.playSuccess();
    this.showToast(`Selamat datang, ${user.fullname}!`, 'success');
    this.navigate('student');
  },

  async handleStudentRegister(e) {
    e.preventDefault();
    const fullname = document.getElementById('reg-fullname').value.trim();
    const username = document.getElementById('reg-username').value.trim().toLowerCase().replace(/\s+/g, '');
    const grade = document.getElementById('reg-grade').value.trim();
    const school = document.getElementById('reg-school').value.trim() || 'SDN 1 Cibeunteur';
    const password = document.getElementById('reg-password').value;
    const alertBox = document.getElementById('student-reg-alert');
    alertBox.classList.add('hidden');

    const users = await DB.getAll('users');
    if (users.some(u => u.username && u.username.toLowerCase() === username)) {
      alertBox.className = 'text-xs p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
      alertBox.textContent = 'Username sudah dipakai oleh siswa lain! Gunakan username lain.';
      return;
    }

    const newStudent = {
      id: 'user_' + Date.now(),
      username,
      fullname,
      password,
      grade,
      school,
      role: 'student',
      status: 'pending',
      avatar: 'adventurer-boy',
      customPhoto: null,
      bio: 'Siap berpetualang mengejar juara membaca 6 bulan!',
      points: 0,
      booksReadCount: 0,
      createdAt: new Date().toISOString()
    };

    await DB.put('users', newStudent);
    this.switchAuthTab('login');
    const loginAlert = document.getElementById('student-login-alert');
    loginAlert.className = 'text-xs p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 block';
    loginAlert.innerHTML = `
      <strong>Pendaftaran Berhasil! 🎉</strong><br>
      Akun <strong>${this.escapeHtml(username)}</strong> telah terkirim dan menunggu persetujuan (ACC) Admin. Setelah di-ACC, kamu bisa langsung masuk!
    `;
  },

  studentLogout() {
    this.currentUser = null;
    sessionStorage.removeItem('student_session_id');
    this.showToast('Keluar dari akun siswa.', 'info');
    this.navigate('home');
  },

  async approveStudentAccount(studentId) {
    const student = await DB.get('users', studentId);
    if (!student) return;
    student.status = 'approved';
    await DB.put('users', student);

    SoundFx.playSuccess();
    this.showToast(`Akun ${student.fullname} telah di-ACC!`, 'success');
    this.renderAdminDashboard(document.getElementById('main-content'));
    lucide.createIcons();
  },

  async rejectStudentAccount(studentId) {
    if (!confirm('Tolak permohonan pendaftaran siswa ini?')) return;
    await DB.delete('users', studentId);
    this.showToast('Pendaftaran akun ditolak.', 'info');
    this.renderAdminDashboard(document.getElementById('main-content'));
    lucide.createIcons();
  },

  async approveReadingSubmission(subId) {
    const sub = await DB.get('submissions', subId);
    if (!sub || sub.status === 'approved') return;

    sub.status = 'approved';
    await DB.put('submissions', sub);

    const student = await DB.get('users', sub.studentId);
    if (student) {
      const oldRank = getRankInfo(student.points || 0);
      student.points = (student.points || 0) + (sub.pointsReward || 35);
      student.booksReadCount = (student.booksReadCount || 0) + 1;
      await DB.put('users', student);

      const newRank = getRankInfo(student.points);
      if (newRank.level > oldRank.level) {
        SoundFx.playLevelUp();
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
        this.showToast(`🎉 Naik Level! ${student.fullname} mencapai Tingkat ${newRank.level}: ${newRank.title}!`, 'success');
      } else {
        SoundFx.playSuccess();
        this.showToast(`Laporan di-ACC! +${sub.pointsReward} XP berhasil ditambahkan ke ${student.fullname}.`, 'success');
      }
    }

    this.renderAdminDashboard(document.getElementById('main-content'));
    lucide.createIcons();
  },

  async rejectReadingSubmission(subId) {
    const reason = prompt('Masukkan alasan penolakan untuk siswa:', 'Foto/Video kurang jelas');
    if (reason === null) return;

    const sub = await DB.get('submissions', subId);
    if (!sub) return;

    sub.status = 'rejected';
    sub.rejectReason = reason;
    await DB.put('submissions', sub);

    this.showToast('Bukti membaca ditolak.', 'info');
    this.renderAdminDashboard(document.getElementById('main-content'));
    lucide.createIcons();
  },

  async previewProofModal(subId) {
    const sub = await DB.get('submissions', subId);
    if (!sub) return;

    const modalContent = document.getElementById('review-proof-content');
    modalContent.innerHTML = `
      <div class="space-y-3">
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <h4 class="font-bold text-slate-800">${this.escapeHtml(sub.studentName)} (${this.escapeHtml(sub.studentGrade)})</h4>
            <p class="text-slate-500">Membaca: <strong>${this.escapeHtml(sub.bookTitle)}</strong></p>
          </div>
          <span class="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            +${sub.pointsReward} XP
          </span>
        </div>

        <div class="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs flex items-center gap-1.5">
          <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
          <span>Waktu Baca Anti-Kecurangan: <strong>${this.escapeHtml(sub.verifiedReadingTime || '1 menit 30 detik (Fokus Penuh)')}</strong></span>
        </div>

        <div class="rounded-xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center max-h-72">
          ${sub.type === 'video' ? `
            <video controls autoplay class="max-h-72 w-full object-contain">
              <source src="${sub.mediaUrl}">
            </video>
          ` : `
            <img src="${sub.mediaUrl}" class="max-h-72 w-full object-contain">
          `}
        </div>

        ${sub.notes ? `
          <div class="bg-indigo-50/60 p-2.5 rounded-xl text-xs text-slate-700 italic">
            "${this.escapeHtml(sub.notes)}"
          </div>
        ` : ''}

        <div class="flex gap-2 pt-2">
          <button onclick="app.closeModal('modal-review-proof'); app.rejectReadingSubmission('${sub.id}')" class="flex-1 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold">
            Tolak
          </button>
          <button onclick="app.closeModal('modal-review-proof'); app.approveReadingSubmission('${sub.id}')" class="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md">
            ACC (+${sub.pointsReward} XP)
          </button>
        </div>
      </div>
    `;

    this.openModal('modal-review-proof');
  },

  async adminEditStudentPoints(studentId, currentPts) {
    const newPts = prompt('Koreksi jumlah poin XP siswa (20 Level System):', currentPts);
    if (newPts === null || isNaN(parseInt(newPts))) return;

    const student = await DB.get('users', studentId);
    if (!student) return;

    student.points = parseInt(newPts, 10);
    await DB.put('users', student);

    const rank = getRankInfo(student.points);
    this.showToast(`Poin ${student.fullname} diubah menjadi ${student.points} XP (Tingkat ${rank.level}: ${rank.title})`, 'success');
    this.renderAdminDashboard(document.getElementById('main-content'));
    lucide.createIcons();
  },

  filterAdminStudentsTable() {
    const q = (document.getElementById('admin-search-student').value || '').toLowerCase();
    const rows = document.querySelectorAll('.student-row');
    rows.forEach(r => {
      const name = r.getAttribute('data-name');
      r.style.display = name.includes(q) ? '' : 'none';
    });
  },

  // ---------------- COMPETITION MODALS & ACTIONS ----------------
  async openManageCompetitionModal() {
    const comps = await DB.getAll('competitions');
    const active = comps.find(c => c.status === 'active') || comps[0];

    if (active) {
      document.getElementById('comp-title').value = active.title;
      document.getElementById('comp-start').value = active.startDate;
      document.getElementById('comp-end').value = active.endDate;
      document.getElementById('comp-desc').value = active.desc || '';
      document.getElementById('comp-reward-1').value = active.reward1;
      document.getElementById('comp-reward-2').value = active.reward2;
      document.getElementById('comp-reward-3').value = active.reward3;
    }
    this.openModal('modal-manage-competition');
  },

  async handleSaveCompetition(e) {
    e.preventDefault();
    const comp = {
      id: 'comp_active',
      title: document.getElementById('comp-title').value.trim(),
      startDate: document.getElementById('comp-start').value,
      endDate: document.getElementById('comp-end').value,
      desc: document.getElementById('comp-desc').value.trim(),
      reward1: document.getElementById('comp-reward-1').value.trim(),
      reward2: document.getElementById('comp-reward-2').value.trim(),
      reward3: document.getElementById('comp-reward-3').value.trim(),
      status: 'active',
      updatedAt: new Date().toISOString()
    };

    await DB.put('competitions', comp);
    this.closeModal('modal-manage-competition');
    SoundFx.playSuccess();
    this.showToast('Lomba & Reward 6 Bulan berhasil disimpan!', 'success');
    this.navigate('admin');
  },

  async openViewRewardModal() {
    const comps = await DB.getAll('competitions');
    const activeComp = comps.find(c => c.status === 'active') || comps[0];
    if (!activeComp) return;

    document.getElementById('reward-modal-title').textContent = activeComp.title;
    document.getElementById('reward-modal-period').textContent = `Periode: ${activeComp.startDate} s/d ${activeComp.endDate}`;

    const list = document.getElementById('reward-modal-list');
    list.innerHTML = `
      <div class="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-start gap-3">
        <div class="text-2xl">🥇</div>
        <div>
          <h4 class="font-bold text-amber-950 text-xs uppercase">Hadiah Juara 1 (Piala Emas)</h4>
          <p class="text-xs text-slate-700 mt-0.5">${this.escapeHtml(activeComp.reward1)}</p>
        </div>
      </div>
      <div class="bg-slate-50 border border-slate-300 rounded-2xl p-3 flex items-start gap-3">
        <div class="text-2xl">🥈</div>
        <div>
          <h4 class="font-bold text-slate-900 text-xs uppercase">Hadiah Juara 2 (Piala Perak)</h4>
          <p class="text-xs text-slate-700 mt-0.5">${this.escapeHtml(activeComp.reward2)}</p>
        </div>
      </div>
      <div class="bg-orange-50 border border-orange-300 rounded-2xl p-3 flex items-start gap-3">
        <div class="text-2xl">🥉</div>
        <div>
          <h4 class="font-bold text-amber-950 text-xs uppercase">Hadiah Juara 3 (Piala Perunggu)</h4>
          <p class="text-xs text-slate-700 mt-0.5">${this.escapeHtml(activeComp.reward3)}</p>
        </div>
      </div>
    `;

    this.openModal('modal-view-reward');
  },

  // ---------------- BACKUP & RESTORE ----------------
  async exportDatabaseBackup() {
    const users = await DB.getAll('users');
    const books = await DB.getAll('books');
    const submissions = await DB.getAll('submissions');
    const settings = await DB.getAll('settings');
    const competitions = await DB.getAll('competitions');
    const hallOfFame = await DB.getAll('hallOfFame');

    const backup = {
      exportDate: new Date().toISOString(),
      appName: 'Petualangan Literasi Digital',
      version: '2.5',
      data: { users, books, submissions, settings, competitions, hallOfFame }
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_literasi_pdf_anticheat_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Cadangan database berhasil diunduh.', 'success');
  },

  // ---------------- UI UTILITIES ----------------
  openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    el.classList.add('flex');
    setTimeout(() => el.classList.add('modal-open'), 10);
    lucide.createIcons();
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('modal-open');
    setTimeout(() => {
      el.classList.add('hidden');
      el.classList.remove('flex');
    }, 200);
  },

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  },

  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-600 text-white',
      info: 'bg-indigo-600 text-white',
      warning: 'bg-amber-500 text-white',
      error: 'bg-rose-600 text-white'
    };

    toast.className = `${colors[type] || colors.info} px-3.5 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transform translate-y-3 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerHTML = `<span>${this.escapeHtml(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.remove('translate-y-3', 'opacity-0'), 10);
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
