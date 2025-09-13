import React, { useEffect, useState } from 'react';
import UserReservationDropdown from './UserReservationDropdown';

function Adminpanel({ user }) {
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/admin/users?adminEmail=${user.email}`)
      .then(res => res.json())
      .then(setUsers);
    fetch(`/admin/reservations?adminEmail=${user.email}`)
      .then(res => res.json())
      .then(setReservations);
  }, []);

  const removeReservation = async (date, slot) => {
    setMessage('');
    const res = await fetch('/admin/remove-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail: user.email, date, slot })
    });
    const data = await res.json();
    if (data.success) {
      setReservations(reservations.filter(r => !(r.date === date && r.slot === slot)));
      setMessage('Reservasjon fjernet.');
    } else {
      setMessage(data.error || 'Feil ved fjerning.');
    }
  };

  const removeAccount = async (email) => {
    setMessage('');
    const res = await fetch('/admin/remove-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail: user.email, userEmail: email })
    });
    const data = await res.json();
    if (data.success) {
      setUsers(users.filter(u => u.email !== email));
      setMessage('Bruker fjernet.');
    } else {
      setMessage(data.error || 'Feil ved fjerning.');
    }
  };

  const resetPassword = async (email) => {
    const newPassword = prompt('Nytt passord for ' + email + ':');
    if (!newPassword) return;
    setMessage('');
    const res = await fetch('/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail: user.email, userEmail: email, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Passord tilbakestilt.');
    } else {
      setMessage(data.error || 'Feil ved tilbakestilling.');
    }
  };

  const promoteAdmin = async (email) => {
    setMessage('');
    const res = await fetch('/admin/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail: user.email, userEmail: email })
    });
    const data = await res.json();
    if (data.success) {
      setUsers(users.map(u => u.email === email ? { ...u, admin: true } : u));
      setMessage('Bruker er nå administrator.');
    } else {
      setMessage(data.error || 'Feil ved oppgradering.');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysReservations = reservations.filter(r => r.date === today);

  return (
    <div className="adminpanel">
      <h2>Adminpanel</h2>
      {message && <div className="message">{message}</div>}
      <h3>Reservasjoner for i dag</h3>
      <table>
        <thead>
          <tr>
            <th>Dato</th><th>PC</th><th>Navn</th><th>E-post</th><th>Reservert</th><th>Fjern</th>
          </tr>
        </thead>
        <tbody>
          {todaysReservations.map(r => (
            <tr key={r.date + r.slot}>
              <td>{r.date}</td><td>{r.slot}</td><td>{r.name}</td><td>{r.email}</td>
              <td>{r.createdAt ? new Date(r.createdAt).toLocaleString('nb-NO') : 'N/A'}</td>
              <td><button onClick={() => removeReservation(r.date, r.slot)}>Fjern</button></td>
            </tr>
          ))}
        </tbody>
      </table>


      <h3>Vis alle reservasjoner for en valgt bruker</h3>

      <UserReservationDropdown users={users} reservations={reservations} removeReservation={removeReservation} adminEmail={user.email} />
      <h3>Brukere</h3>
      <table>
        <thead>
          <tr>
            <th>Navn</th><th>E-post</th><th>Admin</th><th>Aktive Reservasjoner</th><th>Fjern</th><th>Tilbakestill passord</th><th>Gjør til admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const userReservations = reservations.filter(r => r.email === u.email);
            return (
              <tr key={u.email}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.admin ? 'Ja' : 'Nei'}</td>
                <td>{userReservations.length}</td>
                <td><button onClick={() => removeAccount(u.email)}>Fjern</button></td>
                <td><button onClick={() => resetPassword(u.email)}>Tilbakestill</button></td>
                <td>{!u.admin && <button onClick={() => promoteAdmin(u.email)}>Gjør til admin</button>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Adminpanel;
