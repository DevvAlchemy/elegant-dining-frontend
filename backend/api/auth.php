<?php
/// Authentication API endpoints

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once '../config/auth_config.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

if($db === null) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed."));
    exit();
}

$user = new User($db);
$request_method = $_SERVER["REQUEST_METHOD"];

// Get action from URL parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch($request_method) {
    case 'POST':
        switch($action) {
            case 'register':
                handleRegister($user);
                break;
            case 'login':
                handleLogin($user);
                break;
            case 'logout':
                handleLogout($user);
                break;
            case 'validate':
                handleValidateSession($user);
                break;
            default:
                http_response_code(400);
                echo json_encode(array("message" => "Invalid action"));
        }
        break;
    
    case 'GET':
        switch($action) {
            case 'profile':
                handleGetProfile($user);
                break;
            case 'users':
                handleGetAllUsers($user);
                break;
            default:
                http_response_code(400);
                echo json_encode(array("message" => "Invalid action"));
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

// Handle user registration
function handleRegister($user) {
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if(empty($data->username) || empty($data->email) || empty($data->password) || empty($data->full_name)) {
        http_response_code(400);
        echo json_encode(array("message" => "Username, email, password, and full name are required."));
        return;
    }
    
    // Validate email format
    if(!AuthConfig::isValidEmail($data->email)) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid email format."));
        return;
    }
    
    // Validate password strength
    if(!AuthConfig::isValidPassword($data->password)) {
        http_response_code(400);
        echo json_encode(array("message" => "Password must be at least " . AuthConfig::MIN_PASSWORD_LENGTH . " characters long."));
        return;
    }
    
    // Check if username already exists
    if($user->usernameExists($data->username)) {
        http_response_code(409);
        echo json_encode(array("message" => "Username already exists."));
        return;
    }
    
    // Check if email already exists
    if($user->emailExists($data->email)) {
        http_response_code(409);
        echo json_encode(array("message" => "Email already exists."));
        return;
    }
    
    // Determine role
    $role = 'customer'; // default role
    if(isset($data->role) && $data->role === 'admin') {
        // Check admin secret password
        if(empty($data->admin_secret) || $data->admin_secret !== AuthConfig::ADMIN_SECRET_PASSWORD) {
            http_response_code(403);
            echo json_encode(array("message" => "Invalid admin secret password."));
            return;
        }
        $role = 'admin';
    }
    
    // Set user properties
    $user->username = AuthConfig::sanitizeInput($data->username);
    $user->email = AuthConfig::sanitizeInput($data->email);
    $user->password_hash = AuthConfig::hashPassword($data->password);
    $user->role = $role;
    $user->full_name = AuthConfig::sanitizeInput($data->full_name);
    $user->phone = isset($data->phone) ? AuthConfig::sanitizeInput($data->phone) : '';
    
    // Create user
    if($user->register()) {
        // Create session
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? '';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $token = $user->createSession($ip_address, $user_agent);
        
        if($token) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "User registered successfully.",
                "user" => AuthConfig::generateUserResponse((array)$user),
                "token" => $token
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "User created but session creation failed."));
        }
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to create user."));
    }
}

// Handle user login
function handleLogin($user) {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->login) || empty($data->password)) {
        http_response_code(400);
        echo json_encode(array("message" => "Username/email and password are required."));
        return;
    }
    
    $login = AuthConfig::sanitizeInput($data->login);
    
    if($user->login($login, $data->password)) {
        // Create session
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? '';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $token = $user->createSession($ip_address, $user_agent);
        
        if($token) {
            http_response_code(200);
            echo json_encode(array(
                "message" => "Login successful.",
                "user" => AuthConfig::generateUserResponse((array)$user),
                "token" => $token
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Login successful but session creation failed."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid credentials."));
    }
}

// Handle logout
function handleLogout($user) {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    
    if(empty($token)) {
        http_response_code(400);
        echo json_encode(array("message" => "Token is required."));
        return;
    }
    
    if($user->logout($token)) {
        http_response_code(200);
        echo json_encode(array("message" => "Logout successful."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Logout failed."));
    }
}

// Handle session validation
function handleValidateSession($user) {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->token)) {
        http_response_code(400);
        echo json_encode(array("message" => "Token is required."));
        return;
    }
    
    if($user->validateSession($data->token)) {
        http_response_code(200);
        echo json_encode(array(
            "valid" => true,
            "user" => AuthConfig::generateUserResponse((array)$user)
        ));
    } else {
        http_response_code(401);
        echo json_encode(array(
            "valid" => false,
            "message" => "Invalid or expired token."
        ));
    }
}

// Handle get user profile
function handleGetProfile($user) {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    
    if(empty($token)) {
        http_response_code(401);
        echo json_encode(array("message" => "Authentication required."));
        return;
    }
    
    if($user->validateSession($token)) {
        http_response_code(200);
        echo json_encode(AuthConfig::generateUserResponse((array)$user));
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid or expired token."));
    }
}

// Handle get all users (admin only)
function handleGetAllUsers($user) {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    
    if(empty($token)) {
        http_response_code(401);
        echo json_encode(array("message" => "Authentication required."));
        return;
    }
    
    if(!$user->validateSession($token)) {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid or expired token."));
        return;
    }
    
    if(!$user->isAdmin()) {
        http_response_code(403);
        echo json_encode(array("message" => "Admin access required."));
        return;
    }
    
    $stmt = $user->getAllUsers();
    $users = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($users, $row);
    }
    
    http_response_code(200);
    echo json_encode($users);
}
?>