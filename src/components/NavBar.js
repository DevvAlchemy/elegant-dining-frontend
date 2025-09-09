import React from 'react';

const NavBar = ({ currentPage, onNavigate }) => {
  const navItems = [
    { key: 'home', label: 'Home' },
    { key: 'make-reservation', label: 'Make Reservation' },
    { key: 'reservations', label: 'View Reservations' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div 
          className="nav-logo"
          onClick={() => onNavigate('home')}
        >
          Elegant Dining
        </div>
        
        <div className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`nav-button ${currentPage === item.key ? 'nav-button-active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;