<?php

// Headers for CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers");
header("Content-Type: application/json; charset=UTF-8");

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array("error" => "Method not allowed. Use POST."));
    exit();
}

// Check if file was uploaded
if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(array("error" => "No file uploaded."));
    exit();
}

$uploaded_file = $_FILES['image'];

// Check for upload errors
if ($uploaded_file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(array("error" => "File upload error."));
    exit();
}

// Configuration
$upload_dir = "../uploads/";
$max_file_size = 5 * 1024 * 1024; // 5MB
$allowed_extensions = array("jpg", "jpeg", "png", "gif");

// Create uploads directory if it doesn't exist
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Get file info
$file_info = pathinfo($uploaded_file["name"]);
$file_extension = strtolower($file_info['extension']);
$original_name = $file_info['filename'];

// Generate unique filename
$new_filename = uniqid('img_') . '_' . time() . '.' . $file_extension;
$target_file = $upload_dir . $new_filename;

// Validate file type
if (!in_array($file_extension, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(array("error" => "Invalid file type. Only JPG, JPEG, PNG and GIF files are allowed."));
    exit();
}

// Check file size
if ($uploaded_file["size"] > $max_file_size) {
    http_response_code(400);
    echo json_encode(array("error" => "File too large. Maximum size is 5MB."));
    exit();
}

// Verify it's actually an image
$image_info = getimagesize($uploaded_file["tmp_name"]);
if ($image_info === false) {
    http_response_code(400);
    echo json_encode(array("error" => "File is not a valid image."));
    exit();
}

// Check image dimensions (optional - prevent extremely large images)
$max_width = 2000;
$max_height = 2000;
if ($image_info[0] > $max_width || $image_info[1] > $max_height) {
    http_response_code(400);
    echo json_encode(array("error" => "Image dimensions too large. Maximum: {$max_width}x{$max_height}px."));
    exit();
}


// Attempt to move the uploaded file
if (move_uploaded_file($uploaded_file["tmp_name"], $target_file)) {
    // Success response
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "message" => "File uploaded successfully.",
        "image_path" => "uploads/" . $new_filename,
        "original_name" => $uploaded_file["name"],
        "file_size" => $uploaded_file["size"],
        "image_width" => $image_info[0],
        "image_height" => $image_info[1]
    ));
} else {
    // Upload failed
    http_response_code(500);
    echo json_encode(array("error" => "Failed to save uploaded file."));
}
?>