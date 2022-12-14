import { pool } from './db.js'
const config = require('dotenv')
const express = require('express')
const mysql = require('mysql')

const app = express()

const conexionBD = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT  
})


app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});
 

const  obtenerUsuario = () => {
    return {
        id : 1,
        nombre : 'Carlos',
        usuario : 'C2',
        estado : true
    }
}

app.use((req, res, next) => {
    const usuarioPermitido = obtenerUsuario() 
    req.locals = {
        usuarioPermitido
    }
    next()
})

const middlwareAgregarUsuario = (req, res, next) => {
    console.log(' Se ejecuto el middlwareAgregarUsuario')
    const usuarioPermitido = obtenerUsuario() 
    //middleware para agregar usuario
    if (usuarioPermitido.usuario === "Cd" ){
        req.locals = {
            usuarioPermitido,
        }
        next()
    } else {
        req.locals = 'Usuario sin permisos'
        console.log('Usuario no permitido')
        next()
    }
}

app.get('/', (req,res) => {
    res.send('Bienvenidos al inicio')
})

//Api para traer todos los usuarios 
app.get('/usuarios',async (req, res) => {
    const sql = 'SELECT * FROM usuarios'

    await pool.query(sql, (error, results) => {
      if (error) throw error

      if (results.length > 0) {
        res.json(results)
      } else {
        res.send('No hay datos disponibles')
      }
    })
    // res.send('Esta es la lista de usuarios')
})

// Api para traer solo un usuario por ID 
app.get('/usuario/:idusuario',async (req, res) => {
    const id = req.params
    const sql = `SELECT * FROM usuarios WHERE  idusuarios = ${id.idusuario}`

    await pool.query(sql, (error, result) => {
        if (error) throw error

        if(result.length > 0){
          res.json(result)
        } else {
          res.send('Usuario no encontrado')
        }
    })
})


// Api para crear usuarios
app.post('/agregar-usuario', async(req,res) => {
    const sql = 'INSERT INTO usuarios SET ?'

    const usuarioObj = {
      idusuarios : req.body.idusuario,
      nombre : req.body.nombre,
      usuario : req.body.usuario,
    }

    await pool.query(sql, usuarioObj, error => {
      if (error) throw error

      res.send('Usuario creado con exito!')
    })
})

//Api para actualizar al usuarios
app.put('/actualizar-usuario/:usuarioId', async(req, res) => {
    const id = req.params
    const {nombre,usuario} = req.body 

    const sql = `UPDATE usuarios SET nombre = '${nombre}', usuario = '${usuario}' where idusuarios = ${id.usuarioId}`

    await pool.query(sql, error => {
      if (error) throw error

      res.send('Usuario actualizado con exito!')
    })
})

//Api para eliminar un usuario
app.delete('/eliminar-usuario/:usuarioId', async(req, res) => {
    const id = req.params
    const sql = `DELETE FROM usuarios where idusuarios = ${id.usuarioId}`

    await pool.query(sql, error => {
      if (error) throw error

      res.send('Usuario eliminado con exito!')
    })
})

//El puerto esta activo
app.listen(PORT, () => {
    console.log(`Servidor en el puerto ${PORT}`)
})

// CRUD

// c =  CREATE
// R = READ
// U = UPDATE
// D = DELETE 