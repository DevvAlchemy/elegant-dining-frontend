import React, { useState } from 'react';
import { authService } from '../services/authService';

const LoginPage = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

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

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);

    try {
      // Validate form data
      const validation = authService.validateLoginData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Attempt login
      const result = await authService.login(formData.login, formData.password);

      if (result.success) {
        // Success feedback
        alert(`Welcome back, ${result.data.user.full_name}!`);
        
        // Reset form
        setFormData({
          login: '',
          password: ''
        });

        // Notify parent component
        if (onLogin) {
          onLogin(result.data.user);
        }
      } else {
        setErrors([result.message]);
      }
    } catch (error) {
      console.error('Login error:', error);
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
            Welcome Back
          </h2>
          <p className="form-subtitle">
            Sign in to your account to access your reservations
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
            {/* Login Field */}
            <div className="form-group">
              <label className="form-label">
                Username or Email *
              </label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                placeholder="Enter your username or email"
                className="form-input"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="form-input"
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Register Link */}
            <div className="form-footer">
              <p className="form-footer-text">
                Don't have an account?{' '}
                <button 
                  onClick={onSwitchToRegister}
                  className="form-link"
                >
                  Sign up here
                </button>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <h4>Demo Credentials:</h4>
              <div className="demo-item">
                <strong>Admin:</strong> admin / admin123
              </div>
              <div className="demo-item">
                <strong>Customer:</strong> john_doe / admin123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;