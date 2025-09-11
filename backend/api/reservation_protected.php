<?php
// Protected reservations API with authentication and role-based access

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once '../config/auth_config.php';
include_once '../models/User.php';
include_once '../models/Reservation.php';

$database = new Database();
$db = $database->getConnection();

if($db === null) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed."));
    exit();
}

$user = new User($db);
$reservation = new Reservation($db);

// Authenticate user
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if(empty($token)) {
    http_response_code(401);
    echo json_encode(array("message" => "Authentication required."));
    exit();
}

if(!$user->validateSession($token)) {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid or expired token."));
    exit();
}

$request_method = $_SERVER["REQUEST_METHOD"];

switch($request_method) {
    case 'GET':
        // Get reservations - customers see only their own, admins see all
        handleGetReservations($user, $reservation);
        break;

    case 'POST':
        // Create new reservation
        handleCreateReservation($user, $reservation);
        break;

    case 'PUT':
        // Update reservation (admin only)
        handleUpdateReservation($user, $reservation);
        break;

    case 'DELETE':
        // Delete reservation (admin only or own reservation)
        handleDeleteReservation($user, $reservation);
        break;

    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}

// Handle get reservations
function handleGetReservations($user, $reservation) {
    try {
        if($user->isAdmin()) {
            // Admin can see all reservations
            $stmt = $reservation->readAll();
        } else {
            // Customers can only see their own reservations
            $stmt = $reservation->readByUser($user->id);
        }
        
        $reservations = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $reservation_item = array(
                "id" => $row['id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "phone" => $row['phone'],
                "party_size" => $row['party_size'],
                "date" => $row['date'],
                "time" => $row['time'],
                "special_requests" => $row['special_requests'],
                "image_path" => $row['image_path'] ?: 'uploads/default-restaurant.jpg',
                "user_id" => $row['user_id'],
                "created_by_admin" => $row['created_by_admin'],
                "created_at" => $row['created_at']
            );
            
            // Add user info for admin view
            if($user->isAdmin() && $row['user_id']) {
                $reservation_item['user_info'] = array(
                    'id' => $row['user_id'],
                    'username' => $row['username'] ?? 'Unknown'
                );
            }
            
            array_push($reservations, $reservation_item);
        }
        
        http_response_code(200);
        echo json_encode($reservations);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching reservations."));
    }
}

// Handle create reservation
function handleCreateReservation($user, $reservation) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->name) && !empty($data->email) && !empty($data->date)) {
        $reservation->name = $data->name;
        $reservation->email = $data->email;
        $reservation->phone = $data->phone ?? '';
        $reservation->party_size = $data->party_size ?? 2;
        $reservation->date = $data->date;
        $reservation->time = $data->time ?? '';
        $reservation->special_requests = $data->special_requests ?? '';
        $reservation->image_path = $data->image_path ?? 'uploads/default-restaurant.jpg';
        $reservation->user_id = $user->id;
        $reservation->created_by_admin = $user->isAdmin() ? 1 : 0;
        
        if($reservation->createWithUser()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "Reservation created successfully.",
                "reservation_id" => $reservation->id
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create reservation."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data. Name, email and date are required."));
    }
}

// Handle update reservation (admin only)
function handleUpdateReservation($user, $reservation) {
    if(!$user->isAdmin()) {
        http_response_code(403);
        echo json_encode(array("message" => "Admin access required to update reservations."));
        return;
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id) && !empty($data->name) && !empty($data->email) && !empty($data->date)) {
        $reservation->id = $data->id;
        $reservation->name = $data->name;
        $reservation->email = $data->email;
        $reservation->phone = $data->phone ?? '';
        $reservation->party_size = $data->party_size ?? 2;
        $reservation->date = $data->date;
        $reservation->time = $data->time ?? '';
        $reservation->special_requests = $data->special_requests ?? '';
        $reservation->image_path = $data->image_path ?? 'uploads/default-restaurant.jpg';
        
        if($reservation->update()) {
            http_response_code(200);
            echo json_encode(array("message" => "Reservation updated successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update reservation."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
}

// Handle delete reservation
function handleDeleteReservation($user, $reservation) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        $reservation->id = $data->id;
        
        // Check if user can delete this reservation
        if(!$user->isAdmin()) {
            // Non-admin users can only delete their own reservations
            if(!$reservation->belongsToUser($user->id)) {
                http_response_code(403);
                echo json_encode(array("message" => "You can only delete your own reservations."));
                return;
            }
        }
        
        if($reservation->delete()) {
            http_response_code(200);
            echo json_encode(array("message" => "Reservation deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete reservation."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "ID is required to delete reservation."));
    }
}
?>