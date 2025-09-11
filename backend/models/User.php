<?php
/// User model for authentication and user management

class User {
    private $conn;
    private $table = "users";
    private $sessions_table = "user_sessions";

    // User properties
    public $id;
    public $username;
    public $email;
    public $password_hash;
    public $role;
    public $full_name;
    public $phone;
    public $created_at;
    public $last_login;
    public $is_active;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Register new user
    public function register() {
        $query = "INSERT INTO " . $this->table . " 
                 SET username=:username, email=:email, password_hash=:password_hash, 
                     role=:role, full_name=:full_name, phone=:phone";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->phone = htmlspecialchars(strip_tags($this->phone));

        // Bind values
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password_hash", $this->password_hash);
        $stmt->bindParam(":role", $this->role);
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":phone", $this->phone);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Login user
    public function login($username_or_email, $password) {
        $query = "SELECT * FROM " . $this->table . " 
                 WHERE (username = :login OR email = :login) AND is_active = 1 
                 LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":login", $username_or_email);
        $stmt->execute();

        if($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($password, $row['password_hash'])) {
                // Set user properties
                $this->id = $row['id'];
                $this->username = $row['username'];
                $this->email = $row['email'];
                $this->role = $row['role'];
                $this->full_name = $row['full_name'];
                $this->phone = $row['phone'];
                $this->created_at = $row['created_at'];
                $this->last_login = $row['last_login'];

                // Update last login
                $this->updateLastLogin();
                
                return true;
            }
        }
        return false;
    }

    // Create session token
    public function createSession($ip_address = '', $user_agent = '') {
        // Clean up expired sessions first
        $this->cleanupExpiredSessions();

        $token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24 hours

        $query = "INSERT INTO " . $this->sessions_table . " 
                 SET user_id=:user_id, session_token=:token, expires_at=:expires_at, 
                     ip_address=:ip_address, user_agent=:user_agent";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->id);
        $stmt->bindParam(":token", $token);
        $stmt->bindParam(":expires_at", $expires_at);
        $stmt->bindParam(":ip_address", $ip_address);
        $stmt->bindParam(":user_agent", $user_agent);

        if($stmt->execute()) {
            return $token;
        }
        return false;
    }

    // Validate session token
    public function validateSession($token) {
        $query = "SELECT u.*, s.expires_at 
                 FROM " . $this->table . " u 
                 JOIN " . $this->sessions_table . " s ON u.id = s.user_id 
                 WHERE s.session_token = :token AND s.expires_at > NOW() AND u.is_active = 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();

        if($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Set user properties
            $this->id = $row['id'];
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->role = $row['role'];
            $this->full_name = $row['full_name'];
            $this->phone = $row['phone'];
            $this->created_at = $row['created_at'];
            $this->last_login = $row['last_login'];

            return true;
        }
        return false;
    }

    // Logout (destroy session)
    public function logout($token) {
        $query = "DELETE FROM " . $this->sessions_table . " WHERE session_token = :token";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        return $stmt->execute();
    }

    // Check if username exists
    public function usernameExists($username) {
        $query = "SELECT id FROM " . $this->table . " WHERE username = :username LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":username", $username);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // Check if email exists
    public function emailExists($email) {
        $query = "SELECT id FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // Update last login timestamp
    private function updateLastLogin() {
        $query = "UPDATE " . $this->table . " SET last_login = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
    }

    // Clean up expired sessions
    public function cleanupExpiredSessions() {
        $query = "DELETE FROM " . $this->sessions_table . " WHERE expires_at < NOW()";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
    }

    // Get user by ID
    public function getUserById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id AND is_active = 1 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        if($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->role = $row['role'];
            $this->full_name = $row['full_name'];
            $this->phone = $row['phone'];
            $this->created_at = $row['created_at'];
            $this->last_login = $row['last_login'];
            return true;
        }
        return false;
    }

    // Check if user is admin
    public function isAdmin() {
        return $this->role === 'admin';
    }

    // Get all users (admin only)
    public function getAllUsers() {
        $query = "SELECT id, username, email, role, full_name, phone, created_at, last_login, is_active 
                 FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Update user profile
    public function updateProfile() {
        $query = "UPDATE " . $this->table . " 
                 SET full_name=:full_name, phone=:phone, email=:email 
                 WHERE id=:id";

        $stmt = $this->conn->prepare($query);
        
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->email = htmlspecialchars(strip_tags($this->email));

        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }
}
?>