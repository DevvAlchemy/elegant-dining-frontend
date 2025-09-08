-- database/schema.sql
-- Create database with new name
CREATE DATABASE IF NOT EXISTS elegant_dining_db;
USE elegant_dining_db;

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    party_size INT NOT NULL DEFAULT 1,
    date DATE NOT NULL,
    time TIME,
    special_requests TEXT,
    image_path VARCHAR(255) DEFAULT 'uploads/default-restaurant.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_reservation_date ON reservations(date);
CREATE INDEX idx_reservation_email ON reservations(email);
CREATE INDEX idx_reservation_created ON reservations(created_at);

-- Insert sample data for testing
INSERT INTO reservations (name, email, phone, party_size, date, time, special_requests) VALUES
('Alice Johnson', 'alice@example.com', '+1-555-0123', 2, '2025-09-15', '19:00:00', 'Anniversary dinner - quiet table please'),
('Bob Smith', 'bob@example.com', '+1-555-0456', 4, '2025-09-16', '18:30:00', 'Business meeting'),
('Carol Davis', 'carol@example.com', '+1-555-0789', 6, '2025-09-20', '20:00:00', 'Birthday celebration - need high chair'),
('David Wilson', 'david@example.com', '+1-555-0321', 3, '2025-09-22', '19:30:00', 'Gluten-free options needed'),
('Emma Brown', 'emma@example.com', '+1-555-0654', 2, '2025-09-25', '18:00:00', 'Vegetarian menu preferred');

-- Show table structure
DESCRIBE reservations;

-- Show sample data
SELECT * FROM reservations ORDER BY created_at DESC LIMIT 5;