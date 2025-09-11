// Frontend authentication service

const API_BASE_URL = '/backend/api';

class AuthService {
  constructor() {
    this.apiUrl = API_BASE_URL;
    this.currentUser = null;
    this.token = localStorage.getItem('authToken');
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/auth.php?action=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }

  // Login user
  async login(login, password) {
    try {
      const response = await fetch(`${this.apiUrl}/auth.php?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }

  // Logout user
  async logout() {
    try {
      if (this.token) {
        await fetch(`${this.apiUrl}/auth.php?action=logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      this.token = null;
      this.currentUser = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  }

  // Validate current session
  async validateSession() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth.php?action=validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: this.token })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        this.currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return true;
      } else {
        // Invalid session, clear data
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      this.logout();
      return false;
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.token && !!this.getCurrentUser();
  }

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  // Get auth token
  getToken() {
    return this.token;
  }

  // Get auth headers for API calls
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Initialize auth state from localStorage
  initializeAuth() {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');

    if (storedToken && storedUser) {
      this.token = storedToken;
      this.currentUser = JSON.parse(storedUser);
      // Validate session in background
      this.validateSession();
    }
  }

  // Validate form data
  validateRegistrationData(data) {
    const errors = [];

    if (!data.username || data.username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!data.full_name || data.full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (data.role === 'admin' && !data.admin_secret) {
      errors.push('Admin secret password is required for admin registration');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateLoginData(data) {
    const errors = [];

    if (!data.login || data.login.trim().length === 0) {
      errors.push('Username or email is required');
    }

    if (!data.password || data.password.length === 0) {
      errors.push('Password is required');
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

  // Check if username is available
  async checkUsernameAvailability(username) {
    try {
      const response = await fetch(`${this.apiUrl}/auth.php?action=check_username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      return { available: !data.exists };
    } catch (error) {
      console.error('Username check error:', error);
      return { available: false, error: 'Network error' };
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const response = await fetch(`${this.apiUrl}/auth.php?action=profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const userData = await response.json();
        this.currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return { success: true, data: userData };
      } else {
        return { success: false, message: 'Failed to fetch profile' };
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${this.apiUrl}/auth.php?action=update_profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update current user data
        this.currentUser = { ...this.currentUser, ...profileData };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default AuthService;