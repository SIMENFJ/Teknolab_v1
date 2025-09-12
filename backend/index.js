import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;


// Helper functions
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function isAdmin(email) {
  const users = readJson('users.json');
  const user = users.find(u => u.email === email);
  return user && user.admin === true;
}

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Fjern alle reservasjoner for en bruker (kun admin)
app.post('/admin/remove-all-reservations', (req, res) => {
  const { adminEmail, userEmail } = req.body;
  if (!isAdmin(adminEmail)) return res.status(403).json({ error: 'Kun administratorer har tilgang.' });
  let reservations = readJson('reservations.json');
  const before = reservations.length;
  reservations = reservations.filter(r => r.email !== userEmail);
  writeJson('reservations.json', reservations);
  res.json({ success: true, removed: before - reservations.length });
});

// Admin endpoints
app.get('/admin/users', (req, res) => {
  const adminEmail = req.query.adminEmail;
  if (!isAdmin(adminEmail)) return res.status(403).json({ error: 'Kun administratorer har tilgang.' });
  const users = readJson('users.json');
  res.json(users);
});

// Hent alle reservasjoner (kun admin)
app.get('/admin/reservations', (req, res) => {
  const adminEmail = req.query.adminEmail;
  if (!isAdmin(adminEmail)) return res.status(403).json({ error: 'Kun administratorer har tilgang.' });
  const reservations = readJson('reservations.json');
  res.json(reservations);
});

app.post('/admin/remove-reservation', (req, res) => {
  const { adminEmail, date, slot } = req.body;
  if (!isAdmin(adminEmail)) return res.status(403).json({ error: 'Kun administratorer har tilgang.' });
  let reservations = readJson('reservations.json');
  const before = reservations.length;
  reservations = reservations.filter(r => !(r.date === date && r.slot === slot));
  writeJson('reservations.json', reservations);
  res.json({ success: true, removed: before - reservations.length });
});

app.post('/admin/reset-password', (req, res) => {
  const { adminEmail, userEmail, newPassword } = req.body;
  if (!isAdmin(adminEmail)) return res.status(403).json({ error: 'Kun administratorer har tilgang.' });
  const users = readJson('users.json');
  const user = users.find(u => u.email === userEmail);
  if (!user) return res.status(404).json({ error: 'Bruker ikke funnet.' });
  user.password = newPassword;
  writeJson('users.json', users);
  res.json({ success: true });
});

app.post('/admin/remove-account', (req, res) => {
  const { adminEmail, userEmail } = req.body;
  if (!isAdmin(adminEmail)) return res.status(403).json({ error: 'Kun administratorer har tilgang.' });
  let users = readJson('users.json');
  const before = users.length;
  users = users.filter(u => u.email !== userEmail);
  writeJson('users.json', users);
  res.json({ success: true, removed: before - users.length });
});

app.post('/admin/promote', (req, res) => {
  const { adminEmail, userEmail } = req.body;
  if (!isAdmin(adminEmail)) return res.status(403).json({ error: 'Kun administratorer har tilgang.' });
  const users = readJson('users.json');
  const user = users.find(u => u.email === userEmail);
  if (!user) return res.status(404).json({ error: 'Bruker ikke funnet.' });
  user.admin = true;
  writeJson('users.json', users);
  res.json({ success: true });
});

// User endpoints
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Alle felt må fylles ut.' });
  }
  const users = readJson('users.json');
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'E-post er allerede registrert.' });
  }
  users.push({ name, email, password });
  writeJson('users.json', users);
  res.json({ success: true });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJson('users.json');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Feil e-post eller passord.' });
  }
  res.json({ success: true, name: user.name, email: user.email, admin: user.admin === true });
});

// Reservation endpoints
app.get('/reservations/:date', (req, res) => {
  const { date } = req.params;
  const reservations = readJson('reservations.json');
  const slots = reservations.filter(r => r.date === date);
  res.json(slots);
});

app.post('/reserve', (req, res) => {
  const { date, slot, name, email } = req.body;
  if (!date || !slot || !name || !email) {
    return res.status(400).json({ error: 'Alle felt må fylles ut.' });
  }
  const reservations = readJson('reservations.json');
  const slotsForDate = reservations.filter(r => r.date === date);
  if (slotsForDate.length >= 6) {
    return res.status(409).json({ error: 'Alle plasser er reservert for denne dagen.' });
  }
  if (slotsForDate.find(r => r.slot === slot)) {
    return res.status(409).json({ error: 'Denne plassen er allerede reservert.' });
  }
  reservations.push({ date, slot, name, email, createdAt: new Date().toISOString() });
  writeJson('reservations.json', reservations);
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server kjører på port ${PORT}`);
});
