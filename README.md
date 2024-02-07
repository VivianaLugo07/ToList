
## COMO USARLO

1.- Clonar repo
```
 git clone https://github.com/sistemas-ucol-mx/plantilla-despliegue
```
2.-  Copia el código de tu proyecto en la carpeta public-html
  ![imagen](./img/estructura1.png)

3.- En el public-html/Dockerfile cambia proyecto por el nombre de tu proyecto (ej, sibeucol)
  ![imagen](./img/dockerfile.png)

4.- En el public-html/000-default.conf cambia proyecto por el nombre de tu proyecto (ej, sibeucol)
  ![imagen](./img/000.png)

5.- Construye la imagen del contenedor
```
 docker build .....
```

5.- Actualiza el docker-compose.yml con los datos correspondientes, segun se indica en los comentarios.
  ![imagen](./img/docker-compose.png)


6.- Levanta el servicio.
```
 docker-compose up
```

7.- Consulta el contenido en su navegador
```
 http://localhost/proyecto/
```

5.- Revisa los ejemplos contenidos en el repo:
  ![imagen](./img/ejemplos.png)
 - federacion.php (conexión con la federación ucol)
 - t33st.php (conexión a BD)


## PARA PRE-PROD

**Structure inside the container and public-hmtl folder for preproduction environment:**
![imagen](./img/structure.jpg)


Routes:
(phpmyadmin): https://pre-datacenter.ucol.mx/admin-proyecto/

(public-html): https://pre-datacenter.ucol.mx/proyecto/

(simplesaml): https://pre-datacenter.ucol.mx/simple-proyecto/

**Probar conectividad con base de datos:**
https://pre-datacenter.ucol.mx/proyecto/t33st.php

![imagen](./img/t33st.jpg)



<br> <!-- This adds a line break -->

**To get the source, mysql endpoint, database user, password user and database name, you have environment variables:**

1.- `echo $SOURCE`

2.- `echo $ENDPOINT`

3.- `echo $DATABASE`

4.- `echo $USERD`

5.- `echo $PASSD`

6.- `echo $SIMPLE`

<br> <!-- This adds a line break -->

**Flujo del Proceso:**

- **Desarrollo (dev):** Cambios y desarrollos iniciales.
    - `Push → dev`

- **Pre-producción (pre):** Pruebas y validación final antes de producción. (url de pre-datacenter)
    - `Pull Request y Merge → de dev a pre`

- **Producción (main):** Despliegue de cambios validados a los usuarios finales. (url de datacenter - cuando se validen y aprueben los cambios)
    - `Pull Request y Merge → de pre a main`

![imagen](./img/flow.jpg)



<br> <!-- This adds a line break -->
<br> <!-- This adds a line break -->
**How to create the htpassword:**
Modify the .htpassword file:

![imagen](./img/htpass.jpg)

**Generate new password in Linux interface:**
```bash
openssl passwd -apr1 "psswrd-p1f0dsd-user!"
```

**Copy the result and modify inside the .htpassword file:**

![imagen](./img/htpass2.jpg)