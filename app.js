const express = require('express');
const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

const bcryptjs = require('bcryptjs');

const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const connection = require('./database/db');
const req = require('express/lib/request');
const res = require('express/lib/response');

app.get('/login', (req, res)=>{
    res.render('login');   
   });

app.post('/auth', async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    //let passwordHaash = await bcryptjs.hash(password,8);
    if(email && password){
        connection.query('SELECT * FROM Usuario where email = ?', [email], async (error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(password, results[0].contrasena))){
                res.render('login',{
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o Contraseña incorrectos",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: false,
                    ruta:'login'
                });
            }else{
                req.session.loggedin = true;
                req.session.name = results[0].nombre
                res.render('login',{
                    alert: true,
                    alertTitle: "Conexion exitosa",
                    alertMessage: "LOGIN CORRECTO!",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta:''
                });
            }
        })
    }else{
        res.render('login',{
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Por favor complete todos los campos",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: false,
            ruta:'login'
        });

    }
})

app.get('/', (req,res)=>{
    if(req.session.loggedin){
        res.render('index',{
        login: true,
        name: req.session.name
        });
    }else{
        res.render('index',{
        login: false,
        name: 'Debe iniciar sesion'
        })
    }

    })

app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3000, (req, res)=>{
    console.log('Server running in http://localhost:3000');
})