<?php
// Authentication configuration and constants

class AuthConfig {
    // Secret password required to register as admin
    const ADMIN_SECRET_PASSWORD = "elegant_admin_2025!";
    
    // JWT-like session configuration
    const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds
    const TOKEN_LENGTH = 64;
    
    // Password requirements
    const MIN_PASSWORD_LENGTH = 6;
    const MAX_PASSWORD_LENGTH = 128;
    
    // Rate limiting (basic protection)
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOGIN_LOCKOUT_TIME = 15 * 60; // 15 minutes
    
    // Generate secure random token
    public static function generateToken() {
        return bin2hex(random_bytes(self::TOKEN_LENGTH / 2));
    }
    
    // Hash password securely
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    // Verify password
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    // Calculate session expiry
    public static function getSessionExpiry() {
        return date('Y-m-d H:i:s', time() + self::SESSION_DURATION);
    }
    
    // Validate password strength
    public static function isValidPassword($password) {
        $length = strlen($password);
        return $length >= self::MIN_PASSWORD_LENGTH && $length <= self::MAX_PASSWORD_LENGTH;
    }
    
    // Sanitize user input
    public static function sanitizeInput($input) {
        return htmlspecialchars(strip_tags(trim($input)));
    }
    
    // Validate email format
    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    // Generate user response (exclude sensitive data)
    public static function generateUserResponse($user) {
        return [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'full_name' => $user['full_name'],
            'phone' => $user['phone'],
            'created_at' => $user['created_at'],
            'last_login' => $user['last_login']
        ];
    }
}
?>