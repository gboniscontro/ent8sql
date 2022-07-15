const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();

const { ContenedorFake, ProductoFake } = require('./contenedorfake')
const { Contenedor, Producto } = require('./contenedorsql') //, ContenedorMensaje 
const { ContenedorMensaje } = require('./contenedormongoose')

const Normal = require('./normal')

const normal = new Normal()



//const normalizr = require('normalizr')

const util = require('util')
/*
const normalize = normalizr.normalize
const normalize = normalizr.normalize
const normalize = normalizr.normalize
const normalize = normalizr.normalize
const normalize = normalizr.normalize
*/









const path = require('path')

const server = require('http').Server(app);
const io = require('socket.io')(server);

let contenedor = new Contenedor('sqlite')
let contenedorfake = new ContenedorFake()
let contmensj = new ContenedorMensaje()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
//Engine
app.set('view engine', 'hbs');
app.set("views", path.join(__dirname, 'views'));


app.post('/productos', async (req, res) => {
    const producto = req.body
    await contenedor.save(producto);
    let productos = await contenedor.getAll();
    io.sockets.emit('products', productos);
    res.redirect('/')
})


app.get('/productos', (req, res) => {

    let productos = contenedor.getAll()

    res.render("index", {
        productos,
        productosExists: productos.length
    });
});
app.get('/api/productos', (req, res) => {

    let productos = contenedor.getAll()

    return res.send(productos)
});
app.get('/api/productos-test', (req, res) => {

    let productos = contenedorfake.getAll()

    res.render("index", {
        productos,
        productosExists: productos.length
    });
});





app.use(express.static('public'));
/*
let messages = [
    { author: 'juan@gmail.com', text: '!hola! que tal?' },
    { author: 'jose@gmail.com', text: '!muy bien' },
    { author: 'Ana@gmail.com', text: '!Genial!' }
];
*/


io.on('connection', async function (socket) {
    console.log('un usuario se ha conectado');
    let productos = await contenedor.getAll()
    socket.emit('products', productos);

    socket.on('new-product', async function (data) {
        await contenedor.save(data);
        let productos = await contenedor.getAll()
        io.sockets.emit('products', productos);
    })

    console.log('emitimos chat');
    let messages = await contmensj.getAll()


   // console.log('messages', util.inspect(messages, false, 6, true))
    console.log(JSON.stringify(messages).length)

    const normes = normal.apply(messages)
   // console.log('normes', util.inspect(normes, false, 6, true))
    console.log(JSON.stringify(normes).length)





   // socket.emit('messages', messages);
    socket.emit('messages', normes);
    socket.on('new-message', async function (data) {
        await contmensj.save(data)
        messages = await contmensj.getAll()
        // console.log('new-message', util.inspect(messages, true, 6, true))
    //    io.sockets.emit('messages', messages);
        const normes = normal.apply(messages)
        io.sockets.emit('messages', normes);
    })

})










const PORT = process.env.PORT || 8080;

const serv = server.listen(PORT, () => {
    console.log('listening on port', serv.address().port);
})
serv.on('error', err => console.error('listening on port', err))
