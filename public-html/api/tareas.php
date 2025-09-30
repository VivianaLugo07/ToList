<?php
// /public-html/api/tareas.php

// 1. INICIAR SESIÓN Y CONFIGURAR CABECERAS
session_start();
header('Content-Type: application/json');

// 2. PROTEGER LA API
if (!isset($_SESSION['user_id'])) {
    http_response_code(403); // Prohibido
    echo json_encode(['error' => 'Acceso no autorizado. Por favor, inicie sesión.']);
    exit();
}

// 3. CONECTAR A LA BASE DE DATOS
require_once __DIR__ . "/../bd-mysqli.php";

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// 4. GESTIONAR LA PETICIÓN SEGÚN EL MÉTODO HTTP
switch ($method) {
    case 'GET':
        // --- OBTENER TODAS LAS TAREAS DEL USUARIO ---
        $stmt = $conexion->prepare("SELECT id, titulo, texto FROM tareas WHERE usuario_id = ? ORDER BY id DESC");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $tareas = $resultado->fetch_all(MYSQLI_ASSOC);
        echo json_encode($tareas);
        $stmt->close();
        break;

    case 'POST':
        // --- CREAR UNA NUEVA TAREA ---
        $data = json_decode(file_get_contents('php://input'), true);
        $titulo = $data['titulo'] ?? '';
        $descripcion = $data['descripcion'] ?? ''; // El campo en la BD es 'texto'

        if (empty($titulo) || empty($descripcion)) {
            http_response_code(400); // Bad Request
            echo json_encode(['error' => 'El título y la descripción son obligatorios.']);
            break;
        }

        $stmt = $conexion->prepare("INSERT INTO tareas (titulo, texto, usuario_id) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $titulo, $descripcion, $userId);
        
        if ($stmt->execute()) {
            http_response_code(201); // Creado
            $nuevaTareaId = $conexion->insert_id;
            echo json_encode(['id' => $nuevaTareaId, 'titulo' => $titulo, 'texto' => $descripcion]);
        } else {
            http_response_code(500); // Error del servidor
            echo json_encode(['error' => 'Error al guardar la tarea en la base de datos.']);
        }
        $stmt->close();
        break;

    case 'DELETE':
        // --- ELIMINAR UNA TAREA ---
        $idTarea = $_GET['id'] ?? 0;
        if ($idTarea > 0) {
            $stmt = $conexion->prepare("DELETE FROM tareas WHERE id = ? AND usuario_id = ?");
            $stmt->bind_param("is", $idTarea, $userId);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode(['message' => 'Tarea eliminada con éxito.']);
                } else {
                    http_response_code(404); // No encontrado
                    echo json_encode(['error' => 'La tarea no existe o no tienes permiso para eliminarla.']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Error del servidor al eliminar la tarea.']);
            }
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID de tarea no válido.']);
        }
        break;

    default:
        http_response_code(405); // Método no permitido
        echo json_encode(['error' => 'Método no permitido.']);
        break;
}

// 5. CERRAR LA CONEXIÓN
$conexion->close();
?>