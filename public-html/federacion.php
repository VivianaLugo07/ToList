<?php

session_start();

$saml_lib_path = '/var/www/simplesaml/src/_autoload.php';
require_once($saml_lib_path);

$sp_source = getenv('SOURCE');
if (empty($sp_source)) {
    die("Error crítico: La variable de entorno 'SOURCE' para SimpleSAMLphp no está definida.");
}

$as = new \SimpleSAML\Auth\Simple($sp_source);

$as->requireAuth();

$attributes = $as->getAttributes();

$_SESSION['user_id']   = $attributes['ImmutableID'][0] ?? null;
$_SESSION['user_name'] = $attributes['cn'][0]  ?? 'Usuario desconocido'; // Common Name, por ejemplo 'Juan Perez'

if (empty($_SESSION['user_id'])) {
    die("Error de autenticación: No se pudo obtener el identificador de usuario (uid).");
}

header('Location: index.php');
exit();

?>