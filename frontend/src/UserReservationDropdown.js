import React, { useState } from 'react';

function UserReservationDropdown({ users, reservations, removeReservation, adminEmail }) {
  const [selectedEmail, setSelectedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const selectedUser = users.find(u => u.email === selectedEmail);
  const userReservations = reservations.filter(r => r.email === selectedEmail);

  const removeAllReservations = async () => {
    if (!selectedEmail || !adminEmail) return;
    setLoading(true);
    setMessage('');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://your-backend.onrender.com';
  const res = await fetch(`${BACKEND_URL}/admin/remove-all-reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail, userEmail: selectedEmail })
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Alle reservasjoner for brukeren er fjernet.');
      window.location.reload();
    } else {
      setMessage(data.error || 'Feil ved fjerning.');
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: '2em' }}>
      <label htmlFor="user-select">Velg bruker:</label>
      <select id="user-select" value={selectedEmail} onChange={e => setSelectedEmail(e.target.value)}>
        <option value="">-- Velg bruker --</option>
        {users.map(u => (
          <option key={u.email} value={u.email}>{u.name} ({u.email})</option>
        ))}
      </select>
      {selectedUser && (
        <div style={{ marginTop: '1em', border: '1px solid #ccc', padding: '0.5em' }}>
          <strong>{selectedUser.name} ({selectedUser.email})</strong>
          <br />
          <button onClick={removeAllReservations} disabled={loading} style={{ margin: '0.5em 0' }}>
            Fjern alle reservasjoner for denne brukeren
          </button>
          {message && <div style={{ color: 'green' }}>{message}</div>}
          {userReservations.length === 0 ? (
            <p>Ingen reservasjoner.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Dato</th><th>PC</th><th>Fjern</th>
                </tr>
              </thead>
              <tbody>
                {userReservations.map(r => (
                  <tr key={r.date + r.slot}>
                    <td>{r.date}</td><td>{r.slot}</td>
                    <td><button onClick={() => removeReservation(r.date, r.slot)}>Fjern</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default UserReservationDropdown;
