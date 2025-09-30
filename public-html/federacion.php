<?php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once('/var/www/simplesaml/src/_autoload.php');
$SP_ORIGEN = getenv('SOURCE');
$as = new \SimpleSAML\Auth\Simple($SP_ORIGEN);
$as->requireAuth();
$attributes = $as->getAttributes();

$ImmutableID = $attributes['ImmutableID'][0] ?? null;
$uCuenta     = $attributes['uCuenta'][0] ?? null;
$uNombre     = $attributes['uNombre'][0] ?? null;

if (!$ImmutableID || !$uCuenta || !$uNombre) {
    die("Error: No se recibieron los atributos de usuario necesarios desde el sistema de autenticación.");
}

require_once "bd-mysqli.php";

$stmt = $conexion->prepare("SELECT id FROM usuarios WHERE id = ?");
$stmt->bind_param("s", $ImmutableID);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows == 0) {
    $insert = $conexion->prepare("INSERT INTO usuarios (id, nombre_completo, numero_cuenta, immutable_id) VALUES (?, ?, ?, ?)");
    $insert->bind_param("ssss", $ImmutableID, $uNombre, $uCuenta, $ImmutableID);
    $insert->execute();
    $insert->close();
}

$stmt->close();
$conexion->close();

$_SESSION['user_id']   = $ImmutableID; // El ID único del usuario.
$_SESSION['user_name'] = $uNombre;

header("Location: index.php"); // Usamos index.php como página principal
exit;
?>