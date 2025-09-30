<?php
// Inicia la sesión para poder acceder a las variables de sesión.
// ¡DEBE SER LA PRIMERA LÍNEA DEL ARCHIVO, ANTES DE CUALQUIER HTML!
session_start();

// Verificación de seguridad: si no hay un 'user_id' en la sesión,
// significa que el usuario no ha iniciado sesión, así que lo redirigimos.
if (!isset($_SESSION['user_id'])) {
    header('Location: federacion.php');
    exit();
}

// Guardamos el nombre del usuario en una variable para usarlo fácilmente.
// Usamos htmlspecialchars() como medida de seguridad para prevenir ataques XSS.
$nombreUsuario = htmlspecialchars($_SESSION['user_name']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
    <title>Lista de Tareas</title>
</head>
<body>
    <div class="header-container">
    <p class="welcome-message">Sesión de: <strong><?php echo $nombreUsuario; ?></strong></p>
    
    <a href="logout.php" class="btn-logout">Cerrar Sesión</a>
</div>

    <div id="tareas">
        <h1>Lista de Tareas</h1>
        <label for="tituloTareas">Título de la tarea:</label>
        <input type="text" id="tituloTareas" >

        <label for="descripcionTareas">Descripción de la tarea:</label>
        <input type="text" id="descripcionTareas" >

        <button id="btn_agregar">Agregar Tarea</button>
    </div>

    <div id="contenedor">
        </div>

    <script src="script.js"></script>
</body>
</html>