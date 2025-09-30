<?php
// /models/Tarea.php

class Tarea {
    private $conn;
    private $table_name = 'tareas';

    public $id;
    public $usuario_id;
    public $texto;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Leer todas las tareas de un usuario específico
    public function leerPorUsuario() {
        $query = "SELECT id, texto FROM " . $this->table_name . " WHERE usuario_id = ? ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->usuario_id);
        $stmt->execute();
        return $stmt;
    }

    // Crear una nueva tarea
    public function crear() {
        $query = "INSERT INTO " . $this->table_name . " SET texto=:texto, usuario_id=:usuario_id";
        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->texto = htmlspecialchars(strip_tags($this->texto));
        $this->usuario_id = htmlspecialchars(strip_tags($this->usuario_id));

        // Vincular datos
        $stmt->bindParam(":texto", $this->texto);
        $stmt->bindParam(":usuario_id", $this->usuario_id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Eliminar una tarea
    public function eliminar() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id AND usuario_id = :usuario_id";
        $stmt = $this->conn->prepare($query);

        // Limpiar y vincular datos
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":usuario_id", $this->usuario_id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>