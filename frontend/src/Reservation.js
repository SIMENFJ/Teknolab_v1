import React, { useState, useEffect } from 'react';

const slotNames = [
  'PC 1', 'PC 2', 'PC 3', 'PC 4', 'PC 5', 'PC 6'
];

function getWeekdays(start, count) {
  const days = [];
  let date = new Date(start);
  while (days.length < count) {
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function Reservation({ user }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const weekdays = getWeekdays(new Date(), 14); // Next 2 weeks

  useEffect(() => {
    if (selectedDate) {
      setLoading(true);
      fetch(`/reservations/${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          setReservations(data);
          setLoading(false);
        });
    }
  }, [selectedDate]);

  const handleReserve = async (slot) => {
    setMessage('');
    setLoading(true);
    const res = await fetch('/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate,
        slot,
        name: user.name,
        email: user.email
      })
    });
    const data = await res.json();
    if (data.success) {
      setMessage(`Du har reservert ${slot} for ${selectedDate}.`);
      setReservations([...reservations, { slot, name: user.name, email: user.email, date: selectedDate }]);
    } else {
      setMessage(data.error || 'Reservasjon feilet.');
    }
    setLoading(false);
  };

  return (
    <div className="reservation-container">
      <h2>Reserver en plass</h2>
      <label>Velg dato:</label>
      <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
        <option value="">-- Velg en dato --</option>
        {weekdays.map(d => {
          const dateStr = formatDate(d);
          const slotsForDate = reservations.filter(r => r.date === dateStr);
          const isFull = slotsForDate.length >= 6;
          return (
            <option key={dateStr} value={dateStr} disabled={isFull}>
              {dateStr} {isFull ? '(Fullt)' : ''}
            </option>
          );
        })}
      </select>
      {selectedDate && (
        <div>
          <h3>Ledige plasser for {selectedDate}:</h3>
          {loading ? <p>Laster...</p> : (
            <ul>
              {slotNames.map(slot => {
                const reserved = reservations.find(r => r.slot === slot && r.date === selectedDate);
                return (
                  <li key={slot}>
                    {slot} {reserved ? `- Reservert av ${reserved.name}` : <button onClick={() => handleReserve(slot)}>Reserver</button>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default Reservation;
