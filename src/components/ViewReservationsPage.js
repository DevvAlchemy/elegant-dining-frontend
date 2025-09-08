// src/components/ViewReservationsPage.js
import React from 'react';
import { reservationService } from '../services/reservationService';

const ViewReservationsPage = ({ reservations, loading, onDelete, onRefresh }) => {
  // Default image fallback
  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center';
  };

  // Loading state
  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <h2 className="page-title">
            All Reservations
          </h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading reservations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h2 className="page-title">
            All Reservations ({reservations.length})
          </h2>
          <button
            onClick={onRefresh}
            className="btn btn-secondary"
          >
            🔄 Refresh
          </button>
        </div>
        
        {reservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3 className="empty-title">
              No reservations found
            </h3>
            <p className="empty-description">
              When customers make reservations, they will appear here.
            </p>
          </div>
        ) : (
          <div className="reservations-grid">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onDelete={onDelete}
                onImageError={handleImageError}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual reservation card component
const ReservationCard = ({ reservation, onDelete, onImageError }) => {
  const formattedDate = reservationService.formatDate(reservation.date);
  const formattedTime = reservationService.formatTime(reservation.time);

  return (
    <div className="reservation-card">
      {/* Image */}
      <div className="card-image-container">
        <img 
          src={reservation.image_path} 
          alt="Reservation"
          className="card-image"
          onError={onImageError}
        />
        <div className="card-badge">
          #{reservation.id}
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <h3 className="card-title">
          👤 {reservation.name}
        </h3>
        
        <div className="card-info">
          <InfoRow 
            icon="📧" 
            label="Email" 
            value={reservation.email} 
          />
          
          <InfoRow 
            icon="📱" 
            label="Phone" 
            value={reservation.phone || 'Not provided'} 
          />
          
          <InfoRow 
            icon="👥" 
            label="Party Size" 
            value={`${reservation.party_size} ${reservation.party_size === 1 ? 'person' : 'people'}`} 
          />
          
          <InfoRow 
            icon="📅" 
            label="Date" 
            value={formattedDate} 
          />
          
          <InfoRow 
            icon="🕐" 
            label="Time" 
            value={formattedTime} 
          />
          
          {reservation.special_requests && (
            <div className="special-requests">
              <p className="special-requests-title">
                📝 Special Requests:
              </p>
              <p className="special-requests-text">
                {reservation.special_requests}
              </p>
            </div>
          )}
        </div>

        {/* Created Date */}
        <div className="card-meta">
          ⏰ Created: {new Date(reservation.created_at).toLocaleString()}
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          <button
            onClick={() => onDelete(reservation.id)}
            className="btn btn-danger btn-full"
          >
            🗑️ Cancel Reservation
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for information rows
const InfoRow = ({ icon, label, value }) => (
  <div className="info-row">
    <span className="info-icon">{icon}</span>
    <div className="info-content">
      <span className="info-label">{label}:</span>
      <span className="info-value">{value}</span>
    </div>
  </div>
);

export default ViewReservationsPage;