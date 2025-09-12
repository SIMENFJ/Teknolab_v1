import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Login from './Login';
import Register from './Register';
import Reservation from './Reservation';
import Adminpanel from './Adminpanel';
import TodaysReservations from './TodaysReservations';
import InfoScreen from './InfoScreen';
import './App.css';


function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/info" element={<InfoScreen />} />
          <Route path="/" element={
            !user ? (
              <>
                <Login onLogin={handleLogin} onRegister={() => <Navigate to="/register" />} />
                <TodaysReservations />
              </>
            ) : (
              <div>
                <h2>Velkommen, {user?.name}!</h2>
                <p>Du er nå logget inn. <button onClick={handleLogout} className="logout-button">Logg ut</button></p>
                <hr />
                {user?.admin ? <Adminpanel user={user} /> : <Reservation user={user} />}
              </div>
            )
          } />
          <Route path="/register" element={!user ? <Register onBack={() => <Navigate to="/" />} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
