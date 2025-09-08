// src/services/reservationService.js

// API configuration
const API_BASE_URL = 'http://localhost/elegant-dining/backend/api';

class ReservationService {
  constructor() {
    this.apiUrl = API_BASE_URL;
  }

  // Get all reservations
  async getAllReservations() {
    try {
      const response = await fetch(`${this.apiUrl}/reservations.php`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  }

  // Create new reservation
  async createReservation(reservationData) {
    try {
      const response = await fetch(`${this.apiUrl}/reservations.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  // Delete reservation
  async deleteReservation(id) {
    try {
      const response = await fetch(`${this.apiUrl}/reservations.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  }

  // Update reservation
  async updateReservation(reservationData) {
    try {
      const response = await fetch(`${this.apiUrl}/reservations.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  // Upload image
  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.apiUrl}/upload.php`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.image_path || 'uploads/default-restaurant.jpg';
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Validate reservation data
  validateReservationData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.date) {
      errors.push('Please select a reservation date');
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push('Reservation date cannot be in the past');
      }
    }

    if (data.party_size < 1 || data.party_size > 20) {
      errors.push('Party size must be between 1 and 20 people');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper method to validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format time for display
  formatTime(timeString) {
    if (!timeString) return 'Not specified';
    
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

// Export a singleton instance
export const reservationService = new ReservationService();
export default ReservationService;