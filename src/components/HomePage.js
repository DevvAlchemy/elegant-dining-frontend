// src/components/HomePage.js
import React from 'react';

const HomePage = ({ onNavigate }) => {
  const features = [
    { icon: '✨', text: 'Award-winning cuisine' },
    { icon: '🍷', text: 'Extensive wine selection' },
    { icon: '👨‍🍳', text: 'Expert chefs' },
    { icon: '✨', text: 'Elegant ambiance' }
  ];

  const operatingHours = [
    { days: 'Monday - Thursday', hours: '5:00 PM - 10:00 PM' },
    { days: 'Friday - Saturday', hours: '5:00 PM - 11:00 PM' },
    { days: 'Sunday', hours: '4:00 PM - 9:00 PM' }
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <h2 className="hero-title">
            Welcome to Elegant Dining
          </h2>
          <p className="hero-description">
            Your perfect dining experience awaits. Make a reservation and enjoy our exquisite cuisine.
          </p>
          
          <div className="hero-buttons">
            <button 
              onClick={() => onNavigate('make-reservation')}
              className="btn btn-primary"
            >
              Make a Reservation
            </button>
            <button 
              onClick={() => onNavigate('reservations')}
              className="btn btn-secondary"
            >
              View All Reservations
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {/* Reserve Your Table Section */}
          <div className="feature-card">
            <h3 className="feature-title">
              Reserve Your Table
            </h3>
            <p className="feature-description">
              Experience fine dining at its best. Our restaurant offers an elegant 
              atmosphere with exceptional service.
            </p>
            
            <div className="feature-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-icon">{feature.icon}</span>
                  <span className="feature-text">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operating Hours Section */}
          <div className="feature-card">
            <h3 className="feature-title">
              Operating Hours
            </h3>
            
            <div className="hours-list">
              {operatingHours.map((schedule, index) => (
                <div key={index} className="hours-item">
                  <span className="hours-day">
                    {schedule.days}
                  </span>
                  <span className="hours-time">
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;