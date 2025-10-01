<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: federacion.php');
    exit();
}
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
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
    <script>
        // Función que arranca la lógica principal de la app en script.js
        function startApp() {
            if (window.initializeApp) {
                window.initializeApp();
            } else {
                // Si script.js tarda en cargar, esperamos un poco
                document.addEventListener('DOMContentLoaded', window.initializeApp);
            }
        }

        // El guardia ahora es "offline-aware"
        if (navigator.onLine) {
            // Si estamos ONLINE, verificamos la sesión con el servidor
            fetch('api/check_session.php', { cache: 'no-store' })
                .then(res => res.json())
                .then(data => {
                    if (!data.loggedIn) {
                        localStorage.clear();
                        window.location.replace('federacion.php');
                    } else {
                        startApp(); // La sesión es válida, arranca la app
                    }
                })
                .catch(() => {
                    localStorage.clear();
                    window.location.replace('federacion.php');
                });
        } else {
            // Si estamos OFFLINE, confiamos en la caché y arrancamos la app
            startApp();
        }
    </script>

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
    <div id="contenedor"></div>
    <script src="script.js"></script>
</body>
</html>