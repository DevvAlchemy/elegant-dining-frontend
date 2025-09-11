// src/App.js (Updated with Authentication)
import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MakeReservationPage from './components/MakeReservationPage';
import ViewReservationsPage from './components/ViewReservationsPage';
import AdminDashboard from './components/AdminDashboard';
import { authService } from './services/authService';
import { reservationService } from './services/reservationService';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Fetch reservations when viewing reservations page
  useEffect(() => {
    if (currentPage === 'reservations' && isAuthenticated) {
      fetchReservations();
    }
  }, [currentPage, isAuthenticated]);

  const initializeAuth = async () => {
    authService.initializeAuth();
    
    if (authService.isLoggedIn()) {
      const isValid = await authService.validateSession();
      if (isValid) {
        setUser(authService.getCurrentUser());
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Use protected endpoint for authenticated users
      const data = await reservationService.getProtectedReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      alert('Error loading reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setReservations([]);
      setCurrentPage('home');
    }
  };

  const handleReservationCreated = () => {
    setCurrentPage('reservations');
  };

  const handleDeleteReservation = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await reservationService.deleteProtectedReservation(id);
        fetchReservations();
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Error deleting reservation. Please try again.');
      }
    }
  };

  const handleNavigation = (page) => {
    // Check if page requires authentication
    const protectedPages = ['make-reservation', 'reservations', 'admin'];
    
    if (protectedPages.includes(page) && !isAuthenticated) {
      setCurrentPage('login');
      return;
    }

    // Check if page requires admin access
    if (page === 'admin' && (!user || user.role !== 'admin')) {
      alert('Admin access required');
      return;
    }

    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    // Authentication pages
    if (!isAuthenticated && ['login', 'register'].includes(currentPage)) {
      switch(currentPage) {
        case 'login':
          return (
            <LoginPage 
              onLogin={handleLogin}
              onSwitchToRegister={() => setCurrentPage('register')}
            />
          );
        case 'register':
          return (
            <RegisterPage 
              onRegister={handleRegister}
              onSwitchToLogin={() => setCurrentPage('login')}
            />
          );
      }
    }

    // Protected pages - redirect to login if not authenticated
    if (['make-reservation', 'reservations', 'admin'].includes(currentPage) && !isAuthenticated) {
      return (
        <LoginPage 
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentPage('register')}
        />
      );
    }

    // Main application pages
    switch(currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigation} isAuthenticated={isAuthenticated} user={user} />;
      
      case 'make-reservation':
        return (
          <MakeReservationPage 
            onReservationCreated={handleReservationCreated}
            user={user}
          />
        );
      
      case 'reservations':
        return (
          <ViewReservationsPage 
            reservations={reservations}
            loading={loading}
            onDelete={handleDeleteReservation}
            onRefresh={fetchReservations}
            user={user}
          />
        );
      
      case 'admin':
        if (user && user.role === 'admin') {
          return <AdminDashboard user={user} />;
        } else {
          return <HomePage onNavigate={handleNavigation} isAuthenticated={isAuthenticated} user={user} />;
        }
      
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        );
      
      case 'register':
        return (
          <RegisterPage 
            onRegister={handleRegister}
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        );
      
      default:
        return <HomePage onNavigate={handleNavigation} isAuthenticated={isAuthenticated} user={user} />;
    }
  };

  return (
    <div className="app">
      <NavBar 
        currentPage={currentPage} 
        onNavigate={handleNavigation}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      {renderCurrentPage()}
    </div>
  );
}

export default App;