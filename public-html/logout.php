<?php
// logout se saml
session_start();
// Destruir variable de sesion $_SESSION['user_id']
unset($_SESSION['user_id']);

// Borrar localstorage//
//echo "<script>localStorage.clear(); window.location.href = 'index.php';</script>";

// Configuración de SAML
$saml_lib_path = '/var/www/simplesaml/src/_autoload.php';
require_once($saml_lib_path);
$SP_ORIGEN = getenv('SOURCE') ?: 'default-sp';
$as = new \SimpleSAML\Auth\Simple($SP_ORIGEN);
$as->logout('http://localhost/proyecto/federacion.php'); // URL de redirección post-logout

exit();