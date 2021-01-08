const express = require('express')
const router = express.Router()
const mysql = require('mysql')
var path = require('path')
const nodemailer = require('nodemailer')


//Objeto que envia el correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth:{
    user: 'blogviajesluisj@gmail.com',
    pass: 'Alejo123'
  }
})

function enviarCorreoBienvenida(email, nombre){
  const opciones = {
    from: 'blogviajesluisj@gmail.com',
    to: email,
    subjet: 'Bienvenido al Blog de viajes',
    text: `Hola ${nombre}`
  }
  transporter.sendMail(opciones,(error,info)=>{
  });
}

var pool = mysql.createPool({
  connectionLimit: 20,
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'blog_viajes'
})

router.get('/', (peticion, respuesta) => {
  pool.getConnection((err, connection) => {
    let consulta
    let modificadorConsulta = ""
    let modificadorPagina = ""
    let pagina = 0
    const busqueda = ( peticion.query.busqueda ) ? peticion.query.busqueda : ""
    if (busqueda != ""){
      modificadorConsulta = `
        WHERE
        titulo LIKE '%${busqueda}%' OR
        resumen LIKE '%${busqueda}%' OR
        contenido LIKE '%${busqueda}%'
      `
      modificadorPagina = ""
    }
    else{
      pagina = ( peticion.query.pagina ) ? parseInt(peticion.query.pagina) : 0
      if (pagina < 0) {
        pagina = 0
      }
      modificadorPagina = `
        LIMIT 5 OFFSET ${pagina*5}
      `
    }//Ordenamos por Votos
    consulta = `
      SELECT
      publicaciones.id id, titulo, resumen, fecha_hora, pseudonimo, votos, avatar
      FROM publicaciones
      INNER JOIN autores
      ON publicaciones.autor_id = autores.id
      ${modificadorConsulta}
      ORDER BY votos DESC 
      ${modificadorPagina}
    `
    connection.query(consulta, (error, filas, campos) => {
      respuesta.render('index', { publicaciones: filas , busqueda: busqueda, pagina: pagina})
    })
    connection.release()
  })
})

router.get('/registro', (peticion, respuesta) => {
  respuesta.render('registro', { mensaje: peticion.flash('mensaje') })
})

router.post('/procesar_registro', (peticion, respuesta) => {
  pool.getConnection((err, connection) => {
    const email = peticion.body.email.toLowerCase().trim()
    const pseudonimo = peticion.body.pseudonimo.trim()
    const contrasena = peticion.body.contrasena
    const consultaEmail = `
      SELECT *
      FROM autores
      WHERE email = ${connection.escape(email)}
    `
    connection.query(consultaEmail, (error, filas, campos) => {
      if (filas.length > 0) {
        peticion.flash('mensaje', 'Email duplicado')
        respuesta.redirect('/registro')
      }
      else {
        const consultaPseudonimo = `
          SELECT *
          FROM autores
          WHERE pseudonimo = ${connection.escape(pseudonimo)}
        `
        connection.query(consultaPseudonimo, (error, filas, campos) => {
          if (filas.length > 0) {
            peticion.flash('mensaje', 'Pseudonimo duplicado')
            respuesta.redirect('/registro')
          }
          else {
            const consulta = `
                                INSERT INTO
                                autores
                                (email, contrasena, pseudonimo)
                                VALUES (
                                  ${connection.escape(email)},
                                  ${connection.escape(contrasena)},
                                  ${connection.escape(pseudonimo)}
                                )
                              `
            connection.query(consulta, (error, filas, campos) => {
              if (peticion.files && peticion.files.avatar){
                const archivoAvatar = peticion.files.avatar
                const id = filas.insertId
                const nombreArchivo = `${id}${path.extname(archivoAvatar.name)}`
                archivoAvatar.mv(`./public/avatars/${nombreArchivo}`, (error) => {
                  const consultaAvatar = `
                                UPDATE
                                autores
                                SET avatar = ${connection.escape(nombreArchivo)}
                                WHERE id = ${connection.escape(id)}
                              `
                  connection.query(consultaAvatar, (error, filas, campos) => {
                    enviarCorreoBienvenida(email,pseudonimo)
                    peticion.flash('mensaje', 'Usuario registrado con avatar')
                    respuesta.redirect('/registro')
                  })
                })
              }
              else{
                enviarCorreoBienvenida(email,pseudonimo)
                peticion.flash('mensaje', 'Usuario registrado')
                respuesta.redirect('/registro')
              }
            })
          }
        })
      }
    })
    connection.release()
  })
})

router.get('/inicio', (peticion, respuesta) => {
  respuesta.render('inicio', { mensaje: peticion.flash('mensaje') })
})

router.post('/procesar_inicio', (peticion, respuesta) => {
  pool.getConnection((err, connection) => {
    const consulta = `
      SELECT *
      FROM autores
      WHERE
      email = ${connection.escape(peticion.body.email)} AND
      contrasena = ${connection.escape(peticion.body.contrasena)}
    `
    connection.query(consulta, (error, filas, campos) => {
      if (filas.length > 0) {
        peticion.session.usuario = filas[0]
        respuesta.redirect('/admin/index')
      }
      else {
        peticion.flash('mensaje', 'Datos inválidos')
        respuesta.redirect('/inicio')
      }
    })
    connection.release()
  })
})

router.get('/publicacion/:id', (peticion, respuesta) => {
  pool.getConnection((err, connection) => {
    const consulta = `
      SELECT *
      FROM publicaciones
      WHERE id = ${connection.escape(peticion.params.id)}
    `
    connection.query(consulta, (error, filas, campos) => {
      if (filas.length > 0) {
        respuesta.render('publicacion', { publicacion: filas[0] })
      }
      else {
        respuesta.redirect('/')
      }
    })
    connection.release()
  })
})

router.get('/autores', (peticion, respuesta) => {
  pool.getConnection((err, connection) => {
    const consulta = `
      SELECT autores.id id, pseudonimo, avatar, publicaciones.id publicacion_id, titulo
      FROM autores
      INNER JOIN
      publicaciones
      ON
      autores.id = publicaciones.autor_id
      ORDER BY autores.id DESC, publicaciones.fecha_hora DESC
    `
    connection.query(consulta, (error, filas, campos) => {
      autores = []
      ultimoAutorId = undefined
      filas.forEach(registro => {
        if (registro.id != ultimoAutorId){
          ultimoAutorId = registro.id
          autores.push({
            id: registro.id,
            pseudonimo: registro.pseudonimo,
            avatar: registro.avatar,
            publicaciones: []
          })
        }
        autores[autores.length-1].publicaciones.push({
          id: registro.publicacion_id,
          titulo: registro.titulo
        })
      });
      respuesta.render('autores', { autores: autores })
    })


    connection.release()
  })
})

router.get('/publicacion/:id/votar',(req,res)=>{
  pool.getConnection((err,connection)=>{
    const consulta = `
      SELECT *
      FROM publicaciones
      WHERE id = ${connection.escape(req.params.id)}
    ` 
    connection.query(consulta,(error,filas,campos)=>{
      if(filas.length > 0){
        const consultaVoto = `
          UPDATE publicaciones
          SET
          votos = votos + 1
          WHERE id = ${connection.escape(req.params.id)}
        `
        connection.query(consultaVoto,(error,filas,campos)=>{
          res.redirect(`/publicacion/${req.params.id}`)
        })
      }else{
        req.flash('mensaje','Publicacion invalida')
        res.redirect('/')
      }
    })
    connection.release()
  })
})

/**
 * API REST
 * A continuacion vamos a hacer los API Rest
*/

//	JSON con todas las publicaciones.
// JSON con todas las publicaciones que tengan la palabra <palabra> en el título, contenido o resumen. Ej:/api/v1/publicaciones?busqueda=paris
router.get('/api/v1/publicaciones',(req,res)=>{
  pool.getConnection(function(err,connection){
    let modificadorConsulta = ""
    const busqueda = ( req.query.busqueda ) ? req.query.busqueda : ""
    if (busqueda != ""){
      modificadorConsulta = `
        WHERE
        titulo LIKE '%${busqueda}%' OR
        resumen LIKE '%${busqueda}%' OR
        contenido LIKE '%${busqueda}%'
      `
      modificadorPagina = ""
    }
    consulta = `
      SELECT *
      FROM publicaciones
      ${modificadorConsulta}
    `
    // const query = `SELECT * FROM publicaciones`
    connection.query(consulta,function(error,filas,campos){
        res.json({publicaciones: filas})
    })
    connection.release()
  })
})

// JSON con todas las publicaciones que tengan la palabra <palabra> en el título, contenido o resumen.
router.get('/api/v1/publicaciones/:busqueda',(req,res)=>{
  pool.getConnection(function(err,connection){
      const query = `SELECT * FROM publicaciones WHERE busqueda=${connection.escape(req.params.id)}`
      const consulta = `
        SELECT *
        publicaciones
        FROM publicaciones
        WHERE
        titulo LIKE '%${busqueda}%' OR
        resumen LIKE '%${busqueda}%' OR
        contenido LIKE '%${busqueda}%'
        `
      connection.query(query,function(error,filas,campos){
          if(filas.length>0){
              res.json({publicaciones: filas[0]})
          }else{
              res.status(404)
              res.send({error:["No se encuentran publicaciones con esa parabla"]})
          }           
      })
      connection.release()
  })  
})

// Publicación con id = <id>. Considera cuando el id no existe.
router.get('/api/v1/publicaciones/:id',(req,res)=>{
  pool.getConnection(function(err,connection){
      const query = `SELECT * FROM publicaciones WHERE id=${connection.escape(req.params.id)}`
      connection.query(query,function(error,filas,campos){
          if(filas.length>0){
              res.json({publicaciones: filas[0]})
          }else{
              res.status(404)
              res.send({error:["No se encuentra esa Publicacion"]})
          }           
      })
      connection.release()
  })  
})

// JSON con todos los autores.
router.get('/api/v1/autores',(req,res)=>{
  pool.getConnection(function(err,connection){
    const query = `SELECT * FROM autores`
    connection.query(query,function(error,filas,campos){
        res.json({autores: filas})
    })
    connection.release()
  })
})

// JSON con la información del autor con id = <id> y este contiene sus publicaciones. Considera cuando el id no existe.
router.get('/api/v1/autores/:id',(req,res)=>{
  pool.getConnection(function(err,connection){
      const query = `SELECT * FROM autores WHERE id=${connection.escape(req.params.id)}`
      connection.query(query,function(error,filas,campos){
          if(filas.length>0){
              res.json({publicaciones: filas[0]})
          }else{
              res.status(404)
              res.send({error:["No se encuentra este autor"]})
          }           
      })
      connection.release()
  })  
})

// Crea un autor dado un pseudónimo, email, contraseña. Validar peticiones con pseudónimos duplicados o email duplicados. Devuelve un JSON con el objeto creado.
router.post('/api/v1/autores', (peticion, respuesta) => {
  pool.getConnection((err, connection) => {
    const email = peticion.query.email.toLowerCase().trim()
    const pseudonimo = peticion.query.pseudonimo.trim()
    const contrasena = peticion.query.contrasena
    const consultaEmail = `
      SELECT *
      FROM autores
      WHERE email = ${connection.escape(email)}
    `
    connection.query(consultaEmail, (error, filas, campos) => {
      if (filas.length > 0) {
        respuesta.status(404)
        respuesta.send({error:["Email duplicado"]})
      }
      else {
        const consultaPseudonimo = `
          SELECT *
          FROM autores
          WHERE pseudonimo = ${connection.escape(pseudonimo)}
        `
        connection.query(consultaPseudonimo, (error, filas, campos) => {
          if (filas.length > 0) {
            respuesta.status(404)
            respuesta.send({error:["Pseudonimo duplicado"]})
          }
          else {
            const consulta = `
                                INSERT INTO
                                autores
                                (email, contrasena, pseudonimo)
                                VALUES (
                                  ${connection.escape(email)},
                                  ${connection.escape(contrasena)},
                                  ${connection.escape(pseudonimo)}
                                )
                              `
            connection.query(consulta, (error, filas, campos) => {
              respuesta.status(201)
              respuesta.json({autor:filas[0]})             
            })
          }
        })
      }
    })
    connection.release()
  })
})


// Crea una publicación para el usuario con <email> = email,si este se puede validar correctamente con la contraseña. Se le envía un título, resumen y contenido. Devuelve un JSON con el objeto creado.
// http://localhost:8080/api/v1/publicaciones?email=zeus@mail.com&contrasena=123456&titulo=Atenas&resumen=Buen viaje a Atenas&contenido=Contenido
router.post('/api/v1/publicaciones', (peticion, respuesta) => {
  pool.getConnection((err, connection) => {
    const thisEmail = peticion.query.email
    const thisPassword = peticion.query.contrasena
    const date = new Date()
    const fecha = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    const consulta = `
      SELECT *
      FROM autores
      WHERE
      email = ${connection.escape(thisEmail)} AND contrasena = ${connection.escape(thisPassword)}
    `
    connection.query(consulta, (error, filas, campos) => {
      if (filas.length != 1) {
        respuesta.status(404)
        respuesta.send({error:["Usuario Invalido"]})
      }
      else{
        const thisId = filas[0].id
        const consultaInsert = `
          INSERT INTO
          publicaciones
          (titulo, resumen, contenido, autor_id, fecha_hora)
          VALUES
          (
            ${connection.escape(peticion.query.titulo)},
            ${connection.escape(peticion.query.resumen)},
            ${connection.escape(peticion.query.contenido)},
            ${connection.escape(thisId)},
            ${connection.escape(fecha)}
          )
        `
        connection.query(consultaInsert,(error,filas,campos)=>{
          const newid = filas.insertId
          const queryConsulta = `SELECT * FROM publicaciones WHERE id=${connection.escape(newid)}`
          connection.query(queryConsulta,function(error,filas,campos){
            respuesta.status(201)
            respuesta.json({data:filas[0]})
          })
        })
      }
    })
    connection.release()
  })
})

// Elimina la publicación si las credenciales son correctas y la publicación le pertenece al usuario.
// http://localhost:8080/api/v1/publicaciones/6?email=ana@email.com&contrasena=123456
router.delete('/api/v1/publicaciones/:id', (peticion, respuesta) => {
  pool.getConnection((err, connection) => {
    const thisEmail = peticion.query.email
    const thisPassword = peticion.query.contrasena
    const idPubli = peticion.params.id
    const consulta = `
      SELECT *
      FROM autores
      WHERE
      email = ${connection.escape(thisEmail)} AND contrasena = ${connection.escape(thisPassword)}
    `
    connection.query(consulta, (error, filas, campos) => {
      const idUser = filas[0].id
      if (filas.length != 1) {
        respuesta.status(404)
        respuesta.send({error:["Usuario Invalido"]})
      }
      else{
        const queryPubli = `SELECT * FROM publicaciones WHERE id=${connection.escape(idPubli)}`
        connection.query(queryPubli, (error, filas, campos) => {
          if(filas.length > 0){
            if(filas[0].autor_id==idUser){
              const queryDelete = `
                DELETE FROM publicaciones WHERE id = ${connection.escape(idPubli)};
              `
              connection.query(queryDelete,(error,filas,campos)=>{
                respuesta.status(204) 
                respuesta.json()
              })
            }else{
              respuesta.status(404)
              respuesta.send({error:["Usuario Invalido, no es el que realizo la publicacion"]})
            }
          }else{
            respuesta.status(404)
            respuesta.send({error:["No existe publicacion con ese id"]})
          }
        })
      }
    })
    connection.release()
  })
})

module.exports = router