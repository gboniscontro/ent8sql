const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();

const { Contenedor, Producto } = require('./contenedorsql')
const path = require('path')

const server = require('http').Server(app);
const io = require('socket.io')(server);

let contenedor = new Contenedor('sqlite')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
//Engine
app.set('view engine', 'hbs');
app.set("views", path.join(__dirname, 'views'));

/*
app.post('/productos', async (req, res) => {
    const producto = req.body
    await contenedor.save(producto);
    let productos = await contenedor.getAll();
    io.sockets.emit('products', productos);
    res.redirect('/')
})
*/
/*
app.get('/productos', (req, res) => {

    let productos = contenedor.getAll()

    res.render("index", {
        productos,
        productosExists: productos.length
    });
});
app.get('api/productos', (req, res) => {

    let productos = contenedor.getAll()

    return res.send(productos)
});*/





app.use(express.static('public'));

let messages = [
    { author: 'juan@gmail.com', text: '!hola! que tal?' },
    { author: 'jose@gmail.com', text: '!muy bien' },
    { author: 'Ana@gmail.com', text: '!Genial!' }
];


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
    socket.emit('messages', messages);

    socket.on('new-message', function (data) {
        messages.push(data);
        io.sockets.emit('messages', messages);
    })

})










const PORT = process.env.PORT || 8080;

const serv = server.listen(PORT, () => {
    console.log('listening on port', serv.address().port);
})
serv.on('error', err => console.error('listening on port', err))
