<?php
// /config/Database.php

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = $_ENV['ENDPOINT'] ?? getenv('ENDPOINT');
        $this->db_name = $_ENV['MYSQL_DATABASE'] ?? getenv('MYSQL_DATABASE');
        $this->username = $_ENV['MYSQL_USER'] ?? getenv('MYSQL_USER');
        $this->password = $_ENV['MYSQL_PASSWORD'] ?? getenv('MYSQL_PASSWORD');
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO('mysql:host=' . $this->host . ';dbname=' . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo 'Error de conexión: ' . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>