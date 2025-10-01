<?php
// /public-html/federacion.php

// LÍNEAS DE DIAGNÓSTICO: FUERZAN A PHP A MOSTRAR CUALQUIER ERROR
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Inicia la sesión al principio de todo.
session_start();

// --- 1. AUTENTICACIÓN CON SimpleSAMLphp ---
require_once('/var/www/simplesaml/src/_autoload.php');
$SP_ORIGEN = getenv('SOURCE');
$as = new \SimpleSAML\Auth\Simple($SP_ORIGEN);
$as->requireAuth();
$attributes = $as->getAttributes();

// --- 2. OBTENER DATOS CLAVE DEL USUARIO ---
$ImmutableID = $attributes['ImmutableID'][0] ?? null;
$uCuenta = $attributes['uCuenta'][0] ?? null;
$uNombre = $attributes['uNombre'][0] ?? null;

if (!$ImmutableID || !$uNombre) {
    die("Error Crítico: Faltan los atributos 'ImmutableID' o 'uNombre' desde el sistema de autenticación.");
}

// --- 3. CONEXIÓN A LA BASE DE DATOS ---
require_once "bd-mysqli.php";

// --- 4. VERIFICAR SI EL USUARIO EXISTE O REGISTRARLO ---
// Usamos try-catch para capturar cualquier error de base de datos
try {
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->bind_param("s", $ImmutableID);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        // Si el usuario no existe, lo insertamos.
        $insert = $conexion->prepare("INSERT INTO usuarios (id, nombre_completo, numero_cuenta, immutable_id) VALUES (?, ?, ?, ?)");
        $insert->bind_param("ssss", $ImmutableID, $uNombre, $uCuenta, $ImmutableID);
        $insert->execute();
        $insert->close();
    }
    $stmt->close();
    $conexion->close();
} catch (mysqli_sql_exception $e) {
    // Si hay un error de SQL (ej. un campo UNIQUE duplicado), lo mostramos
    die("Error de Base de Datos al registrar al usuario: " . $e->getMessage());
}

// --- 5. GUARDAR DATOS EN SESIÓN ---
$_SESSION['user_id'] = $ImmutableID;
$_SESSION['user_name'] = $uNombre;

// --- 6. REDIRIGIR A LA PÁGINA PRINCIPAL ---
header("Location: index.php");
exit();
?>