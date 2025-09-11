<?php

class Reservation {
    private $conn;
    private $table = "reservations";

    // Reservation properties
    public $id;
    public $name;
    public $email;
    public $phone;
    public $party_size;
    public $date;
    public $time;
    public $special_requests;
    public $image_path;
    public $user_id;
    public $created_by_admin;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new reservation with user association
    public function createWithUser() {
        $query = "INSERT INTO " . $this->table . " 
                 SET name=:name, email=:email, phone=:phone, 
                     party_size=:party_size, date=:date, time=:time, 
                     special_requests=:special_requests, image_path=:image_path,
                     user_id=:user_id, created_by_admin=:created_by_admin";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->special_requests = htmlspecialchars(strip_tags($this->special_requests));

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":party_size", $this->party_size);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":time", $this->time);
        $stmt->bindParam(":special_requests", $this->special_requests);
        $stmt->bindParam(":image_path", $this->image_path);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":created_by_admin", $this->created_by_admin);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Original create method for backward compatibility
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                 SET name=:name, email=:email, phone=:phone, 
                     party_size=:party_size, date=:date, time=:time, 
                     special_requests=:special_requests, image_path=:image_path";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->special_requests = htmlspecialchars(strip_tags($this->special_requests));

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":party_size", $this->party_size);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":time", $this->time);
        $stmt->bindParam(":special_requests", $this->special_requests);
        $stmt->bindParam(":image_path", $this->image_path);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Read all reservations (admin view)
    public function readAll() {
        $query = "SELECT r.*, u.username 
                 FROM " . $this->table . " r 
                 LEFT JOIN users u ON r.user_id = u.id 
                 ORDER BY r.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Read reservations by user (customer view)
    public function readByUser($user_id) {
        $query = "SELECT * FROM " . $this->table . " 
                 WHERE user_id = :user_id 
                 ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt;
    }

    // Original read method for backward compatibility
    public function read() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Read single reservation
    public function readSingle() {
        $query = "SELECT r.*, u.username 
                 FROM " . $this->table . " r 
                 LEFT JOIN users u ON r.user_id = u.id 
                 WHERE r.id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->party_size = $row['party_size'];
            $this->date = $row['date'];
            $this->time = $row['time'];
            $this->special_requests = $row['special_requests'];
            $this->image_path = $row['image_path'];
            $this->user_id = $row['user_id'];
            $this->created_by_admin = $row['created_by_admin'];
            $this->created_at = $row['created_at'];
            return true;
        }
        return false;
    }

    // Check if reservation belongs to user
    public function belongsToUser($user_id) {
        $query = "SELECT id FROM " . $this->table . " 
                 WHERE id = :id AND user_id = :user_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // Delete reservation
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Update reservation
    public function update() {
        $query = "UPDATE " . $this->table . " 
                 SET name=:name, email=:email, phone=:phone, 
                     party_size=:party_size, date=:date, time=:time, 
                     special_requests=:special_requests, image_path=:image_path
                 WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->special_requests = htmlspecialchars(strip_tags($this->special_requests));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":party_size", $this->party_size);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":time", $this->time);
        $stmt->bindParam(":special_requests", $this->special_requests);
        $stmt->bindParam(":image_path", $this->image_path);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get reservation statistics (admin only)
    public function getStats() {
        $stats = array();
        
        // Total reservations
        $query = "SELECT COUNT(*) as total FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['total_reservations'] = $row['total'];
        
        // Reservations today
        $query = "SELECT COUNT(*) as today FROM " . $this->table . " WHERE DATE(created_at) = CURDATE()";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['today_reservations'] = $row['today'];
        
        // Reservations this month
        $query = "SELECT COUNT(*) as month FROM " . $this->table . " 
                 WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['month_reservations'] = $row['month'];
        
        // Average party size
        $query = "SELECT AVG(party_size) as avg_party_size FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['avg_party_size'] = round($row['avg_party_size'], 1);
        
        return $stats;
    }

    // Get upcoming reservations
    public function getUpcomingReservations($limit = 10) {
        $query = "SELECT r.*, u.username 
                 FROM " . $this->table . " r 
                 LEFT JOIN users u ON r.user_id = u.id 
                 WHERE r.date >= CURDATE() 
                 ORDER BY r.date ASC, r.time ASC 
                 LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }
}
?>