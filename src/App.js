// src/App.js
import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import MakeReservationPage from './components/MakeReservationPage';
import ViewReservationsPage from './components/ViewReservationsPage';
import { reservationService } from './services/reservationService';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch reservations when viewing reservations page
  useEffect(() => {
    if (currentPage === 'reservations') {
      fetchReservations();
    }
  }, [currentPage]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getAllReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      alert('Error loading reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReservationCreated = () => {
    // Switch to reservations view after creating
    setCurrentPage('reservations');
  };

  const handleDeleteReservation = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await reservationService.deleteReservation(id);
        // Refresh the reservations list
        fetchReservations();
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Error deleting reservation. Please try again.');
      }
    }
  };

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'make-reservation':
        return (
          <MakeReservationPage 
            onReservationCreated={handleReservationCreated}
          />
        );
      case 'reservations':
        return (
          <ViewReservationsPage 
            reservations={reservations}
            loading={loading}
            onDelete={handleDeleteReservation}
            onRefresh={fetchReservations}
          />
        );
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      <NavBar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      {renderCurrentPage()}
    </div>
  );
}

export default App;