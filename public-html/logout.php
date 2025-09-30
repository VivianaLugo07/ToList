<?php

require_once('/var/www/simplesaml/src/_autoload.php');

$SP_ORIGEN = getenv('SOURCE'); 
$as = new \SimpleSAML\Auth\Simple($SP_ORIGEN);

$as->logout("http://localhost/proyecto/federacion.php");

?>