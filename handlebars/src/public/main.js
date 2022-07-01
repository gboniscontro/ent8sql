const socket = io.connect();

function crearTemplate(productos) {
  fetch('index.hbs')

    .then(response => response.text())

    .then(content => {

      const template = Handlebars.compile(content);


      const html = template({
        productos,
        productosExists: productos.length
      });
      document.getElementById('lstProductos').innerHTML = html;

    })
}

socket.on("products", (data) => {
  console.log(data);
  crearTemplate(data);
});

function addProduct(e) {
  const product = {
    title: document.getElementById("title").value,
    price: document.getElementById("price").value,
    thumbnail: document.getElementById("thumbnail").value,
  };
  socket.emit("new-product", product);

  return false;
}

function render(data) {
  const html = data
    .map((elem) => {
      return `<div>
            <strong style="color:blue">${elem.author}</strong>
            <em style="color:green">${elem.text}</em>
        </div>`;
    })
    .join(" ");
  document.getElementById("messages").innerHTML = html;
}



socket.on("messages", (data) => {
  console.log('mensaje')
  render(data);
});
function addMessage(e) {
  const mensaje = {
    author: document.getElementById("username").value,
    text: document.getElementById("texto").value,
  };
  socket.emit("new-message", mensaje);
  document.getElementById("texto").value = '';

  return false;
}