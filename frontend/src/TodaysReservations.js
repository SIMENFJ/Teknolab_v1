import React, { useState, useEffect } from 'react';

function TodaysReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://your-backend.onrender.com';
    fetch(`${BACKEND_URL}/reservations/${today}`)
      .then(res => res.json())
      .then(data => {
        setReservations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch today's reservations:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Laster dagens reservasjoner...</p>;
  }

  return (
    <div className="todays-reservations" style={{ maxWidth: '400px', margin: '20px auto' }}>
      <h3>Dagens reservasjoner</h3>
      {reservations.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>PC</th>
              <th>Navn</th>
            </tr>
          </thead>
          <tbody>
            {reservations.sort((a, b) => a.slot.localeCompare(b.slot)).map(r => (
              <tr key={r.slot}>
                <td>{r.slot}</td>
                <td>{r.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Ingen reservasjoner for i dag.</p>
      )}
    </div>
  );
}

export default TodaysReservations;
