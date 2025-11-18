let favoritos = [];

function syncFavoritos() {
  try {
    favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  } catch {
    favoritos = [];
  }
}

function guardarFavoritos() {
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function agregarAFavoritos(producto) {
  syncFavoritos();
  const existe = favoritos.find(p => p.id === producto.id);
  if (existe) return alert(`${producto.nombre} ya está en favoritos`);

  favoritos.push(producto);
  guardarFavoritos();
  alert(`${producto.nombre} agregado a favoritos`);
}

function eliminarDeFavoritos(id) {
  syncFavoritos();
  favoritos = favoritos.filter(p => p.id !== id);
  guardarFavoritos();
  mostrarFavoritos();
}

function mostrarFavoritos() {
  syncFavoritos();
  const container = document.getElementById("favoritos-container");
  if (!container) return;

  container.innerHTML = "";

  if (favoritos.length === 0) {
    container.innerHTML = "<p>No hay productos en favoritos.</p>";
    return;
  }

  favoritos.forEach(producto => {
    const div = document.createElement("div");
    div.classList.add("producto-favorito");
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" width="100">
      <p><strong>${producto.nombre}</strong></p>
      <p>Precio: $${producto.precio}</p>
      <input type="number" id="fav-cantidad-${producto.id}" min="1" value="1">
      <button onclick="agregarDesdeFavoritos(${producto.id})">Agregar al carrito</button>
      <button onclick="eliminarDeFavoritos(${producto.id})">Quitar</button>
    `;
    container.appendChild(div);
  });
}

function agregarDesdeFavoritos(id) {
  syncCarrito();
  syncFavoritos();

  const producto = favoritos.find(p => p.id === id);
  if (!producto) return;

  const input = document.getElementById(`fav-cantidad-${id}`);
  let cantidad = parseInt(input.value);
  if (isNaN(cantidad) || cantidad < 1) cantidad = 1;

  const existente = carrito.find(p => p.id === id);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }

  guardarCarrito();
  alert(`${producto.nombre} agregado al carrito (${cantidad})`);
}
