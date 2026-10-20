/** Petualangan Literasi Digital - server dengan penyimpanan buku bersama. */
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(BOOKS_FILE)) fs.writeFileSync(BOOKS_FILE, '[]', 'utf8');
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(ROOT, { index: false }));
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype !== 'application/pdf' && path.extname(file.originalname).toLowerCase() !== '.pdf') return cb(new Error('File harus PDF.'));
  cb(null, true);
} });
function readBooks() { try { const x = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8')); return Array.isArray(x) ? x : []; } catch { return []; } }
function writeBooks(books) { const temp = BOOKS_FILE + '.tmp'; fs.writeFileSync(temp, JSON.stringify(books, null, 2)); fs.renameSync(temp, BOOKS_FILE); }
app.get('/api/books', (_req, res) => res.set('Cache-Control', 'no-store').json(readBooks()));
app.post('/api/books/upload', upload.single('pdf'), (req, res) => {
  try {
    if (!req.body.book) return res.status(400).json({ error: 'Data buku tidak ditemukan.' });
    const book = JSON.parse(req.body.book);
    if (!book.id || !book.title) return res.status(400).json({ error: 'ID dan judul buku wajib ada.' });
    if (req.file) { book.pdfData = `/uploads/${req.file.filename}`; book.fileName = req.file.originalname; book.fileSize = `${(req.file.size / 1048576).toFixed(1)} MB`; book.isSynthetic = false; }
    const books = readBooks().filter(b => b.id !== book.id); books.unshift(book); writeBooks(books);
    res.status(201).json(book);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Gagal menyimpan data buku.' }); }
});
app.put('/api/books/:id', (req, res) => {
  const books = readBooks(); const i = books.findIndex(b => b.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Buku tidak ditemukan.' });
  books[i] = { ...books[i], ...req.body, id: req.params.id }; writeBooks(books); res.json(books[i]);
});
app.delete('/api/books/:id', (req, res) => {
  const books = readBooks(); const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Buku tidak ditemukan.' });
  if (typeof book.pdfData === 'string' && book.pdfData.startsWith('/uploads/')) {
    const filePath = path.join(UPLOAD_DIR, path.basename(book.pdfData)); try { fs.unlinkSync(filePath); } catch {}
  }
  writeBooks(books.filter(b => b.id !== req.params.id)); res.json({ ok: true });
});
app.get('*', (_req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.use((err, _req, res, _next) => { console.error(err); const status = err instanceof multer.MulterError ? 413 : 400; res.status(status).json({ error: err.message || 'Permintaan gagal.' }); });
app.listen(PORT, '0.0.0.0', () => console.log(`Petualangan Literasi aktif: http://localhost:${PORT} (maksimum PDF 100 MB)`));
