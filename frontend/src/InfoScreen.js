import React, { useState, useEffect } from 'react';

function InfoScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    fetch(`/reservations/${today}`)
      .then(res => res.json())
      .then(data => {
        setReservations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch today's reservations:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(() => {
      fetchReservations();
    }, 120000); // 120000ms = 2 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="info-screen" style={{ padding: '40px', backgroundColor: '#001f3f', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3em', marginBottom: '40px' }}>Dagens reservasjoner</h1>
      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '1.5em' }}>Laster...</p>
      ) : reservations.length > 0 ? (
        <table style={{ width: '80%', margin: '0 auto', fontSize: '1.5em' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', borderBottom: '2px solid white' }}>PC</th>
              <th style={{ padding: '15px', borderBottom: '2px solid white' }}>Navn</th>
            </tr>
          </thead>
          <tbody>
            {reservations.sort((a, b) => a.slot.localeCompare(b.slot)).map(r => (
              <tr key={r.slot}>
                <td style={{ padding: '15px', textAlign: 'center' }}>{r.slot}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>{r.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '1.5em' }}>Ingen reservasjoner for i dag.</p>
      )}
    </div>
  );
}

export default InfoScreen;
