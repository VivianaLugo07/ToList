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