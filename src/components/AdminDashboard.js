import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/reservationService';
import { authService } from '../services/authService';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load reservations
      const reservationsData = await reservationService.getProtectedReservations();
      setReservations(reservationsData);

      // Load users (you'd need to create this endpoint)
      // const usersData = await authService.getAllUsers();
      // setUsers(usersData);

      // Calculate basic stats
      const today = new Date().toDateString();
      const todayReservations = reservationsData.filter(r => 
        new Date(r.created_at).toDateString() === today
      );
      
      setStats({
        totalReservations: reservationsData.length,
        todayReservations: todayReservations.length,
        totalUsers: users.length,
        avgPartySize: reservationsData.length > 0 
          ? (reservationsData.reduce((sum, r) => sum + parseInt(r.party_size), 0) / reservationsData.length).toFixed(1)
          : 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await reservationService.deleteProtectedReservation(id);
        loadDashboardData(); // Refresh data
        alert('Reservation deleted successfully');
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Error deleting reservation');
      }
    }
  };

  const renderOverviewTab = () => (
    <div className="admin-overview">
      <h3 className="admin-section-title">Dashboard Overview</h3>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.totalReservations || 0}</div>
            <div className="stat-label">Total Reservations</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.todayReservations || 0}</div>
            <div className="stat-label">Today's Reservations</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.avgPartySize || 0}</div>
            <div className="stat-label">Avg Party Size</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="recent-reservations">
        <h4 className="subsection-title">Recent Reservations</h4>
        <div className="reservations-table">
          <div className="table-header">
            <div>Customer</div>
            <div>Date</div>
            <div>Time</div>
            <div>Party Size</div>
            <div>Actions</div>
          </div>
          {reservations.slice(0, 5).map(reservation => (
            <div key={reservation.id} className="table-row">
              <div>{reservation.name}</div>
              <div>{new Date(reservation.date).toLocaleDateString()}</div>
              <div>{reservation.time || 'Not specified'}</div>
              <div>{reservation.party_size} people</div>
              <div>
                <button 
                  onClick={() => handleDeleteReservation(reservation.id)}
                  className="btn btn-danger btn-small"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReservationsTab = () => (
    <div className="admin-reservations">
      <h3 className="admin-section-title">All Reservations Management</h3>
      
      <div className="reservations-grid">
        {reservations.map(reservation => (
          <div key={reservation.id} className="admin-reservation-card">
            <div className="card-header">
              <h4>{reservation.name}</h4>
              <span className="reservation-id">#{reservation.id}</span>
            </div>
            
            <div className="card-details">
              <p><strong>Email:</strong> {reservation.email}</p>
              <p><strong>Phone:</strong> {reservation.phone || 'Not provided'}</p>
              <p><strong>Date:</strong> {new Date(reservation.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {reservation.time || 'Not specified'}</p>
              <p><strong>Party Size:</strong> {reservation.party_size} people</p>
              {reservation.special_requests && (
                <p><strong>Special Requests:</strong> {reservation.special_requests}</p>
              )}
              <p><strong>Created:</strong> {new Date(reservation.created_at).toLocaleString()}</p>
            </div>
            
            <div className="card-actions">
              <button 
                onClick={() => handleDeleteReservation(reservation.id)}
                className="btn btn-danger btn-full"
              >
                Delete Reservation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="admin-users">
      <h3 className="admin-section-title">User Management</h3>
      <p className="admin-note">User management features coming soon...</p>
      
      {/* Placeholder for future user management features */}
      <div className="feature-placeholder">
        <div className="placeholder-icon">👥</div>
        <h4>User Management</h4>
        <p>Features like user roles, account status, and user statistics will be available here.</p>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="admin-settings">
      <h3 className="admin-section-title">System Settings</h3>
      
      <div className="settings-section">
        <h4>Admin Information</h4>
        <div className="admin-info">
          <p><strong>Name:</strong> {user.full_name}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</p>
        </div>
      </div>

      <div className="settings-section">
        <h4>System Information</h4>
        <div className="system-info">
          <p><strong>Total Reservations:</strong> {reservations.length}</p>
          <p><strong>Database:</strong> elegant_dining_db</p>
          <p><strong>Last Data Refresh:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="admin-dashboard">
          <div className="admin-header">
            <h2 className="page-title">Admin Dashboard</h2>
            <p className="admin-welcome">Welcome back, {user.full_name}</p>
          </div>

          {/* Tab Navigation */}
          <div className="admin-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'reservations' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservations')}
            >
              📅 Reservations
            </button>
            <button 
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
            <button 
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="admin-content">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'reservations' && renderReservationsTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;