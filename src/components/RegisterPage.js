import React, { useState } from 'react';
import { authService } from '../services/authService';

const RegisterPage = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer',
    admin_secret: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showAdminSecret, setShowAdminSecret] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Show/hide admin secret field based on role selection
    if (name === 'role') {
      setShowAdminSecret(value === 'admin');
      if (value === 'customer') {
        setFormData(prev => ({ ...prev, admin_secret: '' }));
      }
    }
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);

    try {
      // Validate form data
      const validation = authService.validateRegistrationData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Attempt registration
      const result = await authService.register(formData);

      if (result.success) {
        // Success feedback
        alert(`Welcome, ${result.data.user.full_name}! Your account has been created successfully.`);
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          full_name: '',
          phone: '',
          role: 'customer',
          admin_secret: ''
        });
        setShowAdminSecret(false);

        // Notify parent component
        if (onRegister) {
          onRegister(result.data.user);
        }
      } else {
        setErrors([result.message]);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">
            Create Account
          </h2>
          <p className="form-subtitle">
            Join us to make and manage your reservations
          </p>
          
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
            {/* Username and Email Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className="form-input"
                  autoComplete="username"
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
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Full Name and Phone Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="form-input"
                  autoComplete="name"
                />
              </div>
              
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
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password and Role Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a secure password"
                  className="form-input"
                  autoComplete="new-password"
                />
                <p className="form-help">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Account Type
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {/* Admin Secret Field (conditional) */}
            {showAdminSecret && (
              <div className="form-group">
                <label className="form-label">
                  Admin Secret Password *
                </label>
                <input
                  type="password"
                  name="admin_secret"
                  value={formData.admin_secret}
                  onChange={handleInputChange}
                  placeholder="Enter the admin secret password"
                  className="form-input"
                />
                <p className="form-help">
                  Contact system administrator for the admin secret password
                </p>
                <div className="admin-secret-hint">
                  <strong>Demo Secret:</strong> elegant_admin_2025!
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="form-footer">
              <p className="form-footer-text">
                Already have an account?{' '}
                <button 
                  onClick={onSwitchToLogin}
                  className="form-link"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;