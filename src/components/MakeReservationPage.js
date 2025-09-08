// src/components/MakeReservationPage.js
import React, { useState } from 'react';
import { reservationService } from '../services/reservationService';

const MakeReservationPage = ({ onReservationCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    party_size: 2,
    date: '',
    time: '',
    special_requests: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    
    // Optional: Preview the image
    if (file) {
      console.log('Image selected:', file.name);
    }
  };

  // Submit the reservation
  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);

    try {
      // Validate the form data
      const validation = reservationService.validateReservationData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Upload image if provided
      let imagePath = 'uploads/default-restaurant.jpg';
      if (imageFile) {
        try {
          imagePath = await reservationService.uploadImage(imageFile);
        } catch (uploadError) {
          console.warn('Image upload failed, using default image:', uploadError);
          // Continue with default image rather than failing the entire reservation
        }
      }

      // Create the reservation
      const reservationData = {
        ...formData,
        image_path: imagePath
      };

      await reservationService.createReservation(reservationData);

      // Success feedback
      alert('Reservation created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        party_size: 2,
        date: '',
        time: '',
        special_requests: ''
      });
      setImageFile(null);
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      // Notify parent component
      if (onReservationCreated) {
        onReservationCreated();
      }

    } catch (error) {
      console.error('Error creating reservation:', error);
      setErrors(['Failed to create reservation. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="page">
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">
            Make a Reservation
          </h2>
          
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="error-container">
              <ul className="error-list">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-content">
            {/* Name and Email Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className="form-input"
                />
              </div>
            </div>

            {/* Phone and Party Size Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Party Size
                </label>
                <select
                  name="party_size"
                  value={formData.party_size}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(size => (
                    <option key={size} value={size}>
                      {size} {size === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Reservation Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">
                Upload Image (Optional)
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="form-input file-input"
              />
              <p className="form-help">
                Upload a photo related to your reservation. Maximum size: 5MB. 
                Supported formats: JPG, PNG, GIF.
              </p>
              {imageFile && (
                <p className="file-selected">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            {/* Special Requests */}
            <div className="form-group">
              <label className="form-label">
                Special Requests
              </label>
              <textarea
                name="special_requests"
                value={formData.special_requests}
                onChange={handleInputChange}
                rows={4}
                placeholder="Any dietary restrictions, allergies, special occasions, or other requests..."
                className="form-input form-textarea"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? 'Creating Reservation...' : 'Make Reservation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeReservationPage;