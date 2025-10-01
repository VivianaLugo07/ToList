<?php
// /public-html/api/check_session.php
session_start();

// Le decimos al navegador que NUNCA guarde en caché esta respuesta
header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

// Respondemos si la variable de sesión existe o no
if (isset($_SESSION['user_id'])) {
    echo json_encode(['loggedIn' => true]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>