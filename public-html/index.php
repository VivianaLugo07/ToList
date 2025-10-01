<?php
session_start();
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

if (!isset($_SESSION['user_id'])) {
    header('Location: federacion.php');
    exit();
}
$nombreUsuario = htmlspecialchars($_SESSION['user_name']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
    <link rel="icon" href="./icons/icon-192x192.png" type="image/png">
    <title>Lista de Tareas</title>
</head>
<body>
    <div class="header-container">
        <p class="welcome-message">Sesión de: <strong><?php echo $nombreUsuario; ?></strong></p>
        <a href="logout.php" class="btn-logout" id="logout-btn">Cerrar Sesión 🚪</a>
    </div>

    <div id="tareas">
        <h1>Lista de Tareas</h1>
        <label for="tituloTareas">Título:</label>
        <input type="text" id="tituloTareas" placeholder="Título de la nueva tarea">
        <label for="descripcionTareas">Descripción:</label>
        <input type="text" id="descripcionTareas" placeholder="Descripción de la tarea">
        <button id="btn_agregar">Agregar</button>
    </div>

    <div id="contenedor">
        </div>

    <script src="script.js"></script>
    <script>
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) window.location.reload();
        });
    </script>
</body>
</html>