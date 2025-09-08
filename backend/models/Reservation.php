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
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new reservation
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
            return true;
        }
        return false;
    }

    // Read all reservations
    public function read() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Read single reservation
    public function readSingle() {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
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
            $this->created_at = $row['created_at'];
            return true;
        }
        return false;
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
}
?>