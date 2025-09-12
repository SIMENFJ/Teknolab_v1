// Backend endpoint to remove all reservations for a user
import fs from 'fs';
import express from 'express';
const router = express.Router();

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

router.post('/admin/remove-all-reservations', (req, res) => {
  const { adminEmail, userEmail } = req.body;
  // isAdmin should be imported from main file
  // For now, assume isAdmin is available
  if (!isAdmin(adminEmail)) return res.status(403).json({ error: 'Kun administratorer har tilgang.' });
  let reservations = readJson('reservations.json');
  const before = reservations.length;
  reservations = reservations.filter(r => r.email !== userEmail);
  writeJson('reservations.json', reservations);
  res.json({ success: true, removed: before - reservations.length });
});

export default router;
