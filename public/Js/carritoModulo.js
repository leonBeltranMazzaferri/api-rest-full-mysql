// carritoModulo.js
let carrito = [];

function syncCarrito() {
  try {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  } catch {
    carrito = [];
  }
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarritoConCantidad(id, cantidad) {
  syncCarrito();

  const producto = productos.find(p => Number(p.id) === Number(id));
  if (!producto) return alert('Producto no encontrado');

  const existente = carrito.find(p => Number(p.id) === Number(id));
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }

  guardarCarrito();
  alert(`${producto.nombre} agregado al carrito (${cantidad})`);
  mostrarCarrito();
}
