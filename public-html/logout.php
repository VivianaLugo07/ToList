<?php
// /public-html/logout.php
require_once('/var/www/simplesaml/src/_autoload.php');

$SP_ORIGEN = getenv('SOURCE'); 
$as = new \SimpleSAML\Auth\Simple($SP_ORIGEN);

// La URL a la que se regresará después de que el sistema de la UdeC cierre la sesión
$redirectUrl = "http://localhost/proyecto/federacion.php?logout_success=true";

$as->logout($redirectUrl);
?>