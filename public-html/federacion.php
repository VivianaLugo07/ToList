<?php
// Inicia la sesión para poder guardar los datos del usuario.
session_start();

// Muestra errores para facilitar la depuración.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// --- 1. AUTENTICACIÓN CON SimpleSAMLphp ---
require_once('/var/www/simplesaml/src/_autoload.php');
$SP_ORIGEN = getenv('SOURCE');
$as = new \SimpleSAML\Auth\Simple($SP_ORIGEN);
$as->requireAuth();
$attributes = $as->getAttributes();

// --- 2. OBTENER DATOS CLAVE DEL USUARIO ---
// Obtenemos los atributos que nos da la UDC.
$ImmutableID = $attributes['ImmutableID'][0] ?? null;
$uCuenta     = $attributes['uCuenta'][0] ?? null;
$uNombre     = $attributes['uNombre'][0] ?? null;

// Si no recibimos los datos necesarios, detenemos el script.
if (!$ImmutableID || !$uCuenta || !$uNombre) {
    die("Error: No se recibieron los atributos de usuario necesarios desde el sistema de autenticación.");
}

// --- 3. CONEXIÓN A LA BASE DE DATOS ---
// (Asegúrate de tener un archivo bd-mysqli.php con la conexión)
require_once "bd-mysqli.php";

// --- 4. VERIFICAR SI EL USUARIO EXISTE O REGISTRARLO ---
// Buscamos al usuario en nuestra tabla usando su ID inmutable, que es la llave primaria.
$stmt = $conexion->prepare("SELECT id FROM usuarios WHERE id = ?");
$stmt->bind_param("s", $ImmutableID);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows == 0) {
    // Si num_rows es 0, el usuario NO existe. Lo insertamos.
    $insert = $conexion->prepare("INSERT INTO usuarios (id, nombre_completo, numero_cuenta, immutable_id) VALUES (?, ?, ?, ?)");
    $insert->bind_param("ssss", $ImmutableID, $uNombre, $uCuenta, $ImmutableID);
    $insert->execute();
    $insert->close();
}

$stmt->close();
$conexion->close();

// --- 5. GUARDAR DATOS EN SESIÓN Y REDIRIGIR ---
// Guardamos los datos que necesitaremos en las otras páginas.
$_SESSION['user_id']   = $ImmutableID; // El ID único del usuario.
$_SESSION['user_name'] = $uNombre;

// Redirigimos al usuario a la aplicación de tareas.
header("Location: index.php"); // Usamos index.php como página principal
exit;
?>