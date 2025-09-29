<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Datos de conexión a la base de datos
// (Asegúrate de que las variables de entorno se cargan antes de incluir este archivo)
$host = $_ENV["ENDPOINT"] ?? getenv("ENDPOINT");
$usuario = $_ENV["USERD"] ?? getenv("USERD");
$contrasena = $_ENV["PASSD"] ?? getenv("PASSD");
$base_datos = $_ENV["DATABASE"] ?? getenv("DATABASE");

// Crear una conexión a la base de datos
$conexion = new mysqli($host, $usuario, $contrasena, $base_datos);

// Verificar si hay errores de conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// ¡IMPORTANTE! No cerramos la conexión aquí.
// El script que incluya este archivo (como federacion.php)
// se encargará de cerrarla cuando termine de usarla.
?>