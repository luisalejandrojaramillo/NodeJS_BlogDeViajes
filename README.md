# Blog de viajes NodeJS :milky_way:

## Instrucciones de instalacion
```
git clone https://github.com/luisalejandrojaramillo/NodeJS_BlogDeViajes
cd NodeJS_BlogDeViajes
npm i
npm run dev 
```

## Paquetes Utilizados
* body-parser
* ejs
* express
* express-fileupload
* express-session
* express-flash
* mysql
* nodemon
* nodemailer

## Criterios (Portafolio)

Los usuarios de tu Blog desean que le muestres una interfaz agradable y usable; para construir la misma recuerda usar HTML, CSS y JavaScript. El sitio tendrá una página principal con la lista de las 5 publicaciones más recientes, sin embargo, tendremos unos enlaces que permiten ver las páginas siguientes, donde se desplegarán las publicaciones anteriores. Adicionalemente, en la página principal, se tendrá una caja de búsqueda, la cual permitirá filtrar las publicaciones que contengan esa palabra en el título o contenido.

Cada usuario podrá votar (+1) a las publicaciones que le gusten y este número de votos será un dato que aparecerá al lado del título de cada publicación. Adicionalmente, se tendrá una página que lista los autores con sus datos (pseudónimo, avatar y publicaciones que tiene).

Tanto en la lista de publicaciones de la página de Inicio, como en la lista de  publicaciones de la página de Autores, se desplegará el título y un resumen de la misma; allí se puede hacer clic sobre la publicación para poder ver todo el contenido de dicha publicación incluyendo una foto del viaje.

Recuerda que los autores se deben registrar y luego iniciar sesión para manejar sus publicaciones (listar, crear, editar, eliminar). Cuando se registran, el sistema les da una Bienvenida enviándole un correo.

## API Rest Utilizadas
* GET /api/v1/publicaciones	JSON con todas las publicaciones.
* GET /api/v1/publicaciones?busqueda=<palabra>	JSON con todas las publicaciones que tengan la palabra <palabra> en el título, contenido o resumen.
* GET /api/v1/publicaciones/<id>	Publicación con id = <id>. Considera cuando el id no existe.
* GET /api/v1/autores	JSON con todos los autores.
* GET /api/v1/autores/<id>	JSON con la información del autor con id = <id> y este contiene sus publicaciones. Considera cuando el id no existe.
* POST /api/v1/autores	Crea un autor dado un pseudónimo, email, contraseña. Validar peticiones con pseudónimos duplicados o email duplicados. Devuelve un JSON con el objeto creado.
* POST /api/v1/publicaciones?email=<email>&contrasena=<contrasena>	Crea una publicación para el usuario con <email> = email,si este se puede validar correctamente con la contraseña. Se le envía un título, resumen y contenido. Devuelve un JSON con el objeto creado.
* DELETE /api/v1/publicaciones/<id>?email=<email>&contrasena=<contrasena>	Elimina la publicación si las credenciales son correctas y la publicación le pertenece al usuario.

## Configuracion cuenta que envia los correos
* Creamos una cuenta en Gmail
* Vamos a seguridad y damos acceso a las Aplicaciones poco seguras
![Google Security](/img/googleacc.PNG)

## [Configuracion inicial de la BD](DB_InitialConfig.txt)

## [Resumen Unidad NodeJS](resumenNodeJS.pdf)

## License
[MIT License](/LICENSE)

## Autor
[Luis Alejandro Jaramillo Rincon](https://github.com/luisalejandrojaramillo)
