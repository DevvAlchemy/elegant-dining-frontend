<?php

// Headers for CORS and content type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include required files
include_once '../config/database.php';
include_once '../models/Reservation.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

if($db === null) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed."));
    exit();
}

// Initialize reservation object
$reservation = new Reservation($db);

// Get the request method
$request_method = $_SERVER["REQUEST_METHOD"];

switch($request_method) {
    case 'GET':
        // Handle GET request - fetch all reservations
        try {
            $stmt = $reservation->read();
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
                    "created_at" => $row['created_at']
                );
                array_push($reservations, $reservation_item);
            }
            
            http_response_code(200);
            echo json_encode($reservations);
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode(array("message" => "Error fetching reservations."));
        }
        break;

    case 'POST':
        // Handle POST request - create new reservation
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
            
            if($reservation->create()) {
                http_response_code(201);
                echo json_encode(array("message" => "Reservation created successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create reservation."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data. Name, email and date are required."));
        }
        break;

    case 'PUT':
        // Handle PUT request - update reservation
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
        break;

    case 'DELETE':
        // Handle DELETE request - delete reservation
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $reservation->id = $data->id;
            
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
        break;

    default:
        // Handle unsupported methods
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?>